/**
 * TIF construct rubrics — §8 of the Concept Paper, encoded as data so the
 * digital-human interview, the scorer, the dashboards and the facilitator pack
 * all read from one source.
 *
 * Every construct stays VISIBLE in reporting. The platform deliberately does
 * NOT produce a single universal "team score" (§4.3).
 */

import type { ConstructLevel } from "./types";

export interface RubricAnchor {
  score: string; // "5", "3", "NE", …
  label: string;
  anchor: string;
}

/** Layer 1 — individual workplace capability. */
export interface CapabilitySpec {
  id: string;
  name: string;
  /** The organisational question this capability answers. */
  purpose: string;
  /** Observable behaviours the scorer looks for in the transcript. */
  markers: string[];
  anchors: RubricAnchor[];
}

/** Layer 2 — team climate condition. */
export interface ClimateSpec {
  id: string;
  name: string;
  purpose: string;
  /** The confidential pulse item (1 = strongly disagree, 5 = strongly agree). */
  pulseItem: string;
  /** What the digital human probes when the pulse item scores low. */
  probe: string;
  /** Plain-language reading of a weak result — the diagnosis, not the symptom. */
  weakFinding: string;
  strongFinding: string;
}

/* ============================================================
   Shared 1–5 behavioural anchor set for Layer 1
   ============================================================ */

function anchors(
  five: string,
  four: string,
  three: string,
  two: string,
  one: string
): RubricAnchor[] {
  return [
    { score: "5", label: "Consistently effective", anchor: five },
    { score: "4", label: "Effective", anchor: four },
    { score: "3", label: "Developing", anchor: three },
    { score: "2", label: "Limited", anchor: two },
    { score: "1", label: "Not evidenced", anchor: one },
    {
      score: "NE",
      label: "Not elicited",
      anchor: "The session did not create a fair opportunity to demonstrate this capability.",
    },
    {
      score: "IE",
      label: "Insufficient evidence",
      anchor: "Response too short, unclear or technically degraded to score fairly.",
    },
  ];
}

export const COMMUNICATION: CapabilitySpec = {
  id: "communication",
  name: "Communication effectiveness",
  purpose:
    "Can the person make a work issue understandable to a colleague who was not there? This is NOT a language-proficiency or presentation score.",
  markers: [
    "Relevance to the question asked",
    "Structure and sequence of the account",
    "Clarification when the situation is ambiguous",
    "Repair when a message has been misunderstood",
    "Constructive framing rather than blame",
  ],
  anchors: anchors(
    "Explains the situation, the impact and what is needed in a clear sequence, checks understanding and repairs misunderstanding without prompting.",
    "Explains the situation and impact clearly; one element (context, need or check-back) is left implicit.",
    "The main point is identifiable but the listener must reconstruct the sequence or the ask.",
    "Fragmented account; the issue or the request has to be inferred.",
    "No workable account of the issue is provided."
  ),
};

export const EMPATHY: CapabilitySpec = {
  id: "empathy",
  name: "Empathy and perspective-taking",
  purpose:
    "Does the person recognise the position, constraints and impact on others before deciding how to act?",
  markers: [
    "Names the other party's constraint or pressure",
    "Distinguishes intent from impact",
    "Responds to the person as well as the task",
    "Considers downstream effect on other teams",
  ],
  anchors: anchors(
    "Spontaneously reconstructs the other party's constraints, separates intent from impact, and adjusts the response accordingly.",
    "Recognises the other party's position and factors it into the response.",
    "Acknowledges the other party but the response stays task-only.",
    "Treats the other party as an obstacle; little recognition of their position.",
    "No recognition of any perspective other than their own."
  ),
};

export const ASSERTIVENESS: CapabilitySpec = {
  id: "assertiveness",
  name: "Constructive assertiveness",
  purpose:
    "Will the person raise a concern, disagree with a decision or set a boundary — respectfully and with evidence?",
  markers: [
    "Raises the concern rather than absorbing it",
    "Disagrees with the position, not the person",
    "Uses evidence to support the challenge",
    "Judges when to escalate",
  ],
  anchors: anchors(
    "Raises the concern directly with evidence, proposes an alternative, and judges escalation appropriately.",
    "Raises the concern clearly; the evidence or the alternative is thin.",
    "Raises the concern only indirectly, or only to peers.",
    "Signals discomfort but does not raise it; defers to seniority by default.",
    "Silence or compliance with no attempt to surface the concern."
  ),
};

