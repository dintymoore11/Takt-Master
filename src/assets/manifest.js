const assetModules = import.meta.glob("./**/*.{png,svg,wav}", {
  eager: true,
  import: "default",
  query: "?url",
});

const assetUrl = (path) => assetModules[path] ?? new URL(path, import.meta.url).href;

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
  "housing-project-5": assetUrl("./rooms/project-5-housing/site/original-site.png"),
  "solar-farm": assetUrl("./rooms/project-5-solar-farm/original-site.png"),
  "solar-farm-project-5": assetUrl("./rooms/project-5-solar-farm/original-site.png"),
  "industrial-plant": assetUrl("./rooms/project-6-industrial-plant/opening-scene.png"),
  "industrial-plant-project-6": assetUrl("./rooms/project-6-industrial-plant/opening-scene.png"),
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
  housing: {
    "original-site": assetUrl("./rooms/project-5-housing/site/original-site.png"),
    "survey-layout": assetUrl("./rooms/project-5-housing/site/survey-layout.png"),
    utilities: assetUrl("./rooms/project-5-housing/site/utilities.png"),
    foundations: assetUrl("./rooms/project-5-housing/site/foundations.png"),
    framing: assetUrl("./rooms/project-5-housing/site/framing.png"),
    roofing: assetUrl("./rooms/project-5-housing/site/roofing.png"),
    "exterior-finishes": assetUrl("./rooms/project-5-housing/site/exterior-finishes.png"),
    "interior-finishes": assetUrl("./rooms/project-5-housing/site/interior-finishes.png"),
    landscaping: assetUrl("./rooms/project-5-housing/site/landscaping.png"),
    "final-punchlist": assetUrl("./rooms/project-5-housing/site/final-punchlist.png"),
  },
  "solar-farm": {
    "original-site": assetUrl("./rooms/project-5-solar-farm/original-site.png"),
    "access-roads": assetUrl("./rooms/project-5-solar-farm/access-roads.png"),
    "pile-driving": assetUrl("./rooms/project-5-solar-farm/pile-driving.png"),
    "solar-racking": assetUrl("./rooms/project-5-solar-farm/solar-racking.png"),
    "collection-cabling": assetUrl("./rooms/project-5-solar-farm/collection-cabling.png"),
    inverters: assetUrl("./rooms/project-5-solar-farm/inverters.png"),
    "solar-panels": assetUrl("./rooms/project-5-solar-farm/solar-panels.png"),
    "grid-tie": assetUrl("./rooms/project-5-solar-farm/grid-tie.png"),
    "solar-commissioning": assetUrl("./rooms/project-5-solar-farm/solar-commissioning.png"),
  },
  "industrial-plant": {
    "original-site": assetUrl("./rooms/project-6-industrial-plant/opening-scene.png"),
    "below-grade-utilities": assetUrl("./rooms/project-6-industrial-plant/below-grade-utilities.png"),
    "industrial-foundations": assetUrl("./rooms/project-6-industrial-plant/foundations.png"),
    "structural-steel": assetUrl("./rooms/project-6-industrial-plant/structural-steel.png"),
    "boilermakers-millwrights": assetUrl("./rooms/project-6-industrial-plant/boilermakers-millwrights.png"),
    "pipe-fitters": assetUrl("./rooms/project-6-industrial-plant/pipe-fitters.png"),
    "electrical-instrumentation": assetUrl("./rooms/project-6-industrial-plant/electrical-instrumentation.png"),
    "insulation-cladding": assetUrl("./rooms/project-6-industrial-plant/insulation-cladding.png"),
    "industrial-commissioning": assetUrl("./rooms/project-6-industrial-plant/commissioning.png"),
  },
};

export const ROADBLOCK_ASSETS = {
  barricade: assetUrl("./roadblocks/barricade.svg"),
};

export const UI_ASSETS = {
  die: assetUrl("./ui/die.svg"),
  "dice-spin": assetUrl("./ui/dice/dice-spin.png"),
  "dice-1": assetUrl("./ui/dice/dice-1.png"),
  "dice-2": assetUrl("./ui/dice/dice-2.png"),
  "dice-3": assetUrl("./ui/dice/dice-3.png"),
  "dice-4": assetUrl("./ui/dice/dice-4.png"),
  "dice-5": assetUrl("./ui/dice/dice-5.png"),
  "dice-6": assetUrl("./ui/dice/dice-6.png"),
  "intakt-logo-white": assetUrl("./ui/intakt-logo-full-white.png"),
  "leantakt-logo": assetUrl("./ui/leantakt-logo.png"),
  start: assetUrl("./ui/start.svg"),
  "trophy-level-1": assetUrl("./ui/trophies/trophy-level-1.png"),
  "trophy-level-2": assetUrl("./ui/trophies/trophy-level-2.png"),
  "trophy-level-3": assetUrl("./ui/trophies/trophy-level-3.png"),
  "trophy-level-4": assetUrl("./ui/trophies/trophy-level-4.png"),
  "trophy-level-5": assetUrl("./ui/trophies/trophy-level-5.png"),
  "trophy-level-6": assetUrl("./ui/trophies/trophy-level-6.png"),
  "trophy-level-7": assetUrl("./ui/trophies/trophy-level-7.png"),
  "trophy-level-8": assetUrl("./ui/trophies/trophy-level-8.png"),
  "trophy-level-9": assetUrl("./ui/trophies/trophy-level-9.png"),
  "trophy-level-10": assetUrl("./ui/trophies/trophy-level-10.png"),
};

