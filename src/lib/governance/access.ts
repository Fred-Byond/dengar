/**
 * Access control — who may read what, and how every exception is proved.
 *
 * The governance claim this file makes enforceable: **no role can read raw
 * citizen content by default, and the vendor cannot read it at all.**
 * Elevated reads are possible only via break-glass, which requires a stated
 * purpose, a second approver, expires automatically, and writes an immutable
 * audit entry.
 *
 * This is the authoritative policy. The dashboard's Minister ↔ Delivery-Unit
 * toggle is presentation only — never authorisation (see
 * docs/DATA-GOVERNANCE.md §4).
 */

import { type DataTier, TIERS } from "./classification";

export type Role =
  /** The leader. Reads the pulse and the briefing; has no reason to read raw content. */
  | "leader"
  /** Delivery unit / Sec-Gen office: assigns and tracks actions. */
  | "delivery_unit"
  /** Trained analyst in the leader's department: works the review queue. */
  | "analyst"
  /** Handles safety-critical / restricted disclosures. Named individuals only. */
  | "protected_disclosure_officer"
  /** Booking + notification operations. Needs identity, never content. */
  | "service_desk"
  /** BYOND Asia platform operations. Runs the system; cannot read content. */
  | "vendor_ops"
  /** Independent auditor / regulator. Reads the audit log, never the data. */
  | "auditor"
  /** The citizen themselves, for their own record. */
  | "citizen_self";

export interface RolePolicy {
  role: Role;
  label: string;
  /** Tiers readable without any elevation. */
  baseline: DataTier[];
  /** Tiers reachable only through break-glass (purpose + second approver + audit). */
  breakGlass: DataTier[];
  /** Why this role exists — the need-to-know justification. */
  justification: string;
  /** Hard prohibitions, stated so they can be tested and contracted. */
  neverAccess: DataTier[];
}

export const POLICY: Record<Role, RolePolicy> = {
  leader: {
    role: "leader",
    label: "Prime Minister / Minister",
    baseline: ["T0", "T1"],
    breakGlass: [],
    justification:
      "Needs the national pulse and the weekly briefing. Deliberately has no route to raw content or identity — this protects the office as much as the citizen: the leader cannot be accused of reading who said what.",
    neverAccess: ["T2", "T3", "T4"],
  },
  delivery_unit: {
    role: "delivery_unit",
    label: "PMO Delivery Unit / Secretary General's office",
    baseline: ["T0", "T1"],
    breakGlass: ["T3"],
    justification:
      "Assigns directives to ministries and tracks delivery. Works from de-identified insight; may need a verbatim quote to brief a ministry, which is a break-glass read of that single record.",
    neverAccess: ["T2", "T4"],
  },
  analyst: {
    role: "analyst",
    label: "Trained departmental analyst",
    baseline: ["T0", "T1"],
    breakGlass: ["T3"],
    justification:
      "Calibrates classification quality and works the human-review queue, which requires reading the transcript of flagged sessions. Every such read is logged against the specific session.",
    neverAccess: ["T2", "T4"],
  },
  protected_disclosure_officer: {
    role: "protected_disclosure_officer",
    label: "Protected-disclosure officer (named appointees)",
    baseline: ["T0"],
    breakGlass: ["T3", "T4"],
    justification:
      "The only role that may open a restricted disclosure, solely to verify it and refer it to the competent statutory body. Appointed by name, not by grade. Two-person rule applies.",
    neverAccess: ["T2"],
  },
  service_desk: {
    role: "service_desk",
    label: "Booking & notification operations",
    baseline: ["T2"],
    breakGlass: [],
    justification:
      "Needs identity to book, remind and support a citizen. Has no route to what the citizen said — separating identity from content is what makes this role safe.",
    neverAccess: ["T1", "T3", "T4"],
  },
  vendor_ops: {
    role: "vendor_ops",
    label: "BYOND Asia platform operations",
    baseline: ["T0"],
    breakGlass: [],
    justification:
      "Operates the platform: availability, deployment, pipeline health. Reads system telemetry and aggregate counts only. Cannot decrypt identity or content because the decryption keys are held in the Government's key management service — this is a cryptographic guarantee, not a policy promise.",
    neverAccess: ["T1", "T2", "T3", "T4"],
  },
  auditor: {
    role: "auditor",
    label: "Independent auditor / regulator",
    baseline: [],
    breakGlass: [],
    justification:
      "Reads the immutable audit log and configuration, never the underlying personal data. Can therefore verify who accessed what without itself becoming a disclosure risk.",
    neverAccess: ["T1", "T2", "T3", "T4"],
  },
  citizen_self: {
    role: "citizen_self",
    label: "The citizen, for their own session",
    baseline: ["T2", "T3"],
    breakGlass: [],
    justification:
      "Data-subject rights: access their own record, correct it, and request deletion. Scoped strictly to sessions matching their verified mobile.",
    neverAccess: ["T1", "T4"],
  },
};

export type AccessDecision =
  | { allowed: true; viaBreakGlass: false }
  | { allowed: true; viaBreakGlass: true; requires: string[] }
  | { allowed: false; reason: string };

/**
 * The single authorisation function. Server-side only — never trust a
 * client-side role claim.
 */
export function canAccess(role: Role, tier: DataTier): AccessDecision {
  const p = POLICY[role];
  if (p.neverAccess.includes(tier)) {
    return {
      allowed: false,
      reason: `${p.label} is contractually and technically barred from ${tier} (${TIERS[tier].name}).`,
    };
  }
  if (p.baseline.includes(tier)) return { allowed: true, viaBreakGlass: false };
  if (p.breakGlass.includes(tier)) {
    return {
      allowed: true,
      viaBreakGlass: true,
      requires: [
        "Stated purpose bound to a specific session reference",
        "Second-approver authorisation (two-person rule)",
        "Time-boxed grant that expires automatically",
        "Immutable audit entry naming the individual, not the role",
      ],
    };
  }
  return {
    allowed: false,
    reason: `${p.label} has no need-to-know for ${tier} (${TIERS[tier].name}).`,
  };
}

/** An elevated-access grant. Short-lived, single-purpose, fully attributed. */
export interface BreakGlassGrant {
  id: string;
  /** The individual, not a shared account. */
  requestedBy: string;
  approvedBy: string;
  role: Role;
  tier: DataTier;
  /** Scoped to one session — never "all sessions". */
  sessionReference: string;
  purpose: string;
  grantedAt: string;
  expiresAt: string;
}

/**
 * Immutable audit entry. Hash-chained so that removing or editing an entry
 * breaks the chain, and replicated to a government-held store the vendor
 * cannot write to.
 */
export interface AuditEntry {
  seq: number;
  at: string;
  actor: string;
  role: Role;
  action:
    | "view_aggregate"
    | "view_insight"
    | "view_identity"
    | "view_content"
    | "unmask_identity"
    | "break_glass_request"
    | "break_glass_approve"
    | "referral_sealed"
    | "export"
    | "config_change"
    | "deletion_executed";
  target: string;
  tier: DataTier;
  purpose?: string;
  grantId?: string;
  /** Hash of the previous entry — tamper-evidence. */
  prevHash: string;
  hash: string;
}
