import { PROJECTS } from "../gameConfig.js";
import { state } from "../gameLogic.js";
import { uiAsset } from "../assets/manifest.js";
import { leaderboardBoard } from "../ui/leaderboard.js";

const GAME_TITLE = "Takt Builder";

export function titleView() {
  return `
    <main class="title-screen">
      <section class="title-copy" aria-label="${GAME_TITLE}">
        <h1><span>Takt</span> Builder</h1>
      </section>

      <section class="title-start-area">
        <button class="start-button title-start-button" type="button" data-start>
          <span class="title-start-icon" aria-hidden="true"></span>
          Press Start
        </button>
      </section>

      <section class="title-sidebar">
        ${leaderboardBoard()}
      </section>
      <section class="title-sponsor-logo title-powered-by" aria-label="Powered by inTakt">
        <span>Powered by</span>
        <img src="${uiAsset("intakt-logo-white")}" alt="inTakt">
      </section>
      <section class="title-sponsor-logo title-supported-by" aria-label="Supported by LeanTakt">
        <span>Supported by</span>
        <img src="${uiAsset("leantakt-logo")}" alt="LeanTakt">
      </section>
      ${state.projectSelectorOpen ? projectSelectorModal() : ""}
    </main>
  `;
}

function projectSelectorModal() {
  return `
    <section class="project-selector-modal" role="dialog" aria-modal="true" aria-label="Project Selector">
      <div class="project-selector-card">
        <div class="project-selector-heading">
          <strong>Project Selector</strong>
        </div>
        <div class="project-selector-grid">
          ${PROJECTS.map(
            (project, index) => `
              <button class="${index === state.projectSelectorIndex ? "selected" : ""}" type="button" data-test-project="${index + 1}">
                <span>${index + 1}</span>
                <strong>${project.name}</strong>
                <small>${project.summary}</small>
              </button>
            `,
          ).join("")}
        </div>
        <button class="project-selector-close ${state.projectSelectorIndex === PROJECTS.length ? "selected" : ""}" type="button" data-project-selector-close>Close</button>
      </div>
    </section>
  `;
}
