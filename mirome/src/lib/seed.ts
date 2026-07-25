/**
 * Deterministic synthetic assessment dataset.
 *
 * Every participant is generated as a TRANSCRIPT and then scored by the real
 * TIF scorer (src/lib/tif/scorer.ts) — the dashboards are wired to the same
 * pipeline production will use, not to hand-written dashboard numbers. Swap
 * `deterministicScorer` for the LLM extraction pass and nothing downstream
 * changes shape.
 *
 * Synthetic data only. No real employee, team or company is represented.
 */

import {
  ACTION_LINES,
  ARRANGEMENTS,
  BASE_CLIMATE,
  CAP_BIAS,
  CAP_FRAGMENTS,
  CAP_IDS,
  CONCERN_LINES,
  DEPARTMENTS,
  LANGUAGES,
  ORGANISATION,
  PRIORITY_LINES,
  ROLE_LEVELS,
  ROLE_WEIGHTS,
  STRENGTH_LINES,
  TENURES,
  TOTAL_INVITED,
  hash,
  rnd,
} from "./org";
import { CLIMATE, THEME_BY_ID } from "./tif";
import { SCENARIOS } from "./tif/scenarios";
import { deterministicScorer } from "./tif/scorer";
import type {
  LikertScore,
  ParticipantInsightRecord,
  RoleLevel,
  TeamIntelligenceProfile,
  TranscriptInput,
  TranscriptTurn,
  Wave,
} from "./tif/types";
import { buildProfile } from "./tif/aggregate";

/** Constructs the recommended programme is designed to move. */
export const TARGETED = ["collaboration", "roleClarity", "psychSafety", "goalAlignment"];

/**
 * Wave effects. Immediate post-programme enthusiasm lifts everything; by day 30
 * that fades and only the targeted constructs keep moving. Separating the two
 * is the point of measuring more than once (§4.6).
 */
const WAVE_UPLIFT: Record<Wave, { global: number; targeted: number }> = {
  baseline: { global: 0, targeted: 0 },
  immediate: { global: 0.45, targeted: 0.45 },
  day30: { global: 0.14, targeted: 0.36 },
  day60: { global: 0.19, targeted: 0.56 },
  day90: { global: 0.22, targeted: 0.72 },
};

/** Two seeded disclosures that must route to a human reviewer (§16.4). */
const FLAGGED: Record<string, string> = {
  "cs-4":
    "One of the supervisors singles out the same two people in front of the floor. It feels like bullying and nobody wants to report it.",
  "ops-9":
    "We were told to keep loading after the shift was cut. I think it is unsafe and raising it did not change anything.",
};

const clampLikert = (v: number): LikertScore =>
  Math.max(1, Math.min(5, Math.round(v))) as LikertScore;

function roleFor(r: number): RoleLevel {
  const total = ROLE_WEIGHTS.reduce((a, b) => a + b, 0);
  let acc = 0;
  const draw = r * total;
  for (let i = 0; i < ROLE_WEIGHTS.length; i++) {
    acc += ROLE_WEIGHTS[i];
    if (draw <= acc) return ROLE_LEVELS[i];
  }
  return ROLE_LEVELS[ROLE_LEVELS.length - 1];
}

