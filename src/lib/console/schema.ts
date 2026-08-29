/**
 * Knowledge Authority — the unified object schema.
 *
 * Reconciles three specifications that independently arrived at the same
 * architecture:
 *
 *   AUREN Paper III v1.1        — Scam + Competency objects, mode eligibility
 *   Project Pioneer Paper IV    — Offence objects, eight-state lifecycle,
 *                                 leading-risk control, language fidelity gate
 *   Beauty Intelligence         — Claim objects, market scope, publish gate
 *
 * Where they disagree, the resolution is recorded at the field. There are four
 * such places and each one is a fork if it is decided wrongly, so they are
 * settled in the schema rather than in a convention document.
 */

/* ═══════════════════════════════════════════════════════════════════════
   1. ELIGIBILITY — the three-axis resolution
   ═════════════════════════════════════════════════════════════════════ */

/**
 * CONFLICT 1. Each paper declares a different "first-class dimension":
 *   AUREN Rule 3    — mode is first-class
 *   Pioneer Rule 3  — language is first-class
 *   Beauty          — market scope is the axis (approved in UAE, not KSA)
 *
 * These are not competing claims. They are three scoping axes, each
 * discovered by the vertical that felt it most. Every object carries all
 * three; a vertical that does not use an axis simply leaves it unconstrained.
 *
 * The resolver evaluates the CONJUNCTION. An object is fireable only when the
 * session's mode, language and market are all admitted AND the object is
 * EFFECTIVE on today's date.
 */
export interface Eligibility {
  /** Session modes this object may fire in. Empty = unconstrained. */
  modes: string[];
  /** Language variants deployable — only those at fidelity `passed`. */
  languages: string[];
  /** Markets or jurisdictions where this object is approved. Empty = all. */
  markets: string[];
}

/* ═══════════════════════════════════════════════════════════════════════
   2. GOVERNANCE — Pioneer's lifecycle, adopted as the platform standard
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Pioneer's eight-state chain. AUREN's four-state lifecycle is a subset of it
 * and nothing in Beauty conflicts, so this becomes the platform standard.
 *
 * The orchestrator refuses to load an object in any status but EFFECTIVE.
 * Emergency withdrawal is a one-step transition to RETIRED taking effect at
 * the next session start.
 */
export type ObjectStatus =
  | "DRAFT"
  | "LEGAL_REVIEW"
  | "TERMINOLOGY_PASS"
  | "FIDELITY_PASS"
  | "APPROVED"
  | "EFFECTIVE"
  | "SUPERSEDED"
  | "RETIRED";

export const STATUS_CHAIN: ObjectStatus[] = [
  "DRAFT",
  "LEGAL_REVIEW",
  "TERMINOLOGY_PASS",
  "FIDELITY_PASS",
  "APPROVED",
  "EFFECTIVE",
];

/** Only EFFECTIVE objects are loadable at runtime. */
export function isLoadable(status: ObjectStatus): boolean {
  return status === "EFFECTIVE";
}

export function nextStatus(status: ObjectStatus): ObjectStatus | null {
  const i = STATUS_CHAIN.indexOf(status);
  if (i === -1 || i === STATUS_CHAIN.length - 1) return null;
  return STATUS_CHAIN[i + 1];
}

/**
 * CONFLICT 2. Pioneer: "Named individuals never appear in objects."
 * Beauty: "the named person who signed the release."
 *
 * Both are right for their category — a police object carrying officer
 * identities becomes discoverable in ways nobody intends; a beauty claim with
 * no signature is a regulatory liability.
 *
 * Resolution: the OBJECT carries a role. The RELEASE EVENT carries an
 * identity, in a separate append-only ledger (see ./release). Pioneer exports
 * the object register; Beauty exports the release ledger. One schema serves
 * both, because the two were never the same fact.
 */
