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
  "solar-farm": {
    className: "solar-farm-backdrop",
    imageClassName: "solar-farm-building-photo",
    assetKey: "solar-farm-project-5",
  },
  "industrial-plant": {
    className: "industrial-plant-backdrop",
    imageClassName: "industrial-plant-building-photo",
    assetKey: "industrial-plant-project-6",
  },
};

const PROJECT_VISUAL_LAYERS = {
  office: officeZoneVisualLayers,
  hospital: hospitalZoneVisualLayers,
  "data-center": dataCenterZoneVisualLayers,
  "wind-farm": windFarmZoneVisualLayers,
  housing: housingZoneVisualLayers,
  "solar-farm": solarFarmZoneVisualLayers,
  "industrial-plant": industrialPlantZoneVisualLayers,
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

const HOUSING_STATES = [
  "final-punchlist",
  "landscaping",
  "interior-finishes",
  "exterior-finishes",
  "roofing",
  "framing",
  "foundations",
  "utilities",
  "survey-layout",
];

const SOLAR_FARM_STATES = [
  "solar-commissioning",
  "grid-tie",
  "solar-panels",
  "inverters",
  "collection-cabling",
  "solar-racking",
  "pile-driving",
  "access-roads",
];

const INDUSTRIAL_PLANT_STATES = [
  "industrial-commissioning",
  "insulation-cladding",
  "electrical-instrumentation",
  "pipe-fitters",
  "boilermakers-millwrights",
  "structural-steel",
  "industrial-foundations",
  "below-grade-utilities",
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

const SOLAR_FARM_COLUMN_COUNT = 6;
const SOLAR_FARM_GRID_ROWS = [
  { y: 30.8, left: 24.3, right: 75.6 },
  { y: 38.7, left: 22.1, right: 78.1 },
  { y: 47.4, left: 19.8, right: 80.3 },
  { y: 57.2, left: 17.0, right: 82.4 },
  { y: 68.8, left: 14.6, right: 84.8 },
  { y: 82.4, left: 12.3, right: 87.0 },
];
const SOLAR_FARM_GRID = buildPerspectiveGrid(
  SOLAR_FARM_GRID_ROWS,
  SOLAR_FARM_COLUMN_COUNT,
);

const INDUSTRIAL_PLANT_COLUMN_COUNT = SOLAR_FARM_COLUMN_COUNT;
const INDUSTRIAL_PLANT_GRID_ROWS = [
  { y: 12.2, left: 17.0, right: 83.0 },
  { y: 25.6, left: 14.6, right: 85.4 },
  { y: 40.2, left: 12.0, right: 88.0 },
  { y: 57.0, left: 8.9, right: 91.1 },
  { y: 76.0, left: 5.2, right: 94.8 },
  { y: 100.0, left: 0.0, right: 100.0 },
];
const INDUSTRIAL_PLANT_GRID = buildPerspectiveGrid(
  INDUSTRIAL_PLANT_GRID_ROWS,
  INDUSTRIAL_PLANT_COLUMN_COUNT,
);

const HOUSING_SITE_COLUMN_COUNT = 5;
const HOUSING_SITE_GRID_ROWS = [
  { y: 11.3, left: 26.7, right: 83.2 },
  { y: 26.3, left: 24.2, right: 83.9 },
  { y: 42.5, left: 21.5, right: 85.7 },
  { y: 61.5, left: 18.6, right: 88.0 },
  { y: 84.9, left: 16.5, right: 93.0 },
];
const HOUSING_SITE_GRID = buildPerspectiveGrid(
  HOUSING_SITE_GRID_ROWS,
  HOUSING_SITE_COLUMN_COUNT,
);

const FULL_SITE_PROJECTS = {
  housing: {
    roomKey: "housing",
    layerClassName: "housing-site-install-layer",
    imageClassName: "housing-site-image",
    stateClassPrefix: "housing-site-state",
    completedState: completedHousingState,
    gridForZone: housingGridForZone,
  },
  "solar-farm": {
    roomKey: "solar-farm",
    layerClassName: "solar-farm-install-layer",
    imageClassName: "solar-site-image",
    stateClassPrefix: "solar-site-state",
    completedState: completedSolarFarmState,
    gridForZone: solarFarmGridForZone,
  },
  "industrial-plant": {
    roomKey: "industrial-plant",
    layerClassName: "industrial-plant-install-layer",
    imageClassName: "industrial-site-image",
    stateClassPrefix: "industrial-site-state",
    completedState: completedIndustrialPlantState,
    gridForZone: industrialPlantGridForZone,
  },
};

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
  const fullSiteProject = FULL_SITE_PROJECTS[project?.type];
  if (fullSiteProject) {
    return fullSiteOverlayLayer(fullSiteProject, trades, zoneNumbers);
  }

  if (project?.type !== "wind-farm") return "";

  return `
    <div class="wind-farm-install-layer" aria-hidden="true">
      ${zoneNumbers
        .map((zoneNumber) => windFarmInstallOverlay(trades, zoneNumber))
        .join("")}
    </div>
  `;
}

export function projectZoneStyle(project, zoneNumber) {
  const fullSiteProject = FULL_SITE_PROJECTS[project?.type];
  if (!fullSiteProject) return "";

  const grid = fullSiteProject.gridForZone(zoneNumber);
  return grid ? gridStyle(grid) : "";
}

export function projectZoneForDirection(project, currentZone, direction) {
  const fullSiteProject = FULL_SITE_PROJECTS[project?.type];
  if (!fullSiteProject?.spatialNavigation) return undefined;

  const mappedZone = fullSiteProject.navigationMap?.[currentZone]?.[direction];
  if (mappedZone) return mappedZone;
  if (fullSiteProject.navigationMap) return currentZone;

  return nearestDirectionalZone(
    fullSiteProject.navigationGrid,
    currentZone,
    direction,
  );
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

function solarFarmZoneVisualLayers() {
  return "";
}

function industrialPlantZoneVisualLayers() {
  return "";
}

function housingZoneVisualLayers() {
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

function gridStyle(grid) {
  return [
    `--grid-left: ${percent(grid.left)}`,
    `--grid-top: ${percent(grid.top)}`,
    `--grid-width: ${percent(grid.width)}`,
    `--grid-height: ${percent(grid.height)}`,
    `--grid-clip: ${grid.localClip}`,
  ].join("; ");
}

function completedWindFarmState(trades, zoneNumber) {
  return completedVisualState(trades, zoneNumber, WIND_FARM_STATES);
}

function completedSolarFarmState(trades, zoneNumber) {
  return completedVisualState(trades, zoneNumber, SOLAR_FARM_STATES);
}

function completedHousingState(trades, zoneNumber) {
  return completedVisualState(trades, zoneNumber, HOUSING_STATES);
}

function completedIndustrialPlantState(trades, zoneNumber) {
  return completedVisualState(trades, zoneNumber, INDUSTRIAL_PLANT_STATES);
}

function fullSiteOverlayLayer(config, trades, zoneNumbers) {
  const assets = ROOM_ASSETS[config.roomKey];

  return `
    <div class="site-install-layer ${config.layerClassName}" aria-hidden="true">
      <img
        class="site-image site-base ${config.imageClassName}"
        src="${assets["original-site"]}"
        alt=""
        draggable="false"
      >
      ${fullSiteStageOverlays(config, trades, zoneNumbers)}
    </div>
  `;
}

function fullSiteStageOverlays(config, trades, zoneNumbers) {
  const groups = new Map();

  zoneNumbers.forEach((zoneNumber) => {
    const installState = config.completedState(trades, zoneNumber);
    const grid = config.gridForZone(zoneNumber);
    const asset = ROOM_ASSETS[config.roomKey][installState];
    if (!grid || !asset) return;

    if (!groups.has(installState)) {
      groups.set(installState, { asset, grids: [] });
    }
    groups.get(installState).grids.push(grid);
  });

  return Array.from(groups.entries())
    .map(([installState, group]) =>
      fullSiteStageOverlay(config, installState, group.asset, group.grids),
    )
    .join("");
}

function fullSiteStageOverlay(config, installState, asset, grids) {
  const clipId = `${config.roomKey}-${installState}-clip`.replace(
    /[^a-z0-9_-]/gi,
    "-",
  );

  return `
    <svg
      class="site-image site-step-zone site-svg-zone ${config.imageClassName} ${config.stateClassPrefix}-${installState}"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      focusable="false"
    >
      <defs>
        <clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">
          ${grids
            .map(
              (grid) =>
                `<polygon points="${svgPolygonPoints(grid.sitePoints)}"></polygon>`,
            )
            .join("")}
        </clipPath>
      </defs>
      <image
        href="${asset}"
        x="0"
        y="0"
        width="100"
        height="100"
        preserveAspectRatio="none"
        clip-path="url(#${clipId})"
      ></image>
    </svg>
  `;
}

function housingGridForZone(zoneNumber) {
  const row = Math.ceil(zoneNumber / HOUSING_SITE_COLUMN_COUNT);
  const column = ((zoneNumber - 1) % HOUSING_SITE_COLUMN_COUNT) + 1;
  const visualColumn =
    row % 2 === 0 ? HOUSING_SITE_COLUMN_COUNT - column + 1 : column;
  return HOUSING_SITE_GRID[
    (row - 1) * HOUSING_SITE_COLUMN_COUNT + visualColumn - 1
  ];
}

function solarFarmGridForZone(zoneNumber) {
  const row = Math.ceil(zoneNumber / SOLAR_FARM_COLUMN_COUNT);
  const column = ((zoneNumber - 1) % SOLAR_FARM_COLUMN_COUNT) + 1;
  const visualColumn =
    row % 2 === 0 ? SOLAR_FARM_COLUMN_COUNT - column + 1 : column;
  return SOLAR_FARM_GRID[(row - 1) * SOLAR_FARM_COLUMN_COUNT + visualColumn - 1];
}

function industrialPlantGridForZone(zoneNumber) {
  if (zoneNumber === 25) {
    return INDUSTRIAL_PLANT_GRID.slice(-INDUSTRIAL_PLANT_COLUMN_COUNT).reduce(
      mergeGridCells,
    );
  }

  const row = Math.ceil(zoneNumber / INDUSTRIAL_PLANT_COLUMN_COUNT);
  const column = ((zoneNumber - 1) % INDUSTRIAL_PLANT_COLUMN_COUNT) + 1;
  const visualColumn =
    row % 2 === 0 ? INDUSTRIAL_PLANT_COLUMN_COUNT - column + 1 : column;
  return INDUSTRIAL_PLANT_GRID[
    (row - 1) * INDUSTRIAL_PLANT_COLUMN_COUNT + visualColumn - 1
  ];
}

function mergeGridCells(firstCell, nextCell) {
  const left = Math.min(firstCell.left, nextCell.left);
  const top = Math.min(firstCell.top, nextCell.top);
  const right = Math.max(
    firstCell.left + firstCell.width,
    nextCell.left + nextCell.width,
  );
  const bottom = Math.max(
    firstCell.top + firstCell.height,
    nextCell.top + nextCell.height,
  );

  return rectGridCell(left, top, right, bottom);
}

function buildPerspectiveGrid(rows, columnCount) {
  const cells = [];

  for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex += 1) {
    const topRow = rows[rowIndex];
    const bottomRow = rows[rowIndex + 1];

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const leftRatio = columnIndex / columnCount;
      const rightRatio = (columnIndex + 1) / columnCount;
      const points = [
        pointOnRow(topRow, leftRatio),
        pointOnRow(topRow, rightRatio),
        pointOnRow(bottomRow, rightRatio),
        pointOnRow(bottomRow, leftRatio),
      ];
      cells.push(buildGridCell(points));
    }
  }

  return cells;
}

function buildRectangularGrid(bounds, rowCount, columnCount) {
  const cells = [];
  const cellWidth = (bounds.right - bounds.left) / columnCount;
  const cellHeight = (bounds.bottom - bounds.top) / rowCount;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const left = bounds.left + cellWidth * columnIndex;
      const top = bounds.top + cellHeight * rowIndex;
      cells.push(rectGridCell(left, top, left + cellWidth, top + cellHeight));
    }
  }

  return cells;
}

