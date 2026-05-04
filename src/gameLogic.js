import {
  PROJECTS,
  ROLL_MS,
  MOVE_STEP_MS,
  ROUND_PAUSE_MS,
  BASE_PROJECT_BUDGET,
  BASE_PROJECT_DURATION,
  DAILY_DELAY_COST,
  PUSH_COST,
  LIQUIDATED_DAMAGES_PER_DAY,
  ROADBLOCK_SPAWN_CHANCE,
  NAME_KEYS,
  NAME_ACTIONS,
} from "./gameConfig.js";
import { createInitialState, createTradeState } from "./gameState.js";

let renderCallback = () => {};

export function setRenderCallback(callback) {
  renderCallback = callback;
}

function notifyRender() {
  renderCallback();
}

export const state = createInitialState();

export function createTrades() {
  return tradeTemplates().map(createTradeState);
}

export function currentProject() {
  return PROJECTS[Math.min(state.projectRound - 1, PROJECTS.length - 1)];
}

export function tradeTemplates() {
  return currentProject().trades;
}

export function zoneCount() {
  return currentProject().levels * currentProject().zonesPerLevel;
}

export function zonesPerLevel() {
  return currentProject().zonesPerLevel;
}

export function zoneColumns() {
  return currentProject().zoneColumns ?? zonesPerLevel();
}

export function levelCount() {
  return currentProject().levels;
}

export function visibleLevels() {
  return Array.from(
    { length: levelCount() },
    (_, index) => levelCount() - index,
  );
}

export function startCampaign(mode) {
  state.projectRound = 1;
  state.totalProfit = 0;
  state.gameOver = false;
  resetProject(mode);
}

export function resetProject(mode) {
  stopTimer();
  state.phase = "running";
  state.roundPhase = "rolling";
  state.mode = mode;
  state.gameOver = false;
  state.day = 0;
  state.profit = projectBudget();
  state.laborCost = 0;
  state.pushCost = 0;
  state.delayCost = 0;
  state.totalDelayDays = 0;
  state.liquidatedDamages = 0;
  state.selectedTradeIndex = 0;
  state.selectedZone = 1;
  state.focusArea = "zones";
  state.selectedRoadblockIndex = 0;
  state.trades = createTrades();
  state.roadblocks = [];
  state.lastTradeByZone = {};
  state.scoreName = "";
  state.scoreSaved = false;
  state.quitConfirm = false;
  state.endActionIndex = 0;
  state.logs = [`Project started with ${mode.name}.`];
  startRound();
}

export function startNextProject() {
  if (state.projectRound >= PROJECTS.length) {
    quitToLeaderboard();
    return;
  }
  state.projectRound += 1;
  state.quitConfirm = false;
  state.phase = "setup";
  state.mode = null;
  state.endActionIndex = 0;
  notifyRender();
}

export function startRound() {
  if (state.phase !== "running") return;

  state.day += 1;
  state.roundPhase = "rolling";
  state.zoneWorkThisRound = new Set();
  state.trades.forEach((trade) => {
    trade.delayedToday = false;
    trade.pendingSteps = 0;
    trade.waitReason = "";
    trade.lastRoll = trade.finished ? trade.lastRoll : null;
    trade.previousZone = null;
    if (trade.frustratedUntil < Date.now()) trade.frustrationReason = "";
  });
  maybeSpawnRoadblock();
  rollForTrades();
  notifyRender();
  state.timer = window.setTimeout(startMovementPhase, ROLL_MS);
}

export function rollForTrades() {
  state.trades.forEach((trade, index) => {
    if (index >= activeTradeCount()) return;
    if (trade.finished) return;

    const activeRoadblock = tradeBlockedByRoadblock(trade);
    if (activeRoadblock) {
      trade.delayedToday = true;
      trade.waitReason = "roadblock";
      markTradeFrustrated(trade, "roadblock");
      reduceMorale(trade, 6);
      addLog(`${trade.name} lost a day to ${activeRoadblock.label}.`);
      return;
    }

    if (trade.zone > 0) {
      trade.zoneStarts[trade.zone] = trade.zoneStarts[trade.zone] ?? state.day;
      recordZoneWork(trade, trade.zone);
    }

    const roll = randomFrom(state.mode.dice);
    trade.lastRoll = roll;
    trade.pendingSteps = roll;
  });
}

