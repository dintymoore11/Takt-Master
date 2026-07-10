import "./style.css";

import {
  PROJECTS,
  PERIOD_LABEL,
  MODES,
} from "./gameConfig.js";
import { visualForTrade } from "./visualAssets.js";
import {
  hasProjectBackdrop,
  projectBackdrop,
  projectZoneForDirection,
  projectZoneStyle,
  projectZoneOverlayLayers,
  zoneVisualLayers,
} from "./projectVisuals.js";
import {
  buildingAssetForProject,
  uiAsset,
} from "./assets/manifest.js";
import { registerAudioCallbacks, syncGameAudio } from "./audio.js";
import { setupModeIndex, setupView } from "./screens/projectSetupScreen.js";
import {
  nameEntryKeys,
  nameEntryView,
  scoreResultView,
} from "./screens/leaderboardEntryScreen.js";
import { winView } from "./screens/taktLegendScreen.js";
import { titleView } from "./screens/titleScreen.js";
import {
  addLog,
  activeTradeCount,
  campaignLevel,
  currentProject,
  dailyDelayCost,
  FINAL_CAMPAIGN_LEVEL,
  formatMoney,
  gameplayDuration,
  getTrade,
  identifyPlayerRoadblocks,
  isFinalProjectInLevel,
  joinPlayer,
  leaderboardQualifies,
  leavePlayer,
  levelCount,
  liquidatedDamagesPerDay,
  MAX_LEADERBOARD_NAME_LENGTH,
  projectBudget,
  projectDay,
  projectDuration,
  projectTemplateIndex,
  pushPlayerTrade,
  pushSelectedTrade,
  quitToLeaderboard,
  resolvePlayerRoadblock,
  resolveSelectedRoadblock,
  restartAfterLeaderboard,
  resetProject,
  returnToTitle,
  saveLeaderboardScore,
  selectNameKey,
  setPlayerSelectedZone,
  setRenderCallback,
  startCampaign,
  startNextProject,
  state,
  stopTimer,
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
const IDLE_WARNING_SECONDS = 30;
const PROJECT_SELECTOR_HOLD_MS = 3_000;
const MENU_SELECT_CODES = new Set([
  "Space",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
]);
const ARCADE_PLAYERS = [
  {
    index: 0,
    start: ["Digit1"],
    exit: ["Escape"],
    directions: {
      ArrowUp: "ArrowUp",
      ArrowDown: "ArrowDown",
      ArrowLeft: "ArrowLeft",
      ArrowRight: "ArrowRight",
    },
    modes: ["KeyI", "KeyO", "KeyP"],
    resolve: ["KeyJ", "Space"],
    identify: ["KeyK"],
    push: ["KeyL"],
  },
  {
    index: 1,
    start: ["Digit2"],
    exit: ["Backspace"],
    directions: {
      KeyW: "ArrowUp",
      KeyS: "ArrowDown",
      KeyA: "ArrowLeft",
      KeyD: "ArrowRight",
    },
    modes: ["KeyE", "KeyR", "KeyT"],
    resolve: ["KeyF"],
    identify: ["KeyG"],
    push: ["KeyH"],
  },
];
const app = document.querySelector("#app");
let idleReturnTimer = null;
let idleWarningTickTimer = null;
let projectSelectorHoldTimer = null;
let projectSelectorHoldCode = null;
let projectSelectorSuppressExitCode = null;

const GAME_TITLE = "Takt Builder";

function scheduleIdleReturn() {
  if (idleReturnTimer) {
    window.clearTimeout(idleReturnTimer);
    idleReturnTimer = null;
  }

  if (state.phase === "title" || state.idleWarningOpen || state.quitConfirm) return;

  idleReturnTimer = window.setTimeout(() => {
    idleReturnTimer = null;
    if (state.phase !== "title") openIdleWarning();
  }, IDLE_RETURN_MS);
}

function noteUserActivity() {
  if (state.idleWarningOpen || state.quitConfirm) return;
  scheduleIdleReturn();
}

function openQuitConfirmation() {
  if (state.phase === "title") return;

  state.quitConfirm = true;
  state.endActionIndex = 0;
  render({ keepIdleTimer: true });
}

function closeQuitConfirmation() {
  state.quitConfirm = false;
  state.endActionIndex = 0;
  scheduleIdleReturn();
  render({ keepIdleTimer: true });
}

function confirmQuitGame() {
  state.quitConfirm = false;
  state.endActionIndex = 0;
  returnToTitle();
}

function openIdleWarning() {
  if (state.phase === "title") return;

  state.idleWarningOpen = true;
  state.idleWarningRemaining = IDLE_WARNING_SECONDS;
  state.idleWarningActionIndex = 0;
  startIdleWarningCountdown();
  render({ keepIdleTimer: true });
}

function closeIdleWarning({ resume = true } = {}) {
  stopIdleWarningCountdown();
  state.idleWarningOpen = false;
  state.idleWarningRemaining = IDLE_WARNING_SECONDS;
  state.idleWarningActionIndex = 0;
  if (resume) scheduleIdleReturn();
  render({ keepIdleTimer: true });
}

function startIdleWarningCountdown() {
  stopIdleWarningCountdown();
  idleWarningTickTimer = window.setInterval(() => {
    if (!state.idleWarningOpen) {
      stopIdleWarningCountdown();
      return;
    }

    state.idleWarningRemaining = Math.max(0, state.idleWarningRemaining - 1);
    if (state.idleWarningRemaining <= 0) {
      stopIdleWarningCountdown();
      state.idleWarningOpen = false;
      state.idleWarningRemaining = IDLE_WARNING_SECONDS;
      state.idleWarningActionIndex = 0;
      returnToTitle();
      return;
    }

    render({ keepIdleTimer: true });
  }, 1000);
}

function stopIdleWarningCountdown() {
  if (!idleWarningTickTimer) return;
  window.clearInterval(idleWarningTickTimer);
  idleWarningTickTimer = null;
}

function render({ keepIdleTimer = false } = {}) {
  if (!keepIdleTimer) scheduleIdleReturn();
  syncGameAudio();

  if (state.phase === "title") {
    app.innerHTML = withIdleWarning(titleView());
    bindTitle();
    bindIdleWarning();
    bindQuitConfirmation();
    return;
  }

  if (state.phase === "setup") {
    app.innerHTML = withIdleWarning(setupView());
    bindSetup();
    bindIdleWarning();
    bindQuitConfirmation();
    return;
  }

  if (state.phase === "nameEntry") {
    app.innerHTML = withIdleWarning(nameEntryView());
    bindNameEntry();
    bindIdleWarning();
    bindQuitConfirmation();
    return;
  }

  if (state.phase === "gameOver") {
    app.innerHTML = withIdleWarning(gameView());
    bindGame();
    bindIdleWarning();
    bindQuitConfirmation();
    return;
  }

  if (state.phase === "scoreResult") {
    app.innerHTML = withIdleWarning(scoreResultView());
    bindScoreResult();
    bindIdleWarning();
    bindQuitConfirmation();
    return;
  }

  if (state.phase === "win" || state.phase === "gameComplete") {
    app.innerHTML = withIdleWarning(winView());
    bindWin();
    bindIdleWarning();
    bindQuitConfirmation();
    return;
  }

  app.innerHTML = withIdleWarning(gameView());
  bindGame();
  bindIdleWarning();
  bindQuitConfirmation();
}

function withIdleWarning(viewHtml) {
  return `${viewHtml}${idleWarningView()}${quitConfirmationView()}`;
}

function idleWarningView() {
  if (!state.idleWarningOpen) return "";

  return `
    <section class="idle-warning-backdrop" role="dialog" aria-modal="true" aria-labelledby="idle-warning-title">
      <div class="idle-warning-card">
        <h2 id="idle-warning-title">Still There?</h2>
        <div class="idle-countdown" aria-live="polite">
          <strong>${state.idleWarningRemaining}</strong>
          <span>seconds</span>
        </div>
        <div class="idle-warning-actions">
          <button class="idle-warning-button primary ${state.idleWarningActionIndex === 0 ? "selected" : ""}" type="button" data-idle-continue autofocus>Continue</button>
          <button class="idle-warning-button secondary ${state.idleWarningActionIndex === 1 ? "selected" : ""}" type="button" data-idle-quit>Quit</button>
        </div>
      </div>
    </section>
  `;
}

function quitConfirmationView() {
  if (!state.quitConfirm) return "";

  return `
    <section class="quit-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="quit-confirm-title">
      <div class="quit-confirm-card">
        <h2 id="quit-confirm-title">Quit Game?</h2>
        <p>Your current career will end.</p>
        <div class="quit-confirm-actions">
          <button class="quit-confirm-button primary ${state.endActionIndex === 0 ? "selected" : ""}" type="button" data-quit-cancel autofocus>Continue</button>
          <button class="quit-confirm-button danger ${state.endActionIndex === 1 ? "selected" : ""}" type="button" data-quit-confirm>Quit</button>
        </div>
      </div>
    </section>
  `;
}

function selectSetupMode(index) {
  state.setupModeIndex = Math.min(Math.max(index, 0), MODES.length - 1);
  render();
}

function startSetupProject(modeIndex = setupModeIndex()) {
  const mode = MODES[modeIndex];
  if (!mode) return;

  if (state.projectRound === 1 && state.totalProfit === 0) {
    startCampaign(mode);
  } else {
    resetProject(mode);
  }
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
          <span>${GAME_TITLE}</span>
          <button class="fullscreen-fake" type="button" aria-label="Fullscreen preview"></button>
        </footer>
      </section>
      ${state.phase === "ended" || state.phase === "gameOver" ? endScreen() : ""}
    </main>
  `;
}

function topbarTitle(project) {
  return `<strong><span>TAKT</span> BUILDER</strong>`;
}

function projectReadout(project) {
  return `<strong>Project ${state.projectRound}: ${project.name}</strong>`;
}

function dayReadout() {
  return `
    <div class="day-readout">
      <strong>Day <span>${projectDay()}</span> / ${projectDuration()}</strong>
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
    <div class="live-damages ${state.liquidatedDamages === liquidatedDamagesPerDay() ? "first-hit" : ""}">
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
  const currentDay = projectDay();
  const progress = Math.min(100, (currentDay / duration) * 100);
  const overrun = currentDay > duration;
  return `
    <div class="schedule ${overrun ? "overrun" : ""}" aria-label="Project schedule">
      <div class="schedule-meta">
        <span>Start</span>
        <strong>Day ${currentDay} / ${duration}</strong>
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
  const selectedByPlayerOne =
    state.players?.[0]?.active && state.players[0].selectedZone === zoneNumber;
  const selectedByPlayerTwo =
    state.players?.[1]?.active && state.players[1].selectedZone === zoneNumber;
  const selectionClasses = [
    selectedByPlayerOne ? "selected-zone-p1" : "",
    selectedByPlayerTwo ? "selected-zone-p2" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const delayCallout = delayCalloutForZone(zoneNumber);
  return `
    <button
      class="tower-zone ${selectionClasses}"
      data-zone="${zoneNumber}"
      type="button"
      style="${projectZoneStyle(currentProject(), zoneNumber)}"
    >
      <span class="zone-number">${zoneNumber}</span>
      ${playerSelectionRings(selectedByPlayerOne, selectedByPlayerTwo)}
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

function playerSelectionRings(selectedByPlayerOne, selectedByPlayerTwo) {
  if (!selectedByPlayerOne && !selectedByPlayerTwo) return "";

  return `
    <span class="player-selection-rings" aria-hidden="true">
      ${selectedByPlayerOne ? `<span class="player-selection-ring player-selection-ring-p1"></span>` : ""}
      ${selectedByPlayerTwo ? `<span class="player-selection-ring player-selection-ring-p2"></span>` : ""}
    </span>
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
  return `delay -${formatMoney(roadblock.delayDays * dailyDelayCost())}`;
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
  const waiting = trade.delayedToday || trade.waitReason;
  const rolling = state.roundPhase === "rolling" && !trade.finished && !waiting;
  const rolled =
    !rolling &&
    !trade.finished &&
    trade.pendingSteps > 0 &&
    Number.isInteger(trade.lastRoll);
  if (!rolling && !rolled) return "";

  const pushed = trade.pushedUntil > Date.now();
  const diceKey = rolling ? "dice-spin" : `dice-${trade.lastRoll}`;
  return `
    <span class="trade-die ${rolling ? "rolling" : "rolled"} ${pushed ? "pushed" : ""}">
      <img class="die-asset" src="${uiAsset(diceKey)}" alt="" aria-hidden="true">
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
  const selected =
    state.players?.some(
      (player) => player.active && player.selectedZone === roadblock.zone,
    ) ?? state.selectedZone === roadblock.zone;
  const trade = getTrade(roadblock.tradeId);
  const timer = roadblockTimer(roadblock);
  const revealedClass = roadblock.revealAnimationPending
    ? "roadblock-revealed"
    : "";
  roadblock.revealAnimationPending = false;
  return `
    <span class="tower-blocker ${selected ? "selected" : ""} ${revealedClass}" style="--trade-color: ${trade.color}">
      <span class="roadblock-alert" aria-hidden="true">!</span>
      <span class="roadblock-trade">${trade.name}</span>
      <span class="roadblock-days">
        <b class="${timer < 0 ? "negative" : ""}">${timer}</b>
        <small>${Math.abs(timer) === 1 ? "day" : "days"}</small>
      </span>
    </span>
  `;
}

function endScreen() {
  const margin = (state.profit / projectBudget()) * 100;
  const failed = state.gameOver;
  const scheduleVariance = projectDuration() - projectDay();
  const resultTitle = failed ? "Career Over" : "Complete";
  const resultLead = failed
    ? "The project went over budget."
    : "The project finished successfully.";
  const resultSubcopy = failed
    ? "Better planning. Better flow."
    : "Strong flow. Clean handoffs. Keep building.";
  const actionButtons = failed
    ? `<button class="restart selected-action" type="button" data-game-over>${leaderboardQualifies(state.totalProfit) ? "Enter Name" : "Game Over"}</button>`
    : `<button class="restart selected-action" type="button" data-restart>${isFinalProjectInLevel() ? "Finish Round" : "Next Project"}</button>`;
  return `
    <section class="end-modal ${failed ? "end-failure" : "end-success"}" role="dialog" aria-modal="true" aria-label="${failed ? "Career over" : "Project complete"}">
      <header class="end-result-topbar">
        <strong><span>TAKT</span> BUILDER</strong>
        <b>Project ${state.projectRound}: ${currentProject().name}</b>
        <b>Day <span>${projectDay()}</span> / ${projectDuration()}</b>
        <div class="end-profit-badge ${state.profit < 0 ? "bad" : ""}">
          <span>Profit</span>
          <strong>${formatMoney(state.profit)}</strong>
        </div>
      </header>
      <div class="end-screen">
        <header class="end-result-heading">
          <span class="end-result-icon" aria-hidden="true"></span>
          ${state.liquidatedDamages > 0 ? `<div class="damages-flash">Liquidated damages <strong>-${formatMoney(state.liquidatedDamages)}</strong></div>` : ""}
          <div>
            <p class="eyebrow">Project ${state.projectRound}</p>
            <h2>${resultTitle}</h2>
            <p class="end-result-lead">${resultLead}</p>
            <p class="final-score">${resultSubcopy}</p>
          </div>
        </header>
        <div class="end-profit-summary">
          ${endStat("Total profit", `${formatMoney(state.profit)} (${margin.toFixed(1)}%)`, state.profit < 0 ? "bad" : "")}
          ${endStat("Career profit", formatMoney(state.totalProfit), state.totalProfit < 0 ? "bad" : "")}
        </div>
        <div class="end-stats">
          ${endStat(scheduleVariance >= 0 ? "Days early" : "Days behind", `${Math.abs(scheduleVariance)} days`, scheduleVariance < 0 ? "bad" : "")}
          ${endStat("Costs", formatMoney(totalProjectCosts()), failed ? "bad" : "")}
          ${endStat("Schedule efficiency", `${scheduleEfficiency().toFixed(0)}%`, failed ? "bad" : "")}
        </div>
        ${taktPlan()}
        <div class="end-actions">
          ${actionButtons}
        </div>
      </div>
    </section>
  `;
}

function endStat(label, value, tone = "") {
  return `
    <div class="end-stat ${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function scheduleVarianceStat() {
  const variance = projectDuration() - projectDay();
  if (variance >= 0) return stat("Days early", `${variance} days`);
  return stat("Days late", `${Math.abs(variance)} days`, "bad");
}

function taktPlan() {
  const periodCount = Math.max(state.day, gameplayDuration());
  const periods = Array.from({ length: periodCount }, (_, index) => index + 1);
  const labels = scheduleHeaderLabels(periods);
  return `
    <div class="takt-plan">
      <div class="takt-title">
        <strong>As-Built Takt Plan</strong>
        <span>Project day scale</span>
      </div>
      <div class="zone-plan" style="--week-count: ${periodCount}">
        ${tradeLegend()}
        <div class="zone-plan-header">
          <span>Zone</span>
          <div>${labels.map((label) => `<span>${label}</span>`).join("")}</div>
        </div>
        ${Array.from({ length: levelCount() }, (_, index) => index + 1)
          .map((level) => taktLevelGroup(level, periods))
          .join("")}
      </div>
    </div>
  `;
}

function taktLevelGroup(level, periods) {
  return `
    <div class="zone-plan-group">Level ${level}</div>
    ${zonesForPlanLevel(level)
      .map((zone) => taktZoneRow(zone, periods))
      .join("")}
  `;
}

function taktZoneRow(zone, periods) {
  const entries = zonePlanEntries(zone, periods);
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
          title="${trade.name}, ${PERIOD_LABEL.toLowerCase()} ${projectDay(start)}-${projectDay(end)}"
        ></span>
      `,
    )
    .join("");
}

function zonePlanEntries(zone, periods) {
  const spans = state.trades
    .flatMap((trade) => zoneWorkSpans(trade, zone, periods))
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

function scheduleHeaderLabels(periods) {
  const maxDay = projectDay(periods.length);
  const interval = scheduleLabelInterval(maxDay);
  let nextLabel = interval;

  return periods.map((period) => {
    const previousDay = projectDay(period - 1);
    const currentDay = projectDay(period);
    const crossedLabel = previousDay < nextLabel && currentDay >= nextLabel;
    const finalLabel =
      period === periods.length && currentDay > 0 && currentDay < nextLabel;

    if (!crossedLabel && !finalLabel) return "";

    const label = finalLabel ? currentDay : nextLabel;
    while (nextLabel <= currentDay) nextLabel += interval;
    return label;
  });
}

function scheduleLabelInterval(maxDay) {
  const targetLabels = 7;
  const rawInterval = Math.max(1, maxDay / targetLabels);
  const magnitude = 10 ** Math.floor(Math.log10(rawInterval));
  const normalized = rawInterval / magnitude;
  const niceStep =
    normalized <= 1
      ? 1
      : normalized <= 2
        ? 2
        : normalized <= 5
          ? 5
          : 10;
  return niceStep * magnitude;
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

function projectSelectorLevel() {
  return Math.min(
    Math.max(state.projectSelectorLevel ?? 1, 1),
    FINAL_CAMPAIGN_LEVEL,
  );
}

function selectedProjectRound(projectIndex = state.projectSelectorIndex) {
  return (projectSelectorLevel() - 1) * PROJECTS.length + projectIndex + 1;
}

function openProjectSelector() {
  state.projectSelectorOpen = true;
  state.projectSelectorArea = "projects";
  state.projectSelectorLevel = Math.min(
    Math.max(campaignLevel(), 1),
    FINAL_CAMPAIGN_LEVEL,
  );
  state.projectSelectorIndex = projectTemplateIndex();
  render();
}

function closeProjectSelector() {
  state.projectSelectorOpen = false;
  state.projectSelectorArea = "projects";
  projectSelectorSuppressExitCode = null;
  render();
}

function selectProjectSelectorLevel(level) {
  state.projectSelectorLevel = Math.min(
    Math.max(level, 1),
    FINAL_CAMPAIGN_LEVEL,
  );
  state.projectSelectorArea = "levels";
  render();
}

function bindTitle() {
  document.querySelector("[data-start]")?.addEventListener("click", () => {
    state.projectRound = 1;
    state.careerStartRound = 1;
    state.totalProfit = 0;
    state.gameOver = false;
    state.beatGame = false;
    state.projectSelectorOpen = false;
    state.phase = "setup";
    render();
  });

  document.querySelector("[data-project-selector]")?.addEventListener("click", () => {
    openProjectSelector();
  });

  document
    .querySelector("[data-project-selector-close]")
    ?.addEventListener("click", closeProjectSelector);

  document.querySelectorAll("[data-selector-level]").forEach((button) => {
    button.addEventListener("click", () => {
      selectProjectSelectorLevel(Number(button.dataset.selectorLevel));
    });
  });

  document.querySelectorAll("[data-test-project]").forEach((button) => {
    button.addEventListener("click", () => {
      selectTestProject(Number(button.dataset.testProject) - 1);
    });
  });
}

function selectTestProject(index) {
  state.projectRound = selectedProjectRound(index);
  state.careerStartRound = state.projectRound;
  state.projectSelectorIndex = index;
  state.projectSelectorOpen = false;
  state.projectSelectorArea = "projects";
  state.totalProfit = 0;
  state.gameOver = false;
  state.beatGame = false;
  state.phase = "setup";
  render();
}

function projectSelectorColumns() {
  return window.matchMedia("(max-width: 980px)").matches ? 1 : 2;
}

function bindSetup() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      selectSetupMode(Number(button.dataset.mode));
    });
  });

  document
    .querySelector("[data-start-project]")
    ?.addEventListener("click", () => startSetupProject());
}

