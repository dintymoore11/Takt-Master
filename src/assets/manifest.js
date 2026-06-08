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
  "hospital-project-2": assetUrl("./buildings/project-2-hospital.png"),
  "data-center": assetUrl("./buildings/data-center.svg"),
  "data-center-project-3": assetUrl("./buildings/project-3-data-center.png"),
  "wind-farm": assetUrl("./buildings/wind-farm.svg"),
  "wind-farm-project-4": assetUrl("./buildings/project-4-wind-farm.png"),
  "housing-project-5": assetUrl("./buildings/project-5-housing.png"),
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
  hospital: {
    framing: assetUrl("./rooms/project-2-hospital/framing.png"),
    hvac: assetUrl("./rooms/project-2-hospital/hvac.png"),
    plumbing: assetUrl("./rooms/project-2-hospital/plumbing.png"),
    fire: assetUrl("./rooms/project-2-hospital/fire.png"),
    electrical: assetUrl("./rooms/project-2-hospital/electrical.png"),
    drywall: assetUrl("./rooms/project-2-hospital/drywall.png"),
    finishes: assetUrl("./rooms/project-2-hospital/finishes.png"),
    equipment: assetUrl("./rooms/project-2-hospital/equipment.png"),
  },
  "data-center": {
    "bare-floor": assetUrl("./rooms/project-3-data-center/bare-floor.png"),
    "raised-floor": assetUrl("./rooms/project-3-data-center/raised-floor.png"),
    hvac: assetUrl("./rooms/project-3-data-center/hvac.png"),
    "process-piping": assetUrl("./rooms/project-3-data-center/process-piping.png"),
    fire: assetUrl("./rooms/project-3-data-center/fire.png"),
    electrical: assetUrl("./rooms/project-3-data-center/electrical.png"),
    containment: assetUrl("./rooms/project-3-data-center/containment.png"),
    finishes: assetUrl("./rooms/project-3-data-center/finishes.png"),
    equipment: assetUrl("./rooms/project-3-data-center/equipment.png"),
  },
  "wind-farm": {
    "survey-layout": assetUrl("./rooms/project-4-wind-farm/survey-layout.png"),
    earthwork: assetUrl("./rooms/project-4-wind-farm/earthwork.png"),
    "formwork-rebar": assetUrl("./rooms/project-4-wind-farm/formwork-rebar.png"),
    foundation: assetUrl("./rooms/project-4-wind-farm/foundation.png"),
    electrical: assetUrl("./rooms/project-4-wind-farm/electrical.png"),
    "tower-erection": assetUrl("./rooms/project-4-wind-farm/tower-erection.png"),
    "nacelle-install": assetUrl("./rooms/project-4-wind-farm/nacelle-install.png"),
    "blade-install": assetUrl("./rooms/project-4-wind-farm/blade-install.png"),
    "wind-commissioning": assetUrl("./rooms/project-4-wind-farm/commissioning.png"),
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
