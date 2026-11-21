// Twin Worlds — mouse and keyboard input.
// Mouse: click either panel to mark a difference. Keyboard: arrow keys move
// a crosshair across the whole canvas, Enter/Space marks where it sits,
// H hints, P pauses, M mutes. Buttons are canvas regions, not DOM, so the
// game stays one static page with no extra assets.
import { CANVAS_H, CANVAS_W, PANEL_LEFT, PANEL_RIGHT } from './config.js';
import { findDifferenceAt } from './differences.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_PAUSE = 'pause';
export const ACTION_HINT = 'hint';
export const ACTION_MUTE = 'mute';
export const ACTION_NEXT = 'next';
export const ACTION_RETRY = 'retry';
export const ACTION_START = 'start';
export const ACTION_SCENE = 'scene';

export function createInput(canvas, handlers) {
  const state = {
    mouse: { x: CANVAS_W / 2, y: CANVAS_H / 2 },
    // Crosshair starts in the middle of the left panel.
    crosshair: { x: PANEL_LEFT.x + 300, y: PANEL_LEFT.y + 270 },
    keyboardUsed: false,
  };

  function canvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }

  // Which panel (if any) holds the point, and the scene coordinate inside it.
  function panelHit(px, py) {
    for (const [panel, side] of [
      [PANEL_LEFT, 'A'],
      [PANEL_RIGHT, 'B'],
    ]) {
      if (px >= panel.x && px <= panel.x + panel.w && py >= panel.y && py <= panel.y + panel.h) {
        return { side, sx: px - panel.x, sy: py - panel.y };
      }
    }
    return null;
  }

  function markAt(px, py) {
    const hit = panelHit(px, py);
    if (hit) handlers.onMark(hit.sx, hit.sy);
  }

  canvas.addEventListener('click', (event) => {
    const p = canvasPoint(event.clientX, event.clientY);
    state.mouse = p;
    const button = handlers.buttonAt ? handlers.buttonAt(p.x, p.y) : null;
    if (button) {
      handlers.onButton(button);
      return;
    }
    markAt(p.x, p.y);
  });

  canvas.addEventListener('mousemove', (event) => {
    state.mouse = canvasPoint(event.clientX, event.clientY);
  });

  window.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 24 : 8;
    let used = true;
    if (event.key === 'ArrowLeft') state.crosshair.x = Math.max(0, state.crosshair.x - step);
    else if (event.key === 'ArrowRight') state.crosshair.x = Math.min(CANVAS_W, state.crosshair.x + step);
    else if (event.key === 'ArrowUp') state.crosshair.y = Math.max(0, state.crosshair.y - step);
    else if (event.key === 'ArrowDown') state.crosshair.y = Math.min(CANVAS_H, state.crosshair.y + step);
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const button = handlers.buttonAt
        ? handlers.buttonAt(state.crosshair.x, state.crosshair.y)
        : null;
      if (button) handlers.onButton(button);
      else markAt(state.crosshair.x, state.crosshair.y);
    } else if (event.key === 'h' || event.key === 'H') handlers.onButton(ACTION_HINT);
    else if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') handlers.onButton(ACTION_PAUSE);
    else if (event.key === 'm' || event.key === 'M') handlers.onButton(ACTION_MUTE);
    else if (event.key === 'n' || event.key === 'N') handlers.onButton(ACTION_NEXT);
    else if (event.key === 'r' || event.key === 'R') handlers.onButton(ACTION_RETRY);
    else if (event.key >= '1' && event.key <= '4') handlers.onButton(ACTION_SCENE + event.key);
    else used = false;
    if (used) state.keyboardUsed = true;
  });

  return state;
}

// Shared by main.js: resolve a mark into a found difference or a miss.
export function resolveMark(sceneId, sx, sy, foundSet) {
  return findDifferenceAt(sceneId, sx, sy, foundSet);
}