function bindNameEntry() {
  document
    .querySelector("[data-home]")
    ?.addEventListener("click", restartAfterLeaderboard);
  document
    .querySelector("[data-save-score]")
    ?.addEventListener("click", saveLeaderboardScore);
  document
    .querySelector("[data-skip-score]")
    ?.addEventListener("click", returnToTitle);
  document.querySelectorAll("[data-letter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.nameCursor = Number(button.dataset.letter);
      selectNameKey();
    });
  });
}

function nameEntrySaveIndex() {
  return nameEntryKeys().length;
}

function nameEntrySkipIndex() {
  return nameEntrySaveIndex() + 1;
}

function nameEntryControlCount() {
  return nameEntryKeys().length + 2;
}

function activateNameEntryControl() {
  if (state.nameCursor === nameEntrySaveIndex()) {
    saveLeaderboardScore();
    return;
  }

  if (state.nameCursor === nameEntrySkipIndex()) {
    returnToTitle();
    return;
  }

  selectNameKey();
}

function moveNameEntryCursor(direction) {
  const columns = 7;
  const saveIndex = nameEntrySaveIndex();
  const skipIndex = nameEntrySkipIndex();
  const lastKeyIndex = saveIndex - 1;
  const cursorInLetterGrid = state.nameCursor <= lastKeyIndex;

  if (direction === "left") {
    if (cursorInLetterGrid) {
      const rowStart = Math.floor(state.nameCursor / columns) * columns;
      const rowEnd = Math.min(rowStart + columns - 1, lastKeyIndex);
      state.nameCursor =
        state.nameCursor === rowStart ? rowEnd : state.nameCursor - 1;
    } else {
      state.nameCursor = Math.max(0, state.nameCursor - 1);
    }
    return;
  }

  if (direction === "right") {
    if (cursorInLetterGrid) {
      const rowStart = Math.floor(state.nameCursor / columns) * columns;
      const rowEnd = Math.min(rowStart + columns - 1, lastKeyIndex);
      state.nameCursor =
        state.nameCursor === rowEnd ? rowStart : state.nameCursor + 1;
    } else {
      state.nameCursor = Math.min(
        nameEntryControlCount() - 1,
        state.nameCursor + 1,
      );
    }
    return;
  }

  if (direction === "up") {
    if (state.nameCursor === saveIndex) {
      state.nameCursor = lastKeyIndex - 1;
    } else if (state.nameCursor === skipIndex) {
      state.nameCursor = lastKeyIndex;
    } else {
      state.nameCursor = Math.max(0, state.nameCursor - columns);
    }
    return;
  }

  if (state.nameCursor >= saveIndex) return;

  if (state.nameCursor + columns > lastKeyIndex) {
    state.nameCursor = state.nameCursor % columns < 4 ? saveIndex : skipIndex;
  } else {
    state.nameCursor += columns;
  }
}

