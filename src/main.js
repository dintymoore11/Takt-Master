import "./style.css";

import {
  PROJECTS,
  DAILY_DELAY_COST,
  LIQUIDATED_DAMAGES_PER_DAY,
  PERIOD_LABEL,
  NAME_KEYS,
  NAME_ACTIONS,
  MODES,
} from "./gameConfig.js";
import { visualForTrade } from "./visualAssets.js";
import {
  hasProjectBackdrop,
  projectBackdrop,
  projectZoneOverlayLayers,
  zoneVisualLayers,
} from "./projectVisuals.js";
import {
  BUILDING_ASSETS,
  buildingAssetForProject,
  roadblockAsset,
  uiAsset,
} from "./assets/manifest.js";
import {
  addLog,
  activeTradeCount,
  continueFromGameOver,
  currentProject,
  formatMoney,
  getTrade,
  leaderboardQualifies,
  levelCount,
  loadLeaderboard,
  projectBudget,
  projectDuration,
  pushSelectedTrade,
  quitToLeaderboard,
  resolveSelectedRoadblock,
  restartAfterLeaderboard,
  resetProject,
  returnToTitle,
  saveLeaderboardScore,
  selectNameKey,
  setRenderCallback,
  startCampaign,
  startNextProject,
  state,
  stopTimer,
  tradeTemplates,
  tradeForSelectedZonePush,
  usesPlanGrid,
  visibleLevels,
  visualColumn,
  visualRow,
  zoneBay,
  zoneColumns,
  zoneCount,
  zoneFromLevelAndColumn,
  zoneFromPlanPosition,
  zoneLevel,
  zonesForLevel,
  zonesPerLevel,
  roadblockTimer,
} from "./gameLogic.js";

const IDLE_RETURN_MS = 90_000;
const app = document.querySelector("#app");
let idleReturnTimer = null;

function scheduleIdleReturn() {
  if (idleReturnTimer) {
    window.clearTimeout(idleReturnTimer);
    idleReturnTimer = null;
  }

  if (state.phase === "title") return;

  idleReturnTimer = window.setTimeout(() => {
    idleReturnTimer = null;
    if (state.phase !== "title") returnToTitle();
  }, IDLE_RETURN_MS);
}

function noteUserActivity() {
  scheduleIdleReturn();
}

function render() {
  scheduleIdleReturn();

  if (state.phase === "title") {
    app.innerHTML = titleView();
    bindTitle();
    return;
  }

  if (state.phase === "setup") {
    app.innerHTML = setupView();
    bindSetup();
    return;
  }

  if (state.phase === "nameEntry") {
    app.innerHTML = nameEntryView();
    bindNameEntry();
    return;
  }

  if (state.phase === "gameOver") {
    app.innerHTML = gameOverView();
    bindGameOver();
    return;
  }

  if (state.phase === "scoreResult") {
    app.innerHTML = scoreResultView();
    bindScoreResult();
    return;
  }

  if (state.phase === "win") {
    app.innerHTML = winView();
    bindWin();
    return;
  }

  app.innerHTML = gameView();
  bindGame();
}

function titleView() {
  return `
    <main class="title-screen">
      <section class="title-copy" aria-label="Flow Builder">
        <div class="title-mark" aria-hidden="true">
          <span class="title-crane"></span>
        </div>
        <h1><span>Flow</span> Builder</h1>
        <div class="title-actions">
          <button class="start-button" type="button" data-start>
            <img class="button-icon" src="${uiAsset("start")}" alt="" aria-hidden="true">
            Press Start
          </button>
          <button class="project-selector-button" type="button" data-project-selector>
            <span>Level Selector</span>
            <small>Temporary testing</small>
          </button>
        </div>
      </section>
      <section class="title-trades" aria-label="Trade sequence">
        ${["Structural", "HVAC", "Plumbing", "Electrical", "Fire Protection", "Containment", "Equipment"]
          .map(
            (trade) => `
              <div class="title-trade title-trade-${trade.toLowerCase().replaceAll(" ", "-")}">
                <i aria-hidden="true"></i>
                <span>${trade}</span>
              </div>
            `,
          )
          .join("")}
      </section>
      <section class="title-hero" aria-label="Data center preview">
        <img src="${BUILDING_ASSETS["data-center-project-3"]}" alt="">
      </section>
      <section class="title-sidebar">
        <section class="leaderboard title-board">
          <div class="title-board-heading">
            <span aria-hidden="true"></span>
            <strong>Leaderboard</strong>
          </div>
          ${leaderboardRows()}
        </section>
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
          <span>Move / Space</span>
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
        <button class="project-selector-close" type="button" data-project-selector-close>Close</button>
      </div>
    </section>
  `;
}

