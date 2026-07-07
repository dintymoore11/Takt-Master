import { NAME_KEYS } from "../gameConfig.js";
import {
  formatMoney,
  MAX_LEADERBOARD_NAME_LENGTH,
  state,
} from "../gameLogic.js";
import { completedProjectCount } from "../ui/career.js";
import { leaderboardBoard } from "../ui/leaderboard.js";

export function nameEntryView() {
  const completedProjects = completedProjectCount();
  const saveIndex = nameEntryKeys().length;

  return `
    <main class="name-screen leaderboard-entry-screen">
      ${leaderboardEntryBrand()}
      <section class="name-card leaderboard-entry-card">
        <div class="leaderboard-entry-heading">
          <span class="leaderboard-entry-trophy" aria-hidden="true"></span>
          <div>
            <h1>New Leaderboard Entry!</h1>
            <p>You made the leaderboard!</p>
            <strong>Enter your name to save your score.</strong>
          </div>
        </div>
        ${leaderboardEntryResults(completedProjects)}
        <div class="leaderboard-name-section">
          <strong>Enter your name</strong>
          <div class="name-display">${nameEntryDisplay()}</div>
        </div>
        <div class="letter-grid leaderboard-letter-grid">
          ${nameEntryKeys()
            .map(
              (key, index) => `
                <button class="${index === state.nameCursor ? "selected" : ""}" data-letter="${index}" type="button">${key}</button>
              `,
            )
            .join("")}
        </div>
        <div class="leaderboard-entry-actions">
          <button class="leaderboard-save-button ${state.nameCursor === saveIndex ? "selected" : ""}" type="button" data-save-score>Save Score</button>
          <button class="leaderboard-skip-button ${state.nameCursor === saveIndex + 1 ? "selected" : ""}" type="button" data-skip-score>Skip</button>
        </div>
        <p class="name-help">Arrow keys move · Space or Enter selects</p>
      </section>
      ${leaderboardEntryBoard()}
      ${leaderboardEntryFooter()}
    </main>
  `;
}

export function scoreResultView() {
  return `
    <main class="name-screen">
      <section class="name-card">
        <p class="eyebrow">Game Over</p>
        <h1>Final Score</h1>
        <p class="final-score">${formatMoney(state.totalProfit)} · Last project ${state.projectRound}</p>
        <p class="name-help">Not enough for the leaderboard</p>
        <button class="start-button" type="button" data-home>Home</button>
        <p class="name-help">Press S, Space, Enter, or End</p>
      </section>
      ${leaderboardBoard({ className: "standalone", placeholders: false })}
    </main>
  `;
}

export function nameEntryKeys() {
  return [...NAME_KEYS, "SPACE", "DEL"];
}

function leaderboardEntryBrand() {
  return `
    <header class="leaderboard-entry-brand">
      <strong><span>TAKT</span> BUILDER</strong>
    </header>
  `;
}

function leaderboardEntryResults(completedProjects) {
  return `
    <section class="leaderboard-results">
      <strong>Your results</strong>
      <div>
        <span class="leaderboard-result-icon money" aria-hidden="true"></span>
        <p>
          <small>Career earnings</small>
          <b>${formatMoney(state.totalProfit)}</b>
        </p>
      </div>
      <div>
        <span class="leaderboard-result-icon projects" aria-hidden="true"></span>
        <p>
          <small>Projects completed</small>
          <b>${completedProjects}</b>
        </p>
      </div>
    </section>
  `;
}

function leaderboardEntryBoard() {
  return leaderboardBoard({
    className: "leaderboard-entry-board",
    pendingEntry: pendingLeaderboardEntry(),
  });
}

function leaderboardEntryFooter() {
  return `<footer class="leaderboard-entry-footer">One project. One plan. <span>One flow.</span></footer>`;
}

function nameEntryDisplay() {
  return state.scoreName || "ENTER NAME...";
}

function pendingLeaderboardEntry() {
  return {
    name:
      (state.scoreName || "YOU")
        .trim()
        .toUpperCase()
        .slice(0, MAX_LEADERBOARD_NAME_LENGTH) || "YOU",
    project: state.projectRound,
    projectsCompleted: completedProjectCount(),
    players: state.hadTwoPlayers ? 2 : 1,
    earnings: state.totalProfit,
    pending: true,
  };
}
