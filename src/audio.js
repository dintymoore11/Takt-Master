import { audioAsset } from "./assets/manifest.js";
import {
  projectBudget,
  setRoadblockAppearedCallback,
  setRoadblockResolvedCallback,
  setRollDurationMs,
  setWorkerBlockedCallback,
  setWorkerPushBlockedCallback,
  setWorkerPushRoadblockedCallback,
  setWorkerPushedCallback,
  setWorkerRoadblockedCallback,
  setWorkerWorkCallback,
  state,
} from "./gameLogic.js";

const CONSTRUCTION_AMBIENCE_VOLUME = 0.24;
const DICE_ROLL_VOLUME = 0.72;
const WORKER_FRUSTRATION_VOLUME = 0.68;
const WORKER_PUSHED_VOLUME = 0.7;
const KIND_PUSH_LIMIT = 3;
const WORKER_WORK_VOLUME = 0.34;
const WORKER_WORK_COOLDOWN_MS = 420;
const WORKER_ROADBLOCKED_SOUND_COOLDOWN_MS = 1_500;
const WORKER_FRUSTRATION_SOUND_SPACING_MS = 500;
const PROJECT_RESULT_VOLUME = 0.82;
const CAREER_VICTORY_VOLUME = 0.88;
const ROADBLOCK_SOUND_VOLUME = 0.76;

