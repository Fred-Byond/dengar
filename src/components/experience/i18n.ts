export type UiLang = "ms" | "en";

export type I18nStrings = {
  demoTag: string;
  minRole: string;
  heroA: string;
  heroB: string;
  heroC: string;
  lead: string;
  st1: string;
  st1s: string;
  st2: string;
  st2s: string;
  st3: string;
  st3s: string;
  cta: string;
  pdpa: string;
  step1: string;
  step2: string;
  step3: string;
  slotTitle: string;
  slotSub: string;
  dateLbl: string;
  timeLbl: string;
  lockNote: string;
  continue: string;
  fullyBooked: string;
  regTitle: string;
  regSub: string;
  fName: string;
  fPhone: string;
  fEmail: string;
  fState: string;
  fDistrict: string;
  fLang: string;
  fTopic: string;
  optional: string;
  namePh: string;
  phonePh: string;
  chooseState: string;
  chooseDistrict: string;
  chooseStateFirst: string;
  chooseTopic: string;
  topics: string[];
  consent: string;
  verify: string;
  vName: string;
  vPhone: string;
  vGeo: string;
  vConsent: string;
  otpTitle: string;
  otpSub: string;
  demoCode: string;
  tapFill: string;
  confirmBk: string;
  bookedTitle: string;
  bookedSub: string;
  refLbl: string;
  dDate: string;
  dTime: string;
  dLang: string;
  dFrom: string;
  addCal: string;
  calAlert: string;
  demoJump: string;
  waFrom: string;
  waBody: (n: string, t: string, r: string) => string;
  waJoin: string;
  waValid: string;
  lobbyIn: string;
  lobbyDemo: string;
  enterSession: string;
  ready: string;
  linkOk: string;
  micLbl2: string;
  allow: string;
  langLbl2: string;
  micBlocked: string;
  micNA: string;
  etiquette: string;
  minName: string;
  tapSpeak: string;
  listening: string;
  micFallback: string;
  txtPh: string;
  send: string;
  langsTitle: string;
  doneTitle: string;
  doneThanks: string;
  doneSub: string;
  yourRef: string;
  rateQ: string;
  summaryLbl: string;
  counterPre: string;
  counterPost: string;
  slogan: string;
  sumWith: (topic: string, place: string, quote: string) => string;
  sumTopic: (topic: string, place: string) => string;
  sumGeneric: (place: string) => string;
  topicGeneral: string;
  shareQuote: string;
  share: string;
  shareAlert: string;
  restart: string;
  locale: string;
};

