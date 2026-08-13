/**
 * Fan-interface copy. The UI ships in English and Spanish; the CONVERSATION
 * itself runs in any of the eleven launch languages (see ./langs).
 *
 * That split is deliberate and is the same one DENGAR uses: the interface
 * language is a preference, the conversation language is the product.
 */

export type UiLang = "en" | "es";

export type I18nStrings = {
  locale: string;
  demoTag: string;
  aiDisclosure: string;
  role: string;

  heroA: string;
  heroB: string;
  heroC: string;
  lead: string;
  /** One-line hero lead — the landing screen belongs to the digital human. */
  leadShort: string;
  returningCta: string;
  privacyShort: string;
  st1: string; st1s: string;
  st2: string; st2s: string;
  st3: string; st3s: string;
  cta: string;
  privacy: string;

  step1: string; step2: string; step3: string; step4: string;

  tierTitle: string; tierSub: string; tierFreeNote: string; tierPick: string; tierSelected: string;

  slotTitle: string; slotSub: string;
  dateLbl: string; timeLbl: string; lockNote: string; priorityNote: string;
  continue: string; fullyBooked: string;

  regTitle: string; regSub: string;
  fName: string; fPhone: string; fCountry: string; fRegion: string;
  fLang: string; fAge: string; fTheme: string; optional: string;
  namePh: string; phonePh: string;
  chooseCountry: string; chooseRegion: string; chooseCountryFirst: string;
  chooseTheme: string; themes: string[]; ageBands: { value: string; label: string }[];
  consentAI: string; consentMemory: string; guardianNote: string;
  verify: string;
  vName: string; vPhone: string; vGeo: string; vAge: string; vConsent: string;

  otpTitle: string; otpSub: string; demoCode: string; tapFill: string; confirmBk: string;

  bookedTitle: string; bookedSub: string; refLbl: string;
  dDate: string; dTime: string; dLang: string; dFrom: string; dTier: string;
  addCal: string; calAlert: string; demoJump: string;

  waFrom: string; waBody: (name: string, time: string, ref: string) => string;
  waJoin: string; waValid: string;

  lobbyIn: string; lobbyDemo: string; ready: string; linkOk: string;
  micLbl2: string; allow: string; micNA: string; micBlocked: string;
  langLbl2: string; etiquette: string; enterSession: string;

  sessName: string; tapSpeak: string; listening: string;
  micFallback: string; tapToHear: string; langsTitle: string;

  doneTitle: string; doneThanks: string; doneSub: string; yourRef: string;
  rateQ: string; summaryLbl: string;
  memoryLbl: string; memoryOn: (fact: string) => string; memoryOff: string;
  counterPre: string; counterPost: string;
  upsellTitle: string; upsellBody: string; upsellCta: string;
  shareQuote: string; share: string; shareAlert: string; slogan: string; restart: string;

  sumWith: (theme: string, place: string, quote: string) => string;
  sumTheme: (theme: string, place: string) => string;
  sumGeneric: (place: string) => string;
};

