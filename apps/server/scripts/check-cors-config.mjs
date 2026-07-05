import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const scriptDir = dirname(fileURLToPath(import.meta.url))

let corsModule
try {
  corsModule = require(resolve(scriptDir, '../dist/apps/server/src/common/cors.js'))
} catch {
  console.error('CORS config check requires a built server. Run `npm run build:server` first.')
  process.exit(1)
}

const { createCorsOptions, parseAllowedOrigins } = corsModule

assertDeepEqual(
  parseAllowedOrigins(' https://app.example.com, capacitor://localhost ,,'),
  ['https://app.example.com', 'capacitor://localhost'],
  'ALLOWED_ORIGINS should parse comma-separated origins',
)

const devDefault = createCorsOptions({ NODE_ENV: 'development', ALLOWED_ORIGINS: '' })
assert(devDefault.origin === true && devDefault.credentials === true, 'development without ALLOWED_ORIGINS should reflect local origins')

const productionOrigins = createCorsOptions({
  NODE_ENV: 'production',
  ALLOWED_ORIGINS: 'https://app.example.com,capacitor://localhost',
})
assertDeepEqual(
  productionOrigins.origin,
  ['https://app.example.com', 'capacitor://localhost'],
  'production should use explicit CORS allowlist',
)
assert(productionOrigins.credentials === true, 'production CORS should keep credentials enabled for auth headers')

expectThrow(
  () => createCorsOptions({ NODE_ENV: 'production', ALLOWED_ORIGINS: '' }),
  'ALLOWED_ORIGINS is required',
  'production should require ALLOWED_ORIGINS',
)

expectThrow(
  () => createCorsOptions({ NODE_ENV: 'production', ALLOWED_ORIGINS: '*' }),
  'must not include *',
  'production should reject wildcard CORS origins',
)

console.log('cors-config: development fallback and production allowlist checks passed')

function expectThrow(fn, expectedMessage, label) {
  try {
    fn()
  } catch (error) {
    if (String(error.message).includes(expectedMessage)) return
    throw new Error(`${label} threw unexpected error: ${error.message}`)
  }
  throw new Error(`${label} did not throw`)
}

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
