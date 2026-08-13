/**
 * MESSI.LIVE core domain model.
 *
 * The persisted entities behind the fan experience and the management
 * dashboard. The intelligence output (Insight) is the FVIF FanInsightRecord.
 * Deliberately minimal on personal data: MESSI.LIVE needs a name, a verified
 * contact, a country, a language and an age band — nothing more.
 */

import type { AgeBand, FanInsightRecord, MembershipTier, Surface } from "./fvif";
import type { LangCode } from "./markets";

export interface Fan {
  id: string;
  displayName: string;
  /** Verified mobile, hashed for dedupe in storage. */
  mobileHash: string;
  email?: string;
  language: LangCode;
  country: string;
  region: string;
  ageBand: AgeBand;
  tier: MembershipTier;
  /** Set only where the fan is under 18 — parental account that owns consent. */
  guardianAccountId?: string;
  consent: ConsentRecord;
}

export interface ConsentRecord {
  /** The mandatory AI-disclosure acknowledgement (slide 4 / slide 19). */
  aiDisclosureAcceptedAt: string;
  privacyAcceptedAt: string;
  /** Opt-in: may MESSI.LIVE remember this fan between conversations? */
  memoryOptIn: boolean;
  /** Opt-in: may a de-identified insight inform Messi's team? */
  analyticsOptIn: boolean;
  /** Required for every under-18 account. */
  parentalConsentAt?: string;
  version: string;
}

export type SlotStatus = "open" | "soft-locked" | "booked" | "completed" | "forfeited";

export interface Slot {
  id: string;
  datetime: string; // ISO
  seatIndex: number;
  /** Priority scheduling is a MESSI+ benefit, never a scoring input. */
  tierGate: MembershipTier;
  status: SlotStatus;
}

export type AppointmentStatus =
  | "confirmed" | "reminded" | "joined" | "completed" | "no-show" | "cancelled";

export interface Appointment {
  reference: string; // MSL-2026-004512
  fanId: string;
  slotId: string;
  /** Which MESSI.LIVE experience was booked (slide 10). */
  experienceId: string;
  themeHint?: string;
  status: AppointmentStatus;
  surface: Surface;
  territory: string;
  notificationHistory: NotificationEvent[];
}

export interface NotificationEvent {
  channel: "whatsapp" | "sms" | "email" | "push";
  template: string;
  sentAt: string;
  delivered: boolean;
}

export interface Conversation {
  appointmentReference: string;
  startedAt: string;
  endedAt: string;
  transcriptRef: string; // pointer to the segregated encrypted store
  recordingRef?: string;
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
  earlyTermination: boolean;
}

/** The per-conversation AI output (FVIF). */
export type Insight = FanInsightRecord;

/**
 * A memory carried between conversations — the product of slide 6. Written
 * only on (a) memory opt-in and (b) a confirmed or corrected summary.
 */
export interface FanMemory {
  fanId: string;
  fact: string;
  sourceReference: string;
  createdAt: string;
  /** Fans can see and delete any memory; deletion is immediate. */
  visibleToFan: true;
  expiresAt?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  /** Immutable, exportable for management and rights-holder audit. */
  readonly hashChainPrev?: string;
}
