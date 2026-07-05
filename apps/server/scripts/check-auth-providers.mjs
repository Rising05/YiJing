import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const serverRoot = resolve(scriptDir, '..')
const repoRoot = resolve(serverRoot, '../..')

const files = {
  controller: read('apps/server/src/modules/auth/auth.controller.ts'),
  service: read('apps/server/src/modules/auth/auth.service.ts'),
  smsDto: read('apps/server/src/modules/auth/dto/sms-auth.dto.ts'),
  wechatDto: read('apps/server/src/modules/auth/dto/wechat-login.dto.ts'),
  sharedErrors: read('packages/shared/src/errors.ts'),
  smokeApi: read('apps/server/scripts/smoke-api.mjs'),
}

const requirements = [
  [files.controller.includes("@Post('test-login')"), 'test login endpoint must remain available for MVP'],
  [files.controller.includes("@Post('sms-code')"), 'SMS code endpoint placeholder is missing'],
  [files.controller.includes("@Post('sms-login')"), 'SMS login endpoint placeholder is missing'],
  [files.controller.includes("@Post('wechat-login')"), 'WeChat login endpoint placeholder is missing'],
  [files.service.includes('throwAuthProviderNotConfigured'), 'formal auth endpoints must share an explicit not-configured guard'],
  [files.service.includes('ServiceUnavailableException'), 'formal auth placeholders must fail with an HTTP error, not silently succeed'],
  [countOccurrences(files.service, 'FEATURE_NOT_CONFIGURED') === 1, 'formal auth placeholders must emit FEATURE_NOT_CONFIGURED from one helper'],
  [files.smsDto.includes('class SendSmsCodeDto') && files.smsDto.includes('class SmsLoginDto'), 'SMS auth DTOs are missing'],
  [files.wechatDto.includes('class WechatLoginDto'), 'WeChat login DTO is missing'],
  [files.sharedErrors.includes("FEATURE_NOT_CONFIGURED: 'FEATURE_NOT_CONFIGURED'"), 'shared ErrorCode is missing FEATURE_NOT_CONFIGURED'],
  [files.sharedErrors.includes('[ErrorCode.FEATURE_NOT_CONFIGURED]'), 'shared ErrorLabels is missing FEATURE_NOT_CONFIGURED'],
  [files.smokeApi.includes("'/auth/sms-code'") && files.smokeApi.includes("'/auth/sms-login'") && files.smokeApi.includes("'/auth/wechat-login'"), 'API smoke must cover disabled formal auth endpoints'],
]

const failures = requirements.filter(([passed]) => !passed).map(([, message]) => message)
if (failures.length) {
  for (const failure of failures) console.error(`auth-providers: ${failure}`)
  process.exit(1)
}

console.log('auth-providers: test login and disabled formal auth placeholders are covered')

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

function countOccurrences(source, needle) {
  return source.split(needle).length - 1
}
