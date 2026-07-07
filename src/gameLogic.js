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

const LEADERBOARD_LIMIT = 20;
export const MAX_LEADERBOARD_NAME_LENGTH = 30;
export const FINAL_CAMPAIGN_LEVEL = 10;
const PUSH_COST_MARKUP = 1.12;
const LEVEL_TIGHTENING_TARGET = 10;

let renderCallback = () => {};
let workerBlockedCallback = () => {};
let workerPushedCallback = () => {};
let workerWorkCallback = () => {};
let roadblockAppearedCallback = () => {};
let roadblockResolvedCallback = () => {};
let workerRoadblockedCallback = () => {};
let rollDurationMs = ROLL_MS;

export function setRenderCallback(callback) {
  renderCallback = callback;
}

export function setWorkerBlockedCallback(callback) {
  workerBlockedCallback = callback;
}

export function setWorkerPushedCallback(callback) {
  workerPushedCallback = callback;
}

export function setWorkerWorkCallback(callback) {
  workerWorkCallback = callback;
}

export function setRoadblockAppearedCallback(callback) {
  roadblockAppearedCallback = callback;
}

export function setRoadblockResolvedCallback(callback) {
  roadblockResolvedCallback = callback;
}

export function setWorkerRoadblockedCallback(callback) {
  workerRoadblockedCallback = callback;
}

export function setRollDurationMs(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return;
  rollDurationMs = durationMs;
}

function notifyRender() {
  renderCallback();
}

export const state = createInitialState();

export function createTrades() {
  return tradeTemplates().map(createTradeState);
}

export function projectTemplateIndex(round = state.projectRound) {
  return ((round - 1) % PROJECTS.length + PROJECTS.length) % PROJECTS.length;
}

export function campaignLevel(round = state.projectRound) {
  return Math.floor((round - 1) / PROJECTS.length) + 1;
}

export function difficultyLevel(round = state.projectRound) {
  return Math.max(0, campaignLevel(round) - 1);
}

export function isFinalProjectInLevel(round = state.projectRound) {
  return projectTemplateIndex(round) === PROJECTS.length - 1;
}

export function currentProject() {
  return PROJECTS[projectTemplateIndex()];
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
  state.careerStartRound = 1;
  state.totalProfit = 0;
  state.gameOver = false;
  state.beatGame = false;
  state.hadTwoPlayers = activePlayers().length > 1;
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
  resetPlayerSelections();
  state.focusArea = "zones";
  state.selectedRoadblockIndex = 0;
  state.trades = createTrades();
  state.roadblocks = [];
  state.identifiedTradeIds = new Set();
  state.lastTradeByZone = {};
  state.scoreName = "";
  state.scoreSaved = false;
  state.quitConfirm = false;
  state.endActionIndex = 0;
  state.logs = [`Project started with ${mode.name}.`];
  startRound();
}

export function startNextProject() {
  if (
    isFinalProjectInLevel() &&
    state.phase !== "win" &&
    state.phase !== "gameComplete"
  ) {
    state.beatGame = campaignLevel() >= FINAL_CAMPAIGN_LEVEL;
    state.phase = state.beatGame ? "gameComplete" : "win";
    state.quitConfirm = false;
    state.endActionIndex = 0;
    notifyRender();
    return;
  }

  if (state.phase === "gameComplete") return;

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
  state.timer = window.setTimeout(startMovementPhase, rollDurationMs);
}

