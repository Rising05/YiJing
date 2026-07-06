import { MEMORY_TEMPLATES, TEMPLATE_MAP } from '@memory-palace/shared'
import type { MemoryTemplate } from '../types'

/**
 * 前端模板统一复用 `@memory-palace/shared` 中的 10 个 canonical 模板，
 * 不再维护独立副本，避免与后端 LLM/anchorKey 校验分叉。
 */
export const memoryTemplates: MemoryTemplate[] = MEMORY_TEMPLATES

export function getTemplate(id: string): MemoryTemplate {
  return TEMPLATE_MAP[id] ?? memoryTemplates[0]
}
