/**
 * Employee perception (§Component 4, dashboard layer).
 *
 * The question a CEO actually asks is "how do our people see this company,
 * and is it getting better?" — and the honest answer is not one number.
 * A single engagement score is what makes these surveys useless: it moves
 * two points, nobody knows why, and nobody can act on it.
 *
 * So perception is reported in three bands that map to three different
 * owners and three different fixes:
 *
 *   · SAFETY TO SPEAK  — is it safe to be honest here?   → executive committee
 *   · ABILITY TO DELIVER — can I actually get work done?  → operations, line mgmt
 *   · ABILITY TO ABSORB  — do we cope when it changes?    → OD, L&D
 *
 * Each band keeps its constructs visible underneath, carries its own
 * confidence, and is reported with direction against the previous wave.
 * The bands are never summed. A company can be strong on delivery and
 * unsafe to speak in, and averaging those two hides the only finding that
 * matters.
 */

import { CLIMATE_BY_ID, MIN_SEGMENT_N } from "./constructs";
import type { Confidence, ConstructResult, SegmentProfile } from "./types";

export interface PerceptionBandSpec {
  id: string;
  name: string;
  /** What the band answers, in the employee's own framing. */
  question: string;
  /** Why a company should care — the cost of getting this wrong. */
  stake: string;
  constructIds: string[];
  /** Who owns the band when it is weak. */
  owner: string;
}

export const PERCEPTION_BANDS: PerceptionBandSpec[] = [
  {
    id: "voice",
    name: "Safety to speak",
    question: "Can I say what I actually think here?",
    stake:
      "When this is weak the company stops hearing about problems while they are still cheap to fix. Every other number becomes less trustworthy, including this survey.",
    constructIds: ["psychSafety", "trust", "leadershipOpenness", "inclusion"],
    owner: "exco",
  },
  {
    id: "delivery",
    name: "Ability to deliver",
    question: "Can I get my work done without fighting the organisation?",
    stake:
      "This is where wasted effort lives — rework, duplicated work, decisions that stall. It shows up in cost and in delivery dates before it shows up in attrition.",
    constructIds: ["roleClarity", "goalAlignment", "collaboration", "accountability"],
    owner: "pmo",
  },
  {
    id: "absorb",
    name: "Ability to absorb change",
    question: "When things go wrong or change, do we cope?",
    stake:
      "Predicts what happens to the company under pressure — a reorganisation, a lost client, a new system. Weak here means every change costs more than it should.",
    constructIds: ["conflict", "resilience"],
    owner: "od",
  },
];

export type Direction = "improving" | "steady" | "slipping" | "new";

export interface PerceptionBand {
  id: string;
  name: string;
  question: string;
  stake: string;
  owner: string;
  /** 0–100, mean of the band's constructs. Never merged across bands. */
  index: number;
  /** Change against the comparison wave, in index points. */
  delta: number | null;
  direction: Direction;
  confidence: Confidence;
  /** Weakest construct inside the band — the thing to actually fix. */
  weakest: { id: string; name: string; index: number } | null;
  /** Every construct stays visible under the band. */
  constructs: { id: string; name: string; index: number; delta: number | null }[];
  /** Share of participants answering at or below "neither" on this band. */
  unfavourableShare: number;
}

export interface PerceptionSegment {
  segment: string;
  n: number;
  suppressed: boolean;
  /** bandId → index. */
  bands: Record<string, number>;
  /** Band where this segment is furthest below the organisation. */
  worstBand: string | null;
  /** Index points below the organisation on that band. */
  worstGap: number;
}

export interface PerceptionRead {
  bands: PerceptionBand[];
  segments: PerceptionSegment[];
  /** The single sentence a CEO can repeat, derived not written. */
  headline: string;
  /** Constructs that moved materially since the comparison wave. */
  movers: { id: string; name: string; delta: number; direction: Direction }[];
  /** What this instrument cannot tell you — stated, not implied. */
  limits: string[];
}

/** Below this, a change is inside the noise of a sample this size. */
const MATERIAL_DELTA = 2.5;

function directionFor(delta: number | null): Direction {
  if (delta === null) return "new";
  if (delta >= MATERIAL_DELTA) return "improving";
  if (delta <= -MATERIAL_DELTA) return "slipping";
  return "steady";
}

