/**
 * AUREN — generation permissions. What the model may do, per mode, enforced.
 *
 * THE SENTENCE THIS FILE EXISTS TO MAKE TRUE:
 *
 *   The model may select, sequence, explain and deliver.
 *   It may not create authority.
 *
 * Every product in this space says something like that in a slide. The
 * difference between a slide and a system is whether the sentence is checkable
 * at runtime, on the actual bytes the model returned, before they reach a
 * person. That is what this file does: it defines what the orchestrator hands
 * the model for a turn, what shape the model may return, and the validation
 * that rejects a return which stepped outside it.
 *
 * WHY A MATRIX RATHER THAN ONE RULE.
 *
 * "Never let the model generate" is unshippable — it would make the coach a
 * decision tree reading canned strings, and the whole premise is a conversation
 * that feels like a person. "Let the model generate with a good prompt" is the
 * thing regulators have correctly stopped believing. The workable answer is
 * that freedom is a property of the *mode*: explaining an approved fact to a
 * confused learner is a different act from deciding whether they passed, and
 * conflating them is how a system ends up improvising an assessment criterion.
 *
 * So: six modes, each with its own ceiling, and a turn that declares which mode
 * it is in before the model is called.
 */

import type { KnowledgeObject } from "../console/schema";

/* ═══════════════════════════════════════════════════════════════════════
   THE ACTS
   ═════════════════════════════════════════════════════════════════════ */

/**
 * What a model can be asked to do, decomposed far enough that the permissions
 * are meaningful. "Generate" is too coarse to govern; these are not.
 */
export const ACTS = [
  { id: "select", label: "Select which approved object fires next" },
  { id: "sequence", label: "Order approved objects within a turn" },
  { id: "paraphrase", label: "Restate approved content in the learner's register" },
  { id: "explain", label: "Explain approved content beyond its literal wording" },
  { id: "classify", label: "Judge a response against an approved rubric" },
  { id: "escalate", label: "Advance a persona along an approved ladder" },
  { id: "compose_free", label: "Compose sentences not traceable to an approved object" },
  { id: "author_criterion", label: "Create or alter an assessment criterion" },
  { id: "author_question", label: "Write a new assessment question" },
  { id: "advise", label: "Give a personalised investment recommendation" },
] as const;

export type ActId = (typeof ACTS)[number]["id"];

export function actLabel(id: string): string {
  return ACTS.find((a) => a.id === id)?.label ?? id;
}

/* ═══════════════════════════════════════════════════════════════════════
   THE MODES
   ═════════════════════════════════════════════════════════════════════ */

export interface ModePolicy {
  id: string;
  label: string;
  /** What the mode is for, in one line a reviewer can check behaviour against. */
  purpose: string;
  allowed: ActId[];
  /** Acts that are refused in this mode specifically, beyond the global bans. */
  refused: ActId[];
  /**
   * Whether every user-facing sentence must resolve to an approved object.
   * False only where paraphrase is the point and the substance is still bound.
   */
  citationRequired: boolean;
  /** What the orchestrator does when the model returns something invalid. */
  onViolation: "refuse_and_escalate" | "fall_back_to_approved_wording" | "drop_turn";
}

/**
 * Six modes. The ordering is deliberate: freedom decreases as consequence
 * rises, and the two most constrained are the two that produce a record
 * somebody else will rely on.
 */
export const MODES: ModePolicy[] = [
  {
    id: "educate",
    label: "General education",
    purpose:
      "Explain approved knowledge in language this learner can use, with the source visible.",
    allowed: ["select", "sequence", "paraphrase", "explain"],
    refused: ["author_criterion", "author_question", "advise", "compose_free"],
    citationRequired: true,
    onViolation: "fall_back_to_approved_wording",
  },
  {
    id: "coach",
    label: "Coaching",
    purpose:
      "Choose an approved intervention for the failure that actually occurred, and deliver it as a person would.",
    allowed: ["select", "sequence", "paraphrase", "explain"],
    refused: ["author_criterion", "author_question", "advise", "classify"],
    citationRequired: true,
    onViolation: "fall_back_to_approved_wording",
  },
  {
    id: "assess",
    label: "Assessment",
    purpose:
      "Decide whether what the learner said satisfies an approved element, and bind the decision to their words.",
    allowed: ["select", "sequence", "classify"],
    /* Paraphrase is refused here and the refusal is the point. The moment an
       assessor restates what the learner said, the determination is bound to
       the restatement rather than to the person, and the evidence chain breaks
       exactly where it matters most. */
    refused: ["paraphrase", "explain", "compose_free", "author_criterion", "author_question", "advise"],
    citationRequired: true,
    onViolation: "refuse_and_escalate",
  },
  {
    id: "roleplay",
    label: "Bounded role-play",
    purpose:
      "Play an approved adversary within an approved scenario graph, up to an approved pressure ceiling.",
    allowed: ["select", "sequence", "paraphrase", "escalate"],
    refused: ["classify", "explain", "author_question", "author_criterion", "advise"],
    /* The persona's lines are authored strings from the ladder. Paraphrase is
       permitted so the adversary can answer what the learner actually said
       rather than reciting past them — but the substance stays on the rung. */
    citationRequired: true,
    onViolation: "drop_turn",
  },
  {
    id: "regulatory",
    label: "Regulatory answer",
    purpose:
      "Answer a question about what a rule says, from current objects effective in this jurisdiction.",
    allowed: ["select", "sequence"],
    refused: ["paraphrase", "explain", "compose_free", "author_criterion", "author_question", "advise"],
    citationRequired: true,
    onViolation: "refuse_and_escalate",
  },
  {
    id: "high_risk",
    label: "High-risk or insufficient evidence",
    purpose:
      "Refuse, state what is missing, and route to a human — the only correct behaviour when the objects do not cover the question.",
    allowed: ["select"],
    refused: [
      "sequence",
      "paraphrase",
      "explain",
      "classify",
      "escalate",
      "compose_free",
      "author_criterion",
      "author_question",
      "advise",
    ],
    citationRequired: false,
    onViolation: "refuse_and_escalate",
  },
];