function bindScoreResult() {
  document
    .querySelector("[data-home]")
    ?.addEventListener("click", returnToTitle);
}

function bindIdleWarning() {
  document
    .querySelector("[data-idle-continue]")
    ?.addEventListener("click", () => closeIdleWarning());
  document
    .querySelector("[data-idle-quit]")
    ?.addEventListener("click", () => {
      stopIdleWarningCountdown();
      state.idleWarningOpen = false;
      state.idleWarningRemaining = IDLE_WARNING_SECONDS;
      state.idleWarningActionIndex = 0;
      returnToTitle();
    });
}

function bindQuitConfirmation() {
  document
    .querySelector("[data-quit-cancel]")
    ?.addEventListener("click", closeQuitConfirmation);
  document
    .querySelector("[data-quit-confirm]")
    ?.addEventListener("click", confirmQuitGame);
}

function bindWin() {
  document
    .querySelector("[data-continue]")
    ?.addEventListener("click", () => {
      if (state.phase === "gameComplete") {
        finishCareer();
        return;
      }

      startNextProject();
    });
}

function bindGame() {
  document.querySelectorAll("[data-zone]").forEach((button) => {
    button.addEventListener("click", () => {
      setPlayerSelectedZone(0, Number(button.dataset.zone));
      state.focusArea = "zones";
      render();
    });
  });

  document.querySelectorAll("[data-roadblock]").forEach((button) => {
    button.addEventListener("click", () => {
      const roadblock = state.roadblocks[Number(button.dataset.roadblock)];
      if (roadblock) setPlayerSelectedZone(0, roadblock.zone);
      state.focusArea = "zones";
      render();
    });
  });

  document.querySelector("[data-restart]")?.addEventListener("click", () => {
    restartEndProject();
  });

  document.querySelector("[data-game-over]")?.addEventListener("click", () => {
    finishCareer();
  });

}

