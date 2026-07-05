import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const mobileRoot = resolve(scriptDir, '..')
const envPath = resolve(mobileRoot, '.env.production.example')
const apiSourcePath = resolve(mobileRoot, 'src/services/api.ts')
const mockPolicyPath = resolve(mobileRoot, 'src/services/localMockPolicy.ts')
const authStorePath = resolve(mobileRoot, 'src/stores/authStore.ts')
const textMemoryPath = resolve(mobileRoot, 'src/pages/TextMemoryPage.tsx')
const wordCardPath = resolve(mobileRoot, 'src/pages/WordCardPage.tsx')
const resultPagePath = resolve(mobileRoot, 'src/pages/GenerateResultPage.tsx')
const errors = []

checkProductionEnvExample()
checkApiSource()
checkLocalMockPolicy()

if (errors.length) {
  for (const error of errors) console.error(`mobile-runtime-config: ${error}`)
  process.exit(1)
}

console.log('mobile-runtime-config: production API base URL and dev fallback checks passed')

function checkProductionEnvExample() {
  if (!existsSync(envPath)) {
    errors.push('apps/mobile/.env.production.example is required for release builds')
    return
  }

  const env = parseEnvFile(envPath)
  const apiBaseUrl = env.VITE_API_BASE_URL
  if (!apiBaseUrl) {
    errors.push('apps/mobile/.env.production.example must define VITE_API_BASE_URL')
    return
  }

  let url
  try {
    url = new URL(apiBaseUrl)
  } catch {
    errors.push('VITE_API_BASE_URL must be a valid absolute URL')
    return
  }

  if (url.protocol !== 'https:') {
    errors.push('VITE_API_BASE_URL must use https for release builds')
  }
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)) {
    errors.push('VITE_API_BASE_URL must not point at localhost for release builds')
  }
  if (!url.pathname.replace(/\/$/, '').endsWith('/api')) {
    errors.push('VITE_API_BASE_URL should include the backend /api prefix')
  }
}

function checkApiSource() {
  const source = readFileSync(apiSourcePath, 'utf8')
  if (!source.includes('env.DEV')) {
    errors.push('src/services/api.ts must keep localhost fallback scoped to import.meta.env.DEV')
  }
  if (!source.includes('API_BASE_URL_MISSING')) {
    errors.push('src/services/api.ts must expose a clear missing API base URL error')
  }
  if (/\?\?\s*['"]http:\/\/localhost:3000\/api['"]/.test(source)) {
    errors.push('src/services/api.ts must not use localhost as an unconditional production fallback')
  }
  if (!source.includes("return 'http://localhost:3000/api'")) {
    errors.push('src/services/api.ts should preserve the local development fallback')
  }
}

function checkLocalMockPolicy() {
  const policySource = readFileSync(mockPolicyPath, 'utf8')
  if (!policySource.includes('env.DEV')) {
    errors.push('src/services/localMockPolicy.ts must scope local mock fallback to import.meta.env.DEV')
  }
  if (!policySource.includes('assertLocalMockFallbackAllowed')) {
    errors.push('src/services/localMockPolicy.ts must export assertLocalMockFallbackAllowed')
  }
  if (!policySource.includes('API_BASE_URL_MISSING')) {
    errors.push('production mock fallback rejection should use a clear API_BASE_URL_MISSING error')
  }

  const authSource = readFileSync(authStorePath, 'utf8')
  if (!authSource.includes('canUseLocalMockFallback()')) {
    errors.push('authStore must not create a local mock login unless local mock fallback is allowed')
  }

  for (const [label, filePath] of [
    ['TextMemoryPage', textMemoryPath],
    ['WordCardPage', wordCardPath],
    ['GenerateResultPage', resultPagePath],
  ]) {
    const source = readFileSync(filePath, 'utf8')
    if (!source.includes('assertLocalMockFallbackAllowed')) {
      errors.push(`${label} must guard local mock generation with assertLocalMockFallbackAllowed`)
    }
  }
}

function parseEnvFile(filePath) {
  const parsed = {}
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue
    parsed[match[1]] = stripQuotes(match[2])
  }
  return parsed
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
