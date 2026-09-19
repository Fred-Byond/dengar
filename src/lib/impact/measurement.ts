/**
 * AUREN — what gets measured, and what may be claimed from it.
 *
 * THE FAILURE THIS REPLACES.
 *
 * Financial education reports participants, videos watched, quiz scores and
 * completion rates. None of those is evidence that losses will fall, and
 * everybody in the room knows it — which is why the category is procured on
 * obligation rather than on outcome, and why it is priced accordingly.
 *
 * So the measurement runs as a chain, and the chain has a property worth being
 * explicit about: **each level is strictly weaker evidence than the one below
 * it, and every level above the one you have reached is a claim you may not
 * make.** Most programmes measure level 1, report it in the language of level
 * 7, and are believed until somebody checks.
 */

/* ═══════════════════════════════════════════════════════════════════════
   THE VALUE CHAIN
   ═════════════════════════════════════════════════════════════════════ */

export interface ChainLevel {
  n: number;
  id: string;
  label: string;
  measures: string;
  /** Why this level alone is not enough. Every level has an answer. */
  limitation: string;
}

export const CHAIN: ChainLevel[] = [
  {
    n: 1, id: "reach", label: "Reach",
    measures: "People assessed and rehearsed.",
    limitation: "Counts exposure, not effect. It is the number most programmes report and the weakest one available.",
  },
  {
    n: 2, id: "knowledge", label: "Knowledge",
    measures: "Understanding of warnings, verification and the limits of AI claims.",
    limitation: "Everyone knows the rules. Knowing them is uncorrelated with following them when someone is pushing, which is the entire premise of the product.",
  },
  {
    n: 3, id: "demonstrated", label: "Demonstrated behaviour",
    measures: "What the person actually did during a pressure simulation, bound to their own words.",
    limitation: "One scenario. A person can learn the scenario rather than the behaviour, and from the inside the two look identical.",
  },
  {
    n: 4, id: "transfer", label: "Transfer",
    measures: "The same behaviour in a scenario sharing no typology, channel, persona or product class with the first.",
    limitation: "Within one session. It shows the coaching landed; it says nothing about next week.",
  },
  {
    n: 5, id: "persistence", label: "Persistence",
    measures: "Whether the behaviour survives at 30, 60 and 90 days.",
    limitation: "Still a simulation. A person can hold under rehearsed pressure and fold under a real one with their own money at stake.",
  },
  {
    n: 6, id: "real_action", label: "Real-world action",
    measures: "Register checks performed, transfers abandoned, approaches reported, the bank contacted before sending.",
    limitation: "Observable only where an institution shares its own telemetry, which makes this the first level that requires a partner rather than a product.",
  },
  {
    n: 7, id: "financial", label: "Financial outcome",
    measures: "Loss-generating events and monetary losses avoided, against a control cohort.",
    limitation: "The only level that closes the business case, and the slowest and most expensive to reach. Everything above it is a proxy for this.",
  },
];

export function level(id: string): ChainLevel | undefined {
  return CHAIN.find((c) => c.id === id);
}

/* ═══════════════════════════════════════════════════════════════════════
   THE HEADLINE KPI
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Verified Protective Action Rate.
 *
 *   The share of people who independently perform the required protective
 *   action under UNFAMILIAR pressure.
 *
 * Three words are load-bearing and each excludes a way of inflating it.
 * *Independently*: not after a prompt, not after the coach asked again.
 * *Required*: the specific action the element names, not a general show of
 * caution. *Unfamiliar*: a scenario with no surface in common with the one they
 * were coached on, because the same scenario measures recall.
 *
 * Reported per 10,000 exposed, because that is the unit a loss book is kept in
 * and it survives comparison across cohorts of different sizes.
 */
