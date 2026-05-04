import { BASE_PROJECT_BUDGET } from "./gameConfig.js";
import { visualForTrade } from "./visualAssets.js";

export function createInitialState() {
  return {
    phase: "title",
    roundPhase: "idle",
    mode: null,
    projectRound: 1,
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
    focusArea: "zones",
    selectedRoadblockIndex: 0,
    trades: [],
    roadblocks: [],
    logs: [],
    timer: null,
    zoneWorkThisRound: new Set(),
    lastTradeByZone: {},
    scoreName: "",
    scoreSaved: false,
    nameCursor: 0,
    quitConfirm: false,
    endActionIndex: 0,
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
