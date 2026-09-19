/**
 * AUREN Nexus — supervisory analytics.
 *
 * The question this layer answers is not "how did our learners do." It is the
 * one a securities regulator actually has:
 *
 *     Which tactics are currently defeating people, and are we able to
 *     rehearse against them yet?
 *
 * Three constraints shape everything here.
 *
 * NO INDIVIDUALS. Every figure is cohort-level. A supervisor who can see how a
 * named retail investor performed is a supervisor holding a file they did not
 * ask for and cannot lawfully use. Cohort membership arrives through the access
 * code — which carries authority, jurisdiction and cohort — so the dimensions
 * are trustworthy without anyone self-declaring, the same resolution the
 * Beauty programme reached for distributor analytics.
 *
 * NO DURABLE CLAIM. Transfer here means transfer measured inside one session,
 * against a scenario sharing nothing with the one the learner failed. It is not
 * evidence of durable behaviour change and the dashboard says so where the
 * number is, not in a footnote.
 *
 * DETERMINISTIC. The synthetic cohort below is generated from a fixed seed, so
 * two people opening the dashboard discuss the same numbers. A demo that
 * reshuffles on reload is a demo nobody can point at.
 */

import type { ThreatSignal } from "./signal";
import { TYPOLOGIES, label } from "./vocabulary";

/* ═══════════════════════════════════════════════════════════════════════
   RECORDS
   ═════════════════════════════════════════════════════════════════════ */

export interface Cohort {
  id: string;
  name: string;
  authorityId: string;
  jurisdiction: string;
  /** How many people the programme reached. */
  size: number;
}

export interface SessionRecord {
  cohortId: string;
  /** The typology the learner was actually put under pressure by. */
  typology: string;
  elementsTested: number;
  elementsResolved: number;
  /** Did they resist the pressure at the point the signature would bind? */
  resisted: boolean;
  /** Did the coached behaviour survive a surface-distant retest? */
  transferred: boolean;
  /** Which competency element failed first. */
  firstFailure: string;
}

export const COHORTS: Cohort[] = [
  { id: "CO-MY-RETAIL", name: "Retail investor outreach · Q3", authorityId: "AUTH-SC-MY", jurisdiction: "MY", size: 480 },
  { id: "CO-GB-PANEL", name: "Consumer panel · pre-campaign baseline", authorityId: "AUTH-FCA-UK", jurisdiction: "GB", size: 260 },
  { id: "CO-SG-SENIOR", name: "Senior investor programme", authorityId: "AUTH-MAS-SG", jurisdiction: "SG", size: 310 },
  { id: "CO-ES-CAMPAIGN", name: "Campaña de educación al inversor", authorityId: "AUTH-CNMV-ES", jurisdiction: "ES", size: 195 },
];

/* Deterministic PRNG — mulberry32. Fixed seed, stable figures. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Per-typology difficulty, as a resistance rate the synthetic cohort will
 * trend toward. These are the shape of the demonstration, not a finding: the
 * ordering encodes the uncontroversial claim that a tactic which exploits an
 * existing relationship or an already-suffered loss beats people more often
 * than a cold call with a deadline.
 */
const DIFFICULTY: Record<string, number> = {
  "TYP-RECOVERY": 0.21,
  "TYP-RELATIONSHIP-INVESTMENT": 0.24,
  "TYP-AUTHORITY-IMPERSONATION": 0.28,
  "TYP-SYNTHETIC-ENDORSEMENT": 0.34,
  "TYP-TASK-ONBOARDING": 0.37,
  "TYP-AI-PERFORMANCE": 0.43,
  "TYP-PRE-IPO": 0.52,
  "TYP-CLONE-FIRM": 0.58,
};

/* Named for its use, not its contents: these modules are concatenated into one
   scope in the prototype build, so a module-private `ELEMENTS` collides with the
   AUREN library's export of the same name. Generic names are not private here. */
const HEAT_ELEMENTS = ["E-VER-02", "E-RET-01", "E-AI-01", "E-RISK-01", "E-URG-01", "E-AUTH-01", "E-SOC-01", "E-PAY-01"];