export const PROTECTIVE_ACTIONS = [
  { id: "register", label: "Checked the regulatory register independently", element: "E-VER-02" },
  { id: "urgency", label: "Refused a deadline and kept verifying", element: "E-URG-01" },
  { id: "channel", label: "Verified through a channel the other party did not supply", element: "E-VER-02" },
  { id: "social", label: "Questioned social proof rather than treating it as evidence", element: "E-SOC-01" },
  { id: "payment", label: "Inspected the payment destination and its registered name", element: "E-PAY-01" },
  { id: "remote", label: "Refused remote-access software", element: "E-VER-02" },
  { id: "report", label: "Reported the approach", element: "E-VER-02" },
  { id: "bank", label: "Contacted the institution before transferring", element: "E-PAY-01" },
] as const;

export interface VparInput {
  /** People who met an unfamiliar scenario after coaching. The denominator. */
  retested: number;
  /** Of those, how many performed the required action unprompted. */
  performed: number;
}

export interface Vpar {
  rate: number;
  per10k: number;
  retested: number;
  performed: number;
  /** The sentence that may be said about this number, and nothing stronger. */
  statement: string;
}

export function vpar(i: VparInput): Vpar {
  const rate = i.retested ? i.performed / i.retested : 0;
  return {
    rate,
    per10k: Math.round(rate * 10000),
    retested: i.retested,
    performed: i.performed,
    statement:
      i.retested === 0
        ? "No unfamiliar retest has run, so there is no protective action rate. A rate computed without a retest is a recall score wearing a different name."
        : `${i.performed} of ${i.retested} performed the required action unprompted in a scenario sharing nothing with the one they were coached on — ${Math.round(rate * 1000) / 10}%, or ${Math.round(rate * 10000)} per 10,000. Measured within session; not evidence of durable change.`,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   THE CLAIM LADDER
   ═════════════════════════════════════════════════════════════════════ */

/**
 * What may be said, given what has been measured.
 *
 * The ladder exists because the gap between the first claim and the last one is
 * where this category loses its credibility. "Reduced unsafe decisions in
 * simulated scams" is provable in a quarter. "Reduced actual scam losses"
 * requires linked transaction data and a control cohort, and takes a year.
 * Saying the second while holding evidence for the first is the single most
 * common overstatement in the sector, and it is the one a regulator's
 * economist will find.
 */
export interface ClaimRung {
  n: number;
  id: string;
  claim: string;
  requires: string[];
  /** The specific thing that makes the NEXT claim unavailable at this rung. */
  blocks: string;
}

export const CLAIM_LADDER: ClaimRung[] = [
  {
    n: 1, id: "engagement",
    claim: "N people completed a governed rehearsal, with an evidence-bound record each.",
    requires: ["Completed sessions", "Records produced"],
    blocks: "Says nothing about behaviour. Anybody can complete anything.",
  },
  {
    n: 2, id: "simulated",
    claim: "AUREN reduced unsafe decisions in unfamiliar simulated scams by X% relative to conventional investor education.",
    requires: [
      "A randomised control arm and a conventional-education arm",
      "An unfamiliar scenario at surface distance 4",
      "Improvement stated as both percentage points and relative change",
      "A sample powered to distinguish the effect from chance",
    ],
    blocks:
      "Simulated outcomes only. It does not license any statement about money, because nobody's money was at stake.",
  },
  {
    n: 3, id: "persisted",
    claim: "The reduction was sustained at 90 days.",
    requires: ["The level-2 evidence", "Retest at 30 and 90 days", "Attrition reported, not quietly dropped"],
    blocks:
      "Still simulated. Persistence under rehearsal is not persistence under a real approach with real savings.",
  },
  {
    n: 4, id: "real_action",
    claim: "Rehearsed customers performed more protective actions in real conditions — checks run, transfers abandoned, approaches reported.",
    requires: [
      "Institutional telemetry linked to cohort membership",
      "Consent covering that linkage, captured at enrolment",
      "A control cohort in the same telemetry",
    ],
    blocks:
      "Actions are not outcomes. An abandoned transfer may have been abandoned for other reasons, and the attribution argument moves to the institution's data rather than AUREN's.",
  },
  {
    n: 5, id: "financial",
    claim: "AUREN reduced actual scam-loss events by X% and avoided Y in losses.",
    requires: [
      "Linked transaction outcomes over at least four quarters",
      "A control cohort with matched exposure",
      "Loss categories agreed before the trial, not chosen after",
      "An independent party verifying the calculation",
    ],
    blocks:
      "Nothing above it. This is the claim the commercial case rests on, and it is the one that takes a year and a partner to earn.",
  },
];

export function rung(id: string): ClaimRung | undefined {
  return CLAIM_LADDER.find((r) => r.id === id);
}

/**
 * May this claim be made on this evidence?
 *
 * Deliberately blunt: a claim above the evidence is refused with the specific
 * missing requirement named, because "we need more data" is the answer that
 * gets waved through and "you do not have linked transaction outcomes" is not.
 */
export function claimPermitted(
  evidenceRungId: string,
  claimRungId: string
): { permitted: boolean; reason: string } {
  const have = rung(evidenceRungId);
  const want = rung(claimRungId);
  if (!have || !want) return { permitted: false, reason: "Unknown rung." };
  if (want.n <= have.n) {
    return { permitted: true, reason: `Evidence at rung ${have.n} supports a rung ${want.n} claim.` };
  }
  const missing = CLAIM_LADDER.filter((r) => r.n > have.n && r.n <= want.n)
    .flatMap((r) => r.requires)
    .filter((x, i, a) => a.indexOf(x) === i);
  return {
    permitted: false,
    reason:
      `Rung ${want.n} claimed on rung ${have.n} evidence. Missing: ${missing.join("; ")}. ` +
      `${have.blocks}`,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   THE TRIAL
   ═════════════════════════════════════════════════════════════════════ */

export interface TrialArm {
  id: string;
  label: string;
  receives: string;
  /** What this arm's existence rules out as an explanation for the result. */
  controlsFor: string;
}

export const TRIAL_ARMS: TrialArm[] = [
  {
    id: "control",
    label: "Control",
    receives: "Normal scam information — whatever the institution already sends.",
    controlsFor:
      "Everything happening anyway: campaigns, media coverage, people simply getting more careful. This arm is what lets the attribution factor rise towards 1.",
  },
  {
    id: "conventional",
    label: "Conventional education",
    receives: "Videos and quizzes, the current standard of care.",
    controlsFor:
      "Attention and time-on-task. Without it, any effect is arguably just the hour spent thinking about scams, and that is the objection that matters — it is the cheaper alternative.",
  },
  {
    id: "auren",
    label: "AUREN",
    receives: "Governed interview, rehearsal, coaching and surface-distant retest.",
    controlsFor: "Nothing. This is the treatment.",
  },
];

export const TRIAL_POINTS = ["Immediately", "30 days", "90 days"];

export const TRIAL_MEASURES = [
  "Unsafe-action rate in an unfamiliar scenario",
  "Independent verification rate",
  "Time to first verification step",
  "Resistance sustained across escalating pressure",
  "Reporting behaviour",
  "Confidence calibration — whether certainty tracks correctness",
  "Repeat-victimisation indicators",
  "Actual suspicious-payment outcomes, where bank data permits",
];

/**
 * Confidence calibration deserves a note, because it is the measure most often
 * left out and the one most likely to embarrass a programme that omits it.
 *
 * An intervention can raise confidence without raising competence, and a
 * confident victim transfers faster than an uncertain one. A programme that
 * moves confidence and not behaviour has produced harm, and it will report as a
 * success on every other measure in the list.
 */
export const CALIBRATION_WARNING =
  "Confidence must be measured alongside competence. An intervention that raises confidence without raising competence produces a customer who transfers faster, and it scores as a success on every other measure here.";
