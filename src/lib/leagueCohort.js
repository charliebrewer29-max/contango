// Rookie League cohort generation.
//
// Opponents are seeded relative to the user's entry XP (not a fixed table),
// with light jitter so the numbers don't read as mathematically generated.
// The cohort is generated once on league entry and then frozen - the user's
// rank recalculates live as their XP grows, so passing someone actually moves
// them up the list.
//
// Names are drawn from a pool of plain handles, numbered handles, name-like
// handles, and trading-flavored (non-punny) handles. No alliteration, no
// "Contango".

const PLAIN = [
  "quietbid", "ninetysix", "hollowpoint", "drawdown_dan",
  "lowball", "midbook", "paperhand", "scalenine", "laggard",
  "orderflow", "blotter", "l2depth", "limitdown", "uptickr", "midprice",
];

const NUMBERED = [
  "tickr_04", "delta77", "nq_2200", "es_4900", "cl_71",
  "micro_22", "rty_v2", "z2_0526", "qtr_end", "vwap_3",
];

const NAME_LIKE = [
  "J. Okafor", "mrivera", "sam.k", "acho", "lpark", "d_ng",
  "n.varga", "kpeters", "j.lin", "tomw", "s_patel", "rchoi",
];

const FLAVORED = [
  "basis", "gapfill", "thetagang", "rollyield",
  "frontmonth", "backmonth", "pointvalue", "settlement",
];

export const NAME_POOL = [...PLAIN, ...NUMBERED, ...NAME_LIKE, ...FLAVORED];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Multipliers place the user ~4th-5th of 8 on entry: 3 above, 4 below.
const MULTIPLIERS = [1.4, 1.9, 2.6, 0.75, 0.5, 0.3, 0.15];

function jitter() {
  return 1 + (Math.random() * 0.16 - 0.08); // +/- 8%
}

function round10(n) {
  return Math.max(0, Math.round(n / 10) * 10);
}

export const MIN_LEAGUE_XP = 20;

export function generateCohort(userXp, now = new Date()) {
  const names = shuffle(NAME_POOL).slice(0, MULTIPLIERS.length);
  const createdAt = now.toISOString();
  return MULTIPLIERS.map((m, i) => {
    const base = round10(userXp * m * jitter());
    // dailyRate: XP earned per day, proportional to standing (multiplier) and
    // jittered per opponent so they drift at different speeds. ~5% of their
    // seeded XP per day keeps a Rookie cohort moving in Rookie-sized steps and
    // a Platinum cohort in Platinum-sized steps.
    const dailyRate = Math.max(1, Math.round(userXp * m * 0.05 * jitter()));
    return { name: names[i], xp: base, dailyRate, createdAt };
  });
}

// An opponent's current XP: base + dailyRate * daysElapsed since createdAt,
// floored at MIN_LEAGUE_XP. Legacy cohorts persisted without dailyRate or
// createdAt simply do not drift (rate 0 / no createdAt), and are still floored.
export function currentXp(opponent, now = new Date()) {
  const base = opponent.xp || 0;
  const rate = opponent.dailyRate || 0;
  let drifted = base;
  if (rate > 0 && opponent.createdAt) {
    const created = new Date(opponent.createdAt);
    if (!isNaN(created.getTime())) {
      const days = Math.max(0, (now.getTime() - created.getTime()) / 86_400_000);
      drifted = base + rate * days;
    }
  }
  return Math.max(MIN_LEAGUE_XP, Math.floor(drifted));
}

// The whole cohort's XP as of now: each opponent's drifted, floored XP.
export function cohortXpNow(cohort, now = new Date()) {
  return (cohort || []).map((o) => ({ ...o, xp: currentXp(o, now) }));
}

// Most recent Sunday at 00:00 local time as YYYY-MM-DD — the league week start.
export function weekStartIso(now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() - d.getDay()); // Sunday = 0, shift back to Sunday
  d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// True when the stored week start is missing or from an earlier week (i.e. a
// Sunday boundary has been crossed since the cohort was seeded).
export function needsWeeklyReset(storedWeekStart, now = new Date()) {
  if (!storedWeekStart) return true;
  return storedWeekStart !== weekStartIso(now);
}