function setupView() {
  const project = currentProject();
  return `
    <main class="setup-screen project-setup">
      <div class="setup-stage" aria-hidden="true">
        ${setupPreviewTower()}
      </div>
      <section class="setup-overlay">
        <p class="eyebrow">Project ${state.projectRound}</p>
        <h1>${project.name}</h1>
        <h2>Flow Builder</h2>
        <p class="setup-subtitle">Build with flow.</p>
        <p class="summary">${project.summary}, ${levelCount()} levels, ${zoneCount()} zones, ${tradeTemplates().length} trades, ${formatMoney(projectBudget())} budget, ${projectDuration()} day schedule.</p>
        <section class="briefing-panel">
          ${stat("Project", state.projectRound)}
          ${stat("Budget", formatMoney(projectBudget()))}
          ${stat("Schedule", `${projectDuration()} days`)}
        </section>
        <section class="mode-grid" aria-label="Variability mode">
          ${MODES.map(
            (mode, index) => `
              <button class="mode-button" data-mode="${index}" type="button">
                <span class="mode-key">${index + 1}</span>
                <span class="mode-title">${mode.name}</span>
                <span class="dice-row">${mode.dice.map((value) => `<span class="die">${value}</span>`).join("")}</span>
                <span class="mode-note">${mode.note}</span>
              </button>
            `,
          ).join("")}
        </section>
      </section>
    </main>
  `;
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

function nameEntryView() {
  if (state.scoreSaved) {
    return `
      <main class="name-screen">
        <section class="name-card">
          <p class="eyebrow">Score Saved</p>
          <h1>Leaderboard</h1>
          <p class="final-score">${state.scoreName} · Final score ${formatMoney(state.totalProfit)} · Last project ${state.projectRound}</p>
          <button class="start-button" type="button" data-home>Home</button>
          <p class="name-help">Press S, Space, or Enter</p>
        </section>
        <section class="leaderboard standalone">
          <strong>Leaderboard</strong>
          ${leaderboardRows()}
        </section>
      </main>
    `;
  }

  return `
    <main class="name-screen">
      <section class="name-card">
        <p class="eyebrow">Game Over</p>
        <h1>Enter Name</h1>
        <p class="final-score">Final score ${formatMoney(state.totalProfit)} · Last project ${state.projectRound}</p>
        <div class="name-display">${(state.scoreName || "___").padEnd(3, "_")}</div>
        <div class="letter-grid">
          ${[...NAME_KEYS, ...NAME_ACTIONS]
            .map(
              (key, index) => `
            <button class="${index === state.nameCursor ? "selected" : ""}" data-letter="${index}" type="button">${key}</button>
          `,
            )
            .join("")}
        </div>
        <p class="name-help">Arrow keys move · Space selects · Enter saves</p>
      </section>
      <section class="leaderboard standalone">
        <strong>Leaderboard</strong>
        ${leaderboardRows()}
      </section>
    </main>
  `;
}

function gameOverView() {
  const qualified = leaderboardQualifies(state.totalProfit);
  return `
    <main class="name-screen">
      <section class="name-card">
        <p class="eyebrow">Game Over</p>
        <h1>You Lost</h1>
        <p class="final-score">Career earnings ${formatMoney(state.totalProfit)}</p>
        <div class="briefing-panel compact-results">
          ${stat("Last project", currentProject().name)}
          ${stat("Project profit", formatMoney(state.profit), state.profit < 0 ? "bad" : "")}
          ${scheduleVarianceStat()}
          ${stat("Costs", formatMoney(totalProjectCosts()))}
          ${stat("Schedule efficiency", `${scheduleEfficiency().toFixed(0)}%`)}
        </div>
        <button class="start-button" type="button" data-continue>${qualified ? "Enter Name" : "Results"}</button>
        <p class="name-help">Press Space, Enter, or S</p>
      </section>
      <section class="leaderboard standalone">
        <strong>Leaderboard</strong>
        ${leaderboardRows()}
      </section>
    </main>
  `;
}

function scoreResultView() {
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
      <section class="leaderboard standalone">
        <strong>Leaderboard</strong>
        ${leaderboardRows()}
      </section>
    </main>
  `;
}

function winView() {
  return `
    <main class="win-screen">
      <div class="fireworks">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <section class="win-card">
        <p class="eyebrow">Grand Opening</p>
        <h1>You Won</h1>
        <p class="summary">The hotel is open, the ribbon is cut, and your construction career ends in a successful retirement.</p>
        <div class="ribbon-cutting">
          <span class="ribbon left"></span>
          <span class="scissors"></span>
          <span class="ribbon right"></span>
        </div>
        <p class="final-score">Career earnings ${formatMoney(state.totalProfit)}</p>
        <button class="start-button" type="button" data-continue>Enter Leaderboard</button>
        <p class="name-help">Press Space, Enter, or S</p>
      </section>
    </main>
  `;
}

function gameView() {
  const project = currentProject();
  return `
    <main class="game-shell phase-${state.roundPhase} project-${project.type}">
      <section class="unity-frame">
        <div class="stage">
          <header class="topbar">
            <div class="topbar-title">
              ${topbarTitle(project)}
            </div>
            <div class="project-readout">
              ${projectReadout(project)}
            </div>
            ${dayReadout()}
            <div class="topbar-timeline">
              ${scheduleBar()}
              ${budgetGauge()}
            </div>
            <div class="profit-readout ${state.profit < 0 ? "bad" : ""}">
              <span>Profit</span>
              <strong>${formatMoney(state.profit)}</strong>
            </div>
          </header>
          ${hasProjectBackdrop(project) ? projectBackdrop(project) : ""}
          ${liveDamagesBanner()}

          <div class="game-layout">
            ${tradesPanel(project)}
            <div class="playfield">
              ${towerView()}
            </div>
          </div>
        </div>
        <footer class="unity-footer">
          <span>Flow Builder</span>
          <button class="fullscreen-fake" type="button" aria-label="Fullscreen preview"></button>
        </footer>
      </section>
      ${state.phase === "ended" ? endScreen() : ""}
    </main>
  `;
}

function topbarTitle(project) {
  return `<strong><span>FLOW</span></strong>`;
}

function projectReadout(project) {
  return `<strong>Project ${state.projectRound}: ${project.name}</strong>`;
}

function dayReadout() {
  return `
    <div class="day-readout">
      <strong>Day <span>${state.day}</span> / ${projectDuration()}</strong>
    </div>
  `;
}

function tradesPanel(project) {
  return `
    <aside class="trades-panel" aria-label="Trades">
      <strong>Trades</strong>
      <ol>
        ${project.trades
          .map(
            (trade, index) => `
              <li style="--trade-color: ${trade.color}">
                <span class="trade-icon trade-icon-${trade.key}" aria-hidden="true"></span>
                <b>${index + 1}</b>
                <span>${trade.name}</span>
              </li>
            `,
          )
          .join("")}
      </ol>
    </aside>
  `;
}

function liveDamagesBanner() {
  if (state.phase !== "running" || state.liquidatedDamages <= 0) return "";
  return `
    <div class="live-damages ${state.liquidatedDamages === LIQUIDATED_DAMAGES_PER_DAY ? "first-hit" : ""}">
      Liquidated damages -${formatMoney(state.liquidatedDamages)}
    </div>
  `;
}

function operatingCosts() {
  return state.laborCost + state.pushCost;
}

function totalProjectCosts() {
  return operatingCosts() + state.delayCost + state.liquidatedDamages;
}

function scheduleBar() {
  const duration = projectDuration();
  const progress = Math.min(100, (state.day / duration) * 100);
  const overrun = state.day > duration;
  return `
    <div class="schedule ${overrun ? "overrun" : ""}" aria-label="Project schedule">
      <div class="schedule-meta">
        <span>Start</span>
        <strong>Day ${state.day} / ${duration}</strong>
        <span>Finish</span>
      </div>
      <div class="schedule-track">
        <span class="milestone start"></span>
        <span class="schedule-fill" style="width: ${progress}%"></span>
        <span class="today-marker" style="left: ${progress}%"></span>
        <span class="milestone finish"></span>
      </div>
    </div>
  `;
}

function budgetGauge() {
  const budget = projectBudget();
  const costs = totalProjectCosts();
  const costPercent = Math.min(130, (costs / budget) * 100);
  return `
    <div class="budget-gauge ${costs > budget ? "overrun" : ""}" aria-label="Project budget and costs">
      <div class="budget-labels">
        <span>Budget <strong>${formatMoney(budget)}</strong></span>
        <span>Costs <strong>${formatMoney(costs)}</strong></span>
      </div>
      <div class="budget-track">
        <span class="cost-fill" style="width: ${costPercent}%"></span>
        <span class="budget-marker"></span>
      </div>
    </div>
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

function towerView() {
  const project = currentProject();
  return `
    ${hasProjectBackdrop(project) ? "" : projectBackdrop(project)}
    <section class="tower ${project.type}-tower" aria-label="${project.name} with ${zoneCount()} zones" style="--building-asset: url('${buildingAssetForProject(project)}')">
      ${visibleLevels()
        .map((level) => towerLevel(level))
        .join("")}
      ${projectZoneOverlayLayers(project, state.trades, projectZoneNumbers())}
      <div class="ground"></div>
    </section>
  `;
}

function projectZoneNumbers() {
  return Array.from({ length: zoneCount() }, (_, index) => index + 1);
}

function towerLevel(level) {
  return `
    <div class="tower-level">
      <div class="level-label">${levelLabel(level)}</div>
      <div class="level-zones" style="--zone-columns: ${zoneColumns()}">
        ${zonesForLevel(level)
          .map((zone) => towerZone(zone))
          .join("")}
      </div>
    </div>
  `;
}

function levelLabel(level) {
  if (currentProject().type !== "office") return `Level ${level}`;

  const names = ["First", "Second", "Third", "Fourth", "Fifth"];
  return `
    <span class="level-number">${level}</span>
    <span>${names[level - 1] ?? `Level ${level}`}</span>
    <small>Floor</small>
  `;
}

function towerZone(zoneNumber) {
  const tradesInZone = state.trades.filter(
    (trade) => trade.zone === zoneNumber && !trade.finished,
  );
  const roadblocks = state.roadblocks.filter(
    (item) => item.zone === zoneNumber,
  );
  const selected = state.selectedZone === zoneNumber;
  const delayCallout = delayCalloutForZone(zoneNumber);
  return `
    <button class="tower-zone ${selected ? "selected-zone" : ""}" data-zone="${zoneNumber}" type="button">
      <span class="zone-number">${zoneNumber}</span>
      <div class="office-work">
        ${zoneWorkLayers(currentProject(), zoneNumber)}
      </div>
      <div class="work-stack">
        ${tradesInZone.map((trade) => workerToken(trade)).join("")}
      </div>
      ${delayCallout ? `<span class="delay-callout">${delayCallout}</span>` : ""}
      ${roadblocks.map((roadblock) => roadblockMarker(roadblock)).join("")}
    </button>
  `;
}

function zoneWorkLayers(project, zoneNumber) {
  return zoneVisualLayers(project, state.trades, zoneNumber);
}

function delayCalloutForZone(zoneNumber) {
  const roadblock = state.roadblocks.find((item) => {
    const trade = getTrade(item.tradeId);
    return (
      !item.resolved &&
      item.delayDays > 0 &&
      item.zone === zoneNumber &&
      trade &&
      trade.zone === zoneNumber &&
      !trade.finished
    );
  });

  if (!roadblock) return "";
  return `delay -${formatMoney(roadblock.delayDays * DAILY_DELAY_COST)}`;
}

function workerToken(trade) {
  const visual = visualForTrade(trade);
  const movementClass = workerMovementClass(trade);
  const animationState = workerAnimationState(trade);
  const spriteClass = visual.sprite ? "sprite-worker" : "";
  const spriteStyle = visual.sprite
    ? spriteWorkerStyle(visual.sprite, animationState)
    : "";
  const activelyFrustrated = trade.frustratedUntil > Date.now();
  const frustrationClass = activelyFrustrated
    ? `frustrated frustration-${trade.frustrationReason}`
    : "";
  return `
    <span class="worker ${visual.workerClass} ${spriteClass} worker-state-${animationState} ${movementClass} ${frustrationClass} ${state.roundPhase === "moving" && trade.pendingSteps > 0 ? "moving" : ""}" style="--trade-color: ${trade.color}; --worker-asset: url('${visual.workerAsset}'); ${spriteStyle}">
      ${visual.sprite ? workerSprite() : ""}
      <span class="hardhat"></span>
      <span class="head"></span>
      <span class="torso"></span>
      <span class="arm arm-left"></span>
      <span class="arm arm-right"></span>
      <span class="leg leg-left"></span>
      <span class="leg leg-right"></span>
      <span class="tool"></span>
      <span class="worker-label">${tradeLabel(trade)}</span>
      ${tradeDice(trade)}
      ${pushCostCallout(trade)}
    </span>
  `;
}

function pushCostCallout(trade) {
  if (trade.pushedUntil <= Date.now()) return "";
  return `<span class="worker-push-cost">${trade.pushFlash}</span>`;
}

function workerAnimationState(trade) {
  if (
    trade.pushedUntil > Date.now() ||
    (trade.morale <= 28 && trade.frustratedUntil > Date.now())
  ) {
    return "angry";
  }
  if (
    state.roundPhase === "moving" &&
    trade.pendingSteps > 0 &&
    !trade.delayedToday
  ) {
    return "walking";
  }
  if (
    trade.waitReason === "blocked" ||
    trade.delayedToday ||
    trade.frustratedUntil > Date.now()
  ) {
    return "waiting";
  }
  if (state.roundPhase === "rolling") return "idle";
  if (trade.zone > 0 && !trade.finished) return "working";
  return "idle";
}

function spriteWorkerStyle(sprite, animationState) {
  const stateConfig = sprite.states[animationState] ?? sprite.states.waiting;
  return [
    `--sprite-sheet: url('${sprite.asset}')`,
    `--sprite-columns: ${sprite.columns}`,
    `--sprite-rows: ${sprite.rows}`,
    `--sprite-row: ${stateConfig.row}`,
    `--sprite-duration: ${stateConfig.duration}`,
    `--sprite-timing: ${stateConfig.timing}`,
  ].join("; ");
}

function workerSprite() {
  return `
    <span class="worker-sprite-viewport" aria-hidden="true">
      <span class="worker-sprite-sheet"></span>
    </span>
  `;
}

function tradeDice(trade) {
  const rolling =
    state.roundPhase === "rolling" &&
    !trade.finished &&
    trade.pendingSteps > 0 &&
    trade.lastRoll;
  if (!rolling) return "";

  const pushed = trade.pushedUntil > Date.now();
  return `
    <span class="trade-die rolling ${pushed ? "pushed" : ""}">
      <img class="die-asset" src="${uiAsset("die")}" alt="" aria-hidden="true">
      ${trade.lastRoll}
    </span>
  `;
}

function tradeLabel(trade) {
  return visualForTrade(trade).label;
}

function workerMovementClass(trade) {
  if (
    !trade.previousZone ||
    trade.previousZone === trade.zone ||
    trade.finished
  )
    return "";
  if (usesPlanGrid()) {
    const fromRow = visualRow(trade.previousZone);
    const toRow = visualRow(trade.zone);
    const fromColumn = visualColumn(trade.previousZone);
    const toColumn = visualColumn(trade.zone);
    if (fromRow < toRow) return "entered-from-up";
    if (fromRow > toRow) return "entered-from-down";
    if (fromColumn < toColumn) return "entered-from-left";
    if (fromColumn > toColumn) return "entered-from-right";
  }

  return visualColumn(trade.previousZone) <= visualColumn(trade.zone)
    ? "entered-from-left"
    : "entered-from-right";
}

function roadblockMarker(roadblock) {
  const selected = state.selectedZone === roadblock.zone;
  const trade = getTrade(roadblock.tradeId);
  const timer = roadblockTimer(roadblock);
  const asset = roadblockAsset(roadblock.visualKey);
  return `
    <span class="tower-blocker ${selected ? "selected" : ""}" style="--trade-color: ${trade.color}">
      <img class="roadblock-asset" src="${asset}" alt="" aria-hidden="true">
      <span class="barricade">
        <i></i>
      </span>
      <b class="${timer < 0 ? "negative" : ""}">${timer}</b>
    </span>
  `;
}

function endScreen() {
  const margin = (state.profit / projectBudget()) * 100;
  const quitButton = state.quitConfirm
    ? `<button class="restart danger ${state.endActionIndex === 1 ? "selected-action" : ""}" type="button" data-confirm-quit>Confirm Quit</button>`
    : `<button class="restart secondary ${state.endActionIndex === 1 ? "selected-action" : ""}" type="button" data-quit>Quit Game</button>`;
  return `
    <section class="end-modal" role="dialog" aria-modal="true" aria-label="Project complete">
      <div class="end-screen">
        <div>
          <p class="eyebrow">${state.gameOver ? "Game Over" : `Project ${state.projectRound} Complete`}</p>
          <h2>Total profit ${formatMoney(state.profit)} (${margin.toFixed(1)}%)</h2>
          ${state.gameOver ? `<p class="final-score">Final score ${formatMoney(state.totalProfit)}</p>` : `<p class="final-score">Career profit ${formatMoney(state.totalProfit)}</p>`}
        </div>
        <div class="end-stats">
          ${scheduleVarianceStat()}
          ${stat("Costs", formatMoney(totalProjectCosts()))}
          ${stat("Schedule efficiency", `${scheduleEfficiency().toFixed(0)}%`)}
        </div>
        ${state.liquidatedDamages > 0 ? `<div class="damages-flash">Liquidated damages -${formatMoney(state.liquidatedDamages)}</div>` : ""}
        ${taktPlan()}
        <div class="end-actions">
          <button class="restart ${state.endActionIndex === 0 ? "selected-action" : ""}" type="button" data-restart>${state.gameOver ? "New Game" : state.projectRound >= PROJECTS.length ? "Finish Game" : "Next Project"}</button>
          ${state.gameOver ? "" : quitButton}
        </div>
      </div>
    </section>
  `;
}

function scheduleVarianceStat() {
  const variance = projectDuration() - state.day;
  if (variance >= 0) return stat("Days early", `${variance} days`);
  return stat("Days late", `${Math.abs(variance)} days`, "bad");
}

function leaderboardRows() {
  const rows = loadLeaderboard();
  if (rows.length === 0) return "<p>No scores yet</p>";
  return rows
    .map(
      (row, index) => `
        <div>
          <span>${index + 1}. ${row.name}</span>
          <span>Project ${row.project}</span>
          <b>${formatMoney(row.earnings)}</b>
        </div>
      `,
    )
    .join("");
}

function taktPlan() {
  const weeks = Array.from({ length: state.day }, (_, index) => index + 1);
  return `
    <div class="takt-plan">
      <div class="takt-title">
        <strong>As-Built Takt Plan</strong>
        <span>Working days</span>
      </div>
      <div class="zone-plan" style="--week-count: ${state.day}">
        ${tradeLegend()}
        <div class="zone-plan-header">
          <span>Zone</span>
          <div>${weeks.map((week) => `<span>${week}</span>`).join("")}</div>
        </div>
        ${Array.from({ length: levelCount() }, (_, index) => index + 1)
          .map((level) => taktLevelGroup(level, weeks))
          .join("")}
      </div>
    </div>
  `;
}

function taktLevelGroup(level, weeks) {
  return `
    <div class="zone-plan-group">Level ${level}</div>
    ${zonesForPlanLevel(level)
      .map((zone) => taktZoneRow(zone, weeks))
      .join("")}
  `;
}

function taktZoneRow(zone, weeks) {
  const entries = zonePlanEntries(zone, weeks);
  return `
    <div class="zone-plan-row" style="--lane-count: ${entries.laneCount}">
      <strong>${zone}</strong>
      <div class="zone-plan-track">
        ${zonePlanBars(entries.bars)}
      </div>
    </div>
  `;
}

function zonePlanBars(bars) {
  return bars
    .map(
      ({ trade, start, end, lane }) => `
        <span
          class="plan-bar"
          style="--start: ${start}; --duration: ${end - start + 1}; --lane: ${lane}; background: ${trade.color}"
          title="${trade.name}, ${PERIOD_LABEL.toLowerCase()} ${start}-${end}"
        ></span>
      `,
    )
    .join("");
}

function zonePlanEntries(zone, weeks) {
  const spans = state.trades
    .flatMap((trade) => zoneWorkSpans(trade, zone, weeks))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const laneEnds = [];
  const bars = spans.map((span) => {
    let lane = laneEnds.findIndex((end) => end < span.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = span.end;
    return { ...span, lane: lane + 1 };
  });

  return {
    bars,
    laneCount: Math.max(1, laneEnds.length),
  };
}

function tradeLegend() {
  return `
    <div class="trade-legend">
      <strong>Trades</strong>
      ${state.trades
        .map(
          (trade) => `
            <span>
              <i style="background: ${trade.color}"></i>
              ${trade.name}
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function scheduleEfficiency() {
  let workedDays = 0;
  let elapsedDays = 0;

  Array.from({ length: zoneCount() }, (_, index) => index + 1).forEach(
    (zone) => {
      const zoneWeeks = uniqueSortedWeeksForZone(zone);
      if (zoneWeeks.length === 0) return;
      workedDays += zoneWeeks.length;
      elapsedDays += Math.max(
        1,
        zoneWeeks[zoneWeeks.length - 1] - zoneWeeks[0] + 1,
      );
    },
  );

  if (elapsedDays === 0) return 0;
  return (workedDays / elapsedDays) * 100;
}

function uniqueSortedWeeksForZone(zone) {
  return [
    ...new Set(
      state.trades.flatMap((trade) => trade.zoneWorkWeeks[zone] ?? []),
    ),
  ].sort((a, b) => a - b);
}

function zoneWorkSpans(trade, zone, weeks) {
  const recordedWeeks = trade.zoneWorkWeeks[zone] ?? [];
  const workedWeeks = weeks.filter((week) => recordedWeeks.includes(week));

  if (workedWeeks.length === 0) return [];

  const spans = [];
  let start = workedWeeks[0];
  let previous = workedWeeks[0];

  workedWeeks.slice(1).forEach((week) => {
    if (week === previous + 1) {
      previous = week;
      return;
    }
    spans.push({ trade, start, end: previous });
    start = week;
    previous = week;
  });

  spans.push({ trade, start, end: previous });
  return spans;
}

function zonesForPlanLevel(level) {
  const firstZone = (level - 1) * zonesPerLevel() + 1;
  return Array.from(
    { length: zonesPerLevel() },
    (_, index) => firstZone + index,
  );
}

function bindTitle() {
  document.querySelector("[data-start]")?.addEventListener("click", () => {
    state.projectRound = 1;
    state.totalProfit = 0;
    state.gameOver = false;
    state.projectSelectorOpen = false;
    state.phase = "setup";
    render();
  });

  document.querySelector("[data-project-selector]")?.addEventListener("click", () => {
    state.projectSelectorOpen = true;
    state.projectSelectorIndex = Math.max(0, state.projectRound - 1);
    render();
  });

  document
    .querySelector("[data-project-selector-close]")
    ?.addEventListener("click", () => {
      state.projectSelectorOpen = false;
      render();
    });

  document.querySelectorAll("[data-test-project]").forEach((button) => {
    button.addEventListener("click", () => {
      selectTestProject(Number(button.dataset.testProject) - 1);
    });
  });
}

function selectTestProject(index) {
  state.projectRound = index + 1;
  state.projectSelectorIndex = index;
  state.projectSelectorOpen = false;
  state.totalProfit = 0;
  state.gameOver = false;
  state.phase = "setup";
  render();
}

function projectSelectorColumns() {
  return window.matchMedia("(max-width: 980px)").matches ? 1 : 2;
}

function bindSetup() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = MODES[Number(button.dataset.mode)];
      if (state.projectRound === 1 && state.totalProfit === 0) {
        startCampaign(mode);
      } else {
        resetProject(mode);
      }
    });
  });
}

