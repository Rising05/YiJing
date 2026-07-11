import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('reflect-metadata')

const { AiService } = loadBuiltModule([
  '../dist/modules/ai/ai.service.js',
  '../dist/apps/server/src/modules/ai/ai.service.js',
])
const { getAiTemplate } = loadBuiltModule([
  '../dist/modules/ai/memory-templates.js',
  '../dist/apps/server/src/modules/ai/memory-templates.js',
])
const { ImageService } = loadBuiltModule([
  '../dist/modules/image/image.service.js',
  '../dist/apps/server/src/modules/image/image.service.js',
])
const { StorageService } = loadBuiltModule([
  '../dist/modules/image/storage.service.js',
  '../dist/apps/server/src/modules/image/storage.service.js',
])

const template = getAiTemplate('study_room_9')
const anchor = template.anchors[0]
const plan = {
  title: 'HTTP 契约测试',
  contentType: 'modern_text',
  templateId: template.id,
  points: [
    {
      id: 1,
      originalText: '春天来了',
      keyword: '春天',
      memoryMethod: 'meaning',
      visualObject: '窗边的一束绿芽',
      reason: '用绿芽提示春天到来',
      anchorKey: anchor.key,
      label: '绿芽',
    },
  ],
  explanation: '沿书房路线记忆。',
  recitationHint: '绿芽',
}

const state = {
  llmMode: 'success',
  wanxMode: 'success',
  llmRequests: [],
  wanxRequests: [],
}

const server = createServer(async (request, response) => {
  const body = await readJsonBody(request)
  const snapshot = {
    method: request.method,
    url: request.url,
    headers: request.headers,
    body,
  }

  if (request.url === '/v1/chat/completions') {
    state.llmRequests.push(snapshot)
    if (state.llmMode === 'delay') await delay(120)
    if (state.llmMode === 'error') return sendJson(response, 503, { message: 'LLM unavailable' })
    if (state.llmMode === 'empty') return sendJson(response, 200, { choices: [{ message: { content: '' } }] })
    if (state.llmMode === 'malformed') return sendRaw(response, 200, '{not-json')
    return sendJson(response, 200, { choices: [{ message: { content: JSON.stringify(plan) } }] })
  }

  if (request.url === '/api/v1/services/aigc/multimodal-generation/generation') {
    state.wanxRequests.push(snapshot)
    if (state.wanxMode === 'delay') await delay(120)
    if (state.wanxMode === 'error') return sendJson(response, 429, { message: '配额不足' })
    if (state.wanxMode === 'missing-image') return sendJson(response, 200, { output: { choices: [] } })
    return sendJson(response, 200, {
      output: {
        choices: [
          {
            message: {
              content: [{ type: 'image', image: 'https://images.example.com/generated/test.png' }],
            },
          },
        ],
      },
      request_id: 'contract-request-id',
    })
  }

  sendJson(response, 404, { message: 'not found' })
})

await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', resolve)
})

const address = server.address()
if (!address || typeof address === 'string') throw new Error('Failed to start local HTTP contract server')
const baseUrl = `http://127.0.0.1:${address.port}`

try {
  await checkLlmContract()
  await checkWanxContract()
  console.log('ai-http-contract: LLM and Wanx request, response, upstream failure, malformed payload, network, and timeout contracts passed')
} finally {
  server.closeAllConnections?.()
  await new Promise((resolve) => server.close(resolve))
}

async function checkLlmContract() {
  state.llmMode = 'success'
  const service = new AiService(
    config({
      AI_MOCK_MODE: 'false',
      LLM_BASE_URL: `${baseUrl}/v1`,
      LLM_API_KEY: 'contract-llm-key',
      LLM_MODEL: 'contract-model',
      LLM_JSON_RETRY_COUNT: '0',
      LLM_REQUEST_TIMEOUT_MS: '500',
    }),
  )

  const result = await service.createTextMemoryResult({
    inputText: '春天来了',
    contentType: 'modern_text',
    scenePreference: 'auto',
  })
  assert.equal(result.provider, 'openai-compatible')
  assert.equal(result.model, 'contract-model')
  assert.equal(result.result.points[0].anchorKey, anchor.key)
  assert.deepEqual(result.result.points[0].position, { x: anchor.x, y: anchor.y })

  const request = state.llmRequests.at(-1)
  assert.equal(request.method, 'POST')
  assert.equal(request.headers.authorization, 'Bearer contract-llm-key')
  assert.match(request.headers['content-type'], /^application\/json/)
  assert.equal(request.body.model, 'contract-model')
  assert.equal(request.body.response_format.type, 'json_object')
  assert.equal(request.body.messages[0].role, 'system')
  assert.equal(request.body.messages[1].role, 'user')
  assert.match(request.body.messages[1].content, /春天来了/)

  state.llmMode = 'error'
  await expectBusinessError(service.createTextMemoryResult(textDto()), 'LLM_REQUEST_FAILED', '503')

  state.llmMode = 'empty'
  await expectBusinessError(service.createTextMemoryResult(textDto()), 'LLM_EMPTY_RESPONSE', '返回为空')

  state.llmMode = 'malformed'
  await expectBusinessError(service.createTextMemoryResult(textDto()), 'LLM_REQUEST_FAILED', '响应格式错误')

  state.llmMode = 'delay'
  const timeoutService = new AiService(
    config({
      AI_MOCK_MODE: 'false',
      LLM_BASE_URL: `${baseUrl}/v1`,
      LLM_API_KEY: 'contract-llm-key',
      LLM_MODEL: 'contract-model',
      LLM_JSON_RETRY_COUNT: '0',
      LLM_REQUEST_TIMEOUT_MS: '20',
    }),
  )
  await expectBusinessError(timeoutService.createTextMemoryResult(textDto()), 'LLM_REQUEST_FAILED', '超时')

  const networkFailureService = new AiService(
    config({
      AI_MOCK_MODE: 'false',
      LLM_BASE_URL: 'http://127.0.0.1:1/v1',
      LLM_API_KEY: 'contract-llm-key',
      LLM_MODEL: 'contract-model',
      LLM_JSON_RETRY_COUNT: '0',
      LLM_REQUEST_TIMEOUT_MS: '100',
    }),
  )
  await expectBusinessError(networkFailureService.createTextMemoryResult(textDto()), 'LLM_REQUEST_FAILED', '请求失败')
}

