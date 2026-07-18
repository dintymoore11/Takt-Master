import test from "node:test";
import assert from "node:assert/strict";

import { INPUT_ACTIONS } from "./actions.js";
import {
  bindingPressed,
  directionalInterpretation,
  edgeEvents,
  KEYBOARD_BINDINGS,
} from "./inputManager.js";

test("button mappings normalize gamepad button pressed state", () => {
  const gamepad = {
    buttons: [{ pressed: false }, { pressed: true }],
    axes: [0, 0],
  };

  assert.equal(bindingPressed({ type: "button", button: 1 }, gamepad), true);
  assert.equal(bindingPressed({ type: "button", button: 0 }, gamepad), false);
});

test("axis mappings normalize joystick directions with a dead zone", () => {
  const gamepad = {
    buttons: [],
    axes: [-0.7, 0.8],
  };

  assert.equal(bindingPressed({ type: "axis", axis: 0, direction: -1 }, gamepad), true);
  assert.equal(bindingPressed({ type: "axis", axis: 1, direction: 1 }, gamepad), true);
  assert.equal(bindingPressed({ type: "axis", axis: 0, direction: 1 }, gamepad), false);
});

test("edge events fire only once when a control becomes pressed", () => {
  const previous = {
    [INPUT_ACTIONS.START]: true,
    [INPUT_ACTIONS.PUSH_TRADE]: false,
  };
  const next = {
    [INPUT_ACTIONS.START]: true,
    [INPUT_ACTIONS.PUSH_TRADE]: true,
  };

  assert.deepEqual(edgeEvents(previous, next, 1), [
    { playerIndex: 1, action: INPUT_ACTIONS.PUSH_TRADE },
  ]);
});

test("keyboard bindings preserve existing development controls", () => {
  assert.equal(KEYBOARD_BINDINGS[0].codes.ArrowUp, INPUT_ACTIONS.UP);
  assert.equal(KEYBOARD_BINDINGS[0].codes.Space, INPUT_ACTIONS.REMOVE_ROADBLOCK);
  assert.equal(KEYBOARD_BINDINGS[1].codes.KeyW, INPUT_ACTIONS.UP);
  assert.equal(KEYBOARD_BINDINGS[1].codes.Digit2, INPUT_ACTIONS.START);
});

test("directional interpretation exposes four joystick directions", () => {
  assert.deepEqual(directionalInterpretation([0.72, -0.8]), {
    up: true,
    down: false,
    left: false,
    right: true,
  });
});