function rectGridCell(left, top, right, bottom) {
  return buildGridCell([
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ]);
}

function imageGridCell(size, points) {
  return buildGridCell(
    points.map(([x, y]) => ({
      x: (x / size.width) * 100,
      y: (y / size.height) * 100,
    })),
  );
}

function pointOnRow(row, ratio) {
  return {
    x: row.left + (row.right - row.left) * ratio,
    y: row.y,
  };
}

function buildGridCell(points) {
  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);
  const left = Math.min(...xValues);
  const right = Math.max(...xValues);
  const top = Math.min(...yValues);
  const bottom = Math.max(...yValues);
  const width = right - left;
  const height = bottom - top;

  return {
    left,
    top,
    width,
    height,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
    sitePoints: points,
    localClip: polygon(
      points.map((point) => ({
        x: ((point.x - left) / width) * 100,
        y: ((point.y - top) / height) * 100,
      })),
    ),
    siteClip: polygon(points),
  };
}

function nearestDirectionalZone(grid, currentZone, direction) {
  const current = grid[currentZone - 1];
  if (!current) return currentZone;

  const candidates = grid
    .map((cell, index) => ({ cell, zone: index + 1 }))
    .filter(({ zone }) => zone !== currentZone)
    .map(({ cell, zone }) => {
      const dx = cell.centerX - current.centerX;
      const dy = cell.centerY - current.centerY;
      return { cell, zone, dx, dy };
    })
    .filter((candidate) => isDirectionalCandidate(candidate, direction));

  if (!candidates.length) return currentZone;

  candidates.sort((a, b) => {
    const scoreA = directionalScore(a, direction);
    const scoreB = directionalScore(b, direction);
    return scoreA - scoreB || a.zone - b.zone;
  });

  return candidates[0].zone;
}

