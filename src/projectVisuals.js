import { BUILDING_ASSETS, ROOM_ASSETS } from "./assets/manifest.js";

export function projectBackdrop(project) {
  if (project?.type !== "office") return "";

  return `
    <div class="project-backdrop office-backdrop" aria-hidden="true">
      <img class="office-building-photo" src="${BUILDING_ASSETS["office-project-1"]}" alt="">
    </div>
  `;
}

export function zoneVisualLayers(project, trades, zoneNumber) {
  if (project?.type === "office") {
    return officeZoneVisualLayers(trades, zoneNumber);
  }

  return legacyZoneVisualLayers(trades, zoneNumber);
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

function completedOfficeRoomState(trades, zoneNumber) {
  const completed = (key) => {
    const trade = trades.find((item) => item.key === key);
    return trade?.zoneWorkWeeks[zoneNumber]?.length;
  };

  if (completed("finishes")) return "finishes";
  if (completed("painting")) return "painting";
  if (completed("drywall")) return "drywall";
  if (completed("electrical") && completed("plumbing")) return "electrical";
  if (completed("plumbing")) return "plumbing";
  if (completed("framing")) return "framing";

  return "";
}

function legacyZoneVisualLayers(trades, zoneNumber) {
  return trades
    .filter((trade) => trade.zoneWorkWeeks[zoneNumber]?.length)
    .map((trade) => {
      const active = trade.zone === zoneNumber && !trade.finished;
      const visual = trade.visual;
      return `<span class="work-layer ${visual.workClass} ${active ? "active-work" : ""}" style="--work-asset: url('${visual.workAsset}')"></span>`;
    })
    .join("");
}
