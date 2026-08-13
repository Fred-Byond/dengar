/**
 * Fan Voice Intelligence Framework (FVIF) — type definitions.
 *
 * MESSI.LIVE is the global-fan sibling of DENGAR.ai's citizen-listening
 * platform: same controlled 5-minute digital-human session, same principle
 * that a controlled session produces COMPARABLE data, same discipline that the
 * analytical unit is one record per conversation.
 *
 * Core principle (inherited from CVIF, adapted for a fan relationship):
 * the system scores the CONVERSATION AS EVIDENCE ABOUT A FAN NEED, never the
 * fan as a person. Fans are not rated, ranked, graded or valued. Membership
 * tier, spend, follower count and language fluency are excluded confounds —
 * see EXCLUDED_CONFOUNDS in ./dimensions.
 */

/** Non-score codes — the record must be able to say "we do not know". */
export type NonScoreCode =
  | "NE" // Not Elicited — digital Messi never created the opportunity
  | "IE"; // Insufficient Evidence — transcript too weak/unclear to score

/** Every score carries a calibrated confidence, never false precision. */
export type Confidence = "high" | "moderate" | "low" | "insufficient";

/** 1. Sentiment & Emotional Register, attached to a conversation target. */
export type SentimentScore = -2 | -1 | 0 | 1 | 2 | "IE";

/** 2. Intent Clarity — can the team understand what the fan came for? */
export type IntentClarityScore = 1 | 2 | 3 | 4 | 5 | NonScoreCode;

/** 3. Personal Context Depth — generic admiration → specific lived situation. */
export type ContextDepthScore = 1 | 2 | 3 | 4 | 5 | "IE";

/** 4. Relationship Significance — how much this moment matters in the fan's life. */
export type SignificanceScore = 1 | 2 | 3 | 4 | 5 | "IE";

/** 5. Content Actionability — is there something Messi's team can actually make? */
export type ActionabilityScore = 1 | 2 | 3 | 4 | 5 | NonScoreCode;

/** 6. Continuity Confirmation — did the fan confirm the reflected summary? */
export type ConfirmationCode =
  | "C" // Confirmed
  | "CC" // Confirmed with correction
  | "NC" // Not confirmed
  | "NE" // Not elicited (session ended before the confirm step)
  | "IE"; // Fan response unclear

/**
 * 7. Care & Escalation — a duty-of-care ROUTING decision, never a sentiment
 * label and never a measure of how "difficult" a fan is.
 */
export type CareLevel = "Normal" | "Watch" | "Care" | "Critical";

/** Coarse age band captured at booking; drives the children's safeguards. */
export type AgeBand = "under-13" | "13-17" | "18-24" | "25-34" | "35+";

/** Membership layer. Never an input to any FVIF score. */
export type MembershipTier = "free" | "plus" | "family" | "premium";

/** Where the conversation physically happened. */
export type Surface = "mobile" | "holome";

/**
 * A single scored dimension: the value, the confidence, and the EXACT
 * transcript span supporting it. Evidence-grounding is mandatory — every
 * analytical output must point back to a verbatim quote.
 */
export interface ScoredDimension<T> {
  value: T;
  confidence: Confidence;
  /** Verbatim quote from the fan's transcript supporting this value. */
  evidenceQuote: string | null;
}

/** Sentiment can attach to several targets in one conversation. */
export interface SentimentTarget {
  target: string; // e.g. "his own confidence", "the academy trial", "Messi's 2022 final"
  score: SentimentScore;
  evidenceQuote: string | null;
}

/**
 * The Fan Insight Record — the analytical unit produced per conversation.
 * De-identified records at this shape feed the MESSI GLOBAL PULSE dashboard,
 * the weekly World Brief, and the "What the world asked you" curation queue.
 */
export interface FanInsightRecord {
  /** Booking reference, e.g. MSL-2026-004512. */
  reference: string;

  // --- provenance ---
  language: string; // original conversation language label
  country: string;
  region: string; // state / province / emirate
  /** Territory partner the fan entered through (MESSI.LIVE <MARKET>). */
  territory: string;
  tier: MembershipTier;
  surface: Surface;
  ageBand: AgeBand;

  // --- classification ---
  topicL1: string; // fixed MESSI.LIVE taxonomy (see ./taxonomy)
  topicL2: string | null;
  keywords: string[];

  // --- FVIF dimensions ---
  sentiment: {
    overall: ScoredDimension<SentimentScore>;
    targets: SentimentTarget[];
  };
  intentClarity: ScoredDimension<IntentClarityScore>;
  contextDepth: ScoredDimension<ContextDepthScore>;
  significance: ScoredDimension<SignificanceScore>;
  actionability: ScoredDimension<ActionabilityScore>;
  confirmation: ConfirmationCode;
  care: CareLevel;

  // --- decision-useful outputs ---
  /** The fan's actual question, verbatim — the raw material of slide 9. */
  questionAsked: string | null;
  /** What the fan asked Messi's world to make, do or answer. */
  contentRequest: string | null;
  /** Fan-confirmed neutral summary (2 sentences). */
  summary: string;

  // --- the relationship layer (slide 6: memory creates continuity) ---
  /** A durable fact worth remembering — stored ONLY with memory consent. */
  memoryCandidate: string | null;
  /** Whether the fan consented to MESSI.LIVE remembering them. */
  memoryConsent: boolean;
  /** The opener digital Messi should use next time, if consent was given. */
  continuityHook: string | null;

  // --- governance ---
  /** True when routed for a human fan-care reviewer / safeguarding officer. */
  humanReview: boolean;
  humanReviewReasons: string[];
  /** True when the topic touches reserved/brand-sensitive ground. */
  brandSensitive: boolean;
}

/** The minimal transcript shape the scorer consumes. */
export interface TranscriptTurn {
  speaker: "messi" | "fan";
  text: string;
  /** Offset within the 5-minute conversation, for auditability. */
  at?: string;
}

export interface TranscriptInput {
  reference: string;
  language: string;
  country: string;
  region: string;
  territory: string;
  tier: MembershipTier;
  surface: Surface;
  ageBand: AgeBand;
  /** Optional theme chosen at booking. */
  topicHint?: string;
  /** Whether the fan ticked "remember me" at booking (slide 6 consent). */
  memoryConsent?: boolean;
  turns: TranscriptTurn[];
}
