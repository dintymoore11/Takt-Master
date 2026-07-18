import {
  AXIS_NEUTRAL_THRESHOLD,
  AXIS_PRESS_THRESHOLD,
  INPUT_ACTIONS,
} from "./actions.js";

const DIRECTION_AXIS = {
  [INPUT_ACTIONS.UP]: { axis: 1, direction: -1 },
  [INPUT_ACTIONS.DOWN]: { axis: 1, direction: 1 },
  [INPUT_ACTIONS.LEFT]: { axis: 0, direction: -1 },
  [INPUT_ACTIONS.RIGHT]: { axis: 0, direction: 1 },
};

export function isDirectionAction(action) {
  return Boolean(DIRECTION_AXIS[action]);
}

export function joystickNeutral(gamepad) {
  return Array.from(gamepad?.axes || []).every(
    (value) => Math.abs(value) <= AXIS_NEUTRAL_THRESHOLD,
  );
}

export function detectMappingInput(gamepad, action, usedButtonIndexes = new Set()) {
  if (!gamepad) return null;
  if (isDirectionAction(action)) {
    const expected = DIRECTION_AXIS[action];
    const value = gamepad.axes?.[expected.axis] ?? 0;
    const pressed = expected.direction < 0
      ? value <= -AXIS_PRESS_THRESHOLD
      : value >= AXIS_PRESS_THRESHOLD;
    return pressed ? { type: "axis", axis: expected.axis, direction: expected.direction } : null;
  }

  const buttons = Array.from(gamepad.buttons || []);
  const button = buttons.findIndex(
    (item, index) => item.pressed && !usedButtonIndexes.has(index),
  );
  return button >= 0 ? { type: "button", button } : null;
}