export const PROBLEM_SOLVING: CapabilitySpec = {
  id: "problemSolving",
  name: "Collaborative problem-solving",
  purpose:
    "Can the person move from a complaint to a workable, shared plan with the people affected?",
  markers: [
    "Defines the problem before proposing a fix",
    "Gathers facts from the other side",
    "Generates more than one option",
    "Converts the option into a concrete next step with an owner",
  ],
  anchors: anchors(
    "Defines the problem, checks facts, weighs options and lands on a concrete next step with an owner and a timeframe.",
    "Reaches a workable next step; option-generation or fact-checking is limited.",
    "Proposes a direction but not an actionable step.",
    "Restates the problem without moving toward a resolution.",
    "No problem definition and no proposed action."
  ),
};

export const CRITICAL_THINKING: CapabilitySpec = {
  id: "criticalThinking",
  name: "Critical thinking",
  purpose:
    "Does the person test assumptions and revise a view when the evidence changes?",
  markers: [
    "Surfaces the assumption behind a decision",
    "Distinguishes what is known from what is assumed",
    "Considers an alternative explanation",
    "Willing to revise a stated position",
  ],
  anchors: anchors(
    "Names the assumption, separates fact from inference, weighs an alternative explanation and states what would change their mind.",
    "Tests the main assumption and considers one alternative.",
    "Some reasoning is shown but assumptions go unexamined.",
    "Asserts a conclusion with no visible reasoning.",
    "No reasoning is evidenced."
  ),
};

export const STRESS: CapabilitySpec = {
  id: "stress",
  name: "Stress handling",
  purpose:
    "Under time pressure or conflict, does the person keep cognitive control and prioritise? Scored from described and observed behaviour, not from self-description alone.",
  markers: [
    "Recognises their own trigger",
    "Maintains professional steadiness during the scenario",
    "Re-prioritises rather than freezing or escalating",
    "Recovers and re-engages after the pressure point",
  ],
  anchors: anchors(
    "Stays professionally steady, re-prioritises explicitly, communicates the trade-off and recovers quickly.",
    "Maintains control and prioritises, with some strain visible.",
    "Partial control; prioritisation is reactive rather than deliberate.",
    "Reaction disrupts the response — withdrawal, blame or escalation.",
    "Response is dominated by the reaction; no prioritisation is evidenced."
  ),
};

export const CAPABILITIES: CapabilitySpec[] = [
  COMMUNICATION,
  EMPATHY,
  ASSERTIVENESS,
  PROBLEM_SOLVING,
  CRITICAL_THINKING,
  STRESS,
];

/* ============================================================
   Layer 2 — team climate (§8 Layer 2)
   ============================================================ */

