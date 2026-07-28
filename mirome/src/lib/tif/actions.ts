/**
 * The first-30-days board.
 *
 * A dashboard that ends at "psychological safety is 54" has done half a job.
 * The buyer's question is "what do I do on Monday, who does it, what does it
 * cost me, and how will I know it worked" — and every one of those is
 * derivable from the diagnosis we already hold, so none of it should be left
 * to a consultant's judgement in a follow-up meeting.
 *
 * Each action carries five things, and refuses to exist without them:
 *   · a named owner role — not "the business"
 *   · an effort and cost band — so it can be approved, not just admired
 *   · the evidence it answers — the construct, the index, the affected share
 *   · the expected move and the wave it is measured at
 *   · a "do not do this instead" — the plausible wrong move it displaces
 *
 * Two classes, deliberately separated:
 *   IMMEDIATE  — management can start inside 30 days without a programme.
 *                Costs little. This is what makes the platform worth paying
 *                for even if the workshop is never booked.
 *   PROGRAMME  — needs the facilitated intervention. Priced, scheduled.
 */

import { INTERVENTION_BY_CONSTRUCT } from "./interventions";
import { CONSTRUCT_OWNER, OWNERS } from "./taxonomy";
import type { Confidence, InterventionPriority } from "./types";

export type ActionClass = "immediate" | "programme";
export type EffortBand = "hours" | "days" | "weeks";
export type CostBand = "none" | "low" | "medium" | "high";

export interface Action {
  id: string;
  class: ActionClass;
  constructId: string;
  constructName: string;
  /** Imperative, specific, and doable by one named role. */
  title: string;
  /** What actually changes in how the company runs. */
  detail: string;
  /** The finding this answers, quoted from the diagnosis. */
  becauseOf: string;
  ownerId: string;
  ownerName: string;
  /** Who has to say yes before it starts. */
  approver: string;
  effort: EffortBand;
  cost: CostBand;
  /** Index points on the construct, at the stated wave. */
  expectedMove: string;
  measure: string;
  /** The obvious-but-wrong move this displaces. */
  insteadOf: string;
  confidence: Confidence;
  /** Share of participants affected, carried through for sequencing. */
  affectedShare: number;
}

const OWNER_NAME: Record<string, string> = Object.fromEntries(
  OWNERS.map((o) => [o.id, o.name])
);

/**
 * The management move that does not need a facilitator.
 *
 * These are deliberately small. A company that is told "run a culture
 * programme" does nothing; a company told "publish the decision rights for
 * the three handovers that stalled" does it that week — and the doing is what
 * makes the 30-day re-measure meaningful.
 */
const IMMEDIATE: Record<
  string,
  { title: string; detail: string; approver: string; effort: EffortBand; cost: CostBand; measure: string; insteadOf: string }
