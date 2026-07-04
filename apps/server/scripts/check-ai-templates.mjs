import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

let aiTemplateModule
for (const builtModulePath of [
  '../dist/apps/server/src/modules/ai/memory-templates.js',
  '../dist/modules/ai/memory-templates.js',
]) {
  try {
    aiTemplateModule = require(builtModulePath)
    break
  } catch {
    // Try the next build layout.
  }
}

if (!aiTemplateModule) {
  console.error('AI template check requires a built server. Run `npm run build:server` first.')
  process.exit(1)
}

const { aiTemplates, getAiTemplate } = aiTemplateModule
const expectedIds = [
  'study_room_9',
  'classroom_9',
  'ancient_cottage_9',
  'palace_hall_12',
  'street_path_8',
  'museum_gallery_12',
  'airport_15',
  'restaurant_12',
  'campus_12',
  'blank_word_card_30',
]

const actualIds = aiTemplates.map((template) => template.id)
const missing = expectedIds.filter((id) => !actualIds.includes(id))

if (aiTemplates.length !== expectedIds.length || missing.length) {
  throw new Error(`Expected ${expectedIds.length} AI templates, got ${aiTemplates.length}; missing: ${missing.join(', ') || 'none'}`)
}

for (const template of aiTemplates) {
  if (!template.scenePrompt || template.anchors.length !== template.maxPoints) {
    throw new Error(`Invalid template shape for ${template.id}`)
  }
}

const fallback = getAiTemplate('unknown-template-id')
if (fallback.id !== 'study_room_9') {
  throw new Error(`Expected unknown template fallback to study_room_9, got ${fallback.id}`)
}

console.log(`ai-templates: ${aiTemplates.length} canonical templates passed`)