export const I18N: Record<UiLang, I18nStrings> = {
  en: {
    locale: "en-US",
    demoTag: "DEMO",
    aiDisclosure: "You are speaking with an official AI-powered digital representation of Lionel Messi.",
    role: "Officially authorised digital human",

    heroA: "Your ",
    heroB: "moment",
    heroC: " with Messi.",
    lead: "Five minutes. One to one. In your language. Book a time, and Lionel's officially authorised digital human will be there.",
    leadShort: "Five minutes. One to one. In your language.",
    returningCta: "I've spoken with him before",
    privacyShort: "Official AI digital human — not a live call. Conversations are private.",
    st1: "Choose a time", st1s: "Pick a slot that suits you",
    st2: "Speak with Messi", st2s: "Five minutes, your language",
    st3: "He remembers", st3s: "Pick up where you left off",
    cta: "Book my five minutes",
    privacy: "Official AI-powered digital representation of Lionel Messi. Conversations are private. Memory is optional and you can delete it at any time. Under-18 accounts require a parent or guardian.",

    step1: "Step 1 of 4 · Membership",
    step2: "Step 2 of 4 · Your time",
    step3: "Step 3 of 4 · About you",
    step4: "Step 4 of 4 · Verify",

    tierTitle: "Free to meet. Premium to build the relationship.",
    tierSub: "MESSI.LIVE is the platform. MESSI+ is the membership.",
    tierFreeNote: "In this market, free access is supported by the territory partner.",
    tierPick: "Choose",
    tierSelected: "Selected",

    slotTitle: "When would you like to meet?",
    slotSub: "Every conversation is exactly five minutes, one to one.",
    dateLbl: "Choose a day",
    timeLbl: "Choose a time",
    lockNote: "Your slot is held for 10 minutes while you complete the booking.",
    priorityNote: "MESSI+ members see priority slots first.",
    continue: "Continue",
    fullyBooked: "Full",

    regTitle: "Tell us who we're meeting",
    regSub: "We only ask for what the conversation needs.",
    fName: "Your name", fPhone: "Mobile number", fCountry: "Country", fRegion: "Region",
    fLang: "Conversation language", fAge: "Age group", fTheme: "What would you like to talk about?",
    optional: "(optional)",
    namePh: "The name Messi should call you",
    phonePh: "+00 000 000 0000",
    chooseCountry: "Choose your country", chooseRegion: "Choose your region",
    chooseCountryFirst: "Choose a country first",
    chooseTheme: "Let the conversation decide",
    themes: [
      "Football & training",
      "Motivation & resilience",
      "World Cup & career moments",
      "Family & childhood",
      "Academy & trials",
      "Wellbeing, injury & recovery",
      "Just to say thank you",
    ],
    ageBands: [
      { value: "under-13", label: "Under 13 (parent or guardian required)" },
      { value: "13-17", label: "13–17 (parent or guardian required)" },
      { value: "18-24", label: "18–24" },
      { value: "25-34", label: "25–34" },
      { value: "35+", label: "35+" },
    ],
    consentAI: "I understand this is an official AI-powered digital representation of Lionel Messi, not a live call.",
    consentMemory: "Remember our conversations so we can carry on next time. (Optional — you can delete this at any time.)",
    guardianNote: "A parent or guardian must complete this booking and stay present for the conversation.",
    verify: "Verify my number",
    vName: "Please tell us your name.",
    vPhone: "Please enter your mobile number.",
    vGeo: "Please choose your country and region.",
    vAge: "Please choose your age group.",
    vConsent: "Please confirm you understand this is an AI digital representation.",

    otpTitle: "Verify your number",
    otpSub: "We sent a six-digit code to",
    demoCode: "Demo code:",
    tapFill: "tap to fill",
    confirmBk: "Confirm my booking",

    bookedTitle: "You're booked.",
    bookedSub: "Messi will be ready at your time. We'll remind you an hour before.",
    refLbl: "Your reference",
    dDate: "Date", dTime: "Time", dLang: "Language", dFrom: "From", dTier: "Membership",
    addCal: "Add to calendar",
    calAlert: "Demo — calendar file would download here.",
    demoJump: "DEMO ⏩ Jump to reminder",

    waFrom: "MESSI.LIVE",
    waBody: (name, time, ref) =>
      `⚽ <b>${name}</b>, your five minutes with Messi start at <b>${time}</b>.<br/><br/>Find somewhere quiet, put your headphones in, and tap below when you're ready.<br/><br/>Reference: <b>${ref}</b>`,
    waJoin: "Join now →",
    waValid: "Your link opens 15 minutes before and closes 10 minutes after.",

    lobbyIn: "Messi is ready in",
    lobbyDemo: "Demo — shortened countdown",
    ready: "Before you go in",
    linkOk: "Connection ready",
    micLbl2: "Microphone",
    allow: "Allow",
    micNA: "Not available",
    micBlocked: "Blocked — enable in settings",
    langLbl2: "Conversation language",
    etiquette: "Speak normally, one person at a time. This is an AI-powered digital representation — it will never make promises on Lionel's behalf.",
    enterSession: "Enter the conversation",

    sessName: "MESSI",
    tapSpeak: "Tap to speak",
    listening: "Listening…",
    micFallback: "Mic unavailable — Messi keeps talking",
    tapToHear: "Tap to hear Messi",
    langsTitle: "Conversation language",

    doneTitle: "That was your moment.",
    doneThanks: "Thank you,",
    doneSub: "Five minutes, one to one. Your conversation stays private.",
    yourRef: "Your reference",
    rateQ: "How was it?",
    summaryLbl: "What Messi took from your conversation",
    memoryLbl: "What Messi will remember",
    memoryOn: (fact) => `“${fact}” — he'll ask you about it next time.`,
    memoryOff: "You chose not to be remembered. Nothing from this conversation is carried forward.",
    counterPre: "You are fan number",
    counterPost: "to have spoken with Messi on MESSI.LIVE.",
    upsellTitle: "Want to carry this on?",
    upsellBody: "MESSI+ members get more conversations, priority scheduling, relationship memory and the full Messi Stories library.",
    upsellCta: "See MESSI+",
    shareQuote: "I just spoke with Messi.",
    share: "Share my moment",
    shareAlert: "Demo — a shareable card would be generated here.",
    slogan: "One Messi. Every Fan. Every Language. Anywhere.",
    restart: "Start again",

    sumWith: (theme, place, quote) =>
      `You spoke with Messi about <b>${theme.toLowerCase()}</b> from <b>${place}</b>. In your words: <i>“${quote}”</i>`,
    sumTheme: (theme, place) =>
      `You spoke with Messi about <b>${theme.toLowerCase()}</b> from <b>${place}</b>.`,
    sumGeneric: (place) =>
      `You spoke with Messi from <b>${place}</b>. He has noted what matters to you.`,
  },

  es: {
    locale: "es-AR",
    demoTag: "DEMO",
    aiDisclosure: "Estás hablando con una representación digital oficial de Lionel Messi, impulsada por IA.",
    role: "Humano digital oficialmente autorizado",

    heroA: "Tu ",
    heroB: "momento",
    heroC: " con Messi.",
    lead: "Cinco minutos. Uno a uno. En tu idioma. Reservá un horario y el humano digital oficialmente autorizado de Leo estará ahí.",
    leadShort: "Cinco minutos. Uno a uno. En tu idioma.",
    returningCta: "Ya hablé con él antes",
    privacyShort: "Humano digital oficial con IA — no es una llamada en vivo. Las conversaciones son privadas.",
    st1: "Elegí un horario", st1s: "El que mejor te quede",
    st2: "Hablá con Messi", st2s: "Cinco minutos, en tu idioma",
    st3: "Él se acuerda", st3s: "Seguí donde lo dejaste",
    cta: "Reservar mis cinco minutos",
    privacy: "Representación digital oficial de Lionel Messi con IA. Las conversaciones son privadas. La memoria es opcional y podés borrarla cuando quieras. Las cuentas de menores de 18 requieren madre, padre o tutor.",

    step1: "Paso 1 de 4 · Membresía",
    step2: "Paso 2 de 4 · Tu horario",
    step3: "Paso 3 de 4 · Sobre vos",
    step4: "Paso 4 de 4 · Verificación",

    tierTitle: "Gratis para conocerlo. Premium para construir la relación.",
    tierSub: "MESSI.LIVE es la plataforma. MESSI+ es la membresía.",
    tierFreeNote: "En este mercado, el acceso gratuito está apoyado por el socio del territorio.",
    tierPick: "Elegir",
    tierSelected: "Elegido",

    slotTitle: "¿Cuándo querés encontrarte?",
    slotSub: "Cada conversación dura exactamente cinco minutos, uno a uno.",
    dateLbl: "Elegí un día",
    timeLbl: "Elegí un horario",
    lockNote: "Guardamos tu horario 10 minutos mientras completás la reserva.",
    priorityNote: "Los miembros MESSI+ ven primero los horarios prioritarios.",
    continue: "Continuar",
    fullyBooked: "Completo",

    regTitle: "Contanos a quién vamos a conocer",
    regSub: "Solo pedimos lo que la conversación necesita.",
    fName: "Tu nombre", fPhone: "Celular", fCountry: "País", fRegion: "Provincia o región",
    fLang: "Idioma de la conversación", fAge: "Grupo de edad", fTheme: "¿De qué te gustaría hablar?",
    optional: "(opcional)",
    namePh: "Cómo querés que Messi te llame",
    phonePh: "+00 000 000 0000",
    chooseCountry: "Elegí tu país", chooseRegion: "Elegí tu región",
    chooseCountryFirst: "Primero elegí un país",
    chooseTheme: "Que lo decida la conversación",
    themes: [
      "Fútbol y entrenamiento",
      "Motivación y resiliencia",
      "Mundial y momentos de carrera",
      "Familia e infancia",
      "Academia y pruebas",
      "Bienestar, lesiones y recuperación",
      "Solo para decir gracias",
    ],
    ageBands: [
      { value: "under-13", label: "Menos de 13 (requiere tutor)" },
      { value: "13-17", label: "13–17 (requiere tutor)" },
      { value: "18-24", label: "18–24" },
      { value: "25-34", label: "25–34" },
      { value: "35+", label: "35+" },
    ],
    consentAI: "Entiendo que esta es una representación digital oficial de Lionel Messi con IA, no una llamada en vivo.",
    consentMemory: "Recordá nuestras conversaciones para poder seguir la próxima vez. (Opcional — podés borrarlo cuando quieras.)",
    guardianNote: "Una madre, padre o tutor debe completar la reserva y estar presente durante la conversación.",
    verify: "Verificar mi número",
    vName: "Por favor, decinos tu nombre.",
    vPhone: "Por favor, ingresá tu celular.",
    vGeo: "Por favor, elegí tu país y tu región.",
    vAge: "Por favor, elegí tu grupo de edad.",
    vConsent: "Por favor, confirmá que entendés que es una representación digital con IA.",

    otpTitle: "Verificá tu número",
    otpSub: "Enviamos un código de seis dígitos a",
    demoCode: "Código demo:",
    tapFill: "tocá para completar",
    confirmBk: "Confirmar mi reserva",

    bookedTitle: "Listo, reservado.",
    bookedSub: "Messi estará listo a tu hora. Te recordamos una hora antes.",
    refLbl: "Tu referencia",
    dDate: "Fecha", dTime: "Hora", dLang: "Idioma", dFrom: "Desde", dTier: "Membresía",
    addCal: "Agregar al calendario",
    calAlert: "Demo — acá se descargaría el archivo de calendario.",
    demoJump: "DEMO ⏩ Ir al recordatorio",

    waFrom: "MESSI.LIVE",
    waBody: (name, time, ref) =>
      `⚽ <b>${name}</b>, tus cinco minutos con Messi empiezan a las <b>${time}</b>.<br/><br/>Buscá un lugar tranquilo, ponete los auriculares y tocá abajo cuando estés listo.<br/><br/>Referencia: <b>${ref}</b>`,
    waJoin: "Entrar ahora →",
    waValid: "Tu enlace abre 15 minutos antes y cierra 10 minutos después.",

    lobbyIn: "Messi está listo en",
    lobbyDemo: "Demo — cuenta regresiva acortada",
    ready: "Antes de entrar",
    linkOk: "Conexión lista",
    micLbl2: "Micrófono",
    allow: "Permitir",
    micNA: "No disponible",
    micBlocked: "Bloqueado — activalo en ajustes",
    langLbl2: "Idioma de la conversación",
    etiquette: "Hablá normal, de a una persona. Esta es una representación digital con IA: nunca hará promesas en nombre de Leo.",
    enterSession: "Entrar a la conversación",

    sessName: "MESSI",
    tapSpeak: "Tocá para hablar",
    listening: "Escuchando…",
    micFallback: "Micrófono no disponible — Messi sigue hablando",
    tapToHear: "Tocá para escuchar a Messi",
    langsTitle: "Idioma de la conversación",

    doneTitle: "Ese fue tu momento.",
    doneThanks: "Gracias,",
    doneSub: "Cinco minutos, uno a uno. Tu conversación es privada.",
    yourRef: "Tu referencia",
    rateQ: "¿Cómo estuvo?",
    summaryLbl: "Lo que Messi se llevó de tu conversación",
    memoryLbl: "Lo que Messi va a recordar",
    memoryOn: (fact) => `“${fact}” — te va a preguntar por eso la próxima vez.`,
    memoryOff: "Elegiste no ser recordado. Nada de esta conversación se guarda para la próxima.",
    counterPre: "Sos el hincha número",
    counterPost: "en hablar con Messi en MESSI.LIVE.",
    upsellTitle: "¿Querés seguir?",
    upsellBody: "Los miembros MESSI+ tienen más conversaciones, horarios prioritarios, memoria de la relación y toda la biblioteca de Messi Stories.",
    upsellCta: "Ver MESSI+",
    shareQuote: "Acabo de hablar con Messi.",
    share: "Compartir mi momento",
    shareAlert: "Demo — acá se generaría una tarjeta para compartir.",
    slogan: "Un Messi. Cada hincha. Cada idioma. En todas partes.",
    restart: "Empezar de nuevo",

    sumWith: (theme, place, quote) =>
      `Hablaste con Messi sobre <b>${theme.toLowerCase()}</b> desde <b>${place}</b>. En tus palabras: <i>“${quote}”</i>`,
    sumTheme: (theme, place) =>
      `Hablaste con Messi sobre <b>${theme.toLowerCase()}</b> desde <b>${place}</b>.`,
    sumGeneric: (place) =>
      `Hablaste con Messi desde <b>${place}</b>. Tomó nota de lo que te importa.`,
  },
};
