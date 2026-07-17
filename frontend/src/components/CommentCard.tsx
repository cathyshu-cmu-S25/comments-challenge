import { useState } from 'react'
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

export function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3 py-4">
      <Avatar author={comment.author} image={comment.image} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-gray-900">{comment.author}</span>
          <span className="text-sm text-gray-400">{formatDate(comment.date)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap wrap-break-word text-gray-700">{comment.text}</p>
        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M2 10.5a1.5 1.5 0 0 1 1.5-1.5h2v9h-2A1.5 1.5 0 0 1 2 16.5v-6ZM7 18v-8.5l4.5-7a1 1 0 0 1 1.5.87v4.13H16a2 2 0 0 1 1.94 2.5l-1.5 6A2 2 0 0 1 14.5 18H7Z" />
          </svg>
          {comment.likes}
        </div>
      </div>
    </div>
  )
}