function finishCareer() {
  if (!leaderboardQualifies(state.totalProfit)) {
    returnToTitle();
    return;
  }

  quitToLeaderboard();
}

function restartEndProject() {
  stopTimer();
  if (state.gameOver) {
    finishCareer();
    return;
  }

  startNextProject();
}

function arcadeControlForEvent(event) {
  return ARCADE_PLAYERS.find((player) => {
    const codes = [
      ...player.start,
      ...player.exit,
      ...Object.keys(player.directions),
      ...player.modes,
      ...player.resolve,
      ...player.identify,
      ...player.push,
    ];
    return codes.includes(event.code);
  });
}

function arcadeModeIndexForEvent(control, event) {
  return control.modes.findIndex((code) => code === event.code);
}

function arcadeDirectionForEvent(control, event) {
  return control.directions[event.code];
}

function zoneForDirection(zone, direction) {
  const currentLevel = zoneLevel(zone);
  const currentColumn = visualColumn(zone);

  if (usesPlanGrid()) {
    const spatialZone = projectZoneForDirection(currentProject(), zone, direction);
    if (spatialZone !== undefined) return spatialZone;

    const currentRow = visualRow(zone);
    if (direction === "ArrowUp") {
      return zoneFromPlanPosition(currentRow - 1, currentColumn);
    }
    if (direction === "ArrowDown") {
      return zoneFromPlanPosition(currentRow + 1, currentColumn);
    }
    if (direction === "ArrowLeft") {
      return zoneFromPlanPosition(currentRow, currentColumn - 1);
    }
    if (direction === "ArrowRight") {
      return zoneFromPlanPosition(currentRow, currentColumn + 1);
    }
    return zone;
  }

  if (direction === "ArrowUp") {
    return zoneFromLevelAndColumn(Math.min(levelCount(), currentLevel + 1), currentColumn);
  }
  if (direction === "ArrowDown") {
    return zoneFromLevelAndColumn(Math.max(1, currentLevel - 1), currentColumn);
  }
  if (direction === "ArrowLeft") {
    return zoneFromLevelAndColumn(currentLevel, Math.max(1, currentColumn - 1));
  }
  if (direction === "ArrowRight") {
    return zoneFromLevelAndColumn(
      currentLevel,
      Math.min(zonesPerLevel(), currentColumn + 1),
    );
  }
  return zone;
}