export function activeTradeCount() {
  return Math.min(state.day, state.trades.length);
}

export function startMovementPhase() {
  if (state.phase !== "running") return;

  state.roundPhase = "moving";
  moveTradesOneStep();
}

export function moveTradesOneStep() {
  if (state.phase !== "running") return;

  const moved = advanceTradesOneStep();
  notifyRender();

  const stillMoving = state.trades.some(
    (trade) => !trade.finished && trade.pendingSteps > 0 && !trade.delayedToday,
  );

  if (moved && stillMoving) {
    state.timer = window.setTimeout(moveTradesOneStep, moveStepMs());
    return;
  }

  if (moved) {
    state.timer = window.setTimeout(finishRound, moveStepMs());
    return;
  }

  finishRound();
}

export function finishRound() {
  state.roundPhase = "settling";
  state.trades.forEach((trade) => {
    trade.previousZone = null;
  });
  collectDailyCosts();
  updateRoadblockDelays();
  updateLiquidatedDamages();
  cleanupResolvedRoadblocks();

  if (state.trades.every((trade) => trade.finished)) {
    endProject();
  }

  notifyRender();
  if (state.phase === "running") {
    state.timer = window.setTimeout(startRound, roundPauseMs());
  }
}

export function advanceTradesOneStep() {
  let moved = false;
  const movingTrades = [...state.trades]
    .filter(
      (trade) =>
        !trade.finished && trade.pendingSteps > 0 && !trade.delayedToday,
    )
    .sort((a, b) => b.zone - a.zone);

  movingTrades.forEach((trade) => {
    const activeRoadblock = tradeBlockedByRoadblock(trade);

    if (activeRoadblock) {
      trade.delayedToday = true;
      trade.waitReason = "roadblock";
      trade.pendingSteps = 0;
      markTradeFrustrated(trade, "roadblock");
      reduceMorale(trade, 6);
      addLog(`${trade.name} lost a day to ${activeRoadblock.label}.`);
      return;
    }

    if (!moveTradeOneZone(trade)) {
      if (trade.waitReason === "blocked") {
        reduceMorale(trade, 4);
      }
      trade.pendingSteps = 0;
      return;
    }

    moved = true;
  });

  return moved;
}

export function moveTradeOneZone(trade) {
  const targetZone = trade.zone + 1;
  if (targetZone <= zoneCount()) {
    const occupant = zoneOccupant(targetZone, trade.id);
    if (occupant) {
      trade.delayedToday = true;
      trade.waitReason = "blocked";
      markTradeFrustrated(trade, "blocked");
      addLog(
        `${trade.name} waited for ${occupant.name} to clear zone ${targetZone}.`,
      );
      return false;
    }
    if (state.zoneWorkThisRound.has(targetZone)) {
      trade.delayedToday = true;
      trade.waitReason = "spacing";
      addLog(
        `${trade.name} waited because zone ${targetZone} was already worked today.`,
      );
      return false;
    }
  }

  const previousZone = trade.zone;
  trade.previousZone = previousZone;
  trade.zone = targetZone;
  trade.progress = 0;
  trade.pendingSteps = Math.max(0, trade.pendingSteps - 1);

  if (trade.zone > zoneCount()) {
    if (previousZone > 0) state.lastTradeByZone[previousZone] = trade.id;
    trade.zone = zoneCount();
    trade.finished = true;
    trade.pendingSteps = 0;
    trade.finishDay = state.day;
    addLog(`${trade.name} completed zone ${zoneCount()}.`);
  } else {
    if (previousZone > 0) state.lastTradeByZone[previousZone] = trade.id;
    trade.zoneStarts[trade.zone] = trade.zoneStarts[trade.zone] ?? state.day;
    recordZoneWork(trade, trade.zone);
  }

  return true;
}

export function recordZoneWork(trade, zone) {
  state.zoneWorkThisRound.add(zone);
  trade.zoneWorkWeeks[zone] = trade.zoneWorkWeeks[zone] ?? [];
  if (!trade.zoneWorkWeeks[zone].includes(state.day)) {
    trade.zoneWorkWeeks[zone].push(state.day);
  }
}

