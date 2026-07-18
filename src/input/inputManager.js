import {
  AXIS_NEUTRAL_THRESHOLD,
  AXIS_PRESS_THRESHOLD,
  INPUT_ACTIONS,
  PLAYER_COUNT,
} from "./actions.js";
import {
  defaultControllerMappings,
  loadControllerMappings,
  saveControllerMappings,
} from "./controllerStorage.js";

export const KEYBOARD_BINDINGS = [
  {
    playerIndex: 0,
    codes: {
      ArrowUp: INPUT_ACTIONS.UP,
      ArrowDown: INPUT_ACTIONS.DOWN,
      ArrowLeft: INPUT_ACTIONS.LEFT,
      ArrowRight: INPUT_ACTIONS.RIGHT,
      KeyI: INPUT_ACTIONS.LOW_VARIABILITY,
      KeyO: INPUT_ACTIONS.MEDIUM_VARIABILITY,
      KeyP: INPUT_ACTIONS.HIGH_VARIABILITY,
      KeyJ: INPUT_ACTIONS.REMOVE_ROADBLOCK,
      Space: INPUT_ACTIONS.REMOVE_ROADBLOCK,
      KeyL: INPUT_ACTIONS.PUSH_TRADE,
      KeyK: INPUT_ACTIONS.IDENTIFY_ROADBLOCKS,
      Digit1: INPUT_ACTIONS.START,
      Escape: INPUT_ACTIONS.BACK,
    },
  },
  {
    playerIndex: 1,
    codes: {
      KeyW: INPUT_ACTIONS.UP,
      KeyS: INPUT_ACTIONS.DOWN,
      KeyA: INPUT_ACTIONS.LEFT,
      KeyD: INPUT_ACTIONS.RIGHT,
      KeyE: INPUT_ACTIONS.LOW_VARIABILITY,
      KeyR: INPUT_ACTIONS.MEDIUM_VARIABILITY,
      KeyT: INPUT_ACTIONS.HIGH_VARIABILITY,
      KeyF: INPUT_ACTIONS.REMOVE_ROADBLOCK,
      KeyH: INPUT_ACTIONS.PUSH_TRADE,
      KeyG: INPUT_ACTIONS.IDENTIFY_ROADBLOCKS,
      Digit2: INPUT_ACTIONS.START,
      Backspace: INPUT_ACTIONS.BACK,
    },
  },
];

export function bindingPressed(binding, gamepad) {
  if (!binding || !gamepad) return false;
  if (binding.type === "button") return Boolean(gamepad.buttons?.[binding.button]?.pressed);
  if (binding.type === "axis") {
    const value = gamepad.axes?.[binding.axis] ?? 0;
    return binding.direction < 0
      ? value <= -AXIS_PRESS_THRESHOLD
      : value >= AXIS_PRESS_THRESHOLD;
  }
  return false;
}

export function edgeEvents(previousHeld, nextHeld, playerIndex) {
  return Object.entries(nextHeld)
    .filter(([action, held]) => held && !previousHeld[action])
    .map(([action]) => ({ playerIndex, action }));
}

export function directionalInterpretation(axes = []) {
  return {
    up: (axes[1] ?? 0) <= -AXIS_PRESS_THRESHOLD,
    down: (axes[1] ?? 0) >= AXIS_PRESS_THRESHOLD,
    left: (axes[0] ?? 0) <= -AXIS_PRESS_THRESHOLD,
    right: (axes[0] ?? 0) >= AXIS_PRESS_THRESHOLD,
  };
}

export function getConnectedGamepads() {
  if (!navigator.getGamepads) return [];
  return Array.from(navigator.getGamepads()).filter(Boolean);
}

export class InputManager {
  constructor({ storage = window.localStorage } = {}) {
    this.storage = storage;
    this.mappings = loadControllerMappings(storage);
    this.connected = [];
    this.events = [];
    this.held = Array.from({ length: PLAYER_COUNT }, () => ({}));
    this.keyboardHeld = new Map();
    this.actionListeners = new Set();
    this.running = false;
    this.rafId = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.rafId) window.cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  onAction(callback) {
    this.actionListeners.add(callback);
    return () => this.actionListeners.delete(callback);
  }

  handleKeyDown(event, { emit = true } = {}) {
    const match = this.keyboardActionForCode(event.code);
    if (!match) return false;
    const keyId = `${match.playerIndex}:${match.action}`;
    if (!this.keyboardHeld.get(keyId)) {
      this.keyboardHeld.set(keyId, true);
      if (emit) this.emit({ ...match, source: "keyboard" });
    }
    return true;
  }