export function mode(id: string): ModePolicy | undefined {
  return MODES.find((m) => m.id === id);
}

/**
 * Acts refused in every mode, without exception and without a waiver path.
 *
 * These are not the strictest entries in the matrix — they are the ones whose
 * presence anywhere would end the regulatory claim, so they are kept out of the
 * per-mode table entirely. A permission that can be granted somewhere will
 * eventually be granted somewhere.
 *
 * `compose_free` sits here rather than being refused mode by mode, and the
 * difference is not cosmetic: expressed per-mode it renders as six absences a
 * reader has to notice, and one of them could be relaxed in a release nobody
 * flagged. Expressed here it is a single fact with no per-mode override.
 */
export const NEVER: ActId[] = ["compose_free", "author_criterion", "author_question", "advise"];

export function mayAct(modeId: string, act: ActId): boolean {
  if (NEVER.includes(act)) return false;
  const m = mode(modeId);
  if (!m) return false;
  if (m.refused.includes(act)) return false;
  return m.allowed.includes(act);
}

/* ═══════════════════════════════════════════════════════════════════════
   THE TURN CONTRACT
   ═════════════════════════════════════════════════════════════════════ */

/**
 * What the orchestrator hands the model for one turn.
 *
 * Note what is absent: no free-text corpus, no retrieved chunks, no "here are
 * some documents, be helpful". The model receives a closed candidate set and a
 * mode. That is what makes the output checkable — a return that cites an object
 * outside `candidates` is rejected without anyone needing to read it.
 */
export interface TurnRequest {
  modeId: string;
  lang: string;
  /** The only objects this turn may draw on. Closed set, by construction. */
  candidates: KnowledgeObject[];
  /** The bundle the candidates came from, carried into every determination. */
  bundleId: string;
  /** What the learner just said, verbatim. Never edited before it is scored. */
  learnerSpan: string;
  turnIndex: number;
  /** Scenario node, when in role-play. */
  scenarioNodeId?: string;
  /** Pressure rung the persona currently sits on, when in role-play. */
  ladderRung?: number;
}

/**
 * What the model is allowed to return.
 *
 * A structured object, never a paragraph. The model chooses *which* approved
 * thing happens and supplies delivery; it does not get to hand back prose that
 * something downstream then has to trust.
 */
export interface TurnResponse {
  /** Objects the model selected, by id. Must be a subset of the candidates. */
  selected: string[];
  /** The sentence to speak. Bound, per the mode's citation rule. */
  utterance: string;
  /** Which selected object each clause of the utterance rests on. */
  citations: string[];
  /** Assessment mode only: the outcome and the span it rests on. */
  determination?: {
    elementId: string;
    outcome: "demonstrated" | "failed" | "not_tested";
    span: string;
  };
  /** Role-play only: the rung the persona is moving to. */
  nextRung?: number;
  /** Set when the model is declining. */
  refusal?: string;
}

export interface ContractFinding {
  rule: string;
  detail: string;
  blocking: boolean;
}

/**
 * Validate a model return against the turn it was issued for.
 *
 * This runs on every turn, before a syllable reaches the learner. It is the
 * difference between a governed system and a well-prompted one: prompting asks
 * the model to stay inside the contract, and this checks whether it did.
 */