const WORKER_FRUSTRATION_SOUNDS = [
  "frustrated-blocked-1",
  "frustrated-blocked-2",
  "frustrated-blocked-3",
  "frustrated-blocked-4",
  "held-up-1",
  "held-up-2",
  "held-up-3",
  "held-up-4",
  "held-up-5",
  "held-up-7",
  "held-up-8",
  "need-intakt-1",
  "need-intakt-2",
  "need-intakt-3",
  "slowed-1",
  "slowed-2",
  "slowed-3",
];
const POLITE_DELAY_LIMIT = 4;
const POLITE_WAITING_SOUNDS = [
  "polite-waiting-1",
  "polite-waiting-2",
  "polite-waiting-3",
  "polite-waiting-4",
  "polite-waiting-5",
  "polite-waiting-6",
  "polite-waiting-7",
  "polite-waiting-8",
  "polite-waiting-9",
  "polite-waiting-10",
  "polite-waiting-11",
];
const WORKER_PUSHED_SOUNDS = [
  "worker-pushed-1",
  "worker-pushed-2",
  "worker-pushed-3",
  "worker-pushed-4",
  "worker-pushed-5",
  "worker-pushed-6",
  "worker-pushed-7",
  "worker-pushed-8",
  "worker-pushed-9",
  "worker-pushed-10",
  "worker-pushed-11",
  "worker-pushed-12",
];
const KIND_PUSH_SOUNDS = [
  "kind-push-1",
  "kind-push-2",
  "kind-push-3",
  "kind-push-4",
  "kind-push-5",
  "kind-push-6",
  "kind-push-7",
];
const WORKER_ROADBLOCKED_SOUNDS = [
  "roadblock-held-up-1",
  "roadblock-held-up-2",
  "roadblock-held-up-3",
  "roadblock-held-up-4",
  "roadblock-held-up-5",
  "roadblock-held-up-6",
  "roadblock-held-up-7",
  "roadblock-held-up-8",
  "roadblock-held-up-9",
  "roadblock-held-up-10",
  "roadblock-held-up-11",
  "roadblock-held-up-12",
  "roadblock-held-up-13",
  "roadblock-held-up-14",
  "roadblock-held-up-15",
  "roadblock-held-up-16",
  "roadblock-held-up-17",
  "roadblock-held-up-18",
];
const POLITE_ROADBLOCK_SOUNDS = [
  "polite-roadblock-1",
  "polite-roadblock-2",
  "polite-roadblock-3",
  "polite-roadblock-4",
  "polite-roadblock-5",
  "polite-roadblock-6",
  "polite-roadblock-7",
  "polite-roadblock-8",
  "polite-roadblock-9",
];
const PROJECT_WIN_SOUNDS = [
  ["result-win-1", "result-win-1a"],
  ["result-win-2"],
  ["result-win-3"],
  ["result-win-4"],
  ["result-win-5", "result-win-5a"],
  ["result-win-6"],
  ["result-win-7"],
];
const PROJECT_LOSE_SOUNDS = [
  ["result-lose-1"],
  ["result-lose-2", "result-lose-2a"],
  ["result-lose-3"],
  ["result-lose-4"],
];
const CAREER_VICTORY_SOUNDS = [
  "victory-takt-legend-1",
  "victory-takt-legend-2",
  "victory-takt-legend-3",
  "victory-takt-legend-4",
  "victory-takt-legend-5",
];
const WORKER_WORK_SOUNDS = {
  cutting: [
    "work-cutting-1",
    "work-cutting-2",
    "work-cutting-3",
    "work-cutting-4",
  ],
  drill: ["work-drill-1", "work-drill-2", "work-drill-3", "work-drill-4"],
  drywall: [
    "work-drywall-1",
    "work-drywall-2",
    "work-drywall-3",
    "work-drywall-4",
  ],
  excavator: [
    "work-excavator-1",
    "work-excavator-2",
    "work-excavator-3",
    "work-excavator-4",
  ],
  foundation: ["work-foundation-1", "work-foundation-2", "work-foundation-3"],
  hammer: ["work-hammer-1", "work-hammer-2"],
  pounding: ["work-pounding-1", "work-pounding-2", "work-pounding-3"],
  putty: ["work-putty-knife-1", "work-putty-knife-2", "work-putty-knife-3"],
  sanding: ["work-sanding-1", "work-sanding-2"],
  saw: ["work-saw-1", "work-saw-2", "work-saw-3"],
  wrench: ["work-wrench-1", "work-wrench-2", "work-wrench-3", "work-wrench-4"],
};
const TRADE_WORK_SOUND_FAMILY = {
  "access-roads": "excavator",
  amenities: "saw",
  "below-grade-utilities": "excavator",
  "blade-install": "wrench",
  "boilermakers-millwrights": "wrench",
  "collection-cabling": "drill",
  containment: "cutting",
  "deep-foundations": "foundation",
  drywall: "drywall",
  earthwork: "excavator",
  electrical: "drill",
  "electrical-instrumentation": "drill",
  elevators: "wrench",
  equipment: "wrench",
  "exterior-finishes": "cutting",
  "ff-e": "putty",
  "final-inspection": "drill",
  "final-punchlist": "drill",
  finishes: "putty",
  fire: "drill",
  "formwork-rebar": "pounding",
  foundation: "foundation",
  foundations: "foundation",
  framing: "hammer",
  "grid-tie": "drill",
  "guestroom-mep": "wrench",
  hvac: "wrench",
  "industrial-commissioning": "drill",
  "industrial-foundations": "foundation",
  inverters: "drill",
  "insulation-cladding": "cutting",
  "interior-finishes": "putty",
  landscaping: "cutting",
  "mep-rough": "wrench",
  "nacelle-install": "wrench",
  painting: "sanding",
  "pile-driving": "pounding",
  "pipe-fitters": "wrench",
  plumbing: "wrench",
  "process-piping": "wrench",
  "raised-floor": "hammer",
  roofing: "saw",
  "site-inspection": "drill",
  skin: "cutting",
  "skin-inspection": "drill",
  "slab-foundation": "foundation",
  "solar-commissioning": "drill",
  "solar-panels": "drill",
  "solar-racking": "wrench",
  "structural-steel": "pounding",
  structure: "pounding",
  "survey-layout": "drill",
  tile: "putty",
  "tower-erection": "hammer",
  underground: "excavator",
  utilities: "wrench",
  "utility-tie": "wrench",
  waterproofing: "putty",
  "wind-commissioning": "drill",
};

