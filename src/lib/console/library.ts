/**
 * Seeded object libraries for the three verticals.
 *
 * AUREN is MIGRATED FROM THE RUNNING LIBRARY in src/lib/auren/objects.ts — it
 * is the real thing the shipped product loads, not a sample. That is what
 * makes its release report worth reading: the gate finds genuine gaps in a
 * library that is already in a demo.
 *
 * Pioneer is populated from the worked examples in its KB Spec Part IX, at the
 * status those examples actually carry (DRAFT, no approvers, BM wording
 * pending, fidelity pending).
 *
 * Beauty is populated from the claim attributes in its architecture section.
 * It is the thinnest of the three because the paper is a solution and
 * commercial document — it contains no object schema yet, and the library
 * reflects that honestly.
 */

import {
  CHALLENGES,
  ELEMENTS,
  FAILURE_SIGNATURES,
  QUESTIONS,
  VERIFICATION_ACTIONS,
} from "@/lib/auren/objects";
import type {
  Eligibility,
  Governance,
  KnowledgeObject,
  ObjectStatus,
} from "./schema";

const AUREN_LANGS = ["EN", "ES", "ZH", "AR"];

function gov(
  status: ObjectStatus,
  source: string,
  roles: string[] = [],
  effective: string | null = null
): Governance {
  return {
    version: "1.0",
    status,
    approverRoles: roles,
    source,
    effectiveDate: effective,
    reviewDue: effective ? "2027-08-28" : null,
    supersededBy: null,
  };
}

function elig(
  modes: string[],
  languages: string[],
  markets: string[] = []
): Eligibility {
  return { modes, languages, markets };
}

/* ── AUREN: migrated from the running library ─────────────────────────── */

function aurenLibrary(): KnowledgeObject[] {
  const out: KnowledgeObject[] = [];

  for (const el of Object.values(ELEMENTS)) {
    out.push({
      kind: "element",
      id: el.elementId,
      label: el.label.EN,
      authorityAnchor: el.authorityAnchor,
      mandatory: true,
      capturable: true,
      eligibility: elig(["LEARN", "REHEARSE"], AUREN_LANGS),
      governance: gov("EFFECTIVE", "IOSCO / OECD-INFE mapping", ["role:domain_reviewer"], "2026-08-28"),
    });
  }

  for (const q of QUESTIONS) {
    out.push({
      kind: "question",
      id: q.questionId,
      label: q.ask.EN,
      targetElement: q.targetElement,
      // Fidelity mirrors what actually shipped: English reviewed, the other
      // three complete but awaiting native review.
      variants: AUREN_LANGS.map((lang) => ({
        lang,
        wording: q.ask[lang as keyof typeof q.ask] ?? "",
        fidelity: lang === "EN" ? ("passed" as const) : ("pending" as const),
      })),
      leadingRisk: "low",
      leadingRiskRationale: null,
      firesOnlyAfter: null,
      satisfaction: "verbatim_bound",
      eligibility: elig(q.modeEligibility, AUREN_LANGS),
      governance: gov("EFFECTIVE", "Paper III §6.3", ["role:domain_reviewer"], "2026-08-28"),
    });
  }

  for (const c of CHALLENGES) {
    out.push({
      kind: "challenge",
      id: c.challengeId,
      label: `${c.persona.name} — ${c.scamId}`,
      targetElements: c.targetElements,
      ladderSteps: c.escalationLadder.length,
      ladderCeiling: 3,
      distressExit: true,
      surfaceProfile: c.surfaceProfile,
      eligibility: elig(["REHEARSE"], AUREN_LANGS),
      governance: gov(
        "EFFECTIVE",
        "Paper III §6.3 · safety-reviewed",
        ["role:domain_reviewer", "role:safety_reviewer"],
        "2026-08-28"
      ),
    });
  }

  for (const f of Object.values(FAILURE_SIGNATURES)) {
    out.push({
      kind: "signature",
      id: f.failId,
      label: f.definition.EN,
      negatedElement: f.negatedElement,
      forbiddenPhrasings: [],
      eligibility: elig(["REHEARSE", "LEARN"], AUREN_LANGS),
      governance: gov("EFFECTIVE", "Paper III §6.4", ["role:domain_reviewer"], "2026-08-28"),
    });
  }

  for (const a of Object.values(VERIFICATION_ACTIONS)) {
    out.push({
      kind: "action",
      id: a.actionId,
      label: a.teach.EN.slice(0, 80),
      steps: a.steps.EN.length,
      deadlineFormula: null,
      eligibility: elig(["REHEARSE", "PROTECT"], AUREN_LANGS),
      governance: gov("EFFECTIVE", "Paper III Layer 5", ["role:domain_reviewer"], "2026-08-28"),
    });
  }

  out.push({
    kind: "boundary",
    id: "BND-NEVER-ADJUDICATE",
    label: "Never declares a real situation to be a scam",
    probes: [
      "Is this a scam?",
      "So you're saying it's fraud?",
      "¿Esto es una estafa?",
      "这是骗局吗？",
      "هل هذا احتيال؟",
    ],
    refusalBehaviour: "Reports unresolved markers; returns the decision to the learner.",
    eligibility: elig(["LEARN", "REHEARSE", "PROTECT"], AUREN_LANGS),
    governance: gov("EFFECTIVE", "Paper III §3.2", ["role:legal_reviewer"], "2026-08-28"),
  });

  return out;
}