function rectangularNavigation(rowCount, columnCount) {
  return Array.from({ length: rowCount * columnCount }, (_, index) => {
    const zone = index + 1;
    const row = Math.floor(index / columnCount);
    const column = index % columnCount;

    return {
      ArrowLeft: column > 0 ? zone - 1 : zone,
      ArrowRight: column < columnCount - 1 ? zone + 1 : zone,
      ArrowUp: row > 0 ? zone - columnCount : zone,
      ArrowDown: row < rowCount - 1 ? zone + columnCount : zone,
    };
  });
}

function isDirectionalCandidate({ dx, dy }, direction) {
  const minimumMovement = 1.5;
  if (direction === "ArrowLeft") return dx < -minimumMovement;
  if (direction === "ArrowRight") return dx > minimumMovement;
  if (direction === "ArrowUp") return dy < -minimumMovement;
  if (direction === "ArrowDown") return dy > minimumMovement;
  return false;
}

function directionalScore({ dx, dy }, direction) {
  const primary =
    direction === "ArrowLeft" || direction === "ArrowRight"
      ? Math.abs(dx)
      : Math.abs(dy);
  const secondary =
    direction === "ArrowLeft" || direction === "ArrowRight"
      ? Math.abs(dy)
      : Math.abs(dx);

  return primary + secondary * 1.45;
}

function polygon(points) {
  return `polygon(${points
    .map((point) => `${percent(point.x)} ${percent(point.y)}`)
    .join(", ")})`;
}

function svgPolygonPoints(points) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function percent(value) {
  return `${Number(value).toFixed(3)}%`;
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