export function markTradeFrustrated(trade, reason) {
  trade.frustratedUntil = Date.now() + 1800;
  trade.frustrationReason = reason;
  window.setTimeout(notifyRender, 1850);
}

export function tradeBlockedByRoadblock(trade) {
  return state.roadblocks.find(
    (roadblock) =>
      !roadblock.resolved &&
      roadblock.tradeId === trade.id &&
      roadblock.zone <= trade.zone,
  );
}

export function zoneOccupant(zone, tradeId) {
  return state.trades.find(
    (trade) => !trade.finished && trade.id !== tradeId && trade.zone === zone,
  );
}

export function collectDailyCosts() {
  state.trades.forEach((trade) => {
    if (trade.finished || trade.zone === 0) return;
    const moraleMultiplier = 1 + (100 - trade.morale) / 100;
    const cost = Math.round(trade.baseCost * moraleMultiplier);
    state.laborCost += cost;
    state.profit -= cost;
  });
}

export function maybeSpawnRoadblock() {
  if (Math.random() > roadblockSpawnChance()) return;

  const candidates = state.trades.filter(
    (trade, index) =>
      index < activeTradeCount() && !trade.finished && trade.zone < zoneCount(),
  );
  if (candidates.length === 0) return;

  const trade = randomFrom(candidates);
  const minZone = Math.min(zoneCount(), trade.zone + 1);
  const maxZone = Math.min(zoneCount(), trade.zone + 5);
  const zone = randomInt(minZone, maxZone);
  const alreadyExists = state.roadblocks.some(
    (roadblock) => !roadblock.resolved && roadblock.zone === zone,
  );
  if (alreadyExists) return;

  state.roadblocks.push({
    id: crypto.randomUUID(),
    tradeId: trade.id,
    zone,
    label: randomFrom([
      "Permit hold",
      "Missing material",
      "Design answer",
      "Inspection issue",
    ]),
    visualKey: "barricade",
    resolved: false,
    delayDays: 0,
  });
  addLog(`Roadblock spawned for ${trade.name} at zone ${zone}.`);
}

export function roadblockSpawnChance() {
  return Math.min(
    0.78,
    ROADBLOCK_SPAWN_CHANCE + (state.projectRound - 1) * 0.055,
  );
}

export function projectBudget() {
  return BASE_PROJECT_BUDGET;
}

export function projectDuration() {
  return Math.max(20, BASE_PROJECT_DURATION - (state.projectRound - 1) * 2);
}

export function moveStepMs() {
  return Math.max(150, MOVE_STEP_MS - (state.projectRound - 1) * 18);
}

export function roundPauseMs() {
  return Math.max(300, ROUND_PAUSE_MS - (state.projectRound - 1) * 22);
}

export function updateLiquidatedDamages() {
  if (state.day <= projectDuration()) return;
  state.liquidatedDamages += LIQUIDATED_DAMAGES_PER_DAY;
  state.profit -= LIQUIDATED_DAMAGES_PER_DAY;
}

export function updateRoadblockDelays() {
  state.roadblocks.forEach((roadblock) => {
    if (roadblock.resolved) return;
    const trade = state.trades[roadblock.tradeId];
    if (trade.zone >= roadblock.zone && !trade.finished) {
      roadblock.delayDays += 1;
      state.totalDelayDays += 1;
      state.delayCost += DAILY_DELAY_COST;
      state.profit -= DAILY_DELAY_COST;
    }
  });
}

export function cleanupResolvedRoadblocks() {
  state.roadblocks = state.roadblocks.filter(
    (roadblock) => !roadblock.resolved,
  );
}

export function resolveSelectedRoadblock() {
  if (state.phase !== "running") return;
  const roadblock = state.roadblocks.find(
    (item) => item.zone === state.selectedZone,
  );
  if (!roadblock) {
    addLog(`No roadblock in zone ${state.selectedZone}.`);
    notifyRender();
    return;
  }
  roadblock.resolved = true;
  addLog(`${getTrade(roadblock.tradeId).name} roadblock resolved.`);
  cleanupResolvedRoadblocks();
  notifyRender();
}

