import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const mobileRoot = resolve(scriptDir, '..')
const errors = []

const files = {
  app: readSource('src/App.tsx'),
  settings: readSource('src/pages/SettingsPage.tsx'),
  privacy: readSource('src/pages/PrivacyPage.tsx'),
  terms: readSource('src/pages/TermsPage.tsx'),
  about: readSource('src/pages/AboutPage.tsx'),
  aiDisclaimer: readSource('src/components/AiDisclaimer.tsx'),
  textMemory: readSource('src/pages/TextMemoryPage.tsx'),
  wordCard: readSource('src/pages/WordCardPage.tsx'),
  result: readSource('src/pages/GenerateResultPage.tsx'),
}

checkRoutesAndEntrypoints()
checkAiDisclaimer()
checkPrivacyPolicy()
checkTerms()
checkDisclaimerUsage()

if (errors.length) {
  for (const error of errors) console.error(`compliance-copy: ${error}`)
  process.exit(1)
}

console.log('compliance-copy: privacy, terms, AI disclaimer, and settings entry checks passed')

function readSource(relativePath) {
  return readFileSync(resolve(mobileRoot, relativePath), 'utf8')
}

function checkRoutesAndEntrypoints() {
  assertIncludes(files.app, 'path="/privacy"', 'App must expose a privacy policy route')
  assertIncludes(files.app, 'path="/terms"', 'App must expose a terms route')
  assertIncludes(files.app, 'path="/about"', 'App must expose an about route')

  assertIncludes(files.settings, 'to="/privacy"', 'Settings must link to privacy policy')
  assertIncludes(files.settings, 'to="/terms"', 'Settings must link to terms')
  assertIncludes(files.settings, 'to="/about"', 'Settings must link to about page')
  assertIncludes(files.settings, 'settings-clear-cache-button', 'Settings must keep clear-cache action visible')
  assertIncludes(files.settings, 'settings-delete-account-button', 'Settings must keep delete-account action visible')
  assertIncludes(files.settings, '删除账号与历史数据', 'Delete-account copy must mention history data')
}

function checkAiDisclaimer() {
  assertAllIncludes(files.aiDisclaimer, [
    'AI 生成内容仅供学习辅助',
    '可能存在不准确或不完整',
    '教材',
    '课堂内容',
    '权威资料',
    '自行核对',
  ], 'AI disclaimer must keep learning-assist and accuracy warning copy')
}

function checkPrivacyPolicy() {
  assertAllIncludes(files.privacy, [
    '隐私政策',
    'MVP 草稿',
    '正式发布前需法律审核',
    '登录信息',
    '学习内容',
    '生成记录',
    '本机数据',
    '不会在用户登录或同意前采集非必要设备信息',
    '30 天',
    '删除账号',
    '清除',
    '定位',
    '通讯录',
    '麦克风',
    '相机',
    '短信',
    '通知',
    '跟踪权限',
    'API Key',
    '后端环境变量',
    '第三方服务',
    '未成年人',
    '宗教/政治符号',
    '中国大陆法律法规',
    'AI 生成内容仅用于学习辅助',
  ], 'Privacy policy must keep MVP data, deletion, permission, minor, and China compliance copy')
}

function checkTerms() {
  assertAllIncludes(files.terms, [
    '用户协议',
    'MVP 草稿',
    '正式发布前需法律审核',
    '测试手机号和固定验证码登录',
    '生成额度',
    '每次成功都会消耗 1 次',
    '用户必须登录后才能生成内容',
    '著作权',
    '隐私权',
    '名誉权',
    '内容安全校验',
    '宗教/政治符号',
    '中国大陆法律法规',
    'AI 生成',
    '不构成标准答案',
    '教材',
    '权威资料',
    'PNG 导出',
    '本地合成',
    '30 天',
    '删除账号',
    '运营主体',
    '联系方式',
    '争议处理',
    '付费规则',
    '法律审核',
  ], 'Terms must keep account, credit, content-safety, AI, export, deletion, and future legal copy')
}

function checkDisclaimerUsage() {
  for (const [label, source] of [
    ['TextMemoryPage', files.textMemory],
    ['WordCardPage', files.wordCard],
    ['GenerateResultPage', files.result],
    ['AboutPage', files.about],
  ]) {
    assertIncludes(source, "import AiDisclaimer from '../components/AiDisclaimer'", `${label} must import AiDisclaimer`)
    assertIncludes(source, '<AiDisclaimer', `${label} must render AiDisclaimer`)
  }
}

function assertAllIncludes(source, expectedValues, message) {
  const missing = expectedValues.filter((expected) => !source.includes(expected))
  if (missing.length) errors.push(`${message}: missing ${missing.map((value) => `"${value}"`).join(', ')}`)
}

function assertIncludes(source, expected, message) {
  if (!source.includes(expected)) errors.push(message)
}
