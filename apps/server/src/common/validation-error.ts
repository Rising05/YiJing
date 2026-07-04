import { BadRequestException } from '@nestjs/common'
import { ValidationError } from 'class-validator'

interface ValidationIssue {
  property: string
  constraints: string[]
}

export function createValidationException(errors: ValidationError[]) {
  const issues = flattenValidationErrors(errors)
  const code = resolveValidationCode(issues)
  return new BadRequestException({
    code,
    message: resolveValidationMessage(code),
    details: issues,
  })
}

function flattenValidationErrors(errors: ValidationError[], parent = ''): ValidationIssue[] {
  return errors.flatMap((error) => {
    const property = parent ? `${parent}.${error.property}` : error.property
    const constraints = Object.keys(error.constraints ?? {})
    const current = constraints.length ? [{ property, constraints }] : []
    return [...current, ...flattenValidationErrors(error.children ?? [], property)]
  })
}

function resolveValidationCode(issues: ValidationIssue[]) {
  if (issues.some((issue) => issue.property === 'inputText' && issue.constraints.includes('maxLength'))) {
    return 'INPUT_TOO_LONG'
  }
  if (issues.some((issue) => issue.property === 'words' && issue.constraints.includes('arrayMaxSize'))) {
    return 'TOO_MANY_WORDS'
  }
  return 'INVALID_INPUT'
}

function resolveValidationMessage(code: string) {
  if (code === 'INPUT_TOO_LONG') return '文本最多 500 字，请缩短后再生成。'
  if (code === 'TOO_MANY_WORDS') return '一次最多 30 个单词或短语，请减少输入。'
  return '输入内容格式不正确，请检查后重试。'
}
