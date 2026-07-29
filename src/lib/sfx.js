// Tiny Web Audio sound effects - no asset files, synthesized on the fly.
// Used by FeedbackFlash on every right/wrong answer. Respects the user's
// "Sound" preference (callers gate before calling).

let ctx = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch (_e) {
      return null;
    }
  }
  // browsers suspend AudioContext until a user gesture; resume on use
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// Rising two-note chime for a correct answer.
export function playCorrect() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  [880, 1318.5].forEach((f, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = f;
    o.connect(g);
    g.connect(ac.destination);
    const t = now + i * 0.085;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.start(t);
    o.stop(t + 0.22);
  });
}

// Celebratory ascending arpeggio for completing a lesson - a fuller, brighter
// chime than the two-note correct sound so a finish feels like a milestone.
export function playLessonComplete() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    o.connect(g);
    g.connect(ac.destination);
    const t = now + i * 0.11;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.start(t);
    o.stop(t + 0.34);
  });
}

// Descending low buzz for a wrong answer.
export function playWrong() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(240, now);
  o.frequency.exponentialRampToValueAtTime(130, now + 0.26);
  o.connect(g);
  g.connect(ac.destination);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.18, now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  o.start(now);
  o.stop(now + 0.32);
}