export interface Governance {
  version: string;
  status: ObjectStatus;
  /** Roles only. Never a person. */
  approverRoles: string[];
  /** The statute, framework clause, SOP or decision this derives from. */
  source: string;
  effectiveDate: string | null;
  reviewDue: string | null;
  supersededBy: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════
   3. LANGUAGE VARIANTS — Pioneer's fidelity gate, generalised
   ═════════════════════════════════════════════════════════════════════ */

export type FidelityStatus = "passed" | "pending" | "failed";

export interface LanguageVariant {
  lang: string;
  wording: string;
  /** A variant is deployable only at `passed`. */
  fidelity: FidelityStatus;
}

/* ═══════════════════════════════════════════════════════════════════════
   4. THE OBJECTS
   ═════════════════════════════════════════════════════════════════════ */

export interface BaseObject {
  /** Immutable. Supersession creates a new version, never a new id. */
  id: string;
  kind: KnowledgeObjectKind;
  label: string;
  eligibility: Eligibility;
  governance: Governance;
}

export type KnowledgeObjectKind =
  | "element" // AUREN competency element · Pioneer statutory element · Beauty claim attribute
  | "question" // the governed elicitation string — the most governance-dense object
  | "challenge" // adversarial only; forbidden in a neutral-doctrine vertical
  | "signature" // AUREN failure signature · Beauty forbidden phrasing
  | "action" // verification action · preservation action · handover
  | "boundary"; // the refusal the vertical must never cross

/**
 * ELEMENT — what the determination turns on.
 *
 * AUREN: the reasoning the decision turns on.
 * Pioneer: the facts the law turns on.
 * Beauty: the attributes a recommendation turns on.
 */
export interface ElementObject extends BaseObject {
  kind: "element";
  /** Mandatory: no anchor, no deployment. Asserted by the gate. */
  authorityAnchor: string;
  mandatory: boolean;
  /** Pioneer's honest distinction: not-capturable is legitimate, not-asked is a defect. */
  capturable: boolean;
}

/**
 * QUESTION — every string that can reach a subject and contribute to a
 * determination. This is the object an institution actually approves.
 */
export interface QuestionObject extends BaseObject {
  kind: "question";
  targetElement: string;
  variants: LanguageVariant[];
  /**
   * Pioneer: `high` is prohibited and cannot be saved; `medium` requires a
   * written rationale from a legal reviewer. Enforced by the gate.
   */
  leadingRisk: "none" | "low" | "medium";
  leadingRiskRationale: string | null;
  /**
   * Pioneer's structural control: a question presupposing a fact is fireable
   * only once that fact is established. Leading-risk control by sequencing in
   * data, not by wording review — the pattern a court can verify mechanically.
   */
  firesOnlyAfter: string | null;
  /** How an answer satisfies the element. Verbatim binding is the default. */
  satisfaction: "verbatim_bound" | "entity" | "boolean" | "not_scored";
}

/**
 * CHALLENGE — the adversarial pole.
 *
 * CONFLICT 3. Pioneer forbids it outright; AUREN's escalation ladder is the
 * product; Beauty runs governed personas against staff but never customers.
 *
 * Resolution: doctrine polarity is declared by the vertical pack, and the gate
 * rejects a challenge object in a neutral-doctrine vertical. The console does
 * not render this form there at all.
 */
export interface ChallengeObject extends BaseObject {
  kind: "challenge";
  targetElements: string[];
  /** Approved intensity steps with a hard ceiling. Never improvised. */
  ladderSteps: number;
  ladderCeiling: number;
  /** Distress exits are non-negotiable wherever pressure is applied. */
  distressExit: boolean;
  surfaceProfile: Record<string, string>;
}

/** SIGNATURE — AUREN's failure library; Beauty's forbidden phrasings. */
export interface SignatureObject extends BaseObject {
  kind: "signature";
  negatedElement: string;
  /** Beauty: wordings that must never be used, in any language. */
  forbiddenPhrasings: string[];
}

/** ACTION — verification, preservation, or handover. */
export interface ActionObject extends BaseObject {
  kind: "action";
  steps: number;
  /** Pioneer: machine-evaluable deadline, reviewed with the client. */
  deadlineFormula: string | null;
}

/** BOUNDARY — the question the system must refuse, in every language. */
export interface BoundaryObject extends BaseObject {
  kind: "boundary";
  /** Probes the gate fires to prove the refusal holds. */
  probes: string[];
  refusalBehaviour: string;
}

export type KnowledgeObject =
  | ElementObject
  | QuestionObject
  | ChallengeObject
  | SignatureObject
  | ActionObject
  | BoundaryObject;

/* ═══════════════════════════════════════════════════════════════════════
   5. THE VERTICAL PACK
   ═════════════════════════════════════════════════════════════════════ */

/**
 * What a vertical declares about itself. This is the extensibility mechanism —
 * and the reason a police workspace cannot be given an escalation ladder by
 * an administrator who is in a hurry.
 */
export interface VerticalPack {
  id: string;
  name: string;
  programme: string;
  /** The paper this pack is populated from. */
  source: string;
  /**
   * Neutral verticals may not hold challenge objects at all. Dual verticals
   * carry both poles, gated per surface.
   */
  doctrine: "neutral" | "dual";
  modes: string[];
  languages: string[];
  markets: string[];
  anchorAuthority: string;
  outputObject: string;
  /**
   * CONFLICT 4. AUREN assesses the person and tells them; Pioneer assesses
   * nothing about the declarant; Beauty assesses the advisor and never the
   * customer. Resolution: assessment binds to the SURFACE, not the vertical.
   */
  surfaces: { id: string; name: string; assesses: boolean; adversarial: boolean }[];
  /** Where the human authority sits. Every paper has one; none may be empty. */
  humanAuthority: string;
  accent: string;
}
