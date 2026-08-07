/**
 * Data classification — the foundation of the governance posture.
 *
 * Everything DENGAR.ai holds is classified into one of five tiers. The tier
 * determines where it may be stored, who may read it, whether it may leave
 * Malaysia, and how long it is kept. Nothing is stored without a tier.
 *
 * The point of the scheme: the dashboard, the briefing and the analytics all
 * run on Tier 1 (de-identified) data. Identity (Tier 2) and raw content
 * (Tier 3) are separately stored, separately encrypted, and only re-linked
 * under two-person authorisation. Tier 4 never enters the analytics pool at
 * all — see ./referral.
 */

export type DataTier = "T0" | "T1" | "T2" | "T3" | "T4";

export interface TierDefinition {
  tier: DataTier;
  name: string;
  description: string;
  examples: string[];
  /** May this tier be exposed outside the platform at all? */
  publishable: boolean;
  /** May this tier ever be processed outside Malaysian jurisdiction? */
  crossBorderPermitted: boolean;
  /** Default retention before deletion or irreversible anonymisation. */
  retention: string;
  /** Which store holds it (physically separated). */
  store: "aggregate" | "insight" | "identity-vault" | "content-vault" | "sealed-referral";
}

export const TIERS: Record<DataTier, TierDefinition> = {
  T0: {
    tier: "T0",
    name: "Public aggregate",
    description:
      "Statistics computed across many sessions with no individual attribution. Safe for public 'you said, we did' reporting.",
    examples: [
      "State-level net sentiment",
      "Topic volumes and week-over-week trends",
      "Language mix of participation",
    ],
    publishable: true,
    crossBorderPermitted: true,
    retention: "Indefinite",
    store: "aggregate",
  },
  T1: {
    tier: "T1",
    name: "De-identified insight",
    description:
      "The CVIF Session Insight Record with identity removed — the analytical unit the dashboard, Session Explorer and briefing run on. Carries a pseudonymous session token, never a citizen identifier.",
    examples: [
      "Topic, sentiment, evidence, impact, actionability, urgency scores",
      "District, pain point and requested improvement",
      "Neutral 2-sentence summary",
    ],
    publishable: false,
    crossBorderPermitted: false,
    retention: "24 months, then reduced to T0 aggregate",
    store: "insight",
  },
  T2: {
    tier: "T2",
    name: "Citizen identity",
    description:
      "The minimum identity needed to book, notify and greet a citizen. Held in a separate vault; used by the booking and notification services only, never by analytics.",
    examples: [
      "Name, verified mobile (hashed for dedupe), optional email",
      "Declared state and district",
      "PDPA consent record and its version",
    ],
    publishable: false,
    crossBorderPermitted: false,
    retention: "12 months after the session, then deleted",
    store: "identity-vault",
  },
  T3: {
    tier: "T3",
    name: "Raw session content",
    description:
      "What the citizen actually said. The most sensitive routine holding: free speech about government, in the citizen's own words, potentially self-identifying regardless of masking.",
    examples: [
      "Verbatim transcript (original language and working translation)",
      "Audio recording, where retained",
      "Verbatim quotes selected for the briefing",
    ],
    publishable: false,
    crossBorderPermitted: false,
    retention: "Transcripts 12 months · audio 90 days (Ministry legal to confirm)",
    store: "content-vault",
  },
  T4: {
    tier: "T4",
    name: "Restricted disclosure",
    description:
      "Allegations of corruption or wrongdoing, safety-critical disclosures, and anything naming an identifiable third party. Legally distinct from feedback: it must be routed to the competent statutory channel, NOT accumulated in an analytics platform. See ./referral.",
    examples: [
      "Allegation of contract irregularity naming an officer or company",
      "Report implying an offence by a named individual",
      "Disclosure indicating risk to life or ongoing harm",
    ],
    publishable: false,
    crossBorderPermitted: false,
    retention: "Held only until acknowledged referral; then purged from platform",
    store: "sealed-referral",
  },
};

/** Field-level classification for the domain model — no field is untiered. */
export const FIELD_CLASSIFICATION: Record<string, DataTier> = {
  // identity
  "citizen.name": "T2",
  "citizen.mobileHash": "T2",
  "citizen.email": "T2",
  "citizen.consent": "T2",
  "citizen.state": "T1", // geography is analytical, not identifying at district grain
  "citizen.district": "T1",
  // booking
  "booking.reference": "T2", // links identity to content — treat as identifying
  "booking.topicCategory": "T1",
  // content
  "session.transcript": "T3",
  "session.recording": "T3",
  "insight.painPoint": "T3", // verbatim-grounded ⇒ may self-identify
  "insight.summary": "T1",
  // scores
  "insight.sentiment": "T1",
  "insight.clarity": "T1",
  "insight.evidence": "T1",
  "insight.impact": "T1",
  "insight.actionability": "T1",
  "insight.confirmation": "T1",
  "insight.urgency": "T1",
  "insight.keywords": "T1",
  // aggregate
  "aggregate.stateSentiment": "T0",
  "aggregate.topicVolume": "T0",
};

export function tierOf(field: string): DataTier | undefined {
  return FIELD_CLASSIFICATION[field];
}

/**
 * Guard for any egress path (external model call, export, backup replication).
 * Returns the reason it is refused, or null when permitted.
 */
export function refuseCrossBorder(tier: DataTier): string | null {
  return TIERS[tier].crossBorderPermitted
    ? null
    : `${TIERS[tier].tier} (${TIERS[tier].name}) may not be processed outside Malaysian jurisdiction. De-identify to T1 and strip verbatim content, or use in-country processing.`;
}
