/**
 * The demo client organisation and its language banks.
 *
 * Synthetic throughout. The shape mirrors §13 of the Concept Paper: a company
 * whose management believes "the departments are not collaborating", where the
 * real finding is that trust inside departments is fine and the failure is at
 * the handover, the decision rights and the shared measures.
 */

import type { RoleLevel, TenureBand, WorkArrangement } from "./tif/types";

export const ORGANISATION = "Meridian Group";
export const ORG_CONTEXT =
  "Logistics & customer operations · 312 employees · 7 departments · Kuala Lumpur, Penang, Johor";

export interface DepartmentSpec {
  id: string;
  name: string;
  /** How many of the assessed population sit here. */
  n: number;
  /** Per-construct offsets on the 1–5 Likert scale. */
  offsets: Partial<Record<string, number>>;
}

/**
 * Baseline org-wide means on the 1–5 climate scale. Chosen so the profile
 * spans all four descriptive levels — a real diagnosis is never uniformly bad.
 */
export const BASE_CLIMATE: Record<string, number> = {
  psychSafety: 2.9,
  trust: 3.8,
  roleClarity: 3.2,
  goalAlignment: 3.3,
  collaboration: 2.75,
  conflict: 3.35,
  leadershipOpenness: 3.45,
  inclusion: 3.9,
  accountability: 3.5,
  resilience: 4.15,
};

export const DEPARTMENTS: DepartmentSpec[] = [
  {
    id: "ops",
    name: "Operations",
    n: 22,
    offsets: { collaboration: -0.35, roleClarity: -0.4, resilience: 0.2 },
  },
  {
    id: "sales",
    name: "Sales",
    n: 16,
    offsets: { goalAlignment: -0.5, collaboration: -0.25, resilience: 0.25 },
  },
  {
    id: "cs",
    name: "Customer Service",
    n: 15,
    offsets: { psychSafety: -0.45, collaboration: -0.3, inclusion: -0.2 },
  },
  {
    id: "fin",
    name: "Finance",
    n: 11,
    offsets: { psychSafety: -0.3, conflict: -0.25, accountability: 0.3 },
  },
  {
    id: "mkt",
    name: "Marketing",
    n: 9,
    offsets: { roleClarity: -0.2, goalAlignment: -0.3, inclusion: 0.2 },
  },
  {
    id: "it",
    name: "IT & Systems",
    n: 6,
    offsets: { roleClarity: -0.5, leadershipOpenness: -0.2 },
  },
  {
    // Deliberately below MIN_SEGMENT_N — the dashboard must suppress it.
    id: "legal",
    name: "Legal & Compliance",
    n: 3,
    offsets: {},
  },
];

export const TOTAL_INVITED = 96;

export const ROLE_LEVELS: RoleLevel[] = [
  "Executive",
  "Senior manager",
  "Manager",
  "Team lead",
  "Individual contributor",
];

/** Roughly pyramid-shaped: index into ROLE_LEVELS by weighted draw. */
export const ROLE_WEIGHTS = [2, 7, 14, 22, 55];

export const TENURES: TenureBand[] = ["<1 year", "1–3 years", "3–7 years", "7+ years"];
export const ARRANGEMENTS: WorkArrangement[] = ["Onsite", "Hybrid", "Remote"];

export const LANGUAGES = ["English", "Bahasa Melayu", "中文", "தமிழ்"];

/* ============================================================
   Language banks — what participants actually say.
   Written so each fragment carries the behavioural cues the scorer looks for,
   at different densities, and reads as a usable anonymised quote.
   ============================================================ */

/** Keyed by the construct the participant scores lowest on. */
export const CONCERN_LINES: Record<string, string[]> = {
  psychSafety: [
    "In the meeting I could see the plan would not work, but I did not say anything because the decision had already come from above.",
    "People here will tell you in the corridor what they will not say in the room. My concern is that we lose the useful information.",
    "When someone raised a mistake last quarter it was handled badly, so now everyone waits until it is unavoidable.",
  ],
  trust: [
    "I build two extra days into every plan because I cannot rely on the handover arriving complete, and that has become normal.",
    "The commitment was made in the meeting and then nothing happened, so we chase it ourselves.",
    "We do the same check twice because we assume the other side has not done it.",
  ],
  roleClarity: [
    "The work sat for nine days because nobody knew who was supposed to sign off, and I only found out by asking three people.",
    "I am making decisions that I do not think are mine to make, and nobody has told me otherwise.",
    "When I escalate I am not sure whether I am going to the right person or just annoying someone.",
  ],
  goalAlignment: [
    "My target is volume and their target is margin, so when I ask for help I am asking them to miss their own number.",
    "Each department is doing exactly what it is measured on. That is the problem, not the effort.",
    "We agree on the customer outcome in the room and then go back to conflicting KPIs.",
  ],
  collaboration: [
    "Inside my team it works well. The moment it crosses to another department, the request disappears and I have to chase.",
    "The handover to operations has no agreed standard, so half of what we send back is rework.",
    "I have a good relationship with my own team, but I do not know who to call in finance and I do not think they know me either.",
  ],
  conflict: [
    "We do not really argue here. We just go quiet and then the issue comes back three weeks later as a delay.",
    "The disagreement never gets resolved, it gets avoided, and then it turns into a workaround.",
    "Two people have been in dispute for months and everyone works around it instead of naming it.",
  ],
  leadershipOpenness: [
    "We are asked for input after the decision is made, so people have stopped putting effort into the response.",
    "I cannot remember an example where feedback from my level visibly changed a decision.",
    "The explanation usually comes as an announcement, not as a reason.",
  ],
  inclusion: [
    "The same three people speak in every meeting and the rest of us have learned to wait it out.",
    "My suggestion was repeated by someone senior ten minutes later and that version was the one that was adopted.",
    "New joiners do not speak for their first six months here, and we lose their perspective.",
  ],
  accountability: [
    "We agree actions and nobody looks at them again until the next workshop.",
    "When something is not delivered, we talk about it once and move on. There is no review.",
    "Follow-through depends entirely on who owns it. Some people you can rely on, some you cannot.",
  ],
  resilience: [
    "The requirement changed three days out and we absorbed it by working the weekend rather than re-planning.",
    "When it gets busy people go into their own silo and stop talking to each other.",
    "We recover, but the cost lands on the same few people every time.",
  ],
};

