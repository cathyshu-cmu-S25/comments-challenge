import { Router, Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";

const router = Router();

type CommentBody = { text?: string };

function isNotFound(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  );
}

function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  return Number(raw);
}

// GET /api/comments — all comments, oldest first
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await prisma.comment.findMany({ orderBy: { date: "asc" } });
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// POST /api/comments — create a comment as "Admin"
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body as CommentBody;
    if (!text?.trim()) {
      res.status(400).json({ error: "text is required" });
      return;
    }
    const comment = await prisma.comment.create({
      data: { author: "Admin", text: text.trim() },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// PUT /api/comments/:id — update text only
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    const { text } = req.body as CommentBody;
    if (!text?.trim()) {
      res.status(400).json({ error: "text is required" });
      return;
    }
    const comment = await prisma.comment.update({
      where: { id },
      data: { text: text.trim() },
    });
    res.json(comment);
  } catch (err) {
    if (isNotFound(err)) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }
    next(err);
  }
});

// DELETE /api/comments/:id
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "id must be a positive integer" });
      return;
    }
    const comment = await prisma.comment.delete({ where: { id } });
    res.status(200).json(comment);
  } catch (err) {
    if (isNotFound(err)) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }
    next(err);
  }
});

export default router;
