// Twin Worlds — the scene painters.
// Each scene is ONE drawing function with a variant parameter: variant 'A'
// paints the left panel, 'B' the right panel. The base picture is identical
// in both; the difference layer then draws each difference only on its own
// side (missing on A, extra on B, recoloured or changed between the two), so
// the two panels differ exactly at the marked spots, nowhere else.
// All art is drawn in code with canvas primitives — no images, no assets.
import { PANEL_W, PANEL_H } from './config.js';

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}
function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}
function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
function flower(ctx, x, y, petal, centre) {
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7, petal);
  }
  circle(ctx, x, y, 6, centre);
}

// ---- Scene 1: Sunny Garden ---------------------------------------------
function drawGarden(ctx, v) {
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#7ec8ff');
  sky.addColorStop(1, '#cfeeff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 320);
  // Sun (diff 0: recolour + rays only on A).
  circle(ctx, 96, 92, 34, v === 'A' ? '#ffd93b' : '#ff9f2e');
  if (v === 'A') {
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(96 + Math.cos(a) * 42, 92 + Math.sin(a) * 42);
      ctx.lineTo(96 + Math.cos(a) * 56, 92 + Math.sin(a) * 56);
      ctx.stroke();
    }
  }
  // Clouds: one at (452,78) exists only on A (diff 1).
  ellipse(ctx, 250, 70, 46, 18, '#ffffff');
  ellipse(ctx, 280, 62, 34, 16, '#ffffff');
  if (v === 'A') {
    ellipse(ctx, 452, 78, 44, 17, '#ffffff');
    ellipse(ctx, 478, 70, 30, 14, '#ffffff');
  }
  // Hills, grass, path.
  ellipse(ctx, 150, 420, 320, 130, '#7ec850');
  ellipse(ctx, 480, 430, 300, 120, '#6cb844');
  rect(ctx, 0, 330, PANEL_W, 210, '#8ed35e');
  poly(ctx, [[270, 540], [330, 540], [315, 330], [285, 330]], '#e8d29a');
  // Fence.
  ctx.fillStyle = '#d9a066';
  for (let x = 20; x < 600; x += 52) ctx.fillRect(x, 300, 10, 44);
  ctx.fillRect(0, 306, PANEL_W, 7);
  ctx.fillRect(0, 326, PANEL_W, 7);
  // Tree with apples (diff 4: apples only on A).
  rect(ctx, 500, 240, 22, 110, '#8a5a2b');
  circle(ctx, 512, 210, 62, '#3f9e3f');
  circle(ctx, 470, 240, 40, '#4cb04c');
  circle(ctx, 552, 240, 40, '#4cb04c');
  if (v === 'A') {
    circle(ctx, 486, 220, 8, '#e63946');
    circle(ctx, 528, 196, 8, '#e63946');
    circle(ctx, 546, 244, 8, '#e63946');
  }
  // Flower bed: red flower at (92,372) only on A (diff 2).
  ctx.strokeStyle = '#2f7d2f';
  ctx.lineWidth = 3;
  for (const [fx, fy] of [[60, 430], [150, 450], [240, 435], [350, 455], [470, 440], [540, 460]]) {
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx, fy - 26);
    ctx.stroke();
  }
  flower(ctx, 60, 400, '#ff6b9d', '#ffd93b');
  if (v === 'A') flower(ctx, 92, 372, '#e63946', '#ffd93b');
  flower(ctx, 150, 420, '#b388ff', '#fff3b0');
  flower(ctx, 240, 405, '#ff8fa3', '#ffd93b');
  flower(ctx, 350, 425, '#ff6b9d', '#ffd93b');
  flower(ctx, 470, 410, '#b388ff', '#fff3b0');
  flower(ctx, 540, 430, '#ff8fa3', '#ffd93b');
  // Butterfly (diff 3: orange on A, blue on B) at (310,300).
  const wing = v === 'A' ? '#ff9f1c' : '#4cc9f0';
  ellipse(ctx, 300, 296, 12, 8, wing);
  ellipse(ctx, 320, 296, 12, 8, wing);
  ellipse(ctx, 300, 308, 10, 6, wing);
  ellipse(ctx, 320, 308, 10, 6, wing);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(310, 292);
  ctx.lineTo(310, 312);
  ctx.stroke();
  // Pond with duck (diff 5: duck only on A).
  ellipse(ctx, 168, 470, 86, 30, '#5db9e8');
  ellipse(ctx, 168, 470, 86, 30, 'rgba(255,255,255,0.25)');
  if (v === 'A') {
    ellipse(ctx, 168, 452, 20, 13, '#fff3b0');
    circle(ctx, 184, 440, 9, '#fff3b0');
    poly(ctx, [[192, 440], [200, 443], [192, 446]], '#ff9f1c');
    circle(ctx, 186, 438, 2, '#222');
  }
  // Mushroom (diff 6: extra, only on B) at (430,470).
  if (v === 'B') {
    rect(ctx, 426, 468, 8, 16, '#fff3e0');
    poly(ctx, [[410, 470], [450, 470], [430, 448]], '#e63946');
    circle(ctx, 424, 458, 3, '#fff');
    circle(ctx, 438, 462, 3, '#fff');
  }
}

