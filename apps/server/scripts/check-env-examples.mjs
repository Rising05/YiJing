import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const serverRoot = resolve(scriptDir, '..')
const repoRoot = resolve(serverRoot, '../..')
const errors = []

const runtimeKeys = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT',
  'NODE_ENV',
  'ALLOWED_ORIGINS',
  'AUTH_FORMAL_PROVIDERS',
  'SMS_PROVIDER',
  'SMS_ENDPOINT',
  'SMS_ACCESS_KEY_ID',
  'SMS_ACCESS_KEY_SECRET',
  'SMS_SIGN_NAME',
  'SMS_TEMPLATE_CODE',
  'WECHAT_APP_ID',
  'WECHAT_APP_SECRET',
  'WECHAT_UNIVERSAL_LINK',
  'AI_MOCK_MODE',
  'LLM_BASE_URL',
  'LLM_API_KEY',
  'LLM_MODEL',
  'LLM_JSON_RETRY_COUNT',
  'LLM_REQUEST_TIMEOUT_MS',
  'IMAGE_MOCK_MODE',
  'WANX_BASE_URL',
  'WANX_API_KEY',
  'WANX_MODEL',
  'WANX_SIZE',
  'WANX_REQUEST_TIMEOUT_MS',
  'STORAGE_PROVIDER',
  'LOCAL_STORAGE_DIR',
  'PUBLIC_BASE_URL',
  'IMAGE_STORAGE_REQUEST_TIMEOUT_MS',
  'IMAGE_DOWNLOAD_MAX_BYTES',
  'IMAGE_DOWNLOAD_ALLOWED_HOSTS',
  'OSS_BUCKET',
  'OSS_REGION',
  'OSS_ENDPOINT',
  'OSS_PUBLIC_BASE_URL',
  'OSS_OBJECT_PREFIX',
  'OSS_ACCESS_KEY_ID',
  'OSS_ACCESS_KEY_SECRET',
  'S3_BUCKET',
  'S3_REGION',
  'S3_ENDPOINT',
  'S3_PUBLIC_BASE_URL',
  'S3_OBJECT_PREFIX',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
]

const scriptOnlyKeys = new Set([
  'API_BASE_URL',
  'ENV_FILE',
  'IMAGE_CLEANUP_DRY_RUN',
  'LIVE_AI_SMOKE',
  'LIVE_AI_SMOKE_FULL',
])

const envExample = parseEnvFile('apps/server/.env.example')
const productionExample = parseEnvFile('apps/server/.env.production.example')

checkFile(envExample, runtimeKeys)
checkFile(productionExample, runtimeKeys)
checkDefaults()
checkReferencedRuntimeKeys()

if (errors.length) {
  for (const error of errors) console.error(`env-examples: ${error}`)
  process.exit(1)
}

console.log(`env-examples: ${runtimeKeys.length} runtime key(s) covered in development and production examples`)

function parseEnvFile(relativePath) {
  const filePath = resolve(repoRoot, relativePath)
  if (!existsSync(filePath)) {
    errors.push(`${relativePath} is missing`)
    return { relativePath, values: {}, keys: [], duplicates: [] }
  }

  const values = {}
  const keys = []
  const seen = new Set()
  const duplicates = []
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue
    const key = match[1]
    if (seen.has(key)) duplicates.push(key)
    seen.add(key)
    keys.push(key)
    values[key] = stripQuotes(match[2])
  }
  return { relativePath, values, keys, duplicates }
}

function checkFile(file, expectedKeys) {
  for (const duplicate of file.duplicates) {
    errors.push(`${file.relativePath} has duplicate key ${duplicate}`)
  }

  const actual = new Set(file.keys)
  const expected = new Set(expectedKeys)
  const missing = expectedKeys.filter((key) => !actual.has(key))
  const unexpected = file.keys.filter((key) => !expected.has(key))
  if (missing.length) {
    errors.push(`${file.relativePath} is missing ${missing.join(', ')}`)
  }
  if (unexpected.length) {
    errors.push(`${file.relativePath} contains unexpected runtime key(s): ${unexpected.join(', ')}`)
  }

  const actualOrder = file.keys.join(',')
  const expectedOrder = expectedKeys.join(',')
  if (!missing.length && !unexpected.length && actualOrder !== expectedOrder) {
    errors.push(`${file.relativePath} key order differs from the canonical runtime env order`)
  }
}

function checkDefaults() {
  assertValue(envExample, 'NODE_ENV', 'development')
  assertValue(envExample, 'AUTH_FORMAL_PROVIDERS', 'none')
  assertValue(envExample, 'AI_MOCK_MODE', 'true')
  assertValue(envExample, 'IMAGE_MOCK_MODE', 'true')
  assertValue(envExample, 'STORAGE_PROVIDER', 'none')

  assertValue(productionExample, 'NODE_ENV', 'production')
  assertValue(productionExample, 'AUTH_FORMAL_PROVIDERS', 'none')
  assertValue(productionExample, 'AI_MOCK_MODE', 'false')
  assertValue(productionExample, 'IMAGE_MOCK_MODE', 'false')
  assertNonEmpty(productionExample, 'LLM_API_KEY')
  assertNonEmpty(productionExample, 'WANX_API_KEY')
  if (!productionExample.values.PUBLIC_BASE_URL?.startsWith('https://')) {
    errors.push('apps/server/.env.production.example PUBLIC_BASE_URL must be an https URL')
  }
  if (['none', 'mock'].includes((productionExample.values.STORAGE_PROVIDER ?? '').toLowerCase())) {
    errors.push('apps/server/.env.production.example STORAGE_PROVIDER must persist generated images')
  }
}

function checkReferencedRuntimeKeys() {
  const referenced = new Set()
  for (const filePath of listFiles(resolve(serverRoot, 'src')).concat(listFiles(resolve(serverRoot, 'scripts')))) {
    if (!/\.(ts|mts|cts|js|mjs|cjs)$/.test(filePath)) continue
    const source = readFileSync(filePath, 'utf8')
    collectMatches(source, /process\.env\.([A-Z0-9_]+)/g, referenced)
    collectMatches(source, /config\.get(?:<[^>]+>)?\(['"]([A-Z0-9_]+)['"]\)/g, referenced)
    collectMatches(source, /\benv\.([A-Z0-9_]+)/g, referenced)
  }

  const missing = Array.from(referenced)
    .filter((key) => !runtimeKeys.includes(key) && !scriptOnlyKeys.has(key))
    .sort()
  if (missing.length) {
    errors.push(`server source references env key(s) not documented in examples: ${missing.join(', ')}`)
  }
}

function listFiles(dir) {
  if (!existsSync(dir)) return []
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const filePath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFiles(filePath))
    } else {
      files.push(filePath)
    }
  }
  return files
}

function collectMatches(source, pattern, output) {
  for (const match of source.matchAll(pattern)) output.add(match[1])
}

function assertValue(file, key, expected) {
  if (file.values[key] !== expected) {
    errors.push(`${file.relativePath} ${key} must be ${JSON.stringify(expected)}`)
  }
}

function assertNonEmpty(file, key) {
  if (!file.values[key]) {
    errors.push(`${file.relativePath} ${key} must be documented with a placeholder value`)
  }
}

function stripQuotes(value) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}
