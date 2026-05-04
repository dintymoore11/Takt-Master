const OFFICE_TRADE_STAGES = [
  { key: "framing", className: "office-stage-framing" },
  { key: "electrical", className: "office-stage-electrical" },
  { key: "plumbing", className: "office-stage-plumbing" },
  { key: "drywall", className: "office-stage-drywall" },
  { key: "painting", className: "office-stage-painting" },
  { key: "finishes", className: "office-stage-finishes" },
];

export function projectBackdrop(project) {
  if (project?.type !== "office") return "";

  return `
    <div class="project-backdrop office-backdrop" aria-hidden="true">
      <span class="office-sun"></span>
      <span class="office-skyline skyline-a"></span>
      <span class="office-skyline skyline-b"></span>
      <span class="office-crane">
        <i></i>
      </span>
      <span class="office-scaffold"></span>
      <span class="office-materials materials-a"></span>
      <span class="office-materials materials-b"></span>
      <span class="office-ground-plane"></span>
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
  const stages = OFFICE_TRADE_STAGES.map((stage, index) => {
    const trade = trades.find((item) => item.key === stage.key);
    if (!trade?.zoneWorkWeeks[zoneNumber]?.length) return "";

    const active = trade.zone === zoneNumber && !trade.finished;
    return `<span class="office-zone-stage ${stage.className} ${active ? "active-work" : ""}" style="--stage-index: ${index}"></span>`;
  }).join("");

  return `
    <span class="office-room-shell">
      <span class="office-room-floor"></span>
      <span class="office-room-depth left"></span>
      <span class="office-room-depth right"></span>
      <span class="office-room-columns"></span>
      <span class="office-room-window"></span>
    </span>
    ${stages}
  `;
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
