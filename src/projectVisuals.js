import { BUILDING_ASSETS, ROOM_ASSETS } from "./assets/manifest.js";

const PROJECT_BACKDROPS = {
  office: {
    className: "office-backdrop",
    imageClassName: "office-building-photo",
    assetKey: "office-project-1",
  },
  hospital: {
    className: "hospital-backdrop",
    imageClassName: "hospital-building-photo",
    assetKey: "hospital-project-2",
  },
  "data-center": {
    className: "data-center-backdrop",
    imageClassName: "data-center-building-photo",
    assetKey: "data-center-project-3",
  },
  "wind-farm": {
    className: "wind-farm-backdrop",
    imageClassName: "wind-farm-building-photo",
    assetKey: "wind-farm-project-4",
  },
  housing: {
    className: "housing-backdrop",
    imageClassName: "housing-building-photo",
    assetKey: "housing-project-5",
  },
};

const PROJECT_VISUAL_LAYERS = {
  office: officeZoneVisualLayers,
  hospital: hospitalZoneVisualLayers,
  "data-center": dataCenterZoneVisualLayers,
  "wind-farm": windFarmZoneVisualLayers,
};

const DATA_CENTER_TILE_STATES = [
  "equipment",
  "finishes",
  "containment",
  "electrical",
  "fire",
  "process-piping",
  "hvac",
  "raised-floor",
];

const HOSPITAL_ROOM_STATES = [
  "equipment",
  "finishes",
  "drywall",
  "electrical",
  "fire",
  "plumbing",
  "hvac",
  "framing",
];

const OFFICE_ROOM_STATES = [
  "finishes",
  "painting",
  "drywall",
  ["electrical", "plumbing", "electrical"],
  "plumbing",
  "framing",
];

const WIND_FARM_STATES = [
  "wind-commissioning",
  "blade-install",
  "nacelle-install",
  "tower-erection",
  "electrical",
  "foundation",
  "formwork-rebar",
  "earthwork",
  "survey-layout",
];

const WIND_FARM_GRID = [
  { left: "14.056%", top: "0%", width: "17.584%", height: "17.8%" },
  { left: "29.568%", top: "0%", width: "16.612%", height: "17.8%" },
  { left: "45.080%", top: "0%", width: "15.640%", height: "17.8%" },
  { left: "60.592%", top: "0%", width: "15.512%", height: "17.8%" },
  { left: "75.260%", top: "0%", width: "16.356%", height: "17.8%" },
  { left: "10.397%", top: "17.8%", width: "19.171%", height: "21.4%" },
  { left: "27.077%", top: "17.8%", width: "18.003%", height: "21.4%" },
  { left: "43.757%", top: "17.8%", width: "16.834%", height: "21.4%" },
  { left: "60.438%", top: "17.8%", width: "16.680%", height: "21.4%" },
  { left: "76.104%", top: "17.8%", width: "17.695%", height: "21.4%" },
  { left: "5.831%", top: "39.2%", width: "21.246%", height: "26.7%" },
  { left: "23.969%", top: "39.2%", width: "19.788%", height: "26.7%" },
  { left: "42.107%", top: "39.2%", width: "18.330%", height: "26.7%" },
  { left: "60.246%", top: "39.2%", width: "18.138%", height: "26.7%" },
  { left: "77.118%", top: "39.2%", width: "19.404%", height: "26.7%" },
  { left: "0%", top: "65.9%", width: "23.969%", height: "34.1%" },
  { left: "20%", top: "65.9%", width: "22.107%", height: "34.1%" },
  { left: "40%", top: "65.9%", width: "20.246%", height: "34.1%" },
  { left: "60%", top: "65.9%", width: "20%", height: "34.1%" },
  { left: "78.384%", top: "65.9%", width: "21.616%", height: "34.1%" },
];

export function hasProjectBackdrop(project) {
  return Boolean(PROJECT_BACKDROPS[project?.type]);
}

export function projectBackdrop(project) {
  const backdrop = PROJECT_BACKDROPS[project?.type];
  if (!backdrop) return "";

  return `
    <div class="project-backdrop ${backdrop.className}" aria-hidden="true">
      <img
        class="project-building-photo ${backdrop.imageClassName}"
        src="${BUILDING_ASSETS[backdrop.assetKey]}"
        alt=""
      >
    </div>
  `;
}

export function zoneVisualLayers(project, trades, zoneNumber) {
  const visualLayers =
    PROJECT_VISUAL_LAYERS[project?.type] ?? legacyZoneVisualLayers;
  return visualLayers(trades, zoneNumber);
}

