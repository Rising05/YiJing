import { MEMORY_TEMPLATES, TEMPLATE_MAP } from '../../../../../packages/shared/src/templates'
import type { Anchor, MemoryTemplate } from '../../../../../packages/shared/src/types'

export type AiAnchor = Anchor

export type AiTemplate = Pick<MemoryTemplate, 'id' | 'name' | 'scenePrompt' | 'maxPoints' | 'anchors'>

function toAiTemplate(template: MemoryTemplate): AiTemplate {
  return {
    id: template.id,
    name: template.name,
    scenePrompt: template.scenePrompt,
    maxPoints: template.maxPoints,
    anchors: template.anchors,
  }
}

export const aiTemplates: AiTemplate[] = MEMORY_TEMPLATES.map(toAiTemplate)

export function getAiTemplate(templateId: string) {
  return toAiTemplate(TEMPLATE_MAP[templateId] ?? MEMORY_TEMPLATES[0])
}