> = {
  psychSafety: {
    title: "Leaders answer the three hardest questions from this survey, in public",
    detail:
      "Take the three lowest-rated statements and have the executive committee respond to each in an all-hands — what they accept, what they dispute, and what they will change. No anonymous Q&A, no written memo.",
    approver: "CEO",
    effort: "hours",
    cost: "none",
    measure: "Psychological safety index at day 30, plus whether staff can name one thing leadership changed",
    insteadOf: "Running a values workshop. People do not doubt the values; they doubt what happens when they speak.",
  },
  trust: {
    title: "Publish what happened to the last three decisions people were consulted on",
    detail:
      "For each, state the input received, the decision taken, and why. Where the input was not followed, say so plainly. Distribute to everyone who was consulted.",
    approver: "Department head",
    effort: "hours",
    cost: "none",
    measure: "Trust index at day 30; consultation-to-decision publication becomes standing practice",
    insteadOf: "A trust-building offsite. Trust is repaired by visible follow-through, not by activities.",
  },
  roleClarity: {
    title: "Write down who owns each handover between the two departments that collide most",
    detail:
      "One page per handover: who produces it, who accepts it, what 'complete' means, and who decides when the two disagree. Signed by both department heads, circulated to both teams.",
    approver: "Operations / PMO",
    effort: "days",
    cost: "low",
    measure: "Role clarity index at day 30; rework volume on those handovers",
    insteadOf: "Redrawing the org chart. The reporting lines are not the problem; the undefined seams between them are.",
  },
  goalAlignment: {
    title: "Put every department's top three priorities on one page and circulate it",
    detail:
      "Where two departments' priorities are in direct conflict, name the conflict on the page rather than resolving it privately. The executive committee then arbitrates in the open.",
    approver: "Executive committee",
    effort: "days",
    cost: "none",
    measure: "Goal alignment index at day 30; number of named conflicts resolved with a stated decision",
    insteadOf: "Rewriting the strategy. Staff can usually recite the strategy; they cannot reconcile it with their targets.",
  },
  collaboration: {
    title: "Give the two worst-scoring departments one shared measure for the quarter",
    detail:
      "A single number both are accountable for, reported jointly, reviewed by both heads in the same meeting. It must be a measure neither can move alone.",
    approver: "Executive committee",
    effort: "days",
    cost: "low",
    measure: "Collaboration index at day 30 and day 60 in those two departments specifically",
    insteadOf: "A team-building day between the departments. Shared incentives outlast shared activities.",
  },
  conflict: {
    title: "Agree a disagreement protocol and use it in the next leadership meeting",
    detail:
      "Three steps, written down: state the disagreement, state what evidence would change your mind, name who decides if it stays unresolved. Leadership uses it first, visibly.",
    approver: "Executive committee",
    effort: "hours",
    cost: "none",
    measure: "Constructive conflict index at day 30; whether staff can describe the protocol",
    insteadOf: "Conflict-resolution training for staff. The behaviour is learned from what leaders model in meetings.",
  },
  leadershipOpenness: {
    title: "Every manager holds one listening round where they may only ask questions",
    detail:
      "Twenty minutes, no defending, no explaining, no solutioning. Manager writes down what they heard and circulates it to the team within 48 hours for correction.",
    approver: "HR Business Partner",
    effort: "hours",
    cost: "none",
    measure: "Leadership openness index at day 30; completion rate across managers",
    insteadOf: "An engagement survey action plan. Another survey is exactly what low openness scores predict will be ignored.",
  },
  inclusion: {
    title: "Check who is in the room for the decisions that matter",
    detail:
      "List the standing meetings where real decisions are made and who attends. Compare against the segments scoring lowest on inclusion. Change the invitations, not the messaging.",
    approver: "HR Business Partner",
    effort: "days",
    cost: "none",
    measure: "Inclusion index at day 30 in the affected segments specifically",
    insteadOf: "An inclusion awareness campaign. Belonging follows access to decisions, not communication about belonging.",
  },
  accountability: {
    title: "Review the last set of agreed actions in public before agreeing any new ones",
    detail:
      "Standing first item on the leadership agenda: every action from last cycle, marked done, dropped or slipped, with the reason. Nothing new is agreed until the previous list is accounted for.",
    approver: "CEO",
    effort: "hours",
    cost: "none",
    measure: "Accountability index at day 30; share of prior actions closed rather than carried",
    insteadOf: "A new tracking tool. The list is not the problem; reviewing it in front of people is.",
  },
  resilience: {
    title: "Run a fifteen-minute review after the next change that lands badly",
    detail:
      "Three questions: what did we know and when, what did we not tell people, what will we do differently next time. Published to the affected team, not filed.",
    approver: "Organisational Development",
    effort: "hours",
    cost: "low",
    measure: "Collective resilience index at day 60; whether the next change lands better",
    insteadOf: "Resilience training for individuals. This is an organisational capability, not a personal one.",
  },
};

const EFFORT_ORDER: Record<EffortBand, number> = { hours: 0, days: 1, weeks: 2 };

/** Expected movement, scaled to how much room the construct has and how much of the org is affected. */
function expectedMove(p: InterventionPriority, isImmediate: boolean): string {
  const headroom = Math.max(0, 100 - p.index);
  const base = isImmediate ? 0.08 : 0.16;
  const scaled = headroom * base * (0.6 + p.affectedShare / 100);
  const lo = Math.max(1, Math.round(scaled * 0.6));
  const hi = Math.max(lo + 2, Math.round(scaled * 1.4));
  const wave = isImmediate ? "day 30" : "day 60";
  return `+${lo} to +${hi} index points by ${wave}`;
}

/**
 * Build the board from the ranked priorities.
 *
 * Only constructs that are actually in the priority band get an action. A
 * board of ten items is a board nobody works, so this returns the top three
 * immediate moves and the top two programme blocks by default.
 */
