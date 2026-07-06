import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const serverDir = dirname(dirname(fileURLToPath(import.meta.url)))
const repoRoot = resolve(serverDir, '../..')

let mockGeneratorModule
for (const builtModulePath of [
  '../dist/modules/generation/mock-generator.js',
  '../dist/apps/server/src/modules/generation/mock-generator.js',
]) {
  try {
    mockGeneratorModule = require(builtModulePath)
    break
  } catch {
    // Try the next build layout.
  }
}

if (!mockGeneratorModule) {
  console.error('Image prompt check requires a built server. Run `npm run build:server` first.')
  process.exit(1)
}

const requiredFragments = [
  'no text',
  'no Chinese characters',
  'no English letters',
  'no numbers',
  'no labels',
  'no watermark',
  'no UI elements',
  'no religious symbols',
  'no political symbols',
  '不要出现文字、数字、标签、水印、界面元素、宗教符号、政治符号。',
]

function assertPromptRequirements(label, prompt) {
  const missing = requiredFragments.filter((fragment) => !prompt.includes(fragment))
  if (missing.length) {
    throw new Error(`${label} imagePrompt is missing required fragment(s): ${missing.join(', ')}`)
  }
}

const { createTextMemoryMock, createWordCardMock } = mockGeneratorModule

assertPromptRequirements(
  'text-memory mock',
  createTextMemoryMock('春天来了，万物复苏。', 'modern_text', 'auto').imagePrompt,
)
assertPromptRequirements(
  'word-card scene mock',
  createWordCardMock(['passport', 'boarding gate'], 'scene').imagePrompt,
)
assertPromptRequirements(
  'word-card simple mock',
  createWordCardMock(['passport', 'boarding gate'], 'simple').imagePrompt,
)

const imagePromptSourcePath = join(repoRoot, 'packages/prompts/src/imagePrompt.ts')
if (!existsSync(imagePromptSourcePath)) {
  throw new Error(`Missing image prompt source: ${imagePromptSourcePath}`)
}

const imagePromptSource = readFileSync(imagePromptSourcePath, 'utf8')
for (const fragment of [
  'export const imagePromptEnglishRequirements',
  'export const imagePromptChineseRequirements',
  'export function appendImagePromptRequirements',
  'return appendImagePromptRequirements',
]) {
  if (!imagePromptSource.includes(fragment)) {
    throw new Error(`buildImagePrompt source is missing shared requirement guard: ${fragment}`)
  }
}

for (const fragment of requiredFragments) {
  if (!imagePromptSource.includes(fragment)) {
    throw new Error(`shared image prompt requirements are missing: ${fragment}`)
  }
}

// ---------------------------------------------------------------------------
// Verify front-end mock source files also use the shared appendImagePromptRequirements
// instead of inline prompt strings, preventing front-end mock prompt divergence.
// ---------------------------------------------------------------------------
const frontendMockFiles = [
  join(repoRoot, 'apps/mobile/src/mocks/memoryMock.ts'),
  join(repoRoot, 'apps/mobile/src/mocks/wordMock.ts'),
]
for (const filePath of frontendMockFiles) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing front-end mock source: ${filePath}`)
  }
  const source = readFileSync(filePath, 'utf8')
  if (!source.includes('appendImagePromptRequirements')) {
    throw new Error(`${filePath} must import and use appendImagePromptRequirements from @memory-palace/prompts`)
  }
}

console.log('image-prompts: all mock and shared image prompts include required no-text/no-symbol constraints')
