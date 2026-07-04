import { existsSync, readFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(scriptDir, '../.env')

if (existsSync(envPath)) {
  const envText = readFileSync(envPath, 'utf8')
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key] !== undefined) continue
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }
}

const { PrismaClient } = await import('@prisma/client')
const prisma = new PrismaClient()

function getProvider() {
  return (process.env.STORAGE_PROVIDER ?? 'none').toLowerCase()
}

function getPublicBaseUrl() {
  return (process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`).replace(/\/$/, '')
}

function getLocalStorageDir() {
  return resolve(scriptDir, '..', process.env.LOCAL_STORAGE_DIR ?? 'uploads/generated-images')
}

async function deleteStoredImage(imageUrl) {
  if (!imageUrl) {
    return { status: 'skipped', reason: 'empty_url' }
  }

  const provider = getProvider()
  if (provider === 'none' || provider === 'mock') {
    return { status: 'skipped', reason: `provider:${provider}` }
  }

  if (provider === 'local') {
    const fileName = fileNameFromLocalImageUrl(imageUrl)
    if (!fileName) {
      return { status: 'skipped', reason: 'not_local_image_url' }
    }
    await rm(resolve(getLocalStorageDir(), fileName), { force: true })
    return { status: 'deleted' }
  }

  return { status: 'unsupported', reason: `delete_not_configured:${provider}` }
}

function fileNameFromLocalImageUrl(imageUrl) {
  try {
    const url = new URL(imageUrl, getPublicBaseUrl())
    if (!url.pathname.startsWith('/api/images/')) return ''
    const fileName = basename(url.pathname)
    if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp)$/i.test(fileName)) return ''
    return fileName
  } catch {
    return ''
  }
}

function clearBackgroundImage(resultJson) {
  if (!resultJson || typeof resultJson !== 'object' || Array.isArray(resultJson)) {
    return resultJson
  }

  return {
    ...resultJson,
    backgroundImageUrl: '',
  }
}

async function main() {
  const now = new Date()
  const dryRun = process.argv.includes('--dry-run') || process.env.IMAGE_CLEANUP_DRY_RUN === 'true'
  const records = await prisma.generationRecord.findMany({
    where: {
      deletedAt: null,
      expiresAt: { lte: now },
      backgroundImageUrl: { not: '' },
    },
    select: {
      id: true,
      backgroundImageUrl: true,
      resultJson: true,
      expiresAt: true,
    },
    orderBy: { expiresAt: 'asc' },
  })

  let cleared = 0
  let unsupported = 0

  for (const record of records) {
    const deletion = await deleteStoredImage(record.backgroundImageUrl)
    if (deletion.status === 'unsupported') {
      unsupported += 1
      console.warn(`skip ${record.id}: ${deletion.reason}`)
      continue
    }

    if (!dryRun) {
      await prisma.generationRecord.update({
        where: { id: record.id },
        data: {
          backgroundImageUrl: '',
          resultJson: clearBackgroundImage(record.resultJson),
        },
      })
    }
    cleared += 1
  }

  console.log(`expired-images: scanned=${records.length} cleared=${cleared} unsupported=${unsupported} dryRun=${dryRun}`)
  if (unsupported > 0) {
    process.exitCode = 1
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
