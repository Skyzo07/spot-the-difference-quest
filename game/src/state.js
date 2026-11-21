// Twin Worlds — the round state: score, timer, combo, hints, best score.
// Pure game logic, no drawing and no DOM: render.js paints what this holds.
import {
  BEST_KEY,
  COMBO_MAX,
  COMBO_STEP,
  FIND_BASE_POINTS,
  HINTS_PER_ROUND,
  HINT_COST,
  MISS_POINTS,
  MISS_TIME_SECONDS,
} from './config.js';

export function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage off (private window): the best score lasts this visit only.
  }
}

export function createRoundState(scene) {
  return {
    scene,
    found: new Set(),
    misses: 0,
    combo: 0,
    bestCombo: 0,
    score: 0,
    hintsLeft: HINTS_PER_ROUND,
    hintIndex: -1,
    hintUntil: 0,
    timeLeft: scene.timeLimit,
    timeUp: false,
    complete: false,
    shakeUntil: 0,
    message: '',
    messageUntil: 0,
  };
}

// Points for a find grow with the combo: consecutive finds without a miss.
export function comboMultiplier(combo) {
  return Math.min(COMBO_MAX, 1 + COMBO_STEP * combo);
}

export function applyFind(round, index) {
  round.found.add(index);
  const points = Math.round(FIND_BASE_POINTS * comboMultiplier(round.combo));
  round.score += points;
  round.combo += 1;
  round.bestCombo = Math.max(round.bestCombo, round.combo);
  if (round.found.size >= round.scene.diffCount) round.complete = true;
  return points;
}

export function applyMiss(round, now) {
  round.misses += 1;
  round.combo = 0;
  round.score = Math.max(0, round.score - MISS_POINTS);
  round.timeLeft = Math.max(0, round.timeLeft - MISS_TIME_SECONDS);
  round.shakeUntil = now + 0.35;
  if (round.timeLeft <= 0) round.timeUp = true;
}

export function useHint(round, now) {
  if (round.hintsLeft <= 0 || round.complete) return -1;
  const unfound = [];
  for (let i = 0; i < round.scene.diffCount; i++) {
    if (!round.found.has(i)) unfound.push(i);
  }
  if (unfound.length === 0) return -1;
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  round.hintsLeft -= 1;
  round.score = Math.max(0, round.score - HINT_COST);
  round.hintIndex = pick;
  round.hintUntil = now + 2;
  return pick;
}

export function tickTimer(round, dt) {
  if (round.complete || round.timeUp) return;
  round.timeLeft -= dt;
  if (round.timeLeft <= 0) {
    round.timeLeft = 0;
    round.timeUp = true;
  }
}