  handleKeyUp(event) {
    const match = this.keyboardActionForCode(event.code);
    if (!match) return false;
    this.keyboardHeld.delete(`${match.playerIndex}:${match.action}`);
    return true;
  }

  keyboardActionForCode(code) {
    for (const player of KEYBOARD_BINDINGS) {
      const action = player.codes[code];
      if (action) return { playerIndex: player.playerIndex, action };
    }
    return null;
  }

  consumeEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }

  isHeld(playerIndex, action) {
    return (
      Boolean(this.held[playerIndex]?.[action]) ||
      Boolean(this.keyboardHeld.get(`${playerIndex}:${action}`))
    );
  }

  updateMappings(mappings) {
    this.mappings = mappings;
    saveControllerMappings(mappings, this.storage);
  }

  resetMappings() {
    this.updateMappings(defaultControllerMappings());
  }

  snapshot() {
    this.refreshConnectedGamepads();
    return this.connected.map((gamepad) => ({
      index: gamepad.index,
      id: gamepad.id,
      connected: gamepad.connected,
      axes: Array.from(gamepad.axes || []),
      buttons: Array.from(gamepad.buttons || []).map((button, index) => ({
        index,
        pressed: button.pressed,
        value: button.value,
      })),
      directions: directionalInterpretation(gamepad.axes),
      playerIndex: this.playerIndexForGamepad(gamepad),
    }));
  }

  refreshConnectedGamepads() {
    this.connected = getConnectedGamepads();
    return this.connected;
  }

  loop() {
    this.pollGamepads();
    if (this.running) this.rafId = window.requestAnimationFrame(() => this.loop());
  }

  pollGamepads() {
    const gamepads = this.refreshConnectedGamepads();
    const nextHeld = Array.from({ length: PLAYER_COUNT }, () => ({}));

    const claimedGamepadIndexes = new Set();
    this.mappings.players.forEach((playerMapping, playerIndex) => {
      const gamepad = this.gamepadForPlayer(playerMapping, gamepads, claimedGamepadIndexes);
      if (!gamepad) return;
      claimedGamepadIndexes.add(gamepad.index);
      Object.entries(playerMapping.actions).forEach(([action, binding]) => {
        nextHeld[playerIndex][action] = bindingPressed(binding, gamepad);
      });
    });

    nextHeld.forEach((held, playerIndex) => {
      edgeEvents(this.held[playerIndex] || {}, held, playerIndex).forEach((event) => {
        this.emit({ ...event, source: "gamepad" });
      });
    });
    this.held = nextHeld;
  }

  gamepadForPlayer(playerMapping, gamepads = this.connected, claimedGamepadIndexes = new Set()) {
    if (!playerMapping) return null;
    const available = gamepads.filter((gamepad) => !claimedGamepadIndexes.has(gamepad.index));
    const byIdAndIndex = playerMapping.gamepadId && Number.isInteger(playerMapping.gamepadIndex)
      ? available.find(
        (gamepad) => gamepad.id === playerMapping.gamepadId && gamepad.index === playerMapping.gamepadIndex,
      )
      : null;
    if (byIdAndIndex) return byIdAndIndex;

    const byIndex = Number.isInteger(playerMapping.gamepadIndex)
      ? available.find((gamepad) => gamepad.index === playerMapping.gamepadIndex)
      : null;
    if (byIndex) return byIndex;

    const byId = playerMapping.gamepadId
      ? available.find((gamepad) => gamepad.id === playerMapping.gamepadId)
      : null;
    if (byId) return byId;

    return available[playerMapping.playerIndex] || available[0] || null;
  }

  playerIndexForGamepad(gamepad) {
    const exact = this.mappings.players.findIndex(
      (mapping) => mapping.gamepadId &&
        mapping.gamepadId === gamepad.id &&
        Number.isInteger(mapping.gamepadIndex) &&
        mapping.gamepadIndex === gamepad.index,
    );
    if (exact >= 0) return exact;
    const indexed = this.mappings.players.findIndex(
      (mapping) => Number.isInteger(mapping.gamepadIndex) && mapping.gamepadIndex === gamepad.index,
    );
    if (indexed >= 0) return indexed;
    const byId = this.mappings.players.findIndex(
      (mapping) => mapping.gamepadId && mapping.gamepadId === gamepad.id,
    );
    return byId >= 0 ? byId : gamepad.index < PLAYER_COUNT ? gamepad.index : null;
  }

  emit(event) {
    this.events.push(event);
    this.actionListeners.forEach((callback) => callback(event));
  }
}