let constructionAmbience = null;
let constructionAmbiencePlaying = false;
let diceRollAudio = null;
let diceRollPlaybackKey = null;
let lastWorkerWorkSoundAt = 0;
const workerRoadblockedSoundTimes = new Map();
const lastWorkerFrustrationSoundKeys = new Map();
const lastAudioKeysByCategory = new Map();
let workerFrustrationSoundQueue = [];
let workerFrustrationSoundTimer = null;
let projectResultPlaybackKey = null;
let careerVictoryPlaybackKey = null;

export function registerAudioCallbacks() {
  setRoadblockAppearedCallback(playRoadblockAppearedSound);
  setRoadblockResolvedCallback(playRoadblockResolvedSound);
  setWorkerBlockedCallback(playWorkerBlockedSound);
  setWorkerRoadblockedCallback(playWorkerRoadblockedSound);
  setWorkerPushBlockedCallback(playWorkerPushBlockedSound);
  setWorkerPushRoadblockedCallback(playWorkerPushRoadblockedSound);
  setWorkerPushedCallback(playWorkerPushedSound);
  setWorkerWorkCallback(playWorkerWorkSound);
}

export function syncGameAudio() {
  syncConstructionAmbience();
  syncDiceRollSound();
  syncProjectResultSound();
  syncCareerVictorySound();
}

function constructionAmbienceAudio() {
  if (constructionAmbience) return constructionAmbience;

  constructionAmbience = new Audio(audioAsset("construction-loop"));
  constructionAmbience.loop = true;
  constructionAmbience.preload = "auto";
  constructionAmbience.volume = CONSTRUCTION_AMBIENCE_VOLUME;

  return constructionAmbience;
}

function syncConstructionAmbience() {
  const shouldPlay = state.phase === "running";
  if (!shouldPlay) {
    stopConstructionAmbience();
    return;
  }

  const audio = constructionAmbienceAudio();
  if (constructionAmbiencePlaying && !audio.paused) return;

  const playRequest = audio.play();
  constructionAmbiencePlaying = true;

  if (playRequest?.catch) {
    playRequest.catch(() => {
      constructionAmbiencePlaying = false;
    });
  }
}

function stopConstructionAmbience() {
  if (!constructionAmbience) return;

  constructionAmbience.pause();
  constructionAmbience.currentTime = 0;
  constructionAmbiencePlaying = false;
}

function syncDiceRollDuration(audio) {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

  const durationMs = Math.round(audio.duration * 1000);
  setRollDurationMs(durationMs);
  document.documentElement.style.setProperty("--dice-roll-duration", `${durationMs}ms`);
}

function diceRollSound() {
  if (diceRollAudio) return diceRollAudio;

  diceRollAudio = new Audio(audioAsset("dice-roll"));
  diceRollAudio.preload = "auto";
  diceRollAudio.volume = DICE_ROLL_VOLUME;
  diceRollAudio.addEventListener("loadedmetadata", () => syncDiceRollDuration(diceRollAudio));

  return diceRollAudio;
}

function syncDiceRollSound() {
  if (state.phase !== "running") {
    stopDiceRollSound();
    return;
  }

  if (state.roundPhase !== "rolling") return;

  const playbackKey = `${state.projectRound}:${state.day}`;
  if (diceRollPlaybackKey === playbackKey) return;

  const audio = diceRollSound();
  syncDiceRollDuration(audio);
  audio.currentTime = 0;
  diceRollPlaybackKey = playbackKey;

  const playRequest = audio.play();
  if (playRequest?.catch) {
    playRequest.catch(() => {
      diceRollPlaybackKey = null;
    });
  }
}

function stopDiceRollSound() {
  diceRollPlaybackKey = null;
  if (!diceRollAudio) return;

  diceRollAudio.pause();
  diceRollAudio.currentTime = 0;
}

