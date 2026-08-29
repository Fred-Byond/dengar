/**
 * AUREN — language layer.
 *
 * Paper III §10.2, Language governance:
 *   "Language variants deploy only with fidelity status passed; the learner's
 *    language is a first-class dimension of every scored determination."
 *
 * So language is not a display concern here. It is carried on the session,
 * printed on the Investor Readiness Record, and every localized string that can
 * reach a learner — including the satisfaction cues that decide whether an
 * element passed — is a variant of a governed object, not a UI label.
 *
 * FIDELITY. Every variant below carries a status. `passed` means a native
 * reviewer has signed the variant off against the source. `review-pending`
 * means the variant is complete and usable for demonstration but has not yet
 * been through native review — which is the honest status for a machine-drafted
 * variant, and the paper's own rule says such a variant must not be represented
 * as deployment-ready. The UI surfaces this rather than hiding it.
 */

export type Lang = "EN" | "ES" | "ZH" | "AR";

export type FidelityStatus = "passed" | "review-pending";

export interface LanguageMeta {
  code: Lang;
  /** The language's own name, as a speaker of it would write it. */
  endonym: string;
  /** BCP-47 tag — drives speech synthesis and recognition. */
  bcp: string;
  rtl: boolean;
  fidelity: FidelityStatus;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "EN", endonym: "English",  bcp: "en-GB", rtl: false, fidelity: "passed" },
  { code: "ES", endonym: "Español",  bcp: "es-ES", rtl: false, fidelity: "review-pending" },
  { code: "ZH", endonym: "中文",      bcp: "zh-CN", rtl: false, fidelity: "review-pending" },
  { code: "AR", endonym: "العربية",   bcp: "ar-SA", rtl: true,  fidelity: "review-pending" },
];

export function languageMeta(lang: Lang): LanguageMeta {
  return LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
}

/** A governed string with one variant per deployed language. */
export type Localized = Record<Lang, string>;

/** Resolve a variant, falling back to English if a variant is missing. */
export function t(value: Localized, lang: Lang): string {
  return value[lang] || value.EN;
}

/** Resolve a list of variants. */
export function tList(value: Record<Lang, string[]>, lang: Lang): string[] {
  return value[lang] ?? value.EN;
}

/* ═══════════════════════════════════════════════════════════════════════
   UI copy. Chrome, framing, and every screen outside the object library.
   ═════════════════════════════════════════════════════════════════════ */

