/**
 * AUREN — concurrency.
 *
 * A rehearsal is not a page view. It holds a speech-recognition stream, a
 * synthesis pipeline and a session state machine open for five to eight
 * minutes, and it does that whether the learner is talking or thinking. So the
 * quantity that decides whether the service stands up is **how many are
 * running at the same instant**, not how many ran this month.
 *
 * Two programmes with identical annual volume can be an order of magnitude
 * apart here: a ministry putting 200,000 citizens through a campaign over a
 * year averages under one concurrent session, while a bank putting 2,000
 * customers through in a single afternoon needs several hundred. The second
 * one is the one that falls over, and a monthly-active-user figure cannot see
 * the difference.
 *
 * This file measures concurrency honestly. It does not price it — see
 * `docs/AUREN-COMMERCIAL.md`. What it does do is give the operator the two
 * numbers a capacity conversation actually needs: the peak, and the level
 * that would have served almost every session.
 */

/** Sessions running at one instant. */
export interface ConcurrencySample {
  /** Minutes since the start of the observation window. */
  minute: number;
  live: number;
}

export interface ConcurrencyProfile {
  tenantId: string;
  /** The window these samples cover, for the label on the number. */
  window: string;
  samples: ConcurrencySample[];
}

/* ═══════════════════════════════════════════════════════════════════════
   READING A PROFILE
   ═════════════════════════════════════════════════════════════════════ */

export function peak(p: ConcurrencyProfile): number {
  return p.samples.reduce((a, s) => Math.max(a, s.live), 0);
}

export function mean(p: ConcurrencyProfile): number {
  if (p.samples.length === 0) return 0;
  return p.samples.reduce((a, s) => a + s.live, 0) / p.samples.length;
}

/**
 * The level that would have served all but `1 - q` of the observed minutes.
 *
 * Provisioning to the peak means paying all year for the worst minute of a
 * launch day; provisioning to the mean means failing every campaign. The p95
 * is the number a capacity plan is actually built on, and stating it beside
 * the peak is what stops the two being confused in a procurement conversation.
 */
export function percentile(p: ConcurrencyProfile, q: number): number {
  if (p.samples.length === 0) return 0;
  const sorted = p.samples.map((s) => s.live).sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1));
  return sorted[idx];
}

/** Minutes spent at or above the ceiling — the minutes somebody waited. */
export function minutesAtCeiling(p: ConcurrencyProfile, ceiling: number): number {
  return p.samples.filter((s) => s.live >= ceiling).length;
}

export interface CapacityReading {
  peak: number;
  p95: number;
  mean: number;
  ceiling: number;
  /** Peak as a share of the ceiling, 0–1+. Above 1 means sessions were refused. */
  headroom: number;
  minutesAtCeiling: number;
  /** What the operator should do about it, in one sentence. */
  verdict: string;
}

export function readCapacity(p: ConcurrencyProfile, ceiling: number): CapacityReading {
  const pk = peak(p);
  const p95 = percentile(p, 0.95);
  const mn = mean(p);
  const over = minutesAtCeiling(p, ceiling);

  let verdict: string;
  if (over > 0) {
    verdict = `Sessions were refused or queued for ${over} minute${over === 1 ? "" : "s"}. The ceiling is below what this programme actually does, and the learners who hit it are the ones an operator most wants to reach — they turned up when the campaign told them to.`;
  } else if (pk > ceiling * 0.85) {
    verdict = `Peak reached ${Math.round((pk / ceiling) * 100)}% of the ceiling. No session was refused, and the next campaign of this shape would refuse some.`;
  } else if (pk < ceiling * 0.35) {
    verdict = `Peak reached ${Math.round((pk / ceiling) * 100)}% of the ceiling. The tenant is provisioned well above what it uses, which is worth raising with them rather than leaving them to discover it at renewal.`;
  } else {
    verdict = `Peak sat at ${Math.round((pk / ceiling) * 100)}% of the ceiling with p95 at ${p95}. Sized correctly for this programme's shape.`;
  }

  return {
    peak: pk,
    p95,
    mean: Math.round(mn * 10) / 10,
    ceiling,
    headroom: ceiling ? pk / ceiling : 0,
    minutesAtCeiling: over,
    verdict,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   SHAPES
   ═════════════════════════════════════════════════════════════════════ */

/**
 * The three demand shapes an operator actually runs, and they are not
 * variations on one curve.
 *
 * `campaign` is a ministry or a regulator driving people to a link on a
 * publication date: a single enormous spike, then a long tail. `advised` is a
 * bank booking sessions into adviser diaries: a working-hours plateau with a
 * lunch dip. `steady` is a standing programme with no push behind it.
 *
 * A ceiling sized on one shape fails on another, which is the whole reason
 * this is modelled rather than assumed.
 */
export type DemandShape = "campaign" | "advised" | "steady";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A deterministic day of minute-by-minute concurrency. Synthetic, seeded, and
 * labelled as such everywhere it surfaces — the shapes are drawn from how
 * these programmes are run, and no observed telemetry exists yet to draw from.
 */
export function profileFor(
  tenantId: string,
  shape: DemandShape,
  scale: number,
  seed: number
): ConcurrencyProfile {
  const r = mulberry32(seed);
  const samples: ConcurrencySample[] = [];
  const MINUTES = 24 * 60;

  for (let m = 0; m < MINUTES; m += 5) {
    const hour = m / 60;
    let base = 0;

    if (shape === "campaign") {
      // A publication at 09:00 and a broadcast slot at 20:00, each decaying.
      const morning = Math.exp(-Math.pow(hour - 9.2, 2) / 0.6);
      const evening = 0.55 * Math.exp(-Math.pow(hour - 20.1, 2) / 1.1);
      base = scale * (morning + evening);
    } else if (shape === "advised") {
      // Adviser diaries: 09:00–17:00, with an hour out for lunch.
      const inHours = hour >= 9 && hour <= 17 ? 1 : 0;
      const lunch = hour >= 13 && hour < 14 ? 0.35 : 1;
      base = scale * inHours * lunch * (0.8 + 0.2 * Math.sin((hour - 9) / 8 * Math.PI));
    } else {
      // Self-paced, evening-weighted, never zero.
      base = scale * (0.25 + 0.5 * Math.exp(-Math.pow(hour - 21, 2) / 6));
    }

    samples.push({ minute: m, live: Math.max(0, Math.round(base * (0.82 + r() * 0.36))) });
  }

  return {
    tenantId,
    window: "One representative day, sampled every five minutes",
    samples,
  };
}
