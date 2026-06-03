import "./style.css";
import type { Game } from "./Interfaces/game";
import type { Comment } from "./Interfaces/comment";
import { getGames } from "./Services/Gameservice";
import { getComments, createComment, updateComment, deleteComment } from "./Services/Commentservice";

interface AppState {
  games: Game[];
  comments: Comment[];
  searchText: string;
  selectedGenre: string;
  sortBy: string;
  sortDirection: string;
}

const app = document.getElementById("app") as HTMLDivElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const homeLink = document.getElementById("home-link") as HTMLAnchorElement;

const state: AppState = {
  games: [],
  comments: [],
  searchText: "",
  selectedGenre: "",
  sortBy: "title",
  sortDirection: "asc",
};

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

  for (const comment of state.comments) {
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
    state.games = await getGames();
    state.comments = await getComments();
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
    renderGameList();
  } else {
    renderGameDetail(gameId);
  }
}

function getFilteredGames(): Game[] {
  let games = [...state.games];
  const search = state.searchText.toLowerCase().trim();

  if (search !== "") {
    games = games.filter(function (game) {
      const title = game.title.toLowerCase();
      const genre = game.genre.toLowerCase();
      const description = game.description.toLowerCase();

      return title.includes(search) || genre.includes(search) || description.includes(search);
    });
  }

  if (state.selectedGenre !== "") {
    games = games.filter(function (game) {
      return game.genre.toLowerCase().includes(state.selectedGenre);
    });
  }

  games.sort(function (a, b) {
    let result = 0;

    if (state.sortBy === "title") {
      result = a.title.localeCompare(b.title, "hu");
    }

    if (state.sortBy === "date") {
      result = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    }

    if (state.sortBy === "rating") {
      result = getAverageRating(String(a.id)) - getAverageRating(String(b.id));
    }

    if (state.sortDirection === "desc") {
      result = result * -1;
    }

    return result;
  });

  return games;
}

function renderGameList(): void {
  const games = getFilteredGames();

  if (games.length === 0) {
    app.innerHTML = `
      <section class="empty-state">
        <h2>Nincs találat.</h2>
        <p>Próbálj másik keresést vagy műfajt.</p>
      </section>
    `;
    return;
  }

  let content = `
    <section class="game-list">
  `;

  for (const game of games) {
    content += renderGameRow(game);
  }

  content += `</section>`;
  app.innerHTML = content;
}

function renderGameRow(game: Game): string {
  const comments = getCommentsForGame(String(game.id));
  const average = getAverageRating(String(game.id));
  const maxPreview = 3;
  let preview = "";

  for (let i = 0; i < comments.length && i < maxPreview; i++) {
    preview += `<span><b>${html(comments[i].username)}:</b> ${html(comments[i].content)}</span>`;
  }

  if (preview === "") {
    preview = `<span>Még nincs komment ehhez a játékhoz.</span>`;
  }

  return `
    <article class="game-row" data-game-id="${game.id}" tabindex="0">
      <img class="game-cover" src="${html(game.imageUrl)}" alt="${html(game.title)} kép">
      <div class="game-info">
        <div class="game-header">
          <div>
            <h2>${html(game.title)}</h2>
            <p class="game-meta">${html(game.genre)} · ${formatDate(game.releaseDate)}</p>
          </div>
          <div class="rating-box">
            ${getStars(average)}
            <strong>${average.toFixed(1)} / 5</strong>
            <small>${comments.length} komment</small>
          </div>
        </div>
        <p>${html(game.description)}</p>
        <div class="comment-preview">${preview}</div>
      </div>
    </article>
  `;
}

