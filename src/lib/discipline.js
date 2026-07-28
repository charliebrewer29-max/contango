// Discipline Engine — derives a behavioral profile from drill history.
//
// The research consensus (Chague/De-Losso/Giovannetti; Barber & Odean; FINRA)
// is that day traders fail on discipline and psychology, not strategy
// knowledge. These metrics measure execution behavior the sim can actually
// observe, so the app can train the thing that actually separates traders
// who last. Every metric degrades gracefully when the signal is thin, so old
// drill records without timing/stop fields still produce a usable profile.

const NEUTRAL = 70;

function clamp(n, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, n)); }
function round(n) { return Math.round(n); }

// Patience: decision speed. Too fast = impulsive; a deliberate 2-10s is the
// disciplined band; very slow drifts toward paralysis.
function patienceFromAvg(avgMs) {
  if (avgMs == null) return { score: NEUTRAL, label: "Patience", blurb: "Not enough timed decisions yet." };
  let s;
  if (avgMs < 1500) s = clamp(35 + (avgMs / 1500) * 25);
  else if (avgMs <= 10000) s = clamp(86 - Math.abs(avgMs - 4500) / 220, 78, 95);
  else if (avgMs <= 20000) s = clamp(78 - (avgMs - 10000) / 400, 60, 78);
  else s = clamp(60 - (avgMs - 20000) / 600, 38, 60);
  const blurb = s >= 80 ? "You take a beat to read the setup before committing - disciplined pace."
    : s >= 60 ? "You decide at a reasonable pace - keep it deliberate, not reactive."
    : "You're rushing decisions. Slow down and read the chart before you click.";
  return { score: round(s), label: "Patience", blurb };
}

// Tilt resistance: how you perform on the decision right after a miss.
// Recovering (post-error accuracy >= overall) is good; tilting (worse, and
// faster = revenge signature) is the #1 behavioral failure mode.
function tiltFromPostError(decisions) {
  let postErr = 0, postCorrect = 0, postTimed = 0, postTimeSum = 0;
  let overallCorrect = 0, overallTimed = 0, overallTimeSum = 0, count = 0;
  let prevWrong = false;
  for (const d of decisions) {
    if (d.isCorrect != null) { overallCorrect += d.isCorrect ? 1 : 0; count++; }
    if (d.decisionTimeMs != null) { overallTimed++; overallTimeSum += d.decisionTimeMs; }
    if (prevWrong) {
      postErr++;
      if (d.isCorrect) postCorrect++;
      if (d.decisionTimeMs != null) { postTimed++; postTimeSum += d.decisionTimeMs; }
    }
    prevWrong = d.isCorrect === false;
  }
  if (postErr < 2) return { score: NEUTRAL, label: "Tilt resistance", blurb: "Not enough post-error decisions to measure yet." };
  const postAcc = postCorrect / postErr;
  const overallAcc = count ? overallCorrect / count : 0;
  let s = 50 + (postAcc - overallAcc) * 100;
  if (postTimed && overallTimed) {
    const postAvg = postTimeSum / postTimed;
    const overallAvg = overallTimeSum / overallTimed;
    if (postAvg < overallAvg * 0.6) s -= 15; // much faster after an error = revenge
  }
  s = clamp(s);
  const blurb = s >= 78 ? "Wrong answers don't rattle you - you recover cleanly."
    : s >= 55 ? "A miss costs you some focus - watch the decision right after an error."
    : "You tilt after a miss - your next decision gets worse. Pause before re-entering.";
  return { score: round(s), label: "Tilt resistance", blurb };
}

// Risk sizing: stop-distance consistency on tap-entry drills. A trader who
// takes wildly varying or recklessly wide stops is sizing undisciplined.
function riskSizingFromTaps(decisions) {
  const stops = decisions.filter(d => d.type === "tap" && d.stopDistancePoints != null).map(d => d.stopDistancePoints);
  if (stops.length < 3) return { score: NEUTRAL, label: "Risk sizing", blurb: "Complete a few tap-entry drills to measure your risk sizing." };
  const sorted = stops.slice().sort((a, b) => a - b);
  const med = sorted[Math.floor(sorted.length / 2)];
  const reckless = stops.filter(s => s > med * 1.6).length;
  const recklessFraction = reckless / stops.length;
  const mean = stops.reduce((a, b) => a + b, 0) / stops.length;
  const variance = stops.reduce((a, b) => a + (b - mean) ** 2, 0) / stops.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const s = clamp(100 - recklessFraction * 100 - Math.min(35, cv * 35));
  const blurb = s >= 78 ? "Your risk sizing is steady and sane - no reckless stops."
    : s >= 55 ? "Your stops are mostly reasonable - tighten the wide ones."
    : "You take oversized risk on some entries - size so a normal stop equals your risk.";
  return { score: round(s), label: "Risk sizing", blurb };
}

// Consistency: per-drill accuracy variance. The edge is steadiness, not spikes.
function consistencyFromDrills(history) {
  const drills = history.filter(h => h && h.total > 0);
  if (drills.length < 3) return { score: NEUTRAL, label: "Consistency", blurb: "Finish a few more drills to measure consistency." };
  const accs = drills.map(d => d.correctCount / d.total);
  const mean = accs.reduce((a, b) => a + b, 0) / accs.length;
  const variance = accs.reduce((a, b) => a + (b - mean) ** 2, 0) / accs.length;
  const sd = Math.sqrt(variance);
  const s = clamp(100 - sd * 220);
  const blurb = s >= 78 ? "Your performance is steady across drills - that's the edge."
    : s >= 55 ? "You're fairly consistent - smooth out the off days."
    : "Your results swing drill to drill - consistency is where the edge lives.";
  return { score: round(s), label: "Consistency", blurb };
}

export function disciplineProfile(progress) {
  const history = (progress?.drillHistory || []).filter(Boolean);
  if (!history.length) return { empty: true, metrics: [], overall: null, weakest: null, drillCount: 0, decisionCount: 0 };
  const decisions = history.flatMap(h => (h.decisions || []).map(d => ({ ...d, isCorrect: d.isCorrect ?? d.correct })));
  const timed = decisions.filter(d => d.decisionTimeMs != null);
  const avgMs = timed.length ? timed.reduce((a, b) => a + b.decisionTimeMs, 0) / timed.length : null;
  const metrics = [
    patienceFromAvg(avgMs),
    tiltFromPostError(decisions),
    riskSizingFromTaps(decisions),
    consistencyFromDrills(history),
  ];
  const overall = round(metrics.reduce((a, m) => a + m.score, 0) / metrics.length);
  const weakest = metrics.reduce((a, m) => (m.score < a.score ? m : a), metrics[0]);
  return { empty: false, metrics, overall, weakest, drillCount: history.length, decisionCount: decisions.length };
}