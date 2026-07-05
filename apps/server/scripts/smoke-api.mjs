import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000/api'
const serverDir = dirname(dirname(fileURLToPath(import.meta.url)))

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
    const message = body?.message ?? `${response.status} ${response.statusText}`
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${message}`)
  }
  return body
}

async function expectRequestFailure(path, options = {}, expectedCode) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => null)
  if (response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} unexpectedly succeeded`)
  }
  if (expectedCode && body?.code !== expectedCode) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed with ${body?.code ?? 'unknown'}, expected ${expectedCode}`)
  }
  return body
}

function auth(token) {
  return { Authorization: `Bearer ${token}` }
}

async function main() {
  console.log(`Smoke target: ${baseUrl}`)

  const health = await request('/health')
  console.log('health:', health.ok ? 'ok' : 'failed')

  await expectRequestFailure('/generation/text-memory', {
    method: 'POST',
    body: JSON.stringify({
      inputText: '未登录时不能生成',
      contentType: 'modern_text',
      scenePreference: 'auto',
    }),
  }, 'UNAUTHORIZED')
  console.log('unauthorized generation rejected: ok')

  await expectRequestFailure('/auth/test-login', {
    method: 'POST',
    body: JSON.stringify({ phone: '13800000000', code: '000000' }),
  }, 'INVALID_INPUT')
  console.log('invalid login rejected: ok')

  let login = await request('/auth/test-login', {
    method: 'POST',
    body: JSON.stringify({ phone: '13800000000', code: '123456' }),
  })
  let token = login.token
  if (!token) throw new Error('login did not return token')
  console.log('login: ok')

  await setQuota(login.user.id, { remainingCredits: 0, usedCredits: 20 })
  login = await request('/auth/test-login', {
    method: 'POST',
    body: JSON.stringify({ phone: '13800000000', code: '123456' }),
  })
  token = login.token
  if (!token || login.user.remainingCredits !== 20) {
    throw new Error('test login did not restore 20 remaining credits')
  }
  console.log('login quota restore: ok')

  await expectRequestFailure('/generation/text-memory', {
    method: 'POST',
    headers: auth(token),
    body: JSON.stringify({
      inputText: '春'.repeat(501),
      contentType: 'modern_text',
      scenePreference: 'auto',
    }),
  }, 'INPUT_TOO_LONG')
  console.log('text length validation: ok')

  await expectRequestFailure('/generation/word-card', {
    method: 'POST',
    headers: auth(token),
    body: JSON.stringify({
      words: Array.from({ length: 31 }, (_, index) => `word-${index + 1}`),
      theme: 'auto',
      cardMode: 'scene',
    }),
  }, 'TOO_MANY_WORDS')
  console.log('word count validation: ok')

  await expectRequestFailure('/generation/text-memory', {
    method: 'POST',
    headers: auth(token),
    body: JSON.stringify({
      inputText: '请生成带有宗教符号和政治符号的背诵图。',
      contentType: 'modern_text',
      scenePreference: 'auto',
    }),
  }, 'CONTENT_BLOCKED')
  console.log('content safety rejection: ok')

  const textResult = await request('/generation/text-memory', {
    method: 'POST',
    headers: auth(token),
    body: JSON.stringify({
      inputText: '道可道，非常道；名可名，非常名。无名，万物之始；有名，万物之母。',
      contentType: 'ancient_text',
      scenePreference: 'auto',
    }),
  })
  if (!textResult.id || textResult.type !== 'text-memory') throw new Error('text generation returned invalid result')
  console.log('text-memory:', textResult.id)

  const wordResult = await request('/generation/word-card', {
    method: 'POST',
    headers: auth(token),
    body: JSON.stringify({
      words: ['passport', 'luggage', 'boarding gate'],
      theme: 'auto',
      cardMode: 'simple',
    }),
  })
  if (!wordResult.id || wordResult.type !== 'word-card') throw new Error('word generation returned invalid result')
  if (wordResult.cardMode !== 'simple' || wordResult.templateId !== 'blank_word_card_30') {
    throw new Error('word generation did not preserve simple card mode')
  }
  console.log('word-card:', wordResult.id)

  const regenerated = await request(`/generation/${textResult.id}/regenerate`, {
    method: 'POST',
    headers: auth(token),
  })
  if (!regenerated.id || regenerated.id === textResult.id || regenerated.type !== 'text-memory') {
    throw new Error('regenerate returned invalid result')
  }
  if (!regenerated.credits || typeof regenerated.credits.remaining !== 'number') {
    throw new Error('regenerate did not return credit state')
  }
  console.log('regenerate:', regenerated.id)

  const regeneratedWord = await request(`/generation/${wordResult.id}/regenerate`, {
    method: 'POST',
    headers: auth(token),
  })
  if (!regeneratedWord.id || regeneratedWord.id === wordResult.id || regeneratedWord.type !== 'word-card') {
    throw new Error('word regenerate returned invalid result')
  }
  if (regeneratedWord.cardMode !== 'simple' || regeneratedWord.templateId !== 'blank_word_card_30') {
    throw new Error('word regenerate did not preserve simple card mode')
  }
  console.log('word regenerate:', regeneratedWord.id)

  const history = await request('/history', { headers: auth(token) })
  if (!Array.isArray(history) || history.length < 4) throw new Error('history did not include generated records')
  console.log('history:', history.length)

  const detail = await request(`/history/${textResult.id}`, { headers: auth(token) })
  if (detail.id !== textResult.id) throw new Error('history detail returned wrong record')
  console.log('detail: ok')

  await request(`/history/${wordResult.id}/favorite`, {
    method: 'PATCH',
    headers: auth(token),
  })
  console.log('favorite: ok')

  await request(`/history/${wordResult.id}`, {
    method: 'DELETE',
    headers: auth(token),
  })
  console.log('delete history: ok')

  await setQuota(login.user.id, { remainingCredits: 0 })
  await expectRequestFailure('/generation/text-memory', {
    method: 'POST',
    headers: auth(token),
    body: JSON.stringify({
      inputText: '额度用完后不能继续生成',
      contentType: 'modern_text',
      scenePreference: 'auto',
    }),
  }, 'QUOTA_EXCEEDED')
  console.log('quota exhaustion rejected: ok')

  await request('/user/me', {
    method: 'DELETE',
    headers: auth(token),
  })
  console.log('delete account: ok')

  await expectRequestFailure('/history', { headers: auth(token) }, 'UNAUTHORIZED')
  console.log('deleted token rejected: ok')
}

async function setQuota(userId, data) {
  loadServerEnv()
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    await prisma.userQuota.update({
      where: { userId },
      data,
    })
  } finally {
    await prisma.$disconnect()
  }
}

function loadServerEnv() {
  if (process.env.DATABASE_URL) return
  const envPath = join(serverDir, '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue
    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '')
    process.env[key] ??= value
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
