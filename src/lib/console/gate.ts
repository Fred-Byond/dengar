/**
 * The publish gate.
 *
 * Generalised from Beauty Intelligence §3.3 (eight tests, four hard) across
 * all three papers, which yields nine tests and six hard gates.
 *
 * Beauty's framing is the one that matters and it is carried verbatim into
 * the implementation: "The gate is not a report generated after release; it is
 * the condition of release." A hard failure blocks publication and shows the
 * failing probe, what the system did, and why it failed — to the person who
 * has to fix it.
 *
 * Four of the hard gates bind BYOND contractually as well as the client, per
 * the same paper. Nothing in this module offers a waive path, deliberately.
 */

import type { KnowledgeObject, VerticalPack } from "./schema";
import { isLoadable } from "./schema";

export type GateSeverity = "hard" | "advisory";

export interface GateFinding {
  /** The object or probe the failure attaches to. */
  subject: string;
  detail: string;
}

export interface GateResult {
  id: string;
  name: string;
  severity: GateSeverity;
  asserts: string;
  passed: boolean;
  /**
   * False when the test had nothing to examine. A green tick on an empty set
   * is the precise form of false assurance this whole apparatus exists to
   * prevent, so an unassessed test is never rendered as a pass.
   */
  assessed: boolean;
  findings: GateFinding[];
  checked: number;
}

export interface ReleaseReport {
  verticalId: string;
  generatedAt: string;
  results: GateResult[];
  hardFailures: number;
  advisoryFailures: number;
  /** Publication is permitted only when every hard gate passes. */
  releasable: boolean;
  effectiveCount: number;
  totalCount: number;
}

function result(
  id: string,
  name: string,
  severity: GateSeverity,
  asserts: string,
  checked: number,
  findings: GateFinding[]
): GateResult {
  return {
    id,
    name,
    severity,
    asserts,
    checked,
    findings,
    assessed: checked > 0,
    passed: checked > 0 && findings.length === 0,
  };
}

/**
 * Run the gate against a candidate library.
 *
 * The candidate set is what WOULD be released — every object that has reached
 * EFFECTIVE. Objects still in review are not failures; they are simply not in
 * the bundle, and the coverage test is what notices when their absence leaves
 * a hole.
 */
