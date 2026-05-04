const assetUrl = (path) => new URL(path, import.meta.url).href

export const TRADE_ASSETS = {
  generic: {
    worker: assetUrl('./trades/worker-generic.svg'),
    work: assetUrl('./trades/work-generic.svg'),
  },
}

export const BUILDING_ASSETS = {
  generic: assetUrl('./buildings/generic.svg'),
  office: assetUrl('./buildings/office.svg'),
  hospital: assetUrl('./buildings/hospital.svg'),
  'data-center': assetUrl('./buildings/data-center.svg'),
  'wind-farm': assetUrl('./buildings/wind-farm.svg'),
}

export const ROADBLOCK_ASSETS = {
  barricade: assetUrl('./roadblocks/barricade.svg'),
}

export const UI_ASSETS = {
  die: assetUrl('./ui/die.svg'),
  start: assetUrl('./ui/start.svg'),
}

export const ASSET_MANIFEST = {
  trades: TRADE_ASSETS,
  buildings: BUILDING_ASSETS,
  roadblocks: ROADBLOCK_ASSETS,
  ui: UI_ASSETS,
}

export function buildingAssetForProject(project) {
  return BUILDING_ASSETS[project?.type] ?? BUILDING_ASSETS.generic
}

export function roadblockAsset(key = 'barricade') {
  return ROADBLOCK_ASSETS[key] ?? ROADBLOCK_ASSETS.barricade
}

export function uiAsset(key) {
  return UI_ASSETS[key]
}
