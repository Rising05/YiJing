// ============================================================================
// Section 15: Unified error codes and response shape
// ============================================================================

export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INPUT_TOO_LONG: 'INPUT_TOO_LONG',
  TOO_MANY_WORDS: 'TOO_MANY_WORDS',
  CONTENT_BLOCKED: 'CONTENT_BLOCKED',
  TEMPLATE_CAPACITY_EXCEEDED: 'TEMPLATE_CAPACITY_EXCEEDED',
  AI_JSON_INVALID: 'AI_JSON_INVALID',
  IMAGE_GENERATION_FAILED: 'IMAGE_GENERATION_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode]

export interface ApiErrorResponse {
  code: ErrorCodeType
  message: string
  details?: Record<string, unknown>
}

/** Human-readable error labels for each code (for UI display). */
export const ErrorLabels: Record<ErrorCodeType, string> = {
  [ErrorCode.UNAUTHORIZED]: '未登录，请先登录',
  [ErrorCode.INPUT_TOO_LONG]: '输入内容过长，请缩短',
  [ErrorCode.TOO_MANY_WORDS]: '单词数量过多，请减少',
  [ErrorCode.CONTENT_BLOCKED]: '内容暂不支持，请更换学习内容',
  [ErrorCode.TEMPLATE_CAPACITY_EXCEEDED]: '内容超出模板容量，请减少输入',
  [ErrorCode.AI_JSON_INVALID]: 'AI 响应异常，请重试',
  [ErrorCode.IMAGE_GENERATION_FAILED]: '图片生成失败，请重试',
  [ErrorCode.EXPORT_FAILED]: '导出失败，请重试',
  [ErrorCode.INVALID_INPUT]: '输入不符合要求，请检查',
  [ErrorCode.QUOTA_EXCEEDED]: '生成次数已用完',
  [ErrorCode.NOT_FOUND]: '未找到相关内容',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误，请稍后再试',
}
