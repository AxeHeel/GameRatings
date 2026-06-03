<<<<<<< HEAD
=======
import "./style.css";
import type { Game } from "./Interfaces/game";
import type { Comment } from "./Interfaces/comment";
import { getGames } from "./Services/Gameservice";
import { getComments, createComment, updateComment, deleteComment } from "./Services/Commentservice";

let games: Game[];
let comments: Comment[];
let searchText: string;
let selectedGenre: string;
let sortBy: string;
let sortDirection: string;

const app = document.getElementById("app") as HTMLDivElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const homeLink = document.getElementById("home-link") as HTMLAnchorElement;

function html(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateText: string): string {
  const date = new Date(dateText);
  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getGameIdFromUrl(): string | null {
  const hash = window.location.hash;

  if (!hash.startsWith("#/game/")) {
    return null;
  }

  const id = hash.replace("#/game/", "");

  if (id === "") {
    return null;
  }

  return id;
}

function getCommentsForGame(gameId: string): Comment[] {
  const comments: Comment[] = [];

  for (const comment of comments) {
    if (String(comment.gameId) === gameId) {
      comments.push(comment);
    }
  }

  comments.sort(function (a, b) {
    const firstDate = new Date(a.createdAt).getTime();
    const secondDate = new Date(b.createdAt).getTime();
    return secondDate - firstDate;
  });

  return comments;
}

function getAverageRating(gameId: string): number {
  const comments = getCommentsForGame(gameId);

  if (comments.length === 0) {
    return 0;
  }

  let sum = 0;

  for (const comment of comments) {
    sum += comment.rating;
  }

  return sum / comments.length;
}

function getMyCommentIds(): string[] {
  const savedText = localStorage.getItem("myCommentIds");

  if (savedText === null) {
    return [];
  }

  const savedIds = JSON.parse(savedText) as string[];
  return savedIds;
}

function saveMyCommentId(id: string): void {
  const ids = getMyCommentIds();

  if (!ids.includes(id)) {
    ids.push(id);
  }

  localStorage.setItem("myCommentIds", JSON.stringify(ids));
}

function removeMyCommentId(id: string): void {
  const ids = getMyCommentIds();
  const newIds: string[] = [];

  for (const savedId of ids) {
    if (savedId !== id) {
      newIds.push(savedId);
    }
  }

  localStorage.setItem("myCommentIds", JSON.stringify(newIds));
}

function isMyComment(comment: Comment): boolean {
  const ids = getMyCommentIds();
  return ids.includes(comment.id);
}

function getStars(rating: number): string {
  const roundedRating = Math.round(rating);
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars += "★";
    } else {
      stars += "☆";
    }
  }

  return `<span class="stars">${stars}</span>`;
}

function showMessage(message: string): void {
  const oldMessage = document.querySelector(".message-box");

  if (oldMessage !== null) {
    oldMessage.remove();
  }

  const box = document.createElement("div");
  box.className = "message-box";
  box.textContent = message;
  document.body.appendChild(box);

  setTimeout(function () {
    box.remove();
  }, 2500);
}

async function loadData(): Promise<void> {
  app.innerHTML = `<section class="empty-state"><h2>Betöltés...</h2></section>`;

  try {
    games = await getGames();
    comments = await getComments();
    renderApp();
  } catch (error) {
    console.log(error);
    app.innerHTML = `
      <section class="empty-state">
        <h2>Nem sikerült betölteni az adatokat.</h2>
      </section>
    `;
  }
}

function renderApp(): void {
  const gameId = getGameIdFromUrl();

  if (gameId === null) {
    //renderGameList() //összes játékot meg kell majd jeleníteni;
  } else {
    //renderGameDetail(gameId) //egy játék részletes oldalát kell majd megjeleníteni, ahol ott lesznek a kommentek is;
  }
}
>>>>>>> Backend
