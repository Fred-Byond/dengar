/**
 * AUREN Nexus — the governed training module.
 *
 * The second thing an authority has, and in most cases the thing it has had
 * for years: a published curriculum. Securities commissions already train
 * their own supervisors, the trainers who run investor-education sessions,
 * and — increasingly — bank frontline staff who are the last human between a
 * customer and a transfer. That material is authored, reviewed, versioned and
 * cited. It is the opposite of a threat signal in every respect that matters.
 *
 * WHY THIS IS NOT THE SAME OBJECT AS A SIGNAL.
 *
 *   A signal says what the adversary does.
 *   A module says what the authority teaches.
 *
 * You need both, and they derive into different things. A challenge with no
 * competency element to score against is theatre; an element with no challenge
 * to pressure it is a quiz. Signals produce challenges and failure signatures,
 * because they describe an adversary. Modules produce elements and diagnostic
 * questions, because they describe what someone should be able to do. A
 * derivation that invented a fraud scenario out of a curriculum would be
 * inventing the adversary, and nothing in a training handbook authorises that.
 *
 * WHAT A MODULE CAN DO THAT A SIGNAL CANNOT.
 *
 * A module is the authority's own published guidance, so a clause of it can
 * serve as the authority anchor an element is required to cite. That is the
 * single most expensive gap in a signal derivation — it needs a legal reviewer
 * to go and find the published principle — and uploading the handbook closes
 * it, because the principle arrived with the upload. The reviewer still has to
 * confirm the clause supports the element. Confirming a proposed citation is a
 * different order of work from sourcing one.
 *
 * WHAT IT STILL CANNOT DO.
 *
 * Supply the persona's words, or set the ladder ceiling. Those are adversarial
 * strings spoken to a real person under pressure, and no amount of authority
 * behind a curriculum makes a machine entitled to write them.
 */

import type { Sharing } from "./vocabulary";

/* ═══════════════════════════════════════════════════════════════════════
   THE PIPELINE
   ═════════════════════════════════════════════════════════════════════ */

/**
 * MAPPED, not DERIVED. A signal is derived *from* — the content does not exist
 * until someone writes it. A module is mapped *onto* the competency frame: the
 * content already exists, and the work is correspondence rather than
 * invention. The word is doing real work, because the two jobs need different
 * reviewers and take different amounts of time.
 */
export type ModuleStatus =
  | "SUBMITTED"
  | "TRIAGED"
  | "MAPPED"
  | "IN_REVIEW"
  | "RELEASED"
  | "DECLINED"
  | "SUPERSEDED";

export const MODULE_CHAIN: ModuleStatus[] = [
  "SUBMITTED",
  "TRIAGED",
  "MAPPED",
  "IN_REVIEW",
  "RELEASED",
];