export function rollForTrades() {
  state.trades.forEach((trade, index) => {
    if (index >= activeTradeCount()) return;
    if (trade.finished) return;

    const activeRoadblock = tradeBlockedByRoadblock(trade);
    if (activeRoadblock) {
      delayTradeForRoadblock(trade, activeRoadblock);
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
      delayTradeForRoadblock(trade, activeRoadblock, { stopMovement: true });
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

function delayTradeForRoadblock(
  trade,
  roadblock,
  { stopMovement = false } = {},
) {
  trade.delayedToday = true;
  trade.waitReason = "roadblock";
  if (stopMovement) trade.pendingSteps = 0;

  if (roadblock.lastDelayNotifiedDay === state.day) return;

  roadblock.lastDelayNotifiedDay = state.day;
  markTradeFrustrated(trade, "roadblock");
  reduceMorale(trade, 6);
  workerRoadblockedCallback(trade, roadblock);
  addLog(`${trade.name} lost a day to ${roadblock.label}.`);
}

export function moveTradeOneZone(trade, { ignoreSpacing = false } = {}) {
  const targetZone = trade.zone + 1;
  if (targetZone <= zoneCount()) {
    const occupant = zoneOccupant(targetZone, trade.id);
    if (occupant) {
      trade.delayedToday = true;
      trade.waitReason = "blocked";
      markTradeFrustrated(trade, "blocked");
      workerBlockedCallback(trade, occupant);
      addLog(
        `${trade.name} waited for ${occupant.name} to clear zone ${targetZone}.`,
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
  const alreadyWorkedToday = trade.zoneWorkWeeks[zone].includes(state.day);
  if (!alreadyWorkedToday) {
    trade.zoneWorkWeeks[zone].push(state.day);
    workerWorkCallback(trade, zone);
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
    const cost = scaledLaborCost(trade.baseCost, moraleMultiplier);
    state.laborCost += cost;
    state.profit -= cost;
  });
}

export function maybeSpawnRoadblock() {
  const pressure = roadblockSpawnPressure();
  const guaranteedSpawns = Math.floor(pressure);
  const extraSpawnChance = pressure - guaranteedSpawns;

  for (let index = 0; index < guaranteedSpawns; index += 1) {
    spawnRoadblock();
  }

  if (Math.random() < extraSpawnChance) {
    spawnRoadblock();
  }
}

function spawnRoadblock() {
  const candidates = state.trades.filter(
    (trade, index) =>
      index < activeTradeCount() &&
      !trade.finished &&
      trade.zone < zoneCount() &&
      !state.identifiedTradeIds.has(trade.id),
  );
  if (candidates.length === 0) return false;

  const trade = randomFrom(candidates);
  const minZone = Math.min(zoneCount(), trade.zone + 1);
  const maxZone = Math.min(zoneCount(), trade.zone + 5);
  const zone = randomInt(minZone, maxZone);
  const alreadyExists = state.roadblocks.some(
    (roadblock) => !roadblock.resolved && roadblock.zone === zone,
  );
  if (alreadyExists) return false;

  const roadblock = {
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
    revealed: true,
    identified: false,
    delayDays: 0,
    lastDelayNotifiedDay: null,
  };
  state.roadblocks.push(roadblock);
  roadblockAppearedCallback(roadblock, trade);
  addLog(`Roadblock spawned for ${trade.name} at zone ${zone}.`);
  return true;
}

export function roadblockSpawnChance() {
  return Math.min(
    0.95,
    ROADBLOCK_SPAWN_CHANCE +
      (currentProject().roadblockChanceBonus ?? 0) +
      projectTemplateIndex() * 0.032,
  );
}

export function roadblockSpawnPressure() {
  return roadblockSpawnChance() * roadblockLevelMultiplier();
}

function roadblockLevelMultiplier() {
  const level = campaignLevel();
  if (level <= 1) return 1;

  const requestedMultiplier = 2 * 1.5 ** (level - 2);
  if (requestedMultiplier <= 4) return requestedMultiplier;

  return 4 + Math.log1p(requestedMultiplier - 4);
}

function baseProjectBudget() {
  return currentProject().budget ?? BASE_PROJECT_BUDGET;
}

export function projectBudget() {
  return Math.round(baseProjectBudget() * budgetTighteningMultiplier());
}

export function projectDuration() {
  const duration = currentProject().duration ?? baseGameplayDuration();
  return Math.max(1, Math.round(duration * scheduleTighteningMultiplier()));
}

export function gameplayDuration() {
  return Math.max(
    10,
    Math.round(baseGameplayDuration() * scheduleTighteningMultiplier()),
  );
}

function baseGameplayDuration() {
  return Math.max(20, BASE_PROJECT_DURATION - projectTemplateIndex() * 2);
}

export function projectDay(day = state.day) {
  return Math.round(day * (projectDuration() / gameplayDuration()));
}

export function projectCostScale() {
  return baseProjectBudget() / BASE_PROJECT_BUDGET;
}

export function scaledLaborCost(baseCost, moraleMultiplier = 1) {
  return Math.round(baseCost * moraleMultiplier * projectCostScale());
}

export function dailyDelayCost() {
  return Math.round(DAILY_DELAY_COST * projectCostScale());
}

export function pushCost(trade = null) {
  const projectTrades = currentProject().trades;
  const averageTradeCost = projectTrades.length
    ? projectTrades.reduce((sum, item) => sum + item.baseCost, 0) /
      projectTrades.length
    : PUSH_COST;
  const baseCost = trade?.baseCost ?? averageTradeCost;
  return Math.round(baseCost * PUSH_COST_MARKUP * projectCostScale());
}

export function liquidatedDamagesPerDay() {
  return Math.round(LIQUIDATED_DAMAGES_PER_DAY * projectCostScale());
}

export function moveStepMs() {
  const level = difficultyLevel();
  return Math.max(
    70,
    MOVE_STEP_MS -
      projectTemplateIndex() * 12 -
      Math.min(level, LEVEL_TIGHTENING_TARGET - 1) * 22 -
      Math.max(0, level - (LEVEL_TIGHTENING_TARGET - 1)) * 8,
  );
}

export function roundPauseMs() {
  const level = difficultyLevel();
  return Math.max(
    120,
    ROUND_PAUSE_MS -
      projectTemplateIndex() * 16 -
      Math.min(level, LEVEL_TIGHTENING_TARGET - 1) * 36 -
      Math.max(0, level - (LEVEL_TIGHTENING_TARGET - 1)) * 10,
  );
}

function budgetTighteningMultiplier() {
  const level = difficultyLevel();
  const earlyProgress =
    Math.min(level, LEVEL_TIGHTENING_TARGET - 1) /
    (LEVEL_TIGHTENING_TARGET - 1);
  const lateLevels = Math.max(0, level - (LEVEL_TIGHTENING_TARGET - 1));
  return Math.max(
    0.58,
    1 - earlyProgress * 0.22 - Math.log1p(lateLevels) * 0.018,
  );
}

function scheduleTighteningMultiplier() {
  const level = difficultyLevel();
  const earlyProgress =
    Math.min(level, LEVEL_TIGHTENING_TARGET - 1) /
    (LEVEL_TIGHTENING_TARGET - 1);
  const lateLevels = Math.max(0, level - (LEVEL_TIGHTENING_TARGET - 1));
  return Math.max(
    0.56,
    1 - earlyProgress * 0.25 - Math.log1p(lateLevels) * 0.025,
  );
}

export function updateLiquidatedDamages() {
  if (state.day <= gameplayDuration()) return;
  const damages = liquidatedDamagesPerDay();
  state.liquidatedDamages += damages;
  state.profit -= damages;
}

export function updateRoadblockDelays() {
  state.roadblocks.forEach((roadblock) => {
    if (roadblock.resolved) return;
    const trade = state.trades[roadblock.tradeId];
    if (trade.zone >= roadblock.zone && !trade.finished) {
      roadblock.delayDays += 1;
      state.totalDelayDays += 1;
      const cost = dailyDelayCost();
      state.delayCost += cost;
      state.profit -= cost;
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
  roadblockResolvedCallback(roadblock, getTrade(roadblock.tradeId));
  addLog(`${getTrade(roadblock.tradeId).name} roadblock resolved.`);
  cleanupResolvedRoadblocks();
  notifyRender();
}

export function resolveRoadblockAtZone(zone) {
  if (state.phase !== "running") return;
  const previousZone = state.selectedZone;
  state.selectedZone = zone;
  resolveSelectedRoadblock();
  state.selectedZone = previousZone;
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

  const pendingStepsBeforePush = trade.pendingSteps;
  trade.pendingSteps += 1;

  if (!moveTradeOneZone(trade, { ignoreSpacing: true })) {
    trade.pendingSteps = pendingStepsBeforePush;
    notifyRender();
    return;
  }

  trade.pushes += 1;
  trade.pushedUntil = Date.now() + 1800;
  const cost = pushCost(trade);
  trade.pushFlash = `-${formatMoney(cost)}`;
  reduceMorale(trade, 9);
  state.pushCost += cost;
  state.profit -= cost;
  workerPushedCallback(trade);
  addLog(`${trade.name} pushed forward for ${formatMoney(cost)}.`);
  notifyRender();
  window.setTimeout(notifyRender, 1850);
}

export function identifyRoadblocksForTrade(targetTrade = tradeForSelectedZonePush()) {
  if (state.phase !== "running") return;

  const trade = targetTrade;
  if (!trade || trade.finished) {
    addLog(`No trade to identify for zone ${state.selectedZone}.`);
    notifyRender();
    return;
  }

  if (state.identifiedTradeIds.has(trade.id)) {
    addLog(`${trade.name} roadblocks already identified.`);
    notifyRender();
    return;
  }

  state.identifiedTradeIds.add(trade.id);
  let revealedCount = 0;

  state.roadblocks.forEach((roadblock) => {
    if (roadblock.tradeId !== trade.id || roadblock.resolved) return;
    roadblock.revealed = true;
    roadblock.identified = true;
    roadblock.revealAnimationPending = true;
    revealedCount += 1;
  });

  const targetCount = Math.max(
    1,
    Math.min(5, Math.round(roadblockSpawnPressure() * 2.4)),
  );
  const neededCount = Math.max(0, targetCount - revealedCount);
  const existingZones = new Set(
    state.roadblocks
      .filter((roadblock) => !roadblock.resolved)
      .map((roadblock) => roadblock.zone),
  );
  const candidateZones = Array.from(
    { length: Math.max(0, zoneCount() - Math.max(1, trade.zone)) },
    (_, index) => Math.max(1, trade.zone) + index + 1,
  ).filter((zone) => !existingZones.has(zone));

  for (let index = 0; index < neededCount && candidateZones.length > 0; index += 1) {
    const candidateIndex = randomInt(0, candidateZones.length - 1);
    const zone = candidateZones.splice(candidateIndex, 1)[0];
    const roadblock = {
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
      revealed: true,
      identified: true,
      revealAnimationPending: true,
      delayDays: 0,
      lastDelayNotifiedDay: null,
    };
    state.roadblocks.push(roadblock);
    roadblockAppearedCallback(roadblock, trade);
    revealedCount += 1;
  }

  addLog(`${trade.name} roadblocks identified.`);
  notifyRender();
}

export function endProject() {
  stopTimer();
  applyLiquidatedDamages();
  state.totalProfit += state.profit;
  state.gameOver = state.profit < 0;
  state.phase = state.gameOver ? "gameOver" : "ended";
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
  state.careerStartRound = 1;
  state.totalProfit = 0;
  state.gameOver = false;
  state.beatGame = false;
  state.players = [
    { id: 1, active: true, selectedTradeIndex: 0, selectedZone: 1 },
    { id: 2, active: false, selectedTradeIndex: 0, selectedZone: 1 },
  ];
  state.hadTwoPlayers = false;
  state.identifiedTradeIds = new Set();
  state.scoreName = "";
  state.scoreSaved = false;
  state.nameCursor = 0;
  state.quitConfirm = false;
  state.endActionIndex = 0;
  state.projectSelectorOpen = false;
  state.projectSelectorIndex = 0;
  state.projectSelectorArea = "projects";
  state.projectSelectorLevel = 1;
  state.idleWarningOpen = false;
  state.idleWarningRemaining = 30;
  state.idleWarningActionIndex = 0;
  notifyRender();
}

export function applyLiquidatedDamages() {
  state.liquidatedDamages = Math.max(
    state.liquidatedDamages,
    Math.max(0, state.day - gameplayDuration()) * liquidatedDamagesPerDay(),
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

export function activePlayers() {
  ensurePlayers();
  return state.players.filter((player) => player.active);
}

export function playerState(playerIndex = 0) {
  ensurePlayers();
  return state.players[playerIndex] ?? state.players[0];
}

export function joinPlayer(playerIndex = 0) {
  const player = playerState(playerIndex);
  player.active = true;
  if (!player.selectedZone) player.selectedZone = state.selectedZone || 1;
  if (!Number.isInteger(player.selectedTradeIndex)) player.selectedTradeIndex = 0;
  if (playerIndex > 0) state.hadTwoPlayers = true;
  player.selectedZone = openSelectionZoneForPlayer(playerIndex);
  syncLegacySelection();
  notifyRender();
}

export function leavePlayer(playerIndex = 0) {
  if (playerIndex <= 0) return false;
  const player = playerState(playerIndex);
  player.active = false;
  notifyRender();
  return true;
}

export function setPlayerSelectedZone(playerIndex, zone) {
  const player = playerState(playerIndex);
  player.selectedZone = Math.max(1, Math.min(zoneCount(), zone));
  if (playerIndex === 0) syncLegacySelection();
}

export function tradeForPlayerZone(playerIndex = 0) {
  const player = playerState(playerIndex);
  return (
    state.trades.find(
      (trade) => !trade.finished && trade.zone === player.selectedZone,
    ) ?? getTrade(state.lastTradeByZone[player.selectedZone])
  );
}

export function pushPlayerTrade(playerIndex = 0) {
  const player = playerState(playerIndex);
  const trade = tradeForPlayerZone(playerIndex);
  if (trade) {
    player.selectedTradeIndex = trade.id;
    if (playerIndex === 0) state.selectedTradeIndex = trade.id;
    pushSelectedTrade(trade);
  } else {
    addLog(`No trade to push for zone ${player.selectedZone}.`);
    notifyRender();
  }
}

export function resolvePlayerRoadblock(playerIndex = 0) {
  resolveRoadblockAtZone(playerState(playerIndex).selectedZone);
}

export function identifyPlayerRoadblocks(playerIndex = 0) {
  const player = playerState(playerIndex);
  const previousZone = state.selectedZone;
  state.selectedZone = player.selectedZone;
  const trade = tradeForPlayerZone(playerIndex);
  if (trade) player.selectedTradeIndex = trade.id;
  identifyRoadblocksForTrade(trade);
  state.selectedZone = previousZone;
}

function ensurePlayers() {
  if (Array.isArray(state.players) && state.players.length >= 2) return;
  state.players = [
    { id: 1, active: true, selectedTradeIndex: 0, selectedZone: state.selectedZone || 1 },
    { id: 2, active: false, selectedTradeIndex: 0, selectedZone: state.selectedZone || 1 },
  ];
}

function resetPlayerSelections() {
  ensurePlayers();
  state.players.forEach((player) => {
    player.selectedTradeIndex = 0;
    player.selectedZone = 1;
  });
  syncLegacySelection();
}

function syncLegacySelection() {
  ensurePlayers();
  const playerOne = state.players[0];
  state.selectedZone = playerOne.selectedZone;
  state.selectedTradeIndex = playerOne.selectedTradeIndex;
}

function openSelectionZoneForPlayer(playerIndex) {
  const player = playerState(playerIndex);
  const occupiedZones = new Set(
    state.players
      .filter((item, index) => index !== playerIndex && item.active)
      .map((item) => item.selectedZone),
  );
  if (!occupiedZones.has(player.selectedZone)) return player.selectedZone;

  const totalZones = Math.max(1, zoneCount());
  for (let offset = 1; offset < totalZones; offset += 1) {
    const forwardZone = ((player.selectedZone - 1 + offset) % totalZones) + 1;
    if (!occupiedZones.has(forwardZone)) return forwardZone;
  }

  return player.selectedZone;
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
    "industrial-plant",
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
  if (state.beatGame) return true;
  const rows = loadLeaderboard();
  if (rows.length < LEADERBOARD_LIMIT) return true;
  return score > Math.min(...rows.map((row) => row.earnings));
}

export function completedProjectTotal() {
  const startedAt = state.careerStartRound ?? 1;
  const completedThrough = state.gameOver
    ? state.projectRound - 1
    : state.projectRound;
  return Math.max(0, completedThrough - startedAt + 1);
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
    returnToTitle();
    return;
  }
  const name =
    (state.scoreName || "AAA")
      .trim()
      .toUpperCase()
      .slice(0, MAX_LEADERBOARD_NAME_LENGTH) || "AAA";
  const rows = [
    ...loadLeaderboard(),
    {
      name,
      project: state.projectRound,
      projectsCompleted: completedProjectTotal(),
      players: state.hadTwoPlayers ? 2 : 1,
      beatGame: state.beatGame,
      earnings: state.totalProfit,
    },
  ]
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, LEADERBOARD_LIMIT);

  localStorage.setItem("taktTowersLeaderboard", JSON.stringify(rows));
  state.scoreName = name;
  state.scoreSaved = true;
  returnToTitle();
}

export function restartAfterLeaderboard() {
  returnToTitle();
}

export function continueFromGameOver() {
  if (!leaderboardQualifies(state.totalProfit)) {
    returnToTitle();
    return;
  }

  state.phase = "nameEntry";
  notifyRender();
}

export function selectNameKey() {
  const key = [...NAME_KEYS, ...NAME_ACTIONS][state.nameCursor];
  if (key === "SPACE") {
    if (state.scoreName.length < MAX_LEADERBOARD_NAME_LENGTH) {
      state.scoreName += " ";
    }
  } else if (key === "DEL") {
    state.scoreName = state.scoreName.slice(0, -1);
  } else if (key === "SAVE") {
    saveLeaderboardScore();
    return;
  } else if (state.scoreName.length < MAX_LEADERBOARD_NAME_LENGTH) {
    state.scoreName += key;
  }
  notifyRender();
}