/** The synthetic run. Fixed seed; same numbers every time. */
export function buildRecords(): SessionRecord[] {
  const r = rng(20260919);
  const out: SessionRecord[] = [];
  const typologies = Object.keys(DIFFICULTY);

  COHORTS.forEach((c, ci) => {
    // Not everyone in a cohort completes a session. That gap is itself a
    // supervisory fact, so it is modelled rather than assumed away.
    const completed = Math.round(c.size * (0.52 + r() * 0.26));
    for (let i = 0; i < completed; i += 1) {
      const typology = typologies[Math.floor(r() * typologies.length)];
      const base = DIFFICULTY[typology];
      // Cohort-level variation: a senior programme fares worse on relationship
      // and recovery tactics, a pre-campaign baseline worse across the board.
      const cohortShift = ci === 2 && (typology === "TYP-RECOVERY" || typology === "TYP-RELATIONSHIP-INVESTMENT") ? -0.09 : 0;
      const baselineShift = ci === 1 ? -0.06 : 0;
      const resisted = r() < base + cohortShift + baselineShift;
      const elementsTested = 4;
      const elementsResolved = Math.min(elementsTested, Math.floor(r() * (resisted ? 4 : 3)));
      out.push({
        cohortId: c.id,
        typology,
        elementsTested,
        elementsResolved,
        resisted,
        // Transfer is only in play for people who failed and were coached.
        transferred: resisted ? false : r() < 0.46,
        firstFailure: HEAT_ELEMENTS[Math.floor(r() * HEAT_ELEMENTS.length)],
      });
    }
  });
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════
   THE VIEW
   ═════════════════════════════════════════════════════════════════════ */

export interface TypologyRow {
  typology: string;
  label: string;
  exposures: number;
  resistanceRate: number;
  /** Of those who failed and were coached, how many held on a distant retest. */
  transferRate: number;
  /** Is there a RELEASED challenge for this tactic at all? */
  rehearsable: boolean;
  /** Days since the earliest signal describing it was observed. */
  ageDays: number | null;
}

export interface SupervisoryView {
  generatedAt: string;
  cohortCount: number;
  reach: number;
  completed: number;
  overallResistance: number;
  overallTransfer: number;
  typologies: TypologyRow[];
  /** Tactics beating the cohort more than the mean AND recently observed. */
  emerging: TypologyRow[];
  /** Tactics in the corpus with nothing released to rehearse against. */
  coverageGaps: TypologyRow[];
  elementHeat: Array<{ elementId: string; failures: number; share: number }>;
  contributions: Array<{ authorityId: string; submitted: number; released: number; declined: number }>;
}

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

function daysBetween(from: string, to: string): number {
  const a = Date.parse(from);
  const b = Date.parse(to);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

export function buildSupervisoryView(
  records: SessionRecord[],
  signals: ThreatSignal[],
  asOf: string
): SupervisoryView {
  const byTypology = new Map<string, SessionRecord[]>();
  records.forEach((rec) => {
    const list = byTypology.get(rec.typology) ?? [];
    list.push(rec);
    byTypology.set(rec.typology, list);
  });

  const released = new Set(
    signals.filter((s) => s.status === "RELEASED").map((s) => s.surface.typology)
  );

  const earliest = new Map<string, string>();
  signals.forEach((s) => {
    if (!s.surface.typology || !s.observedFrom) return;
    const cur = earliest.get(s.surface.typology);
    if (!cur || s.observedFrom < cur) earliest.set(s.surface.typology, s.observedFrom);
  });

  const rows: TypologyRow[] = TYPOLOGIES.map((t) => {
    const recs = byTypology.get(t.id) ?? [];
    const failed = recs.filter((x) => !x.resisted);
    const obs = earliest.get(t.id) ?? null;
    return {
      typology: t.id,
      label: t.label,
      exposures: recs.length,
      resistanceRate: pct(recs.filter((x) => x.resisted).length, recs.length),
      transferRate: pct(failed.filter((x) => x.transferred).length, failed.length),
      rehearsable: released.has(t.id),
      ageDays: obs ? daysBetween(obs, asOf) : null,
    };
  }).sort((a, b) => a.resistanceRate - b.resistanceRate);

  const withExposure = rows.filter((r) => r.exposures > 0);
  const meanResistance =
    withExposure.length === 0
      ? 0
      : Math.round(withExposure.reduce((a, b) => a + b.resistanceRate, 0) / withExposure.length);

  const failedAll = records.filter((x) => !x.resisted);

  const heatCounts = new Map<string, number>();
  failedAll.forEach((x) => heatCounts.set(x.firstFailure, (heatCounts.get(x.firstFailure) ?? 0) + 1));
  const elementHeat = Array.from(heatCounts.entries())
    .map(([elementId, failures]) => ({ elementId, failures, share: pct(failures, failedAll.length) }))
    .sort((a, b) => b.failures - a.failures);

  const contribCounts = new Map<string, { submitted: number; released: number; declined: number }>();
  signals.forEach((s) => {
    const c = contribCounts.get(s.authorityId) ?? { submitted: 0, released: 0, declined: 0 };
    c.submitted += 1;
    if (s.status === "RELEASED") c.released += 1;
    if (s.status === "DECLINED") c.declined += 1;
    contribCounts.set(s.authorityId, c);
  });

  return {
    generatedAt: asOf,
    cohortCount: COHORTS.length,
    reach: COHORTS.reduce((a, c) => a + c.size, 0),
    completed: records.length,
    overallResistance: pct(records.filter((x) => x.resisted).length, records.length),
    overallTransfer: pct(failedAll.filter((x) => x.transferred).length, failedAll.length),
    typologies: rows,
    // Recently observed AND beating people more than the corpus mean. Either
    // alone is noise; together it is where supervisory attention should go.
    emerging: withExposure.filter(
      (r) => r.resistanceRate < meanResistance && r.ageDays !== null && r.ageDays <= 150
    ),
    // The metric that mirrors the publish gate's Coverage test, one level up:
    // a tactic we have intelligence on but cannot yet put anyone through.
    coverageGaps: rows.filter((r) => !r.rehearsable && r.ageDays !== null),
    elementHeat,
    contributions: Array.from(contribCounts.entries()).map(([authorityId, c]) => ({ authorityId, ...c })),
  };
}

export function typologyLabel(id: string): string {
  return label(TYPOLOGIES, id);
}