function renderGameDetail(gameId: string): void {
  let selectedGame: Game | null = null;

  for (const game of state.games) {
    if (String(game.id) === gameId) {
      selectedGame = game;
    }
  }

  if (selectedGame === null) {
    app.innerHTML = `
      <section class="empty-state">
        <h2>A játék nem található.</h2>
        <button class="back-btn" id="back-btn">Vissza a listához</button>
      </section>
    `;
    return;
  }

  const comments = getCommentsForGame(String(selectedGame.id));
  const average = getAverageRating(String(selectedGame.id));
  let commentsHtml = "";

  for (const comment of comments) {
    commentsHtml += renderComment(comment);
  }

  if (commentsHtml === "") {
    commentsHtml = `<p class="muted">Még nincs komment ehhez a játékhoz.</p>`;
  }

  app.innerHTML = `
    <section class="detail-page">
      <button class="back-btn" id="back-btn">← Vissza a listához</button>

      <article class="detail-card">
        <img src="${html(selectedGame.imageUrl)}" alt="${html(selectedGame.title)} kép">
        <div>
          <h1>${html(selectedGame.title)}</h1>
          <p class="game-meta">${html(selectedGame.genre)} · ${formatDate(selectedGame.releaseDate)}</p>
          <div class="detail-rating">
            ${getStars(average)}
            <strong>${average.toFixed(1)} / 5</strong>
            <span>${comments.length} komment alapján</span>
          </div>
          <p>${html(selectedGame.description)}</p>
        </div>
      </article>

      <section class="comment-section">
        <h2>Komment írása</h2>
        <form id="comment-form" class="comment-form">
          <div class="form-row">
            <label>
              Név
              <input id="comment-username" type="text" placeholder="pl. gamer_bela" maxlength="28" required>
            </label>
            <label>
              Értékelés
              <select id="comment-rating" required>
                <option value="5">5 - kiváló</option>
                <option value="4">4 - jó</option>
                <option value="3">3 - közepes</option>
                <option value="2">2 - gyenge</option>
                <option value="1">1 - rossz</option>
              </select>
            </label>
          </div>
          <label>
            Vélemény
            <textarea id="comment-content" rows="3" placeholder="Írd le a véleményed..." required></textarea>
          </label>
          <button class="main-btn" type="submit">Komment hozzáadása</button>
        </form>
      </section>

      <section class="comment-section">
        <h2>Kommentek (${comments.length})</h2>
        <div class="comment-list">${commentsHtml}</div>
      </section>
    </section>
  `;
}

function renderComment(comment: Comment): string {
  let buttons = "";

  if (isMyComment(comment)) {
    buttons = `
      <div class="comment-actions">
        <button class="small-btn edit-comment-btn" data-id="${comment.id}">Módosítás</button>
        <button class="small-btn delete-comment-btn" data-id="${comment.id}">Törlés</button>
      </div>
    `;
  }

  return `
    <article class="comment-card">
      <div class="comment-head">
        <div>
          <strong>${html(comment.username)}</strong>
          <span>${formatDate(comment.createdAt)}</span>
        </div>
        <div>${getStars(comment.rating)} <b>${comment.rating}/5</b></div>
      </div>
      <p>${html(comment.content)}</p>
      ${buttons}
    </article>
  `;
}

function goHome(): void {
  state.searchText = "";
  state.selectedGenre = "";
  searchInput.value = "";

  window.location.hash = "#/";
  renderGameList();
}

async function addComment(form: HTMLFormElement, gameId: string): Promise<void> {
  const usernameInput = document.getElementById("comment-username") as HTMLInputElement;
  const ratingSelect = document.getElementById("comment-rating") as HTMLSelectElement;
  const contentInput = document.getElementById("comment-content") as HTMLTextAreaElement;

  const username = usernameInput.value.trim();
  const rating = Number(ratingSelect.value);
  const content = contentInput.value.trim();

  if (username === "") {
    showMessage("A név mező kötelező.");
    return;
  }

  if (content === "") {
    showMessage("A komment szövege kötelező.");
    return;
  }

  if (rating < 1 || rating > 5) {
    showMessage("Az értékelés 1 és 5 között legyen.");
    return;
  }

  const newComment: Comment = {
    id: Math.random().toString(36).substring(2, 13),
    gameId: Number(gameId),
    username: username,
    rating: rating,
    content: content,
    createdAt: new Date().toISOString(),
  };

  try {
    const savedComment = await createComment(newComment);
    state.comments.push(savedComment);
    saveMyCommentId(savedComment.id);
    form.reset();
    showMessage("Komment hozzáadva.");
    renderGameDetail(gameId);
  } catch (error) {
    console.log(error);
    showMessage("Nem sikerült hozzáadni a kommentet.");
  }
}

