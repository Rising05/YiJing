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
const productionMode = process.argv.includes('--production') || env.NODE_ENV === 'production'
const findings = []

checkCore()
checkFormalAuth()
checkLlm()
checkImage()
checkStorage()
checkCors()
checkProduction()

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
  if (isPlaceholder(env.JWT_SECRET)) {
    if (productionMode) {
      error('NODE_ENV=production requires JWT_SECRET to be replaced with a real high-entropy secret')
    } else {
      warn('JWT_SECRET still uses the example placeholder; replace it before any shared or production deployment')
    }
  }
  const port = Number(env.PORT ?? 3000)
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    error('PORT must be an integer between 1 and 65535')
  }
}

function checkFormalAuth() {
  const rawProviders = csv('AUTH_FORMAL_PROVIDERS').map((provider) => provider.toLowerCase())
  const providers = rawProviders.length ? rawProviders : ['none']
  const enabledProviders = providers.filter((provider) => provider !== 'none')
  const supportedProviders = new Set(['none', 'sms', 'wechat'])

  for (const provider of providers) {
    if (!supportedProviders.has(provider)) {
      error('AUTH_FORMAL_PROVIDERS must contain only none, sms, or wechat')
    }
  }
  if (providers.includes('none') && enabledProviders.length) {
    error('AUTH_FORMAL_PROVIDERS must not combine none with sms or wechat')
  }

  if (!enabledProviders.length) {
    if (productionMode) {
      warn('Formal SMS/WeChat login is disabled; production will rely on the MVP test login until a provider is configured')
    } else {
      info('Formal SMS/WeChat login is disabled; placeholder endpoints should return FEATURE_NOT_CONFIGURED')
    }
    return
  }

  if (enabledProviders.includes('sms')) {
    requireRealValue('SMS_PROVIDER', 'AUTH_FORMAL_PROVIDERS=sms requires SMS_PROVIDER')
    requireRealValue('SMS_ACCESS_KEY_ID', 'AUTH_FORMAL_PROVIDERS=sms requires SMS_ACCESS_KEY_ID')
    requireRealValue('SMS_ACCESS_KEY_SECRET', 'AUTH_FORMAL_PROVIDERS=sms requires SMS_ACCESS_KEY_SECRET')
    requireRealValue('SMS_SIGN_NAME', 'AUTH_FORMAL_PROVIDERS=sms requires SMS_SIGN_NAME')
    requireRealValue('SMS_TEMPLATE_CODE', 'AUTH_FORMAL_PROVIDERS=sms requires SMS_TEMPLATE_CODE')
    optionalUrl('SMS_ENDPOINT', 'SMS_ENDPOINT must be a valid URL when provided')
  }

  if (enabledProviders.includes('wechat')) {
    requireRealValue('WECHAT_APP_ID', 'AUTH_FORMAL_PROVIDERS=wechat requires WECHAT_APP_ID')
    requireRealValue('WECHAT_APP_SECRET', 'AUTH_FORMAL_PROVIDERS=wechat requires WECHAT_APP_SECRET')
    optionalUrl('WECHAT_UNIVERSAL_LINK', 'WECHAT_UNIVERSAL_LINK must be a valid URL when provided')
  }
}

function checkLlm() {
  const requestTimeoutMs = Number(env.LLM_REQUEST_TIMEOUT_MS ?? 30000)
  if (!Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 1000 || requestTimeoutMs > 300000) {
    error('LLM_REQUEST_TIMEOUT_MS should be an integer from 1000 to 300000')
  }

  const mock = flag('AI_MOCK_MODE', true)
  if (mock) {
    if (productionMode) {
      error('NODE_ENV=production requires AI_MOCK_MODE=false')
    } else {
      info('AI_MOCK_MODE is enabled; LLM_API_KEY is not required for local mock generation')
      return
    }
  }

  requireValue('LLM_API_KEY', 'AI_MOCK_MODE=false requires LLM_API_KEY')
  if (isPlaceholder(env.LLM_API_KEY)) {
    error('AI_MOCK_MODE=false requires LLM_API_KEY to be a real backend-only secret, not an example placeholder')
  }
  requireUrl('LLM_BASE_URL', 'AI_MOCK_MODE=false requires a valid LLM_BASE_URL')
  requireValue('LLM_MODEL', 'AI_MOCK_MODE=false requires LLM_MODEL')

  const retryCount = Number(env.LLM_JSON_RETRY_COUNT ?? 1)
  if (!Number.isInteger(retryCount) || retryCount < 0 || retryCount > 5) {
    error('LLM_JSON_RETRY_COUNT should be an integer from 0 to 5')
  }
}