function buildTranscript(
  deptId: string,
  i: number,
  wave: Wave
): TranscriptInput {
  const dept = DEPARTMENTS.find((d) => d.id === deptId)!;
  const key = `${deptId}-${i}`;
  const h = hash(key);
  const roleLevel = roleFor(rnd(h + 1));
  const managesPeople = roleLevel !== "Individual contributor";
  const uplift = WAVE_UPLIFT[wave];

  // --- Layer 2: pulse responses ---
  const pulse: Record<string, LikertScore> = {};
  CLIMATE.forEach((spec, ci) => {
    const base = BASE_CLIMATE[spec.id] ?? 3;
    const offset = dept.offsets[spec.id] ?? 0;
    // Leaders systematically rate the constructs they are responsible for
    // higher than their teams do — this is the perception gap, by design.
    const managerBonus =
      managesPeople &&
      ["psychSafety", "leadershipOpenness", "roleClarity", "conflict"].includes(spec.id)
        ? 0.62
        : managesPeople
          ? 0.2
          : 0;
    const noise = (rnd(h + ci * 17 + 3) - 0.5) * 1.5;
    const move = TARGETED.includes(spec.id) ? uplift.targeted : uplift.global;
    pulse[spec.id] = clampLikert(base + offset + managerBonus + noise + move);
  });

  const weakest = Object.entries(pulse).sort((a, b) => a[1] - b[1])[0][0];
  const concernPool = CONCERN_LINES[weakest] ?? CONCERN_LINES.collaboration;
  const concern =
    FLAGGED[key] ?? concernPool[Math.floor(rnd(h + 7) * concernPool.length)];

  // --- Layer 1/3: one evidence tier per capability, so the capability
  // distribution across the organisation is genuinely varied ---
  const fragments = CAP_IDS.map((capId, ci) => {
    const tier = Math.max(
      0,
      Math.min(
        4,
        Math.floor(
          rnd(h + hash(capId) + ci) * 5 +
            (CAP_BIAS[capId] ?? 0) +
            (managesPeople ? 0.7 : 0)
        )
      )
    );
    return CAP_FRAGMENTS[capId][tier];
  });

  const chosen = [
    SCENARIOS[Math.floor(rnd(h + 13) * SCENARIOS.length)],
    SCENARIOS[Math.floor(rnd(h + 19) * SCENARIOS.length)],
  ];
  const scenarioPair = chosen[0].id === chosen[1].id ? [chosen[0]] : chosen;

  const turns: TranscriptTurn[] = [
    { speaker: "interviewer", text: "Tell me how the work actually flows in your team.", at: "1:10" },
    { speaker: "participant", text: concern, at: "1:24" },
    { speaker: "interviewer", text: "What makes that hard?", at: "2:05" },
    {
      speaker: "participant",
      text:
        "It has been like this since the reorganisation, and most of us have simply adapted around it rather than fixing it.",
      at: "2:12",
    },
  ];

  scenarioPair.forEach((s, si) => {
    turns.push({
      speaker: "interviewer",
      text: `${s.setup} ${s.ask}`,
      at: `${3 + si}:00`,
      scenarioId: s.id,
    });
    // Split the capability fragments across the two scenarios so each one
    // carries part of the evidence, as a real role-play answer would.
    fragments
      .filter((_, fi) => fi % scenarioPair.length === si)
      .forEach((f, fi) => {
        turns.push({
          speaker: "participant",
          text: f,
          at: `${3 + si}:${20 + fi * 15}`,
          scenarioId: s.id,
        });
      });
  });

  // Reflection — the last four participant turns, per the scorer's contract.
  turns.push(
    { speaker: "interviewer", text: "One strength of this team?", at: "12:00" },
    {
      speaker: "participant",
      text: STRENGTH_LINES[Math.floor(rnd(h + 23) * STRENGTH_LINES.length)],
      at: "12:06",
    },
    { speaker: "interviewer", text: "The biggest obstacle?", at: "12:40" },
    { speaker: "participant", text: concern, at: "12:46" },
    { speaker: "interviewer", text: "If one thing changed, what should it be?", at: "13:20" },
    {
      speaker: "participant",
      text: PRIORITY_LINES[Math.floor(rnd(h + 29) * PRIORITY_LINES.length)],
      at: "13:26",
    },
    { speaker: "interviewer", text: "And what will you do yourself?", at: "14:00" },
    {
      speaker: "participant",
      text: ACTION_LINES[Math.floor(rnd(h + 31) * ACTION_LINES.length)],
      at: "14:06",
    }
  );

  return {
    reference: `MTI-2026-${String(1000 + hash(key) % 8000).padStart(4, "0")}`,
    wave,
    context: {
      department: dept.name,
      roleLevel,
      tenure: TENURES[Math.floor(rnd(h + 37) * TENURES.length)],
      workArrangement: ARRANGEMENTS[Math.floor(rnd(h + 41) * ARRANGEMENTS.length)],
      managesPeople,
      language: LANGUAGES[Math.floor(rnd(h + 43) * LANGUAGES.length)],
    },
    pulse,
    turns,
  };
}

/* ------------------------------------------------------------------ */

const recordCache = new Map<Wave, ParticipantInsightRecord[]>();

