import { INPUT_ACTIONS, PLAYER_COUNT } from "./actions.js";

export const CONTROLLER_MAPPING_VERSION = 1;
export const CONTROLLER_MAPPING_STORAGE_KEY = "taktArcade.controllerMappings.v1";

export function defaultControllerMappings() {
  return {
    version: CONTROLLER_MAPPING_VERSION,
    players: Array.from({ length: PLAYER_COUNT }, (_, index) => ({
      playerIndex: index,
      gamepadId: "",
      gamepadIndex: null,
      actions: defaultActionsForPlayer(index),
    })),
  };
}

export function defaultActionsForPlayer(playerIndex = 0) {
  void playerIndex;
  return {
    [INPUT_ACTIONS.UP]: { type: "axis", axis: 1, direction: -1 },
    [INPUT_ACTIONS.DOWN]: { type: "axis", axis: 1, direction: 1 },
    [INPUT_ACTIONS.LEFT]: { type: "axis", axis: 0, direction: -1 },
    [INPUT_ACTIONS.RIGHT]: { type: "axis", axis: 0, direction: 1 },
    [INPUT_ACTIONS.LOW_VARIABILITY]: { type: "button", button: 0 },
    [INPUT_ACTIONS.MEDIUM_VARIABILITY]: { type: "button", button: 1 },
    [INPUT_ACTIONS.HIGH_VARIABILITY]: { type: "button", button: 2 },
    [INPUT_ACTIONS.REMOVE_ROADBLOCK]: { type: "button", button: 3 },
    [INPUT_ACTIONS.PUSH_TRADE]: { type: "button", button: 4 },
    [INPUT_ACTIONS.IDENTIFY_ROADBLOCKS]: { type: "button", button: 5 },
    [INPUT_ACTIONS.START]: { type: "button", button: 6 },
    [INPUT_ACTIONS.BACK]: { type: "button", button: 7 },
  };
}

export function loadControllerMappings(storage = window.localStorage) {
  try {
    const stored = JSON.parse(storage.getItem(CONTROLLER_MAPPING_STORAGE_KEY) || "null");
    if (stored?.version !== CONTROLLER_MAPPING_VERSION || !Array.isArray(stored.players)) {
      return defaultControllerMappings();
    }
    const defaults = defaultControllerMappings();
    return {
      version: CONTROLLER_MAPPING_VERSION,
      players: defaults.players.map((fallback, index) => ({
        ...fallback,
        ...(stored.players[index] || {}),
        actions: {
          ...fallback.actions,
          ...(stored.players[index]?.actions || {}),
        },
      })),
    };
  } catch {
    return defaultControllerMappings();
  }
}

export function saveControllerMappings(mappings, storage = window.localStorage) {
  storage.setItem(CONTROLLER_MAPPING_STORAGE_KEY, JSON.stringify({
    version: CONTROLLER_MAPPING_VERSION,
    players: mappings.players,
  }));
}

export function resetControllerMappings(storage = window.localStorage) {
  const mappings = defaultControllerMappings();
  saveControllerMappings(mappings, storage);
  return mappings;
}
