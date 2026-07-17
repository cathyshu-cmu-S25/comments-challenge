import { useState } from 'react'
import { createComment } from '../api'
import type { Comment } from '../types'

export function AddComment({ onAdded }: { onAdded: (comment: Comment) => void }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || submitting) return

    setSubmitting(true)
    setError(null)
    try {
      const comment = await createComment(text.trim())
      onAdded(comment)
      setText('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 border-b border-gray-100 pb-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment as Admin..."
        rows={2}
        className="w-full resize-none rounded-lg border border-gray-200 p-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="ml-auto shrink-0 rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {submitting ? 'Posting…' : 'Comment'}
        </button>
      </div>
    </form>
  )
}
