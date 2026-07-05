import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const servicePath = resolve(scriptDir, '../src/modules/generation/generation.service.ts')
const source = readFileSync(servicePath, 'utf8')

const requiredSnippets = [
  'promptUsed: this.persistedPrompt(input.promptUsed)',
  'rawPrompt: this.rawPromptForLog(input.promptUsed)',
  'rawPrompt: this.rawPromptForLog(input.imagePrompt)',
  'rawResponse: this.rawJsonForLog(input.rawResponse)',
  'rawResponse: this.rawJsonForLog(input.imageRawResponse)',
  'return `[redacted:${this.shortHash(prompt)}]`',
]

const errors = []

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    errors.push(`Missing production redaction guard: ${snippet}`)
  }
}

if (/promptUsed:\s*input\.promptUsed/.test(source)) {
  errors.push('GenerationRecord.promptUsed must not persist raw input.promptUsed directly')
}

if (/rawPrompt:\s*process\.env\.NODE_ENV/.test(source) || /rawResponse:\s*process\.env\.NODE_ENV/.test(source)) {
  errors.push('Production raw prompt/response redaction should stay behind helper methods')
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('production-redaction: generation prompt and raw response guards passed')