function checkImage() {
  const requestTimeoutMs = Number(env.WANX_REQUEST_TIMEOUT_MS ?? 120000)
  if (!Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 5000 || requestTimeoutMs > 600000) {
    error('WANX_REQUEST_TIMEOUT_MS should be an integer from 5000 to 600000')
  }

  const mock = flag('IMAGE_MOCK_MODE', true)
  if (mock) {
    if (productionMode) {
      error('NODE_ENV=production requires IMAGE_MOCK_MODE=false')
    } else {
      info('IMAGE_MOCK_MODE is enabled; WANX_API_KEY is not required for local mock generation')
      return
    }
  }

  requireValue('WANX_API_KEY', 'IMAGE_MOCK_MODE=false requires WANX_API_KEY')
  if (isPlaceholder(env.WANX_API_KEY)) {
    error('IMAGE_MOCK_MODE=false requires WANX_API_KEY to be a real backend-only secret, not an example placeholder')
  }
  requireUrl('WANX_BASE_URL', 'IMAGE_MOCK_MODE=false requires a valid WANX_BASE_URL')
  requireValue('WANX_MODEL', 'IMAGE_MOCK_MODE=false requires WANX_MODEL')

  const size = env.WANX_SIZE ?? ''
  if (!/^\d{3,4}\*\d{3,4}$/.test(size)) {
    error('WANX_SIZE should use DashScope format such as 960*1696')
  }

  const provider = normalizeProvider()
  if (provider === 'none' || provider === 'mock') {
    if (productionMode) {
      error('NODE_ENV=production requires STORAGE_PROVIDER to persist generated images for the 30-day retention window')
    } else {
      warn('IMAGE_MOCK_MODE=false with STORAGE_PROVIDER=none/mock will keep provider URLs instead of persisting images for 30 days')
    }
  }
  if (provider === 'local' && !env.PUBLIC_BASE_URL) {
    warn('STORAGE_PROVIDER=local without PUBLIC_BASE_URL will return http://localhost:${PORT}/api/images URLs')
  }
}

function checkStorage() {
  const requestTimeoutMs = Number(env.IMAGE_STORAGE_REQUEST_TIMEOUT_MS ?? 30000)
  if (!Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 1000 || requestTimeoutMs > 300000) {
    error('IMAGE_STORAGE_REQUEST_TIMEOUT_MS should be an integer from 1000 to 300000')
  }

  const downloadMaxBytes = Number(env.IMAGE_DOWNLOAD_MAX_BYTES ?? 20 * 1024 * 1024)
  if (!Number.isInteger(downloadMaxBytes) || downloadMaxBytes < 1024 * 1024 || downloadMaxBytes > 50 * 1024 * 1024) {
    error('IMAGE_DOWNLOAD_MAX_BYTES should be an integer from 1048576 to 52428800')
  }

  for (const host of csv('IMAGE_DOWNLOAD_ALLOWED_HOSTS')) {
    const normalized = host.startsWith('*.') ? host.slice(2) : host
    if (!normalized || /[/?#@]/.test(normalized)) {
      error(`IMAGE_DOWNLOAD_ALLOWED_HOSTS contains an invalid host: ${host}`)
    }
  }

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

function checkCors() {
  const origins = csv('ALLOWED_ORIGINS')
  if (!origins.length) {
    if (productionMode) {
      error('NODE_ENV=production requires ALLOWED_ORIGINS to list trusted app or web origins')
    } else {
      info('ALLOWED_ORIGINS is empty; development server will reflect request origins for local testing')
    }
    return
  }

  if (origins.includes('*')) {
    if (productionMode) {
      error('NODE_ENV=production must not use ALLOWED_ORIGINS=*')
    } else {
      warn('ALLOWED_ORIGINS=* reflects all origins; keep this out of production')
    }
    return
  }

  for (const origin of origins) {
    try {
      const url = new URL(origin)
      if (!['http:', 'https:', 'capacitor:', 'ionic:'].includes(url.protocol)) {
        error(`ALLOWED_ORIGINS contains unsupported origin scheme: ${origin}`)
      }
    } catch {
      error(`ALLOWED_ORIGINS contains an invalid origin: ${origin}`)
    }
  }
}

function checkProduction() {
  if (!productionMode) return

  if (env.NODE_ENV !== 'production') {
    error('Production config check requires NODE_ENV=production in the checked env file')
  }
  if ((env.JWT_SECRET ?? '').length < 32) {
    error('NODE_ENV=production requires JWT_SECRET to be at least 32 characters')
  }

  warnIfLocalhost('DATABASE_URL', 'Production DATABASE_URL points at localhost; use this only for a single-server deployment')

  const provider = normalizeProvider()
  if (provider === 'local') {
    requireUrl('PUBLIC_BASE_URL', 'STORAGE_PROVIDER=local in production requires a public https PUBLIC_BASE_URL')
    if ((env.PUBLIC_BASE_URL ?? '').startsWith('http://')) {
      error('STORAGE_PROVIDER=local in production requires PUBLIC_BASE_URL to use https')
    }
    if (isLocalhostUrl(env.PUBLIC_BASE_URL)) {
      error('STORAGE_PROVIDER=local in production must not use localhost PUBLIC_BASE_URL')
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

function csv(name) {
  return (env[name] ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function requireValue(name, message) {
  if (!env[name]) error(message)
}

function requireRealValue(name, message) {
  requireValue(name, message)
  if (isPlaceholder(env[name])) error(`${message}; replace the example placeholder before enabling the provider`)
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

function isPlaceholder(value) {
  if (!value) return false
  return /replace-with|your-|example|placeholder/i.test(value)
}

function isLocalhostUrl(value) {
  if (!value) return false
  try {
    const url = new URL(value)
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)
  } catch {
    return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value)
  }
}

function warnIfLocalhost(name, message) {
  const value = env[name]
  if (value && /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value)) warn(message)
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
