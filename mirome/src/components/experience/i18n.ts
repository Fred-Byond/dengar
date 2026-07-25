export type UiLang = "en" | "ms";

export type Copy = {
  locale: string;
  demoTag: string;

  // landing
  product: string;
  tagline: string;
  clientLine: string;
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
  minutes: string;
  privacyStrap: string;

  // consent
  step1: string;
  consentTitle: string;
  consentSub: string;
  consentPoints: string[];
  consentCheck: string;
  consentBtn: string;
  vConsent: string;

  // context
  step2: string;
  ctxTitle: string;
  ctxSub: string;
  fDept: string;
  fRole: string;
  fTenure: string;
  fArrangement: string;
  fManages: string;
  fLang: string;
  choose: string;
  yes: string;
  no: string;
  continueBtn: string;
  vContext: string;
  minimalNote: string;

  // pulse
  step3: string;
  pulseTitle: string;
  pulseSub: string;
  scale: [string, string, string, string, string];
  pulseOf: (a: number, b: number) => string;
  back: string;
  next: string;
  toInterview: string;

  // lobby
  lobbyIn: string;
  lobbyDemo: string;
  ready: string;
  linkOk: string;
  micLbl: string;
  allow: string;
  micNA: string;
  micBlocked: string;
  langLbl: string;
  etiquette: string;
  enterSession: string;

  // session
  interviewerName: string;
  listening: string;
  tapSpeak: string;
  tapToHear: string;
  micFallback: string;
  langsTitle: string;

  // reflection
  step4: string;
  reflectTitle: string;
  reflectSub: string;
  qStrength: string;
  qObstacle: string;
  qPriority: string;
  qAction: string;

  // confirm
  step5: string;
  confirmTitle: string;
  confirmSub: string;
  recordedLbl: string;
  correctBtn: string;
  confirmBtn: string;
  correctionPh: string;
  correctedNote: string;

  // done
  doneTitle: string;
  doneThanks: string;
  doneSub: string;
  whatNextLbl: string;
  whatNext: string[];
  refLbl: string;
  counterPre: string;
  counterPost: string;
  privacyNote: string;
  restart: string;
};

const EN: Copy = {
  locale: "en-MY",
  demoTag: "DEMO · SYNTHETIC DATA",

  product: "MIROME",
  tagline: "TEAM INTELLIGENCE",
  clientLine: "Meridian Group · Team Diagnosis 2026",
  heroA: "Fifteen minutes to say how ",
  heroB: "this team actually works",
  heroC: " — before anyone designs a workshop.",
  lead:
    "A confidential conversation with MIROME's digital interviewer. Your answers are combined with everyone else's to show where the team is strong and where it is stuck. No individual report goes to your manager.",
  st1: "Consent",
  st1s: "What is collected and who sees it",
  st2: "Interview",
  st2s: "15 minutes, your own words",
  st3: "Confirm",
  st3s: "You correct the summary",
  cta: "Start — 15 minutes",
  minutes: "15 min",
  privacyStrap:
    "Confidential · results reported at team level only · minimum group size of 5 · you may stop at any point.",

  step1: "STEP 1 OF 5",
  consentTitle: "Before we begin",
  consentSub:
    "This is a team diagnosis. It is not a performance review and it is not used for discipline, pay or promotion.",
  consentPoints: [
    "Your responses are stored against a reference number, not your name.",
    "Your manager and HR see team-level results only, never your individual answers.",
    "No group smaller than five people is ever displayed.",
    "A trained reviewer reads anything that raises a welfare or safety concern.",
    "You can skip any question, or stop the session, without giving a reason.",
    "Your data is retained for 24 months and then deleted.",
  ],
  consentCheck:
    "I have read the above and agree to take part on these terms.",
  consentBtn: "I agree — continue",
  vConsent: "Please confirm you agree before continuing.",

  step2: "STEP 2 OF 5",
  ctxTitle: "A little context",
  ctxSub:
    "Only what the analysis needs to compare groups fairly. Nothing here identifies you on its own.",
  fDept: "Department",
  fRole: "Role level",
  fTenure: "Time in this team",
  fArrangement: "Work arrangement",
  fManages: "Do you manage people?",
  fLang: "Interview language",
  choose: "Choose…",
  yes: "Yes",
  no: "No",
  continueBtn: "Continue",
  vContext: "Please complete the department, role level and tenure.",
  minimalNote:
    "If a combination of answers would make a group smaller than five people, that group is merged before reporting.",

  step3: "STEP 3 OF 5",
  pulseTitle: "How true is this of your team?",
  pulseSub:
    "Ten statements. Answer for the team as you experience it, not as you think it should be.",
  scale: ["Strongly disagree", "Disagree", "Neither", "Agree", "Strongly agree"],
  pulseOf: (a, b) => `Statement ${a} of ${b}`,
  back: "Back",
  next: "Next",
  toInterview: "Continue to the interview",

  lobbyIn: "INTERVIEW STARTS IN",
  lobbyDemo: "demo — shortened countdown",
  ready: "Ready check",
  linkOk: "Connection is good",
  micLbl: "Microphone",
  allow: "Allow",
  micNA: "Not available",
  micBlocked: "Blocked — check browser settings",
  langLbl: "Language",
  etiquette:
    "Speak normally. There are no right answers, and nothing is scored on how well you speak — accent, grammar and fluency are excluded from every result.",
  enterSession: "Enter the interview",

  interviewerName: "MIROME INTERVIEWER",
  listening: "Listening… tap to stop",
  tapSpeak: "Tap to speak",
  tapToHear: "Tap anywhere to hear the interviewer",
  micFallback: "Microphone unavailable — you can type instead",
  langsTitle: "Interview language",

  step4: "STEP 4 OF 5",
  reflectTitle: "Four short reflections",
  reflectSub:
    "These become the team's own words in the results — they are quoted anonymously, never attributed.",
  qStrength: "One strength of this team",
  qObstacle: "The biggest obstacle to doing good work here",
  qPriority: "If one thing changed, what should it be?",
  qAction: "One thing you will do yourself",

  step5: "STEP 5 OF 5",
  confirmTitle: "Is this right?",
  confirmSub:
    "This is what has been recorded from your session. Correct anything that is wrong — the corrected version is what goes into the analysis.",
  recordedLbl: "RECORDED SUMMARY",
  correctBtn: "Something is wrong",
  confirmBtn: "Yes, that is accurate",
  correctionPh: "What should it say instead?",
  correctedNote: "Correction recorded. The original is kept in the audit trail.",

  doneTitle: "Done — thank you",
  doneThanks: "Thank you,",
  doneSub:
    "Your session is complete. It joins the team results as one anonymous data point.",
  whatNextLbl: "WHAT HAPPENS NEXT",
  whatNext: [
    "Results are aggregated once enough of your team has taken part.",
    "The facilitator designs the programme around what the data actually shows.",
    "You will be asked four short questions again 30 days after the programme.",
    "Actions agreed by management are published back to everyone who took part.",
  ],
  refLbl: "YOUR REFERENCE",
  counterPre: "You are participant",
  counterPost: "of 96 invited at Meridian Group",
  privacyNote:
    "No individual report is produced from this session. Nothing here is shared with your manager.",
  restart: "Run the demo again",
};

