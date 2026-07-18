import test from "node:test";
import assert from "node:assert/strict";

import {
  LEADERBOARD_STORAGE_KEY,
  loadLeaderboard,
  resetLeaderboard,
} from "./leaderboardStorage.js";

test("resetLeaderboard clears only the leaderboard storage key", () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };

  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify([{ name: "AAA", earnings: 100 }]));
  localStorage.setItem("taktArcade.controllerMappings.v1", "keep");

  assert.equal(loadLeaderboard().length, 1);
  resetLeaderboard();

  assert.deepEqual(loadLeaderboard(), []);
  assert.equal(localStorage.getItem("taktArcade.controllerMappings.v1"), "keep");
});
