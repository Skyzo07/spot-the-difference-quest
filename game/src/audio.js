// Twin Worlds — synthesized sounds. No audio files: every sound is built
// from WebAudio oscillators, so the game loads nothing over the network.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, startAt, duration, type, volume) {
    const ac = ensure();
    if (!ac || muted) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + startAt);
    gain.gain.linearRampToValueAtTime(volume, ac.currentTime + startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + startAt);
    osc.stop(ac.currentTime + startAt + duration + 0.05);
  }

  return {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    // Two-note chime when a difference is found.
    playFind() {
      tone(880, 0, 0.18, 'sine', 0.22);
      tone(1318, 0.09, 0.28, 'sine', 0.22);
    },
    // Low buzz for a wrong click.
    playMiss() {
      tone(160, 0, 0.22, 'sawtooth', 0.12);
      tone(110, 0.08, 0.25, 'sawtooth', 0.1);
    },
    playClick() {
      tone(660, 0, 0.07, 'triangle', 0.12);
    },
    playHint() {
      tone(523, 0, 0.12, 'sine', 0.16);
      tone(784, 0.1, 0.18, 'sine', 0.16);
    },
    playTick() {
      tone(1200, 0, 0.05, 'square', 0.06);
    },
    // Rising arpeggio for a finished round.
    playWin() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.2));
    },
    playLose() {
      [392, 330, 262].forEach((f, i) => tone(f, i * 0.16, 0.3, 'triangle', 0.16));
    },
  };
}
