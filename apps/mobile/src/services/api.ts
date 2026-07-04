import type { GenerationResult, MemoryPalaceResult, TextMemoryRequest, WordCardRequest, WordCardResult } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
  return request<Array<Pick<GenerationResult, 'id' | 'type' | 'title' | 'templateId' | 'createdAt' | 'expiresAt' | 'isFavorite'>>>('/history', {
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
  return request<Pick<GenerationResult, 'id' | 'type' | 'title' | 'templateId' | 'createdAt' | 'expiresAt' | 'isFavorite'>>(`/history/${id}/favorite`, {
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
