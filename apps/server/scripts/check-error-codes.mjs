import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const serverRoot = resolve(scriptDir, '..')
const repoRoot = resolve(serverRoot, '../..')

const sharedSource = readFileSync(join(repoRoot, 'packages/shared/src/errors.ts'), 'utf8')
const knownCodes = new Set()
collectMatches(sharedSource, /\b[A-Z][A-Z0-9_]+:\s*'([A-Z][A-Z0-9_]+)'/g, knownCodes)
const missing = []

for (const code of knownCodes) {
  if (!sharedSource.includes(`[ErrorCode.${code}]`)) {
    missing.push(`shared ErrorLabels is missing ${code}`)
  }
}

const sourceFiles = execFileSync('rg', ['--files', 'apps/server/src'], {
  cwd: repoRoot,
  encoding: 'utf8',
}).trim().split(/\r?\n/).filter(Boolean)

const serverCodes = new Set()
for (const relativePath of sourceFiles) {
  const source = readFileSync(join(repoRoot, relativePath), 'utf8')
  collectMatches(source, /\bcode:\s*'([A-Z][A-Z0-9_]+)'/g, serverCodes)
  collectMatches(source, /\breturn\s+'([A-Z][A-Z0-9_]+)'/g, serverCodes)
}

for (const code of serverCodes) {
  if (!knownCodes.has(code)) missing.push(`server emits ${code}, but packages/shared ErrorCode does not define it`)
}

if (missing.length) {
  for (const item of missing) console.error(`error-codes: ${item}`)
  process.exit(1)
}

console.log(`error-codes: ${serverCodes.size} server-emitted code(s) are covered by shared ErrorCode labels`)

function collectMatches(source, pattern, output) {
  for (const match of source.matchAll(pattern)) {
    output.add(match[1])
  }
}
