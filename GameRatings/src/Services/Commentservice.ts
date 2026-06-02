import type { Comment } from "../Interfaces/comment";

const API_URL = "http://localhost:3001/comments";

export async function getComments(): Promise<Comment[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Nem sikerült betölteni a kommenteket.");
  }

  return response.json() as Promise<Comment[]>;
}

export async function getCommentsByGameId(gameId: string): Promise<Comment[]> {
  const response = await fetch(`${API_URL}?gameId=${gameId}`);

  if (!response.ok) {
    throw new Error("Nem sikerült betölteni a kommenteket.");
  }

  return response.json() as Promise<Comment[]>;
}

export async function createComment(comment: Comment): Promise<Comment> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comment),
  });

  if (!response.ok) {
    throw new Error("Nem sikerült létrehozni a kommentet.");
  }

  return response.json() as Promise<Comment>;
}

export async function updateComment(id: string, content: string, rating: number): Promise<Comment> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: content, rating: rating }),
  });

  if (!response.ok) {
    throw new Error("Nem sikerült módosítani a kommentet.");
  }

  return response.json() as Promise<Comment>;
}

export async function deleteComment(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Nem sikerült törölni a kommentet.");
  }
}
