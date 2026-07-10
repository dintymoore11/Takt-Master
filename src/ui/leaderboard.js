import { formatMoney, loadLeaderboard } from "../gameLogic.js";
import { uiAsset } from "../assets/manifest.js";

export function leaderboardBoard({
  className = "",
  limit = 20,
  placeholders = true,
  pendingEntry = null,
} = {}) {
  const boardClass = ["leaderboard", "title-board", className].filter(Boolean).join(" ");

  return `
    <section class="${boardClass}">
      <div class="title-board-heading">
        <span class="title-trophy" aria-hidden="true"></span>
        <div>
          <strong>Leaderboard</strong>
        </div>
      </div>
      <div class="title-leaderboard-labels">
        <span>Rank</span>
        <span>Player</span>
        <span>Projects Completed</span>
        <span>Career Earnings</span>
      </div>
      ${leaderboardRows({ limit, placeholders, pendingEntry })}
    </section>
  `;
}

export function leaderboardRows({
  limit = Infinity,
  placeholders = false,
  pendingEntry = null,
} = {}) {
  const rows = [...loadLeaderboard(), ...(pendingEntry ? [pendingEntry] : [])].sort(
    (a, b) => b.earnings - a.earnings,
  );
  const visibleRows = rows.slice(0, limit);
  if (visibleRows.length === 0 && !placeholders) return "<p>No scores yet</p>";
  const paddedRows = placeholders
    ? [
        ...visibleRows,
        ...Array.from({ length: Math.max(0, limit - visibleRows.length) }, () => null),
      ]
    : visibleRows;

  return paddedRows
    .map(
      (row, index) => `
        <div class="${leaderboardRowClass(row)}">
          <span>${index + 1}</span>
          <span class="leaderboard-player-cell">${row ? playerName(row) : "-"}</span>
          <span>${row ? projectsCompleted(row) : "-"}</span>
          <b>${row ? formatMoney(row.earnings) : "-"}</b>
        </div>
      `,
    )
    .join("");
}

function projectsCompleted(row) {
  return row.projectsCompleted ?? row.project ?? 0;
}

function playerName(row) {
  const beatGameIcon = row.beatGame
    ? `<span class="beat-game-icon" aria-label="Beat the game" title="Beat the game"></span>`
    : "";
  const twoPlayerIcon =
    row.players > 1
      ? `<img class="two-player-icon" src="${uiAsset("two-player-badge")}" alt="Two players" title="Two players">`
      : "";
  return `${row.name}${beatGameIcon}${twoPlayerIcon}`;
}

function leaderboardRowClass(row) {
  return ["leaderboard-row", !row && "empty-row", row?.pending && "pending-row"]
    .filter(Boolean)
    .join(" ");
}
