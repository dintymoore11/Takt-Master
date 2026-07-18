import { ACTION_LABELS, PLAYER_ACTION_SEQUENCE, PLAYER_COUNT } from "../input/actions.js";
import { CONTROLLER_MAPPING_STORAGE_KEY, CONTROLLER_MAPPING_VERSION } from "../input/controllerStorage.js";

export function maintenanceView(selectedIndex = 0) {
  return `
    <main class="maintenance-screen">
      <section class="maintenance-panel">
        <h1>Maintenance</h1>
        <div class="maintenance-actions">
          <button class="${selectedIndex === 0 ? "selected-menu-action" : ""}" type="button" data-maintenance-resume>Resume Game</button>
          <button class="${selectedIndex === 1 ? "selected-menu-action" : ""}" type="button" data-maintenance-input-test>Input Tester</button>
          <button class="${selectedIndex === 2 ? "selected-menu-action" : ""}" type="button" data-maintenance-configure>Configure Controls</button>
          <button class="${selectedIndex === 3 ? "selected-menu-action" : ""}" type="button" data-maintenance-reset>Reset Controls</button>
        </div>
      </section>
    </main>
  `;
}

export function leaderboardResetConfirmView(selectedIndex = 1) {
  return `
    <main class="maintenance-screen">
      <section class="maintenance-panel">
        <h1>Reset Leaderboard?</h1>
        <p class="maintenance-copy">This will permanently clear all saved leaderboard scores on this cabinet.</p>
        <div class="maintenance-actions">
          <button class="${selectedIndex === 0 ? "selected-menu-action" : ""}" type="button" data-leaderboard-reset-confirm>Reset Leaderboard</button>
          <button class="${selectedIndex === 1 ? "selected-menu-action" : ""}" type="button" data-leaderboard-reset-cancel>Cancel</button>
        </div>
      </section>
    </main>
  `;
}

export function leaderboardResetCompleteView() {
  return `
    <main class="maintenance-screen">
      <section class="maintenance-panel">
        <h1>Leaderboard Reset</h1>
        <p class="maintenance-copy">All saved leaderboard scores have been cleared.</p>
        <div class="maintenance-actions">
          <button type="button" data-leaderboard-reset-done>Done</button>
        </div>
      </section>
    </main>
  `;
}

export function inputTesterView(snapshots = []) {
  const byPlayer = Array.from({ length: PLAYER_COUNT }, (_, index) =>
    snapshots.find((gamepad) => gamepad.playerIndex === index) || null,
  );
  const unassigned = snapshots.filter((gamepad) => gamepad.playerIndex === null);
  return `
    <main class="input-screen">
      <header class="input-header">
        <h1>Input Tester</h1>
        <button type="button" data-input-back>Back</button>
      </header>
      <section class="input-player-grid">
        ${byPlayer.map((gamepad, index) => gamepadPanel(gamepad, index)).join("")}
        ${unassigned.map((gamepad) => gamepadPanel(gamepad, null)).join("")}
      </section>
    </main>
  `;
}

export function mapperView(session) {
  const playerTitle = `Player ${session.playerIndex + 1}`;
  const actionLabel = ACTION_LABELS[session.action];
  const completed = session.complete;
  const playerCompleted = session.playerComplete;
  return `
    <main class="input-screen">
      <header class="input-header">
        <h1>Configure Controls</h1>
        <button type="button" data-mapper-cancel>Cancel</button>
      </header>
      <section class="mapper-panel">
        ${completed
          ? `
            <h2>Mapping Complete</h2>
            <p>Player 1 and Player 2 controls are saved.</p>
            <div class="mapper-actions">
              <button class="${session.menuIndex === 0 ? "selected-menu-action" : ""}" type="button" data-mapper-confirm>Done</button>
              <button class="${session.menuIndex === 1 ? "selected-menu-action" : ""}" type="button" data-mapper-reset>Reset to Defaults</button>
            </div>
          `
          : playerCompleted
            ? `
              <p class="mapper-step">${playerTitle}</p>
              <h2>${playerTitle} Controls Complete</h2>
              <p>Save this player, then continue when you are ready to map the next controller.</p>
              <div class="mapper-progress">
                ${playerTitle} step ${PLAYER_ACTION_SEQUENCE.length} of ${PLAYER_ACTION_SEQUENCE.length}
              </div>
              <div class="mapper-actions">
                <button class="${session.menuIndex === 0 ? "selected-menu-action" : ""}" type="button" data-mapper-save-player>Save ${playerTitle}</button>
                ${session.playerIndex + 1 < PLAYER_COUNT
                  ? `<button class="${session.menuIndex === 1 ? "selected-menu-action" : ""}" type="button" data-mapper-next-player>Save and Configure Player ${session.playerIndex + 2}</button>`
                  : `<button class="${session.menuIndex === 1 ? "selected-menu-action" : ""}" type="button" data-mapper-finish>Save and Exit</button>`}
                <button class="${session.menuIndex === 2 ? "selected-menu-action" : ""}" type="button" data-mapper-back>Back</button>
                <button class="${session.menuIndex === 3 ? "selected-menu-action" : ""}" type="button" data-mapper-reset>Reset to Defaults</button>
              </div>
            `
          : `
            <p class="mapper-step">${playerTitle}</p>
            <h2>${actionLabel}</h2>
            <p>${session.waitingForNeutral ? "Release the joystick to neutral." : "Press the requested control now."}</p>
            <div class="mapper-progress">
              Step ${session.stepIndex + 1} of ${PLAYER_ACTION_SEQUENCE.length} for ${playerTitle}
            </div>
            <div class="mapper-actions">
              <button type="button" data-mapper-back>Back</button>
              <button type="button" data-mapper-retry>Retry</button>
              <button type="button" data-mapper-reset>Reset to Defaults</button>
            </div>
          `}
      </section>
    </main>
  `;
}

function gamepadPanel(gamepad, playerIndex) {
  const title = playerIndex === null ? "Unassigned" : `Player ${playerIndex + 1}`;
  if (!gamepad) {
    return `
      <article class="gamepad-panel missing">
        <h2>${title}</h2>
        <p>No gamepad detected.</p>
      </article>
    `;
  }

  const directions = Object.entries(gamepad.directions)
    .filter(([, active]) => active)
    .map(([direction]) => direction.toUpperCase())
    .join(" ") || "NEUTRAL";

  return `
    <article class="gamepad-panel">
      <h2>${title}</h2>
      <p><strong>Index:</strong> ${gamepad.index}</p>
      <p><strong>Name:</strong> ${gamepad.id || "Unknown device"}</p>
      <p><strong>Direction:</strong> ${directions}</p>
      <div class="axis-grid">
        ${gamepad.axes.map((value, index) => `
          <span>Axis ${index}</span>
          <meter min="-1" max="1" low="-0.65" high="0.65" value="${value}"></meter>
          <code>${value.toFixed(3)}</code>
        `).join("")}
      </div>
      <div class="button-grid">
        ${gamepad.buttons.map((button) => `
          <span class="button-dot ${button.pressed ? "pressed" : ""}">B${button.index}</span>
        `).join("")}
      </div>
    </article>
  `;
}

export function controlsStorageNote() {
  return `Controller mappings are stored in local storage at ${CONTROLLER_MAPPING_STORAGE_KEY}, version ${CONTROLLER_MAPPING_VERSION}.`;
}
