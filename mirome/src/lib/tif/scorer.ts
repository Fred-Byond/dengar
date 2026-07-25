/**
 * TIF scoring pipeline.
 *
 * `Scorer` is the SEAM. The deterministic implementation below is transparent,
 * offline and testable; the production LLM structured-extraction pass
 * implements the same interface and drops in behind it, so the aggregations,
 * the dashboards and the facilitator pack never change shape.
 *
 * Scoring rules that are NOT negotiable, whichever implementation is used:
 *   1. Every score points at a verbatim quote, or declares NE / IE.
 *   2. Confidence is reported, never implied.
 *   3. Excluded confounds (see ./constructs) never move a score.
 *   4. Technical failure is a system-quality problem, not weak performance.
 *   5. Consequential or low-confidence findings route to a human (§16.4).
 */

import {
  CAPABILITIES,
  CLIMATE,
  HUMAN_REVIEW_TRIGGERS,
} from "./constructs";
import { SCENARIO_BY_ID, scoreFromObservations } from "./scenarios";
import { detectThemes } from "./taxonomy";
import type {
  CapabilityScore,
  Confidence,
  ConfirmationCode,
  ParticipantInsightRecord,
  ScenarioObservation,
  ScoredDimension,
  TranscriptInput,
  TranscriptTurn,
} from "./types";

export interface Scorer {
  readonly id: string;
  score(input: TranscriptInput): ParticipantInsightRecord;
}

/* ------------------------------------------------------------------ */

/** Behavioural cues per capability. Deliberately about CONTENT, not style. */
const CUES: Record<string, string[]> = {
  communication: [
    "to be clear", "what happened", "i explained", "impact", "let me check",
    "so that", "i asked them",
  ],
  empathy: [
    "they were", "their side", "under pressure", "understand why",
    "their workload", "constraint",
  ],
  assertiveness: [
    "i told", "i raised", "my concern", "escalate", "i disagreed",
    "i pushed back", "i asked for",
  ],
  problemSolving: [
    "we agreed", "next step", "owner", "propose", "option", "alternative",
    "actual problem", "root cause",
  ],
  criticalThinking: [
    "depends", "i checked", "assume", "evidence", "unless",
    "on the other hand", "might be",
  ],
  stress: [
    "step back", "prioritis", "defer", "re-plan", "calm", "triage", "drop",
  ],
};

const MARKER_TARGET = 4;

function participantText(turns: TranscriptTurn[], scenarioId?: string): string {
  return turns
    .filter((t) => t.speaker === "participant")
    .filter((t) => (scenarioId ? t.scenarioId === scenarioId : true))
    .map((t) => t.text)
    .join(" ");
}

function longestQuote(turns: TranscriptTurn[], cue: string): string | null {
  const hits = turns
    .filter((t) => t.speaker === "participant")
    .filter((t) => t.text.toLowerCase().includes(cue))
    .sort((a, b) => b.text.length - a.text.length);
  return hits[0]?.text ?? null;
}

function confidenceFor(words: number, hits: number): Confidence {
  if (words < 12) return "insufficient";
  if (words < 30) return "low";
  if (hits >= 3 && words >= 60) return "high";
  return "moderate";
}

function scoreCapability(
  id: string,
  turns: TranscriptTurn[]
): ScoredDimension<CapabilityScore> {
  const text = participantText(turns).toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  const cues = CUES[id] ?? [];
  const matched = cues.filter((c) => text.includes(c));
  const confidence = confidenceFor(words, matched.length);

  if (words === 0) {
    return { value: "NE", confidence: "insufficient", evidenceQuote: null };
  }
  if (confidence === "insufficient") {
    return { value: "IE", confidence, evidenceQuote: null };
  }

  const value = scoreFromObservations(
    Math.min(matched.length, MARKER_TARGET),
    MARKER_TARGET
  );
  const quote = matched.length ? longestQuote(turns, matched[0]) : null;
  return { value, confidence, evidenceQuote: quote };
}

function scoreScenario(
  scenarioId: string,
  turns: TranscriptTurn[]
): ScenarioObservation | null {
  const spec = SCENARIO_BY_ID[scenarioId];
  if (!spec) return null;
  const scoped = turns.filter((t) => t.scenarioId === scenarioId);
  const text = participantText(scoped).toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;

  if (words === 0) {
    return {
      scenarioId,
      observed: [],
      notObserved: spec.observed,
      capabilityScores: {},
      evidenceQuote: null,
      confidence: "insufficient",
    };
  }

  // A behaviour counts as observed when the response carries a cue from any
  // capability the behaviour belongs to. Deterministic stand-in for the
  // production extraction pass, which reads the behaviour directly.
  const observed: string[] = [];
  const notObserved: string[] = [];
  spec.observed.forEach((behaviour, i) => {
    const capId = spec.capabilities[i % spec.capabilities.length];
    const cues = CUES[capId] ?? [];
    if (cues.some((c) => text.includes(c))) observed.push(behaviour);
    else notObserved.push(behaviour);
  });

  const capabilityScores: Partial<Record<string, CapabilityScore>> = {};
  spec.capabilities.forEach((capId) => {
    capabilityScores[capId] = scoreCapability(capId, scoped).value;
  });

  return {
    scenarioId,
    observed,
    notObserved,
    capabilityScores,
    evidenceQuote: scoped.find((t) => t.speaker === "participant")?.text ?? null,
    confidence: confidenceFor(words, observed.length),
  };
}

