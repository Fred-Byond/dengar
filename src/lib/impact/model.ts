/**
 * AUREN — the avoided-loss model.
 *
 *   Annual avoided loss = L × A × C × R × F
 *
 *   L  baseline annual losses in the market or customer population
 *   A  share of those losses AUREN can plausibly address
 *   C  share of the target population actually reached
 *   R  measured reduction in unsafe behaviour or loss within the reached group
 *   F  attribution factor, so AUREN is not credited with everything
 *
 * TWO CORRECTIONS THIS FILE MAKES TO THE FORMULA AS USUALLY STATED.
 *
 * 1 · A POINT ESTIMATE IMPLIES A PRECISION THE INPUTS DO NOT HAVE.
 *
 * Five fractions multiplied together compound their uncertainty. If each of the
 * four shares is known only to ±30% of its own value — generous, early in a
 * deployment — the product is uncertain by roughly a factor of two in each
 * direction. Reporting "RM11.2m" from those inputs is not conservative, it is
 * false precision, and it is the number a sceptical CFO will attack first.
 * So the model returns a range and labels the midpoint as a midpoint.
 *
 * 2 · F IS DOUBLE-DISCOUNTING ONCE R COMES FROM A CONTROL GROUP.
 *
 * The attribution factor exists because some of the improvement would have
 * happened anyway — awareness campaigns, media coverage, the bank's own
 * warnings, people simply getting more careful. That is exactly what a control
 * arm measures and removes. So:
 *
 *   R from a pre/post comparison with no control  → F belongs, and belongs low.
 *   R from a randomised control arm               → the counterfactual is
 *                                                   already netted out, and
 *                                                   applying F again halves a
 *                                                   result that was already
 *                                                   net of it.
 *
 * Under-claiming looks safe and is not free: a programme that reports half its
 * real effect gets funded at half its real value, and the next renewal is argued
 * against the smaller number. The model therefore takes the evidence grade as
 * an input and says what F should be, rather than letting a spreadsheet carry
 * 50% forever out of habit.
 */

import type { MarketBaseline } from "./baselines";
import { baseline, money } from "./baselines";

/* ═══════════════════════════════════════════════════════════════════════
   HOW R WAS MEASURED — which decides what F may be
   ═════════════════════════════════════════════════════════════════════ */

export type EvidenceGrade =
  | "assumed"          // nothing measured yet; a planning figure
  | "pre_post"         // measured, no control arm
  | "controlled"       // randomised control arm, simulated outcomes
  | "controlled_real"; // randomised control arm, linked real transaction outcomes

export interface AttributionGuidance {
  grade: EvidenceGrade;
  /** What F should be at this grade, and why. */
  suggested: number;
  rationale: string;
}

export const ATTRIBUTION: AttributionGuidance[] = [
  {
    grade: "assumed",
    suggested: 0.4,
    rationale:
      "Nothing has been measured. F is doing the work of an error bar, and the figure is a planning assumption that must never leave the room described as a result.",
  },
  {
    grade: "pre_post",
    suggested: 0.5,
    rationale:
      "Improvement measured without a control arm, so it contains everything else that was happening — campaigns, coverage, the institution's own warnings. Half is the conventional haircut and it is a guess about the size of the counterfactual.",
  },
  {
    grade: "controlled",
    suggested: 0.9,
    rationale:
      "A randomised control arm already removes what would have happened anyway. Applying a further 50% discounts the counterfactual twice. The residual 10% covers spillover between arms and the gap between a simulated outcome and a real one.",
  },
  {
    grade: "controlled_real",
    suggested: 1.0,
    rationale:
      "Control arm plus linked transaction outcomes. The counterfactual is measured and the outcome is the real thing, so there is nothing left for an attribution factor to correct. Discounting here is not caution, it is discarding evidence that was expensive to obtain.",
  },
];

export function attributionFor(grade: EvidenceGrade): AttributionGuidance {
  return ATTRIBUTION.find((a) => a.grade === grade) ?? ATTRIBUTION[0];
}