const MS: Copy = {
  ...EN,
  locale: "ms-MY",
  demoTag: "DEMO · DATA SINTETIK",

  clientLine: "Meridian Group · Diagnosis Pasukan 2026",
  heroA: "Lima belas minit untuk beritahu ",
  heroB: "bagaimana pasukan ini sebenarnya berfungsi",
  heroC: " — sebelum sesiapa mereka bentuk bengkel.",
  lead:
    "Perbualan sulit dengan penemu duga digital MIROME. Jawapan anda digabungkan dengan jawapan rakan sekerja untuk menunjukkan di mana pasukan kuat dan di mana ia tersekat. Tiada laporan individu diberikan kepada pengurus anda.",
  st1: "Persetujuan",
  st1s: "Apa yang dikumpul dan siapa melihatnya",
  st2: "Temu bual",
  st2s: "15 minit, dalam kata-kata anda",
  st3: "Sahkan",
  st3s: "Anda betulkan ringkasan",
  cta: "Mula — 15 minit",
  minutes: "15 min",
  privacyStrap:
    "Sulit · dilaporkan pada peringkat pasukan sahaja · saiz kumpulan minimum 5 orang · anda boleh berhenti bila-bila masa.",

  step1: "LANGKAH 1 DARIPADA 5",
  consentTitle: "Sebelum kita mula",
  consentSub:
    "Ini adalah diagnosis pasukan. Ia bukan penilaian prestasi dan tidak digunakan untuk tindakan disiplin, gaji atau kenaikan pangkat.",
  consentPoints: [
    "Jawapan anda disimpan dengan nombor rujukan, bukan nama anda.",
    "Pengurus dan HR hanya melihat keputusan peringkat pasukan, bukan jawapan individu anda.",
    "Tiada kumpulan lebih kecil daripada lima orang dipaparkan.",
    "Penilai terlatih akan membaca apa-apa yang menimbulkan kebimbangan kebajikan atau keselamatan.",
    "Anda boleh melangkau mana-mana soalan, atau berhenti, tanpa memberi sebab.",
    "Data anda disimpan selama 24 bulan dan kemudian dipadam.",
  ],
  consentCheck: "Saya telah membaca dan bersetuju untuk mengambil bahagian.",
  consentBtn: "Saya setuju — teruskan",
  vConsent: "Sila sahkan persetujuan anda sebelum meneruskan.",

  step2: "LANGKAH 2 DARIPADA 5",
  ctxTitle: "Sedikit konteks",
  ctxSub:
    "Hanya apa yang diperlukan untuk membandingkan kumpulan secara adil. Tiada apa di sini mengenal pasti anda secara bersendirian.",
  fDept: "Jabatan",
  fRole: "Tahap jawatan",
  fTenure: "Tempoh dalam pasukan ini",
  fArrangement: "Susunan kerja",
  fManages: "Adakah anda menyelia orang?",
  fLang: "Bahasa temu bual",
  choose: "Pilih…",
  yes: "Ya",
  no: "Tidak",
  continueBtn: "Teruskan",
  vContext: "Sila lengkapkan jabatan, tahap jawatan dan tempoh perkhidmatan.",
  minimalNote:
    "Jika gabungan jawapan menjadikan kumpulan kurang daripada lima orang, kumpulan itu digabungkan sebelum pelaporan.",

  step3: "LANGKAH 3 DARIPADA 5",
  pulseTitle: "Sejauh mana ini benar tentang pasukan anda?",
  pulseSub:
    "Sepuluh pernyataan. Jawab mengikut pengalaman sebenar anda, bukan bagaimana ia sepatutnya.",
  scale: [
    "Sangat tidak setuju",
    "Tidak setuju",
    "Neutral",
    "Setuju",
    "Sangat setuju",
  ],
  pulseOf: (a, b) => `Pernyataan ${a} daripada ${b}`,
  back: "Kembali",
  next: "Seterusnya",
  toInterview: "Teruskan ke temu bual",

  lobbyIn: "TEMU BUAL BERMULA DALAM",
  lobbyDemo: "demo — kiraan dipendekkan",
  ready: "Semakan kesediaan",
  linkOk: "Sambungan baik",
  micLbl: "Mikrofon",
  allow: "Benarkan",
  micNA: "Tidak tersedia",
  micBlocked: "Disekat — semak tetapan pelayar",
  langLbl: "Bahasa",
  etiquette:
    "Bercakap seperti biasa. Tiada jawapan yang betul, dan tiada markah diberi atas cara anda bercakap — loghat, tatabahasa dan kefasihan dikecualikan daripada semua keputusan.",
  enterSession: "Masuk ke temu bual",

  interviewerName: "PENEMU DUGA MIROME",
  listening: "Mendengar… ketik untuk berhenti",
  tapSpeak: "Ketik untuk bercakap",
  tapToHear: "Ketik di mana-mana untuk mendengar penemu duga",
  micFallback: "Mikrofon tidak tersedia — anda boleh menaip",
  langsTitle: "Bahasa temu bual",

  step4: "LANGKAH 4 DARIPADA 5",
  reflectTitle: "Empat refleksi ringkas",
  reflectSub:
    "Ini menjadi suara pasukan dalam keputusan — dipetik tanpa nama, tidak pernah dikaitkan dengan individu.",
  qStrength: "Satu kekuatan pasukan ini",
  qObstacle: "Halangan terbesar untuk kerja yang baik di sini",
  qPriority: "Jika satu perkara berubah, apakah ia?",
  qAction: "Satu perkara yang anda sendiri akan lakukan",

  step5: "LANGKAH 5 DARIPADA 5",
  confirmTitle: "Betulkah ini?",
  confirmSub:
    "Ini yang telah direkodkan daripada sesi anda. Betulkan jika ada yang salah — versi yang dibetulkan itulah yang masuk ke analisis.",
  recordedLbl: "RINGKASAN DIREKODKAN",
  correctBtn: "Ada yang tidak tepat",
  confirmBtn: "Ya, ini tepat",
  correctionPh: "Apa yang sepatutnya?",
  correctedNote: "Pembetulan direkodkan. Versi asal disimpan dalam jejak audit.",

  doneTitle: "Selesai — terima kasih",
  doneThanks: "Terima kasih,",
  doneSub:
    "Sesi anda selesai. Ia menyertai keputusan pasukan sebagai satu titik data tanpa nama.",
  whatNextLbl: "APA YANG SETERUSNYA",
  whatNext: [
    "Keputusan digabungkan setelah cukup ahli pasukan mengambil bahagian.",
    "Fasilitator mereka bentuk program berdasarkan apa yang ditunjukkan oleh data.",
    "Anda akan ditanya empat soalan ringkas semula 30 hari selepas program.",
    "Tindakan yang dipersetujui pihak pengurusan diumumkan semula kepada semua peserta.",
  ],
  refLbl: "RUJUKAN ANDA",
  counterPre: "Anda adalah peserta ke-",
  counterPost: "daripada 96 yang dijemput di Meridian Group",
  privacyNote:
    "Tiada laporan individu dihasilkan daripada sesi ini. Tiada apa-apa di sini dikongsi dengan pengurus anda.",
  restart: "Jalankan demo sekali lagi",
};

export const I18N: Record<UiLang, Copy> = { en: EN, ms: MS };