async function checkWanxContract() {
  const storage = new StorageService(config({ STORAGE_PROVIDER: 'none' }))
  state.wanxMode = 'success'
  const service = new ImageService(
    config({
      IMAGE_MOCK_MODE: 'false',
      WANX_BASE_URL: baseUrl,
      WANX_API_KEY: 'contract-wanx-key',
      WANX_MODEL: 'contract-wanx-model',
      WANX_SIZE: '960*1696',
      WANX_REQUEST_TIMEOUT_MS: '500',
    }),
    storage,
  )

  const result = await service.generateBackground({ prompt: 'A quiet study room with a green sprout' })
  assert.equal(result.provider, 'wanx')
  assert.equal(result.model, 'contract-wanx-model')
  assert.equal(result.backgroundImageUrl, 'https://images.example.com/generated/test.png')

  const request = state.wanxRequests.at(-1)
  assert.equal(request.method, 'POST')
  assert.equal(request.headers.authorization, 'Bearer contract-wanx-key')
  assert.equal(request.body.model, 'contract-wanx-model')
  assert.equal(request.body.input.messages[0].content[0].text, 'A quiet study room with a green sprout')
  assert.equal(request.body.parameters.watermark, false)
  assert.equal(request.body.parameters.n, 1)
  assert.equal(request.body.parameters.size, '960*1696')
  assert.match(request.body.parameters.negative_prompt, /Chinese characters/)
  assert.match(request.body.parameters.negative_prompt, /political symbols/)

  state.wanxMode = 'error'
  await expectBusinessError(service.generateBackground({ prompt: 'test' }), 'IMAGE_GENERATION_FAILED', '配额不足')

  state.wanxMode = 'missing-image'
  await expectBusinessError(service.generateBackground({ prompt: 'test' }), 'IMAGE_GENERATION_FAILED', '未返回图片地址')

  state.wanxMode = 'delay'
  const timeoutService = new ImageService(
    config({
      IMAGE_MOCK_MODE: 'false',
      WANX_BASE_URL: baseUrl,
      WANX_API_KEY: 'contract-wanx-key',
      WANX_MODEL: 'contract-wanx-model',
      WANX_SIZE: '960*1696',
      WANX_REQUEST_TIMEOUT_MS: '20',
    }),
    storage,
  )
  await expectBusinessError(timeoutService.generateBackground({ prompt: 'test' }), 'IMAGE_GENERATION_FAILED', '超时')

  const networkFailureService = new ImageService(
    config({
      IMAGE_MOCK_MODE: 'false',
      WANX_BASE_URL: 'http://127.0.0.1:1',
      WANX_API_KEY: 'contract-wanx-key',
      WANX_MODEL: 'contract-wanx-model',
      WANX_SIZE: '960*1696',
      WANX_REQUEST_TIMEOUT_MS: '100',
    }),
    storage,
  )
  await expectBusinessError(networkFailureService.generateBackground({ prompt: 'test' }), 'IMAGE_GENERATION_FAILED', '请求失败')
}

function loadBuiltModule(paths) {
  for (const modulePath of paths) {
    try {
      return require(modulePath)
    } catch {
      // Try the next TypeScript build layout.
    }
  }
  console.error('AI HTTP contract check requires a built server. Run `npm run build:server` first.')
  process.exit(1)
}

function config(values) {
  return {
    get(key) {
      return values[key]
    },
  }
}

function textDto() {
  return {
    inputText: '春天来了',
    contentType: 'modern_text',
    scenePreference: 'auto',
  }
}

async function expectBusinessError(promise, expectedCode, messagePart) {
  try {
    await promise
    assert.fail(`Expected ${expectedCode}`)
  } catch (error) {
    if (error?.code === 'ERR_ASSERTION') throw error
    const payload = error?.getResponse?.()
    assert.equal(payload?.code, expectedCode)
    assert.match(String(payload?.message ?? ''), new RegExp(messagePart))
  }
}

async function readJsonBody(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  const source = Buffer.concat(chunks).toString('utf8')
  return source ? JSON.parse(source) : null
}

function sendJson(response, status, body) {
  if (response.destroyed) return
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(body))
}

function sendRaw(response, status, body) {
  if (response.destroyed) return
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(body)
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
