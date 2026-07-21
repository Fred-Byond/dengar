/**
 * Deterministic synthetic session generator for the Session Explorer demo.
 *
 * Builds realistic 5-minute transcripts and runs each through the REAL CVIF
 * `deterministicScorer` (src/lib/cvif) — so the Session Explorer shows genuine
 * engine output, not hand-authored rows. Seeded (mulberry32) so server and
 * client render identically (no hydration mismatch) and the dataset is stable.
 */

import { deterministicScorer } from "./cvif";
import type { SessionInsightRecord, TranscriptInput, TranscriptTurn } from "./cvif";

export interface SeededSession {
  record: SessionInsightRecord;
  citizenNameMasked: string;
  citizenName: string; // revealed only under elevated access (audit-logged)
  satisfaction: 1 | 2 | 3 | 4 | 5;
  timeLabel: string;
  transcript: { original: TranscriptTurn[]; english: TranscriptTurn[] };
  languageLabel: string;
}

// --- seeded PRNG ---
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATE_WEIGHTS: [string, number][] = [
  ["Selangor", 512], ["Kuala Lumpur", 398], ["Johor", 334], ["Penang", 236],
  ["Sabah", 206], ["Perak", 198], ["Sarawak", 186], ["Kedah", 142],
  ["Kelantan", 121], ["Pahang", 117], ["N. Sembilan", 104], ["Terengganu", 96],
  ["Melaka", 88], ["Putrajaya", 41], ["Perlis", 38], ["Labuan", 22],
];

const DISTRICTS: Record<string, string[]> = {
  Selangor: ["Petaling", "Klang", "Hulu Langat", "Gombak", "Sepang"],
  "Kuala Lumpur": ["Bukit Bintang", "Kepong", "Cheras", "Wangsa Maju"],
  Johor: ["Johor Bahru", "Batu Pahat", "Kluang", "Muar", "Kulai"],
  Penang: ["Timur Laut", "Barat Daya", "SP Tengah", "SP Utara"],
  Sabah: ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu", "Keningau"],
  Perak: ["Kinta", "Larut Matang", "Manjung", "Kerian"],
  Sarawak: ["Kuching", "Miri", "Sibu", "Bintulu"],
  Kedah: ["Kota Setar", "Kuala Muda", "Kulim", "Baling"],
  Kelantan: ["Kota Bharu", "Pasir Mas", "Tumpat", "Tanah Merah"],
  Pahang: ["Kuantan", "Temerloh", "Bentong", "Cameron Highlands"],
  "N. Sembilan": ["Seremban", "Port Dickson", "Jempol"],
  Terengganu: ["Kuala Terengganu", "Kemaman", "Dungun"],
  Melaka: ["Melaka Tengah", "Alor Gajah", "Jasin"],
  Putrajaya: ["Presint 8", "Presint 14"],
  Perlis: ["Kangar", "Arau"],
  Labuan: ["Victoria"],
};

const LANGS = [
  { code: "ms", label: "Bahasa Melayu", weight: 54 },
  { code: "en", label: "English", weight: 20 },
  { code: "zh", label: "中文", weight: 14 },
  { code: "ta", label: "தமிழ்", weight: 8 },
  { code: "ar", label: "العربية", weight: 4 },
];

interface Variant {
  issueEN: string;
  issueOriginal: string; // BM rendering for the transcript's "original"
  impactEN: string;
  askEN: string;
  weight: number;
}

