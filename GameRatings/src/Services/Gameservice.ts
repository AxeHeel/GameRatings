import type { Game } from "../Interfaces/game";

const API_URL = "http://localhost:3001/games";

export async function getGames(): Promise<Game[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Nem sikerült betölteni a játékokat.");
  }

  return response.json() as Promise<Game[]>;
}

export async function getGameById(id: string): Promise<Game> {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Nem található a játék.");
  }

  return response.json() as Promise<Game>;
}

export async function createGame(game: Game): Promise<Game> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });

  if (!response.ok) {
    throw new Error("Nem sikerült létrehozni a játékot.");
  }

  return response.json() as Promise<Game>;
}

export async function updateGame(game: Game): Promise<Game> {
  const response = await fetch(`${API_URL}/${game.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });

  if (!response.ok) {
    throw new Error("Nem sikerült módosítani a játékot.");
  }

  return response.json() as Promise<Game>;
}

export async function deleteGame(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Nem sikerült törölni a játékot.");
  }
}