export const CLIMATE: ClimateSpec[] = [
  {
    id: "psychSafety",
    name: "Psychological safety",
    purpose:
      "Can people ask questions, admit mistakes, challenge ideas and disagree with leaders without fear of penalty?",
    pulseItem:
      "In this team I can raise a mistake or disagree with a senior colleague without it being held against me.",
    probe:
      "Think of the last time you disagreed with a decision from above. What did you do, and what made that easy or hard?",
    weakFinding:
      "People can explain their ideas, but junior staff hold back from disagreeing with senior colleagues. The issue is upward communication and safety, not speaking ability.",
    strongFinding:
      "Disagreement is raised openly across levels and mistakes are surfaced early enough to act on.",
  },
  {
    id: "trust",
    name: "Trust",
    purpose:
      "Do people believe colleagues and leaders keep commitments, act consistently and avoid unfair blame?",
    pulseItem:
      "When colleagues in this team commit to something, I can rely on it being done.",
    probe:
      "Where in your work do you find yourself building in a buffer because you cannot rely on a handover?",
    weakFinding:
      "Commitments are not reliably honoured, so people build private buffers and duplicate work.",
    strongFinding:
      "Commitments hold, information is shared, and people extend credit to each other by default.",
  },
  {
    id: "roleClarity",
    name: "Role clarity",
    purpose:
      "Do people know who decides, who owns each task, how handovers work and when to escalate?",
    pulseItem:
      "It is clear who owns each decision and each handover in the work I do.",
    probe:
      "Describe a recent piece of work that stalled. Who was supposed to decide, and how did you find out?",
    weakFinding:
      "Ownership of decisions and handovers is ambiguous, so work stalls at the boundary between roles rather than inside them.",
    strongFinding:
      "Decision rights, ownership and escalation paths are understood and used.",
  },
  {
    id: "goalAlignment",
    name: "Goal alignment",
    purpose:
      "Does the team share priorities and outcomes, including across departments?",
    pulseItem:
      "My department's targets pull in the same direction as the departments we depend on.",
    probe:
      "Where do your priorities and another department's priorities pull against each other?",
    weakFinding:
      "Departmental targets compete rather than combine, so cooperation costs individuals their own measures.",
    strongFinding:
      "Shared outcomes are understood and departmental targets reinforce each other.",
  },
  {
    id: "collaboration",
    name: "Collaboration",
    purpose:
      "Does the team coordinate, resolve dependencies and work across departments?",
    pulseItem:
      "Working across departments here is straightforward when I need something.",
    probe:
      "Walk me through the last cross-department request you made. What happened?",
    weakFinding:
      "Trust is strong inside departments but weak across them; coordination breaks at the handover, not inside the team.",
    strongFinding:
      "Cross-department dependencies are resolved without escalation as a matter of routine.",
  },
  {
    id: "conflict",
    name: "Constructive conflict",
    purpose:
      "Can people disagree openly, separate ideas from personalities and reach a workable decision?",
    pulseItem:
      "Disagreements in this team get discussed openly and resolved.",
    probe:
      "When two people here disagree, what usually happens next?",
    weakFinding:
      "Disagreement is avoided rather than resolved; issues resurface later as delays or passive resistance.",
    strongFinding:
      "Disagreement is worked through directly and separated from the personalities involved.",
  },
  {
    id: "leadershipOpenness",
    name: "Leadership openness",
    purpose:
      "Do leaders listen, invite input, explain decisions and respond to concerns?",
    pulseItem:
      "My manager invites input before deciding, and explains decisions afterwards.",
    probe:
      "When was the last time input from your level visibly changed a decision?",
    weakFinding:
      "Leaders believe they are open; employees report that input rarely changes a decision. The gap itself is the finding.",
    strongFinding:
      "Input is sought before decisions and the reasoning is explained afterwards.",
  },
  {
    id: "inclusion",
    name: "Inclusion and belonging",
    purpose:
      "Do people feel respected, heard and able to contribute to decisions that affect them?",
    pulseItem:
      "In team discussions, my contribution is heard and taken seriously.",
    probe:
      "In your team meetings, who speaks and who does not? What shapes that?",
    weakFinding:
      "Airtime and influence concentrate in a subset of the team; others withdraw from discussion.",
    strongFinding:
      "Contribution is distributed and quieter members are actively brought in.",
  },
  {
    id: "accountability",
    name: "Accountability",
    purpose:
      "Does the team keep commitments, address underperformance and follow through?",
    pulseItem:
      "In this team, agreed actions are followed through and reviewed.",
    probe:
      "What happens here when an agreed action is not delivered?",
    weakFinding:
      "Agreed actions are not tracked to closure, so follow-through depends on individual diligence.",
    strongFinding:
      "Commitments are tracked, reviewed and addressed without it becoming personal.",
  },
  {
    id: "resilience",
    name: "Collective resilience",
    purpose:
      "Can the team adapt, re-prioritise and support each other through setbacks and pressure?",
    pulseItem:
      "When priorities change suddenly, this team adapts without breaking down.",
    probe:
      "Tell me about the last time a deadline or requirement changed late. How did the team handle it?",
    weakFinding:
      "Under pressure the team fragments into individual coping rather than shared re-prioritisation.",
    strongFinding:
      "Pressure is met with shared re-prioritisation and mutual support.",
  },
];

export const CLIMATE_BY_ID: Record<string, ClimateSpec> = Object.fromEntries(
  CLIMATE.map((c) => [c.id, c])
);