function randomAudioKey(keys, previousKey = null) {
  if (!keys?.length) return;
  const options =
    keys.length > 1 && previousKey ? keys.filter((key) => key !== previousKey) : keys;
  return options[Math.floor(Math.random() * options.length)];
}

function playAudioKey(key, volume) {
  if (!key) return;
  const audio = new Audio(audioAsset(key));
  audio.volume = volume;

  const playRequest = audio.play();
  if (playRequest?.catch) playRequest.catch(() => {});
}

function playRandomAudio(keys, volume) {
  playAudioKey(randomAudioKey(keys), volume);
}

function playRandomAudioWithoutRepeat(keys, volume, soundCategory) {
  if (!keys?.length) return;

  const previousKey = lastAudioKeysByCategory.get(soundCategory);
  const key = randomAudioKey(keys, previousKey);
  lastAudioKeysByCategory.set(soundCategory, key);
  playAudioKey(key, volume);
}

function usePoliteWorkerSounds() {
  return (
    (state.workerHoldUpCount ?? 0) < POLITE_DELAY_LIMIT &&
    (state.workerRoadblockHoldUpCount ?? 0) < POLITE_DELAY_LIMIT &&
    (state.workerKindPushCount ?? 0) <= KIND_PUSH_LIMIT
  );
}

function queueWorkerFrustrationSound(keys, volume, soundCategory) {
  if (!keys?.length) return;

  workerFrustrationSoundQueue.push({ keys, volume, soundCategory });
  if (!workerFrustrationSoundTimer) playNextWorkerFrustrationSound();
}

function playNextWorkerFrustrationSound() {
  const queuedSound = workerFrustrationSoundQueue.shift();
  if (!queuedSound) {
    workerFrustrationSoundTimer = null;
    return;
  }

  const previousKey = lastWorkerFrustrationSoundKeys.get(queuedSound.soundCategory);
  const key = randomAudioKey(queuedSound.keys, previousKey);
  lastWorkerFrustrationSoundKeys.set(queuedSound.soundCategory, key);
  playAudioKey(key, queuedSound.volume);

  workerFrustrationSoundTimer = window.setTimeout(() => {
    workerFrustrationSoundTimer = null;
    playNextWorkerFrustrationSound();
  }, WORKER_FRUSTRATION_SOUND_SPACING_MS);
}

function playWorkerBlockedSound() {
  const soundPool = usePoliteWorkerSounds()
    ? POLITE_WAITING_SOUNDS
    : WORKER_FRUSTRATION_SOUNDS;
  queueWorkerFrustrationSound(
    soundPool,
    WORKER_FRUSTRATION_VOLUME,
    "worker-blocked",
  );
}

function playWorkerRoadblockedSound(trade) {
  const now = Date.now();
  const tradeKey = trade?.id ?? "unknown";
  const lastPlayedAt = workerRoadblockedSoundTimes.get(tradeKey) ?? 0;
  if (now - lastPlayedAt < WORKER_ROADBLOCKED_SOUND_COOLDOWN_MS) return;
  workerRoadblockedSoundTimes.set(tradeKey, now);

  const soundPool = usePoliteWorkerSounds()
    ? POLITE_ROADBLOCK_SOUNDS
    : WORKER_ROADBLOCKED_SOUNDS;
  queueWorkerFrustrationSound(
    soundPool,
    WORKER_FRUSTRATION_VOLUME,
    "worker-roadblocked",
  );
}

function playWorkerPushedSound() {
  const soundPool = usePoliteWorkerSounds()
    ? KIND_PUSH_SOUNDS
    : WORKER_PUSHED_SOUNDS;
  playRandomAudioWithoutRepeat(
    soundPool,
    WORKER_PUSHED_VOLUME,
    "worker-pushed",
  );
}

function playWorkerPushRoadblockedSound() {
  const soundKey = usePoliteWorkerSounds()
    ? "push-behind-roadblock-happy"
    : "push-behind-roadblock";
  playRandomAudio([soundKey], WORKER_PUSHED_VOLUME);
}

