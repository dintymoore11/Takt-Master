const assetUrl = (path) => new URL(path, import.meta.url).href;

export const TRADE_ASSETS = {
  generic: {
    worker: assetUrl("./trades/worker-generic.svg"),
    work: assetUrl("./trades/work-generic.svg"),
  },
};

export const BUILDING_ASSETS = {
  generic: assetUrl("./buildings/generic.svg"),
  office: assetUrl("./buildings/office.svg"),
  "office-project-1": assetUrl("./buildings/project-1-office.png"),
  hospital: assetUrl("./buildings/hospital.svg"),
  "data-center": assetUrl("./buildings/data-center.svg"),
  "wind-farm": assetUrl("./buildings/wind-farm.svg"),
};

export const ROOM_ASSETS = {
  office: {
    framing: assetUrl("./rooms/project-1/framing.png"),
    plumbing: assetUrl("./rooms/project-1/plumbing.png"),
    electrical: assetUrl("./rooms/project-1/electrical.png"),
    drywall: assetUrl("./rooms/project-1/drywall.png"),
    painting: assetUrl("./rooms/project-1/painting.png"),
    finishes: assetUrl("./rooms/project-1/finishes.png"),
  },
};

export const ROADBLOCK_ASSETS = {
  barricade: assetUrl("./roadblocks/barricade.svg"),
};

export const UI_ASSETS = {
  die: assetUrl("./ui/die.svg"),
  start: assetUrl("./ui/start.svg"),
};

export const ASSET_MANIFEST = {
  trades: TRADE_ASSETS,
  buildings: BUILDING_ASSETS,
  rooms: ROOM_ASSETS,
  roadblocks: ROADBLOCK_ASSETS,
  ui: UI_ASSETS,
};

export function buildingAssetForProject(project) {
  return BUILDING_ASSETS[project?.type] ?? BUILDING_ASSETS.generic;
}

export function roadblockAsset(key = "barricade") {
  return ROADBLOCK_ASSETS[key] ?? ROADBLOCK_ASSETS.barricade;
}

export function uiAsset(key) {
  return UI_ASSETS[key];
}
