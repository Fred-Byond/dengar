/**
 * Digital-human gateway — the seam the full-stack team implements against the
 * real vendor SDK. Plus the mapper that connects the transcript webhook to the
 * TIF intelligence layer.
 *
 * IMPLEMENTATION NOTE (for the full-stack team):
 *   1. Confirm the engine in Phase 1 (HoloMe Nexus / avatar partner SDK).
 *   2. Implement `DigitalHumanGateway` in an adapter, e.g.
 *      src/lib/digital-human/adapters/holome.ts — map initSession/timing/health
 *      onto the SDK. Keep this interface stable.
 *   3. Stand up the webhook ingress that receives TranscriptWebhookPayload,
 *      verifies the signature, persists the raw transcript, then calls
 *      `toTranscriptInput` + the TIF scorer.
 *   4. Swap `MockDigitalHumanGateway` for the adapter behind config.
 */

import type { TranscriptInput } from "../tif/types";
import type {
  BehaviourProfile,
  SessionContext,
  SessionHandle,
  TimingSignal,
  TranscriptWebhookPayload,
} from "./types";

export interface DigitalHumanGateway {
  /** Boot a session with per-participant context; returns the join handle. */
  initSession(ctx: SessionContext): Promise<SessionHandle>;
  /** Send a mid-session timing signal (wrap, close, terminate). */
  sendTimingSignal(sessionId: string, signal: TimingSignal): Promise<void>;
  /** Pre-session readiness probe of the digital-human service. */
  healthCheck(): Promise<boolean>;
}

/**
 * The one profile the MVP ships. The guardrails are product requirements, not
 * suggestions — §16.3 (no hidden disciplinary use) and §23.3 (employee trust
 * is the precondition for the data being worth anything).
 */
export const TEAM_DIAGNOSIS_PROFILE: BehaviourProfile = {
  id: "team-diagnosis-v1",
  guardrails: [
    "Never evaluate the participant as a person; assess the working situation they describe.",
    "Never give advice, coaching or a verdict during the session.",
    "Never repeat a named individual back to the participant; redirect to the behaviour or the process.",
    "Never imply the assessment affects pay, promotion or discipline.",
    "If distress or a safety issue is disclosed, acknowledge, stop probing, and route to human review.",
    "Confirm the summary before closing; the participant may correct it.",
  ],
  prompts: {
    consent:
      "Before we start, I will explain what this is for, what is recorded, and who sees it. You can stop at any time.",
    context:
      "A few short questions about where you sit — department, role level, how long you have been with the team.",
    experience:
      "Now tell me how the work actually flows in your team, in your own words.",
    scenario:
      "I would like to put a short workplace situation to you. There is no right answer — I want to know what you would actually do.",
    reflection:
      "One strength of this team, one obstacle, one thing you would change, and one thing you will do yourself.",
    confirm:
      "Here is what I have recorded. Tell me if any of it is wrong and I will correct it.",
    close:
      "Thank you. Your responses go into the team-level results only — no individual report goes to your manager.",
  },
};

/**
 * Maps the engine's transcript webhook onto the TIF scorer's input. This is
 * the one line that joins the digital human to the intelligence layer:
 *
 *   const insight = deterministicScorer.score(toTranscriptInput(payload));
 *
 * Swapping deterministicScorer for the LLM scorer changes nothing here.
 */
export function toTranscriptInput(payload: TranscriptWebhookPayload): TranscriptInput {
  return {
    reference: payload.reference,
    wave: payload.wave,
    context: payload.context,
    pulse: payload.pulse,
    turns: payload.turns.map((t) => ({
      speaker: t.speaker,
      text: t.text,
      at: t.at,
      scenarioId: t.scenarioId,
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
      sessionId: `mock-${ctx.reference}`,
      joinUrl: `/experience?ref=${encodeURIComponent(ctx.reference)}`,
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