const PACKS: { topic: string; weight: number; variants: Variant[] }[] = [
  {
    topic: "immigration", weight: 26,
    variants: [
      { issueEN: "The foreign worker permit renewal at the Shah Alam office took three months and I went back four times.", issueOriginal: "Pembaharuan permit pekerja asing di pejabat Shah Alam mengambil masa tiga bulan dan saya ke sana empat kali.", impactEN: "My worker could not start, so I lost income for weeks and nearly lost a contract.", askEN: "Please let us renew permits online with a status tracking number.", weight: 3 },
      { issueEN: "Passport appointment slots in JB are gone within minutes every morning, the queue is impossible.", issueOriginal: "Slot temujanji pasport di JB habis dalam beberapa minit setiap pagi, beratur memang susah.", impactEN: "I took three days of unpaid leave just to try to get a slot.", askEN: "Please open more passport counters or an online status system.", weight: 2 },
      { issueEN: "I checked the current processing time for a work permit renewal for my staff, just planning ahead.", issueOriginal: "Saya menyemak tempoh pemprosesan semasa untuk pembaharuan permit pekerja bagi kakitangan saya, sekadar merancang awal.", impactEN: "It is for planning our hiring next quarter.", askEN: "Please publish standard processing times on the website.", weight: 2 },
    ],
  },
  {
    topic: "scams", weight: 18,
    variants: [
      { issueEN: "My mother lost RM18,000 to a phone scam and the bank freeze came too late to stop it.", issueOriginal: "Ibu saya kehilangan RM18,000 kepada penipuan telefon dan pembekuan bank terlalu lewat.", impactEN: "The money was our family savings and we could not recover any of it.", askEN: "Please create a one-call scam-freeze hotline connected to all banks.", weight: 3 },
      { issueEN: "Students in our area are offered RM300 to rent out their bank accounts as mule accounts.", issueOriginal: "Pelajar di kawasan kami ditawarkan RM300 untuk menyewakan akaun bank sebagai akaun keldai.", impactEN: "Several young people have already been recruited and are now under investigation.", askEN: "Please run school awareness programmes on mule account recruitment.", weight: 2 },
      { issueEN: "The bank added a new verification step and I wanted to say it feels much safer now.", issueOriginal: "Bank menambah langkah pengesahan baharu dan saya rasa jauh lebih selamat sekarang.", impactEN: "My family feels more confident using online banking.", askEN: "Please keep improving the bank verification safeguards.", weight: 2 },
    ],
  },
  {
    topic: "policing", weight: 16,
    variants: [
      { issueEN: "We need more visible night patrols around the flats near the CIQ area, break-ins are rising.", issueOriginal: "Kami perlukan lebih banyak rondaan malam di sekitar flat berhampiran CIQ, kes pecah rumah meningkat.", impactEN: "Elderly residents are scared to go out after dark now.", askEN: "Please schedule regular neighbourhood patrols after 10pm.", weight: 2 },
      { issueEN: "A report I made two weeks ago at the balai still has no update, and loan sharks keep harassing us.", issueOriginal: "Laporan yang saya buat dua minggu lalu di balai masih tiada maklum balas, along terus mengganggu kami.", impactEN: "The harassment is getting worse and neighbours are afraid to help.", askEN: "Please give a status update system for police reports.", weight: 2 },
      { issueEN: "I would like to know the patrol schedule for our neighbourhood, and to thank the local balai for the recent help.", issueOriginal: "Saya ingin tahu jadual rondaan untuk kawasan kami, dan berterima kasih kepada balai tempatan atas bantuan baru-baru ini.", impactEN: "The officers were responsive last month.", askEN: "Please share the community patrol schedule with residents.", weight: 2 },
    ],
  },
  {
    topic: "foreign_workers", weight: 12,
    variants: [
      { issueEN: "The new levy portal works but agents still charge extra above the official fees.", issueOriginal: "Portal levi baharu berfungsi tetapi ejen masih mengenakan bayaran tambahan melebihi kadar rasmi.", impactEN: "Small restaurants like ours pay thousands more than we should.", askEN: "Please publish the official agent fees for work pass applications.", weight: 2 },
      { issueEN: "The new levy portal is a real improvement over last year, I just wanted to acknowledge that.", issueOriginal: "Portal levi baharu ialah penambahbaikan sebenar berbanding tahun lepas, saya ingin mengiktiraf itu.", impactEN: "Processing our worker paperwork was faster this time.", askEN: "Please keep the portal updated with any fee changes.", weight: 2 },
    ],
  },
  {
    topic: "registration", weight: 10,
    variants: [
      { issueEN: "Villagers here travel four hours to the JPN office to replace a MyKad, there is no kiosk nearby.", issueOriginal: "Penduduk kampung di sini bergerak empat jam ke pejabat JPN untuk menggantikan MyKad, tiada kiosk berhampiran.", impactEN: "Many elderly people simply give up and stay without a valid MyKad.", askEN: "Please bring mobile MyKad replacement kiosks to rural districts.", weight: 2 },
      { issueEN: "I renewed my MyKad at the JPN kiosk and it was quick, just sharing feedback.", issueOriginal: "Saya memperbaharui MyKad di kiosk JPN dan ia pantas, sekadar berkongsi maklum balas.", impactEN: "The self-service kiosk worked well for me.", askEN: "Please add more kiosks in shopping malls.", weight: 2 },
    ],
  },
  {
    topic: "drugs", weight: 8,
    variants: [
      { issueEN: "Vape with substances is spreading near the schools here and parents are worried.", issueOriginal: "Vape bercampur bahan terlarang semakin berleluasa berhampiran sekolah di sini dan ibu bapa risau.", impactEN: "A few students have already needed help and there is no follow-up support.", askEN: "Please increase enforcement and add community relapse support.", weight: 2 },
    ],
  },
  {
    topic: "civil_defence", weight: 5,
    variants: [
      { issueEN: "The APM flood response last month was fast and the new siren system really helped.", issueOriginal: "Tindak balas banjir APM bulan lalu pantas dan sistem siren baharu sangat membantu.", impactEN: "Our village had time to move belongings and no one was hurt this time.", askEN: "Please keep funding the new siren and alert system.", weight: 2 },
    ],
  },
  {
    topic: "general", weight: 5,
    variants: [
      { issueEN: "Thank you for this platform, it is the first time I feel the government is really listening.", issueOriginal: "Terima kasih atas platform ini, ini kali pertama saya rasa kerajaan benar-benar mendengar.", impactEN: "It gives people like me hope that our voices matter.", askEN: "Please keep this programme running and expand it.", weight: 2 },
    ],
  },
];