function bindNameEntry() {
  document
    .querySelector("[data-home]")
    ?.addEventListener("click", restartAfterLeaderboard);
  document.querySelectorAll("[data-letter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.nameCursor = Number(button.dataset.letter);
      selectNameKey();
    });
  });
}

function bindGameOver() {
  document
    .querySelector("[data-continue]")
    ?.addEventListener("click", continueFromGameOver);
}

function bindScoreResult() {
  document
    .querySelector("[data-home]")
    ?.addEventListener("click", returnToTitle);
}

function bindWin() {
  document
    .querySelector("[data-continue]")
    ?.addEventListener("click", quitToLeaderboard);
}

function bindGame() {
  document.querySelectorAll("[data-zone]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedZone = Number(button.dataset.zone);
      state.focusArea = "zones";
      render();
    });
  });

  document.querySelectorAll("[data-roadblock]").forEach((button) => {
    button.addEventListener("click", () => {
      const roadblock = state.roadblocks[Number(button.dataset.roadblock)];
      if (roadblock) state.selectedZone = roadblock.zone;
      state.focusArea = "zones";
      render();
    });
  });

  document.querySelector("[data-restart]")?.addEventListener("click", () => {
    stopTimer();
    if (state.gameOver) {
      state.projectRound = 1;
      state.totalProfit = 0;
      state.gameOver = false;
      state.phase = "setup";
      render();
    } else {
      startNextProject();
    }
  });

  document.querySelector("[data-quit]")?.addEventListener("click", () => {
    state.quitConfirm = true;
    state.endActionIndex = 1;
    render();
  });

  document
    .querySelector("[data-confirm-quit]")
    ?.addEventListener("click", quitToLeaderboard);
}

