/**
 * L'Oréal Beauty Coach — domain types (Phase 1 Foundation).
 *
 * Org hierarchy: Market (country) → Territory → Distributor → Advisor.
 * Advisors authenticate with distributor-issued access codes, so market /
 * territory / distributor analytics dimensions are trustworthy — carried by
 * the code, never self-declared free text.
 */

export type AdvisorRole = "distributor" | "agent" | "salesperson";

export const ADVISOR_ROLES: { id: AdvisorRole; label: string }[] = [
  { id: "distributor", label: "Distributor staff" },
  { id: "agent", label: "Agent" },
  { id: "salesperson", label: "In-store salesperson" },
];

export interface Market {
  id: string;
  name: string;
  region: string; // e.g. SAPMENA, GCC
}

export interface Territory {
  id: string;
  marketId: string;
  name: string;
}

export interface Distributor {
  id: string;
  marketId: string;
  territoryId: string;
  name: string;
}

export interface Advisor {
  id: string;
  name: string;
  role: AdvisorRole;
  distributorId: string;
  createdAt: string;
}

/** Resolved advisor identity carried in the signed session cookie. */
export interface AdvisorContext {
  advisorId: string;
  advisorName: string;
  role: AdvisorRole;
  distributorId: string;
  distributorName: string;
  territoryId: string;
  territoryName: string;
  marketId: string;
  marketName: string;
}

export type CoachingFocus =
  | "product-knowledge"
  | "objection-handling"
  | "routine-building"
  | "price-positioning";

export const COACHING_FOCUSES: { id: CoachingFocus; label: string }[] = [
  { id: "product-knowledge", label: "Product knowledge" },
  { id: "objection-handling", label: "Objection handling" },
  { id: "routine-building", label: "Routine building" },
  { id: "price-positioning", label: "Price positioning" },
];

export interface Product {
  id: string;
  brand: string;
  category: "skincare" | "haircare" | "makeup";
  name: string;
  tagline: string;
  /** e.g. "Priority Launch — Q3 2026" or null for catalogue products. */
  launchLabel: string | null;
  /** Brand id from src/lib/coach/org.ts. */
  brandId?: string | null;
  /** Division id — drives coach persona and rubric weighting. */
  divisionId?: string | null;
}

/** One section of the brand-approved launch knowledge pack. */
export interface PackSection {
  id: string;
  title: string;
  content: string;
  keywords: string[];
}

export interface ObjectionEntry {
  objection: string;
  keywords: string[];
  approvedResponse: string;
}

/**
 * The governed knowledge unit: everything the coach is allowed to say about
 * a launch. Versioned; the conversation engine answers ONLY from this.
 */
export interface LaunchPack {
  id: string;
  productId: string;
  version: number;
  language: string; // session language code, e.g. "EN"
  /** Governance state — only source/approved packs may run a session. */
  translationStatus?: string;
  sections: PackSection[];
  objections: ObjectionEntry[];
  doNotSay: string[];
  /** Approved claim phrases used by the fidelity scorer. */
  approvedClaims: string[];
}

export interface Slot {
  id: string;
  marketId: string;
  startsAt: string; // ISO
  capacity: number;
  booked: number;
}

export type AppointmentStatus = "confirmed" | "completed" | "cancelled";

export interface Appointment {
  ref: string; // LBC-2026-XXXXXX
  advisorId: string;
  slotId: string;
  productId: string;
  focus: CoachingFocus;
  language: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface CoachTurn {
  speaker: "coach" | "advisor";
  text: string;
  at: string; // ISO
}

export interface CoachSession {
  id: string;
  appointmentRef: string;
  advisorId: string;
  productId: string;
  focus: CoachingFocus;
  language: string;
  startedAt: string;
  endedAt: string | null;
  /** Which engine produced coach replies: "claude" | "governed-fallback". */
  engine: string;
}

export type DimensionScoreCode = number | "NE" | "IE";

export interface DimensionScore {
  dimensionId: string;
  /** 0–100, or NE (not elicited) / IE (insufficient evidence). */
  score: DimensionScoreCode;
  confidence: "high" | "moderate" | "low";
  /** Verbatim advisor quote grounding the score; null when NE/IE. */
  evidence: string | null;
  note: string;
}

export interface Scorecard {
  sessionId: string;
  advisorId: string;
  productId: string;
  overall: number; // 0–100 across scored dimensions
  dimensions: DimensionScore[];
  certified: boolean;
  practiceNext: string[];
  createdAt: string;
}

/** Certification threshold for Launch-Readiness (pilot value). */
export const CERTIFICATION_THRESHOLD = 80;