export function firstActions(
  priorities: InterventionPriority[],
  opts: { immediate?: number; programme?: number } = {}
): Action[] {
  const nImmediate = opts.immediate ?? 3;
  const nProgramme = opts.programme ?? 2;

  const immediate: Action[] = priorities
    .filter((p) => IMMEDIATE[p.constructId])
    .slice(0, nImmediate)
    .map((p) => {
      const spec = IMMEDIATE[p.constructId];
      const ownerId = CONSTRUCT_OWNER[p.constructId] ?? "hrbp";
      return {
        id: `now-${p.constructId}`,
        class: "immediate" as const,
        constructId: p.constructId,
        constructName: p.constructName,
        title: spec.title,
        detail: spec.detail,
        becauseOf: p.finding,
        ownerId,
        ownerName: OWNER_NAME[ownerId] ?? ownerId,
        approver: spec.approver,
        effort: spec.effort,
        cost: spec.cost,
        expectedMove: expectedMove(p, true),
        measure: spec.measure,
        insteadOf: spec.insteadOf,
        confidence: p.confidence,
        affectedShare: p.affectedShare,
      };
    });

  const programme: Action[] = priorities
    .slice(0, nProgramme)
    .map((p) => {
      const iv = INTERVENTION_BY_CONSTRUCT[p.constructId];
      const ownerId = "facilitator";
      return {
        id: `prog-${p.constructId}`,
        class: "programme" as const,
        constructId: p.constructId,
        constructName: p.constructName,
        title: iv ? iv.objective : `Facilitated block on ${p.constructName.toLowerCase()}`,
        detail: iv ? `${iv.format}. ${iv.activities.slice(0, 2).join("; ")}.` : "",
        becauseOf: p.finding,
        ownerId,
        ownerName: OWNER_NAME[ownerId] ?? ownerId,
        approver: "HR / budget holder",
        effort: "weeks" as const,
        cost: "medium" as const,
        expectedMove: expectedMove(p, false),
        measure: iv ? iv.measure : `${p.constructName} index at day 60`,
        insteadOf:
          "A generic team-building day. The activity is chosen from the diagnosis, or the enthusiasm fades by day 30 and nothing else changes.",
        confidence: p.confidence,
        affectedShare: p.affectedShare,
      };
    })
    .filter((a) => Boolean(a.detail));

  return [...immediate, ...programme].sort((a, b) => {
    if (a.class !== b.class) return a.class === "immediate" ? -1 : 1;
    return EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort];
  });
}

export interface AudienceSpec {
  id: string;
  name: string;
  /** Why this person opens the dashboard at all. */
  reads: string;
  /** What they are accountable for once they have. */
  decides: string;
  /** What they must never be given, so the instrument stays trusted. */
  neverSees: string;
}

/**
 * Who should look at this.
 *
 * Named explicitly because the most common failure of an engagement platform
 * is that the report goes to HR, HR forwards it to everyone, nobody owns a
 * decision, and the next cycle has lower participation because staff saw
 * nothing change.
 */
export const AUDIENCES: AudienceSpec[] = [
  {
    id: "ceo",
    name: "CEO / Managing Director",
    reads: "The three perception bands and the direction of travel. Nothing below that.",
    decides:
      "Which single constraint the company works on this quarter, and says so publicly. Approves the two actions that only a CEO can authorise.",
    neverSees: "Individual records, department league tables used for ranking, or anything attributable to a person.",
  },
  {
    id: "chro",
    name: "CHRO / Head of HR",
    reads: "Priorities, perception gap, segments, and the human-review queue.",
    decides:
      "Owns the board: assigns each action, holds the owner to the date, and publishes back to participants what changed.",
    neverSees: "Transcripts. Only the trained reviewer opens a flagged session, and only the flagged one.",
  },
  {
    id: "head",
    name: "Department head",
    reads: "Their own department against the organisation, and the perception gap between their view and their team's.",
    decides:
      "The handover, decision-rights and consultation fixes inside their own department. The gap is theirs to close, not HR's.",
    neverSees: "Other departments' detail, or any view that lets them identify who in their team said what.",
  },
  {
    id: "facilitator",
    name: "Programme facilitator",
    reads: "The Facilitator Intelligence Pack — evidence base, priority findings, anonymised voices, group composition.",
    decides: "The programme design. Which blocks run, in what order, with which prompts.",
    neverSees: "Named participants, or any data outside the engagement they are delivering.",
  },
  {
    id: "reviewer",
    name: "Trained welfare reviewer",
    reads: "Only sessions the pipeline flagged for welfare, safety or a named-individual disclosure.",
    decides: "Escalation under the organisation's existing duty-of-care process.",
    neverSees: "Aggregate dashboards. The review role is separated from the analytics role on purpose.",
  },
];