function playWorkerPushBlockedSound() {
  const soundKey = usePoliteWorkerSounds()
    ? "push-behind-trade-happy"
    : "push-behind-trade";
  playRandomAudio([soundKey], WORKER_PUSHED_VOLUME);
}

function playRoadblockAppearedSound() {
  playRandomAudio(["roadblock-appears"], ROADBLOCK_SOUND_VOLUME);
}

function playRoadblockResolvedSound() {
  playRandomAudio(["roadblock-resolves"], ROADBLOCK_SOUND_VOLUME);
}

function syncProjectResultSound() {
  if (state.phase !== "ended" && state.phase !== "gameOver") {
    projectResultPlaybackKey = null;
    return;
  }

  const playbackKey = `${state.projectRound}:${state.phase}:${state.day}:${state.profit}`;
  if (projectResultPlaybackKey === playbackKey) return;
  projectResultPlaybackKey = playbackKey;

  playRandomAudio(projectResultSoundKeys(), PROJECT_RESULT_VOLUME);
}

function syncCareerVictorySound() {
  if (state.phase !== "win") {
    careerVictoryPlaybackKey = null;
    return;
  }

  const playbackKey = `${state.projectRound}:${state.totalProfit}`;
  if (careerVictoryPlaybackKey === playbackKey) return;
  careerVictoryPlaybackKey = playbackKey;

  playRandomAudio(CAREER_VICTORY_SOUNDS, CAREER_VICTORY_VOLUME);
}

function projectResultSoundKeys() {
  const margin = (state.profit / projectBudget()) * 100;
  if (margin < 0) {
    return PROJECT_LOSE_SOUNDS[
      bucketIndex(Math.abs(margin), [5, 15, 30], PROJECT_LOSE_SOUNDS.length)
    ];
  }

  return PROJECT_WIN_SOUNDS[
    bucketIndex(margin, [10, 20, 30, 40, 55, 70], PROJECT_WIN_SOUNDS.length)
  ];
}

function bucketIndex(value, thresholds, bucketCount) {
  const index = thresholds.findIndex((threshold) => value < threshold);
  return index === -1 ? bucketCount - 1 : index;
}

function playWorkerWorkSound(trade) {
  if (state.phase !== "running" || state.roundPhase === "rolling") return;

  const now = Date.now();
  if (now - lastWorkerWorkSoundAt < WORKER_WORK_COOLDOWN_MS) return;
  lastWorkerWorkSoundAt = now;

  const familyKey =
    TRADE_WORK_SOUND_FAMILY[trade?.key] ??
    TRADE_WORK_SOUND_FAMILY[trade?.visualKey] ??
    soundFamilyFromTradeName(trade?.name);
  const soundKeys = WORKER_WORK_SOUNDS[familyKey] ?? WORKER_WORK_SOUNDS.hammer;
  playRandomAudio(soundKeys, WORKER_WORK_VOLUME);
}

function soundFamilyFromTradeName(name = "") {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes("excavat") || normalizedName.includes("earth")) {
    return "excavator";
  }
  if (normalizedName.includes("foundation") || normalizedName.includes("concrete")) {
    return "foundation";
  }
  if (normalizedName.includes("steel") || normalizedName.includes("structure")) {
    return "pounding";
  }
  if (normalizedName.includes("drywall")) return "drywall";
  if (normalizedName.includes("paint")) return "sanding";
  if (normalizedName.includes("finish")) return "putty";
  if (normalizedName.includes("roof") || normalizedName.includes("skin")) return "saw";
  if (
    normalizedName.includes("pipe") ||
    normalizedName.includes("plumb") ||
    normalizedName.includes("hvac")
  ) {
    return "wrench";
  }
  if (normalizedName.includes("electric") || normalizedName.includes("commission")) {
    return "drill";
  }
  return "hammer";
}