export function records(wave: Wave = "baseline"): ParticipantInsightRecord[] {
  const cached = recordCache.get(wave);
  if (cached) return cached;
  const out: ParticipantInsightRecord[] = [];
  DEPARTMENTS.forEach((d) => {
    for (let i = 0; i < d.n; i++) {
      out.push(deterministicScorer.score(buildTranscript(d.id, i, wave)));
    }
  });
  recordCache.set(wave, out);
  return out;
}

function themeCounts(rs: ParticipantInsightRecord[]) {
  const agg = new Map<string, number>();
  rs.forEach((r) => r.themes.forEach((t) => agg.set(t, (agg.get(t) ?? 0) + 1)));
  return Array.from(agg.entries())
    .map(([id, count], i) => ({
      theme: THEME_BY_ID[id]?.label ?? id,
      count,
      delta: [18, 12, 9, -4, 6, -7, 3, 5, 2, -2][i % 10],
    }))
    .sort((a, b) => b.count - a.count);
}

function suggestions(rs: ParticipantInsightRecord[]) {
  const agg = new Map<string, { count: number; depts: Set<string> }>();
  rs.forEach((r) => {
    const p = r.reflection.priority;
    if (!p) return;
    const entry = agg.get(p) ?? { count: 0, depts: new Set<string>() };
    entry.count += 1;
    entry.depts.add(r.context.department);
    agg.set(p, entry);
  });
  const reportable = DEPARTMENTS.filter((d) => d.n >= 5).length;
  return Array.from(agg.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([text, { count, depts }]) => ({
      text: text.charAt(0).toUpperCase() + text.slice(1),
      count,
      spread:
        depts.size >= reportable
          ? `All ${reportable} reportable departments`
          : `${depts.size} departments`,
      themeId: "handovers",
    }));
}

function voices(rs: ParticipantInsightRecord[]) {
  const seen = new Set<string>();
  return rs
    .filter((r) => !r.humanReview && r.anonymisedQuote)
    .filter((r) => {
      const q = r.anonymisedQuote as string;
      if (seen.has(q)) return false;
      seen.add(q);
      return true;
    })
    .slice(0, 9)
    .map((r) => {
      const weakest = Object.entries(r.climate).sort((a, b) => a[1] - b[1])[0];
      const spec = CLIMATE.find((c) => c.id === weakest[0]);
      return {
        quote: r.anonymisedQuote as string,
        department: r.context.department,
        roleLevel: r.context.roleLevel,
        theme: spec?.name ?? "Team experience",
        language: r.context.language,
        level:
          weakest[1] <= 2
            ? ("Priority Attention" as const)
            : weakest[1] <= 3
              ? ("Developing" as const)
              : ("Functional" as const),
      };
    });
}

function flags(rs: ParticipantInsightRecord[]) {
  return rs
    .filter((r) => r.humanReview)
    .slice(0, 6)
    .map((r, i) => ({
      reference: r.reference,
      reason: r.humanReviewReasons[0] ?? "Flagged for review",
      department: r.context.department,
      raisedAt: ["2 h ago", "5 h ago", "yesterday", "2 days ago", "3 days ago", "4 days ago"][i],
    }));
}

const profileCache = new Map<Wave, TeamIntelligenceProfile>();

export function profile(wave: Wave = "baseline"): TeamIntelligenceProfile {
  const cached = profileCache.get(wave);
  if (cached) return cached;
  const rs = records(wave);
  const built = buildProfile(ORGANISATION, wave, rs, TOTAL_INVITED, {
    themes: themeCounts(rs),
    suggestions: suggestions(rs),
    voices: voices(rs),
    flags: flags(rs),
  });
  profileCache.set(wave, built);
  return built;
}

export const WAVES: { id: Wave; label: string; short: string }[] = [
  { id: "baseline", label: "Baseline (pre-programme)", short: "Baseline" },
  { id: "immediate", label: "Immediately after programme", short: "Post" },
  { id: "day30", label: "30 days after", short: "30d" },
  { id: "day60", label: "60 days after", short: "60d" },
  { id: "day90", label: "90 days after", short: "90d" },
];

/** Construct index across every wave — §11 Dashboard 5. */
export function progressSeries(constructId: string): number[] {
  return WAVES.map(
    (w) => profile(w.id).climate.find((c) => c.id === constructId)?.index ?? 0
  );
}
