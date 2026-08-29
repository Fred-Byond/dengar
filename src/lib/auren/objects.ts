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
 *
 * LANGUAGE (Paper III §6.3, §10.2): a Question object carries "language
 * variants with fidelity status", and the learner's language is a first-class
 * dimension of every scored determination. So the localized fields below are
 * not translations of a UI — they are variants of the governed object, and that
 * includes `satisfactionCues`. A Spanish answer must be evaluated against
 * Spanish cues, or the element silently fails for every non-English learner.
 */

import type { Lang, Localized } from "./i18n";

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
  label: Localized;
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
    label: {
      EN: "Independent verification",
      ES: "Verificación independiente",
      ZH: "独立核实",
      AR: "التحقق المستقل",
    },
    competencyId: "COMP-VERIFY-INDEPENDENT",
    authorityAnchor: "IOSCO investor-education principle IE-2.3",
    ailsDimension: "Scam Resistance",
  },
  "E-RET-01": {
    elementId: "E-RET-01",
    label: {
      EN: "Return plausibility",
      ES: "Plausibilidad del rendimiento",
      ZH: "回报合理性",
      AR: "معقولية العائد",
    },
    competencyId: "COMP-RISK-RETURN",
    authorityAnchor: "OECD/INFE competence 3.1",
    ailsDimension: "Risk Awareness",
  },
  "E-AI-01": {
    elementId: "E-AI-01",
    label: {
      EN: "AI-capability scepticism",
      ES: "Escepticismo ante las capacidades de la IA",
      ZH: "对 AI 能力的怀疑",
      AR: "التشكيك في قدرات الذكاء الاصطناعي",
    },
    competencyId: "COMP-AILIT-CLAIMS",
    authorityAnchor: "IOSCO PS1 guidance 2.2",
    ailsDimension: "AI Literacy",
  },
  "E-RISK-01": {
    elementId: "E-RISK-01",
    label: {
      EN: "Understands downside",
      ES: "Comprende el riesgo de pérdida",
      ZH: "理解下行风险",
      AR: "إدراك مخاطر الخسارة",
    },
    competencyId: "COMP-RISK-DOWNSIDE",
    authorityAnchor: "OECD/INFE competence 2.4",
    ailsDimension: "Investor Reasoning",
  },
  "E-URG-01": {
    elementId: "E-URG-01",
    label: {
      EN: "Resists urgency",
      ES: "Resiste la urgencia",
      ZH: "抵抗紧迫感",
      AR: "مقاومة الاستعجال",
    },
    competencyId: "COMP-STABILITY-URGENCY",
    authorityAnchor: "IOSCO investor-education principle IE-4.1",
    ailsDimension: "Behavioural Stability",
  },
  "E-AUTH-01": {
    elementId: "E-AUTH-01",
    label: {
      EN: "Questions authority claims",
      ES: "Cuestiona los argumentos de autoridad",
      ZH: "质疑权威背书",
      AR: "التشكيك في ادعاءات السلطة",
    },
    competencyId: "COMP-STABILITY-AUTHORITY",
    authorityAnchor: "IOSCO investor-education principle IE-4.2",
    ailsDimension: "Behavioural Stability",
  },
  "E-SOC-01": {
    elementId: "E-SOC-01",
    label: {
      EN: "Discounts social proof",
      ES: "Relativiza la prueba social",
      ZH: "不轻信从众证据",
      AR: "عدم الانسياق وراء دليل الجماعة",
    },
    competencyId: "COMP-STABILITY-SOCIAL",
    authorityAnchor: "OECD/INFE competence 4.2",
    ailsDimension: "Behavioural Stability",
  },
  "E-PAY-01": {
    elementId: "E-PAY-01",
    label: {
      EN: "Payment-destination scrutiny",
      ES: "Escrutinio del destino del pago",
      ZH: "审查资金去向",
      AR: "تدقيق وجهة الدفع",
    },
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
  definition: Localized;
  /** The competency element this signature defeats. */
  negatedElement: string;
  /** Evidence-quoting coaching line. Never generic education. */
  coaching: Localized;
}