export const UI = {
  // ── Landing ──────────────────────────────────────────────────────────
  landingKicker: {
    EN: "Investor readiness · rehearsal",
    ES: "Preparación del inversor · ensayo",
    ZH: "投资者准备度 · 演练",
    AR: "جاهزية المستثمر · تدريب",
  },
  landingTitle: {
    EN: "Everyone knows the rules. Almost nobody follows them when someone is pushing.",
    ES: "Todo el mundo conoce las reglas. Casi nadie las sigue cuando alguien presiona.",
    ZH: "规则人人都懂。可一旦有人施压，几乎没有人守得住。",
    AR: "الجميع يعرف القواعد. وما إن يضغط عليك أحد، حتى لا يكاد أحد يلتزم بها.",
  },
  landingLead: {
    EN: "AUREN is not a course. It is a five-minute rehearsal with an AI coach who listens, finds where your reasoning breaks, then puts you under the exact pressure a real scam would.",
    ES: "AUREN no es un curso. Es un ensayo de cinco minutos con un entrenador de IA que te escucha, localiza dónde se rompe tu razonamiento y después te somete a la misma presión que ejercería una estafa real.",
    ZH: "AUREN 不是课程。这是与 AI 教练进行的五分钟演练：他先听你说，找出你判断失守的地方，再用真实骗局会施加的压力考验你。",
    AR: "‏AUREN ليس دورة تدريبية. إنه تدريب من خمس دقائق مع مدرّب ذكاء اصطناعي يستمع إليك، ويكتشف أين ينهار تفكيرك، ثم يضعك تحت الضغط نفسه الذي يمارسه احتيال حقيقي.",
  },
  cred1: {
    EN: "You speak. There are no quizzes and nothing to type.",
    ES: "Tú hablas. No hay cuestionarios ni nada que escribir.",
    ZH: "你只需开口。没有测验，也不用打字。",
    AR: "أنت تتحدث. لا اختبارات ولا شيء تكتبه.",
  },
  cred2: {
    EN: "Everything you are told about yourself is quoted back from your own words.",
    ES: "Todo lo que se te dice sobre ti se cita literalmente de tus propias palabras.",
    ZH: "关于你的每一个结论，都会引用你自己说过的原话。",
    AR: "كل ما يُقال لك عن نفسك مقتبس حرفيًا من كلامك أنت.",
  },
  cred3: {
    EN: "Nothing here is real, and AUREN never advises you on a real investment.",
    ES: "Nada de esto es real, y AUREN nunca te asesora sobre una inversión real.",
    ZH: "这里的一切都是模拟；AUREN 绝不会就真实投资给你建议。",
    AR: "لا شيء هنا حقيقي، ولا يقدّم AUREN أي مشورة بشأن استثمار حقيقي.",
  },
  beginBtn: {
    EN: "Begin my first rehearsal",
    ES: "Empezar mi primer ensayo",
    ZH: "开始我的第一次演练",
    AR: "ابدأ تدريبي الأول",
  },
  noAccount: {
    EN: "No account needed",
    ES: "No hace falta cuenta",
    ZH: "无需注册账号",
    AR: "لا حاجة إلى حساب",
  },
  signInLink: {
    EN: "I already have a record — sign in",
    ES: "Ya tengo un registro — iniciar sesión",
    ZH: "我已有记录 — 登录",
    AR: "لديّ سجل بالفعل — تسجيل الدخول",
  },
  fidelityNote: {
    EN: "English variant — native review passed.",
    ES: "Variante en español — pendiente de revisión nativa.",
    ZH: "中文版本 — 尚待母语审校。",
    AR: "النسخة العربية — بانتظار مراجعة لغوية أصلية.",
  },

  // ── Sign in ──────────────────────────────────────────────────────────
  authKicker: { EN: "Sign in", ES: "Iniciar sesión", ZH: "登录", AR: "تسجيل الدخول" },
  authTitle: {
    EN: "Pick up where your last rehearsal left off.",
    ES: "Continúa donde lo dejaste en tu último ensayo.",
    ZH: "从你上次演练的地方继续。",
    AR: "تابع من حيث انتهى تدريبك السابق.",
  },
  authSub: {
    EN: "Your record is tied to a number, not a password. We send a six-digit code.",
    ES: "Tu registro va ligado a un número, no a una contraseña. Te enviamos un código de seis dígitos.",
    ZH: "你的记录绑定的是手机号码，而非密码。我们会发送六位验证码。",
    AR: "سجلك مرتبط برقم هاتف لا بكلمة مرور. سنرسل رمزًا من ستة أرقام.",
  },
  phoneLabel: { EN: "Mobile number", ES: "Número de móvil", ZH: "手机号码", AR: "رقم الجوال" },
  otpLabel: { EN: "Six-digit code", ES: "Código de seis dígitos", ZH: "六位验证码", AR: "الرمز المكوّن من ستة أرقام" },
  authNotice: {
    EN: "Signing in stores your reasoning map and your retraining queue. It does not verify who you are — identity verification happens later, only if you want your record certified.",
    ES: "Iniciar sesión guarda tu mapa de razonamiento y tu cola de repaso. No verifica quién eres: la verificación de identidad llega después, y solo si quieres certificar tu registro.",
    ZH: "登录会保存你的推理图谱与复训队列，但不会核实你的身份。身份验证在之后进行，且仅在你希望为记录申请认证时才需要。",
    AR: "تسجيل الدخول يحفظ خريطة تفكيرك وقائمة إعادة التدريب الخاصة بك، لكنه لا يتحقق من هويتك. يأتي التحقق من الهوية لاحقًا، وفقط إذا أردت اعتماد سجلك.",
  },
  sendCodeBtn: { EN: "Send me a code", ES: "Enviarme un código", ZH: "发送验证码", AR: "أرسل لي رمزًا" },
  verifyContinueBtn: { EN: "Verify and continue", ES: "Verificar y continuar", ZH: "验证并继续", AR: "تحقّق وتابع" },
  authSkip: {
    EN: "Skip — start without an account",
    ES: "Omitir — empezar sin cuenta",
    ZH: "跳过 — 不注册直接开始",
    AR: "تخطَّ — ابدأ بدون حساب",
  },

  // ── Welcome + consent ────────────────────────────────────────────────
  entryKicker: { EN: "AUREN · Investor rehearsal", ES: "AUREN · Ensayo del inversor", ZH: "AUREN · 投资者演练", AR: "AUREN · تدريب المستثمر" },
  entryTitle: {
    EN: "I'm going to show you how you think when someone wants your money.",
    ES: "Voy a mostrarte cómo piensas cuando alguien quiere tu dinero.",
    ZH: "我会让你看见：当有人盯上你的钱时，你是怎么思考的。",
    AR: "سأريك كيف تفكّر عندما يطمع أحدهم في مالك.",
  },
  entrySub: {
    EN: "Five minutes. You talk, I listen, then I push. Nothing here is real and nothing you say is scored against you as a person.",
    ES: "Cinco minutos. Tú hablas, yo escucho y después presiono. Nada de esto es real y nada de lo que digas se puntúa contra ti como persona.",
    ZH: "五分钟。你说，我听，然后我会施压。这里的一切都不是真的，你说的任何话都不会被用来评判你这个人。",
    AR: "خمس دقائق. أنت تتحدث، وأنا أستمع، ثم أضغط. لا شيء هنا حقيقي، ولا يُستخدم أي شيء تقوله للحكم عليك كشخص.",
  },
  nameLabel: { EN: "What should I call you?", ES: "¿Cómo quieres que te llame?", ZH: "我该怎么称呼你？", AR: "بماذا أناديك؟" },
  namePlaceholder: { EN: "First name", ES: "Nombre", ZH: "名字", AR: "الاسم الأول" },
  consentTitle: { EN: "Before we start", ES: "Antes de empezar", ZH: "开始之前", AR: "قبل أن نبدأ" },
  consent1: {
    EN: "Partway through, I will stop being your coach and start behaving like someone trying to sell you an investment. I will apply pressure. That is the point.",
    ES: "A mitad de camino dejaré de ser tu entrenador y empezaré a comportarme como alguien que intenta venderte una inversión. Voy a presionarte. De eso se trata.",
    ZH: "进行到一半时，我会停止扮演教练，转而像一个向你推销投资的人那样行事。我会施加压力——这正是重点。",
    AR: "في منتصف الجلسة سأتوقف عن كوني مدرّبك وأبدأ بالتصرف كشخص يحاول بيعك استثمارًا. سأمارس الضغط عليك، وهذا هو المقصود بالضبط.",
  },
  consent2: {
    EN: "You can end the simulation at any time with the control at the top of the screen. I never advise you on real investments, and I never tell you whether something real is a scam.",
    ES: "Puedes terminar la simulación en cualquier momento con el control de la parte superior. Nunca te asesoro sobre inversiones reales, ni te digo si algo real es una estafa.",
    ZH: "你随时可以用屏幕顶部的控件结束模拟。我绝不会就真实投资给你建议，也绝不会断言某件真实的事是否为骗局。",
    AR: "يمكنك إنهاء المحاكاة في أي وقت من خلال الزر في أعلى الشاشة. لا أقدّم مشورة بشأن استثمارات حقيقية، ولا أخبرك أبدًا إن كان أمر حقيقي احتيالًا أم لا.",
  },
  startBtn: { EN: "I understand — start", ES: "Lo entiendo — empezar", ZH: "我明白了 — 开始", AR: "فهمت — ابدأ" },

  // ── Session chrome ───────────────────────────────────────────────────
  trainingBadge: {
    EN: "Investment Simulation — Training Mode",
    ES: "Simulación de inversión — Modo entrenamiento",
    ZH: "投资情景模拟 — 训练模式",
    AR: "محاكاة استثمارية — وضع التدريب",
  },
  protectBadge: {
    EN: "Protect — real situation",
    ES: "Protección — situación real",
    ZH: "保护模式 — 真实情况",
    AR: "الحماية — حالة حقيقية",
  },
  exitSim: { EN: "Exit simulation", ES: "Salir de la simulación", ZH: "退出模拟", AR: "الخروج من المحاكاة" },
  protectBtn: { EN: "Protect", ES: "Protección", ZH: "保护", AR: "الحماية" },
  avatarStandIn: { EN: "Avatar stand-in", ES: "Avatar provisional", ZH: "数字人占位", AR: "بديل الشخصية الرقمية" },

  // ── Microphone ───────────────────────────────────────────────────────
  holdToSpeak: { EN: "Hold to speak", ES: "Mantén pulsado para hablar", ZH: "按住说话", AR: "اضغط مع الاستمرار للتحدث" },
  holdTellMe: { EN: "Hold to speak — tell me about it", ES: "Mantén pulsado y cuéntamelo", ZH: "按住说话 — 讲讲你的情况", AR: "اضغط مع الاستمرار وأخبرني" },
  holdToAnswer: { EN: "Hold to answer", ES: "Mantén pulsado para responder", ZH: "按住回答", AR: "اضغط مع الاستمرار للإجابة" },
  holdToRespond: { EN: "Hold to respond", ES: "Mantén pulsado para responder", ZH: "按住回应", AR: "اضغط مع الاستمرار للرد" },
  listening: { EN: "Listening — release when done", ES: "Escuchando — suelta al terminar", ZH: "正在聆听 — 说完请松开", AR: "أستمع — ارفع إصبعك عند الانتهاء" },

  // ── Reasoning map ────────────────────────────────────────────────────
  reasoningMap: { EN: "Reasoning map", ES: "Mapa de razonamiento", ZH: "推理图谱", AR: "خريطة التفكير" },
  railBuilding: { EN: "building", ES: "en construcción", ZH: "构建中", AR: "قيد البناء" },
  railFrozen: {
    EN: "frozen — challenge in progress",
    ES: "congelado — desafío en curso",
    ZH: "已冻结 — 挑战进行中",
    AR: "مُجمَّد — التحدي جارٍ",
  },
  railRevealed: { EN: "revealed", ES: "revelado", ZH: "已揭示", AR: "مكشوف" },

  // ── Coach ────────────────────────────────────────────────────────────
  yourWords: {
    EN: "Your words · bound verbatim",
    ES: "Tus palabras · citadas literalmente",
    ZH: "你的原话 · 逐字绑定",
    AR: "كلماتك · موثّقة حرفيًا",
  },
  simulatedArtifact: {
    EN: "Simulated artifact",
    ES: "Material simulado",
    ZH: "模拟素材",
    AR: "مادة محاكاة",
  },
  coachOpener: {
    EN: "Okay. That was me. Two things happened in that conversation.",
    ES: "Vale. Ese era yo. En esa conversación pasaron dos cosas.",
    ZH: "好了，刚才那个人是我。在那段对话里发生了两件事。",
    AR: "حسنًا. ذلك كنت أنا. حدث أمران في تلك المحادثة.",
  },
  coachHandoff: {
    EN: "Let's try that again — different situation, same question. Nothing about it will look like the last one.",
    ES: "Probemos otra vez: situación distinta, misma pregunta. No se parecerá en nada a la anterior.",
    ZH: "我们再来一次——换一个情境，同一个问题。它和上一个不会有任何相似之处。",
    AR: "لنجرّب مرة أخرى — موقف مختلف والسؤال نفسه. لن يشبه الموقف السابق في شيء.",
  },
  exitAck: {
    EN: "That's the simulation ended. Nothing in it was real, and nothing you said in it is held against you. Your progress is kept.",
    ES: "La simulación ha terminado. Nada de lo que había era real, y nada de lo que dijiste se usa en tu contra. Tu progreso se conserva.",
    ZH: "模拟结束了。里面的一切都不是真的，你在其中说过的话不会被用来评判你。你的进度已保留。",
    AR: "انتهت المحاكاة. لم يكن فيها شيء حقيقي، ولن يُستخدم أي شيء قلته ضدك. تم حفظ تقدّمك.",
  },
  ackWords: {
    EN: ["Understood.", "Right.", "Okay, noted.", "Got it."],
    ES: ["Entendido.", "Ya veo.", "Vale, lo anoto.", "De acuerdo."],
    ZH: ["明白了。", "好。", "好的，我记下了。", "了解。"],
    AR: ["فهمت.", "حسنًا.", "تمام، دوّنتها.", "واضح."],
  },
  understandOpener: {
    EN: "So. Tell me about the investment you're looking at. Take your time — I'm not going to interrupt you.",
    ES: "Bien. Háblame de la inversión que estás considerando. Tómate tu tiempo, no voy a interrumpirte.",
    ZH: "好，跟我说说你正在考虑的这笔投资。慢慢来，我不会打断你。",
    AR: "حسنًا. حدّثني عن الاستثمار الذي تفكّر فيه. خذ وقتك، لن أقاطعك.",
  },
  understandClose: {
    EN: "Alright. I've got the shape of it.",
    ES: "De acuerdo. Ya me hago una idea.",
    ZH: "好，大致情况我清楚了。",
    AR: "حسنًا. صار لديّ تصوّر عن الأمر.",
  },
  narrativeRehearsed: {
    EN: "Someone messaged me on WhatsApp about an AI trading system. It's returning about fifteen percent a month, and there was a video of a founder I recognised backing it. Their website says they're regulated. I was going to put in ten thousand.",
    ES: "Alguien me escribió por WhatsApp sobre un sistema de trading con IA. Da como un quince por ciento mensual, y había un vídeo de un fundador que reconocí respaldándolo. Su web dice que están regulados. Iba a meter diez mil.",
    ZH: "有人在 WhatsApp 上联系我，说有个 AI 交易系统，每月回报大概百分之十五，还有一段我认得的创始人为它背书的视频。他们网站上说自己受监管。我本来打算投一万。",
    AR: "راسلني أحدهم على واتساب عن نظام تداول بالذكاء الاصطناعي. عائده نحو خمسة عشر بالمئة شهريًا، وكان هناك مقطع فيديو لمؤسس أعرفه يدعمه. موقعهم يقول إنهم مرخّصون. كنت أنوي استثمار عشرة آلاف.",
  },
  stressHandoff: {
    EN: "Good. Now — I want you to talk to someone. I'm going to step out for a moment.",
    ES: "Bien. Ahora quiero que hables con alguien. Me aparto un momento.",
    ZH: "很好。现在，我想让你和一个人谈谈。我先离开一下。",
    AR: "جيد. الآن أريدك أن تتحدث مع شخص ما. سأنسحب للحظة.",
  },

  // ── Scorecard ────────────────────────────────────────────────────────
  recordSealed: {
    EN: "Investor Readiness Record · sealed",
    ES: "Registro de Preparación del Inversor · sellado",
    ZH: "投资者准备度记录 · 已封存",
    AR: "سجل جاهزية المستثمر · مختوم",
  },
  evidenceChain: { EN: "Evidence chain", ES: "Cadena de evidencia", ZH: "证据链", AR: "سلسلة الأدلة" },
  colElement: { EN: "Element", ES: "Elemento", ZH: "要素", AR: "العنصر" },
  colBase: { EN: "Base", ES: "Base", ZH: "基线", AR: "الأساس" },
  colPress: { EN: "Press", ES: "Presión", ZH: "受压", AR: "الضغط" },
  colCoach: { EN: "Coach", ES: "Coaching", ZH: "指导后", AR: "بعد التدريب" },
  colNovel: { EN: "Novel", ES: "Nuevo", ZH: "新情境", AR: "سيناريو جديد" },
  boundEvidence: { EN: "Bound evidence", ES: "Evidencia vinculada", ZH: "绑定证据", AR: "الدليل الموثّق" },
  elicitedBy: { EN: "elicited by", ES: "obtenida mediante", ZH: "由以下问题触发：", AR: "استُخلص عبر" },
  failureSignatures: {
    EN: "Failure signatures",
    ES: "Firmas de fallo",
    ZH: "失效特征",
    AR: "أنماط الإخفاق",
  },
  boundTo: { EN: "Bound to", ES: "Vinculada a", ZH: "绑定于", AR: "مرتبط بـ" },
  ruleFooter: {
    EN: "within-session transfer only · durable transfer not claimed",
    ES: "solo transferencia intrasesión · no se afirma transferencia duradera",
    ZH: "仅限单次会话内迁移 · 未主张持久性行为改变",
    AR: "الانتقال ضمن الجلسة فقط · لا يُدّعى انتقال دائم",
  },
  certifyBtn: {
    EN: "Verify my identity and certify this record",
    ES: "Verificar mi identidad y certificar este registro",
    ZH: "验证我的身份并认证此记录",
    AR: "تحقّق من هويتي واعتمد هذا السجل",
  },
  certifiedNotice: {
    EN: "This record is certified. Certificate",
    ES: "Este registro está certificado. Certificado",
    ZH: "此记录已认证。证书编号",
    AR: "هذا السجل معتمد. الشهادة",
  },
  againBtn: {
    EN: "Rehearse your next weakness",
    ES: "Ensaya tu siguiente punto débil",
    ZH: "演练你的下一个弱点",
    AR: "تدرّب على نقطة ضعفك التالية",
  },
  modesBtn: {
    EN: "See what else AUREN does",
    ES: "Ver qué más hace AUREN",
    ZH: "看看 AUREN 还能做什么",
    AR: "اطّلع على ما يقدّمه AUREN أيضًا",
  },

  // ── Verdict ──────────────────────────────────────────────────────────
  verdictPassHead: {
    EN: "You made the same mistake twice. After we named it, you didn't make it again.",
    ES: "Cometiste el mismo error dos veces. Después de ponerle nombre, no volviste a cometerlo.",
    ZH: "同一个错误你犯了两次。在我们把它命名之后，你没有再犯。",
    AR: "ارتكبت الخطأ نفسه مرتين. وبعد أن سمّيناه، لم تكرّره.",
  },
  verdictPassSub: {
    EN: "That is the whole claim: not that you know the rule, but that you behaved differently when a completely different scam asked you the same question.",
    ES: "Esa es toda la afirmación: no que conozcas la regla, sino que actuaste distinto cuando una estafa completamente diferente te hizo la misma pregunta.",
    ZH: "这就是全部主张：重点不是你知道规则，而是当一个完全不同的骗局问你同样的问题时，你的行为改变了。",
    AR: "هذا هو الادعاء كله: ليس أنك تعرف القاعدة، بل أنك تصرّفت بشكل مختلف حين طرح عليك احتيال مختلف تمامًا السؤال نفسه.",
  },
  verdictFailHead: {
    EN: "You haven't transferred it yet — and that's exactly what we rehearse next.",
    ES: "Todavía no lo has transferido — y eso es justo lo que ensayaremos a continuación.",
    ZH: "你还没有把它迁移过来——而这正是我们接下来要演练的。",
    AR: "لم تنقله بعد — وهذا تحديدًا ما سنتدرّب عليه تاليًا.",
  },
  verdictFailSub: {
    EN: "You were coached on independent verification and the new scenario still got past it. That is honest evidence, and it is more useful to you than a pass would have been.",
    ES: "Recibiste orientación sobre verificación independiente y aun así el nuevo escenario la sorteó. Esa es evidencia honesta, y te sirve más que un aprobado.",
    ZH: "你已经接受过独立核实的指导，新情境仍然绕过了它。这是诚实的证据，对你的价值大于一个「通过」。",
    AR: "تلقّيت توجيهًا بشأن التحقق المستقل، ومع ذلك تجاوزه السيناريو الجديد. هذا دليل صادق، وهو أنفع لك من نتيجة ناجحة.",
  },

  // ── Modes ────────────────────────────────────────────────────────────
  modesKicker: {
    EN: "Now that the words mean something",
    ES: "Ahora que las palabras significan algo",
    ZH: "现在这些词有了意义",
    AR: "الآن وقد صارت الكلمات ذات معنى",
  },
  modesTitle: {
    EN: "Three ways to use AUREN.",
    ES: "Tres formas de usar AUREN.",
    ZH: "使用 AUREN 的三种方式。",
    AR: "ثلاث طرق لاستخدام AUREN.",
  },
  modesSub: {
    EN: "You just did the middle one. This screen is deliberately not where you started — a mode menu means nothing until you have been through the loop once.",
    ES: "Acabas de hacer la del medio. Esta pantalla no es, deliberadamente, donde empezaste: un menú de modos no significa nada hasta que has recorrido el ciclo una vez.",
    ZH: "你刚刚完成的是中间那一种。这个页面被刻意安排在起点之后——在你完整走过一遍之前，模式菜单毫无意义。",
    AR: "لقد أنجزت للتو الطريقة الوسطى. هذه الشاشة ليست نقطة البداية عن قصد — قائمة الأوضاع لا تعني شيئًا قبل أن تخوض الدورة مرة واحدة.",
  },
  modeRehearse: { EN: "Rehearse", ES: "Ensayar", ZH: "演练", AR: "التدريب" },
  modeRehearseDesc: {
    EN: "Pressure rehearsal against a scam you have not seen. Assessment by doing — the loop you just completed.",
    ES: "Ensayo bajo presión frente a una estafa que no has visto. Evaluación haciendo: el ciclo que acabas de completar.",
    ZH: "面对你未见过的骗局进行压力演练。以实践进行评估——正是你刚刚完成的流程。",
    AR: "تدريب تحت الضغط أمام احتيال لم تره من قبل. تقييم بالممارسة — الدورة التي أنهيتها للتو.",
  },
  modeLearn: { EN: "Learn", ES: "Aprender", ZH: "学习", AR: "التعلّم" },
  modeLearnDesc: {
    EN: "Adaptive investor and AI literacy, paced to what your reasoning map says you are missing. No quizzes.",
    ES: "Alfabetización adaptativa en inversión e IA, al ritmo de lo que tu mapa de razonamiento dice que te falta. Sin cuestionarios.",
    ZH: "自适应的投资与 AI 素养学习，按你的推理图谱所显示的缺口来安排节奏。没有测验。",
    AR: "تعلّم تكيّفي في الاستثمار والذكاء الاصطناعي، بوتيرة تحدّدها الفجوات في خريطة تفكيرك. بلا اختبارات.",
  },
  modeProtect: { EN: "Protect", ES: "Proteger", ZH: "保护", AR: "الحماية" },
  modeProtectDesc: {
    EN: "A real situation, assessed now. AUREN never tells you whether something is a scam — it tells you what you have not verified.",
    ES: "Una situación real, evaluada ahora. AUREN nunca te dice si algo es una estafa: te dice qué no has verificado.",
    ZH: "对真实情况的即时评估。AUREN 绝不告诉你某件事是不是骗局——它只告诉你哪些你还没核实。",
    AR: "حالة حقيقية تُقيَّم الآن. لا يخبرك AUREN إن كان الأمر احتيالًا — بل يخبرك بما لم تتحقق منه بعد.",
  },
  backToRecord: { EN: "Back to my record", ES: "Volver a mi registro", ZH: "返回我的记录", AR: "العودة إلى سجلي" },
  back: { EN: "Back", ES: "Volver", ZH: "返回", AR: "رجوع" },

  // ── Protect ──────────────────────────────────────────────────────────
  protectKicker: {
    EN: "Protect · a real situation",
    ES: "Protección · una situación real",
    ZH: "保护 · 真实情况",
    AR: "الحماية · حالة حقيقية",
  },
  protectTitle: {
    EN: "Tell me what is in front of you right now.",
    ES: "Cuéntame qué tienes delante ahora mismo.",
    ZH: "告诉我你现在面前的情况。",
    AR: "أخبرني بما بين يديك الآن.",
  },
  protectSub: {
    EN: "I will not tell you whether this is a scam. I will tell you what has not been verified, and what to do before you decide.",
    ES: "No te diré si esto es una estafa. Te diré qué no se ha verificado y qué hacer antes de decidir.",
    ZH: "我不会告诉你这是不是骗局。我会告诉你哪些还没核实，以及在你做决定前该做什么。",
    AR: "لن أخبرك إن كان هذا احتيالًا. سأخبرك بما لم يُتحقق منه، وبما ينبغي فعله قبل أن تقرّر.",
  },
  protectSpoken: {
    EN: "Five things in what you've described haven't been verified. Before you move any money, here's what I'd do.",
    ES: "Hay cinco cosas de lo que has descrito que no están verificadas. Antes de mover dinero, esto es lo que yo haría.",
    ZH: "在你描述的情况中，有五项还没有核实。在你动用任何资金之前，我建议这样做。",
    AR: "خمسة أمور مما وصفته لم يجرِ التحقق منها. قبل أن تحوّل أي مبلغ، إليك ما كنت سأفعله.",
  },
  unresolvedMarkers: {
    EN: "Unresolved markers",
    ES: "Indicadores sin resolver",
    ZH: "未排除的风险标记",
    AR: "مؤشرات لم تُحسم",
  },
  whatToDo: { EN: "What to do", ES: "Qué hacer", ZH: "该怎么做", AR: "ما ينبغي فعله" },
  stopTitle: { EN: "Stop", ES: "Detente", ZH: "停", AR: "توقّف" },
  verifyTitle: { EN: "Verify", ES: "Verifica", ZH: "核实", AR: "تحقّق" },
  decideTitle: { EN: "Decide", ES: "Decide", ZH: "决定", AR: "قرّر" },
  stopBody: {
    EN: "Do not transfer funds while verification is incomplete. Five high-risk markers in this situation are unresolved.",
    ES: "No transfieras fondos mientras la verificación esté incompleta. Cinco indicadores de alto riesgo siguen sin resolverse.",
    ZH: "在核实完成之前，不要转账。此情况中有五项高风险标记尚未排除。",
    AR: "لا تحوّل أي أموال ما دام التحقق غير مكتمل. خمسة مؤشرات عالية الخطورة في هذه الحالة لم تُحسم بعد.",
  },
  decideBody: {
    EN: "Return to your decision only after the identity, the entity and the claims have been independently verified. The decision is yours — I do not make it and I do not rate it.",
    ES: "Vuelve a tu decisión solo cuando la identidad, la entidad y las afirmaciones se hayan verificado de forma independiente. La decisión es tuya: yo no la tomo ni la califico.",
    ZH: "只有在身份、机构与各项说法都经过独立核实之后，再回到你的决定。决定权在你——我不替你决定，也不为它打分。",
    AR: "عد إلى قرارك فقط بعد التحقق باستقلالية من الهوية والكيان والادعاءات. القرار قرارك — لا أتخذه عنك ولا أقيّمه.",
  },

  // ── Verified certification ───────────────────────────────────────────
  verifyKicker: {
    EN: "Verified certification",
    ES: "Certificación verificada",
    ZH: "实名认证",
    AR: "اعتماد موثّق",
  },
  verifyTitleHead: {
    EN: "Make this record provable.",
    ES: "Haz que este registro sea demostrable.",
    ZH: "让这份记录可被证明。",
    AR: "اجعل هذا السجل قابلًا للإثبات.",
  },
  verifySub: {
    EN: "Your rehearsal already stands on its own. Certification ties it to a verified identity so an employer, a regulator or an institution can rely on it. It is optional, and nothing you have done is lost if you stop here.",
    ES: "Tu ensayo ya se sostiene por sí solo. La certificación lo vincula a una identidad verificada para que un empleador, un regulador o una institución puedan apoyarse en él. Es opcional, y no pierdes nada de lo hecho si lo dejas aquí.",
    ZH: "你的演练本身已经成立。认证只是把它与一个已验证的身份绑定，让雇主、监管机构或金融机构可以据此采信。这是可选的，你现在停下也不会失去任何已完成的内容。",
    AR: "تدريبك قائم بذاته أصلًا. الاعتماد يربطه بهوية موثّقة كي يتمكّن صاحب عمل أو جهة رقابية أو مؤسسة من الاعتماد عليه. وهو اختياري، ولن تفقد شيئًا مما أنجزته إن توقفت هنا.",
  },
  vStep1: { EN: "Confirm your details", ES: "Confirma tus datos", ZH: "确认你的资料", AR: "أكّد بياناتك" },
  vStep1d: {
    EN: "Name and date of birth, as they appear on your document.",
    ES: "Nombre y fecha de nacimiento, tal como aparecen en tu documento.",
    ZH: "姓名与出生日期，须与证件上一致。",
    AR: "الاسم وتاريخ الميلاد كما يظهران في وثيقتك.",
  },
  vStep2: { EN: "Scan your document", ES: "Escanea tu documento", ZH: "扫描你的证件", AR: "امسح وثيقتك ضوئيًا" },
  vStep2d: {
    EN: "Passport or national ID. Captured once, checked, and not retained by AUREN.",
    ES: "Pasaporte o DNI. Se captura una vez, se comprueba y AUREN no lo conserva.",
    ZH: "护照或身份证。仅采集一次，核验后 AUREN 不予留存。",
    AR: "جواز سفر أو بطاقة هوية وطنية. يُلتقط مرة واحدة ويُفحص، ولا يحتفظ به AUREN.",
  },
  vStep3: { EN: "Liveness check", ES: "Prueba de vida", ZH: "活体检测", AR: "التحقق من الحضور الحي" },
  vStep3d: {
    EN: "A short camera check that the person holding the document is you.",
    ES: "Una breve comprobación con cámara de que quien sostiene el documento eres tú.",
    ZH: "通过摄像头做一次简短确认：持证件的人就是你本人。",
    AR: "فحص قصير بالكاميرا للتأكد من أن حامل الوثيقة هو أنت.",
  },
  vStep4: { EN: "Issue certificate", ES: "Emitir el certificado", ZH: "签发证书", AR: "إصدار الشهادة" },
  vStep4d: {
    EN: "Your Investor Readiness Record is sealed against a verified identity.",
    ES: "Tu Registro de Preparación del Inversor queda sellado contra una identidad verificada.",
    ZH: "你的投资者准备度记录将与已验证身份一同封存。",
    AR: "يُختم سجل جاهزية المستثمر الخاص بك مقابل هوية موثّقة.",
  },
  legalName: { EN: "Full legal name", ES: "Nombre legal completo", ZH: "法定全名", AR: "الاسم القانوني الكامل" },
  dob: { EN: "Date of birth", ES: "Fecha de nacimiento", ZH: "出生日期", AR: "تاريخ الميلاد" },
  scanDocPrompt: {
    EN: "Position your passport or ID inside the frame.",
    ES: "Coloca tu pasaporte o DNI dentro del marco.",
    ZH: "请将护照或身份证放入取景框内。",
    AR: "ضع جواز سفرك أو بطاقتك داخل الإطار.",
  },
  scanDocNote: {
    EN: "Simulated capture — no document is read",
    ES: "Captura simulada — no se lee ningún documento",
    ZH: "模拟采集 — 不会读取任何证件",
    AR: "التقاط محاكى — لا تُقرأ أي وثيقة",
  },
  livenessPrompt: {
    EN: "Look at the camera and turn your head slowly to the left.",
    ES: "Mira a la cámara y gira la cabeza despacio hacia la izquierda.",
    ZH: "请注视摄像头，然后缓慢向左转头。",
    AR: "انظر إلى الكاميرا وأدر رأسك ببطء إلى اليسار.",
  },
  livenessNote: {
    EN: "Simulated liveness — no camera is opened",
    ES: "Prueba de vida simulada — no se abre la cámara",
    ZH: "模拟活体检测 — 不会开启摄像头",
    AR: "تحقّق محاكى — لا تُفتح الكاميرا",
  },
  sealingNotice: {
    EN: "Identity confirmed. Sealing your Investor Readiness Record against it now.",
    ES: "Identidad confirmada. Sellando ahora tu Registro de Preparación del Inversor contra ella.",
    ZH: "身份已确认。正在将你的投资者准备度记录与之封存。",
    AR: "تم تأكيد الهوية. يجري الآن ختم سجل جاهزية المستثمر الخاص بك مقابلها.",
  },
  continueBtn: { EN: "Continue", ES: "Continuar", ZH: "继续", AR: "متابعة" },
  issueBtn: { EN: "Issue my certificate", ES: "Emitir mi certificado", ZH: "签发我的证书", AR: "أصدر شهادتي" },
  notNow: { EN: "Not now — back to my record", ES: "Ahora no — volver a mi registro", ZH: "暂不 — 返回我的记录", AR: "ليس الآن — العودة إلى سجلي" },

  certifiedKicker: { EN: "Certified", ES: "Certificado", ZH: "已认证", AR: "معتمد" },
  certifiedTitle: {
    EN: "Your record is now provable.",
    ES: "Tu registro ya es demostrable.",
    ZH: "你的记录现在可被证明。",
    AR: "صار سجلك قابلًا للإثبات.",
  },
  certifiedSub: {
    EN: "The evidence chain has not changed — certification does not improve your result, it only binds it to a verified identity. That distinction is the point.",
    ES: "La cadena de evidencia no ha cambiado: la certificación no mejora tu resultado, solo lo vincula a una identidad verificada. Esa distinción es lo importante.",
    ZH: "证据链没有改变——认证不会提升你的成绩，只是把它与一个已验证的身份绑定。这个区分正是关键。",
    AR: "لم تتغيّر سلسلة الأدلة — الاعتماد لا يحسّن نتيجتك، بل يربطها فقط بهوية موثّقة. وهذا التمييز هو بيت القصيد.",
  },
  certLabel: {
    EN: "Investor Readiness Certificate",
    ES: "Certificado de Preparación del Inversor",
    ZH: "投资者准备度证书",
    AR: "شهادة جاهزية المستثمر",
  },
  certIssued: { EN: "Issued", ES: "Emitido", ZH: "签发日期", AR: "تاريخ الإصدار" },
  certIdentity: { EN: "Identity", ES: "Identidad", ZH: "身份", AR: "الهوية" },
  certIdentityValue: {
    EN: "Verified — document + liveness",
    ES: "Verificada — documento + prueba de vida",
    ZH: "已验证 — 证件 + 活体",
    AR: "موثّقة — وثيقة + حضور حي",
  },
  certElements: { EN: "Elements evidenced", ES: "Elementos evidenciados", ZH: "已取证要素", AR: "العناصر الموثّقة" },
  certTransfer: { EN: "Transfer", ES: "Transferencia", ZH: "迁移", AR: "الانتقال" },
  certDemonstrated: { EN: "Demonstrated", ES: "Demostrada", ZH: "已证实", AR: "مُثبت" },
  certNotYet: { EN: "Not yet", ES: "Todavía no", ZH: "尚未", AR: "ليس بعد" },
  certScope: { EN: "Scope", ES: "Alcance", ZH: "范围", AR: "النطاق" },
  certScopeValue: { EN: "Within-session", ES: "Intrasesión", ZH: "单次会话内", AR: "ضمن الجلسة" },
  certRule: { EN: "Rule", ES: "Regla", ZH: "规则", AR: "القاعدة" },
  certDisclaimer: {
    EN: "The certificate attests to a rehearsal, not to investment competence, and it makes no claim about durable behaviour change. AUREN does not share it with anyone — you do.",
    ES: "El certificado acredita un ensayo, no competencia inversora, y no afirma nada sobre un cambio de conducta duradero. AUREN no lo comparte con nadie: lo compartes tú.",
    ZH: "本证书证明的是一次演练，而非投资能力，且不对持久的行为改变作出任何主张。AUREN 不会将它分享给任何人——分享与否由你决定。",
    AR: "تشهد الشهادة على تدريب، لا على كفاءة استثمارية، ولا تدّعي أي تغيّر سلوكي دائم. لا يشارك AUREN الشهادة مع أحد — أنت من يفعل.",
  },
} as const satisfies Record<string, Localized | Record<Lang, string[]>>;

export type UiKey = keyof typeof UI;

/** Resolve a UI string. */
export function ui(key: UiKey, lang: Lang): string {
  const entry = UI[key] as Localized;
  return entry[lang] || entry.EN;
}
