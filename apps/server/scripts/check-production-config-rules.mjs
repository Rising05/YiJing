import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const checkerPath = resolve(scriptDir, 'check-runtime-config.mjs')
const tempDir = mkdtempSync(join(tmpdir(), 'yijing-production-config-'))

try {
  const validEnvPath = writeEnv('valid.env', {
    DATABASE_URL: 'mysql://yijing:yijing@db.internal:3306/yijing',
    JWT_SECRET: 'ci-production-secret-with-at-least-thirty-two-characters',
    PORT: '3000',
    NODE_ENV: 'production',
    ALLOWED_ORIGINS: 'https://app.example.com,capacitor://localhost',
    AUTH_FORMAL_PROVIDERS: 'none',
    AI_MOCK_MODE: 'false',
    LLM_BASE_URL: 'https://api.deepseek.com/v1',
    LLM_API_KEY: 'ci_llm_key_not_real_for_rule_test',
    LLM_MODEL: 'deepseek-chat',
    LLM_JSON_RETRY_COUNT: '1',
    IMAGE_MOCK_MODE: 'false',
    WANX_BASE_URL: 'https://dashscope.aliyuncs.com',
    WANX_API_KEY: 'ci_wanx_key_not_real_for_rule_test',
    WANX_MODEL: 'wan2.6-t2i',
    WANX_SIZE: '960*1696',
    STORAGE_PROVIDER: 'local',
    LOCAL_STORAGE_DIR: 'uploads/generated-images',
    PUBLIC_BASE_URL: 'https://example.com',
  })
  expectStatus(validEnvPath, 0, 'valid production config')

  const formalAuthEnvPath = writeEnv('formal-auth.env', {
    DATABASE_URL: 'mysql://yijing:yijing@db.internal:3306/yijing',
    JWT_SECRET: 'ci-production-secret-with-at-least-thirty-two-characters',
    PORT: '3000',
    NODE_ENV: 'production',
    ALLOWED_ORIGINS: 'https://app.example.com,capacitor://localhost',
    AUTH_FORMAL_PROVIDERS: 'sms,wechat',
    SMS_PROVIDER: 'aliyun',
    SMS_ENDPOINT: 'https://dysmsapi.aliyuncs.com',
    SMS_ACCESS_KEY_ID: 'ci_sms_access_key_id',
    SMS_ACCESS_KEY_SECRET: 'ci_sms_access_key_secret',
    SMS_SIGN_NAME: '忆境',
    SMS_TEMPLATE_CODE: 'SMS_123456789',
    WECHAT_APP_ID: 'wx1234567890abcdef',
    WECHAT_APP_SECRET: 'ci_wechat_app_secret',
    WECHAT_UNIVERSAL_LINK: 'https://app.example.com/wechat/',
    AI_MOCK_MODE: 'false',
    LLM_BASE_URL: 'https://api.deepseek.com/v1',
    LLM_API_KEY: 'ci_llm_key_not_real_for_rule_test',
    LLM_MODEL: 'deepseek-chat',
    LLM_JSON_RETRY_COUNT: '1',
    IMAGE_MOCK_MODE: 'false',
    WANX_BASE_URL: 'https://dashscope.aliyuncs.com',
    WANX_API_KEY: 'ci_wanx_key_not_real_for_rule_test',
    WANX_MODEL: 'wan2.6-t2i',
    WANX_SIZE: '960*1696',
    STORAGE_PROVIDER: 'local',
    LOCAL_STORAGE_DIR: 'uploads/generated-images',
    PUBLIC_BASE_URL: 'https://example.com',
  })
  expectStatus(formalAuthEnvPath, 0, 'formal auth production config')

  const unsafeFormalAuthEnvPath = writeEnv('unsafe-formal-auth.env', {
    DATABASE_URL: 'mysql://yijing:yijing@db.internal:3306/yijing',
    JWT_SECRET: 'ci-production-secret-with-at-least-thirty-two-characters',
    PORT: '3000',
    NODE_ENV: 'production',
    ALLOWED_ORIGINS: 'https://app.example.com,capacitor://localhost',
    AUTH_FORMAL_PROVIDERS: 'sms,wechat',
    AI_MOCK_MODE: 'false',
    LLM_BASE_URL: 'https://api.deepseek.com/v1',
    LLM_API_KEY: 'ci_llm_key_not_real_for_rule_test',
    LLM_MODEL: 'deepseek-chat',
    IMAGE_MOCK_MODE: 'false',
    WANX_BASE_URL: 'https://dashscope.aliyuncs.com',
    WANX_API_KEY: 'ci_wanx_key_not_real_for_rule_test',
    WANX_MODEL: 'wan2.6-t2i',
    WANX_SIZE: '960*1696',
    STORAGE_PROVIDER: 'local',
    LOCAL_STORAGE_DIR: 'uploads/generated-images',
    PUBLIC_BASE_URL: 'https://example.com',
  })
  expectStatus(unsafeFormalAuthEnvPath, 1, 'unsafe formal auth production config')

  const unsafeEnvPath = writeEnv('unsafe.env', {
    DATABASE_URL: 'mysql://yijing:yijing@localhost:3307/yijing',
    JWT_SECRET: 'replace-with-a-long-random-secret',
    PORT: '3000',
    NODE_ENV: 'production',
    ALLOWED_ORIGINS: '*',
    AUTH_FORMAL_PROVIDERS: 'none',
    AI_MOCK_MODE: 'true',
    LLM_BASE_URL: 'https://api.deepseek.com/v1',
    LLM_API_KEY: '',
    LLM_MODEL: 'deepseek-chat',
    IMAGE_MOCK_MODE: 'true',
    WANX_BASE_URL: 'https://dashscope.aliyuncs.com',
    WANX_API_KEY: '',
    WANX_MODEL: 'wan2.6-t2i',
    WANX_SIZE: '960*1696',
    STORAGE_PROVIDER: 'none',
    PUBLIC_BASE_URL: 'http://localhost:3000',
  })
  expectStatus(unsafeEnvPath, 1, 'unsafe production config')

  console.log('production-config-rules: valid, formal auth, and unsafe fail checks passed')
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}

function writeEnv(fileName, values) {
  const filePath = join(tempDir, fileName)
  const body = Object.entries(values)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('\n')
  writeFileSync(filePath, `${body}\n`)
  return filePath
}

function expectStatus(envFile, expectedStatus, label) {
  const result = spawnSync(process.execPath, [checkerPath, '--production'], {
    env: { ...process.env, ENV_FILE: envFile },
    encoding: 'utf8',
  })
  if (result.status !== expectedStatus) {
    console.error(result.stdout)
    console.error(result.stderr)
    throw new Error(`${label} exited with ${result.status}, expected ${expectedStatus}`)
  }
}
