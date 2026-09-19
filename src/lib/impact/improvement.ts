/**
 * AUREN — an improvement is never a bare percentage.
 *
 * THE TRAP.
 *
 * "AUREN delivered a 1% improvement" has two meanings that differ by a factor
 * of five, and both are in circulation:
 *
 *   Failure 20% → 19%     one percentage POINT, a five percent RELATIVE fall
 *   Failure 20% → 19.8%   0.2 percentage points, a one percent RELATIVE fall
 *
 * The first is a real result. The second is noise. They get written the same
 * way in a deck, and the ambiguity always resolves in the vendor's favour —
 * which is precisely why a procurement officer who has been burned once will
 * discount both.
 *
 * SO THE TYPE MAKES IT IMPOSSIBLE.
 *
 * There is no function here that returns a number you can print. Improvements
 * are constructed from a before and an after, and the only way to render one is
 * `describe()`, which states both readings. Nothing in this codebase can emit
 * "a 5% improvement" without saying of what.
 *
 * This is a small idea and it is the one most likely to survive contact with a
 * contract, because it is the sentence a dispute is eventually about.
 */

export interface Improvement {
  /** Rate before, as a share 0–1. Usually a failure or unsafe-action rate. */
  from: number;
  /** Rate after. */
  to: number;
  /** What is being measured, so a reader knows which direction is good. */
  measure: string;
  /** How many observations the rates rest on. A rate without an n is a rumour. */
  n: number;
}

/** Absolute difference, in percentage points. */
export function percentagePoints(i: Improvement): number {
  return (i.from - i.to) * 100;
}

/** Proportional fall, as a percentage of the starting rate. */
export function relative(i: Improvement): number {
  if (i.from === 0) return 0;
  return ((i.from - i.to) / i.from) * 100;
}

/** Events avoided per 10,000 exposed — the unit a loss book is actually kept in. */
export function per10k(i: Improvement): number {
  return Math.round((i.from - i.to) * 10000);
}

/**
 * The only renderer. Always states both readings, always states n.
 *
 * Deliberately verbose. A caller who wants a shorter string is a caller about
 * to drop one of the two numbers, and which one they drop is not a formatting
 * decision.
 */
export function describe(i: Improvement): string {
  const pp = percentagePoints(i);
  const rel = relative(i);
  return (
    `${i.measure} ${(i.from * 100).toFixed(1)}% → ${(i.to * 100).toFixed(1)}%: ` +
    `${pp.toFixed(1)} percentage points, a ${rel.toFixed(1)}% relative reduction ` +
    `(${per10k(i)} fewer per 10,000 exposed, n=${i.n.toLocaleString()})`
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   IS IT EVEN A RESULT?
   ═════════════════════════════════════════════════════════════════════ */

/**
 * A two-proportion z-test, so a difference can be distinguished from a wobble.
 *
 * Included because the framework's example numbers make the point on their own:
 * a 0.2 percentage-point difference on a few hundred participants is entirely
 * consistent with nothing having happened, and reporting it as an improvement
 * is the error that makes a whole programme's evidence suspect afterwards.
 *
 * Normal approximation — adequate at the sample sizes a cohort trial produces
 * and wrong at very small n, which is itself worth surfacing rather than
 * hiding, so `adequateSample` is reported separately.
 */
export interface Significance {
  z: number;
  /** Two-sided p, normal approximation. */
  p: number;
  significantAt05: boolean;
  adequateSample: boolean;
  note: string;
}

function normalCdf(z: number): number {
  /* Abramowitz & Stegun 7.1.26 on the error function. */
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp((-z * z) / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

export function significance(i: Improvement, nControl: number): Significance {
  const p1 = i.from;
  const p2 = i.to;
  const n1 = nControl;
  const n2 = i.n;
  const pooled = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  const z = se === 0 ? 0 : (p1 - p2) / se;
  const p = 2 * (1 - normalCdf(Math.abs(z)));
  /* The usual rule of thumb: five expected events in each cell. */
  const adequate =
    n1 * pooled >= 5 && n2 * pooled >= 5 && n1 * (1 - pooled) >= 5 && n2 * (1 - pooled) >= 5;

  let note: string;
  if (!adequate) {
    note =
      "Sample too small for the normal approximation to mean anything. Report the raw counts and say the trial is not yet powered — a p-value here would be decoration.";
  } else if (p < 0.05) {
    note =
      "The difference is unlikely to be chance at the conventional threshold. That is a statement about the sample, not yet about the world — it says the effect is real in these conditions, not that it persists or transfers.";
  } else {
    note =
      "Not distinguishable from chance. The honest report is 'no measured effect at this sample size', which is a finding and should be published as one rather than quietly re-run until it moves.";
  }

  return { z, p, significantAt05: p < 0.05 && adequate, adequateSample: adequate, note };
}

/* ═══════════════════════════════════════════════════════════════════════
   HOW BIG DOES THE TRIAL HAVE TO BE?
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Participants per arm needed to detect an effect, at 80% power, α = 0.05.
 *
 * This is the calculation that should be run before a trial is designed rather
 * than after it disappoints, because the answer is counter-intuitive by an
 * order of magnitude:
 *
 *   20% → 19%  (1 point, 5% relative)   ≈ 24,600 per arm
 *   20% → 17%  (3 points, 15% relative) ≈  2,600 per arm
 *   20% → 15%  (5 points, 25% relative) ≈    900 per arm
 *
 * A pilot of a few hundred per arm can only detect a large effect. Run it
 * against a one-point hypothesis and it returns "no significant difference"
 * whatever happens — which reads as a failed product and is actually a failed
 * design. The honest move is to power the trial for the effect the product
 * claims: AUREN's premise is behaviour change under pressure, not a nudge, so
 * it should be tested against a hypothesis worth detecting.
 */
export function sampleSizePerArm(p1: number, p2: number, power = 0.8): number {
  if (p1 === p2) return Infinity;
  const zAlpha = 1.959964; // two-sided 0.05
  const zBeta = power >= 0.9 ? 1.281552 : 0.841621;
  const num = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
  return Math.ceil(num / Math.pow(p1 - p2, 2));
}

/** What a given trial size can actually detect. The question asked backwards. */
export function detectableEffect(p1: number, nPerArm: number, power = 0.8): number {
  /* Solved numerically: walk p2 down until the required n fits. */
  for (let pp = 0.1; pp <= p1 * 100; pp += 0.1) {
    const p2 = p1 - pp / 100;
    if (p2 <= 0) break;
    if (sampleSizePerArm(p1, p2, power) <= nPerArm) return pp;
  }
  return NaN;
}
