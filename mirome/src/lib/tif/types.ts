/**
 * Team Intelligence Framework (TIF) — type definitions.
 *
 * Source of truth: "MIROME Team Intelligence — AI-Powered Team Diagnosis,
 * Workshop Customisation and Organisational Development Platform"
 * (BYOND Asia, Concept v1.0), §8 Proposed Assessment Framework.
 *
 * Core principle: the system assesses HOW A TEAM FUNCTIONS using the
 * conversation as evidence about a working relationship — never the employee
 * as a person, and never as a disciplinary instrument. Employment-selection
 * confounds (accent, fluency, charisma, appearance) are explicitly excluded —
 * see EXCLUDED_CONFOUNDS in ./constructs.
 *
 * Three layers:
 *   Layer 1 — Individual workplace capability (evidence-scored from transcript)
 *   Layer 2 — Team climate (pulse items + interview evidence, aggregated)
 *   Layer 3 — Behavioural scenario simulation (observed behaviours per scenario)
 */

/** Non-score codes: the assessment did not fairly produce a score. */
export type NonScoreCode =
  | "NE" // Not Elicited — the digital human did not create the opportunity
  | "IE"; // Insufficient Evidence — response too weak/unclear to score

/** Every score carries a calibrated confidence, never false precision. */
export type Confidence = "high" | "moderate" | "low" | "insufficient";

/** Layer 1 — behaviourally anchored 1–5, or a non-score code. */
export type CapabilityScore = 1 | 2 | 3 | 4 | 5 | NonScoreCode;

/** Layer 2 — a single participant's response to a climate item (Likert 1–5). */
export type LikertScore = 1 | 2 | 3 | 4 | 5;

/** Team-level descriptive band. Never a single universal "team score". */
export type ConstructLevel =
  | "Established Strength"
  | "Functional"
  | "Developing"
  | "Priority Attention"
  | "Insufficient Evidence";

/** Did the participant agree the reflected summary was accurate? */
export type ConfirmationCode =
  | "C" // Confirmed
  | "CC" // Confirmed with correction
  | "NC" // Not confirmed
  | "NE" // Not elicited
  | "IE"; // Unclear

/** Measurement point in the improvement cycle (§4.6, §12 Phase 5). */
export type Wave = "baseline" | "immediate" | "day30" | "day60" | "day90";

/** Organisational segmentation used for gap analysis (§11 Dashboard 2). */
export type RoleLevel =
  | "Executive"
  | "Senior manager"
  | "Manager"
  | "Team lead"
  | "Individual contributor";

export type TenureBand = "<1 year" | "1–3 years" | "3–7 years" | "7+ years";

export type WorkArrangement = "Onsite" | "Hybrid" | "Remote";

/**
 * A single scored item: the value, the confidence, and the EXACT transcript
 * span that supports it. Evidence-grounding is mandatory — every analytical
 * output must point to a verbatim quote or declare insufficient evidence.
 */
export interface ScoredDimension<T> {
  value: T;
  confidence: Confidence;
  /** Verbatim quote from the participant transcript supporting this value. */
  evidenceQuote: string | null;
}

/** Layer 3 — what was observed in one scenario response. */
export interface ScenarioObservation {
  scenarioId: string;
  /** Behaviours from the scenario's rubric that the response evidenced. */
  observed: string[];
  /** Behaviours the rubric expected but the response did not evidence. */
  notObserved: string[];
  capabilityScores: Partial<Record<string, CapabilityScore>>;
  evidenceQuote: string | null;
  confidence: Confidence;
}

/** Who the participant is, as far as the analysis is allowed to know. */
export interface ParticipantContext {
  department: string;
  roleLevel: RoleLevel;
  tenure: TenureBand;
  workArrangement: WorkArrangement;
  managesPeople: boolean;
  language: string;
}

/**
 * The Participant Insight Record — the analytical unit produced per session.
 * De-identified records at this shape feed every dashboard aggregation.
 */
export interface ParticipantInsightRecord {
  /** Assessment reference, e.g. MTI-2026-004512. Not a name. */
  reference: string;
  wave: Wave;
  context: ParticipantContext;

  // --- Layer 1: individual capability ---
  capabilities: Record<string, ScoredDimension<CapabilityScore>>;

