/**
 * Citizen Voice Intelligence Framework (CVIF) — type definitions.
 *
 * Source of truth: "Talk to the Minister — Citizen Voice Intelligence and
 * Scoring Customisation Project Paper" (BYOND Asia, v1.0).
 *
 * Core principle: the system scores the CONVERSATION AS EVIDENCE ABOUT AN
 * ISSUE, never the citizen as a person. Employment-assessment constructs
 * (confidence, fluency, charisma) are explicitly excluded — see
 * EXCLUDED_CONFOUNDS in ./dimensions.
 */

/** Non-score codes reused from the GIS evidence architecture. */
export type NonScoreCode =
  | "NE" // Not Elicited — the digital Minister did not create the opportunity
  | "IE"; // Insufficient Evidence — transcript too weak/unclear to score

/** Every score carries a calibrated confidence, never false precision. */
export type Confidence = "high" | "moderate" | "low" | "insufficient";

/** 5.1 Sentiment Direction & Intensity, attached to an issue target. */
export type SentimentScore = -2 | -1 | 0 | 1 | 2 | "IE";

/** 5.2 Issue Clarity (NOT language proficiency). */
export type ClarityScore = 1 | 2 | 3 | 4 | 5 | NonScoreCode;

/** 5.3 Evidence Strength — general claim → documented pattern. */
export type EvidenceScore = 1 | 2 | 3 | 4 | 5 | "IE";

/** 5.4 Impact Severity — based on described consequence, not emotion. */
export type ImpactScore = 1 | 2 | 3 | 4 | 5 | "IE";

/** 5.5 Request Actionability. */
export type ActionabilityScore = 1 | 2 | 3 | 4 | 5 | NonScoreCode;

/** 5.6 Confirmation Status of the reflected summary. */
export type ConfirmationCode =
  | "C" // Confirmed
  | "CC" // Confirmed with correction
  | "NC" // Not confirmed
  | "NE" // Not elicited
  | "IE"; // Unclear

/** 5.7 Urgency & Escalation — a routing decision, not a sentiment label. */
export type UrgencyLevel = "Normal" | "Priority" | "Urgent" | "Critical";

/**
 * A single scored dimension: the value, the confidence, and the EXACT
 * transcript span that supports it (evidence-grounding is mandatory —
 * every analytical output must point to a verbatim quote).
 */
export interface ScoredDimension<T> {
  value: T;
  confidence: Confidence;
  /** Verbatim quote from the citizen transcript supporting this value. */
  evidenceQuote: string | null;
}

/** Sentiment can have multiple targets in one session; overall is derived. */
export interface SentimentTarget {
  target: string; // e.g. "frontline staff", "process delays"
  score: SentimentScore;
  evidenceQuote: string | null;
}

/**
 * The Session Insight Record — the analytical unit produced per session.
 * De-identified records at this shape feed the dashboard aggregations.
 */
export interface SessionInsightRecord {
  /** Booking reference, e.g. TTM-2026-004512. */
  reference: string;

  // --- provenance ---
  language: string; // original session language (BCP-47-ish tag or label)
  state: string;
  district: string;
  /** Locations mentioned in-conversation (often more precise than booking). */
  locationsMentioned: string[];

  // --- classification ---
  topicL1: string; // fixed Home-Ministry taxonomy (see ./taxonomy)
  topicL2: string | null;
  keywords: string[];

  // --- CVIF dimensions ---
  sentiment: {
    overall: ScoredDimension<SentimentScore>;
    targets: SentimentTarget[];
  };
  clarity: ScoredDimension<ClarityScore>;
  evidence: ScoredDimension<EvidenceScore>;
  impact: ScoredDimension<ImpactScore>;
  actionability: ScoredDimension<ActionabilityScore>;
  confirmation: ConfirmationCode;
  urgency: UrgencyLevel;

  // --- decision-useful outputs ---
  painPoint: string | null; // verbatim-grounded, the concrete problem
  suggestion: string | null; // the citizen's concrete requested improvement
  /** Citizen-confirmed neutral summary (2 sentences). */
  summary: string;

  // --- governance ---
  /** True when routed for Ministry reviewer / trained analyst attention. */
  humanReview: boolean;
  humanReviewReasons: string[];
}

/** The minimal transcript shape the scorer consumes. */
export interface TranscriptTurn {
  speaker: "minister" | "citizen";
  text: string;
  /** ISO-ish offset within the 5-minute session, for auditability. */
  at?: string;
}

export interface TranscriptInput {
  reference: string;
  language: string;
  state: string;
  district: string;
  topicHint?: string; // optional topic chosen at booking
  /** Locations named in-conversation, if pre-extracted; else derived. */
  locationsMentioned?: string[];
  turns: TranscriptTurn[];
}
