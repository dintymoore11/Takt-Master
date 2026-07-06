import { formatMoney, state } from "../gameLogic.js";
import { completedProjectCount } from "../ui/career.js";

export function winView() {
  return `
    <main class="win-screen takt-legend-screen">
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
        <h1>Congratulations!</h1>
        <p>You have successfully finished this round of projects!</p>
        <h2>You are now a <span>Takt Legend!</span></h2>
        <div class="legend-trophy" aria-hidden="true">
          <span></span>
          <b>Legend</b>
        </div>
        <div class="legend-results">
          <div>
            <span class="leaderboard-result-icon money" aria-hidden="true"></span>
            <small>Career Earnings</small>
            <strong>${formatMoney(state.totalProfit)}</strong>
          </div>
          <div>
            <span class="leaderboard-result-icon projects" aria-hidden="true"></span>
            <small>Projects Completed</small>
            <strong>${completedProjectCount()}</strong>
          </div>
        </div>
        <button class="legend-continue-button" type="button" data-continue>
          <span class="title-start-icon" aria-hidden="true"></span>
          Next Level
        </button>
      </section>
    </main>
  `;
}
