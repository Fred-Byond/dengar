/**
 * AUREN Nexus — the threat signal, and the pipeline it must survive.
 *
 * A signal is what an authority actually has: "we are seeing this, here is how
 * it works, here is what it looks like." It is intelligence, not content. It
 * never reaches a learner.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE. There is no path from a submitted
 * signal to a spoken sentence that does not pass through a named human in a
 * declared role. Derivation proposes; review disposes; the publish gate is the
 * condition of release. An intelligence feed wired directly to a persona would
 * mean nobody approved what a retail investor is told by a machine applying
 * pressure to them — which is the exact failure the whole apparatus exists to
 * make impossible.
 *
 * Contributing authorities are organisations, never individuals: the same
 * resolution Project Pioneer reached, for the same reason. A person's name
 * belongs on a release event, not on a shared intelligence corpus.
 */

import type { Confidence, Sharing, Surface } from "./vocabulary";

/* ═══════════════════════════════════════════════════════════════════════
   THE PIPELINE
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Deliberately NOT the same chain as a knowledge object's eight states. A
 * signal is evidence about the world; an object is content approved to be
 * spoken. Collapsing the two is how an intelligence note ends up in a script.
 */
export type SignalStatus =
  | "SUBMITTED" // an authority has lodged it
  | "TRIAGED" // classified against the vocabulary, duplicates merged
  | "DERIVED" // candidate objects proposed, all of them DRAFT
  | "IN_REVIEW" // candidates in the object lifecycle, with reviewers assigned
  | "RELEASED" // at least one derived object reached EFFECTIVE in a bundle
  | "DECLINED" // triaged out, with a recorded reason
  | "SUPERSEDED"; // a later signal describes the same tactic better

export const SIGNAL_CHAIN: SignalStatus[] = [
  "SUBMITTED",
  "TRIAGED",
  "DERIVED",
  "IN_REVIEW",
  "RELEASED",
];

export function nextSignalStatus(s: SignalStatus): SignalStatus | null {
  const i = SIGNAL_CHAIN.indexOf(s);
  if (i === -1 || i === SIGNAL_CHAIN.length - 1) return null;
  return SIGNAL_CHAIN[i + 1];
}

/* ═══════════════════════════════════════════════════════════════════════
   THE SIGNAL
   ═════════════════════════════════════════════════════════════════════ */

export interface ContributingAuthority {
  /** Organisation. Never a person. */
  id: string;
  name: string;
  /** ISO-ish market code the authority supervises. */
  jurisdiction: string;
  /** Whether this authority's submissions are visible to the whole network. */
  sharesToNetwork: boolean;
}

export interface ThreatSignal {
  id: string;
  /** One line a supervisor would recognise it by. */
  title: string;
  authorityId: string;
  jurisdiction: string;
  /** Earliest observation the authority is willing to state. */
  observedFrom: string;

  /** Classification against the controlled vocabulary — all four axes. */
  surface: Surface;

  /**
   * How the tactic works, in the authority's own words. This is the field a
   * derivation reads and a reviewer checks the derivation against.
   */
  method: string;
  /** Observable markers a person could in principle notice. */
  indicators: string[];
  /** Who it is aimed at. Drives cohort targeting, never scoring. */
  targetProfile: string;
  /** The reasoning the tactic is designed to defeat — the hook into AUREN. */
  defeats: string;

  confidence: Confidence;
  sharing: Sharing;

  status: SignalStatus;
  /** Ids of knowledge objects proposed from this signal. */
  derivedObjectIds: string[];
  /** Populated when DECLINED. A decline without a reason is not a decision. */
  declineReason: string | null;
  supersededBy: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════
   INTAKE HYGIENE
   ═════════════════════════════════════════════════════════════════════ */

export interface IntakeFinding {
  field: string;
  detail: string;
  blocking: boolean;
}

/**
 * What a signal must carry before anyone spends review time on it.
 *
 * Modelled on the Product Nexus's fixed section frame: the contributor writes
 * plain content into a known shape, and everything downstream can rely on that
 * shape existing. A signal missing `defeats` is the common case and the
 * expensive one — without it there is nothing to connect the tactic to a
 * competency element, and the derivation has nothing to propose.
 */
export function checkIntake(signal: ThreatSignal): IntakeFinding[] {
  const out: IntakeFinding[] = [];
  const need = (v: string, field: string, detail: string, blocking = true) => {
    if (!v || !v.trim()) out.push({ field, detail, blocking });
  };

  need(signal.title, "title", "No title. Supervisors cannot triage a queue of untitled signals.");
  need(signal.method, "method", "No method described. There is nothing for a reviewer to check a derivation against.");
  need(
    signal.defeats,
    "defeats",
    "No statement of what reasoning this defeats. Without it the signal cannot be connected to a competency element, and nothing can be derived."
  );
  need(signal.observedFrom, "observedFrom", "No observation date. Emerging-tactic analysis is date arithmetic.");

  if (signal.indicators.length === 0) {
    out.push({
      field: "indicators",
      detail: "No observable indicators. A tactic nobody could notice cannot be rehearsed, only described.",
      blocking: true,
    });
  }

  const s = signal.surface;
  if (!s.typology || !s.channel || !s.persona || !s.productClass) {
    out.push({
      field: "surface",
      detail: "Incomplete classification. All four axes are required or surface distance cannot be computed, and the retest selector degrades to a guess.",
      blocking: true,
    });
  }

  if (signal.confidence === "unverified") {
    out.push({
      field: "confidence",
      detail: "Unverified. It may still be derived from, but the challenge should not reach a cohort until a second authority corroborates it.",
      blocking: false,
    });
  }

  return out;
}

export function intakeReady(signal: ThreatSignal): boolean {
  return checkIntake(signal).every((f) => !f.blocking);
}
