import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []

const files = {
  checklist: read('docs/release/MAINLAND_RELEASE_CHECKLIST.md'),
  readme: read('README.md'),
  spec: read('SPEC.md'),
  packageJson: JSON.parse(read('package.json') || '{}'),
}

checkChecklist()
checkReferences()
checkPackageScript()

if (errors.length) {
  for (const error of errors) console.error(`mainland-release-checklist: ${error}`)
  process.exit(1)
}

console.log('mainland-release-checklist: release checklist, references, and script entry passed')

function read(relativePath) {
  const filePath = resolve(repoRoot, relativePath)
  if (!existsSync(filePath)) {
    errors.push(`${relativePath} is required`)
    return ''
  }
  return readFileSync(filePath, 'utf8')
}

function checkChecklist() {
  assertAllIncludes(files.checklist, [
    '# 中国大陆发布准备清单',
    '不是法律意见',
    '状态枚举',
    '## 1. 产品与品牌',
    '## 2. 账号与登录',
    '## 3. 合规与用户权利',
    '## 4. AI、图片与数据',
    '## 5. 云服务器、域名与备案',
    '## 6. 原生打包',
    '## 7. 发布前建议验证命令',
    '| 项目 | 状态 | Owner | 证据/下一步 |',
    '正式 App 名称',
    '正式 logo',
    '生产发布资料表',
    '手机号短信登录',
    '微信移动 App 登录',
    '隐私政策 MVP 草稿',
    '用户协议 MVP 草稿',
    '正式法律审核',
    'AI 学习辅助免责声明',
    '删除账号入口',
    '清除缓存入口',
    '30 天图片保存策略',
    '内容安全规则',
    '敏感权限最小化',
    '无广告/无追踪 SDK',
    '真实 LLM Key 验证',
    '真实通义万相验证',
    '对象存储最终供应商',
    '生产脱敏',
    '生产 Docker 骨架',
    'Nginx HTTPS 反向代理模板',
    '公网域名',
    'HTTPS 证书',
    'ICP 备案',
    'App 备案',
    '公安联网备案',
    '软著',
    'Android APK/AAB 构建',
    'iOS 工程',
    'npm run check:mvp',
    'npm run check:release-profile',
    'npm run smoke:api',
    'npm run smoke:live-ai',
    'npm run smoke:ui',
    'npm run check:release-env -w apps/mobile -- --strict',
  ], 'docs/release/MAINLAND_RELEASE_CHECKLIST.md must keep the release handoff checklist complete')
}

function checkReferences() {
  assertAllIncludes(files.readme, [
    'docs/release/MAINLAND_RELEASE_CHECKLIST.md',
    'npm run check:mainland-release',
  ], 'README must link the mainland release checklist and command')
  assertAllIncludes(files.spec, [
    '大陆发布准备清单',
    'docs/release/MAINLAND_RELEASE_CHECKLIST.md',
    'check:mainland-release',
  ], 'SPEC must record the mainland release checklist work')
}

function checkPackageScript() {
  if (files.packageJson.scripts?.['check:mainland-release'] !== 'node scripts/check-mainland-release-checklist.mjs') {
    errors.push('package.json must expose check:mainland-release')
  }
}

function assertAllIncludes(source, expectedValues, message) {
  const missing = expectedValues.filter((expected) => !source.includes(expected))
  if (missing.length) errors.push(`${message}: missing ${missing.map((value) => `"${value}"`).join(', ')}`)
}
