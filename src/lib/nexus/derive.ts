/**
 * AUREN Nexus — derivation. Signal in, DRAFT candidates out.
 *
 * This is the only place intelligence becomes content, and it is deliberately
 * the weakest link in the system by design:
 *
 *   Derivation PROPOSES. It never approves, never publishes, and never fills a
 *   field whose authority it does not have.
 *
 * Everything it emits is DRAFT, carries the roles that must sign it, and comes
 * with an explicit list of what it could not supply. The gaps are the product.
 * A derivation that silently invented an authority anchor or a ladder ceiling
 * would be worse than no derivation at all, because it would look finished.
 *
 * What it can legitimately do is mechanical: classify, connect the tactic to a
 * competency element, shape the objects, carry the surface profile through so
 * the retest selector keeps working, and pre-compute the eligibility. That is
 * real work and it is most of the typing. It is not the judgement.
 */

import type {
  ChallengeObject,
  ElementObject,
  KnowledgeObject,
  QuestionObject,
  SignatureObject,
} from "../console/schema";
import type { ThreatSignal } from "./signal";

/* ═══════════════════════════════════════════════════════════════════════
   THE GAPS — what a human must supply before any of this can be released
   ═════════════════════════════════════════════════════════════════════ */

export interface DerivationGap {
  objectId: string;
  field: string;
  /** The role with the authority to fill it. Never "the system". */
  role: string;
  detail: string;
}

