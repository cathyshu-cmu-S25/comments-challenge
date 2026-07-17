import { useState } from 'react'
import { deleteComment, updateComment } from '../api'
import type { Comment } from '../types'

const AVATAR_COLORS = [
  'bg-rose-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-sky-400',
  'bg-indigo-400',
  'bg-fuchsia-400',
]

function avatarColor(name: string): string {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function Avatar({ author, image }: { author: string; image: string }) {
  const [imgFailed, setImgFailed] = useState(false)

  if (image && !imgFailed) {
    return (
      <img
        src={image}
        alt={author}
        onError={() => setImgFailed(true)}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    )
  }

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white ${avatarColor(author)}`}
    >
      {author.charAt(0).toUpperCase()}
    </div>
  )
}

type Mode = 'view' | 'edit' | 'confirmDelete'

export function CommentCard({
  comment,
  onUpdated,
  onDeleted,
}: {
  comment: Comment
  onUpdated: (comment: Comment) => void
  onDeleted: (id: number) => void
}) {
  const [mode, setMode] = useState<Mode>('view')
  const [text, setText] = useState(comment.text)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEdit() {
    setText(comment.text)
    setError(null)
    setMode('edit')
  }

  function cancelEdit() {
    setError(null)
    setMode('view')
  }

  async function handleSave() {
    if (!text.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const updated = await updateComment(comment.id, text.trim())
      onUpdated(updated)
      setMode('view')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    setError(null)
    try {
      await deleteComment(comment.id)
      onDeleted(comment.id)
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  return (
    <div className="flex gap-3 py-4">
      <Avatar author={comment.author} image={comment.image} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-gray-900">{comment.author}</span>
          <span className="text-sm text-gray-400">{formatDate(comment.date)}</span>
        </div>

        {mode === 'edit' ? (
          <div className="mt-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              autoFocus
              className="w-full resize-none rounded-lg border border-gray-200 p-2 text-gray-900 focus:border-gray-400 focus:outline-none"
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!text.trim() || saving}
                className="rounded-lg bg-gray-900 px-3 py-1 text-sm font-medium text-white disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap wrap-break-word text-gray-700">{comment.text}</p>
        )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M2 10.5a1.5 1.5 0 0 1 1.5-1.5h2v9h-2A1.5 1.5 0 0 1 2 16.5v-6ZM7 18v-8.5l4.5-7a1 1 0 0 1 1.5.87v4.13H16a2 2 0 0 1 1.94 2.5l-1.5 6A2 2 0 0 1 14.5 18H7Z" />
            </svg>
            {comment.likes}
          </span>

          {mode === 'view' && (
            <>
              <button onClick={startEdit} className="hover:text-gray-700">
                Edit
              </button>
              <button onClick={() => setMode('confirmDelete')} className="hover:text-gray-700">
                Delete
              </button>
            </>
          )}

          {mode === 'confirmDelete' && (
            <span className="flex items-center gap-2">
              Delete this comment?
              <button
                onClick={handleDelete}
                disabled={saving}
                className="font-medium text-red-600 hover:text-red-700"
              >
                {saving ? 'Deleting…' : 'Yes'}
              </button>
              <button
                onClick={() => setMode('view')}
                disabled={saving}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