// ---- Scene 2: Cozy Kitchen ---------------------------------------------
function drawKitchen(ctx, v) {
  rect(ctx, 0, 0, PANEL_W, 540, '#ffe9c4');
  rect(ctx, 0, 400, PANEL_W, 140, '#c98f5f');
  // Window with curtains (diff 1: red on A, blue on B).
  rect(ctx, 60, 60, 150, 170, '#bfe8ff');
  circle(ctx, 110, 110, 24, '#ffd93b');
  ellipse(ctx, 160, 90, 26, 12, '#fff');
  ellipse(ctx, 120, 150, 30, 12, '#fff');
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 6;
  ctx.strokeRect(60, 60, 150, 170);
  ctx.beginPath();
  ctx.moveTo(135, 60);
  ctx.lineTo(135, 230);
  ctx.moveTo(60, 145);
  ctx.lineTo(210, 145);
  ctx.stroke();
  const curtain = v === 'A' ? '#e63946' : '#4361ee';
  poly(ctx, [[40, 50], [78, 50], [70, 240], [40, 240]], curtain);
  poly(ctx, [[192, 50], [230, 50], [230, 240], [200, 240]], curtain);
  // Clock (diff 0: 3 o'clock on A, 6 o'clock on B).
  circle(ctx, 300, 82, 34, '#fffdf5');
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 82, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 82);
  ctx.lineTo(300, 62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(300, 82);
  if (v === 'A') ctx.lineTo(320, 82);
  else ctx.lineTo(300, 102);
  ctx.stroke();
  circle(ctx, 300, 82, 3, '#333');
  // Shelf with jars (diff 2: jar at (486,196) only on A).
  rect(ctx, 380, 220, 200, 10, '#8a5a2b');
  rect(ctx, 392, 186, 26, 34, '#a3d9a5');
  rect(ctx, 428, 186, 26, 34, '#f4a261');
  if (v === 'A') rect(ctx, 472, 186, 26, 34, '#e9c46a');
  rect(ctx, 516, 186, 26, 34, '#e76f51');
  // Stove + kettle (diff 3: steam only on A).
  rect(ctx, 170, 340, 150, 60, '#5a5a6e');
  circle(ctx, 210, 360, 22, '#222');
  circle(ctx, 280, 360, 22, '#222');
  poly(ctx, [[180, 340], [230, 300], [250, 300], [240, 340]], '#c0c0cc');
  rect(ctx, 225, 288, 20, 14, '#333');
  if (v === 'A') {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(208, 282);
    ctx.quadraticCurveTo(198, 262, 208, 246);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(228, 282);
    ctx.quadraticCurveTo(238, 262, 228, 246);
    ctx.stroke();
  }
  // Table, fruit bowl (diff 4: apple red on A, green on B).
  rect(ctx, 340, 400, 220, 16, '#8a5a2b');
  rect(ctx, 360, 416, 14, 90, '#6e4520');
  rect(ctx, 526, 416, 14, 90, '#6e4520');
  ellipse(ctx, 384, 396, 52, 14, '#4361ee');
  circle(ctx, 384, 392, 12, v === 'A' ? '#e63946' : '#70c24a');
  circle(ctx, 412, 390, 11, '#f4a261');
  circle(ctx, 360, 392, 11, '#ffd93b');
  // Cat on chair (diff 5: tail up on A, down on B).
  rect(ctx, 480, 430, 70, 14, '#b08968');
  rect(ctx, 490, 444, 10, 60, '#7f5539');
  rect(ctx, 530, 444, 10, 60, '#7f5539');
  ellipse(ctx, 512, 420, 34, 20, '#f4a261');
  circle(ctx, 540, 400, 15, '#f4a261');
  poly(ctx, [[532, 388], [536, 376], [542, 388]], '#f4a261');
  poly(ctx, [[544, 388], [548, 376], [552, 388]], '#f4a261');
  ctx.strokeStyle = '#f4a261';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(480, 424);
  if (v === 'A') ctx.quadraticCurveTo(462, 400, 472, 380);
  else ctx.quadraticCurveTo(462, 448, 472, 466);
  ctx.stroke();
  // Extra mug (diff 6: only on B) at (118,470).
  if (v === 'B') {
    rect(ctx, 104, 452, 28, 30, '#4cc9f0');
    ctx.strokeStyle = '#4cc9f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(134, 466, 9, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  // Rug (diff 7: three stripes on A, two on B).
  rect(ctx, 240, 500, 160, 26, '#e63946');
  rect(ctx, 260, 500, 12, 26, '#fff');
  rect(ctx, 300, 500, 12, 26, '#fff');
  if (v === 'A') rect(ctx, 340, 500, 12, 26, '#fff');
}

// ---- Scene 3: Space Station --------------------------------------------
function drawStation(ctx, v) {
  rect(ctx, 0, 0, PANEL_W, 540, '#0b1030');
  // Stars; one at (300,66) only on A (diff 1).
  const stars = [[40, 40], [150, 30], [230, 110], [380, 40], [470, 120], [560, 40], [60, 180], [540, 200], [200, 60], [420, 200]];
  for (const [sx, sy] of stars) star(ctx, sx, sy, 5, '#ffffff');
  if (v === 'A') star(ctx, 300, 66, 6, '#ffe66d');
  // Planet with ring (diff 0: ring only on A) at (118,96).
  circle(ctx, 118, 96, 30, '#e07a5f');
  ellipse(ctx, 118, 96, 12, 30, '#c96a52');
  if (v === 'A') {
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(118, 96, 52, 14, -0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Satellite (diff 9: only on A) at (548,82).
  if (v === 'A') {
    rect(ctx, 536, 74, 24, 16, '#c0c0cc');
    rect(ctx, 524, 78, 12, 8, '#4361ee');
    rect(ctx, 560, 78, 12, 8, '#4361ee');
  }
  // Antenna light (diff 2: green on A, red on B).
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(486, 170);
  ctx.lineTo(486, 130);
  ctx.stroke();
  circle(ctx, 486, 148, 9, v === 'A' ? '#06d6a0' : '#ef476f');
  circle(ctx, 486, 126, 5, '#ffd93b');
  // Big window + Earth.
  rect(ctx, 40, 210, 220, 180, '#123a6e');
  ctx.strokeStyle = '#9aa5b1';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 210, 220, 180);
  circle(ctx, 150, 300, 52, '#2a9d8f');
  ellipse(ctx, 130, 285, 26, 14, '#06d6a0');
  ellipse(ctx, 168, 318, 22, 12, '#06d6a0');
  // Astronaut, floating below the control panel (diff 3: visor blue on A, gold on B).
  circle(ctx, 330, 430, 26, '#f1faee');
  ellipse(ctx, 318, 430, 16, 18, v === 'A' ? '#4cc9f0' : '#ffd60a');
  rect(ctx, 308, 456, 44, 52, '#f1faee');
  rect(ctx, 312, 464, 14, 10, '#4361ee');
  rect(ctx, 334, 464, 14, 10, '#e63946');
  ctx.strokeStyle = '#f1faee';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(308, 472);
  ctx.lineTo(280, 490);
  ctx.moveTo(352, 472);
  ctx.lineTo(380, 490);
  ctx.stroke();
  // Control panel with lights (diff 4: three lights on A, two on B).
  rect(ctx, 290, 220, 200, 90, '#3a3f4b');
  rect(ctx, 300, 232, 180, 40, '#06d6a0');
  ctx.fillStyle = '#0b1030';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('SYS OK  98%', 312, 256);
  circle(ctx, 312, 290, 8, '#06d6a0');
  circle(ctx, 340, 290, 8, '#ffd93b');
  if (v === 'A') circle(ctx, 368, 290, 8, '#ef476f');
  rect(ctx, 420, 282, 50, 16, '#e63946');
  // Robot (diff 5: arm raised on A, lowered on B).
  rect(ctx, 480, 330, 56, 60, '#c0c0cc');
  circle(ctx, 508, 306, 20, '#c0c0cc');
  circle(ctx, 501, 304, 4, '#06d6a0');
  circle(ctx, 515, 304, 4, '#06d6a0');
  ctx.strokeStyle = '#c0c0cc';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(480, 348);
  if (v === 'A') ctx.lineTo(452, 306);
  else ctx.lineTo(452, 372);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(536, 348);
  ctx.lineTo(560, 372);
  ctx.stroke();
  // Pipes + valve (diff 6: valve only on A).
  rect(ctx, 60, 430, 180, 16, '#7d8597');
  rect(ctx, 60, 446, 180, 10, '#5a6478');
  if (v === 'A') {
    circle(ctx, 88, 452, 12, '#e63946');
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(76, 452);
    ctx.lineTo(100, 452);
    ctx.moveTo(88, 440);
    ctx.lineTo(88, 464);
    ctx.stroke();
  }
  // Oxygen tank (diff 7: label O2 on A, O3 on B).
  rect(ctx, 232, 440, 40, 66, '#e9ecef');
  ellipse(ctx, 252, 440, 20, 8, '#adb5bd');
  ctx.fillStyle = '#0b1030';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(v === 'A' ? 'O2' : 'O3', 238, 478);
  // Floating wrench (diff 8: only on B) at (420,452).
  if (v === 'B') {
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(404, 466);
    ctx.lineTo(436, 440);
    ctx.stroke();
    circle(ctx, 440, 436, 8, '#ffd93b');
  }
  // Floor.
  rect(ctx, 0, 510, PANEL_W, 30, '#2b2d42');
}

// ---- Scene 4: Enchanted Forest at Night --------------------------------
function drawForest(ctx, v) {
  const sky = ctx.createLinearGradient(0, 0, 0, 540);
  sky.addColorStop(0, '#0d1f33');
  sky.addColorStop(1, '#1d3a2f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 540);
  // Stars; one at (546,196) only on A (diff 8).
  const stars = [[60, 60], [160, 40], [360, 50], [440, 140], [80, 220], [200, 200], [520, 260], [40, 140]];
  for (const [sx, sy] of stars) star(ctx, sx, sy, 4, '#cfe8ff');
  if (v === 'A') star(ctx, 546, 196, 5, '#cfe8ff');
  // Moon (diff 0: crescent on A, full on B).
  circle(ctx, 486, 88, 30, '#fff3b0');
  if (v === 'A') circle(ctx, 498, 82, 26, '#0d1f33');
  // Tall trees; bird nest (diff 9) on the branch at (248,118) only on A.
  const trees = [[60, 300], [140, 260], [360, 280], [470, 300], [540, 260]];
  for (const [tx, ty] of trees) {
    poly(ctx, [[tx - 34, ty], [tx, ty - 150], [tx + 34, ty]], '#123524');
    poly(ctx, [[tx - 28, ty - 60], [tx, ty - 190], [tx + 28, ty - 60]], '#1a4a30');
    rect(ctx, tx - 7, ty, 14, 60, '#5b3a1e');
  }
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(230, 150);
  ctx.lineTo(280, 118);
  ctx.stroke();
  if (v === 'A') {
    ellipse(ctx, 248, 118, 22, 9, '#8a5a2b');
    circle(ctx, 242, 110, 6, '#f4f1de');
    circle(ctx, 254, 110, 6, '#e0fbfc');
  }
  // Fireflies; one at (118,148) only on A (diff 1).
  const flies = [[200, 240], [330, 260], [420, 200], [90, 380], [280, 340], [480, 380]];
  for (const [fx, fy] of flies) {
    circle(ctx, fx, fy, 5, 'rgba(190,242,100,0.35)');
    circle(ctx, fx, fy, 2.5, '#bef264');
  }
  if (v === 'A') {
    circle(ctx, 118, 148, 5, 'rgba(190,242,100,0.35)');
    circle(ctx, 118, 148, 2.5, '#bef264');
  }
  // Owl on a branch (diff 2: eyes open on A, closed on B).
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(260, 230);
  ctx.lineTo(350, 224);
  ctx.stroke();
  ellipse(ctx, 300, 196, 26, 32, '#6d4c41');
  circle(ctx, 288, 188, 9, '#fff');
  circle(ctx, 312, 188, 9, '#fff');
  if (v === 'A') {
    circle(ctx, 288, 188, 4, '#222');
    circle(ctx, 312, 188, 4, '#222');
  } else {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(282, 188);
    ctx.lineTo(294, 188);
    ctx.moveTo(306, 188);
    ctx.lineTo(318, 188);
    ctx.stroke();
  }
  poly(ctx, [[300, 196], [306, 202], [300, 206]], '#ffb703');
  // Ground, stream, stones (diff 4: stone at (178,382) only on A).
  rect(ctx, 0, 440, PANEL_W, 100, '#14291d');
  ellipse(ctx, 200, 430, 180, 40, '#1d4e89');
  ellipse(ctx, 200, 430, 180, 40, 'rgba(255,255,255,0.12)');
  if (v === 'A') ellipse(ctx, 178, 382, 18, 10, '#8d99ae');
  ellipse(ctx, 260, 400, 16, 9, '#8d99ae');
  ellipse(ctx, 120, 410, 14, 8, '#8d99ae');
  // Glowing mushroom (diff 3: blue glow on A, purple on B).
  const glow = v === 'A' ? '#4cc9f0' : '#b388ff';
  circle(ctx, 516, 308, 26, glow + '55');
  rect(ctx, 512, 306, 8, 20, '#f1faee');
  poly(ctx, [[494, 308], [538, 308], [516, 284]], glow);
  circle(ctx, 508, 296, 3, '#fff');
  circle(ctx, 524, 300, 3, '#fff');
  // Tiny mushroom (diff 6: extra, only on B) at (88,306).
  if (v === 'B') {
    rect(ctx, 85, 304, 6, 12, '#f1faee');
    poly(ctx, [[76, 306], [100, 306], [88, 292]], '#ff70a6');
  }
  // Lantern (diff 5: lit yellow on A, unlit grey on B).
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(420, 380);
  ctx.lineTo(420, 398);
  ctx.stroke();
  rect(ctx, 406, 398, 28, 40, v === 'A' ? '#ffd93b' : '#6c757d');
  rect(ctx, 402, 394, 36, 6, '#333');
  if (v === 'A') circle(ctx, 420, 418, 30, 'rgba(255,217,59,0.25)');
  // Stepping stones (diff 7: three on A, two on B).
  ellipse(ctx, 300, 480, 24, 10, '#adb5bd');
  ellipse(ctx, 348, 486, 24, 10, '#adb5bd');
  if (v === 'A') ellipse(ctx, 396, 480, 24, 10, '#adb5bd');
}

// One scene-drawing function per scene, chosen by id; variant 'A' is the
// left panel, 'B' the right panel. Text state is reset here because the HUD
// leaves textAlign as 'right'/'center' between draws.
export function drawScene(ctx, sceneId, variant) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.beginPath();
  ctx.rect(0, 0, PANEL_W, PANEL_H);
  ctx.clip();
  if (sceneId === 'garden') drawGarden(ctx, variant);
  else if (sceneId === 'kitchen') drawKitchen(ctx, variant);
  else if (sceneId === 'station') drawStation(ctx, variant);
  else drawForest(ctx, variant);
  ctx.restore();
}
