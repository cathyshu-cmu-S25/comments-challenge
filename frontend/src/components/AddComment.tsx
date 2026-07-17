import { useEffect, useRef, useState } from 'react'
import { createComment } from '../api'
import type { Comment } from '../types'

export function AddComment({ onAdded }: { onAdded: (comment: Comment) => void }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [text])

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
    <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl px-4 py-3">
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment as Admin..."
            rows={1}
            className="max-h-48 min-h-10.5 flex-1 resize-none overflow-y-auto rounded-lg border border-gray-200 p-2.5 text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="shrink-0 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {submitting ? 'Posting…' : 'Comment'}
          </button>
        </div>
      </form>
    </div>
  )
}
