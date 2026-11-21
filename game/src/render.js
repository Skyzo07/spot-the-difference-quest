// Twin Worlds — the renderer: panels, markers, particles, HUD and screens.
// Everything is drawn on one canvas; the game state lives in main.js/state.js
// and this module only paints what it holds.
import {
  CANVAS_H,
  CANVAS_W,
  PANEL_H,
  PANEL_LEFT,
  PANEL_RIGHT,
} from './config.js';
import { DIFFS } from './differences.js';
import { drawScene } from './scenes.js';
import { comboMultiplier } from './state.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND_END = 'roundEnd';
export const SCREEN_TIME_UP = 'timeUp';
export const SCREEN_FINAL = 'final';

// Clickable regions, shared by the renderer and main.js's buttonAt.
export function getButtons(screen) {
  if (screen === SCREEN_TITLE) {
    return [0, 1, 2, 3].map((i) => ({
      id: 'scene' + (i + 1),
      x: 24 + i * 314,
      y: 420,
      w: 290,
      h: 190,
    }));
  }
  if (screen === SCREEN_PLAY) {
    return [
      { id: 'hint', x: 24, y: 672, w: 170, h: 52 },
      { id: 'pause', x: 210, y: 672, w: 170, h: 52 },
      { id: 'mute', x: 396, y: 672, w: 170, h: 52 },
    ];
  }
  if (screen === SCREEN_PAUSED) {
    return [
      { id: 'resume', x: 520, y: 400, w: 240, h: 52 },
      { id: 'restart', x: 520, y: 470, w: 240, h: 52 },
      { id: 'title', x: 520, y: 540, w: 240, h: 52 },
    ];
  }
  if (screen === SCREEN_ROUND_END) {
    return [
      { id: 'next', x: 500, y: 590, w: 280, h: 52 },
      { id: 'retry', x: 500, y: 520, w: 280, h: 44 },
    ];
  }
  if (screen === SCREEN_TIME_UP) {
    return [{ id: 'retry', x: 540, y: 560, w: 200, h: 52 }];
  }
  if (screen === SCREEN_FINAL) {
    return [{ id: 'again', x: 540, y: 600, w: 200, h: 52 }];
  }
  return [];
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const missMarks = [];

  function burst(cx, cy, color) {
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 40,
        life: 0.7,
        max: 0.7,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  function addMissMark(x, y) {
    missMarks.push({ x, y, until: performance.now() / 1000 + 0.6 });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawButton(b, label, enabled) {
    ctx.fillStyle = enabled ? '#ffd93b' : '#5a6478';
    roundRect(b.x, b.y, b.w, b.h, 12);
    ctx.fill();
    ctx.fillStyle = enabled ? '#22223b' : '#cbd5e1';
    ctx.font = 'bold 19px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2 + 1);
  }

  function drawFoundRing(px, py, r, now) {
    const pulse = 1 + 0.08 * Math.sin(now * 5);
    ctx.strokeStyle = '#06d6a0';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(px, py, r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#06d6a0';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px - r * 0.45, py);
    ctx.lineTo(px - r * 0.1, py + r * 0.35);
    ctx.lineTo(px + r * 0.5, py - r * 0.35);
    ctx.stroke();
  }

  function drawPanel(game, panel, variant, now) {
    const round = game.round;
    ctx.save();
    if (now < round.shakeUntil) {
      ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    }
    ctx.translate(panel.x, panel.y);
    drawScene(ctx, round.scene.id, variant);
    // Found markers on both panels, at the same scene spots.
    const list = DIFFS[round.scene.id];
    for (const i of round.found) {
      const d = list[i];
      drawFoundRing(d.x, d.y, d.r + 4, now);
    }
    // Hint pulse: a golden ring breathing over one unfound difference.
    if (round.hintIndex >= 0 && now < round.hintUntil) {
      const d = list[round.hintIndex];
      const pulse = 0.6 + 0.4 * Math.sin(now * 10);
      ctx.strokeStyle = `rgba(255, 217, 59, ${0.5 + pulse * 0.5})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r + 10 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    // Panel frame + label.
    ctx.strokeStyle = '#f1faee';
    ctx.lineWidth = 4;
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
    ctx.fillStyle = 'rgba(10, 10, 30, 0.75)';
    roundRect(panel.x + 10, panel.y + 10, variant === 'A' ? 150 : 210, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(variant === 'A' ? '◀ ORIGINAL' : 'FIND THE CHANGES ▶', panel.x + 22, panel.y + 26);
  }

  function drawHud(game, now) {
    const round = game.round;
    // Header.
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('🔍 TWIN WORLDS', 24, 44);
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#ffd93b';
    ctx.fillText(`${round.scene.name} — ${round.scene.tagline}`, 24, 70);
    // Found counter, big and centred.
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.fillText(
      `Found ${round.found.size}/${round.scene.diffCount}`,
      CANVAS_W / 2,
      48,
    );
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#cfe8ff';
    ctx.fillText(
      round.combo > 1
        ? `Combo x${comboMultiplier(round.combo - 1).toFixed(2)}  •  ${round.combo} in a row`
        : 'Find them all before time runs out!',
      CANVAS_W / 2,
      72,
    );
    // Score, right.
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(`Score ${game.totalScore + round.score}`, 1256, 44);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#cfe8ff';
    ctx.fillText(`Best ${game.best}   •   Round ${game.sceneIndex + 1}/4`, 1256, 70);
    // Timer bar — the time pressure you can feel.
    const ratio = Math.max(0, round.timeLeft / round.scene.timeLimit);
    const barY = 92;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    roundRect(24, barY, 1232, 12, 6);
    ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? '#06d6a0' : ratio > 0.25 ? '#ffd93b' : '#ef476f';
    if (ratio > 0) {
      roundRect(24, barY, 1232 * ratio, 12, 6);
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(round.timeLeft)}s`, 1256, barY - 2);
    if (round.timeLeft <= 10 && round.timeLeft > 0 && game.screen === 'play') {
      ctx.fillStyle = `rgba(239, 71, 111, ${0.5 + 0.5 * Math.sin(now * 8)})`;
      ctx.textAlign = 'left';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText('⏰ Hurry!', 24, barY - 2);
    }
  }

  function drawBottomBar(game) {
    const round = game.round;
    const [hintBtn, pauseBtn, muteBtn] = getButtons('play');
    drawButton(hintBtn, `💡 Hint (${round.hintsLeft})  −50`, round.hintsLeft > 0);
    drawButton(pauseBtn, '⏸ Pause (P)', true);
    drawButton(muteBtn, game.audio.muted ? '🔇 Muted (M)' : '🔊 Sound (M)', true);
    ctx.fillStyle = '#cfe8ff';
    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'Mouse: click a difference  •  Keyboard: arrows move the crosshair, Enter marks it',
      590,
      690,
    );
    ctx.fillText(
      'H hint  •  P pause  •  M sound  •  Wrong click: −25 pts and −3s',
      590,
      714,
    );
    if (round.message && now0(game) < round.messageUntil) {
      ctx.fillStyle = '#ffd93b';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(round.message, CANVAS_W / 2, 760);
    }
  }

  function now0(game) {
    return game.now;
  }

  function drawTitle(game, now) {
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bg.addColorStop(0, '#1b2a6b');
    bg.addColorStop(1, '#0b1030');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd93b';
    ctx.font = 'bold 64px system-ui, sans-serif';
    ctx.fillText('🔍 TWIN WORLDS', CANVAS_W / 2, 110);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillText('Spot the Difference Quest', CANVAS_W / 2, 158);
    ctx.fillStyle = '#cfe8ff';
    ctx.font = '19px system-ui, sans-serif';
    ctx.fillText(
      'Two pictures, side by side — almost the same. Find every difference before the clock runs out.',
      CANVAS_W / 2,
      196,
    );
    ctx.fillText(
      'Click a difference (or move the crosshair with the arrow keys and press Enter). 3 hints per round. Combos multiply your points.',
      CANVAS_W / 2,
      226,
    );
    ctx.fillStyle = '#ffd93b';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('Choose your first world — click a card to play', CANVAS_W / 2, 300);
    // Scene cards with a live miniature of each scene.
    game.sceneList.forEach((scene, i) => {
      const card = getButtons('title')[i];
      ctx.save();
      ctx.translate(card.x, card.y);
      ctx.fillStyle = '#ffffff';
      roundRect(0, 0, card.w, card.h, 14);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      roundRect(8, 8, card.w - 16, 118, 10);
      ctx.clip();
      ctx.scale((card.w - 16) / 600, 118 / 540);
      drawScene(ctx, scene.id, 'A');
      ctx.restore();
      ctx.fillStyle = '#22223b';
      ctx.font = 'bold 19px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}. ${scene.name}`, card.w / 2, 152);
      ctx.fillStyle = '#5a6478';
      ctx.font = '15px system-ui, sans-serif';
      ctx.fillText(
        `${scene.diffCount} differences  •  ${scene.timeLimit}s`,
        card.w / 2,
        176,
      );
      ctx.restore();
    });
    ctx.fillStyle = '#8fa3c8';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText(
      `Best score ${game.best}  •  4 worlds, ${game.sceneList.reduce((a, s) => a + s.diffCount, 0)} differences to find  •  Original art, drawn in code`,
      CANVAS_W / 2,
      660,
    );
    ctx.fillText('Keys: 1–4 pick a world  •  H hint  •  P pause  •  M sound', CANVAS_W / 2, 690);
  }

  function overlayPanel(x, y, w, h) {
    ctx.fillStyle = 'rgba(5, 8, 25, 0.72)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#f8fafc';
    roundRect(x, y, w, h, 20);
    ctx.fill();
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 4;
    roundRect(x, y, w, h, 20);
    ctx.stroke();
  }

  function drawStars(cx, y, stars) {
    ctx.font = '52px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < stars ? '#ffb703' : '#cbd5e1';
      ctx.fillText('★', cx + (i - 1) * 64, y);
    }
  }

  function drawRoundEnd(game) {
    const round = game.round;
    overlayPanel(390, 120, 500, 540);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#22223b';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.fillText(`${round.scene.name} complete!`, 640, 180);
    drawStars(640, 260, game.lastStars);
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillStyle = '#334155';
    const accuracy = Math.round(
      (round.found.size / Math.max(1, round.found.size + round.misses)) * 100,
    );
    ctx.fillText(`Found ${round.found.size}/${round.scene.diffCount}  •  Accuracy ${accuracy}%`, 640, 310);
    ctx.fillText(`Best combo ${round.bestCombo} in a row  •  Misses ${round.misses}`, 640, 342);
    ctx.fillText(`Time left ${Math.ceil(round.timeLeft)}s`, 640, 374);
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillStyle = '#22223b';
    ctx.fillText(`Round score ${round.score}`, 640, 428);
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Total score ${game.totalScore + round.score}`, 640, 462);
    const [nextBtn, retryBtn] = getButtons('roundEnd');
    drawButton(nextBtn, game.sceneIndex + 1 < 4 ? 'Next world ▶ (N)' : 'See results ▶ (N)', true);
    drawButton(retryBtn, '↻ Replay this world (R)', true);
  }

  function drawTimeUp(game) {
    const round = game.round;
    overlayPanel(390, 170, 500, 460);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e63946';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.fillText("⏰ Time's up!", 640, 240);
    ctx.fillStyle = '#334155';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(
      `You found ${round.found.size} of ${round.scene.diffCount} differences in ${round.scene.name}.`,
      640,
      300,
    );
    ctx.fillText('The unfound ones are still hiding in the pictures.', 640, 332);
    ctx.fillText(`Score kept so far: ${game.totalScore}`, 640, 380);
    const [retryBtn] = getButtons('timeUp');
    drawButton(retryBtn, '↻ Try again (R)', true);
  }

  function drawPaused() {
    overlayPanel(390, 170, 500, 460);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#22223b';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.fillText('Paused', 640, 240);
    ctx.fillStyle = '#334155';
    ctx.font = '19px system-ui, sans-serif';
    ctx.fillText('Take a breath. The differences will wait.', 640, 290);
    const [resumeBtn, restartBtn, titleBtn] = getButtons('paused');
    drawButton(resumeBtn, '▶ Resume (P)', true);
    drawButton(restartBtn, '↻ Restart round (R)', true);
    drawButton(titleBtn, '⌂ Back to title', true);
  }

  function drawFinal(game) {
    overlayPanel(340, 100, 600, 580);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#22223b';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.fillText('🏆 Quest Complete!', 640, 170);
    drawStars(640, 250, Math.round(game.totalStars / 4));
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(
      `${game.totalFound} differences found across 4 worlds`,
      640,
      310,
    );
    ctx.fillText(`Total stars ${game.totalStars} / 12`, 640, 344);
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillStyle = '#22223b';
    ctx.fillText(`Total score ${game.totalScore}`, 640, 410);
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillStyle = game.totalScore >= game.best ? '#06a04a' : '#334155';
    ctx.fillText(
      game.totalScore >= game.best && game.totalScore > 0
        ? '🎉 New best score!'
        : `Best score ${game.best}`,
      640,
      452,
    );
    ctx.fillStyle = '#334155';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('Thanks for playing Twin Worlds. Every world was drawn in code,', 640, 500);
    ctx.fillText('just for this game — no two playthroughs hide the same hunt.', 640, 526);
    const [againBtn] = getButtons('final');
    drawButton(againBtn, '↻ Play again (R)', true);
  }

  function draw(game, now) {
    game.now = now;
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bg.addColorStop(0, '#1b2a6b');
    bg.addColorStop(1, '#0b1030');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (game.screen === SCREEN_TITLE) {
      drawTitle(game, now);
      return;
    }
    if (game.screen === SCREEN_FINAL) {
      drawFinal(game);
      return;
    }
    // Play, paused, round-end and time-up all show the round underneath.
    drawHud(game, now);
    drawPanel(game, PANEL_LEFT, 'A', now);
    drawPanel(game, PANEL_RIGHT, 'B', now);
    drawBottomBar(game);
    // Particles and miss marks, in canvas space.
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= 1 / 60;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.x += p.vx / 60;
      p.y += p.vy / 60;
      p.vy += 260 / 60;
      ctx.globalAlpha = p.life / p.max;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = missMarks.length - 1; i >= 0; i--) {
      const m = missMarks[i];
      const left = m.until - now;
      if (left <= 0) {
        missMarks.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, left / 0.6);
      ctx.strokeStyle = '#ef476f';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x - 14, m.y - 14);
      ctx.lineTo(m.x + 14, m.y + 14);
      ctx.moveTo(m.x + 14, m.y - 14);
      ctx.lineTo(m.x - 14, m.y + 14);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Keyboard crosshair.
    if (game.input.keyboardUsed && game.screen === SCREEN_PLAY) {
      const c = game.input.crosshair;
      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c.x - 24, c.y);
      ctx.lineTo(c.x + 24, c.y);
      ctx.moveTo(c.x, c.y - 24);
      ctx.lineTo(c.x, c.y + 24);
      ctx.stroke();
    }
    if (game.screen === SCREEN_PAUSED) drawPaused();
    else if (game.screen === SCREEN_ROUND_END) drawRoundEnd(game);
    else if (game.screen === SCREEN_TIME_UP) drawTimeUp(game);
  }

  return { draw, burst, addMissMark };
}
