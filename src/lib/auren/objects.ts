/**
 * AUREN — the frozen knowledge-object inventory.
 *
 * Source of truth: "AUREN — The Intelligent Investor Interview & Coaching
 * Engine" (Paper III v1.1) and "AUREN — The Product Experience & Build
 * Specification" (Paper IV v1.0).
 *
 * Governing rule (Paper III, Rule 1 and Rule 2): every string that can reach a
 * learner and contribute to a determination is a versioned OBJECT, not prose
 * written inline at a call site. Ontology is populated as DATA — never as code.
 * Adding a scam typology must never require a component change.
 *
 * Mode eligibility (Rule 3) is declared per object and enforced by the session
 * machine, not by prompt discipline: a Challenge object can never fire outside
 * REHEARSE.
 */

export type Mode = "LEARN" | "REHEARSE" | "PROTECT";

/** Element status vocabulary — Paper III §9.1 element_coverage. */
export type ElementStatus =
  | "unknown"
  | "demonstrated"
  | "demonstrated-under-pressure"
  | "partial"
  | "failed"
  | "refused"
  | "not-testable";

export interface CompetencyElement {
  elementId: string;
  label: string;
  competencyId: string;
  /** Mandatory per Paper III §10.1 — no anchor, no deployment. */
  authorityAnchor: string;
  ailsDimension:
    | "Investor Reasoning"
    | "AI Literacy"
    | "Risk Awareness"
    | "Scam Resistance"
    | "Behavioural Stability";
}

export const ELEMENTS: Record<string, CompetencyElement> = {
  "E-VER-02": {
    elementId: "E-VER-02",
    label: "Independent verification",
    competencyId: "COMP-VERIFY-INDEPENDENT",
    authorityAnchor: "IOSCO investor-education principle IE-2.3",
    ailsDimension: "Scam Resistance",
  },
  "E-RET-01": {
    elementId: "E-RET-01",
    label: "Return plausibility",
    competencyId: "COMP-RISK-RETURN",
    authorityAnchor: "OECD/INFE competence 3.1",
    ailsDimension: "Risk Awareness",
  },
  "E-AI-01": {
    elementId: "E-AI-01",
    label: "AI-capability scepticism",
    competencyId: "COMP-AILIT-CLAIMS",
    authorityAnchor: "IOSCO PS1 guidance 2.2",
    ailsDimension: "AI Literacy",
  },
  "E-RISK-01": {
    elementId: "E-RISK-01",
    label: "Understands downside",
    competencyId: "COMP-RISK-DOWNSIDE",
    authorityAnchor: "OECD/INFE competence 2.4",
    ailsDimension: "Investor Reasoning",
  },
  "E-URG-01": {
    elementId: "E-URG-01",
    label: "Resists urgency",
    competencyId: "COMP-STABILITY-URGENCY",
    authorityAnchor: "IOSCO investor-education principle IE-4.1",
    ailsDimension: "Behavioural Stability",
  },
  "E-AUTH-01": {
    elementId: "E-AUTH-01",
    label: "Questions authority claims",
    competencyId: "COMP-STABILITY-AUTHORITY",
    authorityAnchor: "IOSCO investor-education principle IE-4.2",
    ailsDimension: "Behavioural Stability",
  },
  "E-SOC-01": {
    elementId: "E-SOC-01",
    label: "Discounts social proof",
    competencyId: "COMP-STABILITY-SOCIAL",
    authorityAnchor: "OECD/INFE competence 4.2",
    ailsDimension: "Behavioural Stability",
  },
  "E-PAY-01": {
    elementId: "E-PAY-01",
    label: "Payment-destination scrutiny",
    competencyId: "COMP-VERIFY-PAYMENT",
    authorityAnchor: "IOSCO investor-education principle IE-3.4",
    ailsDimension: "Scam Resistance",
  },
};

/**
 * Reasoning Failure Signature objects — Paper III §6.4.
 *
 * Strategic note carried from the paper: scam typologies churn, cognitive
 * vulnerabilities do not. This library outlives any scam database, which is
 * why it is modelled as a first-class object rather than a record field.
 */