function handleArcadeControl(event) {
  if (state.phase === "nameEntry") return false;

  const control = arcadeControlForEvent(event);
  if (!control) return false;

  const playerIndex = control.index;
  const direction = arcadeDirectionForEvent(control, event);
  const modeIndex = arcadeModeIndexForEvent(control, event);

  if (control.start.includes(event.code)) {
    event.preventDefault();
    if (state.phase === "title" && state.projectSelectorOpen) {
      activateProjectSelectorControl();
      return true;
    }
    joinPlayer(playerIndex);
    if (state.phase === "title" && !state.projectSelectorOpen) {
      state.phase = "setup";
      render();
    }
    return true;
  }

  if (control.exit.includes(event.code)) {
    event.preventDefault();
    if (
      state.phase === "title" &&
      state.projectSelectorOpen &&
      projectSelectorSuppressExitCode === event.code
    ) {
      return true;
    }
    if (state.phase === "title" && state.projectSelectorOpen) {
      closeProjectSelector();
    } else if (playerIndex > 0 && state.players?.[playerIndex]?.active) {
      leavePlayer(playerIndex);
    } else if (state.phase !== "title") {
      openQuitConfirmation();
    }
    return true;
  }

  if (state.phase === "title" && state.projectSelectorOpen && direction) {
    event.preventDefault();
    moveProjectSelector(direction);
    render();
    return true;
  }

  if (state.phase === "setup" && modeIndex >= 0) {
    event.preventDefault();
    state.setupModeIndex = modeIndex;
    startSetupProject(modeIndex);
    return true;
  }

  if (state.phase === "setup" && direction) {
    event.preventDefault();
    if (direction === "ArrowLeft" || direction === "ArrowUp") {
      selectSetupMode(setupModeIndex() - 1);
    } else {
      selectSetupMode(setupModeIndex() + 1);
    }
    return true;
  }

  if (state.phase !== "running") return false;

  if (!state.players?.[playerIndex]?.active) {
    if (playerIndex > 0) joinPlayer(playerIndex);
    else return false;
  }

  if (direction) {
    event.preventDefault();
    const currentZone = state.players[playerIndex].selectedZone;
    setPlayerSelectedZone(playerIndex, zoneForDirection(currentZone, direction));
    render();
    return true;
  }

  if (control.resolve.includes(event.code)) {
    event.preventDefault();
    resolvePlayerRoadblock(playerIndex);
    return true;
  }

  if (control.identify.includes(event.code)) {
    event.preventDefault();
    identifyPlayerRoadblocks(playerIndex);
    return true;
  }

  if (control.push.includes(event.code)) {
    event.preventDefault();
    pushPlayerTrade(playerIndex);
    return true;
  }

  return false;
}

