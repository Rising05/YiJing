import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(appRoot, '../..')
const errors = []

const files = {
  buildGradle: read('android/app/build.gradle'),
  keystoreExample: read('android/keystore.properties.example'),
  gitignore: read('../../.gitignore'),
  androidSetup: read('ANDROID_SETUP.md'),
}

checkGradleSigningConfig()
checkKeystoreTemplate()
checkGitignore()
checkNoRealKeystoreFiles(repoRoot)
checkDocs()

if (errors.length) {
  for (const error of errors) console.error(`android-release-config: ${error}`)
  process.exit(1)
}

console.log('android-release-config: signing template, Gradle wiring, and secret guards passed')

function read(relativePath) {
  const filePath = resolve(appRoot, relativePath)
  if (!existsSync(filePath)) {
    errors.push(`${relativePath} is required`)
    return ''
  }
  return readFileSync(filePath, 'utf8')
}

function checkGradleSigningConfig() {
  assertAllIncludes(files.buildGradle, [
    "rootProject.file('keystore.properties')",
    'keystoreProperties.load(new FileInputStream(keystorePropertiesFile))',
    'signingConfigs',
    'release {',
    "storeFile file(keystoreProperties['storeFile'])",
    "storePassword keystoreProperties['storePassword']",
    "keyAlias keystoreProperties['keyAlias']",
    "keyPassword keystoreProperties['keyPassword']",
    'signingConfig signingConfigs.release',
  ], 'android/app/build.gradle must wire optional release signing through keystore.properties')
}

function checkKeystoreTemplate() {
  assertAllIncludes(files.keystoreExample, [
    'storeFile=/absolute/path/to/yijing-release.jks',
    'storePassword=replace-with-keystore-password',
    'keyAlias=yijing',
    'keyPassword=replace-with-key-password',
    'Never commit',
  ], 'android/keystore.properties.example must document all release signing fields')
}

function checkGitignore() {
  assertAllIncludes(files.gitignore, [
    '*.jks',
    '*.keystore',
    'apps/mobile/android/keystore.properties',
  ], '.gitignore must exclude Android signing secrets')
}

function checkDocs() {
  assertAllIncludes(files.androidSetup, [
    'keystore.properties.example',
    'keystore.properties',
    'bundleRelease',
    'assembleRelease',
    '不要提交',
  ], 'ANDROID_SETUP.md must document signed release build steps and secret handling')
}

function checkNoRealKeystoreFiles(root) {
  const allowed = new Set(['apps/mobile/android/keystore.properties.example'])
  const blockedExtensions = ['.jks', '.keystore']
  const blockedNames = new Set(['keystore.properties'])
  for (const filePath of walk(root)) {
    const normalized = relative(repoRoot, filePath).split('\\').join('/')
    if (allowed.has(normalized)) continue
    const lower = normalized.toLowerCase()
    if (blockedExtensions.some((extension) => lower.endsWith(extension)) || blockedNames.has(lower.split('/').at(-1))) {
      errors.push(`real Android signing secret must not be committed or kept in the repo tree: ${normalized}`)
    }
  }
}

function walk(dir) {
  const ignoredDirs = new Set(['.git', 'node_modules', 'dist', '.npm-cache'])
  const entries = []
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue
    const filePath = join(dir, entry)
    const stat = statSync(filePath)
    if (stat.isDirectory()) entries.push(...walk(filePath))
    else entries.push(filePath)
  }
  return entries
}

function assertAllIncludes(source, expectedValues, message) {
  const missing = expectedValues.filter((expected) => !source.includes(expected))
  if (missing.length) errors.push(`${message}: missing ${missing.map((value) => `"${value}"`).join(', ')}`)
}