window.addEventListener("keydown", (event) => {
  noteUserActivity();

  if (event.key === "Escape") {
    event.preventDefault();
    if (state.phase === "title" && state.projectSelectorOpen) {
      state.projectSelectorOpen = false;
      render();
      return;
    }
    if (state.phase !== "title") {
      returnToTitle();
    }
    return;
  }

  if (state.phase === "title") {
    if (state.projectSelectorOpen) {
      const projectSelectorColumnCount = projectSelectorColumns();

      if (event.key === "ArrowLeft") {
        state.projectSelectorIndex = Math.max(0, state.projectSelectorIndex - 1);
      } else if (event.key === "ArrowRight") {
        state.projectSelectorIndex = Math.min(
          PROJECTS.length - 1,
          state.projectSelectorIndex + 1,
        );
      } else if (event.key === "ArrowUp") {
        state.projectSelectorIndex = Math.max(
          0,
          state.projectSelectorIndex - projectSelectorColumnCount,
        );
      } else if (event.key === "ArrowDown") {
        state.projectSelectorIndex = Math.min(
          PROJECTS.length - 1,
          state.projectSelectorIndex + projectSelectorColumnCount,
        );
      } else if (event.code === "Space" || event.key === "Enter") {
        event.preventDefault();
        selectTestProject(state.projectSelectorIndex);
        return;
      } else {
        return;
      }

      event.preventDefault();
      render();
      return;
    }

    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      state.phase = "setup";
      render();
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      state.projectSelectorOpen = true;
      state.projectSelectorIndex = Math.max(0, state.projectRound - 1);
      render();
    }
    return;
  }

  if (state.phase === "setup") {
    if (["1", "2", "3"].includes(event.key)) {
      event.preventDefault();
      const mode = MODES[Number(event.key) - 1];
      if (state.projectRound === 1 && state.totalProfit === 0) {
        startCampaign(mode);
      } else {
        resetProject(mode);
      }
    }
    return;
  }

  if (state.phase === "gameOver") {
    if (
      ["s", "enter"].includes(event.key.toLowerCase()) ||
      event.code === "Space"
    ) {
      event.preventDefault();
      continueFromGameOver();
    }
    return;
  }

  if (state.phase === "nameEntry") {
    if (state.scoreSaved) {
      if (
        ["s", "enter", "end"].includes(event.key.toLowerCase()) ||
        event.code === "Space"
      ) {
        event.preventDefault();
        restartAfterLeaderboard();
      }
      return;
    }

    const totalKeys = NAME_KEYS.length + NAME_ACTIONS.length;
    if (event.key === "ArrowLeft") {
      state.nameCursor = Math.max(0, state.nameCursor - 1);
    } else if (event.key === "ArrowRight") {
      state.nameCursor = Math.min(totalKeys - 1, state.nameCursor + 1);
    } else if (event.key === "ArrowUp") {
      state.nameCursor = Math.max(0, state.nameCursor - 7);
    } else if (event.key === "ArrowDown") {
      state.nameCursor = Math.min(totalKeys - 1, state.nameCursor + 7);
    } else if (event.code === "Space") {
      event.preventDefault();
      selectNameKey();
      return;
    } else if (event.key === "Enter" || event.key === "End") {
      event.preventDefault();
      saveLeaderboardScore();
      return;
    } else if (event.key === "Backspace") {
      event.preventDefault();
      state.scoreName = state.scoreName.slice(0, -1);
    } else {
      return;
    }
    event.preventDefault();
    render();
    return;
  }

  if (state.phase === "scoreResult") {
    if (
      ["s", "enter", "end"].includes(event.key.toLowerCase()) ||
      event.code === "Space"
    ) {
      event.preventDefault();
      returnToTitle();
    }
    return;
  }

  if (state.phase === "win") {
    if (
      ["s", "enter"].includes(event.key.toLowerCase()) ||
      event.code === "Space"
    ) {
      event.preventDefault();
      quitToLeaderboard();
    }
    return;
  }

  if (state.phase === "ended") {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      state.endActionIndex = state.endActionIndex === 0 ? 1 : 0;
      if (state.endActionIndex === 0) state.quitConfirm = false;
      render();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      state.endActionIndex = 0;
      state.quitConfirm = false;
      render();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      state.endActionIndex = 1;
      render();
      return;
    }

    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      startNextProject();
      return;
    }

    if (event.code === "Space" || event.key === "Enter") {
      event.preventDefault();
      if (state.endActionIndex === 0) {
        startNextProject();
      } else if (state.quitConfirm) {
        quitToLeaderboard();
      } else {
        state.quitConfirm = true;
        render();
      }
    }
    return;
  }

  if (state.phase !== "running") return;

  const currentLevel = zoneLevel(state.selectedZone);
  const currentColumn = visualColumn(state.selectedZone);

  if (usesPlanGrid()) {
    const currentRow = visualRow(state.selectedZone);
    if (event.key === "ArrowUp") {
      state.selectedZone = zoneFromPlanPosition(currentRow - 1, currentColumn);
    } else if (event.key === "ArrowDown") {
      state.selectedZone = zoneFromPlanPosition(currentRow + 1, currentColumn);
    } else if (event.key === "ArrowLeft") {
      state.selectedZone = zoneFromPlanPosition(currentRow, currentColumn - 1);
    } else if (event.key === "ArrowRight") {
      state.selectedZone = zoneFromPlanPosition(currentRow, currentColumn + 1);
    } else if (event.code === "Space") {
      event.preventDefault();
      resolveSelectedRoadblock();
      return;
    } else if (event.key.toLowerCase() === "p") {
      const trade = tradeForSelectedZonePush();
      if (trade) {
        state.selectedTradeIndex = trade.id;
        pushSelectedTrade(trade);
      } else {
        addLog(`No trade to push for zone ${state.selectedZone}.`);
        render();
      }
      return;
    } else {
      return;
    }

    event.preventDefault();
    render();
    return;
  }

  if (event.key === "ArrowUp") {
    const nextLevel = Math.min(levelCount(), currentLevel + 1);
    state.selectedZone = zoneFromLevelAndColumn(nextLevel, currentColumn);
  } else if (event.key === "ArrowDown") {
    const nextLevel = Math.max(1, currentLevel - 1);
    state.selectedZone = zoneFromLevelAndColumn(nextLevel, currentColumn);
  } else if (event.key === "ArrowLeft") {
    const nextColumn = Math.max(1, currentColumn - 1);
    state.selectedZone = zoneFromLevelAndColumn(currentLevel, nextColumn);
  } else if (event.key === "ArrowRight") {
    const nextColumn = Math.min(zonesPerLevel(), currentColumn + 1);
    state.selectedZone = zoneFromLevelAndColumn(currentLevel, nextColumn);
  } else if (event.code === "Space") {
    event.preventDefault();
    resolveSelectedRoadblock();
    return;
  } else if (event.key.toLowerCase() === "p") {
    const trade = tradeForSelectedZonePush();
    if (trade) {
      state.selectedTradeIndex = trade.id;
      pushSelectedTrade(trade);
    } else {
      addLog(`No trade to push for zone ${state.selectedZone}.`);
      render();
    }
    return;
  } else {
    return;
  }

  event.preventDefault();
  render();
});

window.addEventListener("pointerdown", noteUserActivity);
window.addEventListener("touchstart", noteUserActivity, { passive: true });

setRenderCallback(render);
render();