export interface FailureSignature {
  failId: string;
  definition: string;
  /** The competency element this signature defeats. */
  negatedElement: string;
  /** Evidence-quoting coaching line. Never generic education. */
  coaching: string;
}

export const FAILURE_SIGNATURES: Record<string, FailureSignature> = {
  "FAIL-VERIFY-SELFASSERTED": {
    failId: "FAIL-VERIFY-SELFASSERTED",
    definition: "Trusts promoter-supplied evidence as independent evidence.",
    negatedElement: "E-VER-02",
    coaching:
      "You treated something the promoter gave you as if it were independent evidence. Their website telling you they are regulated is them telling you they are regulated. That is a claim, not a check.",
  },
  "FAIL-URGENCY-COMPLIANCE": {
    failId: "FAIL-URGENCY-COMPLIANCE",
    definition:
      "Changes verification behaviour under artificial scarcity or time pressure.",
    negatedElement: "E-URG-01",
    coaching:
      "When I put a deadline on it, your verification stopped. You did not ask fewer questions because you were satisfied. You asked fewer questions because the clock started.",
  },
  "FAIL-AUTHORITY-DEFERENCE": {
    failId: "FAIL-AUTHORITY-DEFERENCE",
    definition:
      "Reduces scrutiny when authority, celebrity, or institutional status is invoked.",
    negatedElement: "E-AUTH-01",
    coaching:
      "The moment a recognisable name was attached, your questions got smaller. Status is not evidence — it is the cheapest thing in the world to borrow.",
  },
  "FAIL-SOCIAL-PROOF": {
    failId: "FAIL-SOCIAL-PROOF",
    definition:
      "Uses other people's apparent success as evidence of legitimacy.",
    negatedElement: "E-SOC-01",
    coaching:
      "You let other people's apparent success stand in for evidence. Screenshots supplied by the person selling to you are not other people — they are more of the same claim.",
  },
  "FAIL-SUNK-COST": {
    failId: "FAIL-SUNK-COST",
    definition: "Continues because money or time has already been committed.",
    negatedElement: "E-RISK-01",
    coaching:
      "What you had already put in became a reason to put in more. That is the direction this always runs, and it is the one to watch in yourself.",
  },
  "FAIL-GREED-OVERRIDE": {
    failId: "FAIL-GREED-OVERRIDE",
    definition:
      "Recognises implausibility but proceeds because upside overwhelms caution.",
    negatedElement: "E-RET-01",
    coaching:
      "You could see the number did not make sense, and you moved toward it anyway. Knowing that about yourself is worth more than the rule.",
  },
  "FAIL-CONFIRMATION-SEEKING": {
    failId: "FAIL-CONFIRMATION-SEEKING",
    definition:
      "Looks only for information supporting the desired decision.",
    negatedElement: "E-VER-02",
    coaching:
      "Every check you ran was one that could only agree with you. A check that cannot fail is not a check.",
  },
  "FAIL-AI-AUTHORITY": {
    failId: "FAIL-AI-AUTHORITY",
    definition:
      "Treats “AI-powered” as evidence of predictive capability or legitimacy.",
    negatedElement: "E-AI-01",
    coaching:
      "You read “AI” as a reason to expect returns. It describes how something is built, not whether it works.",
  },
};

/**
 * Question objects — Paper III §6.3.
 *
 * `satisfactionCues` is the prototype's stand-in for the governed satisfaction
 * rule. In production this is the structured-extraction pass behind the same
 * seam; the object shape does not change when it is swapped.
 */
export interface QuestionObject {
  questionId: string;
  targetElement: string;
  modeEligibility: Mode[];
  ask: string;
  /** Spoken when voice capture is unavailable — never a typed prompt. */
  rehearsedAnswer: string;
  failSignature: string | null;
  satisfactionCues: { pass: string[]; fail: string[] };
}

