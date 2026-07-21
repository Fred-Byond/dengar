/**
 * Digital-human integration contract — §4.3 of the Development Plan.
 *
 * The conversation engine (avatar, voice, multilingual dialogue) already
 * exists and is consumed as a SERVICE (BYOND HoloMe Nexus / the avatar-realism
 * partner SDK). This file is the SEAM: the typed contract the session gateway
 * programs against, so the concrete vendor SDK can be swapped without touching
 * booking, the dashboard, or the CVIF pipeline.
 *
 * Mirrors the CVIF `Scorer` seam (src/lib/cvif/scorer.ts): interface here,
 * vendor adapter behind it, everything downstream unchanged.
 */

import type { SessionLanguage, MalaysiaState } from "../types";

/** Per-session context passed INTO the digital human at session start. */
export interface SessionContext {
  bookingReference: string; // TTM-2026-004512
  citizenName: string; // for the personalised greeting/close
  language: SessionLanguage;
  state: MalaysiaState;
  district: string;
  topicCategory?: string; // optional, chosen at booking
  /** Which behaviour profile the engine should load (see below). */
  behaviourProfile: BehaviourProfileId;
}

/**
 * The controlled-session behaviour profile — configuration on the existing
 * platform, agreed with the Ministry in Phase 0. NOT a new dialogue engine.
 */
export type BehaviourProfileId = "controlled-listening-v1";

export interface BehaviourProfile {
  id: BehaviourProfileId;
  /** Listening-mode guardrails: no policy debate, no promises, signpost only. */
  guardrails: string[];
  /** Phase prompts the engine speaks (localised per language downstream). */
  prompts: {
    welcome: string;
    probe: string;
    confirm: string; // reflect-back summary request
    close: string;
  };
}

/** Returned by initSession — the single-use join handle for the citizen. */
export interface SessionHandle {
  sessionId: string;
  joinUrl: string; // single-use signed link, valid T-15 … T+10
  expiresAt: string; // ISO
}

/** Inbound timing signals the gateway sends TO the engine mid-session. */
export type TimingSignal =
  | "wrap" // 4-minute wrap-up prompt
  | "close" // 5-minute hard close
  | "terminate"; // gateway-initiated early termination (abuse / failure)

/** One transcript turn as delivered by the engine's outbound webhook. */
export interface TranscriptTurnPayload {
  speaker: "minister" | "citizen";
  text: string;
  at: string; // offset within the session, e.g. "2:30"
  languageTag: string; // BCP-47 of the spoken turn
}

/**
 * Outbound webhook payload — delivered within minutes of session close.
 * This is the SINGLE input to the intelligence layer (transcript ingestion
 * → CVIF scorer). See ./gateway#toTranscriptInput.
 */
export interface TranscriptWebhookPayload {
  sessionId: string;
  bookingReference: string;
  language: SessionLanguage;
  state: MalaysiaState;
  district: string;
  topicCategory?: string;
  startedAt: string;
  endedAt: string;
  earlyTermination: boolean;
  turns: TranscriptTurnPayload[];
  recordingRef?: string; // pointer into the segregated encrypted store
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
}

/** Session lifecycle events (started/ended) for ops + booking state machine. */
export interface SessionEvent {
  sessionId: string;
  bookingReference: string;
  type: "started" | "ended";
  at: string;
}
