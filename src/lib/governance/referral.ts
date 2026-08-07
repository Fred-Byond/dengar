/**
 * Restricted disclosures (Tier 4) — the corruption / wrongdoing carve-out.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * THE DESIGN POSITION
 *
 * A citizen-listening platform must NOT become an unofficial corruption
 * reporting channel. If it does, three things go wrong at once:
 *
 *   1. The citizen loses protection. Statutory whistleblower protection
 *      attaches to disclosures made to a competent authority through the
 *      proper channel. A disclosure made to a sentiment-analytics platform may
 *      attract none of it — while still exposing the discloser.
 *   2. The office accumulates legal risk. Identified allegations against named
 *      individuals, held in a political office's analytics system, are
 *      discoverable, leakable, and open to the accusation of being an
 *      intelligence file on critics.
 *   3. The evidence is degraded. Allegations need chain of custody and
 *      investigator handling, not machine sentiment scoring.
 *
 * So DENGAR.ai does the opposite of accumulating: it DETECTS, SEALS, REFERS,
 * and then KEEPS ONLY A COUNT.
 *
 * What stays in the platform is the aggregate signal the leader legitimately
 * needs — "governance concern is rising in these states" — never the
 * allegation, the accused, or the discloser.
 * ────────────────────────────────────────────────────────────────────────────
 */

export type DisclosureKind =
  | "corruption_allegation"
  | "third_party_named"
  | "safety_critical"
  | "ongoing_harm";

/** Competent statutory destinations. Configured per deployment with the Ministry. */
export type ReferralChannel =
  | "anti_corruption_commission"
  | "police"
  | "protected_disclosure_unit"
  | "child_or_vulnerable_persons_authority";

export const REFERRAL_ROUTING: Record<DisclosureKind, ReferralChannel> = {
  corruption_allegation: "anti_corruption_commission",
  third_party_named: "protected_disclosure_unit",
  safety_critical: "police",
  ongoing_harm: "child_or_vulnerable_persons_authority",
};

/**
 * What the ANALYTICS platform is permitted to keep about a restricted
 * disclosure. Deliberately minimal: enough to show the trend and prove the
 * referral happened, and nothing that could identify anyone.
 */
export interface RetainedDisclosureSignal {
  /** Opaque id — not derivable back to the citizen. */
  signalId: string;
  kind: DisclosureKind;
  /** Topic bucket only, for the trend line. */
  topicL1: string;
  /** State grain only — never district, which can be identifying here. */
  state: string;
  /** ISO week, not a timestamp — timing can identify. */
  isoWeek: string;
  /** Proof the platform discharged its duty. */
  referredTo: ReferralChannel;
  referredAt: string;
  acknowledgementRef: string | null;
  /**
   * Always true once the referral is acknowledged: the narrative, the names
   * and the transcript are purged from the platform.
   */
  contentPurged: boolean;
}

/**
 * The sealed package that leaves the platform. Encrypted to the receiving
 * authority's key — so once sealed, NOBODY in the PMO or at BYOND can read
 * it, including the person who sealed it.
 */
export interface SealedReferral {
  referralId: string;
  kind: DisclosureKind;
  channel: ReferralChannel;
  /** Ciphertext. Decryptable only by the receiving authority. */
  sealedPayload: string;
  /** Key identifier of the receiving authority — never a platform key. */
  recipientKeyId: string;
  sealedAt: string;
  /** Named officer who sealed it, and the second approver. */
  sealedBy: string;
  approvedBy: string;
}

/**
 * Detection is intentionally high-recall (over-flags rather than under-flags):
 * mis-routing a complaint to a human reviewer is cheap; failing to protect a
 * genuine disclosure is not. Final classification is always human.
 */
export const DETECTION_POSTURE = {
  automatedDecision: false,
  rationale:
    "No automated system decides that something is a corruption allegation. The classifier flags candidates; a named protected-disclosure officer decides. Automated adverse decisions on this class of content are neither lawful-by-default nor defensible.",
  biasTowards: "recall",
  humanReviewSLA: "same working day",
} as const;

/**
 * The lifecycle every restricted disclosure follows. Each transition writes an
 * immutable audit entry (see ./access AuditEntry).
 */
export const REFERRAL_LIFECYCLE = [
  {
    step: 1,
    state: "flagged",
    what: "Classifier flags the session as a Tier-4 candidate. The record is immediately quarantined: removed from the analytics pool, the dashboard, the Session Explorer and the briefing pipeline.",
  },
  {
    step: 2,
    state: "quarantined",
    what: "Only a named protected-disclosure officer can open it, under the two-person rule. Nobody else in the office — including the leader and the delivery unit — can see it exists beyond an anonymous count.",
  },
  {
    step: 3,
    state: "triaged",
    what: "The officer confirms or rejects the Tier-4 classification. Rejected ⇒ returns to the normal pool as T1/T3. Confirmed ⇒ proceeds to referral.",
  },
  {
    step: 4,
    state: "sealed",
    what: "The narrative is encrypted to the receiving authority's public key and transmitted through the agreed channel. The platform retains only the sealed ciphertext and the routing metadata.",
  },
  {
    step: 5,
    state: "acknowledged",
    what: "The receiving authority returns an acknowledgement reference. The platform records it as proof of discharge.",
  },
  {
    step: 6,
    state: "purged",
    what: "Transcript, audio, narrative, names and the identity linkage are irreversibly deleted from the platform. Only RetainedDisclosureSignal survives — kind, topic, state, ISO week, referral proof.",
  },
] as const;

/**
 * What the citizen is told, in-session and in writing. Honesty here is both
 * the ethical and the legal requirement: they must know this is not a formal
 * report, and where to make one.
 */
export const CITIZEN_NOTICE = {
  inSession:
    "What you have raised may need to go to the proper authority. This session is not an official report, and I will not decide it here. With your knowledge, my office will pass it to the competent body, and you will get a reference.",
  written:
    "Your disclosure has been referred to the competent authority with reference {ref}. This platform has not retained the details. To make a formal report — and to receive the legal protections that come with it — use the official channel at {channel_url}. If you would prefer we did not refer it, reply STOP REFERRAL and we will delete it.",
  consentPosture:
    "Referral is disclosed, not silent. A citizen may withdraw a disclosure before referral; safety-critical cases involving risk to life are the documented exception and are escalated regardless, which is stated up front.",
} as const;
