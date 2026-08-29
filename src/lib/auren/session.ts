/**
 * AUREN — session model and state machine.
 *
 * One session object drives every screen (Paper IV §VII). The prototype holds
 * it in memory; production persists it as the sealed Investor Readiness Record
 * (Paper III §9.1) without changing its shape.
 *
 * Engine states are Paper III §VII. The SCREEN order deliberately diverges
 * from a one-to-one rendering of them — see ORDERING below.
 */

import { t, ui, type Lang } from "./i18n";
import {
  CHALLENGES,
  ELEMENTS,
  ELEMENT_BUDGET,
  FAILURE_SIGNATURES,
  QUESTIONS,
  type ChallengeObject,
  type ElementStatus,
  type Mode,
  type QuestionObject,
} from "./objects";

/** Paper III §VII. */
export type EngineState =
  | "S0" // WELCOME_MODE — greeting, consent, simulation framing
  | "S1" // OPEN_NARRATIVE — uninterrupted account, silent extraction
  | "S3" // ELEMENT_LOOP — highest-value unresolved element, one question
  | "S5" // CHALLENGE — adversarial envelope open
  | "S6" // COACH_RETEST — signatures explained with verbatim evidence
  | "S5R" // S5′ retest under the surface-distance rule
  | "S7" // SCORE_HANDOFF — record emitted and sealed
  | "P0" // PROTECT_INTAKE — neutral doctrine
  | "P1"; // STOP_VERIFY_DECIDE

/**
 * Screen stages.
 *
 * ORDERING. Paper IV renders S0–S7 one-to-one as Stage 0–7. That is honest to
 * the architecture and wrong for a first-time user, because it puts a choice
 * (the mode selector) before the comprehension needed to make it. Here the
 * consent act carries the doctrine switch on entry, and `modes` is reached
 * AFTER the first evidence chain — where LEARN and PROTECT finally mean
 * something. The object-level mode gate is unchanged; only the screen order is.
 */
export type Stage =
  | "landing"
  | "auth"
  | "entry"
  | "understand"
  | "diagnose"
  | "stress"
  | "coach"
  | "retest"
  | "evidence"
  | "modes"
  | "verify"
  | "certified"
  | "protect";

export interface ElementRecord {
  status: ElementStatus;
  /** Mandatory verbatim binding — nothing on the scorecard is generated prose. */
  evidence: string;
  /** The question or challenge object that elicited it. */
  sourceObjectId: string;
  /** Status in the cross-typology retest, when the element was coached. */
  retestStatus?: ElementStatus;
}

export interface BoundSignature {
  failId: string;
  /** The learner's own sentence, bound verbatim. */
  quote: string;
  turnIndex: number;
}

export interface TranscriptTurn {
  speaker: "coach" | "persona" | "learner";
  text: string;
  objectId?: string;
  phase: Stage;
}

export interface AurenSession {
  learnerName: string;
  /** First-class dimension of every scored determination (Paper III §10.2). */
  lang: Lang;
  mode: Mode | null;
  engineState: EngineState;
  stage: Stage;
  startedAt: number | null;

  /** Reasoning Map — the only map AILS may read from (Paper III §3.5). */
  reasoningMap: Record<string, ElementRecord>;
  /**
   * Situation Map — routes scenarios and PROTECT markers. NEVER rendered to
   * the learner in REHEARSE, and never read by AILS. The separation is
   * enforced here so the UI cannot accidentally couple them.
   */
  situationMarkers: string[];

  signatures: BoundSignature[];
  transcript: TranscriptTurn[];

  /** Which challenge is live, and how far up its approved ladder we are. */
  activeChallengeId: string | null;
  ladderIndex: number;

  /** Cross-typology retest outcome — within-session transfer only. */
  transferred: boolean | null;

  /**
   * Signatures the Coach actually explained. Only these may show a coach
   * result on the scorecard — an element whose signature was recorded but
   * never taught has not been coached, and crediting it overstates the record.
   */
  coachedSignatures: string[];

  questionIndex: number;

  /**
   * Account and identity are deliberately separate concerns.
   *
   * Signing in stores the reasoning map and the retraining queue, and is
   * never a wall in front of the first session (Paper IV Stage 0: no account
   * wall). Identity verification is a different act entirely, and it happens
   * AFTER the evidence chain as the certification upsell Paper IV specifies —
   * the learner is holding something they want to be able to prove, rather
   * than being asked for a document by a product they have not used.
   */
  account: {
    signedIn: boolean;
    phone: string | null;
    identityVerified: boolean;
    certificateId: string | null;
  };
}

export function createSession(
  learnerName: string,
  lang: Lang = "EN"
): AurenSession {
  return {
    learnerName,
    lang,
    mode: null,
    engineState: "S0",
    stage: "landing",
    startedAt: null,
    reasoningMap: {},
    situationMarkers: [],
    signatures: [],
    transcript: [],
    activeChallengeId: null,
    ladderIndex: 0,
    transferred: null,
    coachedSignatures: [],
    questionIndex: 0,
    account: {
      signedIn: false,
      phone: null,
      identityVerified: false,
      certificateId: null,
    },
  };
}

