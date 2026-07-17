import type { Comment } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }
  return res.json()
}

export function fetchComments(): Promise<Comment[]> {
  return request('/api/comments')
}

export function createComment(text: string): Promise<Comment> {
  return request('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}

export function updateComment(id: number, text: string): Promise<Comment> {
  return request(`/api/comments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}

export function deleteComment(id: number): Promise<Comment> {
  return request(`/api/comments/${id}`, { method: 'DELETE' })
}