export const QUESTIONS: QuestionObject[] = [
  {
    questionId: "Q-VER-002",
    targetElement: "E-VER-02",
    modeEligibility: ["REHEARSE", "LEARN"],
    ask: "You mentioned the company. How did you verify that they are actually authorised to offer this investment?",
    rehearsedAnswer:
      "Their website says they're regulated, and it looks professional.",
    failSignature: "FAIL-VERIFY-SELFASSERTED",
    satisfactionCues: {
      pass: [
        "register",
        "regulator",
        "authority",
        "commission",
        "look it up",
        "official",
        "independent",
        "checked myself",
      ],
      fail: [
        "website",
        "site",
        "they said",
        "they told",
        "looks",
        "professional",
        "brochure",
        "licence",
        "license",
        "certificate",
      ],
    },
  },
  {
    questionId: "Q-RET-001",
    targetElement: "E-RET-01",
    modeEligibility: ["REHEARSE", "LEARN"],
    ask: "Fifteen percent a month. What do you think is actually producing a return like that?",
    rehearsedAnswer:
      "I assume the algorithm is just better than what most people have access to.",
    failSignature: "FAIL-GREED-OVERRIDE",
    satisfactionCues: {
      pass: [
        "too good",
        "unrealistic",
        "not possible",
        "impossible",
        "suspicious",
        "doesn't add",
        "does not add",
        "unsustainable",
        "red flag",
      ],
      fail: [
        "algorithm",
        "better",
        "access",
        "edge",
        "smarter",
        "technology",
        "assume",
        "probably",
        "not sure",
      ],
    },
  },
  {
    questionId: "Q-AI-001",
    targetElement: "E-AI-01",
    modeEligibility: ["REHEARSE", "LEARN"],
    ask: "They describe it as an AI trading system. What does “AI” tell you about whether it can predict the market?",
    rehearsedAnswer:
      "AI can process a lot more data than a person, so it should be more accurate.",
    failSignature: "FAIL-AI-AUTHORITY",
    satisfactionCues: {
      pass: [
        "nothing",
        "doesn't mean",
        "does not mean",
        "no evidence",
        "marketing",
        "buzzword",
        "can't predict",
        "cannot predict",
        "says nothing",
      ],
      fail: [
        "more data",
        "accurate",
        "smarter",
        "better than",
        "process",
        "predict",
        "should be",
        "advanced",
        "powerful",
      ],
    },
  },
  {
    questionId: "Q-RISK-001",
    targetElement: "E-RISK-01",
    modeEligibility: ["REHEARSE", "LEARN", "PROTECT"],
    ask: "Last one before we move on. What would have to happen for you to lose the whole ten thousand?",
    rehearsedAnswer:
      "I suppose if the market crashed badly. But they mentioned there's capital protection.",
    failSignature: null,
    satisfactionCues: {
      pass: [
        "all of it",
        "everything",
        "never see",
        "fake",
        "not real",
        "doesn't exist",
        "does not exist",
        "disappear",
        "no recourse",
        "fraud",
      ],
      fail: [
        "crash",
        "market",
        "protection",
        "protected",
        "guaranteed",
        "insured",
        "unlikely",
      ],
    },
  },
];

/**
 * Challenge objects — Paper III §6.3, REHEARSE-only.
 *
 * `surfaceProfile` drives the cross-typology retest selector of §4.3: the
 * retest must share the target element and differ on EVERY surface dimension.
 * The rule is enforced by `selectRetest` in ./session — not by scenario
 * authors remembering it under deadline pressure.
 */
export interface LadderStep {
  say: string;
  prop: { head: string; body: string } | null;
  /** Signature recorded if the learner does not resist at this step. */
  failSignature?: string;
}

export interface ChallengeObject {
  challengeId: string;
  scamId: string;
  modeEligibility: ["REHEARSE"];
  persona: { name: string; role: string };
  /** Typology · channel · persona · product class — all four must differ. */
  surfaceProfile: {
    typology: string;
    channel: string;
    persona: string;
    productClass: string;
  };
  targetElements: string[];
  /** Approved intensity steps with a hard ceiling. Never improvised. */
  escalationLadder: LadderStep[];
  /** Spoken learner replies used when voice capture is unavailable. */
  rehearsedReplies: string[];
}

