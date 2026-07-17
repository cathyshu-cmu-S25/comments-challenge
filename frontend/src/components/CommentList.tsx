import { useEffect, useState } from 'react'
import { fetchComments } from '../api'
import type { Comment } from '../types'
import { CommentCard } from './CommentCard'

export function CommentList() {
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  if (error) {
    return <p className="py-8 text-center text-red-600">Failed to load comments: {error}</p>
  }

  if (comments === null) {
    return <p className="py-8 text-center text-gray-400">Loading comments…</p>
  }

  if (comments.length === 0) {
    return <p className="py-8 text-center text-gray-400">No comments yet.</p>
  }

  return (
    <div className="divide-y divide-gray-100">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
