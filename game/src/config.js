// Twin Worlds: Spot the Difference Quest — scene and difficulty config.
// One entry per scene: the name the HUD shows, the round timer, and the
// number of differences that scene hides. Difficulty rises scene by scene.
export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// The two picture panels, in canvas pixels. Both panels are the same size so
// a difference at scene coordinate (x, y) sits at the same spot in each one.
export const PANEL_W = 600;
export const PANEL_H = 540;
export const PANEL_LEFT = { x: 24, y: 110, w: PANEL_W, h: PANEL_H };
export const PANEL_RIGHT = { x: 656, y: 110, w: PANEL_W, h: PANEL_H };

export const SCENES = [
  {
    id: 'garden',
    name: 'Sunny Garden',
    tagline: 'A bright morning among the flowers',
    timeLimit: 90,
    diffCount: 7,
    sky: '#8fd3ff',
  },
  {
    id: 'kitchen',
    name: 'Cozy Kitchen',
    tagline: 'Something is off by the stove…',
    timeLimit: 75,
    diffCount: 8,
    sky: '#ffe9c4',
  },
  {
    id: 'station',
    name: 'Space Station',
    tagline: 'Orbit check: ten things changed',
    timeLimit: 60,
    diffCount: 10,
    sky: '#0b1030',
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    tagline: 'Night falls — look closer, the differences hide deeper',
    timeLimit: 60,
    diffCount: 10,
    sky: '#0d1f33',
  },
];

export const BEST_KEY = 'twin-worlds-best-score';
export const HINTS_PER_ROUND = 3;
export const HINT_COST = 50;
export const FIND_BASE_POINTS = 100;
export const MISS_POINTS = 25;
export const MISS_TIME_SECONDS = 3;
export const COMBO_STEP = 0.25;
export const COMBO_MAX = 3;

// Stars for a finished round: time left and accuracy both count.
export function starsForRound(timeLeft, timeLimit, found, total, misses) {
  const timeRatio = timeLeft / timeLimit;
  const accuracy = found / Math.max(1, found + misses);
  if (timeRatio >= 0.45 && accuracy >= 0.9) return 3;
  if (timeRatio >= 0.25 && accuracy >= 0.75) return 2;
  return 1;
}
