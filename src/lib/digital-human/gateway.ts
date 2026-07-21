/**
 * Digital-human gateway — the seam the full-stack team implements against the
 * real vendor SDK. Plus the mapper that connects the transcript webhook to the
 * CVIF intelligence layer.
 *
 * IMPLEMENTATION NOTE (for the full-stack team):
 *   1. Pick the vendor (confirm in Phase 0 — HoloMe Nexus / avatar partner SDK).
 *   2. Implement `DigitalHumanGateway` in an adapter, e.g.
 *      src/lib/digital-human/adapters/holome.ts — map initSession/timing/health
 *      onto the SDK. Keep this interface stable.
 *   3. Stand up the webhook ingress (NestJS controller) that receives
 *      TranscriptWebhookPayload, verifies the signature, persists the raw
 *      transcript, then calls `toTranscriptInput` + the CVIF scorer.
 *   4. Swap `MockDigitalHumanGateway` for the adapter behind config.
 */

import type { TranscriptInput } from "../cvif";
import type {
  SessionContext,
  SessionHandle,
  TimingSignal,
  TranscriptWebhookPayload,
} from "./types";

export interface DigitalHumanGateway {
  /** Boot a session with per-citizen context; returns the single-use join handle. */
  initSession(ctx: SessionContext): Promise<SessionHandle>;
  /** Send a mid-session timing signal (4-min wrap, 5-min close, terminate). */
  sendTimingSignal(sessionId: string, signal: TimingSignal): Promise<void>;
  /** Pre-session readiness probe of the digital-human service. */
  healthCheck(): Promise<boolean>;
}

/**
 * Maps the engine's transcript webhook onto the CVIF scorer's input. This is
 * the one line that joins the digital human to the intelligence layer:
 *
 *   const insight = deterministicScorer.score(toTranscriptInput(payload));
 *
 * Swapping deterministicScorer for the LLM scorer changes nothing here.
 */
export function toTranscriptInput(payload: TranscriptWebhookPayload): TranscriptInput {
  return {
    reference: payload.bookingReference,
    language: payload.language,
    state: payload.state,
    district: payload.district,
    topicHint: payload.topicCategory,
    turns: payload.turns.map((t) => ({
      speaker: t.speaker,
      text: t.text,
      at: t.at,
    })),
  };
}

/**
 * Stub adapter for local dev / the demo. Returns a fake join handle and no-ops
 * the timing signals. The real adapter replaces this behind configuration.
 */
export class MockDigitalHumanGateway implements DigitalHumanGateway {
  async initSession(ctx: SessionContext): Promise<SessionHandle> {
    return {
      sessionId: `mock-${ctx.bookingReference}`,
      joinUrl: `/experience?ref=${encodeURIComponent(ctx.bookingReference)}`,
      expiresAt: new Date(Date.now() + 25 * 60_000).toISOString(),
    };
  }
  async sendTimingSignal(_sessionId: string, _signal: TimingSignal): Promise<void> {
    // no-op in the mock; the real adapter calls the SDK
  }
  async healthCheck(): Promise<boolean> {
    return true;
  }
}