export interface Derivation {
  signalId: string;
  objects: KnowledgeObject[];
  gaps: DerivationGap[];
  /** The element the tactic was mapped onto, and how confident that mapping is. */
  mappedElement: string | null;
  mappingBasis: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   MAPPING A TACTIC ONTO A COMPETENCY ELEMENT
   ═════════════════════════════════════════════════════════════════════ */

/**
 * The reasoning each existing element protects, in the words an authority is
 * likely to use when describing what a tactic defeats. This is a lookup, not a
 * classifier: when nothing matches, it says so and proposes a new element
 * rather than forcing the tactic into the nearest existing one.
 */
const ELEMENT_CUES: Array<{ elementId: string; cues: string[] }> = [
  { elementId: "E-VER-02", cues: ["verif", "register", "authoris", "authoriz", "licen", "independent", "check"] },
  { elementId: "E-RET-01", cues: ["return", "yield", "profit", "percent", "plausib", "too good"] },
  { elementId: "E-AI-01", cues: ["ai", "algorithm", "model", "bot", "automated", "machine learning"] },
  { elementId: "E-RISK-01", cues: ["downside", "loss", "lose", "capital", "risk", "guarantee"] },
  { elementId: "E-URG-01", cues: ["urgen", "deadline", "closing", "scarcity", "time pressure", "tonight"] },
  { elementId: "E-AUTH-01", cues: ["authority", "regulator", "official", "celebrity", "endorse", "status", "figure"] },
  { elementId: "E-SOC-01", cues: ["social proof", "other people", "testimonial", "screenshot", "group", "everyone"] },
  { elementId: "E-PAY-01", cues: ["payment", "transfer", "wallet", "account", "destination", "third party", "beneficiar"] },
];

export function mapToElement(signal: ThreatSignal): { elementId: string | null; basis: string } {
  const haystack = `${signal.defeats} ${signal.method}`.toLowerCase();
  const hits = ELEMENT_CUES.map((e) => ({
    elementId: e.elementId,
    score: e.cues.filter((c) => haystack.includes(c)).length,
  })).filter((h) => h.score > 0);

  if (hits.length === 0) {
    return {
      elementId: null,
      basis:
        "No existing competency element covers the reasoning this tactic defeats. A new element is proposed — which is an expensive thing to accept, and the reviewer should first satisfy themselves that this is genuinely new reasoning rather than a new dress on an existing failure.",
    };
  }

  hits.sort((a, b) => b.score - a.score);
  const top = hits[0];
  const tie = hits.filter((h) => h.score === top.score);
  if (tie.length > 1) {
    return {
      elementId: top.elementId,
      basis: `Ambiguous: ${tie.map((t) => t.elementId).join(", ")} match equally. ${top.elementId} proposed on order alone — a domain reviewer should choose deliberately.`,
    };
  }
  return {
    elementId: top.elementId,
    basis: `Mapped to ${top.elementId} on ${top.score} vocabulary cue${top.score === 1 ? "" : "s"} in the method and defeats fields.`,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   DERIVATION
   ═════════════════════════════════════════════════════════════════════ */

const DRAFT_GOV = (source: string, roles: string[]) => ({
  version: "0.1.0-draft",
  status: "DRAFT" as const,
  approverRoles: roles,
  source,
  effectiveDate: null,
  reviewDue: null,
  supersededBy: null,
});

export function derive(signal: ThreatSignal, deployedLanguages: string[], markets: string[]): Derivation {
  const { elementId, basis } = mapToElement(signal);
  const objects: KnowledgeObject[] = [];
  const gaps: DerivationGap[] = [];
  const stem = signal.id.replace(/^SIG-/, "");
  const source = `Threat signal ${signal.id} · ${signal.jurisdiction} · observed from ${signal.observedFrom}`;

  /* An element only when nothing existing covers it. Proposing elements freely
     is how an ontology becomes unmaintainable, so this is the narrow path. */
  let targetElement = elementId;
  if (!elementId) {
    const el: ElementObject = {
      id: `E-NEW-${stem}`,
      kind: "element",
      label: signal.defeats,
      eligibility: { modes: ["REHEARSE", "LEARN"], languages: deployedLanguages, markets },
      governance: DRAFT_GOV(source, ["role:domain_reviewer", "role:legal_reviewer"]),
      authorityAnchor: "",
      mandatory: false,
      capturable: true,
    };
    objects.push(el);
    targetElement = el.id;
    gaps.push({
      objectId: el.id,
      field: "authorityAnchor",
      role: "role:legal_reviewer",
      detail:
        "No anchor. A competency element must cite the published principle it derives from — the gate blocks release without it, and no derivation may guess a clause.",
    });
    gaps.push({
      objectId: el.id,
      field: "mandatory",
      role: "role:domain_reviewer",
      detail: "Proposed as optional. Whether every investor must demonstrate this is a programme decision, not a property of the signal.",
    });
  }

  /* The signature: the failure this tactic produces in a person. */
  const sig: SignatureObject = {
    id: `FAIL-${stem}`,
    kind: "signature",
    label: `Failure under ${signal.title}`,
    eligibility: { modes: ["REHEARSE"], languages: deployedLanguages, markets },
    governance: DRAFT_GOV(source, ["role:domain_reviewer"]),
    negatedElement: targetElement ?? "",
    forbiddenPhrasings: [],
  };
  objects.push(sig);
  gaps.push({
    objectId: sig.id,
    field: "definition and coaching line",
    role: "role:domain_reviewer",
    detail:
      "A signature has to be sayable to the learner in the moment they hear their own sentence quoted back. That line is written, not extracted.",
  });

  /* The question: the diagnostic that resolves the element before pressure. */
  const q: QuestionObject = {
    id: `Q-${stem}`,
    kind: "question",
    label: `Diagnostic for ${targetElement ?? "the mapped element"}`,
    eligibility: { modes: ["REHEARSE", "LEARN"], languages: deployedLanguages, markets },
    governance: DRAFT_GOV(source, ["role:domain_reviewer", "role:legal_reviewer"]),
    targetElement: targetElement ?? "",
    variants: deployedLanguages.map((lang) => ({ lang, wording: "", fidelity: "pending" as const })),
    leadingRisk: "none",
    leadingRiskRationale: null,
    firesOnlyAfter: null,
    satisfaction: "verbatim_bound",
  };
  objects.push(q);
  gaps.push({
    objectId: q.id,
    field: "wording, every language",
    role: "role:domain_reviewer + native reviewers",
    detail:
      "Every deployable variant needs authored wording and native review. Machine-translating a question also machine-translates the evidence rule behind it, which silently scores competent people as incompetent.",
  });

  /* The challenge: the role-play itself. The most governed object in the set,
     and the one a derivation is least entitled to complete. */
  const ch: ChallengeObject = {
    id: `CH-${stem}`,
    kind: "challenge",
    label: signal.title,
    eligibility: { modes: ["REHEARSE"], languages: deployedLanguages, markets },
    governance: DRAFT_GOV(source, ["role:domain_reviewer", "role:safety_reviewer", "role:legal_reviewer"]),
    targetElements: targetElement ? [targetElement] : [],
    ladderSteps: 0,
    ladderCeiling: 0,
    distressExit: true,
    surfaceProfile: {
      typology: signal.surface.typology,
      channel: signal.surface.channel,
      persona: signal.surface.persona,
      productClass: signal.surface.productClass,
    },
  };
  objects.push(ch);
  gaps.push({
    objectId: ch.id,
    field: "escalation ladder — every step's words",
    role: "role:safety_reviewer + role:domain_reviewer",
    detail:
      "The persona's sentences are the highest-risk strings in the product: they are adversarial, they are spoken to a real person, and they are the thing an intelligence feed must never be allowed to write on its own.",
  });
  gaps.push({
    objectId: ch.id,
    field: "ladderCeiling",
    role: "role:safety_reviewer",
    detail:
      "No ceiling. How far pressure may go is a safety judgement about a specific cohort, and the gate refuses a ladder that exceeds a ceiling nobody set.",
  });

  return { signalId: signal.id, objects, gaps, mappedElement: targetElement, mappingBasis: basis };
}

/**
 * The honest headline for a derivation.
 *
 * Deliberately phrased as work remaining rather than work done. A console that
 * reported "4 objects created" from an upload would be telling the operator
 * they had finished when they had not started.
 */
export function derivationSummary(d: Derivation): string {
  const byRole = new Map<string, number>();
  d.gaps.forEach((g) => byRole.set(g.role, (byRole.get(g.role) ?? 0) + 1));
  const roles = Array.from(byRole.entries())
    .map(([r, n]) => `${n} for ${r.replace("role:", "").replace(/_/g, " ")}`)
    .join(", ");
  return `${d.objects.length} candidate objects drafted. None is releasable: ${d.gaps.length} fields need a human — ${roles}.`;
}