function isExitControlCode(code) {
  return ARCADE_PLAYERS.some((player) => player.exit.includes(code));
}

function isMenuSelectEvent(event) {
  return event.key === "Enter" || MENU_SELECT_CODES.has(event.code);
}

function startProjectSelectorHold(event) {
  if (
    state.phase !== "title" ||
    state.projectSelectorOpen ||
    !isExitControlCode(event.code)
  ) {
    return false;
  }

  event.preventDefault();
  if (event.repeat || projectSelectorHoldTimer) return true;

  projectSelectorHoldCode = event.code;
  projectSelectorHoldTimer = window.setTimeout(() => {
    projectSelectorSuppressExitCode = projectSelectorHoldCode;
    projectSelectorHoldTimer = null;
    projectSelectorHoldCode = null;
    openProjectSelector();
  }, PROJECT_SELECTOR_HOLD_MS);
  return true;
}

function cancelProjectSelectorHold(code = null) {
  if (code && projectSelectorHoldCode && code !== projectSelectorHoldCode) return;
  if (projectSelectorHoldTimer) {
    window.clearTimeout(projectSelectorHoldTimer);
    projectSelectorHoldTimer = null;
  }
  projectSelectorHoldCode = null;
  if (!code || code === projectSelectorSuppressExitCode) {
    projectSelectorSuppressExitCode = null;
  }
}

