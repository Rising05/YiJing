export interface ImagePromptInput {
  templateScenePrompt: string
  visualObjects: string[]
  anchorDescriptions: string[]
}

export const imagePromptEnglishRequirements =
  'vertical 9:16, clean composition, bright and clear, suitable for a learning app, no text, no Chinese characters, no English letters, no numbers, no labels, no watermark, no UI elements, no religious symbols, no political symbols, leave enough empty space around each object for later label overlay, high quality, not childish, elegant and modern.'

export const imagePromptChineseRequirements =
  '不要出现文字、数字、标签、水印、界面元素、宗教符号、政治符号。'

export function appendImagePromptRequirements(basePrompt: string) {
  return `${basePrompt}

图片要求：
${imagePromptEnglishRequirements}

中文硬性要求：
${imagePromptChineseRequirements}`
}

export function buildImagePrompt(input: ImagePromptInput) {
  return appendImagePromptRequirements(`${input.templateScenePrompt}

记忆物体：
${input.visualObjects.join(', ')}

布局要求：
${input.anchorDescriptions.join('; ')}`)
}
