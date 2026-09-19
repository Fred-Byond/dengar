/**
 * AUREN — the five libraries, and the Knowledge Factory that fills them.
 *
 * WHY NOT A VECTOR DATABASE.
 *
 * The obvious build is: put the regulator's PDFs in a vector store, retrieve
 * chunks, let the model answer. That is conventional RAG and it fails this
 * product in four specific ways, none of which are fixable with a better
 * embedding model.
 *
 *   1. Retrieval returns what is *similar*, not what is *in force*. A superseded
 *      clause embeds identically to the one that replaced it.
 *   2. A chunk carries no jurisdiction, no effective date and no approver, so
 *      nothing downstream can tell whether it may be said here, now, to this
 *      person.
 *   3. There is no unit to approve. A reviewer can approve a document; they
 *      cannot approve the 340 chunks it was split into, which is what the model
 *      actually sees.
 *   4. Anything that reaches the index reaches the learner. Poisoned or merely
 *      wrong content has no gate to fail.
 *
 * So source material is converted into atomic objects that carry their own
 * governance, and the libraries below are what those objects are sorted into.
 * The distinction is not organisational tidiness: each library has a different
 * approver, a different review cadence and a different failure mode.
 */

import type { KnowledgeObjectKind } from "../console/schema";

/* ═══════════════════════════════════════════════════════════════════════
   THE FIVE LIBRARIES
   ═════════════════════════════════════════════════════════════════════ */

export interface Library {
  id: string;
  label: string;
  /** What lives here, in one line. */
  holds: string;
  /** Object kinds sorted into this library. */
  kinds: KnowledgeObjectKind[];
  /** Who signs an object out of this library. */
  approverRoles: string[];
  /** What goes wrong when this library is wrong. The reason it is separate. */
  failureMode: string;
  /** How often it must be revisited even if nothing changed upstream. */
  reviewCadence: string;
}

export const LIBRARIES: Library[] = [
  {
    id: "authority",
    label: "A · Authority Knowledge",
    holds:
      "Validated facts, requirements and educational guidance derived from regulators, central banks, legislation, licensed-entity registers and official investor warnings.",
    kinds: ["element"],
    approverRoles: ["role:legal_reviewer", "role:domain_reviewer"],
    failureMode:
      "Stating a rule that is not in force, or is in force elsewhere. The learner acts on it and the institution carries the consequence.",
    reviewCadence: "Quarterly, and immediately on any upstream amendment.",
  },
  {
    id: "competency",
    label: "B · Competency and Assessment",
    holds:
      "What investor readiness means: the behaviour to be demonstrated, the question that elicits it, what evidence qualifies, what constitutes failure, and what cannot be determined.",
    kinds: ["question"],
    approverRoles: ["role:domain_reviewer", "role:legal_reviewer"],
    failureMode:
      "Scoring people against a criterion nobody approved. Every determination made under it is unsound, retroactively, including the ones that passed.",
    reviewCadence: "Half-yearly, plus a fidelity pass on every new language.",
  },
  {
    id: "coaching",
    label: "C · Coaching",
    holds:
      "Approved interventions: misconception corrections, verification workflows, scam-response protocols, worked examples, remediation, escalation to a licensed professional, and safeguarding responses.",
    kinds: ["action", "signature"],
    approverRoles: ["role:domain_reviewer"],
    failureMode:
      "Coaching that is wrong, or right but unusable by the person in front of you. It feels harmless and it is the layer that changes behaviour.",
    reviewCadence: "Half-yearly, and on any change to the element it serves.",
  },
  {
    id: "scenario",
    label: "D · Scenario and Adversary",
    holds:
      "Governed role-play: scam type, character, opening proposition, persuasion techniques, escalation ladder, pressure ceiling, evidence presented, prohibited statements and the distress exit.",
    kinds: ["challenge"],
    approverRoles: ["role:safety_reviewer", "role:domain_reviewer", "role:legal_reviewer"],
    failureMode:
      "A machine applying real pressure to a real person outside what anyone approved. The only library whose failure can harm the learner during the session rather than after it.",
    reviewCadence: "Quarterly, plus adversarial re-testing on every ladder change.",
  },
  {
    id: "boundary",
    label: "E · Boundary and Policy",
    holds:
      "What AUREN may never do: no personalised recommendation, no prediction or guarantee, no claim of licensed status, no eligibility decision, no unapproved regulatory interpretation, no improvisation during assessment.",
    kinds: ["boundary"],
    approverRoles: ["role:legal_reviewer", "role:safety_reviewer"],
    failureMode:
      "The one library whose failure is not a bad answer but a regulated act. A boundary that does not hold in one deployed language does not hold.",
    reviewCadence: "Quarterly, and proven in every deployed language at every release.",
  },
];

export function libraryFor(kind: KnowledgeObjectKind): Library | undefined {
  return LIBRARIES.find((l) => l.kinds.includes(kind));
}

export function libraryById(id: string): Library | undefined {
  return LIBRARIES.find((l) => l.id === id);
}

/* ═══════════════════════════════════════════════════════════════════════
   THE FACTORY — ten stages, and what each one is actually for
   ═════════════════════════════════════════════════════════════════════ */

