export interface WordCardPromptInput {
  words: string[]
  theme: string
  cardMode: string
  templates: unknown
}

export function buildWordCardPrompt(input: WordCardPromptInput) {
  return `你是英语单词图像记忆卡片设计专家。请为用户输入的单词或短语生成严格 JSON。

任务：
1. 判断整体主题。
2. 为每个词补充 partOfSpeech、phonetic、chinese、example、wordType、visualObject、memoryHint。
3. 根据主题选择 templateId。
4. 从模板 anchors 中选择 anchorKey，不能编造，不能重复。
5. 只输出 JSON，不要 Markdown。

用户单词：
${input.words.join(', ')}

用户主题选择：
${input.theme}

卡片模式：
${input.cardMode}

可用模板：
${JSON.stringify(input.templates)}

输出格式：
{
  "title": "string",
  "templateId": "string",
  "words": [
    {
      "id": 1,
      "word": "string",
      "partOfSpeech": "string",
      "phonetic": "string",
      "chinese": "string",
      "example": "string",
      "wordType": "concrete | abstract | action | emotion | scene",
      "visualObject": "string",
      "memoryHint": "string",
      "anchorKey": "string"
    }
  ]
}`
}