/** The four eKYC steps, in order. Certification never alters the result. */
export const VERIFICATION_STEPS: Array<{ title: string; detail: string }> = [
  {
    title: "Confirm your details",
    detail: "Name and date of birth, as they appear on your document.",
  },
  {
    title: "Scan your document",
    detail:
      "Passport or national ID. Captured once, checked, and not retained by AUREN.",
  },
  {
    title: "Liveness check",
    detail: "A short camera check that the person holding the document is you.",
  },
  {
    title: "Issue certificate",
    detail:
      "Your Investor Readiness Record is sealed against a verified identity.",
  },
];

export function issueCertificateId(): string {
  return `AUREN-CERT-${Math.floor(100000 + Math.random() * 899999)}`;
}

/** The elements this session will resolve, capped by the budget (D8). */
export function budgetedQuestions(): QuestionObject[] {
  return QUESTIONS.slice(0, ELEMENT_BUDGET);
}

/**
 * Satisfaction rule evaluation.
 *
 * Prototype implementation of the governed rule. Deliberately conservative:
 * an answer that evidences neither resolution nor failure is NOT a pass —
 * unresolved reasoning stays failed rather than being scored as competence
 * (Paper III §9.3, "elements demonstrated under pressure weight higher";
 * Unknown-by-omission is a measurement defect, not a result).
 *
 * Production swaps this for the structured-extraction pass behind the same
 * signature. Nothing downstream changes.
 */
export function evaluateAnswer(
  question: QuestionObject,
  answer: string,
  lang: Lang
): ElementStatus {
  const a = answer.toLowerCase();
  const cues = question.satisfactionCues[lang] ?? question.satisfactionCues.EN;
  const passed = cues.pass.some((c) => a.includes(c.toLowerCase()));
  const failed = cues.fail.some((c) => a.includes(c.toLowerCase()));
  if (passed && !failed) return "demonstrated";
  return "failed";
}

/** Did the learner resist at this rung of the escalation ladder? */
const RESISTANCE: Record<Lang, RegExp> = {
  EN: /verify|check|register|regulator|independent|confirm|myself|not deciding|think about|hold off|wait|no thanks/i,
  ES: /verific|comprob|registro|regulador|independiente|confirmar|por mi cuenta|no voy a decidir|pensarlo|esperar|no, gracias/i,
  ZH: /核实|核查|查一下|自己查|监管|独立|确认|不决定|再想想|等一下|先等|不用了/,
  AR: /تحقق|أتحقق|السجل|الجهة|الهيئة|مستقل|أتأكد|بنفسي|لن أقرر|أفكر|انتظر|لا شكرًا/,
};

export function resistedPressure(answer: string, lang: Lang): boolean {
  return (RESISTANCE[lang] ?? RESISTANCE.EN).test(answer);
}

/**
 * Cross-typology retest selector — Paper III §4.3, enforced not remembered.
 *
 * Chooses a challenge that shares the target element with the failed scenario
 * while differing on EVERY surface dimension. Any challenge sharing a surface
 * feature with the failure context is programmatically excluded, which is what
 * makes a passed retest evidence of transfer rather than memorisation.
 */
export function selectRetest(
  failedChallenge: ChallengeObject,
  targetElement: string
): ChallengeObject | null {
  const a = failedChallenge.surfaceProfile;
  return (
    CHALLENGES.find((c) => {
      if (c.challengeId === failedChallenge.challengeId) return false;
      if (!c.targetElements.includes(targetElement)) return false;
      const b = c.surfaceProfile;
      return (
        b.typology !== a.typology &&
        b.channel !== a.channel &&
        b.persona !== a.persona &&
        b.productClass !== a.productClass
      );
    }) ?? null
  );
}

/** Mode gate (Layer 6) — enforced in code, not by convention. */
export function challengeMayFire(
  challenge: ChallengeObject,
  mode: Mode | null
): boolean {
  return mode === "REHEARSE" && challenge.modeEligibility.includes("REHEARSE");
}

export function bindSignature(
  session: AurenSession,
  failId: string | undefined,
  quote: string
): void {
  if (!failId) return;
  if (!FAILURE_SIGNATURES[failId]) return;
  if (session.signatures.some((s) => s.failId === failId)) return;
  session.signatures.push({
    failId,
    quote,
    turnIndex: session.transcript.length,
  });
}

/**
 * AILS aggregation — Paper III §9.3.
 *
 * "The scoring rule must be simple enough to publish... Complexity here buys
 * nothing and costs auditability — resist it." So: fixed weights, elements
 * demonstrated under pressure weigh more than calm demonstrations, and the
 * rule version travels on the record.
 */
export const AILS_RULE_VERSION = "aggregation-rule-v1";

export interface AilsResult {
  before: number;
  after: number;
  explainability: string;
}

