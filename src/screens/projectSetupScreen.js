import { MODES } from "../gameConfig.js";
import { BUILDING_ASSETS, buildingAssetForProject } from "../assets/manifest.js";
import { hasProjectBackdrop, projectBackdrop } from "../projectVisuals.js";
import {
  currentProject,
  formatMoney,
  campaignLevel,
  levelCount,
  projectBudget,
  projectDuration,
  state,
  tradeTemplates,
  visibleLevels,
  zoneColumns,
  zoneCount,
  zonesForLevel,
} from "../gameLogic.js";

const GAME_TITLE = "Takt Builder";

const PROJECT_BRIEFINGS = {
  office: {
    tagline: "Build with flow.",
    accent: "green",
    icon: "OB",
  },
  hospital: {
    tagline: "Build with care. Deliver on time.",
    accent: "blue",
    icon: "H",
  },
  "data-center": {
    tagline: "Build with precision. Power the future.",
    accent: "green",
    icon: "DC",
  },
  "wind-farm": {
    tagline: "Build clean. Build smart. Build on time.",
    accent: "green",
    icon: "WF",
  },
  housing: {
    tagline: "Build communities. Build value. Build on time.",
    accent: "green",
    icon: "HD",
  },
  "solar-farm": {
    tagline: "Build clean energy. Build the future.",
    accent: "green",
    icon: "SF",
  },
  "industrial-plant": {
    tagline: "Build capacity. Build safely. Build on time.",
    accent: "green",
    icon: "IP",
  },
};

const SETUP_HERO_ASSET_KEYS = {
  office: "office-project-1",
  hospital: "hospital-project-2",
  "data-center": "data-center-project-3",
  "wind-farm": "wind-farm-project-4",
  housing: "housing-project-5",
  "industrial-plant": "industrial-plant-project-6",
};

export function setupView() {
  const project = currentProject();
  const selectedModeIndex = setupModeIndex();
  const briefing = projectBriefing(project);
  return `
    <main class="setup-screen project-setup project-${project.type} accent-${briefing.accent}">
      <div class="setup-stage setup-real-stage" aria-hidden="true">
        ${setupRealStage(project)}
      </div>
      <section class="setup-overlay project-briefing-card">
        <div class="setup-card-grid" aria-hidden="true"></div>
        <div class="briefing-header">
          <div class="briefing-logo" aria-label="${GAME_TITLE}">
            <span class="briefing-logo-icon">${briefing.icon}</span>
            <strong><span>TAKT</span> BUILDER</strong>
          </div>
          <div class="briefing-hero">
            ${setupHero(project)}
          </div>
        </div>
        <div class="briefing-copy">
          <p class="eyebrow">Project ${state.projectRound}</p>
          <h1>${project.name}</h1>
          <p class="setup-subtitle">${briefing.tagline}</p>
          <p class="summary">${setupSummary(project)}</p>
        </div>
        <section class="briefing-panel setup-stat-row">
          ${stat("Project", state.projectRound)}
          ${stat("Level", campaignLevel())}
          ${stat("Budget", formatMoney(projectBudget()))}
          ${stat("Schedule", `${projectDuration()} days`)}
        </section>
        <strong class="setup-section-label">Choose your play style</strong>
        <section class="mode-grid setup-mode-grid" aria-label="Variability mode">
          ${MODES.map(
            (mode, index) => `
              <button class="mode-button ${index === selectedModeIndex ? "selected" : ""}" data-mode="${index}" type="button" aria-pressed="${index === selectedModeIndex}">
                <span class="mode-key">${index + 1}</span>
                <span class="mode-icon ${modeIconClass(index)}" aria-hidden="true"></span>
                <span class="mode-title">${mode.name}</span>
                <span class="dice-row">${mode.dice.map((value) => `<span class="die">${value}</span>`).join("")}</span>
                <span class="mode-note">${mode.note}</span>
              </button>
            `,
          ).join("")}
        </section>
        <button class="setup-start-button" type="button" data-start-project>
          <span class="setup-start-icon" aria-hidden="true"></span>
          Start Project
        </button>
      </section>
    </main>
  `;
}

export function setupModeIndex() {
  return Math.min(Math.max(state.setupModeIndex ?? 0, 0), MODES.length - 1);
}

function projectBriefing(project) {
  return PROJECT_BRIEFINGS[project.type] ?? {
    tagline: "Build with flow.",
    accent: "green",
    icon: "PB",
  };
}

function setupSummary(project) {
  return [
    project.summary,
    `${levelCount()} ${levelCount() === 1 ? "level" : "levels"}`,
    `${zoneCount()} zones`,
    `${tradeTemplates().length} trades`,
    `${formatMoney(projectBudget())} budget`,
    `${projectDuration()} day schedule`,
  ].join(", ") + ".";
}

function setupRealStage(project) {
  if (hasProjectBackdrop(project)) {
    return `
      ${projectBackdrop(project)}
      <div class="setup-stage-vignette"></div>
    `;
  }

  return setupPreviewTower();
}

function setupHero(project) {
  const assetKey = SETUP_HERO_ASSET_KEYS[project.type] ?? project.type;
  const projectAsset = BUILDING_ASSETS[assetKey] ?? buildingAssetForProject(project);
  if (!projectAsset) return "";

  return `<img src="${projectAsset}" alt="">`;
}

function modeIconClass(index) {
  return ["mode-icon-low", "mode-icon-medium", "mode-icon-high"][index] ?? "";
}

function setupPreviewTower() {
  const project = currentProject();
  return `
    <section class="tower ${project.type}-tower setup-preview-tower" style="--building-asset: url('${buildingAssetForProject(project)}')">
      ${visibleLevels()
        .map(
          (level) => `
        <div class="tower-level">
          <div class="level-label">Level ${level}</div>
          <div class="level-zones" style="--zone-columns: ${zoneColumns()}">
            ${zonesForLevel(level)
              .map(
                (zone) => `
              <div class="tower-zone preview-zone">
                <span class="zone-number">${zone}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
        )
        .join("")}
      <div class="ground"></div>
    </section>
  `;
}

function stat(label, value, tone = "") {
  return `
    <div class="stat ${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}
