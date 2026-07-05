import type { GenerationResult, MemoryPalaceResult, TextMemoryRequest, WordCardRequest, WordCardResult } from '../types'

const API_BASE_URL = getApiBaseUrl()

interface LoginResponse {
  token: string
  user: {
    id: string
    nickname: string
    phone: string
    remainingCredits?: number
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code = 'API_ERROR',
    readonly status = 0,
  ) {
    super(message)
  }
}

export function getApiBaseUrl(env: ImportMetaEnv = import.meta.env) {
  const configured = env.VITE_API_BASE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  if (env.DEV) return 'http://localhost:3000/api'
  return ''
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('服务端 API 地址未配置，请检查发布环境。', 'API_BASE_URL_MISSING', 0)
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(body?.message ?? '请求失败', body?.code, response.status)
  }
  return body as T
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export function testLogin(phone: string, code: string) {
  return request<LoginResponse>('/auth/test-login', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })
}

export function createTextMemory(token: string, payload: TextMemoryRequest) {
  return request<MemoryPalaceResult>('/generation/text-memory', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function createWordCard(token: string, payload: WordCardRequest) {
  return request<WordCardResult>('/generation/word-card', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function regenerateGeneration(token: string, id: string) {
  return request<GenerationResult>(`/generation/${id}/regenerate`, {
    method: 'POST',
    headers: authHeaders(token),
  })
}

export function fetchHistory(token: string) {
  return request<Array<Pick<GenerationResult, 'id' | 'type' | 'title' | 'templateId' | 'backgroundImageUrl' | 'createdAt' | 'expiresAt' | 'isFavorite'>>>('/history', {
    headers: authHeaders(token),
  })
}

export function fetchHistoryDetail(token: string, id: string) {
  return request<GenerationResult>(`/history/${id}`, {
    headers: authHeaders(token),
  })
}

export function deleteHistory(token: string, id: string) {
  return request<{ ok: true }>(`/history/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export function toggleHistoryFavorite(token: string, id: string) {
  return request<Pick<GenerationResult, 'id' | 'type' | 'title' | 'templateId' | 'backgroundImageUrl' | 'createdAt' | 'expiresAt' | 'isFavorite'>>(`/history/${id}/favorite`, {
    method: 'PATCH',
    headers: authHeaders(token),
  })
}

export function deleteAccount(token: string) {
  return request<{ ok: true }>('/user/me', {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}
