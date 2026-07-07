import { campaignLevel, formatMoney, state } from "../gameLogic.js";
import { uiAsset } from "../assets/manifest.js";
import { completedProjectCount } from "../ui/career.js";

export function winView() {
  const completedLevel = campaignLevel();
  const gameComplete = state.phase === "gameComplete" || state.beatGame;
  const trophyLevel = Math.min(Math.max(completedLevel, 1), 10);

  return `
    <main class="win-screen takt-legend-screen ${gameComplete ? "game-complete-screen" : ""}">
      <div class="legend-confetti" aria-hidden="true">
        ${Array.from(
          { length: 28 },
          (_, index) => `
            <span style="--i: ${index}; --x: ${(index * 37) % 100}; --duration: ${3.2 + (index % 6) * 0.32}s; --drift: ${(index % 7) - 3};"></span>
          `,
        ).join("")}
      </div>
      <header class="legend-brand">
        <strong><span>TAKT</span> BUILDER</strong>
      </header>
      <section class="legend-card">
        <div class="legend-stars" aria-hidden="true"><span></span><b></b><span></span></div>
        <h1>${gameComplete ? "You Beat The Game!" : "Congratulations!"}</h1>
        <h2>You have completed <span>Level ${completedLevel}!</span></h2>
        ${
          gameComplete
            ? `<p class="legend-final-message">You have mastered everything that can be mastered in construction. You officially beat the game, and there is nothing left to learn.</p>`
            : ""
        }
        <div class="legend-trophy legend-trophy-image" aria-hidden="true">
          <img src="${uiAsset(`trophy-level-${trophyLevel}`)}" alt="">
        </div>
        <div class="legend-results">
          <div>
            <small>Career Earnings</small>
            <strong>${formatMoney(state.totalProfit)}</strong>
          </div>
          <div>
            <small>Projects Completed</small>
            <strong>${completedProjectCount()}</strong>
          </div>
        </div>
        <button class="legend-continue-button" type="button" data-continue>
          <span class="title-start-icon" aria-hidden="true"></span>
          ${gameComplete ? "Enter Name" : "Next Level"}
        </button>
      </section>
    </main>
  `;
}