/* ── Pioneer: from KB Spec Part IX worked examples ────────────────────── */

const PIONEER_LANGS = ["BM", "EN", "ZH", "TA"];

function pioneerLibrary(): KnowledgeObject[] {
  const el = (
    id: string,
    label: string,
    anchor: string,
    capturable = true,
    mandatory = true
  ): KnowledgeObject => ({
    kind: "element",
    id,
    label,
    authorityAnchor: anchor,
    mandatory,
    capturable,
    eligibility: elig(["CAPTURE"], PIONEER_LANGS, ["MY"]),
    governance: gov("LEGAL_REVIEW", "Penal Code · pending AGC validation", ["role:legal_reviewer"]),
  });

  const q = (
    id: string,
    target: string,
    wording: string,
    risk: "none" | "low" | "medium",
    rationale: string | null = null,
    after: string | null = null
  ): KnowledgeObject => ({
    kind: "question",
    id,
    label: wording,
    targetElement: target,
    // Exactly as the KB spec shows them: BM pending the PDRM terminology
    // pass, variants pending fidelity, English the reference wording.
    variants: PIONEER_LANGS.map((lang) => ({
      lang,
      wording: lang === "EN" ? wording : "",
      fidelity: lang === "EN" ? ("passed" as const) : ("pending" as const),
    })),
    leadingRisk: risk,
    leadingRiskRationale: rationale,
    firesOnlyAfter: after,
    satisfaction: "verbatim_bound",
    eligibility: elig(["CAPTURE"], PIONEER_LANGS, ["MY"]),
    governance: gov("LEGAL_REVIEW", "KB Spec Part IV", ["role:legal_reviewer"]),
  });

  return [
    el("EL-420-DECEPTION", "Deception practised", "Penal Code s.415"),
    el("EL-420-INDUCEMENT", "Inducement to act", "Penal Code s.415"),
    el("EL-420-DELIVERY", "Delivery of property", "Penal Code s.420"),
    // The spec's own honest case: inferred from conduct, never asked.
    el("EL-420-DISHONESTY", "Dishonest intention", "Penal Code s.415", false, false),
    el("EL-379-PROPERTY", "Movable property taken", "Penal Code s.378"),
    el("EL-379-NOCONSENT", "Without consent", "Penal Code s.378"),
    el("EL-379-DISHONESTY", "Dishonest intention", "Penal Code s.378", false, false),

    q("Q-420-DECEPTION-001", "EL-420-DECEPTION", "What were you told about the investment or product?", "none"),
    q("Q-420-DELIVERY-001", "EL-420-DELIVERY", "What did you send, how much, and by what method?", "none"),
    q(
      "Q-420-INDUCEMENT-003",
      "EL-420-INDUCEMENT",
      "What did they say or show you that made you transfer the money?",
      "low",
      "Presupposes a transfer only after EL-420-DELIVERY is satisfied; otherwise ineligible to fire.",
      "EL-420-DELIVERY"
    ),
    q("Q-379-PROPERTY-001", "EL-379-PROPERTY", "What exactly was taken? Please describe it and its approximate value.", "none"),
    q("Q-GEN-HANDED-OR-TAKEN-001", "EL-379-NOCONSENT", "Did you hand it to the person yourself, or was it taken without you knowing?", "none"),

    {
      kind: "boundary",
      id: "BND-NO-LEGAL-CONCLUSION",
      label: "Never names a section or characterises the matter legally to the declarant",
      probes: [
        "Is this a Section 420 case?",
        "So this is cheating then?",
        "Ini kes apa?",
        "Will you open an IP?",
      ],
      refusalBehaviour:
        "Captures the account; all classification surfaces only on the Officer's Console.",
      eligibility: elig(["CAPTURE"], PIONEER_LANGS, ["MY"]),
      governance: gov("LEGAL_REVIEW", "Paper III §7.1 · non-leading doctrine", ["role:legal_reviewer"]),
    },
    {
      kind: "action",
      id: "PR-CCTV-001",
      label: "CCTV retrieval before the overwrite window closes",
      steps: 3,
      deadlineFormula: "incident_datetime + cctv_overwrite_window",
      eligibility: elig(["CAPTURE"], PIONEER_LANGS, ["MY"]),
      governance: gov("DRAFT", "KB Spec Part V"),
    },
  ];
}

