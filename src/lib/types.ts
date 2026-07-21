/**
 * Core domain model — §4.2 of the Development Plan.
 *
 * These are the persisted entities behind the citizen experience and the
 * dashboard. The intelligence output (Insight) is the CVIF SessionInsightRecord.
 */

import type { SessionInsightRecord } from "./cvif";

export type SessionLanguage = "ms" | "en" | "zh" | "ta" | "ar";

export const MALAYSIA_STATES = [
  "Perlis", "Kedah", "Penang", "Perak", "Kelantan", "Terengganu", "Pahang",
  "Selangor", "Kuala Lumpur", "Putrajaya", "N. Sembilan", "Melaka", "Johor",
  "Sarawak", "Sabah", "Labuan",
] as const;

export type MalaysiaState = (typeof MALAYSIA_STATES)[number];

/** Booking-time citizen record. Deliberately minimal (no MyKad/age/income). */
export interface Citizen {
  id: string;
  name: string;
  /** Verified mobile, hashed for dedupe in storage. */
  mobileHash: string;
  email?: string;
  language: SessionLanguage;
  state: MalaysiaState;
  district: string;
  consent: ConsentRecord;
}

export interface ConsentRecord {
  pdpaAcceptedAt: string; // ISO timestamp
  version: string;
}

export type SlotStatus = "open" | "soft-locked" | "booked" | "completed" | "forfeited";

export interface Slot {
  id: string;
  datetime: string; // ISO
  seatIndex: number;
  status: SlotStatus;
}

export type BookingStatus =
  | "confirmed" | "reminded" | "joined" | "completed" | "no-show" | "cancelled";

export interface Booking {
  reference: string; // TTM-2026-004512
  citizenId: string;
  slotId: string;
  topicCategory?: string;
  status: BookingStatus;
  notificationHistory: NotificationEvent[];
}

export interface NotificationEvent {
  channel: "whatsapp" | "sms" | "email";
  template: string;
  sentAt: string;
  delivered: boolean;
}

export interface Session {
  bookingReference: string;
  startedAt: string;
  endedAt: string;
  transcriptRef: string; // pointer to segregated encrypted store
  recordingRef?: string;
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
  earlyTermination: boolean;
}

/** The per-session AI output (CVIF). */
export type Insight = SessionInsightRecord;

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  /** Immutable, exportable for government audit. */
  readonly hashChainPrev?: string;
}
