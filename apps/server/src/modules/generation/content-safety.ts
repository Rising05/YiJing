import { BadRequestException } from '@nestjs/common'

type SafetyCategory = 'sexual' | 'violence' | 'self_harm' | 'illegal' | 'sensitive_symbol' | 'china_law'

interface ContentSafetyRule {
  category: SafetyCategory
  patterns: RegExp[]
}

export interface ContentSafetyResult {
  safe: boolean
  category?: SafetyCategory
}

const contentSafetyRules: ContentSafetyRule[] = [
  {
    category: 'sexual',
    patterns: [/色情|低俗|裸露|成人内容|成人视频|淫秽/, /\b(porn|nude|nsfw|explicit sex|sexual content)\b/i],
  },
  {
    category: 'violence',
    patterns: [
      /血腥|暴力|暴恐|恐怖袭击|杀人|砍人|屠杀|虐杀|枪支|炸药|爆炸物/,
      /\b(gore|bloody|massacre|terror attack|weapon|gun|bomb|explosive)\b/i,
    ],
  },
  {
    category: 'self_harm',
    patterns: [/自杀|自残|割腕|轻生/, /\b(suicide|self[-\s]?harm|kill myself|cutting myself)\b/i],
  },
  {
    category: 'illegal',
    patterns: [
      /毒品|赌博|诈骗|洗钱|盗号|黑客攻击|犯罪教程|违法犯罪/,
      /\b(drug trafficking|casino|gambling|scam|phishing|money laundering|hack an account)\b/i,
    ],
  },
  {
    category: 'sensitive_symbol',
    patterns: [
      /宗教符号|政治符号|党徽|党旗|政治宣传|竞选海报|纳粹|卐/,
      /\b(religious symbol|political symbol|campaign poster|nazi|swastika)\b/i,
    ],
  },
  {
    category: 'china_law',
    patterns: [/分裂国家|煽动颠覆|暴乱|极端主义|邪教|恐怖主义/],
  },
]

export function evaluateLearningContentSafety(text: string): ContentSafetyResult {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (!normalized) return { safe: true }

  const matchedRule = contentSafetyRules.find((rule) => rule.patterns.some((pattern) => pattern.test(normalized)))
  if (!matchedRule) return { safe: true }

  return { safe: false, category: matchedRule.category }
}

export function assertSafeLearningContent(text: string) {
  if (!evaluateLearningContentSafety(text).safe) {
    throw new BadRequestException({
      code: 'CONTENT_BLOCKED',
      message: '该内容暂不支持生成，请更换学习内容。',
    })
  }
}