export interface FactoryStage {
  n: number;
  id: string;
  label: string;
  /** What has to be true to leave this stage. */
  exitCriterion: string;
  /** Who does it. `software` stages are the ones that must not be judgement. */
  actor: "software" | "role:domain_reviewer" | "role:legal_reviewer" | "role:safety_reviewer" | "role:native_reviewer" | "authority";
  /** True where a failure stops the object dead rather than annotating it. */
  blocking: boolean;
  /** The specific thing this stage catches that no other stage would. */
  catches: string;
}

export const STAGES: FactoryStage[] = [
  {
    n: 1, id: "source_registration", label: "Source registration", actor: "authority", blocking: true,
    exitCriterion: "The publication is on the approved source list, with an owner and a retrieval method recorded.",
    catches: "Material of unknown provenance entering the corpus. Everything downstream assumes this held.",
  },
  {
    n: 2, id: "ingestion", label: "Ingestion and classification", actor: "software", blocking: true,
    exitCriterion: "Clauses, dates, jurisdictions and topics extracted; each passage hashed at the moment of retrieval.",
    catches: "Silent upstream edits. Without a hash taken here, nothing later can prove the source still says what it said.",
  },
  {
    n: 3, id: "object_creation", label: "Object creation", actor: "software", blocking: true,
    exitCriterion: "Atomic objects proposed, all DRAFT, each carrying the gaps it could not fill and the role that must fill them.",
    catches: "Nothing, by design — this stage proposes. It is listed because its output being DRAFT is the property everything else rests on.",
  },
  {
    n: 4, id: "automated_checks", label: "Automated checks", actor: "software", blocking: true,
    exitCriterion: "No missing source, no contradiction with an effective object, nothing expired, no prohibited formulation, no incomplete metadata.",
    catches: "The mechanical failures, cheaply, before a specialist spends an hour on an object that was never admissible.",
  },
  {
    n: 5, id: "sme_review", label: "Subject-matter review", actor: "role:domain_reviewer", blocking: true,
    exitCriterion: "A financial-education or fraud specialist has confirmed the substance is right and usable.",
    catches: "Content that is formally correct and substantively useless — the failure automation cannot see.",
  },
  {
    n: 6, id: "compliance", label: "Compliance approval", actor: "role:legal_reviewer", blocking: true,
    exitCriterion: "The authority or institutional owner has approved this object for this use in this jurisdiction.",
    catches: "Deployment nobody with standing agreed to. This is the signature a regulator asks for first.",
  },
  {
    n: 7, id: "native_review", label: "Native-language review", actor: "role:native_reviewer", blocking: true,
    exitCriterion: "Every deployed variant reviewed by a native speaker against the source — wording and evidence rule together.",
    catches:
      "Translation that is linguistically fine and evidentially wrong. Cues and culturally specific scam signals change across languages; a translated rubric silently scores competent people as incompetent.",
  },
  {
    n: 8, id: "adversarial", label: "Adversarial testing", actor: "role:safety_reviewer", blocking: true,
    exitCriterion: "Prompt injection, leading questions, boundary bypass, poisoning and unsupported-claim probes all held.",
    catches: "Failures that appear only under attack — which is the only condition that matters for the boundary library.",
  },
  {
    n: 9, id: "publish_gate", label: "Publish gate", actor: "software", blocking: true,
    exitCriterion: "All ten tests pass. A signed, immutable bundle is minted. No waiver path exists for a blocking failure.",
    catches: "Everything the previous stages were supposed to catch, one more time, mechanically and without discretion.",
  },
  {
    n: 10, id: "monitoring", label: "Monitoring and retirement", actor: "software", blocking: false,
    exitCriterion: "Upstream change, new warning or new typology triggers review, suspension or replacement automatically.",
    catches:
      "The slow failure: a corpus that was right when it shipped and is quietly wrong a year later. It is the only stage with no end.",
  },
];

export function stage(id: string): FactoryStage | undefined {
  return STAGES.find((s) => s.id === id);
}

/* ═══════════════════════════════════════════════════════════════════════
   WHERE AN OBJECT SITS
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Map the object lifecycle onto the factory floor.
 *
 * The eight-state lifecycle and the ten-stage factory are the same journey
 * described at two grains: the lifecycle is what the object's record says, the
 * factory is what a person is doing about it this week. Keeping both and
 * mapping between them is more useful than collapsing them, because an operator
 * asks "what is blocked and who has it" and a register asks "is this loadable".
 */
export function stageForStatus(status: string): FactoryStage | undefined {
  switch (status) {
    case "DRAFT": return stage("object_creation");
    case "LEGAL_REVIEW": return stage("compliance");
    case "TERMINOLOGY_PASS": return stage("native_review");
    case "FIDELITY_PASS": return stage("adversarial");
    case "APPROVED": return stage("publish_gate");
    case "EFFECTIVE": return stage("monitoring");
    case "SUPERSEDED":
    case "RETIRED": return stage("monitoring");
    default: return undefined;
  }
}

/** The role holding an object right now, so a queue can be addressed to someone. */
export function heldBy(status: string): string {
  return stageForStatus(status)?.actor ?? "unassigned";
}