export function computeAils(session: AurenSession): AilsResult {
  const qs = budgetedQuestions();
  const resolved = qs.filter(
    (q) => session.reasoningMap[q.targetElement]?.status === "demonstrated"
  ).length;
  const sigCount = session.signatures.length;
  const transferred = session.transferred === true;
  const lang = session.lang;

  const before = Math.round(45 + (resolved / Math.max(qs.length, 1)) * 30);
  const after = before + (transferred ? 13 : 3);

  const head = AILS_HEAD[lang](before, resolved, qs.length, sigCount);
  const tail = transferred ? AILS_TAIL_PASS[lang] : AILS_TAIL_FAIL[lang];

  return { before, after, explainability: `${head} ${tail}` };
}

type HeadFn = (
  score: number,
  resolved: number,
  total: number,
  signatures: number
) => string;

const AILS_HEAD: Record<Lang, HeadFn> = {
  EN: (s, r, t2, n) =>
    `${s} — you resolved ${r} of ${t2} reasoning elements on the way in, and ${n} failure signature${n === 1 ? "" : "s"} ${n === 1 ? "was" : "were"} recorded under pressure, each bound to a sentence you actually said.`,
  ES: (s, r, t2, n) =>
    `${s} — resolviste ${r} de ${t2} elementos de razonamiento a la entrada, y se registraron ${n} firma${n === 1 ? "" : "s"} de fallo bajo presión, cada una vinculada a una frase que dijiste realmente.`,
  ZH: (s, r, t2, n) =>
    `${s} — 进入时你解决了 ${t2} 个推理要素中的 ${r} 个，并在压力下记录到 ${n} 项失效特征，每一项都绑定到你实际说过的一句话。`,
  AR: (s, r, t2, n) =>
    `${s} — حسمت ${r} من أصل ${t2} من عناصر التفكير عند الدخول، وسُجّلت ${n} من أنماط الإخفاق تحت الضغط، كل واحدة منها موثّقة بجملة قلتها فعلًا.`,
};

const AILS_TAIL_PASS: Record<Lang, string> = {
  EN: "After coaching, independent verification was demonstrated in a scenario sharing no typology, channel, persona or product class with the one you failed — which is why the score moves.",
  ES: "Tras la orientación, demostraste verificación independiente en un escenario que no comparte tipología, canal, personaje ni clase de producto con aquel en el que fallaste. Por eso se mueve la puntuación.",
  ZH: "接受指导后，你在一个与失败情境在类型、渠道、人物和产品类别上均不相同的场景中，展现了独立核实。分数正因如此而变动。",
  AR: "بعد التوجيه، أثبتّ التحقق المستقل في سيناريو لا يشترك مع السيناريو الذي أخفقت فيه في النمط ولا القناة ولا الشخصية ولا فئة المنتج — ولهذا تتغيّر الدرجة.",
};

const AILS_TAIL_FAIL: Record<Lang, string> = {
  EN: "After coaching, independent verification was still not demonstrated in the novel scenario, so the coached element stays open and moves to your retraining queue. The score barely moves, and it should not.",
  ES: "Tras la orientación, la verificación independiente siguió sin demostrarse en el escenario nuevo, así que el elemento trabajado queda abierto y pasa a tu cola de repaso. La puntuación apenas se mueve, y no debería.",
  ZH: "接受指导后，你在新情境中仍未展现独立核实，因此该要素保持未决状态并进入你的复训队列。分数几乎不动——本就不该动。",
  AR: "بعد التوجيه، لم يظهر التحقق المستقل في السيناريو الجديد، لذا يبقى العنصر المعالَج مفتوحًا وينتقل إلى قائمة إعادة التدريب. الدرجة تكاد لا تتحرك، وهذا هو الصواب.",
};

/**
 * The learner-facing verdict — the ordering study's D5.
 *
 * Paper III §9.2 argues the explainability sentence IS the product for a
 * regulator audience. The same holds for the learner, so it renders ABOVE the
 * matrix rather than beneath it. Non-transfer is stated plainly rather than
 * coached away (D6): an inflated within-session rate would undo the restraint
 * the measurement architecture is built on.
 */
export function verdictFor(session: AurenSession): {
  headline: string;
  sub: string;
} {
  const lang = session.lang;
  if (session.transferred) {
    return {
      headline: ui("verdictPassHead", lang),
      sub: ui("verdictPassSub", lang),
    };
  }
  return {
    headline: ui("verdictFailHead", lang),
    sub: ui("verdictFailSub", lang),
  };
}

/** Element label in the learner's language. */
export function elementLabel(elementId: string, lang: Lang): string {
  return t(ELEMENTS[elementId].label, lang);
}

/** Elements due for re-test — populates the retraining queue (Paper III §9.1). */
export function retrainingQueue(session: AurenSession): string[] {
  const budgeted = new Set(budgetedQuestions().map((q) => q.targetElement));
  const unresolved = Object.keys(ELEMENTS).filter((id) => !budgeted.has(id));
  const failed = Object.entries(session.reasoningMap)
    .filter(([, r]) => r.status === "failed" && r.retestStatus !== "demonstrated")
    .map(([id]) => id);
  return [...failed, ...unresolved];
}
