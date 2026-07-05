import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('reflect-metadata')

let aiServiceModule
let templateModule

for (const builtModulePath of [
  '../dist/modules/ai/ai.service.js',
  '../dist/apps/server/src/modules/ai/ai.service.js',
]) {
  try {
    aiServiceModule = require(builtModulePath)
    break
  } catch {
    // Try the next build layout.
  }
}

for (const builtModulePath of [
  '../dist/modules/ai/memory-templates.js',
  '../dist/apps/server/src/modules/ai/memory-templates.js',
]) {
  try {
    templateModule = require(builtModulePath)
    break
  } catch {
    // Try the next build layout.
  }
}

if (!aiServiceModule || !templateModule) {
  console.error('AI retry check requires a built server. Run `npm run build:server` first.')
  process.exit(1)
}

const { AiService } = aiServiceModule
const { getAiTemplate } = templateModule

const template = getAiTemplate('study_room_9')
const anchor = template.anchors[0]

function makePlan(anchorKey) {
  return JSON.stringify({
    title: '重试测试',
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
        anchorKey,
        label: '绿芽',
      },
    ],
    explanation: '沿着书房路线记住春天。',
    recitationHint: '绿芽',
  })
}

const responses = [makePlan('not-a-real-anchor'), makePlan(anchor.key)]
let callCount = 0

const config = {
  get(key) {
    const values = {
      AI_MOCK_MODE: 'false',
      LLM_API_KEY: 'test-key',
      LLM_MODEL: 'test-model',
      LLM_JSON_RETRY_COUNT: '1',
    }
    return values[key]
  },
}

const service = new AiService(config)
service.callChatCompletion = async () => {
  callCount += 1
  const response = responses.shift()
  if (!response) throw new Error('Unexpected extra LLM retry')
  return response
}

const result = await service.createTextMemoryResult({
  inputText: '春天来了',
  contentType: 'modern_text',
  scenePreference: 'auto',
})

if (callCount !== 2) {
  throw new Error(`Expected 2 LLM attempts after invalid anchor retry, got ${callCount}`)
}

if (result.result.points[0].anchorKey !== anchor.key) {
  throw new Error('AI retry did not return the valid retried plan')
}

console.log('ai-retry: JSON parse and schema/anchor validation retry passed')
