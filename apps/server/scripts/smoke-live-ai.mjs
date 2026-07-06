import { existsSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDir = dirname(dirname(fileURLToPath(import.meta.url)))
loadServerEnv()

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000/api'
const runLiveSmoke = process.env.LIVE_AI_SMOKE === 'true'
const runFull = process.env.LIVE_AI_SMOKE_FULL === 'true'
const imageLive = process.env.IMAGE_MOCK_MODE === 'false'

if (!runLiveSmoke) {
  console.log('live-ai-smoke: skipped. Set LIVE_AI_SMOKE=true after starting the server with real AI env to run live validation.')
  process.exit(0)
}

assertEnv()
await main()

async function main() {
  console.log(`live-ai-smoke: target ${baseUrl}`)
  console.log(`live-ai-smoke: mode text-memory${runFull ? ' + word-card' : ''}; image ${imageLive ? 'live' : 'mock'}`)

  const health = await request('/health')
  if (!health?.ok) throw new Error('health check did not return ok')

  const login = await request('/auth/test-login', {
    method: 'POST',
    body: JSON.stringify({ phone: '13800000000', code: '123456' }),
  })
  if (!login.token) throw new Error('test login did not return token')

  const textResult = await request('/generation/text-memory', {
    method: 'POST',
    headers: auth(login.token),
    body: JSON.stringify({
      inputText: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
      contentType: 'ancient_text',
      scenePreference: 'auto',
    }),
  })
  assertTextResult(textResult)
  await assertUsageLogs(textResult.id, { expectWord: false })
  console.log(`live-ai-smoke: text-memory ok (${textResult.id})`)

  if (runFull) {
    const wordResult = await request('/generation/word-card', {
      method: 'POST',
      headers: auth(login.token),
      body: JSON.stringify({
        words: ['memory', 'palace', 'review'],
        theme: 'auto',
        cardMode: 'simple',
      }),
    })
    assertWordResult(wordResult)
    await assertUsageLogs(wordResult.id, { expectWord: true })
    console.log(`live-ai-smoke: word-card ok (${wordResult.id})`)
  }

  console.log('live-ai-smoke: live AI validation passed')
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${body?.message ?? response.statusText}`)
  }
  return body
}

function assertTextResult(result) {
  assertCommonResult(result, 'text-memory')
  if (!Array.isArray(result.points) || result.points.length < 1) {
    throw new Error('text-memory result must include memory points')
  }
  for (const point of result.points) {
    for (const field of ['originalText', 'keyword', 'visualObject', 'anchorKey', 'reason']) {
      if (!point?.[field]) throw new Error(`text-memory point is missing ${field}`)
    }
  }
}

function assertWordResult(result) {
  assertCommonResult(result, 'word-card')
  if (!Array.isArray(result.words) || result.words.length < 1) {
    throw new Error('word-card result must include words')
  }
  for (const word of result.words) {
    for (const field of ['word', 'partOfSpeech', 'visualObject', 'anchorKey', 'memoryHint']) {
      if (!word?.[field]) throw new Error(`word-card item is missing ${field}`)
    }
  }
}

function assertCommonResult(result, type) {
  if (!result?.id) throw new Error(`${type} result did not include id`)
  if (result.type !== type) throw new Error(`${type} result returned wrong type: ${result.type}`)
  for (const field of ['title', 'templateId', 'imagePrompt', 'watermarkText', 'createdAt', 'expiresAt']) {
    if (!result[field]) throw new Error(`${type} result is missing ${field}`)
  }
  if (!result.credits || typeof result.credits.remaining !== 'number') {
    throw new Error(`${type} result did not return credit state`)
  }
  if (imageLive && !result.backgroundImageUrl) {
    throw new Error(`${type} live image mode must return backgroundImageUrl`)
  }
}

async function assertUsageLogs(recordId, { expectWord }) {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    const record = await prisma.generationRecord.findUnique({
      where: { id: recordId },
      include: { usageLogs: true },
    })
    if (!record) throw new Error(`record ${recordId} was not saved`)
    if (record.promptUsed?.startsWith('mock-')) {
      throw new Error('record promptUsed still points at mock prompt')
    }
    const aiLog = record.usageLogs.find((log) => log.provider === 'openai-compatible')
    if (!aiLog || aiLog.status !== 'success') {
      throw new Error('record must include successful openai-compatible usage log')
    }
    const imageProvider = imageLive ? 'wanx' : 'mock'
    const imageLog = record.usageLogs.find((log) => log.provider === imageProvider)
    if (!imageLog || imageLog.status !== 'success') {
      throw new Error(`record must include successful ${imageProvider} image usage log`)
    }
    if (expectWord && record.type !== 'word-card') throw new Error('word live smoke saved a non-word record')
  } finally {
    await prisma.$disconnect()
  }
}

function auth(token) {
  return { Authorization: `Bearer ${token}` }
}

function assertEnv() {
  const errors = []
  if (process.env.AI_MOCK_MODE !== 'false') errors.push('AI_MOCK_MODE=false is required')
  if (!process.env.LLM_API_KEY) errors.push('LLM_API_KEY is required')
  if (!process.env.DATABASE_URL) errors.push('DATABASE_URL is required for usage-log verification')
  if (imageLive && !process.env.WANX_API_KEY) errors.push('WANX_API_KEY is required when IMAGE_MOCK_MODE=false')
  if (errors.length) {
    for (const error of errors) console.error(`live-ai-smoke: ${error}`)
    process.exit(1)
  }
}

function loadServerEnv() {
  const envFile = process.env.ENV_FILE
    ? isAbsolute(process.env.ENV_FILE)
      ? process.env.ENV_FILE
      : join(process.cwd(), process.env.ENV_FILE)
    : join(serverDir, '.env')
  if (!existsSync(envFile)) return
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue
    const key = trimmed.slice(0, separatorIndex).trim()
    if (process.env[key]) continue
    const rawValue = trimmed.slice(separatorIndex + 1).trim()
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }
}
