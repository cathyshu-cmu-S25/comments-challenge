# Comments

A small full-stack comment system (like a YouTube/Reddit comment thread) with full CRUD: list, add, edit, and delete comments.

## Stack

- **Backend:** Node.js + Express + TypeScript, Prisma ORM
- **Database:** Supabase, used only as managed PostgreSQL (connected via a Postgres connection string through Prisma — not the Supabase Data API / `supabase-js`)
- **Frontend:** Vite + React + TypeScript + Tailwind CSS
- **Structure:** monorepo, `backend/` and `frontend/` as independent npm projects

Request flow:

`React (Vite dev server)` → `Express REST API` → `Prisma` → `Supabase Postgres`

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your Supabase connection strings
npx prisma db push     # create the Comment table
npm run seed            # load prisma/comments.json into the DB
npm run dev              # starts the API on http://localhost:3001
```

`.env` needs two connection strings from your Supabase project's connection settings:
- `DATABASE_URL` — the transaction pooler (port 6543), used by the app at runtime
- `DIRECT_URL` — the session pooler or direct connection (port 5432), used for `prisma db push`/migrations

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:3001, adjust if needed
npm run dev              # starts the app on http://localhost:5173
```

With both running, open `http://localhost:5173`.

## API

| Method | Route                | Description                          |
| ------ | --------------------- | ------------------------------------- |
| GET    | `/api/comments`      | List all comments, sorted by date ascending (oldest first) |
| POST   | `/api/comments`      | Create a comment (author is always `"Admin"`) |
| PUT    | `/api/comments/:id`  | Edit a comment's text                |
| DELETE | `/api/comments/:id`  | Delete a comment                     |

`GET /api/comments` sorts ascending (oldest first) to preserve the original thread order.

All responses are JSON. `DELETE` returns `200` with the deleted comment (rather than the conventional `204 No Content`) — a deliberate choice to keep every endpoint returning JSON, and returning the deleted object leaves room for an undo feature on the frontend.

Errors return `400` (bad input, e.g. empty text or a non-numeric `:id`) or `404` (comment not found) with `{ "error": "..." }`.

## Tech choices & why

- **Prisma 6, not 7** — Prisma 7 moved config out of `schema.prisma` into a separate `prisma.config.ts`. Staying on 6 keeps the `datasource` block (with `url` + `directUrl`) as the single source of config; Prisma 7's new config system adds indirection this project doesn't benefit from.
- **Supabase as plain Postgres** — the Data API is disabled on purpose; Prisma talks to Supabase over the standard Postgres wire protocol, so Supabase is just a hosted database here, not a backend framework.
- **No ORM abstraction beyond Prisma itself** — no repository/service layer. With four endpoints, `prisma.comment.*` calls directly in the route handlers are easier to read than an indirection layer that hides where the actual query happens.
- **No React Query / SWR** — the app has exactly one `GET` on mount and three mutations that each know precisely how to patch local state (append/replace/filter). A data-fetching library's caching and invalidation machinery isn't earning its keep at this scale.
- **State lives in `App`, not in each component** — `AddComment`, `CommentList`, and `CommentCard` all need to affect the same list, so `App` owns the `comments` array as the single source of truth and passes down callbacks. `CommentCard` keeps its own local UI state (edit text, save/delete-in-flight, inline confirm) since that's private to one card.
- **Tailwind v4 via `@tailwindcss/vite`** — no `tailwind.config.js` or PostCSS setup needed; one plugin line in `vite.config.ts` and one `@import` in CSS.
- **Inline delete confirmation instead of `window.confirm()`** — a native browser dialog can't be styled and blocks the rest of the page while open; an inline "Delete this comment? Yes / Cancel" fits the rest of the UI and is just as safe against accidental clicks.

## What I'd do with more time

- **Pagination or infinite scroll** — right now the API returns every comment in one response, fine for a seed set of 16 but not for a real thread.
- **Optimistic updates** — add/edit/delete currently wait for the server round-trip before updating the UI. Optimistic updates with rollback-on-error would make the UI feel instant.
- **Tests** — backend integration tests (e.g. supertest) covering all four endpoints and their error cases; frontend component tests (React Testing Library) for the edit/delete/add flows.
- **Auth** — anyone can currently post, edit, or delete any comment as "Admin." Real accounts plus ownership checks (can only edit/delete your own comments) would be the next step.
- **Nested replies / threading**, matching the YouTube/Reddit-style comment sections this is modeled on.
- **Rate limiting and stricter input validation** — currently only checks that `text` is non-empty; would add a max length and basic abuse protection.