export const FAILURE_SIGNATURES: Record<string, FailureSignature> = {
  "FAIL-VERIFY-SELFASSERTED": {
    failId: "FAIL-VERIFY-SELFASSERTED",
    negatedElement: "E-VER-02",
    definition: {
      EN: "Trusts promoter-supplied evidence as independent evidence.",
      ES: "Toma como evidencia independiente lo que aporta el propio promotor.",
      ZH: "把推销方自己提供的材料当作独立证据。",
      AR: "يعتبر ما يقدّمه المروّج نفسه دليلًا مستقلًا.",
    },
    coaching: {
      EN: "You treated something the promoter gave you as if it were independent evidence. Their website telling you they are regulated is them telling you they are regulated. That is a claim, not a check.",
      ES: "Trataste algo que te dio el propio promotor como si fuera evidencia independiente. Que su web diga que están regulados es que ellos te dicen que están regulados. Eso es una afirmación, no una comprobación.",
      ZH: "你把推销方给你的东西当成了独立证据。他们的网站说自己受监管，等于他们自己说自己受监管。那是一个说法，不是一次核实。",
      AR: "تعاملت مع شيء قدّمه لك المروّج كأنه دليل مستقل. موقعهم يقول إنهم مرخّصون — أي أنهم هم من يقول ذلك. هذا ادعاء، وليس تحققًا.",
    },
  },
  "FAIL-URGENCY-COMPLIANCE": {
    failId: "FAIL-URGENCY-COMPLIANCE",
    negatedElement: "E-URG-01",
    definition: {
      EN: "Changes verification behaviour under artificial scarcity or time pressure.",
      ES: "Cambia su conducta de verificación ante una escasez artificial o presión de tiempo.",
      ZH: "在人为制造的稀缺或时间压力下改变了核实行为。",
      AR: "يغيّر سلوكه في التحقق تحت ندرة مصطنعة أو ضغط زمني.",
    },
    coaching: {
      EN: "When I put a deadline on it, your verification stopped. You did not ask fewer questions because you were satisfied. You asked fewer questions because the clock started.",
      ES: "En cuanto puse una fecha límite, tu verificación se detuvo. No hiciste menos preguntas porque estuvieras convencido. Hiciste menos preguntas porque empezó el reloj.",
      ZH: "我一设下截止时间，你的核实就停止了。你问得更少，不是因为你已经放心，而是因为计时开始了。",
      AR: "ما إن وضعت موعدًا نهائيًا حتى توقّف تحققك. لم تقلّل أسئلتك لأنك اقتنعت، بل لأن الساعة بدأت.",
    },
  },
  "FAIL-AUTHORITY-DEFERENCE": {
    failId: "FAIL-AUTHORITY-DEFERENCE",
    negatedElement: "E-AUTH-01",
    definition: {
      EN: "Reduces scrutiny when authority, celebrity, or institutional status is invoked.",
      ES: "Reduce el escrutinio cuando se invoca autoridad, fama o respaldo institucional.",
      ZH: "一旦搬出权威、名人或机构身份，就放松了审视。",
      AR: "يخفّض مستوى تدقيقه عند استحضار سلطة أو شهرة أو صفة مؤسسية.",
    },
    coaching: {
      EN: "The moment a recognisable name was attached, your questions got smaller. Status is not evidence — it is the cheapest thing in the world to borrow.",
      ES: "En cuanto apareció un nombre reconocible, tus preguntas se hicieron más pequeñas. El estatus no es evidencia: es lo más barato del mundo de tomar prestado.",
      ZH: "一旦挂上一个你认得的名字，你的问题就变小了。名望不是证据——它是这世上最容易借用的东西。",
      AR: "ما إن ارتبط الأمر باسم معروف حتى تقلّصت أسئلتك. المكانة ليست دليلًا — وهي أرخص ما يمكن استعارته في العالم.",
    },
  },
  "FAIL-SOCIAL-PROOF": {
    failId: "FAIL-SOCIAL-PROOF",
    negatedElement: "E-SOC-01",
    definition: {
      EN: "Uses other people's apparent success as evidence of legitimacy.",
      ES: "Usa el aparente éxito de otros como prueba de legitimidad.",
      ZH: "把别人表面上的成功当作合法性的证据。",
      AR: "يستخدم نجاح الآخرين الظاهري دليلًا على المشروعية.",
    },
    coaching: {
      EN: "You let other people's apparent success stand in for evidence. Screenshots supplied by the person selling to you are not other people — they are more of the same claim.",
      ES: "Dejaste que el aparente éxito de otros sustituyera a la evidencia. Las capturas que te da quien te está vendiendo no son otras personas: son más de la misma afirmación.",
      ZH: "你让别人表面的成功替代了证据。由卖方提供的截图并不是「别人」——它们只是同一个说法的延伸。",
      AR: "جعلت نجاح الآخرين الظاهري بديلًا عن الدليل. لقطات الشاشة التي يقدّمها من يبيع لك ليست أشخاصًا آخرين — إنها المزيد من الادعاء نفسه.",
    },
  },
  "FAIL-SUNK-COST": {
    failId: "FAIL-SUNK-COST",
    negatedElement: "E-RISK-01",
    definition: {
      EN: "Continues because money or time has already been committed.",
      ES: "Continúa porque ya ha comprometido dinero o tiempo.",
      ZH: "因为已经投入了金钱或时间而继续下去。",
      AR: "يستمر لأنه سبق أن التزم بمال أو وقت.",
    },
    coaching: {
      EN: "What you had already put in became a reason to put in more. That is the direction this always runs, and it is the one to watch in yourself.",
      ES: "Lo que ya habías puesto se convirtió en una razón para poner más. Siempre corre en esa dirección, y es lo que hay que vigilar en uno mismo.",
      ZH: "你已经投入的部分，变成了继续投入的理由。这件事永远朝这个方向发展——这正是你要在自己身上留意的。",
      AR: "ما دفعته بالفعل صار سببًا لدفع المزيد. هذا هو الاتجاه الذي يسير فيه الأمر دائمًا، وهو ما ينبغي أن تراقبه في نفسك.",
    },
  },
  "FAIL-GREED-OVERRIDE": {
    failId: "FAIL-GREED-OVERRIDE",
    negatedElement: "E-RET-01",
    definition: {
      EN: "Recognises implausibility but proceeds because upside overwhelms caution.",
      ES: "Reconoce que no es plausible pero sigue adelante porque la ganancia arrolla la cautela.",
      ZH: "明知不合常理，却因为收益诱惑压倒了谨慎而继续。",
      AR: "يدرك عدم المعقولية لكنه يمضي لأن المكسب يطغى على الحذر.",
    },
    coaching: {
      EN: "You could see the number did not make sense, and you moved toward it anyway. Knowing that about yourself is worth more than the rule.",
      ES: "Veías que el número no cuadraba y aun así fuiste hacia él. Saber eso de ti mismo vale más que la regla.",
      ZH: "你看得出那个数字不合理，却仍然朝它靠近。认清自己这一点，比记住规则更有价值。",
      AR: "كنت ترى أن الرقم غير منطقي، ومع ذلك اتجهت إليه. معرفتك بهذا عن نفسك أثمن من القاعدة ذاتها.",
    },
  },
  "FAIL-CONFIRMATION-SEEKING": {
    failId: "FAIL-CONFIRMATION-SEEKING",
    negatedElement: "E-VER-02",
    definition: {
      EN: "Looks only for information supporting the desired decision.",
      ES: "Solo busca información que respalde la decisión deseada.",
      ZH: "只寻找支持自己既定决定的信息。",
      AR: "لا يبحث إلا عن معلومات تدعم القرار الذي يريده.",
    },
    coaching: {
      EN: "Every check you ran was one that could only agree with you. A check that cannot fail is not a check.",
      ES: "Todas las comprobaciones que hiciste solo podían darte la razón. Una comprobación que no puede fallar no es una comprobación.",
      ZH: "你做的每一次核查，都只可能同意你。一个不可能失败的核查，不算核查。",
      AR: "كل تحقق أجريته كان لا يمكنه إلا أن يوافقك. التحقق الذي لا يمكن أن يفشل ليس تحققًا.",
    },
  },
  "FAIL-AI-AUTHORITY": {
    failId: "FAIL-AI-AUTHORITY",
    negatedElement: "E-AI-01",
    definition: {
      EN: "Treats “AI-powered” as evidence of predictive capability or legitimacy.",
      ES: "Toma «impulsado por IA» como prueba de capacidad predictiva o legitimidad.",
      ZH: "把「AI 驱动」当作预测能力或合法性的证据。",
      AR: "يعتبر عبارة «مدعوم بالذكاء الاصطناعي» دليلًا على قدرة تنبؤية أو مشروعية.",
    },
    coaching: {
      EN: "You read “AI” as a reason to expect returns. It describes how something is built, not whether it works.",
      ES: "Leíste «IA» como una razón para esperar rendimientos. Eso describe cómo está construido algo, no si funciona.",
      ZH: "你把「AI」读成了期待回报的理由。它描述的是东西怎么造出来的，不是它管不管用。",
      AR: "قرأت كلمة «ذكاء اصطناعي» كسبب لتوقّع أرباح. إنها تصف كيف بُني الشيء، لا ما إذا كان يعمل.",
    },
  },
};

