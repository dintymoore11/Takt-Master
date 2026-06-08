import { TRADE_ASSETS } from "./assets/manifest.js";

const initialsForName = (name = "") =>
  name
    .split(/[\s/]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3);

export const DEFAULT_TRADE_VISUAL = {
  workerClass: "worker-generic",
  workClass: "work-generic",
  workerAsset: TRADE_ASSETS.generic.worker,
  workAsset: TRADE_ASSETS.generic.work,
  animation: "default",
  label: "TR",
  sprite: null,
};

const GENERIC_WORKER_STATES = {
  idle: { row: 0, duration: "1.8s", timing: "steps(1, end)" },
  walking: { row: 1, duration: "0.62s", timing: "steps(3, end)" },
  working: { row: 2, duration: "0.82s", timing: "steps(3, end)" },
  waiting: { row: 3, duration: "1.05s", timing: "steps(1, end)" },
  angry: { row: 4, duration: "0.42s", timing: "steps(1, end)" },
};

const genericWorkerSprite = (key = "generic") => ({
  asset: `/workers/${key}.png`,
  columns: 4,
  rows: 5,
  states: GENERIC_WORKER_STATES,
});

const tradeVisual = (
  key,
  workAnimation,
  label,
  sprite = genericWorkerSprite(key),
) => ({
  workerClass: `worker-${key}`,
  workClass: `work-${key}`,
  workerAsset: TRADE_ASSETS[key]?.worker ?? TRADE_ASSETS.generic.worker,
  workAsset: TRADE_ASSETS[key]?.work ?? TRADE_ASSETS.generic.work,
  animation: workAnimation,
  label,
  sprite,
});

export const TRADE_VISUALS = {
  framing: tradeVisual("framing", "studs", "FR"),
  electrical: tradeVisual("electrical", "wire-pull", "EL"),
  plumbing: tradeVisual("plumbing", "pipes", "PL"),
  drywall: tradeVisual("drywall", "panels", "DW"),
  painting: tradeVisual("painting", "roller", "PT"),
  finishes: tradeVisual("finishes", "fixtures", "FN"),
  hvac: tradeVisual("hvac", "ducts", "HV"),
  fire: tradeVisual("fire", "sprinklers", "FP"),
  cleanroom: tradeVisual("cleanroom", "sterile-finish", "CF"),
  equipment: tradeVisual("equipment", "equipment", "EQ"),
  "raised-floor": tradeVisual("raised-floor", "raised-floor", "RF"),
  power: tradeVisual("power", "power-glow", "PW"),
  "backup-power": tradeVisual("backup-power", "ups", "BP"),
  cooling: tradeVisual("cooling", "cooling", "CL"),
  "data-cabling": tradeVisual("data-cabling", "data-cables", "DC"),
  "rack-install": tradeVisual("rack-install", "racks", "RK"),
  "server-equipment": tradeVisual("server-equipment", "servers", "SV"),
  commissioning: tradeVisual("commissioning", "testing", "CM"),
};

export function visualForTrade(trade) {
  if (trade?.visual) {
    return trade.visual;
  }

  const visualKey = trade?.visualKey ?? trade?.key;
  const configured = TRADE_VISUALS[visualKey];

  if (configured) {
    return configured;
  }

  return {
    ...DEFAULT_TRADE_VISUAL,
    workerClass: `worker-${visualKey}`,
    workClass: `work-${visualKey}`,
    workerAsset:
      TRADE_ASSETS[visualKey]?.worker ?? DEFAULT_TRADE_VISUAL.workerAsset,
    workAsset: TRADE_ASSETS[visualKey]?.work ?? DEFAULT_TRADE_VISUAL.workAsset,
    label: initialsForName(trade?.name) || DEFAULT_TRADE_VISUAL.label,
    sprite: genericWorkerSprite(visualKey),
  };
}
