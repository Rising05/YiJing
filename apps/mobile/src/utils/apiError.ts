import { ErrorCode, ErrorLabels, type ErrorCodeType } from '@memory-palace/shared'
import { ApiError } from '../services/api'

const localErrorLabels: Record<string, string> = {
  INSUFFICIENT_CREDITS: ErrorLabels[ErrorCode.QUOTA_EXCEEDED],
}

export function getUserFacingErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) return fallback
  if (isKnownErrorCode(error.code)) return ErrorLabels[error.code]
  return localErrorLabels[error.code] ?? error.message ?? fallback
}

export function shouldOpenAuthForError(error: unknown) {
  return error instanceof ApiError && error.code === ErrorCode.UNAUTHORIZED
}

function isKnownErrorCode(code: string): code is ErrorCodeType {
  return Object.values(ErrorCode).includes(code as ErrorCodeType)
}
