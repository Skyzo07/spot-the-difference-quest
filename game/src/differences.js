// Twin Worlds — the difference definitions.
// One list per scene, in scene coordinates (600 x 540, the inside of a panel).
// The same coordinates drive both the drawing (scenes.js draws the two panels
// differently exactly at these spots) and the click detection (input.js), so
// the panels differ exactly at the marked spots and nowhere else.
// kind: missing | extra | recolor | changed — how the right panel differs.
export const DIFFS = {
  garden: [
    { x: 96, y: 92, r: 36, kind: 'recolor', label: 'the sun changed colour' },
    { x: 452, y: 78, r: 34, kind: 'missing', label: 'a cloud vanished' },
    { x: 92, y: 372, r: 26, kind: 'missing', label: 'a red flower is gone' },
    { x: 310, y: 300, r: 26, kind: 'recolor', label: 'the butterfly changed colour' },
    { x: 512, y: 250, r: 30, kind: 'missing', label: 'the apples fell off the tree' },
    { x: 168, y: 452, r: 28, kind: 'missing', label: 'the duck swam away' },
    { x: 430, y: 470, r: 26, kind: 'extra', label: 'a mushroom appeared' },
  ],
  kitchen: [
    { x: 300, y: 82, r: 30, kind: 'changed', label: 'the clock shows another time' },
    { x: 96, y: 168, r: 32, kind: 'recolor', label: 'the curtain changed colour' },
    { x: 486, y: 196, r: 26, kind: 'missing', label: 'a jar is missing from the shelf' },
    { x: 208, y: 300, r: 28, kind: 'missing', label: 'the kettle steam is gone' },
    { x: 384, y: 420, r: 26, kind: 'recolor', label: 'the apple changed colour' },
    { x: 516, y: 452, r: 28, kind: 'changed', label: 'the cat lowered its tail' },
    { x: 118, y: 470, r: 26, kind: 'extra', label: 'an extra mug appeared' },
    { x: 300, y: 512, r: 30, kind: 'missing', label: 'a rug stripe is missing' },
  ],
  station: [
    { x: 118, y: 96, r: 34, kind: 'changed', label: 'the ringed planet lost its ring' },
    { x: 300, y: 66, r: 22, kind: 'missing', label: 'a star blinked out' },
    { x: 486, y: 148, r: 22, kind: 'recolor', label: 'the antenna light changed colour' },
    { x: 330, y: 430, r: 30, kind: 'recolor', label: 'the helmet visor changed colour' },
    { x: 330, y: 252, r: 26, kind: 'missing', label: 'a panel light went dark' },
    { x: 508, y: 320, r: 30, kind: 'changed', label: 'the robot lowered its arm' },
    { x: 88, y: 452, r: 26, kind: 'missing', label: 'a pipe valve is gone' },
    { x: 252, y: 470, r: 26, kind: 'changed', label: 'the tank label reads O3, not O2' },
    { x: 420, y: 452, r: 24, kind: 'extra', label: 'a wrench floats by' },
    { x: 548, y: 82, r: 26, kind: 'missing', label: 'a satellite drifted away' },
  ],
  forest: [
    { x: 486, y: 88, r: 32, kind: 'changed', label: 'the moon turned full' },
    { x: 118, y: 148, r: 20, kind: 'missing', label: 'a firefly went dark' },
    { x: 300, y: 196, r: 26, kind: 'changed', label: 'the owl closed its eyes' },
    { x: 516, y: 308, r: 26, kind: 'recolor', label: 'the glowing mushroom changed colour' },
    { x: 178, y: 382, r: 24, kind: 'missing', label: 'a stream stone is gone' },
    { x: 420, y: 420, r: 28, kind: 'changed', label: 'the lantern went out' },
    { x: 88, y: 306, r: 22, kind: 'extra', label: 'a tiny mushroom sprouted' },
    { x: 348, y: 486, r: 26, kind: 'missing', label: 'a stepping stone is missing' },
    { x: 546, y: 196, r: 20, kind: 'missing', label: 'a star faded away' },
    { x: 248, y: 118, r: 26, kind: 'missing', label: 'the bird nest is gone' },
  ],
};

// Look a click up in one scene's list: the first unfound difference whose
// circle contains the scene coordinate, or null for a miss.
export function findDifferenceAt(sceneId, sx, sy, foundSet) {
  const list = DIFFS[sceneId];
  for (let i = 0; i < list.length; i++) {
    if (foundSet.has(i)) continue;
    const d = list[i];
    const dx = sx - d.x;
    const dy = sy - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return i;
  }
  return null;
}
