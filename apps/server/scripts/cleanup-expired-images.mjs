import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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
  return process.env.STORAGE_PROVIDER ?? 'none'
}

async function deleteStoredImage(imageUrl) {
  if (!imageUrl) {
    return { status: 'skipped', reason: 'empty_url' }
  }

  const provider = getProvider()
  if (provider === 'none' || provider === 'mock') {
    return { status: 'skipped', reason: `provider:${provider}` }
  }

  return { status: 'unsupported', reason: `delete_not_configured:${provider}` }
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