export const CHALLENGES: ChallengeObject[] = [
  {
    challengeId: "CH-URGENCY-001",
    scamId: "SCAM-FAKE-BROKER",
    modeEligibility: ["REHEARSE"],
    persona: { name: "Marcus Vale", role: "Senior Allocations · Meridian Partners" },
    surfaceProfile: {
      typology: "Unauthorised broker",
      channel: "Voice call",
      persona: "Institutional male",
      productClass: "Managed account",
    },
    targetElements: ["E-URG-01", "E-VER-02"],
    escalationLadder: [
      {
        say: "Good — I have you down for the ten. We're opening a small allocation to selected investors this week, and yours is provisionally held.",
        prop: null,
      },
      {
        say: "I'll be straight with you. The allocation closes tonight at nine. I need a decision before then, or it releases to the next name on the list.",
        prop: {
          head: "Allocation notice",
          body: "MERIDIAN PARTNERS — Provisional allocation #A-4471 · Hold expires 21:00 today · Status: AWAITING CONFIRMATION",
        },
        failSignature: "FAIL-URGENCY-COMPLIANCE",
      },
      {
        say: "If it helps, I can send you screenshots from existing clients — people who came in at the same level you're coming in at. Most of them wish they'd gone bigger.",
        prop: {
          head: "Client returns — shared by promoter",
          body: "“Month 3 up 46%. Withdrew twice, no issues.” — J.M.  ·  “Started at 10k, now sitting on 21k.” — R.T.",
        },
        failSignature: "FAIL-SOCIAL-PROOF",
      },
    ],
    rehearsedReplies: [
      "Right. And the money would go where exactly?",
      "How long have you been running this allocation?",
      "Okay — if it closes tonight then let's do it. Send me the details.",
    ],
  },
  {
    challengeId: "CH-DEEPFAKE-004",
    scamId: "SCAM-DEEPFAKE-ENDORSEMENT",
    modeEligibility: ["REHEARSE"],
    persona: { name: "Aria Lens", role: "Investor Relations · Halcyon Yield" },
    surfaceProfile: {
      typology: "Celebrity / synthetic endorsement",
      channel: "Video call",
      persona: "Retail female",
      productClass: "Token fund",
    },
    targetElements: ["E-VER-02", "E-AUTH-01"],
    escalationLadder: [
      {
        say: "You'll have seen the announcement video with the founder. He's backing this personally, which is why we've had the response we've had.",
        prop: {
          head: "Endorsement clip",
          body: "[ 0:42 video ] Well-known founder: “I've put my own capital into Halcyon. This is the one I'd tell my family about.”",
        },
        failSignature: "FAIL-AUTHORITY-DEFERENCE",
      },
      {
        say: "I can put you in at the same terms he came in at. Shall I hold you a place while you think about it?",
        prop: null,
      },
    ],
    rehearsedReplies: [
      "How would I confirm that video is really him?",
      "Before I go any further I want to verify the company myself, and confirm that endorsement independently. I'm not deciding on this call.",
    ],
  },
];

/** Verification Action objects — Paper III Layer 5. */
export interface VerificationAction {
  actionId: string;
  teach: string;
  steps: string[];
}

export const VERIFICATION_ACTIONS: Record<string, VerificationAction> = {
  "VA-REGCHECK-001": {
    actionId: "VA-REGCHECK-001",
    teach:
      "The behaviour that defeats this is the register check. You go to the regulator's own public register — typed in yourself, not a link they sent — and you search the entity name. If it is not there, nothing else they show you matters.",
    steps: [
      "Search the entity on the regulator's own public register — type the address yourself, never a link they sent.",
      "Call the institution on the number published on its official site, not the number you were given.",
      "Confirm where the money actually lands. A personal or third-party account is not a firm account.",
    ],
  },
};

/** PROTECT marker set — assessed, never adjudicated (Paper III §8). */
export const PROTECT_MARKERS: string[] = [
  "Contact was unsolicited",
  "Return described as fixed or guaranteed",
  "Regulated status asserted by the promoter",
  "Payment routed outside the named institution",
  "Decision deadline set by the other party",
];

/**
 * DIAGNOSE element budget — the ordering study's D8.
 *
 * Eight mandatory elements at one voice turn each pushes the loop past the
 * ten minutes the product thesis promises. Four are resolved per session by
 * value; the remainder route to the retraining queue, which is what brings the
 * learner back. Raising this number without re-measuring the loop is the
 * regression to watch for.
 */
export const ELEMENT_BUDGET = 4;