function weightedPick<T extends { weight: number }>(rng: () => number, items: T[]): T {
  const total = items.reduce((a, b) => a + b.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function pickState(rng: () => number): string {
  const total = STATE_WEIGHTS.reduce((a, b) => a + b[1], 0);
  let r = rng() * total;
  for (const [s, w] of STATE_WEIGHTS) {
    r -= w;
    if (r <= 0) return s;
  }
  return "Selangor";
}

const FIRST = ["Aiman", "Siti", "Wei Ming", "Kavitha", "Ahmad", "Nurul", "Ravi", "Mei Ling", "Farah", "Daniel", "Hafiz", "Priya", "Chong", "Aisyah", "Kumar", "Zul"];
const LAST = ["bin Rahim", "binti Yusof", "Tan", "a/l Muthu", "bin Ismail", "Lim", "a/p Suppiah", "binti Aziz", "Wong", "bin Abdullah"];

function maskName(name: string): string {
  return name
    .split(" ")
    .map((part, i) => (i === 0 ? part[0] + "•".repeat(Math.max(2, part.length - 1)) : "•".repeat(2)))
    .join(" ");
}

function timeLabelFrom(rng: () => number): string {
  const bucket = rng();
  if (bucket < 0.25) return `${2 + Math.floor(rng() * 55)} min ago`;
  if (bucket < 0.7) return `${1 + Math.floor(rng() * 20)} h ago`;
  return `${1 + Math.floor(rng() * 26)} days ago`;
}

const M_GREET = "Welcome. This session is for you to tell me what you think of the government, what we can improve, and your suggestions. Please, share with me.";
const M_PROBE = "Thank you. Which area does this affect, and what would you like to see done?";
const M_CONFIRM = "So what I am hearing is your concern and your request. Have I understood you correctly?";
const M_CLOSE = "Thank you for contributing your views to make our government better. My team will review it.";

export function generateSessions(count = 240, seed = 20260721): SeededSession[] {
  const rng = mulberry32(seed);
  const out: SeededSession[] = [];

  for (let i = 0; i < count; i++) {
    const state = pickState(rng);
    const districts = DISTRICTS[state] ?? ["Central"];
    const district = districts[Math.floor(rng() * districts.length)];
    const lang = weightedPick(rng, LANGS);
    const pack = weightedPick(rng, PACKS);
    const variant = weightedPick(rng, pack.variants);

    const name = `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`;
    const reference = `TTM-2026-${String(4000 + i).padStart(6, "0").slice(-6)}`;

    // Some sessions never reach the confirm step (NE) — makes the data honest.
    const reachedConfirm = rng() > 0.18;

    const englishTurns: TranscriptTurn[] = [
      { speaker: "minister", text: M_GREET, at: "0:00" },
      { speaker: "citizen", text: variant.issueEN, at: "0:40" },
      { speaker: "minister", text: M_PROBE, at: "2:10" },
      { speaker: "citizen", text: `${variant.impactEN} ${variant.askEN}`, at: "2:30" },
    ];
    const originalTurns: TranscriptTurn[] = [
      { speaker: "minister", text: M_GREET, at: "0:00" },
      { speaker: "citizen", text: variant.issueOriginal, at: "0:40" },
      { speaker: "minister", text: M_PROBE, at: "2:10" },
      { speaker: "citizen", text: `${variant.impactEN} ${variant.askEN}`, at: "2:30" },
    ];
    if (reachedConfirm) {
      englishTurns.push(
        { speaker: "minister", text: M_CONFIRM, at: "3:40" },
        { speaker: "citizen", text: "Yes, that is exactly right.", at: "4:05" },
      );
      originalTurns.push(
        { speaker: "minister", text: M_CONFIRM, at: "3:40" },
        { speaker: "citizen", text: "Ya, betul sekali.", at: "4:05" },
      );
    }
    englishTurns.push({ speaker: "minister", text: M_CLOSE, at: "4:30" });
    originalTurns.push({ speaker: "minister", text: M_CLOSE, at: "4:30" });

    const input: TranscriptInput = {
      reference,
      language: lang.label,
      state,
      district,
      topicHint: undefined,
      turns: englishTurns,
    };
    const record = deterministicScorer.score(input);

    out.push({
      record,
      citizenName: name,
      citizenNameMasked: maskName(name),
      satisfaction: (3 + Math.floor(rng() * 3)) as 3 | 4 | 5,
      timeLabel: timeLabelFrom(rng),
      transcript: { original: originalTurns, english: englishTurns },
      languageLabel: lang.label,
    });
  }

  // Sort so the urgent / most-recent-feeling ones surface, roughly
  return out;
}
