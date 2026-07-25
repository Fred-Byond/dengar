/**
 * Digital-human integration contract (§Component 2).
 *
 * The conversation engine (avatar, voice, multilingual dialogue) already
 * exists inside BYOND and is consumed as a SERVICE. This file is the SEAM:
 * the typed contract the session gateway programs against, so the concrete
 * vendor SDK can be swapped without touching the participant portal, the
 * dashboards or the TIF pipeline.
 *
 * Mirrors the TIF `Scorer` seam (src/lib/tif/scorer.ts): interface here,
 * vendor adapter behind it, everything downstream unchanged.
 */

import type {
  LikertScore,
  ParticipantContext,
  Wave,
} from "../tif/types";

/** Per-session context passed INTO the digital human at session start. */
export interface SessionContext {
  /** Assessment reference. Never a name — the engine does not receive PII. */
  reference: string;
  /** First name for the greeting only, supplied at runtime and not stored. */
  greetingName: string;
  languageTag: string;
  wave: Wave;
  context: ParticipantContext;
  /** Which behaviour profile the engine should load (see below). */
  behaviourProfile: BehaviourProfileId;
  /** Scenario ids selected for this participant (§Component 5). */
  scenarioIds: string[];
}

/**
 * The controlled-session behaviour profile — configuration on the existing
 * platform, agreed with the client in Phase 1. NOT a new dialogue engine.
 */
export type BehaviourProfileId = "team-diagnosis-v1";

export interface BehaviourProfile {
  id: BehaviourProfileId;
  /**
   * Interview-mode guardrails: no advice, no evaluation of the person, no
   * disciplinary framing, no naming of individuals back to the participant.
   */
  guardrails: string[];
  /** Phase prompts the engine speaks (localised per language downstream). */
  prompts: {
    consent: string;
    context: string;
    experience: string;
    scenario: string;
    reflection: string;
    confirm: string;
    close: string;
  };
}

/** Returned by initSession — the single-use join handle for the participant. */
export interface SessionHandle {
  sessionId: string;
  joinUrl: string; // single-use signed link
  expiresAt: string; // ISO
}

/** Inbound timing signals the gateway sends TO the engine mid-session. */
export type TimingSignal =
  | "wrap" // approaching the time budget
  | "close" // hard close
  | "terminate"; // gateway-initiated early termination

/** One transcript turn as delivered by the engine's outbound webhook. */
export interface TranscriptTurnPayload {
  speaker: "interviewer" | "participant";
  text: string;
  at: string; // offset within the session, e.g. "3:20"
  languageTag: string; // BCP-47 of the spoken turn
  scenarioId?: string;
}

/**
 * Outbound webhook payload — delivered within minutes of session close.
 * This is the SINGLE input to the intelligence layer (transcript ingestion
 * → TIF scorer). See ./gateway#toTranscriptInput.
 */
export interface TranscriptWebhookPayload {
  sessionId: string;
  reference: string;
  wave: Wave;
  context: ParticipantContext;
  /** Pulse-survey answers captured in the portal before the interview. */
  pulse: Record<string, LikertScore>;
  startedAt: string;
  endedAt: string;
  earlyTermination: boolean;
  turns: TranscriptTurnPayload[];
  /** Pointer into the segregated encrypted store, if recording was consented. */
  recordingRef?: string;
  /** Did the participant confirm the reflected summary? (§9 Stage 6) */
  summaryConfirmed?: boolean;
}

/** Session lifecycle events for ops + the completion tracker. */
export interface SessionEvent {
  sessionId: string;
  reference: string;
  type: "started" | "ended";
  at: string;
}
