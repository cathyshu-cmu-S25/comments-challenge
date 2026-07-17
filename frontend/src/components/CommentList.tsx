import type { Comment } from '../types'
import { CommentCard } from './CommentCard'

export function CommentList({
  comments,
  onUpdated,
  onDeleted,
}: {
  comments: Comment[]
  onUpdated: (comment: Comment) => void
  onDeleted: (id: number) => void
}) {
  if (comments.length === 0) {
    return <p className="py-8 text-center text-gray-400">No comments yet.</p>
  }

  return (
    <div className="divide-y divide-gray-100">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} onUpdated={onUpdated} onDeleted={onDeleted} />
      ))}
    </div>
  )
}