/* ═══════════════════════════════════════════════════════════════════════
   INPUTS
   ═════════════════════════════════════════════════════════════════════ */

export interface ImpactInputs {
  /** Market code, or "CUSTOM" when L is supplied directly (a bank's own book). */
  market: string;
  /** Overrides the market baseline. Set for an institutional loss book. */
  lossOverride?: number;
  currencyOverride?: string;
  /** Share of L in categories AUREN addresses. */
  addressable: number;
  /** Share of the target population reached. */
  coverage: number;
  /** Measured reduction within the reached group. */
  reduction: number;
  /** How `reduction` was established. Decides the attribution guidance. */
  grade: EvidenceGrade;
  /** Applied attribution. Defaults to the guidance for the grade. */
  attribution?: number;
  /**
   * Relative uncertainty on each share, as a fraction of its own value.
   * 0.3 = each input known to ±30%. Compounds through the product.
   */
  uncertainty?: number;
}

export interface ImpactResult {
  ok: boolean;
  /** Set when the market has no defensible baseline. */
  refusal?: string;
  currency: string;
  /** Midpoint. Never present it without the range. */
  central: number;
  low: number;
  high: number;
  /** 1% of the market baseline — the headline this model exists to replace. */
  naive: number | null;
  attribution: number;
  guidance: AttributionGuidance;
  /** The chain, for showing the working. */
  steps: Array<{ label: string; value: string }>;
  caveats: string[];
}