export function validateTurn(
  req: TurnRequest,
  res: TurnResponse,
  ceiling?: number
): ContractFinding[] {
  const out: ContractFinding[] = [];
  const m = mode(req.modeId);

  if (!m) {
    return [
      {
        rule: "mode",
        detail: `Unknown mode "${req.modeId}". A turn with no declared mode has no ceiling, so it cannot be issued.`,
        blocking: true,
      },
    ];
  }

  const ids = new Set(req.candidates.map((c) => c.id));

  /* 1. Closed candidate set. */
  const strays = res.selected.filter((s) => !ids.has(s));
  if (strays.length) {
    out.push({
      rule: "closed_set",
      detail: `Selected ${strays.join(", ")}, which ${strays.length === 1 ? "was" : "were"} not in the candidate set for this turn. The model reached outside what it was given — the single most important thing this check exists to catch.`,
      blocking: true,
    });
  }

  /* 2. Citation, where the mode requires it. */
  if (m.citationRequired && res.utterance.trim() && !res.refusal) {
    if (res.citations.length === 0) {
      out.push({
        rule: "citation",
        detail: `${m.label} requires every user-facing sentence to rest on an approved object. This turn cited none, so nothing downstream can say where the words came from.`,
        blocking: true,
      });
    } else {
      const uncited = res.citations.filter((c) => !ids.has(c));
      if (uncited.length) {
        out.push({
          rule: "citation",
          detail: `Cited ${uncited.join(", ")}, which ${uncited.length === 1 ? "is" : "are"} not in the candidate set.`,
          blocking: true,
        });
      }
    }
  }

  /* 3. Determinations belong to assessment, and carry a span. */
  if (res.determination) {
    if (!mayAct(req.modeId, "classify")) {
      out.push({
        rule: "classify",
        detail: `A determination was returned in ${m.label}, where classifying is refused. Scoring outside assessment is how a coaching aside silently becomes a finding on somebody's record.`,
        blocking: true,
      });
    }
    if (!res.determination.span || !res.determination.span.trim()) {
      out.push({
        rule: "span",
        detail: "Determination carries no verbatim span. There is nothing to bind the finding to.",
        blocking: true,
      });
    } else if (!req.learnerSpan.includes(res.determination.span.trim())) {
      out.push({
        rule: "span_fidelity",
        detail:
          "The cited span is not a substring of what the learner actually said. Either it was paraphrased — which assessment refuses — or it was invented. Both end the finding.",
        blocking: true,
      });
    }
  }

  /* 4. Pressure ceiling, in role-play. */
  if (typeof res.nextRung === "number") {
    if (!mayAct(req.modeId, "escalate")) {
      out.push({
        rule: "escalate",
        detail: `Escalation returned in ${m.label}, which does not permit it.`,
        blocking: true,
      });
    }
    if (typeof ceiling === "number" && res.nextRung > ceiling) {
      out.push({
        rule: "ceiling",
        detail: `Requested rung ${res.nextRung} above the approved ceiling of ${ceiling}. The ceiling is a safety judgement about a specific cohort, and no turn may exceed it.`,
        blocking: true,
      });
    }
    if (typeof req.ladderRung === "number" && res.nextRung > req.ladderRung + 1) {
      out.push({
        /* Named apart from the ceiling deliberately: both are pressure
           failures and they need different fixes. A ceiling breach means the
           scenario was approved too high; a jump means the persona skipped a
           rung that was approved and is where the learner would have resisted. */
        rule: "ladder_step",
        detail: `Requested rung ${res.nextRung} from rung ${req.ladderRung}. A ladder is climbed one rung at a time; jumping is how a rehearsal becomes an ambush.`,
        blocking: true,
      });
    }
  }

  /* 5. High-risk mode must actually refuse. */
  if (req.modeId === "high_risk" && !res.refusal) {
    out.push({
      rule: "refusal",
      detail:
        "High-risk turns exist to refuse and route to a human. A turn that answers instead has decided the objects were sufficient, which is precisely the decision it was not given.",
      blocking: true,
    });
  }

  /* 6. Advisory: a silent turn that did nothing.
        An assessment turn that returns a determination and says nothing is
        correct — scoring is not speaking — so the advisory only fires when the
        turn neither spoke, nor scored, nor refused. */
  if (!res.utterance.trim() && !res.refusal && !res.determination) {
    out.push({
      rule: "utterance",
      detail: "The turn said nothing, scored nothing and refused nothing. It is silent for an unstated reason.",
      blocking: false,
    });
  }

  return out;
}

export function turnAdmissible(
  req: TurnRequest,
  res: TurnResponse,
  ceiling?: number
): boolean {
  return validateTurn(req, res, ceiling).every((f) => !f.blocking);
}

/** What the orchestrator does when a turn fails. Never "log it and continue". */
export function remedyFor(modeId: string): string {
  const m = mode(modeId);
  switch (m?.onViolation) {
    case "refuse_and_escalate":
      return "Refuse the turn, tell the learner the system cannot answer this from approved material, and route to a human.";
    case "fall_back_to_approved_wording":
      return "Discard the model's delivery and speak the approved object's own wording instead. Less fluent, still true.";
    case "drop_turn":
      return "Drop the persona's turn and hold the rung. A scenario that stalls is recoverable; one that improvises is not.";
    default:
      return "Refuse the turn.";
  }
}