export function pushSelectedTrade(
  targetTrade = state.trades[state.selectedTradeIndex],
) {
  if (state.phase !== "running") return;

  const trade = targetTrade;
  if (!trade || trade.finished) return;

  const activeRoadblock = state.roadblocks.find(
    (roadblock) =>
      !roadblock.resolved &&
      roadblock.tradeId === trade.id &&
      roadblock.zone <= trade.zone,
  );
  if (activeRoadblock) {
    addLog(`${trade.name} cannot push through ${activeRoadblock.label}.`);
    notifyRender();
    return;
  }

  trade.pushes += 1;
  trade.pendingSteps += 1;
  trade.lastRoll = Math.min(
    Math.max(trade.lastRoll ?? 0, 0) + 1,
    Math.max(...state.mode.dice),
  );
  trade.pushedUntil = Date.now() + 1800;
  trade.pushFlash = `-${formatMoney(PUSH_COST)}`;
  reduceMorale(trade, 9);
  state.pushCost += PUSH_COST;
  state.profit -= PUSH_COST;
  addLog(`${trade.name} pushed for ${formatMoney(PUSH_COST)}.`);
  notifyRender();
  window.setTimeout(notifyRender, 1850);
}

export function endProject() {
  stopTimer();
  applyLiquidatedDamages();
  state.totalProfit += state.profit;
  state.gameOver = state.profit < 0;
  state.phase = state.gameOver
    ? "gameOver"
    : state.projectRound >= PROJECTS.length
      ? "win"
      : "ended";
  state.quitConfirm = false;
  state.endActionIndex = 0;
  if (state.gameOver) {
    state.scoreName = "";
    state.scoreSaved = false;
    state.nameCursor = 0;
  }
  addLog(`Project finished on day ${state.day}.`);
}

export function quitToLeaderboard() {
  state.phase = "nameEntry";
  state.scoreName = "";
  state.scoreSaved = false;
  state.nameCursor = 0;
  state.quitConfirm = false;
  notifyRender();
}

export function returnToTitle() {
  stopTimer();
  state.phase = "title";
  state.roundPhase = "idle";
  state.mode = null;
  state.projectRound = 1;
  state.totalProfit = 0;
  state.gameOver = false;
  state.scoreName = "";
  state.scoreSaved = false;
  state.nameCursor = 0;
  state.quitConfirm = false;
  state.endActionIndex = 0;
  notifyRender();
}

export function applyLiquidatedDamages() {
  state.liquidatedDamages = Math.max(
    state.liquidatedDamages,
    Math.max(0, state.day - projectDuration()) * LIQUIDATED_DAMAGES_PER_DAY,
  );
}

export function stopTimer() {
  if (state.timer) {
    window.clearTimeout(state.timer);
    state.timer = null;
  }
}

export function addLog(message) {
  state.logs = [message, ...state.logs].slice(0, 7);
}

export function reduceMorale(trade, amount) {
  trade.morale = Math.max(0, trade.morale - amount);
}

export function getTrade(id) {
  return state.trades.find((trade) => trade.id === id);
}

export function tradeForSelectedZonePush() {
  return (
    state.trades.find(
      (trade) => !trade.finished && trade.zone === state.selectedZone,
    ) ?? getTrade(state.lastTradeByZone[state.selectedZone])
  );
}

export function roadblockTimer(roadblock) {
  const trade = getTrade(roadblock.tradeId);
  const distance = roadblock.zone - trade.zone;
  if (distance <= 0) return -roadblock.delayDays;
  return distance;
}

export function zoneLevel(zone) {
  return Math.ceil(zone / zonesPerLevel());
}

export function zoneBay(zone) {
  return ((zone - 1) % zonesPerLevel()) + 1;
}

export function tradeLocation(trade) {
  const steps =
    trade.pendingSteps > 0
      ? ` · ${trade.pendingSteps} step${trade.pendingSteps === 1 ? "" : "s"} left`
      : "";
  if (trade.finished) return "Complete";
  if (trade.zone === 0) return `Ready queue${steps}`;
  return `Story ${zoneLevel(trade.zone)} · Bay ${zoneBay(trade.zone)}${steps}`;
}