export function nextModuleStatus(s: ModuleStatus): ModuleStatus | null {
  const i = MODULE_CHAIN.indexOf(s);
  if (i === -1 || i === MODULE_CHAIN.length - 1) return null;
  return MODULE_CHAIN[i + 1];
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTROLLED AXES
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Who the module was written for. This is not a tag — it is a constraint.
 * Material written to teach a bank's frontline staff how to intercept a
 * transfer is written for someone doing a job, with colleagues, a screen and a
 * procedure. Reading it at a retail investor under pressure is a category
 * error, and the mapping says so rather than letting the audience quietly
 * change between upload and delivery.
 */
export const AUDIENCES = [
  { id: "AUD-RETAIL", label: "Retail investors", learnerFacing: true },
  { id: "AUD-BANK-STAFF", label: "Bank and broker frontline staff", learnerFacing: false },
  { id: "AUD-TRAINER", label: "Trainers running investor education", learnerFacing: false },
  { id: "AUD-ADVISER", label: "Licensed advisers", learnerFacing: false },
  { id: "AUD-SUPERVISOR", label: "Supervisory staff", learnerFacing: false },
] as const;

export type AudienceId = (typeof AUDIENCES)[number]["id"];

export function audienceLabel(id: string): string {
  return AUDIENCES.find((a) => a.id === id)?.label ?? id;
}

export function learnerFacing(ids: string[]): boolean {
  return ids.some((id) => AUDIENCES.find((a) => a.id === id)?.learnerFacing);
}

/**
 * On what basis the network may use the text.
 *
 * A published handbook and a licensed third-party curriculum are not the same
 * asset, and an internal staff procedure is not an asset at all for this
 * purpose. Getting this wrong is not a governance abstraction: it is quoting
 * someone else's copyrighted training material to a retail investor, or
 * publishing a bank's internal interception procedure to the people it is
 * designed to detect.
 */
export const USAGE_BASES = [
  {
    id: "own_publication",
    label: "Authority's own publication",
    quotable: true,
    note: "The authority published it and may be cited as its source. Clauses can anchor an element.",
  },
  {
    id: "licensed",
    label: "Licensed to the programme",
    quotable: true,
    note: "Quotable while the licence runs. Derived objects must not outlive it, so the licence date becomes the review date.",
  },
  {
    id: "restricted_internal",
    label: "Restricted — internal procedure",
    quotable: false,
    note: "May inform what gets rehearsed. Nothing derived from it may quote it, and it never becomes an anchor.",
  },
] as const;

export type UsageBasisId = (typeof USAGE_BASES)[number]["id"];

export function usageBasis(id: string) {
  return USAGE_BASES.find((u) => u.id === id);
}

export function quotable(id: string): boolean {
  return usageBasis(id)?.quotable ?? false;
}

/* ═══════════════════════════════════════════════════════════════════════
   THE MODULE
   ═════════════════════════════════════════════════════════════════════ */

/**
 * What the module claims a person will be able to do. The hook into AUREN, and
 * the exact analogue of a signal's `defeats` field: without it there is
 * nothing to map onto a competency element, and a module that only lists topics
 * covered cannot be mapped at all — which is a real and common state for real
 * training material, so the intake check names it rather than guessing.
 */
export interface LearningOutcome {
  id: string;
  /** Stated as a behaviour, not a topic. "Can verify…", not "Covers…". */
  statement: string;
  /**
   * The clause the uploader says supports it. A mapping with no citation is an
   * assertion, and an assertion cannot anchor anything.
   */
  clauseId: string | null;
}

/**
 * A verbatim passage plus where it came from. The Nexus stores text and a
 * citation, never an opaque file: an anchor that reads "see the handbook" is
 * not an anchor, and a reviewer confirming a mapping needs the sentence in
 * front of them, not a page reference to a PDF nobody can open from here.
 */
export interface ModuleClause {
  id: string;
  /** Section and page, as the module itself numbers them. */
  citation: string;
  /** The authority's own words, unedited. */
  text: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  authorityId: string;
  jurisdiction: string;

  /** The authority's own edition string. Editions supersede; they do not merge. */
  edition: string;
  publishedOn: string;

  audience: string[];
  /** Languages the module itself exists in — not the languages AUREN deploys. */
  languages: string[];

  usageBasis: string;
  /** Set for `licensed`. After this date nothing derived from it may deploy. */
  licenceExpires: string | null;

  /** One paragraph: what the module covers, in the authority's framing. */
  scope: string;
  outcomes: LearningOutcome[];
  clauses: ModuleClause[];

  sharing: Sharing;
  status: ModuleStatus;
  /** Ids of knowledge objects mapped from this module. */
  derivedObjectIds: string[];
  declineReason: string | null;
  supersededBy: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════
   INTAKE HYGIENE
   ═════════════════════════════════════════════════════════════════════ */

export interface ModuleFinding {
  field: string;
  detail: string;
  blocking: boolean;
}

/**
 * What a module must carry before anyone spends review time on it.
 *
 * The expensive missing field is `outcomes`, exactly as `defeats` is for a
 * signal, and for the same reason: a module that lists topics rather than
 * behaviours cannot be connected to a competency element, so there is nothing
 * to map and nothing to score. Most real training material is written this
 * way. Saying so at intake is the difference between a two-minute conversation
 * with the contributing authority and a three-week round trip.
 */
export function checkModuleIntake(m: TrainingModule): ModuleFinding[] {
  const out: ModuleFinding[] = [];
  const need = (v: string, field: string, detail: string, blocking = true) => {
    if (!v || !v.trim()) out.push({ field, detail, blocking });
  };

  need(m.title, "title", "No title. A module queue nobody can read is not a queue.");
  need(m.scope, "scope", "No scope. A reviewer cannot check a mapping against a module whose subject is unstated.");
  need(m.edition, "edition", "No edition. Editions supersede each other, and re-anchoring depends on knowing which one an object cites.");
  need(m.publishedOn, "publishedOn", "No publication date. A module of unknown vintage may already be superseded by its own author.");

  if (m.audience.length === 0) {
    out.push({
      field: "audience",
      detail: "No audience. Material written for frontline staff and material written for retail investors are different assets, and a mapping that does not know which it has will propose the wrong objects.",
      blocking: true,
    });
  }

  if (m.outcomes.length === 0) {
    out.push({
      field: "outcomes",
      detail:
        "No stated learning outcomes. The module may be excellent and it still cannot be mapped: nothing connects a list of topics to a competency element, so there is nothing to derive and nothing to score. The contributing authority is the only party that can restate its own curriculum as behaviours.",
      blocking: true,
    });
  }

  if (m.clauses.length === 0 && quotable(m.usageBasis)) {
    out.push({
      field: "clauses",
      detail:
        "No clauses captured. This is the one thing a module can supply that a signal cannot — the published principle an element is required to cite. Without a passage and its citation, mapping proposes elements with the same empty anchor a signal would.",
      blocking: true,
    });
  }

  const unsupported = m.outcomes.filter((o) => !o.clauseId);
  if (unsupported.length > 0 && quotable(m.usageBasis)) {
    out.push({
      field: "outcomes",
      detail: `${unsupported.length} outcome${unsupported.length === 1 ? " cites" : "s cite"} no clause. Each will map to an element with an unfilled anchor, which a legal reviewer must then source by hand — the expense the upload was supposed to remove.`,
      blocking: false,
    });
  }

  if (!usageBasis(m.usageBasis)) {
    out.push({
      field: "usageBasis",
      detail: "No usage basis. Whether the network may quote this text is a legal fact about the document, not a default.",
      blocking: true,
    });
  }

  if (m.usageBasis === "licensed" && !m.licenceExpires) {
    out.push({
      field: "licenceExpires",
      detail: "Licensed with no expiry recorded. A derived object outliving its licence is a live compliance exposure, and the review date has nothing to be set from.",
      blocking: true,
    });
  }

  if (m.usageBasis === "restricted_internal") {
    out.push({
      field: "usageBasis",
      detail:
        "Restricted. It may inform what the programme rehearses, and nothing mapped from it may quote it or cite it as an anchor. Frontline interception procedure is material the adversary would very much like to read.",
      blocking: false,
    });
  }

  if (!learnerFacing(m.audience)) {
    out.push({
      field: "audience",
      detail:
        "Written for practitioners, not investors. Mapping will still connect it to competency elements, but every learner-facing string derived from it has to be re-authored for someone with no job, no procedure and no colleague beside them.",
      blocking: false,
    });
  }

  return out;
}

export function moduleIntakeReady(m: TrainingModule): boolean {
  return checkModuleIntake(m).every((f) => !f.blocking);
}
