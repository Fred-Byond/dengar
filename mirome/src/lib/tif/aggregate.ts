/**
 * Team Intelligence Engine (§Component 4).
 *
 * Converts de-identified Participant Insight Records into the team-level view.
 * Rules the aggregation enforces:
 *   · minimum group size before anything is displayed (§16.2)
 *   · distinct constructs stay visible — no universal team score (§4.3)
 *   · confidence and sample size travel with every number
 *   · the perception GAP is reported as a first-class result (§11 Dashboard 2)
 */

import {
  CAPABILITY_BY_ID,
  CLIMATE,
  CLIMATE_BY_ID,
  MIN_SEGMENT_N,
  levelFor,
  levelForCapability,
} from "./constructs";
import { CONSTRUCT_OWNER } from "./taxonomy";
import { interventionFor } from "./interventions";
import type {
  CapabilityScore,
  Confidence,
  ConstructResult,
  InterventionPriority,
  LikertScore,
  ParticipantInsightRecord,
  PerceptionGap,
  SegmentProfile,
  TeamIntelligenceProfile,
  Wave,
} from "./types";

/** Likert 1–5 → 0–100 index. */
export const toIndex = (mean: number) => Math.round(((mean - 1) / 4) * 1000) / 10;

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  const v = values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(v);
}

function confidenceFor(n: number, spread: number): Confidence {
  if (n < MIN_SEGMENT_N) return "insufficient";
  if (n >= 20 && spread < 1.0) return "high";
  if (n >= 10) return "moderate";
  return "low";
}

function distribution(values: number[]): [number, number, number, number, number] {
  const d: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  values.forEach((v) => {
    const i = Math.min(4, Math.max(0, Math.round(v) - 1));
    d[i] += 1;
  });
  return d;
}

/** Numeric value of a capability score, ignoring non-scores. */
function capValue(score: CapabilityScore): number | null {
  return typeof score === "number" ? score : null;
}

export function climateResults(
  records: ParticipantInsightRecord[],
  minN = MIN_SEGMENT_N
): ConstructResult[] {
  return CLIMATE.map((spec) => {
    const values = records
      .map((r) => r.climate[spec.id])
      .filter((v): v is LikertScore => typeof v === "number");
    const n = values.length;
    const mean = n ? values.reduce((a, b) => a + b, 0) / n : 0;
    const spread = stddev(values);
    const index = n ? toIndex(mean) : 0;
    return {
      id: spec.id,
      name: spec.name,
      layer: 2 as const,
      index,
      level: levelFor(index, n, minN),
      n,
      distribution: distribution(values),
      spread: Math.round(spread * 100) / 100,
      confidence: confidenceFor(n, spread),
    };
  });
}

export function capabilityResults(
  records: ParticipantInsightRecord[],
  minN = MIN_SEGMENT_N
): ConstructResult[] {
  const ids = Object.keys(CAPABILITY_BY_ID);
  return ids.map((id) => {
    const values = records
      .map((r) => capValue(r.capabilities[id]?.value ?? "IE"))
      .filter((v): v is number => v !== null);
    const n = values.length;
    const mean = n ? values.reduce((a, b) => a + b, 0) / n : 0;
    const spread = stddev(values);
    const index = n ? toIndex(mean) : 0;
    return {
      id,
      name: CAPABILITY_BY_ID[id].name,
      layer: 1 as const,
      index,
      level: levelForCapability(index, n, minN),
      n,
      distribution: distribution(values),
      spread: Math.round(spread * 100) / 100,
      confidence: confidenceFor(n, spread),
    };
  });
}

export function perceptionGaps(
  records: ParticipantInsightRecord[],
  minN = MIN_SEGMENT_N
): PerceptionGap[] {
  const managers = records.filter((r) => r.context.managesPeople);
  const staff = records.filter((r) => !r.context.managesPeople);

  return CLIMATE.map((spec) => {
    const mv = managers
      .map((r) => r.climate[spec.id])
      .filter((v): v is LikertScore => typeof v === "number");
    const sv = staff
      .map((r) => r.climate[spec.id])
      .filter((v): v is LikertScore => typeof v === "number");
    const mIdx = mv.length ? toIndex(mv.reduce((a, b) => a + b, 0) / mv.length) : 0;
    const sIdx = sv.length ? toIndex(sv.reduce((a, b) => a + b, 0) / sv.length) : 0;
    const suppressed = mv.length < minN || sv.length < minN;
    return {
      constructId: spec.id,
      constructName: spec.name,
      managerIndex: mIdx,
      managerN: mv.length,
      staffIndex: sIdx,
      staffN: sv.length,
      gap: Math.round((mIdx - sIdx) * 10) / 10,
      suppressed,
    };
  }).sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
}