export const AUDIO_ASSETS = {
  "construction-loop": assetUrl("./audio/construction-loop.wav"),
  "dice-roll": assetUrl("./audio/dice-roll.wav"),
  "frustrated-blocked-1": assetUrl("./audio/frustrated-blocked-1.wav"),
  "frustrated-blocked-2": assetUrl("./audio/frustrated-blocked-2.wav"),
  "frustrated-blocked-3": assetUrl("./audio/frustrated-blocked-3.wav"),
  "frustrated-blocked-4": assetUrl("./audio/frustrated-blocked-4.wav"),
  "held-up-1": assetUrl("./audio/held-up-1.wav"),
  "held-up-2": assetUrl("./audio/held-up-2.wav"),
  "held-up-3": assetUrl("./audio/held-up-3.wav"),
  "held-up-4": assetUrl("./audio/held-up-4.wav"),
  "held-up-5": assetUrl("./audio/held-up-5.wav"),
  "held-up-6": assetUrl("./audio/held-up-6.wav"),
  "held-up-7": assetUrl("./audio/held-up-7.wav"),
  "held-up-8": assetUrl("./audio/held-up-8.wav"),
  "slowed-1": assetUrl("./audio/slowed-1.wav"),
  "slowed-2": assetUrl("./audio/slowed-2.wav"),
  "slowed-3": assetUrl("./audio/slowed-3.wav"),
  "worker-pushed-1": assetUrl("./audio/worker-pushed-1.wav"),
  "worker-pushed-2": assetUrl("./audio/worker-pushed-2.wav"),
  "worker-pushed-3": assetUrl("./audio/worker-pushed-3.wav"),
  "worker-pushed-4": assetUrl("./audio/worker-pushed-4.wav"),
  "worker-pushed-5": assetUrl("./audio/worker-pushed-5.wav"),
  "worker-pushed-6": assetUrl("./audio/worker-pushed-6.wav"),
  "worker-pushed-7": assetUrl("./audio/worker-pushed-7.wav"),
  "worker-pushed-8": assetUrl("./audio/worker-pushed-8.wav"),
  "worker-pushed-9": assetUrl("./audio/worker-pushed-9.wav"),
  "worker-pushed-10": assetUrl("./audio/worker-pushed-10.wav"),
  "worker-pushed-11": assetUrl("./audio/worker-pushed-11.wav"),
  "worker-pushed-12": assetUrl("./audio/worker-pushed-12.wav"),
  "result-lose-1": assetUrl("./audio/results/lose 1.wav"),
  "result-lose-2": assetUrl("./audio/results/lose 2.wav"),
  "result-lose-2a": assetUrl("./audio/results/lose 2a.wav"),
  "result-lose-3": assetUrl("./audio/results/lose 3.wav"),
  "result-lose-4": assetUrl("./audio/results/lose 4.wav"),
  "result-win-1": assetUrl("./audio/results/win 1.wav"),
  "result-win-1a": assetUrl("./audio/results/win 1a.wav"),
  "result-win-2": assetUrl("./audio/results/win 2.wav"),
  "result-win-3": assetUrl("./audio/results/win 3.wav"),
  "result-win-4": assetUrl("./audio/results/win 4.wav"),
  "result-win-5": assetUrl("./audio/results/win 5.wav"),
  "result-win-5a": assetUrl("./audio/results/win 5a.wav"),
  "result-win-6": assetUrl("./audio/results/win 6.wav"),
  "result-win-7": assetUrl("./audio/results/win 7.wav"),
  "roadblock-appears": assetUrl("./audio/roadblocks/roadblock-appears.wav"),
  "roadblock-resolves": assetUrl("./audio/roadblocks/roadblock-resolves.wav"),
  "roadblock-held-up-1": assetUrl("./audio/roadblocks/roadblock-held-up-1.wav"),
  "roadblock-held-up-2": assetUrl("./audio/roadblocks/roadblock-held-up-2.wav"),
  "roadblock-held-up-3": assetUrl("./audio/roadblocks/roadblock-held-up-3.wav"),
  "roadblock-held-up-4": assetUrl("./audio/roadblocks/roadblock-held-up-4.wav"),
  "roadblock-held-up-5": assetUrl("./audio/roadblocks/roadblock-held-up-5.wav"),
  "roadblock-held-up-6": assetUrl("./audio/roadblocks/roadblock-held-up-6.wav"),
  "roadblock-held-up-7": assetUrl("./audio/roadblocks/roadblock-held-up-7.wav"),
  "roadblock-held-up-8": assetUrl("./audio/roadblocks/roadblock-held-up-8.wav"),
  "roadblock-held-up-9": assetUrl("./audio/roadblocks/roadblock-held-up-9.wav"),
  "roadblock-held-up-10": assetUrl(
    "./audio/roadblocks/roadblock-held-up-10.wav",
  ),
  "roadblock-held-up-11": assetUrl(
    "./audio/roadblocks/roadblock-held-up-11.wav",
  ),
  "roadblock-held-up-12": assetUrl(
    "./audio/roadblocks/roadblock-held-up-12.wav",
  ),
  "roadblock-held-up-13": assetUrl(
    "./audio/roadblocks/roadblock-held-up-13.wav",
  ),
  "roadblock-held-up-14": assetUrl(
    "./audio/roadblocks/roadblock-held-up-14.wav",
  ),
  "roadblock-held-up-15": assetUrl(
    "./audio/roadblocks/roadblock-held-up-15.wav",
  ),
  "roadblock-held-up-16": assetUrl(
    "./audio/roadblocks/roadblock-held-up-16.wav",
  ),
  "roadblock-held-up-17": assetUrl(
    "./audio/roadblocks/roadblock-held-up-17.wav",
  ),
  "roadblock-held-up-18": assetUrl(
    "./audio/roadblocks/roadblock-held-up-18.wav",
  ),
  "victory-takt-legend-1": assetUrl("./audio/victory/takt-legend-1.wav"),
  "victory-takt-legend-2": assetUrl("./audio/victory/takt-legend-2.wav"),
  "victory-takt-legend-3": assetUrl("./audio/victory/takt-legend-3.wav"),
  "victory-takt-legend-4": assetUrl("./audio/victory/takt-legend-4.wav"),
  "victory-takt-legend-5": assetUrl("./audio/victory/takt-legend-5.wav"),
  "work-cutting-1": assetUrl("./audio/work/Cutting 1.wav"),
  "work-cutting-2": assetUrl("./audio/work/Cutting 2.wav"),
  "work-cutting-3": assetUrl("./audio/work/Cutting 3.wav"),
  "work-cutting-4": assetUrl("./audio/work/Cutting 4.wav"),
  "work-drill-1": assetUrl("./audio/work/Drill 1.wav"),
  "work-drill-2": assetUrl("./audio/work/Drill 2.wav"),
  "work-drill-3": assetUrl("./audio/work/Drill 3.wav"),
  "work-drill-4": assetUrl("./audio/work/Drill 4.wav"),
  "work-drywall-1": assetUrl("./audio/work/Drywall 1.wav"),
  "work-drywall-2": assetUrl("./audio/work/Drywall 2.wav"),
  "work-drywall-3": assetUrl("./audio/work/Drywall 3.wav"),
  "work-drywall-4": assetUrl("./audio/work/Drywall 4.wav"),
  "work-excavator-1": assetUrl("./audio/work/Excavator 1.wav"),
  "work-excavator-2": assetUrl("./audio/work/Excavator 2.wav"),
  "work-excavator-3": assetUrl("./audio/work/Excavator 3.wav"),
  "work-excavator-4": assetUrl("./audio/work/Excavator 4.wav"),
  "work-foundation-1": assetUrl("./audio/work/Foundation 1.wav"),
  "work-foundation-2": assetUrl("./audio/work/Foundation 2.wav"),
  "work-foundation-3": assetUrl("./audio/work/Foundation 3.wav"),
  "work-hammer-1": assetUrl("./audio/work/Hammer 1.wav"),
  "work-hammer-2": assetUrl("./audio/work/Hammer 2.wav"),
  "work-pounding-1": assetUrl("./audio/work/Pounding 1.wav"),
  "work-pounding-2": assetUrl("./audio/work/Pounding 2.wav"),
  "work-pounding-3": assetUrl("./audio/work/Pounding 3.wav"),
  "work-putty-knife-1": assetUrl("./audio/work/Putty Knife 1.wav"),
  "work-putty-knife-2": assetUrl("./audio/work/Putty Knife 2.wav"),
  "work-putty-knife-3": assetUrl("./audio/work/Putty Knife 3.wav"),
  "work-sanding-1": assetUrl("./audio/work/Sanding 1.wav"),
  "work-sanding-2": assetUrl("./audio/work/Sanding 2.wav"),
  "work-saw-1": assetUrl("./audio/work/Saw 1.wav"),
  "work-saw-2": assetUrl("./audio/work/Saw 2.wav"),
  "work-saw-3": assetUrl("./audio/work/Saw 3.wav"),
  "work-wrench-1": assetUrl("./audio/work/Wrench 1.wav"),
  "work-wrench-2": assetUrl("./audio/work/Wrench 2.wav"),
  "work-wrench-3": assetUrl("./audio/work/Wrench 3.wav"),
  "work-wrench-4": assetUrl("./audio/work/Wrench 4.wav"),
};

export const ASSET_MANIFEST = {
  trades: TRADE_ASSETS,
  buildings: BUILDING_ASSETS,
  rooms: ROOM_ASSETS,
  roadblocks: ROADBLOCK_ASSETS,
  ui: UI_ASSETS,
  audio: AUDIO_ASSETS,
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

export function audioAsset(key) {
  return AUDIO_ASSETS[key];
}