export const CAPABILITY_BY_ID: Record<string, CapabilitySpec> = Object.fromEntries(
  CAPABILITIES.map((c) => [c.id, c])
);

/* ============================================================
   Descriptive levels (§11 Dashboard 1)
   ============================================================ */

export interface LevelSpec {
  level: ConstructLevel;
  /** Inclusive lower bound on the 0–100 construct index. */
  min: number;
  colour: string;
  meaning: string;
}

export const LEVELS: LevelSpec[] = [
  {
    level: "Established Strength",
    min: 78,
    colour: "#1E9E52",
    meaning: "Protect and use as a lever for the areas that need work.",
  },
  {
    level: "Functional",
    min: 66,
    colour: "#7FB13B",
    meaning: "Works today; monitor rather than intervene.",
  },
  {
    level: "Developing",
    min: 54,
    colour: "#E8A400",
    meaning: "Inconsistent across the group. Candidate for workshop content.",
  },
  {
    level: "Priority Attention",
    min: 0,
    colour: "#C6222F",
    meaning: "Materially limiting the team. Design the intervention around this.",
  },
];

export const INSUFFICIENT_COLOUR = "#A9B0BF";

export function levelFor(index: number, n: number, minN = 5): ConstructLevel {
  if (n < minN) return "Insufficient Evidence";
  for (const l of LEVELS) if (index >= l.min) return l.level;
  return "Priority Attention";
}

/**
 * Layer 1 uses the behavioural anchor labels directly: a mean of 3.0 IS
 * "Developing" on the rubric, so the climate bands would mislabel it.
 * Bounds are the rubric means 4.3 / 3.6 / 2.6 expressed as a 0–100 index.
 */
export function levelForCapability(index: number, n: number, minN = 5): ConstructLevel {
  if (n < minN) return "Insufficient Evidence";
  if (index >= 82.5) return "Established Strength";
  if (index >= 65) return "Functional";
  if (index >= 40) return "Developing";
  return "Priority Attention";
}

export function levelColour(level: ConstructLevel): string {
  if (level === "Insufficient Evidence") return INSUFFICIENT_COLOUR;
  return LEVELS.find((l) => l.level === level)?.colour ?? INSUFFICIENT_COLOUR;
}

/**
 * Continuous colour along the same Priority → Strength ramp, for heat tiles.
 * Mirrors the DENGAR sentiment ramp so the two products read as one system.
 */
export function indexColour(index: number): string {
  const t = Math.max(0, Math.min(1, (index - 40) / 50));
  const lerp = (a: number, b: number, u: number) => Math.round(a + (b - a) * u);
  let c1: number[], c2: number[], u: number;
  if (t < 0.5) {
    c1 = [198, 34, 47];
    c2 = [232, 164, 0];
    u = t / 0.5;
  } else {
    c1 = [232, 164, 0];
    c2 = [30, 158, 82];
    u = (t - 0.5) / 0.5;
  }
  return `rgb(${lerp(c1[0], c2[0], u)},${lerp(c1[1], c2[1], u)},${lerp(c1[2], c2[2], u)})`;
}

/* ============================================================
   Governance (§16)
   ============================================================ */

/**
 * §16.6 Excluded confounds — these must NEVER influence any score.
 * Carried over unchanged from the MIROME individual assessment design.
 */
export const EXCLUDED_CONFOUNDS = [
  "Accent or dialect",
  "English fluency, grammar or vocabulary",
  "Speaking speed or verbal polish",
  "Physical appearance, eye contact or camera quality",
  "Voice pitch, charisma or presence",
  "Disability-related expression",
  "Technical failures during the session",
] as const;

/**
 * Human-review triggers. Any of these routes a session to a trained reviewer
 * regardless of automated scores (§16.4).
 */
export const HUMAN_REVIEW_TRIGGERS = [
  "Low confidence on a consequential finding",
  "Disclosure of harassment, bullying, discrimination or safety risk",
  "Named allegation about an identifiable individual",
  "Distress or welfare concern expressed by the participant",
  "Summary not confirmed (NC) on a material issue",
  "Segment below the minimum reporting threshold",
] as const;

/** §16.2 — never display a segment that could identify an individual. */
export const MIN_SEGMENT_N = 5;
