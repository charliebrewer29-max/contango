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

export function generateCohort(userXp) {
  const names = shuffle(NAME_POOL).slice(0, MULTIPLIERS.length);
  return MULTIPLIERS.map((m, i) => ({
    name: names[i],
    xp: round10(userXp * m * jitter()),
  }));
}