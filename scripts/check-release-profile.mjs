import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []

const files = {
  profile: read('docs/release/PRODUCTION_RELEASE_PROFILE.md'),
  checklist: read('docs/release/MAINLAND_RELEASE_CHECKLIST.md'),
  readme: read('README.md'),
  spec: read('SPEC.md'),
  packageJson: JSON.parse(read('package.json') || '{}'),
}

checkProfileTemplate()
checkReferences()
checkPackageScript()

if (errors.length) {
  for (const error of errors) console.error(`release-profile: ${error}`)
  process.exit(1)
}

console.log('release-profile: production release profile template and references passed')

function read(relativePath) {
  const filePath = resolve(repoRoot, relativePath)
  if (!existsSync(filePath)) {
    errors.push(`${relativePath} is required`)
    return ''
  }
  return readFileSync(filePath, 'utf8')
}

function checkProfileTemplate() {
  assertAllIncludes(files.profile, [
    '# 生产发布资料表',
    '状态枚举',
    '## 1. 运营主体',
    '运营主体名称',
    '统一社会信用代码',
    '联系邮箱',
    '联系电话',
    '联系地址',
    '## 2. 品牌与应用信息',
    '正式 App 名称',
    '正式 logo 源文件',
    '包名/App ID',
    '首版版本号',
    '## 3. 域名、服务器与备案',
    '云服务器厂商',
    'API 域名',
    '官网/落地页域名',
    'HTTPS 证书方案',
    'ICP 备案号',
    '公安联网备案号',
    'App 备案资料',
    '## 4. 外部服务商',
    'LLM 服务商',
    '生图服务商',
    '图片对象存储',
    '短信服务商',
    '微信开放平台移动应用',
    '## 5. 法务与合规文本',
    '隐私政策正式版',
    '用户协议正式版',
    '未成年人提示',
    '数据保存与删除策略',
    '内容安全规则',
    '## 6. 应用商店与签名',
    'Android 签名证书',
    'Android 应用市场',
    'Apple Developer Team',
    'iOS Bundle ID',
    '应用商店截图',
    '## 7. 发布前必须验证',
    'npm run check:mvp',
    'npm run smoke:api',
    'LIVE_AI_SMOKE=true npm run smoke:live-ai',
    'npm run check:release-env -w apps/mobile -- --strict',
  ], 'docs/release/PRODUCTION_RELEASE_PROFILE.md must keep required production release fields')
}

function checkReferences() {
  assertAllIncludes(files.checklist, [
    '生产发布资料表',
    'docs/release/PRODUCTION_RELEASE_PROFILE.md',
    'check:release-profile',
  ], 'MAINLAND_RELEASE_CHECKLIST must link the production release profile')
  assertAllIncludes(files.readme, [
    'docs/release/PRODUCTION_RELEASE_PROFILE.md',
    'npm run check:release-profile',
  ], 'README must link the production release profile and command')
  assertAllIncludes(files.spec, [
    '生产发布资料表',
    'docs/release/PRODUCTION_RELEASE_PROFILE.md',
    'check:release-profile',
  ], 'SPEC must record the production release profile work')
}

function checkPackageScript() {
  if (files.packageJson.scripts?.['check:release-profile'] !== 'node scripts/check-release-profile.mjs') {
    errors.push('package.json must expose check:release-profile')
  }
}

function assertAllIncludes(source, expectedValues, message) {
  const missing = expectedValues.filter((expected) => !source.includes(expected))
  if (missing.length) errors.push(`${message}: missing ${missing.map((value) => `"${value}"`).join(', ')}`)
}