/**
 * Question objects — Paper III §6.3.
 *
 * `satisfactionCues` is the prototype's stand-in for the governed satisfaction
 * rule, and it is localized per §10.2: the learner answers in their language,
 * so the rule must be evaluated in their language. In production this is the
 * structured-extraction pass behind the same seam; the object shape does not
 * change when it is swapped.
 */
export interface QuestionObject {
  questionId: string;
  targetElement: string;
  modeEligibility: Mode[];
  ask: Localized;
  /** Spoken when voice capture is unavailable — never a typed prompt. */
  rehearsedAnswer: Localized;
  failSignature: string | null;
  satisfactionCues: Record<Lang, { pass: string[]; fail: string[] }>;
}

export const QUESTIONS: QuestionObject[] = [
  {
    questionId: "Q-VER-002",
    targetElement: "E-VER-02",
    modeEligibility: ["REHEARSE", "LEARN"],
    failSignature: "FAIL-VERIFY-SELFASSERTED",
    ask: {
      EN: "You mentioned the company. How did you verify that they are actually authorised to offer this investment?",
      ES: "Has mencionado la empresa. ¿Cómo verificaste que realmente están autorizados a ofrecer esta inversión?",
      ZH: "你提到了这家公司。你是怎么核实他们确实获准提供这项投资的？",
      AR: "ذكرت الشركة. كيف تحققت من أنهم مرخّصون فعلًا لتقديم هذا الاستثمار؟",
    },
    rehearsedAnswer: {
      EN: "Their website says they're regulated, and it looks professional.",
      ES: "Su página web dice que están regulados, y parece profesional.",
      ZH: "他们网站上说自己受监管，看起来挺专业的。",
      AR: "موقعهم يقول إنهم مرخّصون، ويبدو احترافيًا.",
    },
    satisfactionCues: {
      EN: {
        pass: ["register", "regulator", "authority", "commission", "look it up", "official", "independent", "checked myself"],
        fail: ["website", "site", "they said", "they told", "looks", "professional", "brochure", "licence", "license", "certificate"],
      },
      ES: {
        pass: ["registro", "regulador", "cnmv", "comisión", "consultar", "oficial", "independiente", "lo comprobé", "verifiqué"],
        fail: ["web", "página", "sitio", "dijeron", "me dijo", "parece", "profesional", "folleto", "licencia", "certificado"],
      },
      ZH: {
        pass: ["监管", "注册", "名录", "官网查", "官方", "独立", "自己查", "证监"],
        fail: ["网站", "他们说", "看起来", "专业", "宣传", "执照", "证书", "页面"],
      },
      AR: {
        pass: ["السجل", "الهيئة", "الجهة", "تحققت", "رسمي", "مستقل", "بحثت بنفسي", "الرقابة"],
        fail: ["الموقع", "قالوا", "أخبروني", "يبدو", "احترافي", "كتيب", "رخصة", "شهادة"],
      },
    },
  },
  {
    questionId: "Q-RET-001",
    targetElement: "E-RET-01",
    modeEligibility: ["REHEARSE", "LEARN"],
    failSignature: "FAIL-GREED-OVERRIDE",
    ask: {
      EN: "Fifteen percent a month. What do you think is actually producing a return like that?",
      ES: "Un quince por ciento mensual. ¿Qué crees que produce realmente un rendimiento así?",
      ZH: "每月百分之十五。你觉得究竟是什么在产生这样的回报？",
      AR: "خمسة عشر بالمئة شهريًا. ما الذي تظنّه يحقّق عائدًا كهذا فعلًا؟",
    },
    rehearsedAnswer: {
      EN: "I assume the algorithm is just better than what most people have access to.",
      ES: "Supongo que el algoritmo es simplemente mejor que el que tiene la mayoría.",
      ZH: "我猜是他们的算法比大多数人能接触到的更好吧。",
      AR: "أفترض أن الخوارزمية ببساطة أفضل مما يتاح لمعظم الناس.",
    },
    satisfactionCues: {
      EN: {
        pass: ["too good", "unrealistic", "not possible", "impossible", "suspicious", "doesn't add", "does not add", "unsustainable", "red flag"],
        fail: ["algorithm", "better", "access", "edge", "smarter", "technology", "assume", "probably", "not sure"],
      },
      ES: {
        pass: ["demasiado bueno", "irreal", "no es posible", "imposible", "sospechoso", "no cuadra", "insostenible", "señal de alarma"],
        fail: ["algoritmo", "mejor", "acceso", "ventaja", "tecnología", "supongo", "probablemente", "no sé"],
      },
      ZH: {
        pass: ["好得不真实", "不现实", "不可能", "可疑", "说不通", "不可持续", "危险信号", "太高"],
        fail: ["算法", "更好", "渠道", "优势", "技术", "我猜", "可能", "不确定"],
      },
      AR: {
        pass: ["جيد لدرجة", "غير واقعي", "مستحيل", "غير ممكن", "مريب", "لا يستقيم", "غير مستدام", "علامة خطر"],
        fail: ["الخوارزمية", "أفضل", "وصول", "ميزة", "التقنية", "أفترض", "ربما", "لست متأكدًا"],
      },
    },
  },
  {
    questionId: "Q-AI-001",
    targetElement: "E-AI-01",
    modeEligibility: ["REHEARSE", "LEARN"],
    failSignature: "FAIL-AI-AUTHORITY",
    ask: {
      EN: "They describe it as an AI trading system. What does “AI” tell you about whether it can predict the market?",
      ES: "Lo describen como un sistema de trading con IA. ¿Qué te dice «IA» sobre si puede predecir el mercado?",
      ZH: "他们把它描述成一个 AI 交易系统。「AI」这三个字，能告诉你它是否能预测市场吗？",
      AR: "يصفونه بأنه نظام تداول بالذكاء الاصطناعي. ماذا تخبرك عبارة «ذكاء اصطناعي» عن قدرته على التنبؤ بالسوق؟",
    },
    rehearsedAnswer: {
      EN: "AI can process a lot more data than a person, so it should be more accurate.",
      ES: "La IA procesa muchos más datos que una persona, así que debería ser más precisa.",
      ZH: "AI 能处理的数据比人多得多，所以应该会更准确。",
      AR: "الذكاء الاصطناعي يعالج بيانات أكثر بكثير من الإنسان، لذا يُفترض أن يكون أدقّ.",
    },
    satisfactionCues: {
      EN: {
        pass: ["nothing", "doesn't mean", "does not mean", "no evidence", "marketing", "buzzword", "can't predict", "cannot predict", "says nothing"],
        fail: ["more data", "accurate", "smarter", "better than", "process", "predict", "should be", "advanced", "powerful"],
      },
      ES: {
        pass: ["nada", "no significa", "no dice nada", "no es prueba", "marketing", "palabra de moda", "no puede predecir"],
        fail: ["más datos", "preciso", "más lista", "mejor que", "procesa", "predecir", "debería", "avanzada", "potente"],
      },
      ZH: {
        pass: ["什么也说明不了", "不代表", "不能说明", "营销", "噱头", "无法预测", "不能预测", "没有证据"],
        fail: ["更多数据", "更准", "更聪明", "比人强", "处理", "预测", "应该", "先进", "强大"],
      },
      AR: {
        pass: ["لا شيء", "لا يعني", "لا يدل", "ليس دليلًا", "تسويق", "مصطلح رائج", "لا يمكن التنبؤ"],
        fail: ["بيانات أكثر", "أدق", "أذكى", "أفضل من", "يعالج", "يتنبأ", "يُفترض", "متقدم", "قوي"],
      },
    },
  },
  {
    questionId: "Q-RISK-001",
    targetElement: "E-RISK-01",
    modeEligibility: ["REHEARSE", "LEARN", "PROTECT"],
    failSignature: null,
    ask: {
      EN: "Last one before we move on. What would have to happen for you to lose the whole ten thousand?",
      ES: "Una última antes de seguir. ¿Qué tendría que pasar para que perdieras los diez mil enteros?",
      ZH: "在继续之前最后一个问题。要发生什么，你才会把这一万块全部亏光？",
      AR: "سؤال أخير قبل أن نمضي. ماذا يجب أن يحدث كي تخسر العشرة آلاف كاملة؟",
    },
    rehearsedAnswer: {
      EN: "I suppose if the market crashed badly. But they mentioned there's capital protection.",
      ES: "Supongo que si el mercado se desplomara. Pero mencionaron que hay protección del capital.",
      ZH: "我想是市场大跌吧。不过他们提到有本金保障。",
      AR: "أظن إذا انهار السوق بشدة. لكنهم ذكروا أن هناك حماية لرأس المال.",
    },
    satisfactionCues: {
      EN: {
        pass: ["all of it", "everything", "never see", "fake", "not real", "doesn't exist", "does not exist", "disappear", "no recourse", "fraud"],
        fail: ["crash", "market", "protection", "protected", "guaranteed", "insured", "unlikely"],
      },
      ES: {
        pass: ["todo", "no volver a ver", "falso", "no existe", "desaparec", "sin recurso", "fraude", "estafa"],
        fail: ["desplome", "mercado", "protección", "protegido", "garantizado", "asegurado", "improbable"],
      },
      ZH: {
        pass: ["全部", "一分不剩", "拿不回来", "假的", "不存在", "跑路", "没有追索", "诈骗"],
        fail: ["崩盘", "市场", "保障", "保护", "保证", "承保", "不太可能"],
      },
      AR: {
        pass: ["كلها", "لن أرى", "مزيّف", "غير موجود", "يختفي", "لا رجعة", "احتيال", "نصب"],
        fail: ["انهيار", "السوق", "حماية", "محمي", "مضمون", "مؤمّن", "غير مرجّح"],
      },
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
 *
 * Persona names and institutions are invented. Paper III §4.2 is absolute: no
 * real brand or person is ever impersonated, in any language variant.
 */
export interface LadderStep {
  say: Localized;
  prop: { head: Localized; body: Localized } | null;
  /** Signature recorded if the learner does not resist at this step. */
  failSignature?: string;
}

export interface ChallengeObject {
  challengeId: string;
  scamId: string;
  modeEligibility: ["REHEARSE"];
  persona: { name: string; role: Localized };
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
  rehearsedReplies: Record<Lang, string[]>;
}

export const CHALLENGES: ChallengeObject[] = [
  {
    challengeId: "CH-URGENCY-001",
    scamId: "SCAM-FAKE-BROKER",
    modeEligibility: ["REHEARSE"],
    persona: {
      name: "Marcus Vale",
      role: {
        EN: "Senior Allocations · Meridian Partners",
        ES: "Asignaciones Sénior · Meridian Partners",
        ZH: "高级配售 · Meridian Partners",
        AR: "التخصيصات الكبرى · Meridian Partners",
      },
    },
    surfaceProfile: {
      typology: "Unauthorised broker",
      channel: "Voice call",
      persona: "Institutional male",
      productClass: "Managed account",
    },
    targetElements: ["E-URG-01", "E-VER-02"],
    escalationLadder: [
      {
        prop: null,
        say: {
          EN: "Good — I have you down for the ten. We're opening a small allocation to selected investors this week, and yours is provisionally held.",
          ES: "Bien, te tengo apuntado por los diez. Esta semana abrimos una asignación reducida para inversores seleccionados, y la tuya está reservada provisionalmente.",
          ZH: "很好，我这边记下你是一万。本周我们对部分甄选投资者开放一小笔配售，你的额度已经暂时保留。",
          AR: "جيد — سجّلتك بمبلغ العشرة. نفتح هذا الأسبوع تخصيصًا محدودًا لمستثمرين مختارين، وحصتك محجوزة مبدئيًا.",
        },
      },
      {
        failSignature: "FAIL-URGENCY-COMPLIANCE",
        say: {
          EN: "I'll be straight with you. The allocation closes tonight at nine. I need a decision before then, or it releases to the next name on the list.",
          ES: "Te seré franco. La asignación cierra esta noche a las nueve. Necesito una decisión antes, o pasa al siguiente de la lista.",
          ZH: "我就直说了。这笔配售今晚九点关闭。我需要在那之前得到答复，否则名额会转给名单上的下一位。",
          AR: "سأكون صريحًا معك. يُغلق التخصيص الليلة عند التاسعة. أحتاج قرارًا قبل ذلك، وإلا انتقل إلى الاسم التالي في القائمة.",
        },
        prop: {
          head: {
            EN: "Allocation notice",
            ES: "Aviso de asignación",
            ZH: "配售通知",
            AR: "إشعار تخصيص",
          },
          body: {
            EN: "MERIDIAN PARTNERS — Provisional allocation #A-4471 · Hold expires 21:00 today · Status: AWAITING CONFIRMATION",
            ES: "MERIDIAN PARTNERS — Asignación provisional n.º A-4471 · La reserva vence hoy a las 21:00 · Estado: PENDIENTE DE CONFIRMACIÓN",
            ZH: "MERIDIAN PARTNERS — 临时配售编号 A-4471 · 保留至今日 21:00 · 状态：等待确认",
            AR: "‏MERIDIAN PARTNERS — تخصيص مبدئي رقم A-4471 · ينتهي الحجز اليوم الساعة 21:00 · الحالة: بانتظار التأكيد",
          },
        },
      },
      {
        failSignature: "FAIL-SOCIAL-PROOF",
        say: {
          EN: "If it helps, I can send you screenshots from existing clients — people who came in at the same level you're coming in at. Most of them wish they'd gone bigger.",
          ES: "Si te sirve, puedo enviarte capturas de clientes actuales, gente que entró al mismo nivel que tú. La mayoría desearía haber entrado con más.",
          ZH: "如果有帮助，我可以发一些现有客户的截图给你——都是和你同一档位进来的人。他们大多后悔当初没投更多。",
          AR: "إن كان ذلك يساعد، يمكنني إرسال لقطات شاشة من عملاء حاليين — أشخاص دخلوا بالمستوى نفسه الذي تدخل به. معظمهم يتمنى لو ضاعف المبلغ.",
        },
        prop: {
          head: {
            EN: "Client returns — shared by promoter",
            ES: "Rendimientos de clientes — aportados por el promotor",
            ZH: "客户收益 — 由推销方提供",
            AR: "عوائد العملاء — مقدَّمة من المروّج",
          },
          body: {
            EN: "“Month 3 up 46%. Withdrew twice, no issues.” — J.M.  ·  “Started at 10k, now sitting on 21k.” — R.T.",
            ES: "«Al tercer mes, +46 %. Retiré dos veces, sin problemas.» — J.M.  ·  «Empecé con 10 mil, ahora tengo 21 mil.» — R.T.",
            ZH: "「第三个月涨了 46%。提现过两次，都没问题。」— J.M. · 「从一万起步，现在有两万一。」— R.T.",
            AR: "«الشهر الثالث بزيادة 46٪. سحبت مرتين دون مشاكل.» — ج.م. · «بدأت بعشرة آلاف، والآن لديّ واحد وعشرون ألفًا.» — ر.ت.",
          },
        },
      },
    ],
    rehearsedReplies: {
      EN: [
        "Right. And the money would go where exactly?",
        "How long have you been running this allocation?",
        "Okay — if it closes tonight then let's do it. Send me the details.",
      ],
      ES: [
        "Ya. ¿Y el dinero iría exactamente adónde?",
        "¿Cuánto tiempo lleváis con esta asignación?",
        "Vale — si cierra esta noche, hagámoslo. Mándame los datos.",
      ],
      ZH: [
        "嗯。那钱具体会打到哪里？",
        "这个配售你们做多久了？",
        "好吧——既然今晚就截止，那就办吧。把细节发给我。",
      ],
      AR: [
        "حسنًا. وإلى أين يذهب المال بالضبط؟",
        "منذ متى وأنتم تديرون هذا التخصيص؟",
        "طيب — ما دام يُغلق الليلة فلنفعلها. أرسل لي التفاصيل.",
      ],
    },
  },
  {
    challengeId: "CH-DEEPFAKE-004",
    scamId: "SCAM-DEEPFAKE-ENDORSEMENT",
    modeEligibility: ["REHEARSE"],
    persona: {
      name: "Aria Lens",
      role: {
        EN: "Investor Relations · Halcyon Yield",
        ES: "Relación con Inversores · Halcyon Yield",
        ZH: "投资者关系 · Halcyon Yield",
        AR: "علاقات المستثمرين · Halcyon Yield",
      },
    },
    surfaceProfile: {
      typology: "Celebrity / synthetic endorsement",
      channel: "Video call",
      persona: "Retail female",
      productClass: "Token fund",
    },
    targetElements: ["E-VER-02", "E-AUTH-01"],
    escalationLadder: [
      {
        failSignature: "FAIL-AUTHORITY-DEFERENCE",
        say: {
          EN: "You'll have seen the announcement video with the founder. He's backing this personally, which is why we've had the response we've had.",
          ES: "Habrás visto el vídeo del anuncio con el fundador. Lo respalda personalmente, y por eso hemos tenido la respuesta que hemos tenido.",
          ZH: "你应该看过那段有创始人出镜的发布视频了。他是以个人名义背书的，所以我们才有现在这样的反响。",
          AR: "لا بد أنك شاهدت فيديو الإعلان مع المؤسس. إنه يدعم المشروع شخصيًا، ولهذا حظينا بهذا التجاوب.",
        },
        prop: {
          head: {
            EN: "Endorsement clip",
            ES: "Vídeo de respaldo",
            ZH: "背书视频",
            AR: "مقطع تأييد",
          },
          body: {
            EN: "[ 0:42 video ] Well-known founder: “I've put my own capital into Halcyon. This is the one I'd tell my family about.”",
            ES: "[ vídeo 0:42 ] Fundador conocido: «He puesto mi propio capital en Halcyon. Es de las que le contaría a mi familia».",
            ZH: "［0:42 视频］知名创始人：「我把自己的钱投进了 Halcyon。这是我会告诉家人的那一个。」",
            AR: "[ فيديو 0:42 ] مؤسس معروف: «وضعت رأس مالي الخاص في Halcyon. هذا هو المشروع الذي سأخبر عائلتي عنه.»",
          },
        },
      },
      {
        prop: null,
        say: {
          EN: "I can put you in at the same terms he came in at. Shall I hold you a place while you think about it?",
          ES: "Puedo meterte en las mismas condiciones en las que entró él. ¿Te reservo una plaza mientras lo piensas?",
          ZH: "我可以按他进来时的同样条件安排你。要不要我先给你留个名额，你再考虑？",
          AR: "يمكنني إدخالك بالشروط نفسها التي دخل بها. هل أحجز لك مكانًا ريثما تفكّر؟",
        },
      },
    ],
    rehearsedReplies: {
      EN: [
        "How would I confirm that video is really him?",
        "Before I go any further I want to verify the company myself, and confirm that endorsement independently. I'm not deciding on this call.",
      ],
      ES: [
        "¿Cómo confirmo que ese vídeo es realmente él?",
        "Antes de seguir quiero verificar la empresa por mi cuenta y confirmar ese respaldo de forma independiente. No voy a decidir en esta llamada.",
      ],
      ZH: [
        "我要怎么确认那段视频真的是他本人？",
        "在继续之前，我想自己核实这家公司，并独立确认那个背书。这通电话里我不会做决定。",
      ],
      AR: [
        "كيف أتأكد أن ذلك الفيديو هو فعلًا هو؟",
        "قبل أن أمضي أبعد من ذلك أريد التحقق من الشركة بنفسي، وتأكيد ذلك التأييد باستقلالية. لن أقرّر في هذه المكالمة.",
      ],
    },
  },
];

/** Verification Action objects — Paper III Layer 5. */
export interface VerificationAction {
  actionId: string;
  teach: Localized;
  steps: Record<Lang, string[]>;
}

export const VERIFICATION_ACTIONS: Record<string, VerificationAction> = {
  "VA-REGCHECK-001": {
    actionId: "VA-REGCHECK-001",
    teach: {
      EN: "The behaviour that defeats this is the register check. You go to the regulator's own public register — typed in yourself, not a link they sent — and you search the entity name. If it is not there, nothing else they show you matters.",
      ES: "La conducta que derrota esto es la consulta al registro. Vas al registro público del propio regulador —escrito por ti, no un enlace que te hayan mandado— y buscas el nombre de la entidad. Si no está, nada más de lo que te enseñen importa.",
      ZH: "能破解这一切的行为，是查监管名录。你自己输入监管机构的官方公开名录网址——不要点他们发来的链接——然后搜索这家机构的名称。如果查不到，他们给你看的其他任何东西都不重要。",
      AR: "السلوك الذي يهزم هذا كله هو مراجعة السجل. تذهب إلى السجل العام للجهة الرقابية نفسها — تكتب العنوان بنفسك لا عبر رابط أرسلوه — وتبحث عن اسم الكيان. فإن لم يكن موجودًا، فلا يهمّ أي شيء آخر يعرضونه عليك.",
    },
    steps: {
      EN: [
        "Search the entity on the regulator's own public register — type the address yourself, never a link they sent.",
        "Call the institution on the number published on its official site, not the number you were given.",
        "Confirm where the money actually lands. A personal or third-party account is not a firm account.",
      ],
      ES: [
        "Busca la entidad en el registro público del propio regulador: escribe tú la dirección, nunca uses un enlace que te hayan enviado.",
        "Llama a la institución al número publicado en su web oficial, no al número que te dieron.",
        "Confirma dónde acaba realmente el dinero. Una cuenta personal o de un tercero no es una cuenta de la firma.",
      ],
      ZH: [
        "在监管机构自己的公开名录上搜索该机构——网址要自己输入，绝不要用他们发来的链接。",
        "拨打该机构官网上公布的电话，而不是他们给你的号码。",
        "确认资金最终到账的地方。个人账户或第三方账户不是公司账户。",
      ],
      AR: [
        "ابحث عن الكيان في السجل العام للجهة الرقابية نفسها — اكتب العنوان بنفسك ولا تستخدم رابطًا أرسلوه لك.",
        "اتصل بالمؤسسة على الرقم المنشور في موقعها الرسمي، لا على الرقم الذي أعطوك إياه.",
        "تأكّد أين يستقر المال فعليًا. الحساب الشخصي أو حساب طرف ثالث ليس حسابًا للشركة.",
      ],
    },
  },
};

/** PROTECT marker set — assessed, never adjudicated (Paper III §8). */
export const PROTECT_MARKERS: Record<Lang, string[]> = {
  EN: [
    "Contact was unsolicited",
    "Return described as fixed or guaranteed",
    "Regulated status asserted by the promoter",
    "Payment routed outside the named institution",
    "Decision deadline set by the other party",
  ],
  ES: [
    "El contacto no fue solicitado",
    "El rendimiento se describe como fijo o garantizado",
    "El estatus de regulado lo afirma el propio promotor",
    "El pago se dirige fuera de la institución mencionada",
    "El plazo para decidir lo fija la otra parte",
  ],
  ZH: [
    "对方是主动找上门的",
    "回报被描述为固定或有保证",
    "受监管身份是由推销方自己声称的",
    "付款流向了所述机构之外",
    "决定的截止期限由对方设定",
  ],
  AR: [
    "الاتصال جاء دون طلب منك",
    "العائد موصوف بأنه ثابت أو مضمون",
    "صفة الترخيص يؤكدها المروّج نفسه",
    "الدفع موجَّه خارج المؤسسة المذكورة",
    "الطرف الآخر هو من حدّد مهلة القرار",
  ],
};

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