function moveProjectSelector(direction) {
  const columnCount = projectSelectorColumns();
  const lastProjectIndex = PROJECTS.length - 1;

  if (state.projectSelectorArea === "levels") {
    if (direction === "ArrowLeft") {
      state.projectSelectorLevel = Math.max(1, projectSelectorLevel() - 1);
    } else if (direction === "ArrowRight") {
      state.projectSelectorLevel = Math.min(
        FINAL_CAMPAIGN_LEVEL,
        projectSelectorLevel() + 1,
      );
    } else if (direction === "ArrowDown") {
      state.projectSelectorArea = "projects";
    } else if (direction === "ArrowUp") {
      state.projectSelectorArea = "close";
    }
    return;
  }

  if (state.projectSelectorArea === "close") {
    if (direction === "ArrowUp") {
      state.projectSelectorArea = "projects";
      state.projectSelectorIndex = Math.min(state.projectSelectorIndex, lastProjectIndex);
    } else if (direction === "ArrowDown") {
      state.projectSelectorArea = "levels";
    }
    return;
  }

  if (direction === "ArrowLeft") {
    state.projectSelectorIndex = Math.max(0, state.projectSelectorIndex - 1);
  } else if (direction === "ArrowRight") {
    state.projectSelectorIndex = Math.min(lastProjectIndex, state.projectSelectorIndex + 1);
  } else if (direction === "ArrowUp") {
    const previousIndex = state.projectSelectorIndex - columnCount;
    if (previousIndex < 0) {
      state.projectSelectorArea = "levels";
    } else {
      state.projectSelectorIndex = previousIndex;
    }
  } else if (direction === "ArrowDown") {
    const nextIndex = state.projectSelectorIndex + columnCount;
    if (nextIndex > lastProjectIndex) {
      state.projectSelectorArea = "close";
    } else {
      state.projectSelectorIndex = nextIndex;
    }
  }
}

function activateProjectSelectorControl() {
  if (state.projectSelectorArea === "close") {
    closeProjectSelector();
    return;
  }

  if (state.projectSelectorArea === "levels") {
    render();
    return;
  }

  selectTestProject(state.projectSelectorIndex);
}