export const I18N: Record<UiLang, I18nStrings> = {
  ms: {
    demoTag: "DEMO PROTOTAIP",
    minRole: "Menteri Dalam Negeri, Malaysia",
    heroA: "Suara anda, ",
    heroB: "didengar",
    heroC: " Menteri",
    lead: "Tempah sesi peribadi 5 minit bersama insan digital Menteri. Kongsi pandangan anda tentang kerajaan, apa yang boleh diperbaiki, dan cadangan anda.",
    st1: "1 · Tempah",
    st1s: "Pilih slot masa",
    st2: "2 · Bercakap",
    st2s: "Bercakap selama 5 minit",
    st3: "3 · Didengar",
    st3s: "Maklum balas anda direkodkan",
    cta: "Bercakap dengan Menteri",
    pdpa: "Sesi anda dirakam untuk semakan Kementerian. Data peribadi dilindungi di bawah PDPA 2010. Pengalaman ini adalah perwakilan AI Menteri.",
    step1: "Langkah 1 dari 3",
    step2: "Langkah 2 dari 3",
    step3: "Langkah 3 dari 3",
    slotTitle: "Pilih sesi anda",
    slotSub: "Setiap sesi 5 minit bersama Menteri.",
    dateLbl: "Tarikh",
    timeLbl: "Masa",
    lockNote: "Slot anda dipegang selama 5 minit semasa anda mendaftar.",
    continue: "Teruskan",
    fullyBooked: "Penuh",
    regTitle: "Butiran anda",
    regSub: "Kurang dari 60 saat. Kami gunakan ini untuk menyapa anda dan menghantar pautan sesi.",
    fName: "Nama penuh",
    fPhone: "Nombor telefon bimbit",
    fEmail: "E-mel",
    fState: "Negeri",
    fDistrict: "Daerah",
    fLang: "Bahasa sesi",
    fTopic: "Topik",
    optional: "(pilihan)",
    namePh: "cth. Ahmad bin Ismail",
    phonePh: "cth. 012-345 6789",
    chooseState: "— Pilih negeri —",
    chooseDistrict: "— Pilih daerah —",
    chooseStateFirst: "— Pilih negeri dahulu —",
    chooseTopic: "— Pilih topik —",
    topics: [
      "Kepolisan & keselamatan komuniti",
      "Imigresen & sempadan",
      "MyKad & pendaftaran",
      "Penipuan & jenayah siber",
      "Pekerja asing",
      "Maklum balas umum",
      "Lain-lain",
    ],
    consent:
      "Saya bersetuju sesi saya dirakam dan dianalisis untuk semakan Kementerian, selaras dengan PDPA 2010.",
    verify: "Sahkan nombor saya",
    vName: "Sila masukkan nama penuh anda.",
    vPhone: "Sila masukkan nombor telefon bimbit anda.",
    vGeo: "Sila pilih negeri dan daerah anda.",
    vConsent: "Sila tandakan persetujuan PDPA untuk meneruskan.",
    otpTitle: "Masukkan kod",
    otpSub: "Kami hantar kod 6 digit melalui SMS ke",
    demoCode: "Kod demo:",
    tapFill: "tekan untuk isi",
    confirmBk: "Sahkan tempahan",
    bookedTitle: "Tempahan berjaya!",
    bookedSub: "Pengesahan telah dihantar ke WhatsApp anda.",
    refLbl: "RUJUKAN SESI",
    dDate: "Tarikh",
    dTime: "Masa",
    dLang: "Bahasa",
    dFrom: "Dari",
    addCal: "＋ Tambah ke kalendar",
    calAlert: "Demo: fail kalendar (.ics) akan dimuat turun di sini.",
    demoJump: "Demo: langkau ke 15 minit sebelum sesi ⏩",
    waFrom: "Kementerian Dalam Negeri",
    waBody: (n, t, r) =>
      `Salam <b>${n}</b> 👋<br><br>Sesi anda bersama <b>Menteri Saifuddin Nasution</b> bermula dalam <b>15 minit</b> (${t}).<br><br>Rujukan: <b>${r}</b><br>Tekan di bawah apabila anda bersedia.`,
    waJoin: "Sertai sesi anda",
    waValid:
      "Pautan sah dari 15 minit sebelum hingga 10 minit selepas slot anda.",
    lobbyIn: "Sesi anda bermula dalam",
    lobbyDemo:
      "Demo: ketik butang di bawah untuk mula (audio perlu gestur anda)",
    enterSession: "Mula sesi — ketik untuk dengar",
    ready: "Menyediakan anda",
    linkOk: "Pautan sesi disahkan",
    micLbl2: "Mikrofon",
    allow: "Benarkan",
    langLbl2: "Bahasa",
    micBlocked: "Disekat — guna taipan",
    micNA: "Tiada — guna taipan",
    etiquette:
      "⏱ 5 minit · 💬 Kongsi pandangan & cadangan anda · 🔒 Dirakam untuk semakan Kementerian",
    minName: "Menteri Saifuddin",
    tapSpeak: "Tekan untuk bercakap",
    listening: "Mendengar… tekan untuk berhenti",
    micFallback: "Mikrofon tiada — taip di sini",
    txtPh: "Taip apa yang anda ingin sampaikan kepada Menteri…",
    send: "Hantar",
    langsTitle: "Bahasa",
    doneTitle: "Sesi selesai",
    doneThanks: "Terima kasih,",
    doneSub:
      "Maklum balas anda telah direkodkan dan akan disemak oleh Kementerian.",
    yourRef: "RUJUKAN ANDA",
    rateQ: "Bagaimana sesi anda?",
    summaryLbl: "Ringkasan sesi anda",
    counterPre: "Anda adalah rakyat ke-",
    counterPost:
      "yang menyuarakan pandangan kepada Menteri untuk menjadikan kerajaan lebih baik.",
    slogan: "Setiap Suara Bermakna",
    sumWith: (topic, place, quote) =>
      `Anda telah menyuarakan tentang <b>${topic}</b> di <b>${place}</b>. Anda berkongsi: “${quote}”. Menteri telah mengambil maklum perkara ini dan pasukan beliau akan menelitinya.`,
    sumTopic: (topic, place) =>
      `Anda telah berkongsi pandangan tentang <b>${topic}</b> di <b>${place}</b>. Menteri telah mengambil maklum perkara yang anda bangkitkan dan pasukan beliau akan menelitinya.`,
    sumGeneric: (place) =>
      `Anda telah berkongsi pandangan anda tentang kerajaan dari <b>${place}</b>. Menteri telah mengambil maklum perkara yang anda sampaikan dan pasukan beliau akan menelitinya.`,
    topicGeneral: "kerajaan",
    shareQuote: "“Saya bercakap dengan Menteri Dalam Negeri hari ini.”",
    share: "Kongsi",
    shareAlert: "Demo: kad kongsi akan dibuka di sini.",
    restart: "↺ Mula semula demo",
    locale: "ms-MY",
  },
  en: {
    demoTag: "DEMO PROTOTYPE",
    minRole: "Minister of Home Affairs, Malaysia",
    heroA: "Your voice, ",
    heroB: "heard",
    heroC: " by the Minister",
    lead: "Book a personal 5-minute session with the Minister's digital human. Share your views on the government, what we can improve, and your suggestions.",
    st1: "1 · Book",
    st1s: "Pick a time slot",
    st2: "2 · Talk",
    st2s: "Speak for 5 minutes",
    st3: "3 · Heard",
    st3s: "Your feedback is recorded",
    cta: "Talk to Minister",
    pdpa: "Your session is recorded for the Ministry's review. Personal data is protected under PDPA 2010. This experience is an AI representation of the Minister.",
    step1: "Step 1 of 3",
    step2: "Step 2 of 3",
    step3: "Step 3 of 3",
    slotTitle: "Choose your session",
    slotSub: "Each session is 5 minutes with the Minister.",
    dateLbl: "Date",
    timeLbl: "Time",
    lockNote: "Your slot is held for 5 minutes while you register.",
    continue: "Continue",
    fullyBooked: "Full",
    regTitle: "Your details",
    regSub: "Less than 60 seconds. We use this to greet you and send your session link.",
    fName: "Full name",
    fPhone: "Mobile number",
    fEmail: "Email",
    fState: "State",
    fDistrict: "District",
    fLang: "Session language",
    fTopic: "Topic",
    optional: "(optional)",
    namePh: "e.g. Ahmad bin Ismail",
    phonePh: "e.g. 012-345 6789",
    chooseState: "— Choose state —",
    chooseDistrict: "— Choose district —",
    chooseStateFirst: "— Choose state first —",
    chooseTopic: "— Choose a topic —",
    topics: [
      "Policing & community safety",
      "Immigration & borders",
      "MyKad & registration",
      "Scams & cybercrime",
      "Foreign workers",
      "General feedback",
      "Other",
    ],
    consent:
      "I consent to my session being recorded and analysed for the Ministry's review, in line with PDPA 2010.",
    verify: "Verify my number",
    vName: "Please enter your full name.",
    vPhone: "Please enter your mobile number.",
    vGeo: "Please choose your state and district.",
    vConsent: "Please tick the PDPA consent to continue.",
    otpTitle: "Enter the code",
    otpSub: "We sent a 6-digit code by SMS to",
    demoCode: "Demo code:",
    tapFill: "tap to autofill",
    confirmBk: "Confirm booking",
    bookedTitle: "You're booked!",
    bookedSub: "A confirmation has been sent to your WhatsApp.",
    refLbl: "SESSION REFERENCE",
    dDate: "Date",
    dTime: "Time",
    dLang: "Language",
    dFrom: "From",
    addCal: "＋ Add to calendar",
    calAlert: "Demo: calendar file (.ics) would download here.",
    demoJump: "Demo: jump to 15 min before session ⏩",
    waFrom: "Ministry of Home Affairs",
    waBody: (n, t, r) =>
      `Hello <b>${n}</b> 👋<br><br>Your session with <b>Minister Saifuddin Nasution</b> begins in <b>15 minutes</b> (${t}).<br><br>Ref: <b>${r}</b><br>Tap below when you are ready to join.`,
    waJoin: "Join your session",
    waValid:
      "Link is valid from 15 min before until 10 min after your slot.",
    lobbyIn: "Your session starts in",
    lobbyDemo:
      "Demo: tap the button below to start (audio needs your gesture)",
    enterSession: "Start session — tap to hear audio",
    ready: "Getting you ready",
    linkOk: "Session link verified",
    micLbl2: "Microphone",
    allow: "Allow",
    langLbl2: "Language",
    micBlocked: "Blocked — will use typing",
    micNA: "Not available — will use typing",
    etiquette:
      "⏱ 5 minutes · 💬 Share your views & suggestions · 🔒 Recorded for the Ministry's review",
    minName: "Minister Saifuddin",
    tapSpeak: "Tap to speak",
    listening: "Listening… tap to stop",
    micFallback: "Mic unavailable here — type instead",
    txtPh: "Type what you want to tell the Minister…",
    send: "Send",
    langsTitle: "Languages",
    doneTitle: "Session complete",
    doneThanks: "Thank you,",
    doneSub:
      "Your feedback has been recorded and will be reviewed by the Ministry.",
    yourRef: "YOUR REFERENCE",
    rateQ: "How was your session?",
    summaryLbl: "Summary of your session",
    counterPre: "You are the",
    counterPost:
      "citizen to voice your views to the Minister and help make the government better.",
    slogan: "Every Voice Matters",
    sumWith: (topic, place, quote) =>
      `You raised concerns about <b>${topic}</b> in <b>${place}</b>. You shared: “${quote}”. The Minister has noted this and his team will review it.`,
    sumTopic: (topic, place) =>
      `You shared your views on <b>${topic}</b> in <b>${place}</b>. The Minister has noted what you raised and his team will review it.`,
    sumGeneric: (place) =>
      `You shared your views on the government from <b>${place}</b>. The Minister has noted what you raised and his team will review it.`,
    topicGeneral: "the government",
    shareQuote: "“I spoke with the Home Minister today.”",
    share: "Share",
    shareAlert: "Demo: share card would open here.",
    restart: "↺ Restart demo",
    locale: "en-MY",
  },
};