export function computeImpact(inp: ImpactInputs): ImpactResult {
  const b: MarketBaseline | undefined = baseline(inp.market);
  const L = inp.lossOverride ?? b?.annualLoss ?? null;
  const currency = inp.currencyOverride ?? b?.currency ?? "USD";

  if (L === null) {
    return {
      ok: false,
      refusal:
        `${b ? b.label : inp.market} has no defensible aggregate loss figure, so no avoided loss can be computed for it. ` +
        `Incident counts and warning lists are not loss ledgers, and scaling a figure from another market is the thing that ends the conversation with the first regulator who asks where it came from. ` +
        (b?.establishWith.length
          ? `Establish a baseline from: ${b.establishWith.join("; ")}.`
          : "Establish a baseline before modelling."),
      currency,
      central: 0,
      low: 0,
      high: 0,
      naive: null,
      attribution: 0,
      guidance: attributionFor(inp.grade),
      steps: [],
      caveats: [],
    };
  }

  const guidance = attributionFor(inp.grade);
  const F = inp.attribution ?? guidance.suggested;
  const u = inp.uncertainty ?? 0.3;

  const central = L * inp.addressable * inp.coverage * inp.reduction * F;
  /* Four shares, each uncertain by ±u of its own value. Compounding them is
     what turns a comfortable ±30% per input into a factor of two overall —
     which is the honest width, not a pessimistic one. */
  const lowMul = Math.pow(1 - u, 4);
  const highMul = Math.pow(1 + u, 4);

  const caveats: string[] = [];
  if (b?.status === "survey_estimate") {
    caveats.push(
      `The baseline is a survey extrapolation, not an audited loss record. It carries market context well and should not be the denominator of a contractual savings claim.`
    );
  }
  if (b?.status === "published") {
    caveats.push(
      `The baseline is reported losses, so it is a floor — under-reporting in this category is heavy and systematic, and the true pool is larger.`
    );
  }
  if (inp.grade === "assumed") {
    caveats.push(
      `Nothing here has been measured. This is a planning figure and must not leave the room described as a result.`
    );
  }
  if (inp.attribution !== undefined && inp.grade === "controlled" && inp.attribution < 0.7) {
    caveats.push(
      `Attribution is set to ${Math.round(inp.attribution * 100)}% against a controlled measurement. The control arm already removed the counterfactual, so this discounts it twice and argues the next renewal against half the real number.`
    );
  }

  return {
    ok: true,
    currency,
    central,
    low: central * lowMul,
    high: central * highMul,
    naive: L * 0.01,
    attribution: F,
    guidance,
    steps: [
      { label: "L · baseline losses", value: money(L, currency) },
      { label: "A · addressable share", value: `${Math.round(inp.addressable * 100)}%` },
      { label: "C · population reached", value: `${Math.round(inp.coverage * 100)}%` },
      { label: "R · reduction in reached group", value: `${Math.round(inp.reduction * 100)}%` },
      { label: "F · attribution", value: `${Math.round(F * 100)}%` },
    ],
    caveats,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   SCENARIOS
   ═════════════════════════════════════════════════════════════════════ */

export interface ImpactScenario {
  id: string;
  label: string;
  note: string;
  inputs: Omit<ImpactInputs, "market">;
}

/**
 * Three shapes of deployment. Scenario models, not forecasts — the assumptions
 * are placeholders for deployment evidence and are labelled as such everywhere
 * they surface.
 */
export const IMPACT_SCENARIOS: ImpactScenario[] = [
  {
    id: "pilot",
    label: "Conservative pilot",
    note: "One institution, one cohort, one scam family. The figure that should appear in a first proposal.",
    inputs: { addressable: 0.3, coverage: 0.05, reduction: 0.05, grade: "assumed", attribution: 0.4 },
  },
  {
    id: "national",
    label: "National institutional rollout",
    note: "Several institutions, a measured reduction, no control arm yet.",
    inputs: { addressable: 0.4, coverage: 0.2, reduction: 0.1, grade: "pre_post", attribution: 0.5 },
  },
  {
    id: "scaled",
    label: "Scaled national programme",
    note: "Population coverage with a controlled trial behind the reduction — which is what lets attribution rise.",
    inputs: { addressable: 0.5, coverage: 0.5, reduction: 0.15, grade: "controlled", attribution: 0.9 },
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   INSTITUTIONAL VALUE — the layer a bank actually buys on
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Direct avoided loss is the first layer and usually the smallest. The others
 * are why a fraud-prevention budget signs rather than a marketing one.
 *
 * Each carries how it is evidenced, because a benefit that cannot be measured
 * from the institution's own systems is a benefit that will be argued away at
 * renewal by somebody who was not in the original room.
 */
export interface ValueLayer {
  id: string;
  label: string;
  note: string;
  /** Where the number comes from in the institution's own data. */
  evidencedBy: string;
}

export const VALUE_LAYERS: ValueLayer[] = [
  {
    id: "direct",
    label: "Scam losses prevented",
    note: "Transfers abandoned, deposits not made, credentials not disclosed.",
    evidencedBy: "Loss book by category, before and after, with the control cohort alongside.",
  },
  {
    id: "reimbursement",
    label: "Reimbursement exposure reduced",
    note: "Where the institution refunds, a prevented scam is a direct saving rather than a customer's saving.",
    evidencedBy: "Reimbursement ledger. The cleanest line in the whole case, because it is already denominated in the institution's own money.",
  },
  {
    id: "operational",
    label: "Investigation and contact-centre cost",
    note: "Fewer fraud calls, shorter investigations, better-quality incident reports when one does occur.",
    evidencedBy: "Case handling time and call volumes on fraud lines, per 10,000 customers.",
  },
  {
    id: "complaints",
    label: "Complaints and ombudsman workload",
    note: "Fewer disputes, and a stronger position in the ones that remain.",
    evidencedBy: "Complaint volumes and outcomes, with rehearsal records attached to the defended cases.",
  },
  {
    id: "regulatory",
    label: "Demonstrable preventive action",
    note:
      "Evidence that the institution acted before the loss — auditable completion, evidence-bound competency records, consistent approved messaging.",
    evidencedBy: "The Investor Readiness Records themselves, which is what makes this layer unusual: the evidence is the product.",
  },
  {
    id: "social",
    label: "Customer and social value",
    note: "Retained savings, reduced emotional harm, higher willingness to report, less repeat victimisation.",
    evidencedBy:
      "Not monetisable honestly. It belongs in a government procurement case and should stay out of an ROI ratio, because a number invented here contaminates the ones that were real.",
  },
];
