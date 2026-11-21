// Twin Worlds: Spot the Difference Quest — bootstrap and state machine.
// The game moves between six screens: title, play, paused, roundEnd, timeUp
// and final. Rounds run scene by scene; finishing all four shows the total.
//
// ?shot=start stages the title screen, ?shot=play stages a round in progress
// (?shot=play&scene=1&found=0,2,4), ?shot=hard stages the Space Station round
// and ?shot=end stages a finished round — all with the timer paused, so a
// screenshot is deterministic. Screenshots set window.__shotReady.
import { CANVAS_H, CANVAS_W, PANEL_LEFT, PANEL_RIGHT, SCENES, starsForRound } from './config.js';
import { DIFFS } from './differences.js';
import { createAudio } from './audio.js';
import { createInput, resolveMark } from './input.js';
import {
  SCREEN_FINAL,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_ROUND_END,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  createRenderer,
  getButtons,
} from './render.js';
import {
  applyFind,
  applyMiss,
  createRoundState,
  readBest,
  saveBest,
  tickTimer,
  useHint,
} from './state.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const shotScene = Math.max(
  1,
  Math.min(4, Number.parseInt(params.get('scene') ?? '1', 10) || 1),
);
const shotFound = (params.get('found') ?? '')
  .split(',')
  .map((s) => Number.parseInt(s, 10))
  .filter((n) => Number.isInteger(n));

const canvas = document.getElementById('game');
const status = document.getElementById('status');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const audio = createAudio();
const renderer = createRenderer(canvas);

const game = {
  screen: SCREEN_TITLE,
  sceneList: SCENES,
  sceneIndex: 0,
  round: createRoundState(SCENES[0]),
  totalScore: 0,
  totalStars: 0,
  totalFound: 0,
  lastStars: 0,
  best: readBest(),
  audio,
  input: null,
  now: 0,
};

// Debug/testing handle: lets an automated playtest read the live state
// (screen, found set, score, timer) without touching the DOM.
window.__twinWorlds = game;

function setStatus(text) {
  status.textContent = text;
}

function startRound(index) {
  game.sceneIndex = index;
  game.round = createRoundState(SCENES[index]);
  game.screen = SCREEN_PLAY;
  setStatus(
    `${SCENES[index].name}: find ${SCENES[index].diffCount} differences in ${SCENES[index].timeLimit} seconds.`,
  );
}

function finishRound() {
  const round = game.round;
  game.lastStars = starsForRound(
    round.timeLeft,
    round.scene.timeLimit,
    round.found.size,
    round.scene.diffCount,
    round.misses,
  );
  game.totalScore += round.score;
  game.totalStars += game.lastStars;
  game.totalFound += round.found.size;
  game.screen = SCREEN_ROUND_END;
  audio.playWin();
  setStatus(
    `${round.scene.name} complete: ${game.lastStars} stars, ${round.score} points.`,
  );
}

function finishGame() {
  game.screen = SCREEN_FINAL;
  if (game.totalScore > game.best) {
    game.best = game.totalScore;
    saveBest(game.best);
  }
  setStatus(`Quest complete: ${game.totalScore} points, ${game.totalStars} stars.`);
}

function markAt(sx, sy) {
  if (game.screen !== SCREEN_PLAY) return;
  const round = game.round;
  const now = game.now;
  // Clicking a spot already marked is not a miss — it is already found.
  for (const i of round.found) {
    const d = DIFFS[round.scene.id][i];
    const dx = sx - d.x;
    const dy = sy - d.y;
    if (dx * dx + dy * dy <= (d.r + 4) * (d.r + 4)) return;
  }
  const index = resolveMark(round.scene.id, sx, sy, round.found);
  if (index === null) {
    applyMiss(round, now);
    audio.playMiss();
    // The miss mark is drawn where the player clicked; the capture-phase
    // listener below tracks the canvas position of each click.
    renderer.addMissMark(game.lastClick.x, game.lastClick.y);
    round.message = 'Not a difference — −25 pts, −3s';
    round.messageUntil = now + 1.6;
    setStatus('That is not a difference. Minus 25 points and 3 seconds.');
    return;
  }
  const points = applyFind(round, index);
  audio.playFind();
  const d = DIFFS[round.scene.id][index];
  // A burst on both panels, at the same scene spot.
  renderer.burst(PANEL_LEFT.x + d.x, PANEL_LEFT.y + d.y, '#06d6a0');
  renderer.burst(PANEL_RIGHT.x + d.x, PANEL_RIGHT.y + d.y, '#ffd93b');
  round.message = `Found it! +${points} — ${DIFFS[round.scene.id][index].label}`;
  round.messageUntil = now + 1.8;
  setStatus(
    `Found ${round.found.size} of ${round.scene.diffCount}: ${DIFFS[round.scene.id][index].label}.`,
  );
  if (round.complete) finishRound();
}