export const STRENGTH_LINES = [
  "Inside my own team, people help each other without being asked.",
  "We are good in a crisis. When something breaks, everyone moves.",
  "My manager is honest with us, even when the news is not good.",
  "People here care about the customer, not just their own function.",
  "We recover from setbacks quickly and without blaming each other.",
];

export const PRIORITY_LINES = [
  "make it clear who owns each handover",
  "publish who decides what, so work stops sitting",
  "give departments one shared measure for the customer outcome",
  "make it normal to disagree in the room instead of afterwards",
  "review agreed actions in public so follow-through is visible",
  "protect the first thirty minutes of any change for re-planning",
];

export const ACTION_LINES = [
  "I will ask the question in the meeting instead of after it.",
  "I will write down what a complete handover looks like for my part.",
  "I will bring one blocked item to my manager with a proposal, not a complaint.",
  "I will invite the two quietest people in my team to speak first.",
  "I will close out my own open actions before adding new ones.",
];

/**
 * Scenario response fragments, one bank per Layer-1 capability, ordered from
 * no evidence (0) to consistently effective (4). Each step adds one more
 * observable behaviour, so a participant's answer carries exactly as much
 * evidence as their generated capability tier — which is what makes the
 * capability distribution on the dashboard non-degenerate.
 */
export const CAP_FRAGMENTS: Record<string, string[]> = {
  communication: [
    "I would just deal with it and move on.",
    "I explained the situation to them.",
    "I explained what happened, in the order it happened.",
    "I explained what happened and the impact it had on the customer.",
    "To be clear, I explained what happened and the impact on the customer, and I asked them to confirm they had the same picture.",
  ],
  empathy: [
    "Honestly that is their problem to solve.",
    "They were short-handed that week.",
    "They were short-handed, and from their side the request probably looked minor.",
    "They were under pressure that week, and from their side the request looked minor.",
    "They were under pressure, and from their side it looked minor — I understand why it slipped, given their workload.",
  ],
  assertiveness: [
    "I let it go rather than turn it into an issue.",
    "I told them it was not workable.",
    "I told them it was not workable and I raised it in the team meeting.",
    "I told them it was not workable, I raised it in the meeting, and my concern was the delivery date.",
    "I told them it was not workable, I raised it in the meeting with my concern about the delivery date, and I said I would escalate if nothing moved.",
  ],
  problemSolving: [
    "I would wait and see what happens.",
    "We agreed to look at it again.",
    "We agreed a next step before we left the room.",
    "We agreed a next step with a named owner before we left the room.",
    "I would propose two options, and we agreed a next step with a named owner rather than treating the symptom instead of the actual problem.",
  ],
  criticalThinking: [
    "It is fairly obvious what went wrong.",
    "It depends on what the customer actually needs.",
    "It depends on what the customer needs, and I checked the record before deciding.",
    "It depends on the customer's need, and I checked the record rather than assume the usual cause.",
    "I checked the record rather than assume the usual cause, and the evidence pointed the other way unless the volumes had changed.",
  ],
  stress: [
    "I would push through and work later to catch up.",
    "I would step back before answering.",
    "I would step back, then prioritise what actually has to ship this week.",
    "I would step back, prioritise what has to ship and defer the rest.",
    "I would step back, prioritise what has to ship, defer the rest, and re-plan it with the team calmly rather than reacting.",
  ],
};

export const CAP_IDS = Object.keys(CAP_FRAGMENTS);

/**
 * Per-capability tier bias. Deliberately coherent with the climate picture:
 * assertiveness is weakest where psychological safety is weakest, and stress
 * handling is strongest where collective resilience is the established
 * strength. A diagnosis whose two layers contradict each other is a bug.
 */
export const CAP_BIAS: Record<string, number> = {
  communication: 0.5,
  empathy: -0.2,
  assertiveness: -1.0,
  problemSolving: 0.1,
  criticalThinking: -0.4,
  stress: 0.9,
};

/** Deterministic string hash — same idea as the DENGAR seed. */
export function hash(str: string): number {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Deterministic pseudo-random in [0,1) from a seed integer. */
export function rnd(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
