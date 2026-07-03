import { BadRequestException } from '@nestjs/common'

const blockedPatterns = [/暴恐|色情|自杀|自残|毒品|赌博|诈骗|枪支|炸药/, /宗教符号|政治符号|违法犯罪/]

export function assertSafeLearningContent(text: string) {
  if (blockedPatterns.some((pattern) => pattern.test(text))) {
    throw new BadRequestException({
      code: 'CONTENT_BLOCKED',
      message: '该内容暂不支持生成，请更换学习内容。',
    })
  }
}