/**
 * Only non-scenario turns are quotable. A scenario answer is a hypothetical
 * role-play, not a statement about this team — quoting it in a team report
 * would misrepresent the participant.
 */
function pickAnonymisedQuote(turns: TranscriptTurn[]): string | null {
  const candidates = turns
    .filter((t) => t.speaker === "participant" && !t.scenarioId)
    .map((t) => t.text.trim())
    .filter((t) => t.length > 40 && t.length < 220)
    // Never surface a quote that names an individual.
    .filter((t) => !/\b(mr|ms|mrs|encik|puan|datuk|dato)\b/i.test(t));
  return candidates.sort((a, b) => b.length - a.length)[0] ?? null;
}

/**
 * §9 Stage 6 — the participant is read a summary and asked to confirm it.
 * Confirmation is evidence about the RECORD, not about the participant.
 */
function confirmationFor(words: number, turns: TranscriptTurn[]): ConfirmationCode {
  if (words === 0) return "NE";
  const last = turns.filter((t) => t.speaker === "participant").at(-1)?.text ?? "";
  const lower = last.toLowerCase();
  if (/\bnot (right|correct)|that is wrong|no, /.test(lower)) return "NC";
  if (/\bbut |actually |more like |rather /.test(lower)) return "CC";
  return "C";
}

function buildSummary(
  input: TranscriptInput,
  themes: string[],
  priority: string | null
): string {
  const dept = input.context.department;
  const themeLabel = themes.length ? themes.join(", ") : "general team experience";
  const ask = priority ? ` The improvement asked for is ${priority.toLowerCase()}.` : "";
  return `A ${input.context.roleLevel.toLowerCase()} in ${dept} described their experience of ${themeLabel}.${ask}`;
}

/* ------------------------------------------------------------------ */

export const deterministicScorer: Scorer = {
  id: "tif-deterministic-v1",

  score(input: TranscriptInput): ParticipantInsightRecord {
    const { turns } = input;

    const capabilities: Record<string, ScoredDimension<CapabilityScore>> = {};
    CAPABILITIES.forEach((c) => {
      capabilities[c.id] = scoreCapability(c.id, turns);
    });

    const climate: Record<string, number> = {};
    CLIMATE.forEach((c) => {
      const pulsed = input.pulse[c.id];
      if (pulsed) climate[c.id] = pulsed;
    });

    const scenarioIds = Array.from(
      new Set(turns.map((t) => t.scenarioId).filter(Boolean) as string[])
    );
    const scenarios = scenarioIds
      .map((id) => scoreScenario(id, turns))
      .filter(Boolean) as ScenarioObservation[];

    const allText = participantText(turns);
    // Themes describe THIS team, so only non-scenario turns count — a
    // role-play answer is about a hypothetical, not about the workplace.
    const themes = detectThemes(
      participantText(turns.filter((t) => !t.scenarioId))
    );

    const reflectionTurns = turns.filter(
      (t) => t.speaker === "participant" && !t.scenarioId
    );
    const reflection = {
      strength: reflectionTurns.at(-4)?.text ?? null,
      obstacle: reflectionTurns.at(-3)?.text ?? null,
      priority: reflectionTurns.at(-2)?.text ?? null,
      personalAction: reflectionTurns.at(-1)?.text ?? null,
    };

    const words = allText.split(/\s+/).filter(Boolean).length;
    const confirmation = confirmationFor(words, turns);

    // --- governance: route to a human where the paper requires it ---
    const humanReviewReasons: string[] = [];
    const lower = allText.toLowerCase();
    if (
      /harass|bully|discriminat|threat|unsafe|retaliat/.test(lower)
    ) {
      humanReviewReasons.push(HUMAN_REVIEW_TRIGGERS[1]);
    }
    if (/\b(mr|ms|mrs|encik|puan|datuk|dato)\b/i.test(allText)) {
      humanReviewReasons.push(HUMAN_REVIEW_TRIGGERS[2]);
    }
    const lowConfidence = Object.values(capabilities).some(
      (c) => c.confidence === "low" || c.confidence === "insufficient"
    );
    const weakClimate = Object.values(climate).some((v) => v <= 2);
    if (lowConfidence && weakClimate) {
      humanReviewReasons.push(HUMAN_REVIEW_TRIGGERS[0]);
    }
    if (confirmation === "NC") humanReviewReasons.push(HUMAN_REVIEW_TRIGGERS[4]);

    return {
      reference: input.reference,
      wave: input.wave,
      context: input.context,
      capabilities,
      climate: climate as ParticipantInsightRecord["climate"],
      scenarios,
      reflection,
      themes,
      anonymisedQuote: pickAnonymisedQuote(turns),
      summary: buildSummary(input, themes, reflection.priority),
      confirmation,
      humanReview: humanReviewReasons.length > 0,
      humanReviewReasons,
    };
  },
};
