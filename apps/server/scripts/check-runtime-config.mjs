import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const serverRoot = resolve(scriptDir, '..')
const repoRoot = resolve(serverRoot, '../..')
const explicitEnvFile = Boolean(process.env.ENV_FILE)
const envPath = explicitEnvFile ? resolveEnvFile(process.env.ENV_FILE) : resolve(serverRoot, '.env')
const fallbackEnvPath = resolve(serverRoot, '.env.example')

if (explicitEnvFile && !existsSync(envPath)) {
  console.error(`ERROR: ENV_FILE does not exist: ${shortPath(envPath)}`)
  process.exit(1)
}

const activeEnvPath = existsSync(envPath) ? envPath : fallbackEnvPath
const env = parseEnvFile(activeEnvPath)
const findings = []

checkCore()
checkLlm()
checkImage()
checkStorage()

const errors = findings.filter((item) => item.level === 'error')
const warnings = findings.filter((item) => item.level === 'warn')

for (const finding of findings) {
  console.log(`${finding.level.toUpperCase()}: ${finding.message}`)
}

console.log(
  `runtime-config: checked ${shortPath(activeEnvPath)}; ${errors.length} error(s), ${warnings.length} warning(s)`,
)

if (errors.length) process.exit(1)

function checkCore() {
  requireValue('DATABASE_URL', 'MySQL connection string is required for server runtime')
  requireValue('JWT_SECRET', 'JWT_SECRET is required for login tokens')
  if ((env.JWT_SECRET ?? '').includes('replace-with')) {
    warn('JWT_SECRET still uses the example placeholder; replace it before any shared or production deployment')
  }
  const port = Number(env.PORT ?? 3000)
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    error('PORT must be an integer between 1 and 65535')
  }
}

function checkLlm() {
  const mock = flag('AI_MOCK_MODE', true)
  if (mock) {
    info('AI_MOCK_MODE is enabled; LLM_API_KEY is not required for local mock generation')
    return
  }

  requireValue('LLM_API_KEY', 'AI_MOCK_MODE=false requires LLM_API_KEY')
  requireUrl('LLM_BASE_URL', 'AI_MOCK_MODE=false requires a valid LLM_BASE_URL')
  requireValue('LLM_MODEL', 'AI_MOCK_MODE=false requires LLM_MODEL')

  const retryCount = Number(env.LLM_JSON_RETRY_COUNT ?? 1)
  if (!Number.isInteger(retryCount) || retryCount < 0 || retryCount > 5) {
    error('LLM_JSON_RETRY_COUNT should be an integer from 0 to 5')
  }
}

function checkImage() {
  const mock = flag('IMAGE_MOCK_MODE', true)
  if (mock) {
    info('IMAGE_MOCK_MODE is enabled; WANX_API_KEY is not required for local mock generation')
    return
  }

  requireValue('WANX_API_KEY', 'IMAGE_MOCK_MODE=false requires WANX_API_KEY')
  requireUrl('WANX_BASE_URL', 'IMAGE_MOCK_MODE=false requires a valid WANX_BASE_URL')
  requireValue('WANX_MODEL', 'IMAGE_MOCK_MODE=false requires WANX_MODEL')

  const size = env.WANX_SIZE ?? ''
  if (!/^\d{3,4}\*\d{3,4}$/.test(size)) {
    error('WANX_SIZE should use DashScope format such as 960*1696')
  }

  const provider = normalizeProvider()
  if (provider === 'none' || provider === 'mock') {
    warn('IMAGE_MOCK_MODE=false with STORAGE_PROVIDER=none/mock will keep provider URLs instead of persisting images for 30 days')
  }
  if (provider === 'local' && !env.PUBLIC_BASE_URL) {
    warn('STORAGE_PROVIDER=local without PUBLIC_BASE_URL will return http://localhost:${PORT}/api/images URLs')
  }
}

function checkStorage() {
  const provider = normalizeProvider()
  const supported = new Set(['none', 'mock', 'local', 'oss', 's3', 's3-compatible'])
  if (!supported.has(provider)) {
    error(`STORAGE_PROVIDER must be one of ${Array.from(supported).join(', ')}`)
    return
  }

  if (provider === 'local') {
    info(`STORAGE_PROVIDER=local will save images under ${env.LOCAL_STORAGE_DIR || 'uploads/generated-images'}`)
  }

  if (provider === 'oss') {
    requireValue('OSS_BUCKET', 'STORAGE_PROVIDER=oss requires OSS_BUCKET')
    requireValue('OSS_REGION', 'STORAGE_PROVIDER=oss requires OSS_REGION')
    requireValue('OSS_ACCESS_KEY_ID', 'STORAGE_PROVIDER=oss requires OSS_ACCESS_KEY_ID')
    requireValue('OSS_ACCESS_KEY_SECRET', 'STORAGE_PROVIDER=oss requires OSS_ACCESS_KEY_SECRET')
    optionalUrl('OSS_ENDPOINT', 'OSS_ENDPOINT must be a valid URL when provided')
    optionalUrl('OSS_PUBLIC_BASE_URL', 'OSS_PUBLIC_BASE_URL must be a valid URL when provided')
    if (env.OSS_OBJECT_PREFIX && env.OSS_OBJECT_PREFIX.includes('..')) {
      error('OSS_OBJECT_PREFIX must not contain path traversal segments')
    }
  }

  if (provider === 's3' || provider === 's3-compatible') {
    requireValue('S3_BUCKET', `STORAGE_PROVIDER=${provider} requires S3_BUCKET`)
    requireUrl('S3_ENDPOINT', `STORAGE_PROVIDER=${provider} requires a valid S3_ENDPOINT`)
    requireValue('S3_ACCESS_KEY_ID', `STORAGE_PROVIDER=${provider} requires S3_ACCESS_KEY_ID`)
    requireValue('S3_SECRET_ACCESS_KEY', `STORAGE_PROVIDER=${provider} requires S3_SECRET_ACCESS_KEY`)
    optionalUrl('S3_PUBLIC_BASE_URL', 'S3_PUBLIC_BASE_URL must be a valid URL when provided')
    if (env.S3_OBJECT_PREFIX && env.S3_OBJECT_PREFIX.includes('..')) {
      error('S3_OBJECT_PREFIX must not contain path traversal segments')
    }
  }
}

function parseEnvFile(filePath) {
  const parsed = {}
  const raw = readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue
    parsed[match[1]] = stripQuotes(match[2])
  }
  return parsed
}

function resolveEnvFile(inputPath) {
  const cwdPath = resolve(process.cwd(), inputPath)
  if (existsSync(cwdPath)) return cwdPath
  return resolve(repoRoot, inputPath)
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

function flag(name, defaultValue) {
  const value = env[name]
  if (value === undefined || value === '') return defaultValue
  return value.toLowerCase() !== 'false'
}

function normalizeProvider() {
  return (env.STORAGE_PROVIDER ?? 'none').trim().toLowerCase()
}

function requireValue(name, message) {
  if (!env[name]) error(message)
}

function requireUrl(name, message) {
  const value = env[name]
  if (!value) {
    error(message)
    return
  }
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol')
  } catch {
    error(message)
  }
}

function optionalUrl(name, message) {
  if (!env[name]) return
  requireUrl(name, message)
}

function info(message) {
  findings.push({ level: 'info', message })
}

function warn(message) {
  findings.push({ level: 'warn', message })
}

function error(message) {
  findings.push({ level: 'error', message })
}

function shortPath(filePath) {
  return relative(process.cwd(), filePath) || filePath
}
