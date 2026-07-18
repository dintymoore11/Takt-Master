export const LEADERBOARD_STORAGE_KEY = "taktTowersLeaderboard";

export function loadLeaderboard(storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(LEADERBOARD_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveLeaderboardRows(rows, storage = localStorage) {
  storage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(rows));
}

export function resetLeaderboard(storage = localStorage) {
  storage.removeItem(LEADERBOARD_STORAGE_KEY);
}

