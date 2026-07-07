import { BASE_PROJECT_BUDGET } from "./gameConfig.js";
import { visualForTrade } from "./visualAssets.js";

export function createInitialState() {
  return {
    phase: "title",
    roundPhase: "idle",
    mode: null,
    projectRound: 1,
    careerStartRound: 1,
    setupModeIndex: 0,
    totalProfit: 0,
    gameOver: false,
    day: 0,
    profit: BASE_PROJECT_BUDGET,
    laborCost: 0,
    pushCost: 0,
    delayCost: 0,
    totalDelayDays: 0,
    liquidatedDamages: 0,
    selectedTradeIndex: 0,
    selectedZone: 1,
    players: [
      { id: 1, active: true, selectedTradeIndex: 0, selectedZone: 1 },
      { id: 2, active: false, selectedTradeIndex: 0, selectedZone: 1 },
    ],
    hadTwoPlayers: false,
    focusArea: "zones",
    selectedRoadblockIndex: 0,
    trades: [],
    roadblocks: [],
    identifiedTradeIds: new Set(),
    logs: [],
    timer: null,
    zoneWorkThisRound: new Set(),
    lastTradeByZone: {},
    scoreName: "",
    scoreSaved: false,
    nameCursor: 0,
    quitConfirm: false,
    endActionIndex: 0,
    projectSelectorOpen: false,
    projectSelectorIndex: 0,
    projectSelectorArea: "projects",
    projectSelectorLevel: 1,
    idleWarningOpen: false,
    idleWarningRemaining: 30,
    idleWarningActionIndex: 0,
  };
}

export function createTradeState(trade, index) {
  const visualKey = trade.visualKey ?? trade.key;

  return {
    ...trade,
    id: index,
    visualKey,
    visual: visualForTrade({ ...trade, visualKey }),
    zone: index === 0 ? 1 : 0,
    progress: 0,
    finished: false,
    morale: 100,
    pushes: 0,
    delayedToday: false,
    lastRoll: null,
    pendingSteps: 0,
    waitReason: "",
    zoneStarts: {},
    zoneWorkWeeks: {},
    finishDay: null,
    pushedUntil: 0,
    pushFlash: "",
    previousZone: null,
    frustratedUntil: 0,
    frustrationReason: "",
  };
}
