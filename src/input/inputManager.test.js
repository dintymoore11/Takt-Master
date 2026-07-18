import test from "node:test";
import assert from "node:assert/strict";

import { INPUT_ACTIONS, PLAYER_ACTION_SEQUENCE } from "./actions.js";
import {
  bindingPressed,
  directionalInterpretation,
  edgeEvents,
  InputManager,
  KEYBOARD_BINDINGS,
} from "./inputManager.js";
import { defaultControllerMappings } from "./controllerStorage.js";

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


test("control mapper prompts identify roadblocks before push trade", () => {
  const identifyIndex = PLAYER_ACTION_SEQUENCE.indexOf(INPUT_ACTIONS.IDENTIFY_ROADBLOCKS);
  const pushIndex = PLAYER_ACTION_SEQUENCE.indexOf(INPUT_ACTIONS.PUSH_TRADE);

  assert.equal(identifyIndex, pushIndex - 1);
});


test("identical gamepad ids still route to separate mapped players", () => {
  const storage = {
    getItem: () => null,
    setItem: () => {},
  };
  const manager = new InputManager({ storage });
  const mappings = defaultControllerMappings();
  mappings.players[0].gamepadId = "Generic USB Joystick";
  mappings.players[0].gamepadIndex = 0;
  mappings.players[1].gamepadId = "Generic USB Joystick";
  mappings.players[1].gamepadIndex = 1;
  manager.updateMappings(mappings);

  const gamepads = [
    { id: "Generic USB Joystick", index: 0, buttons: [], axes: [] },
    { id: "Generic USB Joystick", index: 1, buttons: [], axes: [] },
  ];
  const claimed = new Set();
  const playerOnePad = manager.gamepadForPlayer(mappings.players[0], gamepads, claimed);
  claimed.add(playerOnePad.index);
  const playerTwoPad = manager.gamepadForPlayer(mappings.players[1], gamepads, claimed);

  assert.equal(playerOnePad.index, 0);
  assert.equal(playerTwoPad.index, 1);
  assert.equal(manager.playerIndexForGamepad(gamepads[0]), 0);
  assert.equal(manager.playerIndexForGamepad(gamepads[1]), 1);
});