  // --- Layer 2: team climate, as this participant experiences it ---
  climate: Record<string, LikertScore>;

  // --- Layer 3: scenario simulation ---
  scenarios: ScenarioObservation[];

  // --- reflection (§9 Stage 5) ---
  reflection: {
    strength: string | null;
    obstacle: string | null;
    priority: string | null;
    personalAction: string | null;
  };

  /** Theme tags from the fixed workplace taxonomy (see ./taxonomy). */
  themes: string[];
  /** Verbatim-grounded anonymised quote safe for team-level reporting. */
  anonymisedQuote: string | null;
  /** Participant-confirmed neutral summary (2 sentences). */
  summary: string;
  confirmation: ConfirmationCode;

  // --- governance ---
  humanReview: boolean;
  humanReviewReasons: string[];
}

/** The minimal transcript shape the scorer consumes. */
export interface TranscriptTurn {
  speaker: "interviewer" | "participant";
  text: string;
  /** Offset within the session, e.g. "3:20" — for auditability. */
  at?: string;
  /** Scenario this turn belongs to, when the turn is a scenario response. */
  scenarioId?: string;
}

export interface TranscriptInput {
  reference: string;
  wave: Wave;
  context: ParticipantContext;
  /** Pulse-survey responses keyed by climate construct id. */
  pulse: Record<string, LikertScore>;
  turns: TranscriptTurn[];
}

/* ============================================================
   AGGREGATE (team-level) shapes
   ============================================================ */

/** One construct, aggregated across a group, with evidence sufficiency. */
export interface ConstructResult {
  id: string;
  name: string;
  layer: 1 | 2;
  /** 0–100 index. Distinct constructs stay visible; never merged. */
  index: number;
  level: ConstructLevel;
  /** Participants contributing evidence to this construct. */
  n: number;
  /** Share of responses at each Likert point — distribution stays visible. */
  distribution: [number, number, number, number, number];
  /** Standard deviation of the underlying responses (perception spread). */
  spread: number;
  confidence: Confidence;
}

/** §11 Dashboard 2 — the gap is often more valuable than the average. */
export interface PerceptionGap {
  constructId: string;
  constructName: string;
  /** Index for people who manage people. */
  managerIndex: number;
  managerN: number;
  /** Index for people who do not. */
  staffIndex: number;
  staffN: number;
  /** managerIndex − staffIndex. Positive = leaders rate it higher. */
  gap: number;
  suppressed: boolean;
}

/** A department (or any segment) profiled across the climate constructs. */
export interface SegmentProfile {
  segment: string;
  n: number;
  suppressed: boolean;
  /** constructId → index. */
  scores: Record<string, number>;
  /** Weakest construct for this segment, when not suppressed. */
  weakest: string | null;
}

/** §11 Dashboard 4 — ranked development priorities with a recommendation. */
export interface InterventionPriority {
  rank: number;
  constructId: string;
  constructName: string;
  /** The precise diagnosis, not the symptom (§4.2). */
  finding: string;
  index: number;
  level: ConstructLevel;
  /** Share of participants reporting at or below "Developing". */
  affectedShare: number;
  /** Segments where the construct is materially weaker than the org mean. */
  concentratedIn: string[];
  confidence: Confidence;
  /** Priority score: scale × spread × confidence × business relevance. */
  priorityScore: number;
  interventionId: string;
}

/** The full team intelligence profile powering the dashboards. */
export interface TeamIntelligenceProfile {
  organisation: string;
  wave: Wave;
  participation: {
    invited: number;
    completed: number;
    completionRate: number;
    /** Sessions routed to a human reviewer. */
    humanReview: number;
  };
  climate: ConstructResult[];
  capabilities: ConstructResult[];
  gaps: PerceptionGap[];
  segments: SegmentProfile[];
  priorities: InterventionPriority[];
  themes: { theme: string; count: number; delta: number }[];
  suggestions: { text: string; count: number; spread: string; themeId: string }[];
  voices: {
    quote: string;
    department: string;
    roleLevel: RoleLevel;
    theme: string;
    language: string;
    level: ConstructLevel;
  }[];
  flags: { reference: string; reason: string; department: string; raisedAt: string }[];
}