export function runGate(pack: VerticalPack, objects: KnowledgeObject[]): ReleaseReport {
  const effective = objects.filter((o) => isLoadable(o.governance.status));
  const byId = new Map(objects.map((o) => [o.id, o]));

  const elements = effective.filter((o) => o.kind === "element");
  const questions = effective.filter((o) => o.kind === "question");
  const challenges = effective.filter((o) => o.kind === "challenge");
  const signatures = effective.filter((o) => o.kind === "signature");
  const boundaries = effective.filter((o) => o.kind === "boundary");

  const results: GateResult[] = [];

  /* ── 0. Candidate set ────────────────────────────────────────────────
     Nothing below means anything against an empty bundle. Reported first
     and as a hard failure so a library that has never been approved cannot
     present itself as nine passing tests. */
  results.push(
    result("candidate", "Candidate set", "hard",
      "At least one object has reached EFFECTIVE and is in the bundle.",
      objects.length,
      effective.length === 0
        ? [{
            subject: pack.id,
            detail: `${objects.length} objects authored, none EFFECTIVE. Nothing would be released, and every test below is unassessed rather than passing.`,
          }]
        : [])
  );

  /* ── 1. Coverage ─────────────────────────────────────────────────────
     Every mandatory element must have at least one eligible question that
     can elicit it. An element with no question is an element the system
     will never resolve — Pioneer's distinction between "not capturable"
     (legitimate) and "not asked" (a defect) is honoured here. */
  {
    const targeted = new Set(
      questions.map((q) => (q.kind === "question" ? q.targetElement : ""))
    );
    const findings: GateFinding[] = [];
    for (const el of elements) {
      if (el.kind !== "element") continue;
      if (!el.mandatory || !el.capturable) continue;
      if (!targeted.has(el.id)) {
        findings.push({
          subject: el.id,
          detail: `Mandatory element "${el.label}" has no question that can elicit it. It can never be resolved in a session.`,
        });
      }
    }
    results.push(
      result("coverage", "Coverage", "hard",
        "Every mandatory, capturable element has at least one eligible question.",
        elements.length, findings)
    );
  }

  /* ── 2. Anchor integrity ─────────────────────────────────────────────
     No anchor, no deployment. The rule is already absolute in AUREN §10.1
     and Pioneer's Legal Source requirement; Beauty's equivalent is the
     regulatory position on a claim. */
  {
    const findings: GateFinding[] = [];
    for (const el of elements) {
      if (el.kind !== "element") continue;
      if (!el.authorityAnchor.trim()) {
        findings.push({
          subject: el.id,
          detail: `"${el.label}" carries no authority anchor. ${pack.anchorAuthority} is the required source.`,
        });
      }
    }
    results.push(
      result("anchor", "Anchor integrity", "hard",
        "Every element binds to a published clause in the vertical's anchor authority.",
        elements.length, findings)
    );
  }

  /* ── 3. Prohibited formulation ───────────────────────────────────────
     Pioneer: medium leading-risk requires a written rationale; high is
     prohibited outright. AUREN: no ladder step may exceed its ceiling, and
     pressure always carries a distress exit. Beauty: no released wording may
     match a forbidden phrasing, in any language. */
  {
    const findings: GateFinding[] = [];
    for (const q of questions) {
      if (q.kind !== "question") continue;
      if (q.leadingRisk === "medium" && !q.leadingRiskRationale) {
        findings.push({
          subject: q.id,
          detail: "Medium leading-risk without a written rationale from a legal reviewer.",
        });
      }
    }
    for (const c of challenges) {
      if (c.kind !== "challenge") continue;
      if (c.ladderSteps > c.ladderCeiling) {
        findings.push({
          subject: c.id,
          detail: `Escalation ladder has ${c.ladderSteps} steps against a ceiling of ${c.ladderCeiling}.`,
        });
      }
      if (!c.distressExit) {
        findings.push({
          subject: c.id,
          detail: "Pressure is applied with no distress exit. Non-negotiable in every paper.",
        });
      }
    }
    // Beauty's test: a forbidden phrasing appearing inside a released wording.
    const forbidden = signatures.flatMap((s) =>
      s.kind === "signature" ? s.forbiddenPhrasings.map((p) => ({ p, from: s.id })) : []
    );
    for (const q of questions) {
      if (q.kind !== "question") continue;
      for (const v of q.variants) {
        for (const f of forbidden) {
          if (v.wording.toLowerCase().includes(f.p.toLowerCase())) {
            findings.push({
              subject: `${q.id} · ${v.lang}`,
              detail: `Released wording contains the forbidden phrasing "${f.p}" (${f.from}).`,
            });
          }
        }
      }
    }
    results.push(
      result("prohibited", "Prohibited formulation", "hard",
        "No unrationalised leading risk, no ladder above ceiling, no forbidden phrasing in any released wording.",
        questions.length + challenges.length, findings)
    );
  }

  /* ── 4. Scope integrity ──────────────────────────────────────────────
     The gate that catches a whole class of silent failure. Three checks:
     an object may not declare a mode the vertical does not have; a neutral
     vertical may hold no challenge objects at all; and a question may not be
     released into a market where its target element is not approved. */
  {
    const findings: GateFinding[] = [];
    const modes = new Set(pack.modes);
    for (const o of effective) {
      for (const m of o.eligibility.modes) {
        if (!modes.has(m)) {
          findings.push({
            subject: o.id,
            detail: `Declares mode "${m}", which this vertical does not define (${pack.modes.join(", ")}).`,
          });
        }
      }
    }
    if (pack.doctrine === "neutral" && challenges.length > 0) {
      for (const c of challenges) {
        findings.push({
          subject: c.id,
          detail: "Challenge object in a neutral-doctrine vertical. Adversarial content is forbidden here.",
        });
      }
    }
    for (const q of questions) {
      if (q.kind !== "question") continue;
      const target = byId.get(q.targetElement);
      if (!target) continue;
      const targetMarkets = target.eligibility.markets;
      if (targetMarkets.length === 0) continue;
      const over = q.eligibility.markets.filter((m) => !targetMarkets.includes(m));
      if (over.length) {
        findings.push({
          subject: q.id,
          detail: `Released into ${over.join(", ")} but its target ${target.id} is approved only in ${targetMarkets.join(", ")}.`,
        });
      }
    }
    results.push(
      result("scope", "Scope integrity", "hard",
        "No object is reachable outside its declared mode, market or doctrine.",
        effective.length, findings)
    );
  }

  /* ── 5. Boundary refusal ─────────────────────────────────────────────
     The vertical must declare the question it can never answer, and the
     refusal must hold in every deployed language. Beauty's standard is the
     platform standard: a system that refuses correctly in English and can be
     talked around in Arabic has not passed. */
  {
    const findings: GateFinding[] = [];
    if (boundaries.length === 0) {
      findings.push({
        subject: pack.id,
        detail: "No boundary object. Every vertical must declare the question it must never answer.",
      });
    }
    for (const b of boundaries) {
      if (b.kind !== "boundary") continue;
      const missing = pack.languages.filter((l) => !b.eligibility.languages.includes(l));
      if (missing.length) {
        findings.push({
          subject: b.id,
          detail: `Refusal is not proven in ${missing.join(", ")}. It holds in ${b.eligibility.languages.join(", ")} only.`,
        });
      }
      if (b.probes.length < 2) {
        findings.push({
          subject: b.id,
          detail: "Fewer than two probes. A boundary tested once is a boundary tested by accident.",
        });
      }
    }
    results.push(
      result("boundary", "Boundary refusal", "hard",
        "The vertical's hard boundary is declared and proven in every deployed language.",
        boundaries.length, findings)
    );
  }

  /* ── 6. Version consistency ──────────────────────────────────────────
     Every reference resolves, and it resolves to something that is actually
     in the bundle. A question pointing at an element still in review is the
     commonest way a library ships broken. */
  {
    const effectiveIds = new Set(effective.map((o) => o.id));
    const findings: GateFinding[] = [];
    for (const o of effective) {
      const refs: string[] = [];
      if (o.kind === "question") refs.push(o.targetElement);
      if (o.kind === "challenge") refs.push(...o.targetElements);
      if (o.kind === "signature") refs.push(o.negatedElement);
      if (o.kind === "question" && o.firesOnlyAfter) refs.push(o.firesOnlyAfter);
      for (const r of refs) {
        if (!byId.has(r)) {
          findings.push({ subject: o.id, detail: `References ${r}, which does not exist.` });
        } else if (!effectiveIds.has(r)) {
          const st = byId.get(r)!.governance.status;
          findings.push({
            subject: o.id,
            detail: `References ${r}, which is ${st} and will not be in the bundle.`,
          });
        }
      }
    }
    results.push(
      result("version", "Version consistency", "hard",
        "Every reference resolves to an object present in the same bundle.",
        effective.length, findings)
    );
  }

  /* ── 7. Adversarial probe (advisory) ─────────────────────────────────
     Judgement, not arithmetic — which is why it is advisory. It still finds
     what the other eight cannot: a pressure library with no coverage of the
     elements it claims to test. */
  {
    const findings: GateFinding[] = [];
    if (pack.doctrine === "dual") {
      const pressured = new Set(
        challenges.flatMap((c) => (c.kind === "challenge" ? c.targetElements : []))
      );
      const assessed = elements.filter((e) => e.kind === "element" && e.mandatory);
      const untested = assessed.filter((e) => !pressured.has(e.id));
      if (untested.length) {
        findings.push({
          subject: pack.id,
          detail: `${untested.length} of ${assessed.length} mandatory elements are never tested under pressure: ${untested.slice(0, 4).map((e) => e.id).join(", ")}${untested.length > 4 ? "…" : ""}.`,
        });
      }
    }
    results.push(
      result("adversarial", "Adversarial probe", "advisory",
        "The released set holds under hostile and leading questioning.",
        challenges.length, findings)
    );
  }

  /* ── 8. Translation fidelity (advisory) ──────────────────────────────
     Every deployable variant carries the same meaning and the same limits.
     Already implemented and running in AUREN. */
  {
    const findings: GateFinding[] = [];
    for (const o of effective) {
      if (o.kind !== "question") continue;
      for (const lang of pack.languages) {
        const v = o.variants.find((x) => x.lang === lang);
        if (!v || !v.wording.trim()) {
          findings.push({ subject: `${o.id} · ${lang}`, detail: "No wording for a deployed language." });
        } else if (v.fidelity !== "passed") {
          findings.push({ subject: `${o.id} · ${lang}`, detail: `Fidelity is ${v.fidelity}; only "passed" is deployable.` });
        }
      }
    }
    results.push(
      result("fidelity", "Translation fidelity", "advisory",
        "Every deployable variant has passed native review.",
        questions.length * pack.languages.length, findings)
    );
  }

  /* ── 9. Traceability (advisory) ──────────────────────────────────────
     Every determination resolves to an object, a version and a verbatim span.
     If this fails, nothing else in the system means anything. */
  {
    const findings: GateFinding[] = [];
    for (const q of questions) {
      if (q.kind !== "question") continue;
      if (q.satisfaction === "not_scored") continue;
      if (q.satisfaction !== "verbatim_bound" && q.satisfaction !== "entity") {
        findings.push({ subject: q.id, detail: "Contributes to a determination without a binding rule." });
      }
    }
    for (const o of effective) {
      if (!o.governance.effectiveDate) {
        findings.push({ subject: o.id, detail: "EFFECTIVE with no effective date. Not reproducible against a point in time." });
      }
    }
    results.push(
      result("traceability", "Traceability", "advisory",
        "Every answer and determination resolves to an object, a version and a verbatim span.",
        effective.length, findings)
    );
  }

  const hardFailures = results.filter(
    (r) => r.severity === "hard" && r.assessed && !r.passed
  ).length;
  const advisoryFailures = results.filter(
    (r) => r.severity === "advisory" && r.assessed && !r.passed
  ).length;
  const emptyBundle = effective.length === 0;

  return {
    verticalId: pack.id,
    generatedAt: new Date().toISOString(),
    results,
    hardFailures,
    advisoryFailures,
    // An empty bundle is never releasable, however few findings it produced.
    releasable: hardFailures === 0 && !emptyBundle,
    effectiveCount: effective.length,
    totalCount: objects.length,
  };
}