export function visualColumn(zone) {
  const bay = zoneBay(zone);
  if (usesPlanGrid()) {
    const row = Math.ceil(bay / zoneColumns());
    const column = ((bay - 1) % zoneColumns()) + 1;
    return row % 2 === 0 ? zoneColumns() - column + 1 : column;
  }
  return zoneLevel(zone) % 2 === 0 ? zonesPerLevel() - bay + 1 : bay;
}

export function visualRow(zone) {
  return Math.ceil(zoneBay(zone) / zoneColumns());
}

export function usesPlanGrid() {
  return [
    "data-center",
    "wind-farm",
    "housing",
    "solar-farm",
    "airport",
    "hotel-site",
  ].includes(currentProject().type);
}

export function zoneFromLevelAndColumn(level, column) {
  const clampedLevel = Math.max(1, Math.min(levelCount(), level));
  const bay = clampedLevel % 2 === 0 ? zonesPerLevel() - column + 1 : column;
  return (clampedLevel - 1) * zonesPerLevel() + bay;
}

export function zoneFromPlanPosition(row, column) {
  const clampedRow = Math.max(
    1,
    Math.min(Math.ceil(zonesPerLevel() / zoneColumns()), row),
  );
  const clampedColumn = Math.max(1, Math.min(zoneColumns(), column));
  const visualColumn =
    clampedRow % 2 === 0 ? zoneColumns() - clampedColumn + 1 : clampedColumn;
  const bay = Math.min(
    zonesPerLevel(),
    (clampedRow - 1) * zoneColumns() + visualColumn,
  );
  return bay;
}

export function zonesForLevel(level) {
  const firstZone = (level - 1) * zonesPerLevel() + 1;
  const zones = Array.from(
    { length: zonesPerLevel() },
    (_, index) => firstZone + index,
  );
  if (usesPlanGrid()) {
    return Array.from(
      { length: Math.ceil(zones.length / zoneColumns()) },
      (_, rowIndex) => {
        const row = zones.slice(
          rowIndex * zoneColumns(),
          rowIndex * zoneColumns() + zoneColumns(),
        );
        return rowIndex % 2 === 1 ? row.reverse() : row;
      },
    ).flat();
  }
  return level % 2 === 0 ? zones.reverse() : zones;
}

export function moraleFace(trade) {
  if (trade.pushedUntil > Date.now()) return "😡";
  const { morale } = trade;
  if (morale >= 80) return "😊";
  if (morale >= 55) return "🙂";
  if (morale >= 30) return "☹️";
  return "😡";
}

export function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function leaderboardQualifies(score) {
  const rows = loadLeaderboard();
  if (rows.length < 8) return true;
  return score > Math.min(...rows.map((row) => row.earnings));
}

export function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem("taktTowersLeaderboard") ?? "[]");
  } catch {
    return [];
  }
}

export function saveLeaderboardScore() {
  if (state.scoreSaved) return;
  if (!leaderboardQualifies(state.totalProfit)) {
    state.phase = "scoreResult";
    notifyRender();
    return;
  }
  const name =
    (state.scoreName || "AAA").trim().toUpperCase().slice(0, 12) || "AAA";
  const rows = [
    ...loadLeaderboard(),
    { name, project: state.projectRound, earnings: state.totalProfit },
  ]
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 8);

  localStorage.setItem("taktTowersLeaderboard", JSON.stringify(rows));
  state.scoreName = name;
  state.scoreSaved = true;
  notifyRender();
}

export function restartAfterLeaderboard() {
  returnToTitle();
}

export function continueFromGameOver() {
  state.phase = leaderboardQualifies(state.totalProfit)
    ? "nameEntry"
    : "scoreResult";
  notifyRender();
}

export function selectNameKey() {
  const key = [...NAME_KEYS, ...NAME_ACTIONS][state.nameCursor];
  if (key === "SPACE") {
    if (state.scoreName.length < 12) state.scoreName += " ";
  } else if (key === "DEL") {
    state.scoreName = state.scoreName.slice(0, -1);
  } else if (key === "SAVE") {
    saveLeaderboardScore();
    return;
  } else if (state.scoreName.length < 12) {
    state.scoreName += key;
  }
  notifyRender();
}