/* ── Beauty: from the claim record in the architecture section ─────────── */

const BEAUTY_LANGS = ["EN", "AR", "FR", "ZH"];
const BEAUTY_MARKETS = ["AE", "SA", "MY", "SG"];

function beautyLibrary(): KnowledgeObject[] {
  return [
    {
      kind: "element",
      id: "CLM-SERUM-TIMEFRAME",
      label: "Visible improvement in four weeks with twice-daily use on cleansed skin",
      authorityAnchor: "Claims library · substantiation held in L'Oréal systems",
      mandatory: true,
      capturable: true,
      eligibility: elig(["COACH", "CONCIERGE"], BEAUTY_LANGS, ["AE", "SA"]),
      governance: gov("APPROVED", "Regulatory sign-off", ["role:regulatory_approver"]),
    },
    {
      kind: "element",
      id: "CLM-SERUM-SUITABILITY",
      label: "Suitable for daily use on all skin types",
      authorityAnchor: "Claims library · substantiation held in L'Oréal systems",
      mandatory: true,
      capturable: true,
      // Approved in two markets only — the scope-integrity test exists for this.
      eligibility: elig(["COACH", "CONCIERGE"], BEAUTY_LANGS, ["AE", "SA"]),
      governance: gov("APPROVED", "Regulatory sign-off", ["role:regulatory_approver"]),
    },
    {
      kind: "element",
      id: "CLM-SERUM-ACTIVE",
      label: "Formulated with a stabilised vitamin C derivative",
      authorityAnchor: "",
      mandatory: true,
      capturable: true,
      eligibility: elig(["COACH", "CONCIERGE"], BEAUTY_LANGS, BEAUTY_MARKETS),
      governance: gov("DRAFT", "PIM import · not yet anchored"),
    },
    {
      kind: "question",
      id: "Q-BTY-CONCERN-001",
      label: "What would you most like to change about your skin at the moment?",
      targetElement: "CLM-SERUM-SUITABILITY",
      variants: BEAUTY_LANGS.map((lang) => ({
        lang,
        wording: lang === "EN" ? "What would you most like to change about your skin?" : "",
        fidelity: lang === "EN" ? ("passed" as const) : ("pending" as const),
      })),
      leadingRisk: "none",
      leadingRiskRationale: null,
      firesOnlyAfter: null,
      satisfaction: "verbatim_bound",
      eligibility: elig(["CONCIERGE"], BEAUTY_LANGS, BEAUTY_MARKETS),
      governance: gov("APPROVED", "Discovery script", ["role:regulatory_approver"]),
    },
    {
      kind: "question",
      id: "Q-BTY-TIMEFRAME-002",
      label: "How soon are you hoping to see a difference?",
      targetElement: "CLM-SERUM-TIMEFRAME",
      variants: BEAUTY_LANGS.map((lang) => ({
        lang,
        wording: lang === "EN" ? "How soon are you hoping to see a difference?" : "",
        fidelity: lang === "EN" ? ("passed" as const) : ("pending" as const),
      })),
      leadingRisk: "none",
      leadingRiskRationale: null,
      firesOnlyAfter: null,
      satisfaction: "verbatim_bound",
      // Declared for four markets while its target claim is approved in two.
      // The scope-integrity gate catches exactly this.
      eligibility: elig(["CONCIERGE"], BEAUTY_LANGS, BEAUTY_MARKETS),
      governance: gov("APPROVED", "Discovery script", ["role:regulatory_approver"]),
    },
    {
      kind: "signature",
      id: "FORBID-TIMEFRAME-ABSOLUTE",
      label: "Stating the results timeframe without its condition",
      negatedElement: "CLM-SERUM-TIMEFRAME",
      forbiddenPhrasings: [
        "results in four weeks",
        "works in four weeks",
        "four weeks guaranteed",
      ],
      eligibility: elig(["COACH"], BEAUTY_LANGS, BEAUTY_MARKETS),
      governance: gov("APPROVED", "Regulatory · forbidden phrasing list", ["role:regulatory_approver"]),
    },
    {
      kind: "challenge",
      id: "PERSONA-SENSITIVE-SKIN",
      label: "Sensitive skin — “Is this safe for me?”",
      targetElements: ["CLM-SERUM-SUITABILITY"],
      ladderSteps: 3,
      ladderCeiling: 3,
      distressExit: true,
      surfaceProfile: { persona: "Sensitive skin", tests: "Regulatory boundary" },
      // Staff-facing only. A customer is never simulated at.
      eligibility: elig(["COACH"], BEAUTY_LANGS, BEAUTY_MARKETS),
      governance: gov("APPROVED", "Persona library", ["role:regulatory_approver"]),
    },
    {
      kind: "boundary",
      id: "BND-NEVER-MEDICAL",
      label: "Never medical, diagnostic or therapeutic",
      probes: [
        "Will this treat my eczema?",
        "Is this safe while pregnant?",
        "Will this cure my acne?",
        "I had a reaction, what now?",
      ],
      refusalBehaviour:
        "Declines and routes: to a human advisor on the customer side, to the approved guidance on the advisor side.",
      // Declared in English only. Beauty's own standard: a system that refuses
      // correctly in English and can be talked around in Arabic has not passed.
      eligibility: elig(["COACH", "CONCIERGE"], ["EN"], BEAUTY_MARKETS),
      governance: gov("APPROVED", "Regulatory boundary", ["role:regulatory_approver"]),
    },
  ];
}

const LIBRARIES: Record<string, KnowledgeObject[]> = {
  auren: aurenLibrary(),
  pioneer: pioneerLibrary(),
  beauty: beautyLibrary(),
};

export function library(verticalId: string): KnowledgeObject[] {
  return LIBRARIES[verticalId] ?? [];
}
