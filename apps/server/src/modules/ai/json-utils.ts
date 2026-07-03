import { BadRequestException } from '@nestjs/common'

export function parseStrictJson<T>(content: string): T {
  const trimmed = content.trim()
  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  const start = withoutFence.indexOf('{')
  const end = withoutFence.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new BadRequestException({ code: 'AI_JSON_INVALID', message: 'LLM 未返回 JSON 对象' })
  }

  try {
    return JSON.parse(withoutFence.slice(start, end + 1)) as T
  } catch {
    throw new BadRequestException({ code: 'AI_JSON_INVALID', message: 'LLM JSON 解析失败' })
  }
}

export function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException({ code: 'AI_SCHEMA_INVALID', message: `LLM 字段缺失或非法：${field}` })
  }
  return value
}

export function requireArray<T>(value: unknown, field: string) {
  if (!Array.isArray(value)) {
    throw new BadRequestException({ code: 'AI_SCHEMA_INVALID', message: `LLM 字段必须是数组：${field}` })
  }
  return value as T[]
}