export function projectZoneOverlayLayers(project, trades, zoneNumbers) {
  if (project?.type !== "wind-farm") return "";

  return `
    <div class="wind-farm-install-layer" aria-hidden="true">
      ${zoneNumbers
        .map((zoneNumber) => windFarmInstallOverlay(trades, zoneNumber))
        .join("")}
    </div>
  `;
}

function dataCenterZoneVisualLayers(trades, zoneNumber) {
  const tileState = completedDataCenterTileState(trades, zoneNumber);

  return `
    <img
      class="data-center-tile-state data-center-tile-base"
      src="${ROOM_ASSETS["data-center"]["bare-floor"]}"
      alt=""
      aria-hidden="true"
      draggable="false"
    >
    ${tileState === "bare-floor" ? "" : `
      <img
        class="data-center-tile-state"
        src="${ROOM_ASSETS["data-center"][tileState]}"
        alt=""
        aria-hidden="true"
        draggable="false"
      >
    `}
  `;
}

function hospitalZoneVisualLayers(trades, zoneNumber) {
  const roomState = completedHospitalRoomState(trades, zoneNumber);
  if (!roomState) return "";

  return `
    <img
      class="hospital-room-state"
      src="${ROOM_ASSETS.hospital[roomState]}"
      alt=""
      aria-hidden="true"
      draggable="false"
    >
  `;
}

function completedDataCenterTileState(trades, zoneNumber) {
  return completedVisualState(
    trades,
    zoneNumber,
    DATA_CENTER_TILE_STATES,
    "bare-floor",
  );
}

function windFarmZoneVisualLayers() {
  return "";
}

function windFarmInstallOverlay(trades, zoneNumber) {
  const installState = completedWindFarmState(trades, zoneNumber);
  const grid = WIND_FARM_GRID[zoneNumber - 1];
  if (!grid) return "";

  return `
    <span
      class="wind-install-zone ${installState ? `wind-install-state-${installState}` : ""}"
      style="${windFarmGridStyle(grid)}"
    >
      ${installState ? `
        <img
          class="wind-install-image"
          src="${ROOM_ASSETS["wind-farm"][installState]}"
          alt=""
          draggable="false"
        >
      ` : ""}
    </span>
  `;
}

function windFarmGridStyle(grid) {
  return [
    `--grid-left: ${grid.left}`,
    `--grid-top: ${grid.top}`,
    `--grid-width: ${grid.width}`,
    `--grid-height: ${grid.height}`,
  ].join("; ");
}

function completedWindFarmState(trades, zoneNumber) {
  return completedVisualState(trades, zoneNumber, WIND_FARM_STATES);
}

function officeZoneVisualLayers(trades, zoneNumber) {
  const roomState = completedOfficeRoomState(trades, zoneNumber);
  if (!roomState) return "";

  return `
    <img
      class="office-room-state"
      src="${ROOM_ASSETS.office[roomState]}"
      alt=""
      aria-hidden="true"
      draggable="false"
    >
  `;
}

function completedHospitalRoomState(trades, zoneNumber) {
  return completedVisualState(trades, zoneNumber, HOSPITAL_ROOM_STATES);
}

function completedOfficeRoomState(trades, zoneNumber) {
  return completedVisualState(trades, zoneNumber, OFFICE_ROOM_STATES);
}

function completedVisualState(trades, zoneNumber, states, fallback = "") {
  const completedTrades = completedTradeKeys(trades, zoneNumber);

  for (const state of states) {
    if (Array.isArray(state)) {
      const [firstKey, secondKey, visualState] = state;
      if (completedTrades.has(firstKey) && completedTrades.has(secondKey)) {
        return visualState;
      }
      continue;
    }

    if (completedTrades.has(state)) return state;
  }

  return fallback;
}

function completedTradeKeys(trades, zoneNumber) {
  return new Set(
    trades
      .filter((trade) => trade.zoneWorkWeeks[zoneNumber]?.length)
      .map((trade) => trade.key),
  );
}

function legacyZoneVisualLayers(trades, zoneNumber) {
  return trades
    .filter((trade) => trade.zoneWorkWeeks[zoneNumber]?.length)
    .map((trade) => {
      const active = trade.zone === zoneNumber && !trade.finished;
      const visual = trade.visual;
      return `
        <span
          class="work-layer ${visual.workClass} ${active ? "active-work" : ""}"
          style="--work-asset: url('${visual.workAsset}')"
        ></span>
      `;
    })
    .join("");
}
