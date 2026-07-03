export interface TextMemoryPromptInput {
  inputText: string
  contentType: string
  scenePreference: string
  templates: unknown
}

export function buildTextMemoryPrompt(input: TextMemoryPromptInput) {
  return `你是专业记忆宫殿设计专家。请把用户输入文本拆解成适合图像记忆的严格 JSON。

任务：
1. 判断内容类型：ancient_text 或 modern_text。
2. 根据文本长度拆分 3 到 12 个核心记忆点。
3. 为每个记忆点选择 memoryMethod：meaning、homophone、glyph、action、emotion、logic、mixed。
4. 为每个记忆点生成具体可画的 visualObject。
5. 根据模板列表选择 templateId。
6. 从模板 anchors 中选择 anchorKey，不能编造，不能重复。
7. 只输出 JSON，不要 Markdown，不要解释性废话。

输入内容：
${input.inputText}

用户选择内容类型：
${input.contentType}

用户场景偏好：
${input.scenePreference}

可用模板：
${JSON.stringify(input.templates)}

输出格式：
{
  "title": "string",
  "contentType": "ancient_text | modern_text",
  "templateId": "string",
  "points": [
    {
      "id": 1,
      "originalText": "string",
      "keyword": "string",
      "memoryMethod": "meaning | homophone | glyph | action | emotion | logic | mixed",
      "visualObject": "string",
      "reason": "string",
      "anchorKey": "string",
      "label": "string"
    }
  ],
  "explanation": "string",
  "recitationHint": "string"
}`
}
