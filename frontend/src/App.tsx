import { useEffect, useState } from 'react'
import { fetchComments } from './api'
import { AddComment } from './components/AddComment'
import { CommentList } from './components/CommentList'
import type { Comment } from './types'

function App() {
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastAddedId, setLastAddedId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchComments()
      .then((data) => {
        if (!cancelled) setComments(data)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (lastAddedId === null) return
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
  }, [lastAddedId])

  function handleAdded(comment: Comment) {
    setComments((prev) => [...(prev ?? []), comment])
    setLastAddedId(comment.id)
  }

  function handleUpdated(updated: Comment) {
    setComments((prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? prev)
  }

  function handleDeleted(id: number) {
    setComments((prev) => prev?.filter((c) => c.id !== id) ?? prev)
  }

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10 pb-28">
        <h1 className="text-2xl font-semibold text-gray-900">Comments</h1>

        {error && <p className="py-8 text-center text-red-600">Failed to load comments: {error}</p>}
        {!error && comments === null && (
          <p className="py-8 text-center text-gray-400">Loading comments…</p>
        )}
        {!error && comments !== null && (
          <CommentList comments={comments} onUpdated={handleUpdated} onDeleted={handleDeleted} />
        )}
      </div>

      <AddComment onAdded={handleAdded} />
    </>
  )
}

export default App