function onButton(id) {
  const now = game.now;
  if (id === 'mute') {
    audio.toggleMute();
    return;
  }
  if (id.startsWith('scene')) {
    const index = Number.parseInt(id.slice(5), 10) - 1;
    if (game.screen === SCREEN_TITLE && index >= 0 && index < 4) {
      audio.playClick();
      startRound(index);
    }
    return;
  }
  if (id === 'hint') {
    if (game.screen !== SCREEN_PLAY) return;
    const pick = useHint(game.round, now);
    if (pick >= 0) {
      audio.playHint();
      game.round.message = 'Hint: look at the golden ring — −50 pts';
      game.round.messageUntil = now + 1.8;
    }
    return;
  }
  if (id === 'pause') {
    if (game.screen === SCREEN_PLAY) {
      game.screen = SCREEN_PAUSED;
      audio.playClick();
    } else if (game.screen === SCREEN_PAUSED) {
      game.screen = SCREEN_PLAY;
      audio.playClick();
    }
    return;
  }
  if (id === 'resume') {
    game.screen = SCREEN_PLAY;
    audio.playClick();
    return;
  }
  if (id === 'restart') {
    audio.playClick();
    startRound(game.sceneIndex);
    return;
  }
  if (id === 'title') {
    game.screen = SCREEN_TITLE;
    audio.playClick();
    return;
  }
  if (id === 'retry') {
    audio.playClick();
    startRound(game.sceneIndex);
    return;
  }
  if (id === 'next') {
    audio.playClick();
    if (game.sceneIndex + 1 < 4) startRound(game.sceneIndex + 1);
    else finishGame();
    return;
  }
  if (id === 'again') {
    audio.playClick();
    game.totalScore = 0;
    game.totalStars = 0;
    game.totalFound = 0;
    startRound(0);
  }
}

function buttonAt(x, y) {
  const buttons = getButtons(game.screen);
  for (const b of buttons) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
  }
  return null;
}

game.lastClick = { x: CANVAS_W / 2, y: CANVAS_H / 2 };

// Capture-phase: runs before input.js's click handler, so markAt() below
// already knows the canvas position of this click (for miss marks).
canvas.addEventListener(
  'click',
  (event) => {
    const rect = canvas.getBoundingClientRect();
    game.lastClick = {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  },
  true,
);

game.input = createInput(canvas, {
  onMark(sx, sy) {
    markAt(sx, sy);
  },
  onButton,
  buttonAt,
});

// ---- Screenshot staging (?shot=...) --------------------------------------
// All shot modes freeze the timer so the frame is deterministic.
function stageShot() {
  if (shot === 'start') {
    game.screen = SCREEN_TITLE;
  } else if (shot === 'play' || shot === 'hard') {
    const index = shot === 'hard' ? 2 : shotScene - 1;
    startRound(index);
    const round = game.round;
    const preset = shot === 'hard' ? [0, 3, 6] : shotFound;
    for (const i of preset) {
      if (i >= 0 && i < round.scene.diffCount) {
        round.found.add(i);
        round.score += 100;
        round.combo += 1;
      }
    }
    round.timeLeft = shot === 'hard' ? 41 : 47;
    round.message = '';
  } else if (shot === 'end') {
    startRound(0);
    const round = game.round;
    for (let i = 0; i < round.scene.diffCount; i++) round.found.add(i);
    round.score = 840;
    round.combo = 7;
    round.bestCombo = 7;
    round.timeLeft = 52;
    round.complete = true;
    game.lastStars = 3;
    game.totalScore = 0;
    game.screen = SCREEN_ROUND_END;
  }
}

if (shot) {
  stageShot();
  // Paint once now, then keep painting: the loop below still runs, but the
  // timer is frozen in shot mode (see the loop's shot check).
  renderer.draw(game, performance.now() / 1000);
  window.__shotReady = true;
}

// ---- Main loop ------------------------------------------------------------
let last = performance.now();
let lastTickSecond = -1;

function frame(nowMs) {
  const now = nowMs / 1000;
  const dt = Math.min(0.25, (nowMs - last) / 1000);
  last = nowMs;
  if (game.screen === SCREEN_PLAY && !shot) {
    tickTimer(game.round, dt);
    const whole = Math.ceil(game.round.timeLeft);
    if (game.round.timeLeft <= 10 && whole !== lastTickSecond) {
      lastTickSecond = whole;
      audio.playTick();
    }
    if (game.round.timeUp) {
      game.screen = SCREEN_TIME_UP;
      audio.playLose();
      setStatus(
        `Time's up in ${game.round.scene.name}: ${game.round.found.size} of ${game.round.scene.diffCount} found.`,
      );
    }
  }
  renderer.draw(game, now);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
