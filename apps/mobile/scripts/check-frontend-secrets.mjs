import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../../..')
const mobileRoot = resolve(repoRoot, 'apps/mobile')

const scanTargets = [
  resolve(mobileRoot, 'src'),
  resolve(mobileRoot, 'capacitor.config.ts'),
  resolve(mobileRoot, 'vite.config.ts'),
  resolve(mobileRoot, 'index.html'),
  resolve(mobileRoot, 'package.json'),
  ...findMobileEnvFiles(),
]

const allowedEnvNames = new Set([
  'API_BASE_URL',
  'BASE_URL',
  'MODE',
  'PROD',
  'DEV',
  'SSR',
  'VITE_API_BASE_URL',
])

const bannedPatterns = [
  { label: 'LLM API key env name', pattern: /\b(?:LLM|OPENAI|DASHSCOPE|WANX|QWEN|ALIYUN|OSS|S3)_API_KEY\b/ },
  { label: 'secret env name', pattern: /\b(?:API_SECRET|ACCESS_KEY_SECRET|SECRET_KEY|JWT_SECRET|CLIENT_SECRET|PRIVATE_KEY)\b/ },
  { label: 'OpenAI-style secret key literal', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: 'AWS access key literal', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: 'Bearer secret literal', pattern: /\bBearer\s+sk-[A-Za-z0-9_-]{10,}\b/i },
  { label: 'private key block', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
]

const findings = []
const scannedFiles = []

for (const target of scanTargets) {
  collectFiles(target).forEach((filePath) => {
    scannedFiles.push(filePath)
    scanFile(filePath)
  })
}

if (findings.length) {
  console.error('frontend-secrets: found possible frontend secret exposure')
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.label}`)
  }
  console.error('Move provider keys and secrets to apps/server/.env; the mobile app may only keep public Vite config such as VITE_API_BASE_URL.')
  process.exit(1)
}

console.log(`frontend-secrets: checked ${scannedFiles.length} file(s); no frontend secrets found`)

function findMobileEnvFiles() {
  if (!existsSync(mobileRoot)) return []
  return readdirSync(mobileRoot)
    .filter((name) => name === '.env' || name.startsWith('.env.'))
    .map((name) => resolve(mobileRoot, name))
}

function collectFiles(target) {
  if (!existsSync(target)) return []
  const stats = statSync(target)
  if (stats.isFile()) return shouldScanFile(target) ? [target] : []
  if (!stats.isDirectory()) return []

  const files = []
  for (const entry of readdirSync(target)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.vite') continue
    files.push(...collectFiles(join(target, entry)))
  }
  return files
}

function shouldScanFile(filePath) {
  const name = basename(filePath)
  if (name === '.env' || name.startsWith('.env.')) return true
  return new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css']).has(extname(filePath))
}

function scanFile(filePath) {
  const relativePath = relative(repoRoot, filePath)
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/)

  lines.forEach((line, index) => {
    const stripped = stripAllowedPublicEnvNames(line)
    for (const banned of bannedPatterns) {
      if (banned.pattern.test(stripped)) {
        findings.push({
          file: relativePath,
          line: index + 1,
          label: banned.label,
        })
      }
    }
  })
}

function stripAllowedPublicEnvNames(line) {
  let stripped = line
  for (const envName of allowedEnvNames) {
    stripped = stripped.replaceAll(envName, '')
  }
  return stripped
}