export function segmentProfiles(
  records: ParticipantInsightRecord[],
  key: (r: ParticipantInsightRecord) => string,
  minN = MIN_SEGMENT_N
): SegmentProfile[] {
  const groups = new Map<string, ParticipantInsightRecord[]>();
  records.forEach((r) => {
    const k = key(r);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  });

  return Array.from(groups.entries())
    .map(([segment, rs]) => {
      const scores: Record<string, number> = {};
      CLIMATE.forEach((spec) => {
        const values = rs
          .map((r) => r.climate[spec.id])
          .filter((v): v is LikertScore => typeof v === "number");
        scores[spec.id] = values.length
          ? toIndex(values.reduce((a, b) => a + b, 0) / values.length)
          : 0;
      });
      const suppressed = rs.length < minN;
      const weakest = suppressed
        ? null
        : Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0];
      return { segment, n: rs.length, suppressed, scores, weakest };
    })
    .sort((a, b) => b.n - a.n);
}

/**
 * §11 Dashboard 4 — ranks priorities by scale × spread × confidence, not by
 * raw score alone. A weak construct that only one small segment reports is a
 * different problem from a weak construct the whole organisation reports.
 */
export function interventionPriorities(
  records: ParticipantInsightRecord[],
  climate: ConstructResult[],
  segments: SegmentProfile[]
): InterventionPriority[] {
  const orgMean = (id: string) =>
    climate.find((c) => c.id === id)?.index ?? 0;

  return climate
    .filter((c) => c.level !== "Insufficient Evidence")
    .map((c) => {
      const spec = CLIMATE_BY_ID[c.id];
      const affected =
        records.filter((r) => (r.climate[c.id] ?? 5) <= 3).length /
        Math.max(1, records.filter((r) => r.climate[c.id] !== undefined).length);
      const concentratedIn = segments
        .filter((s) => !s.suppressed && s.scores[c.id] < orgMean(c.id) - 8)
        .sort((a, b) => a.scores[c.id] - b.scores[c.id])
        .map((s) => s.segment)
        .slice(0, 3);
      const confidenceWeight =
        c.confidence === "high" ? 1 : c.confidence === "moderate" ? 0.85 : 0.6;
      const priorityScore =
        Math.round(
          (100 - c.index) * (0.5 + affected) * confidenceWeight * 10
        ) / 10;

      return {
        rank: 0,
        constructId: c.id,
        constructName: c.name,
        finding:
          c.index < 66 ? spec.weakFinding : spec.strongFinding,
        index: c.index,
        level: c.level,
        affectedShare: Math.round(affected * 100),
        concentratedIn,
        confidence: c.confidence,
        priorityScore,
        interventionId: interventionFor(c.id)?.id ?? "",
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export function recommendedOwner(constructId: string): string {
  return CONSTRUCT_OWNER[constructId] ?? "od";
}

/** Assemble everything the dashboards read. */
export function buildProfile(
  organisation: string,
  wave: Wave,
  records: ParticipantInsightRecord[],
  invited: number,
  extras: Pick<
    TeamIntelligenceProfile,
    "themes" | "suggestions" | "voices" | "flags"
  >
): TeamIntelligenceProfile {
  const climate = climateResults(records);
  const capabilities = capabilityResults(records);
  const segments = segmentProfiles(records, (r) => r.context.department);
  const priorities = interventionPriorities(records, climate, segments);

  return {
    organisation,
    wave,
    participation: {
      invited,
      completed: records.length,
      completionRate: invited
        ? Math.round((records.length / invited) * 1000) / 10
        : 0,
      humanReview: records.filter((r) => r.humanReview).length,
    },
    climate,
    capabilities,
    gaps: perceptionGaps(records),
    segments,
    priorities,
    ...extras,
  };
}
