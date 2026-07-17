import type { Comment } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function fetchComments(): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/api/comments`)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }
  return res.json()
}