window.addEventListener("keydown", (event) => {
  noteUserActivity();

  if (startProjectSelectorHold(event)) {
    return;
  }

  if (state.idleWarningOpen) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      state.idleWarningActionIndex = state.idleWarningActionIndex === 0 ? 1 : 0;
      render({ keepIdleTimer: true });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      state.idleWarningActionIndex = 0;
      render({ keepIdleTimer: true });
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      state.idleWarningActionIndex = 1;
      render({ keepIdleTimer: true });
      return;
    }

    if (isMenuSelectEvent(event)) {
      event.preventDefault();
      if (state.idleWarningActionIndex === 0) {
        closeIdleWarning();
      } else {
        stopIdleWarningCountdown();
        state.idleWarningOpen = false;
        state.idleWarningRemaining = IDLE_WARNING_SECONDS;
        state.idleWarningActionIndex = 0;
        returnToTitle();
      }
      return;
    }

    return;
  }

  if (state.quitConfirm) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeQuitConfirmation();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      state.endActionIndex = state.endActionIndex === 0 ? 1 : 0;
      render({ keepIdleTimer: true });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      state.endActionIndex = 0;
      render({ keepIdleTimer: true });
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      state.endActionIndex = 1;
      render({ keepIdleTimer: true });
      return;
    }

    if (isMenuSelectEvent(event)) {
      event.preventDefault();
      if (state.endActionIndex === 0) {
        closeQuitConfirmation();
      } else {
        confirmQuitGame();
      }
      return;
    }

    return;
  }

  if (handleArcadeControl(event)) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    if (state.phase === "title" && state.projectSelectorOpen) {
      state.projectSelectorOpen = false;
      render();
      return;
    }
    if (state.phase !== "title") {
      openQuitConfirmation();
    }
    return;
  }

  if (state.phase === "title") {
    if (state.projectSelectorOpen) {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        moveProjectSelector(event.key);
      } else if (isMenuSelectEvent(event)) {
        event.preventDefault();
        activateProjectSelectorControl();
        return;
      } else {
        return;
      }

      event.preventDefault();
      render();
      return;
    }

    if (
      event.key.toLowerCase() === "s" ||
      event.key === "Enter" ||
      MENU_SELECT_CODES.has(event.code)
    ) {
      event.preventDefault();
      state.phase = "setup";
      render();
      return;
    }

    return;
  }

  if (state.phase === "setup") {
    if (["1", "2", "3"].includes(event.key)) {
      event.preventDefault();
      state.setupModeIndex = Number(event.key) - 1;
      startSetupProject(state.setupModeIndex);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectSetupMode(setupModeIndex() - 1);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectSetupMode(setupModeIndex() + 1);
      return;
    }

    if (
      isMenuSelectEvent(event) ||
      event.key.toLowerCase() === "s"
    ) {
      event.preventDefault();
      startSetupProject();
    }
    return;
  }

  if (state.phase === "nameEntry") {
    if (event.key === "ArrowLeft") {
      moveNameEntryCursor("left");
    } else if (event.key === "ArrowRight") {
      moveNameEntryCursor("right");
    } else if (event.key === "ArrowUp") {
      moveNameEntryCursor("up");
    } else if (event.key === "ArrowDown") {
      moveNameEntryCursor("down");
    } else if (isMenuSelectEvent(event)) {
      event.preventDefault();
      activateNameEntryControl();
      return;
    } else if (event.key === "End") {
      event.preventDefault();
      saveLeaderboardScore();
      return;
    } else if (event.key === "Backspace") {
      event.preventDefault();
      state.scoreName = state.scoreName.slice(0, -1);
    } else if (/^[a-z]$/i.test(event.key)) {
      event.preventDefault();
      if (state.scoreName.length < MAX_LEADERBOARD_NAME_LENGTH) {
        state.scoreName += event.key.toUpperCase();
      }
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
      MENU_SELECT_CODES.has(event.code)
    ) {
      event.preventDefault();
      returnToTitle();
    }
    return;
  }

  if (state.phase === "win" || state.phase === "gameComplete") {
    if (
      ["s", "enter"].includes(event.key.toLowerCase()) ||
      MENU_SELECT_CODES.has(event.code)
    ) {
      event.preventDefault();
      if (state.phase === "gameComplete") {
        finishCareer();
      } else {
        startNextProject();
      }
    }
    return;
  }

  if (state.phase === "ended" || state.phase === "gameOver") {
    if (state.gameOver) {
      if (
        event.key.toLowerCase() === "s" ||
        isMenuSelectEvent(event)
      ) {
        event.preventDefault();
        finishCareer();
      }
      return;
    }

    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      restartEndProject();
      return;
    }

    if (isMenuSelectEvent(event)) {
      event.preventDefault();
      if (state.endActionIndex === 0) {
        restartEndProject();
      }
    }
    return;
  }

  if (state.phase !== "running") return;

  const currentLevel = zoneLevel(state.selectedZone);
  const currentColumn = visualColumn(state.selectedZone);

  if (usesPlanGrid()) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      const spatialZone = projectZoneForDirection(
        currentProject(),
        state.selectedZone,
        event.key,
      );
      if (spatialZone !== undefined) {
        state.selectedZone = spatialZone;
        event.preventDefault();
        render();
        return;
      }
    }

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
window.addEventListener("keyup", (event) => {
  cancelProjectSelectorHold(event.code);
});
window.addEventListener("blur", () => {
  cancelProjectSelectorHold();
});

setRenderCallback(render);
registerAudioCallbacks();
render();
