import { ApiError } from './api'

export function canUseLocalMockFallback(env: ImportMetaEnv = import.meta.env) {
  return Boolean(env.DEV)
}

export function assertLocalMockFallbackAllowed() {
  if (!canUseLocalMockFallback()) {
    throw new ApiError('当前发布环境需要连接服务端后才能继续，请稍后重试。', 'API_BASE_URL_MISSING')
  }
}