async function editComment(id: string): Promise<void> {
  let selectedComment: Comment | null = null;

  for (const comment of state.comments) {
    if (String(comment.id) === id) {
      selectedComment = comment;
    }
  }

  if (selectedComment === null) {
    return;
  }

  if (!isMyComment(selectedComment)) {
    showMessage("Csak a saját kommentet módosíthatod.");
    return;
  }

  const newContent = prompt("Komment szövege:", selectedComment.content);

  if (newContent === null || newContent.trim() === "") {
    return;
  }

  const newRatingText = prompt("Értékelés 1 és 5 között:", String(selectedComment.rating));

  if (newRatingText === null) {
    return;
  }

  const newRating = Number(newRatingText);

  if (!Number.isInteger(newRating) || newRating < 1 || newRating > 5) {
    showMessage("Az értékelés 1 és 5 közötti egész szám legyen.");
    return;
  }

  try {
    const updatedComment = await updateComment(id, newContent.trim(), newRating);

    for (let i = 0; i < state.comments.length; i++) {
      if (String(state.comments[i].id) === id) {
        state.comments[i] = updatedComment;
      }
    }

    showMessage("Komment módosítva.");
    renderGameDetail(String(selectedComment.gameId));
  } catch (error) {
    console.log(error);
    showMessage("Nem sikerült módosítani a kommentet.");
  }
}

async function removeComment(id: string): Promise<void> {
  let selectedComment: Comment | null = null;

  for (const comment of state.comments) {
    if (String(comment.id) === id) {
      selectedComment = comment;
    }
  }

  if (selectedComment === null) {
    return;
  }

  if (!isMyComment(selectedComment)) {
    return;
  }

  const shouldDelete = confirm("Biztosan törlöd ezt a kommentet?");

  if (!shouldDelete) {
    return;
  }

  try {
    await deleteComment(id);

    const newComments: Comment[] = [];

    for (const comment of state.comments) {
      if (String(comment.id) !== id) {
        newComments.push(comment);
      }
    }

    state.comments = newComments;
    removeMyCommentId(id);
    showMessage("Komment törölve.");
    renderGameDetail(String(selectedComment.gameId));
  } catch (error) {
    console.log(error);
    showMessage("Nem sikerült törölni a kommentet.");
  }
}

document.addEventListener("click", function (event) {
  const target = event.target as HTMLElement;
  const gameRow = target.closest(".game-row") as HTMLElement | null;

  if (gameRow !== null) {
    const id = gameRow.dataset.gameId;
    window.location.hash = `#/game/${id}`;
    return;
  }

  const backButton = target.closest("#back-btn");

  if (backButton !== null) {
    goHome();
    return;
  }

  const editButton = target.closest(".edit-comment-btn") as HTMLButtonElement | null;

  if (editButton !== null) {
    const id = editButton.dataset.id ?? "";
    editComment(id);
    return;
  }

  const deleteButton = target.closest(".delete-comment-btn") as HTMLButtonElement | null;

  if (deleteButton !== null) {
    const id = deleteButton.dataset.id ?? "";
    removeComment(id);
    return;
  }
});

document.addEventListener("submit", function (event) {
  const form = event.target as HTMLFormElement;

  if (form.id !== "comment-form") {
    return;
  }

  event.preventDefault();

  const gameId = getGameIdFromUrl();

  if (gameId !== null) {
    addComment(form, gameId);
  }
});

searchInput.addEventListener("input", function () {
  state.searchText = searchInput.value;

  if (getGameIdFromUrl() !== null) {
    window.location.hash = "#/";
  }

  renderGameList();
});

homeLink.addEventListener("click", function (event) {
  event.preventDefault();
  goHome();
});

const genreButtons = document.querySelectorAll<HTMLButtonElement>(".genre-btn");

genreButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    state.selectedGenre = button.dataset.genre ?? "";

    genreButtons.forEach(function (genreButton) {
      genreButton.classList.remove("active");
    });

    button.classList.add("active");

    if (getGameIdFromUrl() !== null) {
      window.location.hash = "#/";
    }

    renderGameList();
  });
});

const sortButtons = document.querySelectorAll<HTMLButtonElement>(".sort-btn");

sortButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const sortValue = button.dataset.sort;

    if (sortValue === undefined) {
      return;
    }

    if (state.sortBy === sortValue) {
      if (state.sortDirection === "asc") {
        state.sortDirection = "desc";
      } else {
        state.sortDirection = "asc";
      }
    } else {
      state.sortBy = sortValue;

      if (sortValue === "rating" || sortValue === "date") {
        state.sortDirection = "desc";
      } else {
        state.sortDirection = "asc";
      }
    }

    if (getGameIdFromUrl() !== null) {
      window.location.hash = "#/";
    }

    renderGameList();
  });
});

window.addEventListener("hashchange", renderApp);

loadData();