/** The weakest link governs — a band is only as good as its worst construct. */
function bandConfidence(parts: ConstructResult[]): Confidence {
  const order: Confidence[] = ["insufficient", "low", "moderate", "high"];
  return parts.reduce<Confidence>(
    (worst, c) => (order.indexOf(c.confidence) < order.indexOf(worst) ? c.confidence : worst),
    "high"
  );
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function perceptionRead(
  climate: ConstructResult[],
  segments: SegmentProfile[],
  previousClimate?: ConstructResult[]
): PerceptionRead {
  const byId = new Map(climate.map((c) => [c.id, c]));
  const prevById = new Map((previousClimate ?? []).map((c) => [c.id, c]));

  const bands: PerceptionBand[] = PERCEPTION_BANDS.map((spec) => {
    const parts = spec.constructIds
      .map((id) => byId.get(id))
      .filter((c): c is ConstructResult => Boolean(c));

    const constructs = parts.map((c) => {
      const prev = prevById.get(c.id);
      return {
        id: c.id,
        name: c.name,
        index: c.index,
        delta: prev ? Math.round((c.index - prev.index) * 10) / 10 : null,
      };
    });

    const index = mean(parts.map((c) => c.index));
    const prevIndex = previousClimate?.length
      ? mean(
          spec.constructIds
            .map((id) => prevById.get(id))
            .filter((c): c is ConstructResult => Boolean(c))
            .map((c) => c.index)
        )
      : null;
    const delta = prevIndex === null ? null : Math.round((index - prevIndex) * 10) / 10;

    /* Distribution is already carried on every construct, so the share of
       people who are NOT positive is available without re-reading records —
       and it is a far more useful number than the mean for a board. */
    const totals = parts.reduce(
      (acc, c) => {
        const n = c.distribution.reduce((a, b) => a + b, 0);
        return {
          unfavourable: acc.unfavourable + c.distribution[0] + c.distribution[1] + c.distribution[2],
          all: acc.all + n,
        };
      },
      { unfavourable: 0, all: 0 }
    );

    const weakest = parts.length
      ? parts.reduce((w, c) => (c.index < w.index ? c : w))
      : null;

    return {
      id: spec.id,
      name: spec.name,
      question: spec.question,
      stake: spec.stake,
      owner: spec.owner,
      index,
      delta,
      direction: directionFor(delta),
      confidence: bandConfidence(parts),
      weakest: weakest ? { id: weakest.id, name: weakest.name, index: weakest.index } : null,
      constructs,
      unfavourableShare: totals.all
        ? Math.round((totals.unfavourable / totals.all) * 1000) / 10
        : 0,
    };
  });

  const bandIndex = new Map(bands.map((b) => [b.id, b.index]));

  const perceptionSegments: PerceptionSegment[] = segments.map((seg) => {
    if (seg.suppressed || seg.n < MIN_SEGMENT_N) {
      return {
        segment: seg.segment,
        n: seg.n,
        suppressed: true,
        bands: {},
        worstBand: null,
        worstGap: 0,
      };
    }
    const segBands: Record<string, number> = {};
    PERCEPTION_BANDS.forEach((spec) => {
      const vals = spec.constructIds
        .map((id) => seg.scores[id])
        .filter((v): v is number => typeof v === "number");
      if (vals.length) segBands[spec.id] = mean(vals);
    });
    let worstBand: string | null = null;
    let worstGap = 0;
    Object.entries(segBands).forEach(([id, v]) => {
      const org = bandIndex.get(id) ?? v;
      const gap = Math.round((v - org) * 10) / 10;
      if (gap < worstGap) {
        worstGap = gap;
        worstBand = id;
      }
    });
    return { segment: seg.segment, n: seg.n, suppressed: false, bands: segBands, worstBand, worstGap };
  });

  const movers = Array.from(byId.values())
    .map((c) => {
      const prev = prevById.get(c.id);
      if (!prev) return null;
      const delta = Math.round((c.index - prev.index) * 10) / 10;
      return { id: c.id, name: c.name, delta, direction: directionFor(delta) };
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m) && Math.abs(m!.delta) >= MATERIAL_DELTA)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const weakestBand = bands.reduce((w, b) => (b.index < w.index ? b : w), bands[0]);
  const strongestBand = bands.reduce((s, b) => (b.index > s.index ? b : s), bands[0]);
  const headline =
    weakestBand && strongestBand
      ? `${strongestBand.name.toLowerCase()} is this organisation's strength at ${strongestBand.index}; ` +
        `${weakestBand.name.toLowerCase()} is the constraint at ${weakestBand.index}, ` +
        `with ${weakestBand.unfavourableShare}% of responses not positive` +
        (weakestBand.weakest ? ` and ${weakestBand.weakest.name.toLowerCase()} the weakest link inside it` : "") +
        "."
      : "Insufficient evidence for a headline.";

  return {
    bands,
    segments: perceptionSegments,
    headline: headline.charAt(0).toUpperCase() + headline.slice(1),
    movers,
    limits: [
      "This measures how the organisation is experienced, not how any individual performs. No score here belongs to a named employee.",
      "It cannot tell you who said what. Groups below five people are never displayed, under any filter.",
      "It is a diagnosis, not a prediction. It does not forecast attrition, revenue or performance, and should not be presented as if it does.",
      "Movement under 2.5 index points is inside the noise for a sample this size and is reported as steady.",
    ],
  };
}

/** Convenience: the band a construct belongs to, for cross-linking views. */
export const BAND_FOR_CONSTRUCT: Record<string, string> = Object.fromEntries(
  PERCEPTION_BANDS.flatMap((b) => b.constructIds.map((c) => [c, b.id]))
);

/** Guard against a construct silently dropping out of every band. */
export function unbandedConstructs(): string[] {
  return Object.keys(CLIMATE_BY_ID).filter((id) => !BAND_FOR_CONSTRUCT[id]);
}
