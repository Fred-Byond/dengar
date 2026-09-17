/**
 * AUREN — the spoken debrief (engine state S7·a).
 *
 * The loop used to end by replacing the digital human with a full-screen
 * document. That is backwards for a product whose whole claim is the human:
 * at the one moment the learner most needs a person, the person left.
 *
 * So the coach delivers the assessment herself — the verdict, what held, what
 * broke, what changes — and the written record follows on request, as the
 * audit trail rather than as the delivery.
 *
 * Paper III §9.2: "this sentence, not the number, is the product."
 *
 * NOTHING HERE IS GENERATED. Every line is a localized template filled from
 * record fields: the reasoning map, the bound signatures, the governed
 * verification action. The debrief can therefore say nothing the record cannot
 * substantiate, which is the property the whole loop rests on.
 *
 * This module is deliberately dependency-free — it takes resolved strings
 * rather than importing the i18n table — so `npm run locale` can compile it
 * and inject it into the self-contained prototype verbatim. One composition,
 * two builds, no drift.
 */

export interface DebriefElement {
  id: string;
  label: string;
  demonstrated: boolean;
  evidence: string;
}

export interface DebriefSignature {
  id: string;
  definition: string;
  quote: string;
}

export interface DebriefInput {
  /** Did the coached behaviour survive a surface-distant retest? */
  transferred: boolean;
  /** The elements this session actually put a question against. */
  assessed: DebriefElement[];
  /** Failure signatures bound to something the learner said. */
  signatures: DebriefSignature[];
  /** The governed verification action's teaching line, already localized. */
  teach: string;
  /** Elements with no question authored against them — not testable at all. */
  queued: number;
  /** Resolve a UI key in the session language. */
  ui: (key: string) => string;
}

export interface DebriefRow {
  mark: string;
  text: string;
  quote?: string;
}

export interface DebriefScript {
  /** Beat 1 — spoken alone, nothing on screen competing with it. */
  verdict: string;
  /** Beat 2 — what held. */
  right: string;
  /** Beat 3 — what broke. */
  wrong: string;
  /** Beat 4 — the one behaviour that changes, and what is queued. */
  improve: string;
  rightRows: DebriefRow[];
  wrongRows: DebriefRow[];
  improveRows: DebriefRow[];
}

/** Substitute {token} placeholders from record fields. */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return String(template).replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  );
}

export function composeDebrief(input: DebriefInput): DebriefScript {
  const u = input.ui;
  const held = input.assessed.filter((e) => e.demonstrated);
  const total = input.assessed.length;

  /* A transfer that survived IS something the learner did right, and on the
     demo path it is the ONLY thing — every diagnose element fails on the way
     in by design. Filing it under "where you improve" would tell a learner who
     actually passed that they got nothing right. */
  const won = input.transferred;

  const rightRows: DebriefRow[] = held.map((e) => ({
    mark: "✓",
    text: e.label,
    quote: e.evidence,
  }));
  if (won) rightRows.push({ mark: "✓", text: u("debriefTransferItem") });
  if (rightRows.length === 0) {
    rightRows.push({ mark: "–", text: u("debriefRightNoneShort") });
  }

  const queueLine = input.queued
    ? fillTemplate(u("debriefQueue"), { n: input.queued })
    : u("debriefQueueNone");

  return {
    verdict:
      u(won ? "verdictPassHead" : "verdictFailHead") +
      " " +
      u(won ? "verdictPassSub" : "verdictFailSub"),

    right: [
      held.length
        ? fillTemplate(u("debriefRightLead"), {
            n: held.length,
            total,
            list: held.map((e) => e.label).join(", "),
          })
        : u("debriefRightNone"),
      won ? u("debriefTransferPass") : "",
    ]
      .filter(Boolean)
      .join(" "),

    wrong: input.signatures.length
      ? fillTemplate(u("debriefWrongLead"), {
          defs: input.signatures.map((s) => s.definition).join(" "),
        })
      : u("debriefWrongNone"),

    improve: [
      u("debriefImproveLead"),
      input.teach,
      won ? "" : u("debriefTransferFail"),
      queueLine,
    ]
      .filter(Boolean)
      .join(" "),

    rightRows,

    wrongRows: input.signatures.length
      ? input.signatures.map((s) => ({
          mark: "✕",
          text: s.id + " · " + s.definition,
          quote: s.quote,
        }))
      : [{ mark: "–", text: u("debriefWrongNoneShort") }],

    improveRows: [
      { mark: "→", text: input.teach },
      { mark: "→", text: queueLine },
    ].filter((row) => !!row.text),
  };
}
