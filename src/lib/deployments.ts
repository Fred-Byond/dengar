/**
 * Deployment profiles — what makes the platform leader-agnostic.
 *
 * Every deployment shares the booking engine, the digital-human seam and the
 * CVIF framework (dimensions, rubrics, NE/IE discipline). What changes per
 * deployment is captured here: the topic taxonomy, the agencies execution
 * routes to, the role labels, the reference prefix, and the session content
 * the seeded demo generates.
 *
 * Adding a leader = adding a profile. Nothing in the scorer, the Session
 * Explorer, or the briefing generator changes.
 */

import { TAXONOMY, DEPARTMENTS, type TopicDefinition } from "./cvif/taxonomy";

export interface DeploymentDepartment {
  id: string;
  name: string;
}

/** One synthetic session archetype used by the seeded demo dataset. */
export interface SessionVariant {
  /** English issue statement (what the citizen raises). */
  issueEN: string;
  /** Bahasa Melayu rendering, for the "original language" transcript view. */
  issueOriginal: string;
  /** The described consequence — drives CVIF impact severity. */
  impactEN: string;
  /** The citizen's concrete request — drives CVIF actionability. */
  askEN: string;
  weight: number;
}

export interface SessionPack {
  /** Taxonomy topic id this pack produces. */
  topic: string;
  weight: number;
  variants: SessionVariant[];
}

export interface DeploymentProfile {
  id: "home-affairs" | "pmo";
  /** Institution the dashboard belongs to. */
  institution: string;
  /** How the leader is titled in citizen-facing copy. */
  leaderTitle: string;
  /** Label for the operational role view (front end of RBAC). */
  deliveryRole: string;
  /** Booking reference prefix, e.g. TTM- / PM-. */
  referencePrefix: string;
  /** What the executing bodies are called (agencies vs ministries). */
  executorNoun: string;
  taxonomy: TopicDefinition[];
  departments: readonly DeploymentDepartment[];
  /** topic id → lexical cues, used by the deterministic scorer's classifier. */
  topicKeywords: Record<string, string[]>;
  /** Seeded demo content. */
  packs: SessionPack[];
}

/* ============================================================
   PRIME MINISTER'S OFFICE — whole-of-government
   ============================================================ */

export const PMO_DEPARTMENTS: readonly DeploymentDepartment[] = [
  { id: "mof", name: "Ministry of Finance (MOF)" },
  { id: "kpdn", name: "Domestic Trade & Living Costs (KPDN)" },
  { id: "kesuma", name: "Human Resources (KESUMA)" },
  { id: "moh", name: "Ministry of Health (MOH)" },
  { id: "moe", name: "Ministry of Education (MOE)" },
  { id: "kdn", name: "Home Affairs (KDN)" },
  { id: "kpkt", name: "Housing & Local Government (KPKT)" },
  { id: "jpm", name: "Prime Minister's Department (JPM)" },
  { id: "miti", name: "Investment, Trade & Industry (MITI)" },
  { id: "pmo", name: "PMO Delivery Unit" },
];

/**
 * National taxonomy. Level 1 is what the PM is held accountable for; Level 2
 * is refined with the PMO in Phase 0. `defaultDepartment` is the lead
 * ministry a directive routes to.
 */
export const PMO_TAXONOMY: TopicDefinition[] = [
  {
    id: "cost_of_living",
    label: "Cost of living",
    level2: ["Food & grocery prices", "Fuel & subsidy changes", "Electricity & utilities", "Wages not keeping up"],
    defaultDepartment: "kpdn",
    negativeLeaning: true,
  },
  {
    id: "jobs_economy",
    label: "Jobs & economy",
    level2: ["Graduate underemployment", "Low starting salaries", "Gig-economy instability", "SME cashflow & loans"],
    defaultDepartment: "kesuma",
    negativeLeaning: true,
  },
  {
    id: "healthcare",
    label: "Healthcare",
    level2: ["Public clinic & hospital waits", "Specialist backlog", "Medicine shortages", "Rural clinic access"],
    defaultDepartment: "moh",
    negativeLeaning: false,
  },
  {
    id: "education",
    label: "Education",
    level2: ["School quality & teachers", "PTPTN & study loans", "Tuition costs", "TVET pathways"],
    defaultDepartment: "moe",
    negativeLeaning: false,
  },
  {
    id: "governance",
    label: "Corruption & governance",
    level2: ["Perceived cronyism in contracts", "Slow visible action on cases", "Local council integrity", "Political-funding transparency"],
    defaultDepartment: "jpm",
    negativeLeaning: true,
  },
  {
    id: "public_services",
    label: "Public service delivery",
    level2: ["Counter queues & appointments", "Online service reliability", "Cross-agency runaround"],
    defaultDepartment: "jpm",
    negativeLeaning: false,
  },
  {
    id: "housing",
    label: "Housing",
    level2: ["Affordability vs income", "Affordable-home waiting lists", "Rental deposits", "Youth first home"],
    defaultDepartment: "kpkt",
    negativeLeaning: true,
  },
  {
    id: "safety",
    label: "Safety & crime",
    level2: ["Online scams & losses", "Break-ins & snatch theft", "Drugs near schools"],
    defaultDepartment: "kdn",
    negativeLeaning: true,
  },
  {
    id: "unity",
    label: "National unity",
    level2: ["Inter-community relations", "Sabah & Sarawak equity", "Language & representation"],
    defaultDepartment: "jpm",
    negativeLeaning: false,
  },
  {
    id: "general",
    label: "General governance feedback / praise",
    level2: ["Service appreciation", "MADANI programme feedback"],
    defaultDepartment: "pmo",
    negativeLeaning: false,
  },
];

const PMO_TOPIC_KEYWORDS: Record<string, string[]> = {
  cost_of_living: ["price", "harga", "grocery", "subsidy", "subsidi", "ron95", "fuel", "electricity", "elektrik", "afford", "expensive", "mahal"],
  jobs_economy: ["job", "kerja", "salary", "gaji", "graduate", "graduan", "wage", "sme", "gig", "hiring", "underemploy", "worker", "retrain", "reskill", "employable", "cashflow", "business"],
  healthcare: ["clinic", "klinik", "hospital", "specialist", "pakar", "medicine", "ubat", "queue at the clinic"],
  education: ["school", "sekolah", "teacher", "guru", "ptptn", "tuition", "tuisyen", "university"],
  governance: ["corruption", "rasuah", "cronyism", "kroni", "integrity", "integriti", "transparent", "telus", "contract"],
  public_services: ["counter", "kaunter", "online service", "mygov", "renew", "appointment", "runaround"],
  housing: ["house", "rumah", "housing", "rent", "sewa", "deposit", "mortgage", "ppr", "first home", "first-home", "rent-to-own", "waiting list"],
  safety: ["scam", "tipu", "crime", "jenayah", "break-in", "theft", "curi", "drug", "dadah", "patrol"],
  unity: ["unity", "perpaduan", "sarawak", "sabah", "community", "represent"],
};

const PMO_PACKS: SessionPack[] = [
  {
    topic: "cost_of_living", weight: 30,
    variants: [
      { issueEN: "Chicken, eggs and vegetables cost more every month but my salary has not moved at all.", issueOriginal: "Harga ayam, telur dan sayur naik setiap bulan tetapi gaji saya tidak berubah sama sekali.", impactEN: "We have cut down to two proper meals a day to make it to the end of the month.", askEN: "Please enforce ceiling prices on essential goods and expand targeted cash aid.", weight: 3 },
      { issueEN: "Every time fuel subsidy changes are discussed, prices of everything else go up in our town first.", issueOriginal: "Setiap kali subsidi minyak dibincangkan, harga barang lain di pekan kami naik dahulu.", impactEN: "Transport and food both rose within weeks and my income did not.", askEN: "Please publish a clear subsidy transition plan so families can prepare.", weight: 2 },
      { issueEN: "The electricity bill for our small shop nearly doubled this quarter with no explanation.", issueOriginal: "Bil elektrik kedai kecil kami hampir berganda kuarter ini tanpa penjelasan.", impactEN: "It wiped out our margin and we may have to let one worker go.", askEN: "Please review tariff structure for small businesses and explain the changes.", weight: 2 },
      { issueEN: "I wanted to say the targeted cash aid actually reached us this time and it helped.", issueOriginal: "Saya ingin memaklumkan bantuan tunai bersasar benar-benar sampai kepada kami kali ini dan ia membantu.", impactEN: "It covered our school expenses for the term.", askEN: "Please keep the aid going and widen it if prices keep climbing.", weight: 2 },
    ],
  },
  {
    topic: "jobs_economy", weight: 18,
    variants: [
      { issueEN: "I have a degree but I am doing gig work because graduate jobs here start at RM1,800.", issueOriginal: "Saya ada degree tetapi buat kerja gig kerana pekerjaan graduan di sini bermula RM1,800.", impactEN: "I cannot move out, save, or plan anything on that pay in the city.", askEN: "Please introduce a graduate wage floor with an employer subsidy.", weight: 3 },
      { issueEN: "Our small business cannot get a fair working-capital loan and cashflow is strangling us.", issueOriginal: "Perniagaan kecil kami tidak dapat pinjaman modal kerja yang adil dan aliran tunai menghimpit kami.", impactEN: "We delayed salaries twice this year and nearly closed.", askEN: "Please make SME working-capital financing faster and less collateral-heavy.", weight: 2 },
      { issueEN: "I checked what retraining support exists for mid-career workers, just planning ahead.", issueOriginal: "Saya menyemak bantuan latihan semula yang ada untuk pekerja pertengahan kerjaya, sekadar merancang awal.", impactEN: "My industry is changing and I want to stay employable.", askEN: "Please publish a single clear directory of reskilling programmes.", weight: 2 },
    ],
  },
  {
    topic: "governance", weight: 14,
    variants: [
      { issueEN: "We want to see corruption cases actually finished and sentenced, not just announced.", issueOriginal: "Kami mahu melihat kes rasuah benar-benar selesai dan dihukum, bukan sekadar diumumkan.", impactEN: "People are losing faith that anything follows an announcement.", askEN: "Please publish quarterly progress and timelines on major cases.", weight: 3 },
      { issueEN: "The same connected names keep winning local contracts and everyone here notices.", issueOriginal: "Nama yang sama sentiasa mendapat kontrak tempatan dan semua orang di sini perasan.", impactEN: "Honest local contractors have stopped bidding entirely.", askEN: "Please make local contract awards open and searchable.", weight: 2 },
      { issueEN: "The new open-tender disclosures are a real improvement and I wanted to acknowledge it.", issueOriginal: "Pendedahan tender terbuka yang baharu satu penambahbaikan nyata dan saya ingin mengiktirafnya.", impactEN: "We could finally see who won and why.", askEN: "Please extend the same disclosure down to state and council level.", weight: 2 },
    ],
  },
  {
    topic: "housing", weight: 12,
    variants: [
      { issueEN: "A first home anywhere near my work is impossible on our combined salary, the deposit alone is out of reach.", issueOriginal: "Rumah pertama berhampiran tempat kerja saya mustahil dengan gaji kami, deposit sahaja di luar kemampuan.", impactEN: "We have delayed starting a family because we cannot secure a home.", askEN: "Please create a rent-to-own scheme with low deposits for first-home buyers.", weight: 3 },
      { issueEN: "We have been on the affordable-housing waiting list for years with no update at all.", issueOriginal: "Kami dalam senarai menunggu rumah mampu milik selama bertahun-tahun tanpa maklum balas.", impactEN: "Four of us share one rented room while we wait.", askEN: "Please give applicants a status tracker and a realistic queue position.", weight: 2 },
      { issueEN: "I wanted to check which first-home schemes my family qualifies for before we commit.", issueOriginal: "Saya ingin menyemak skim rumah pertama yang keluarga saya boleh mohon sebelum kami membuat keputusan.", impactEN: "We are planning our finances for next year.", askEN: "Please put all first-home schemes on one comparison page.", weight: 2 },
      { issueEN: "The new rent-to-own pilot is a real improvement and I wanted to acknowledge it.", issueOriginal: "Skim sewa-beli baharu ialah penambahbaikan nyata dan saya ingin mengiktirafnya.", impactEN: "It finally gave younger buyers a realistic route in.", askEN: "Please expand the scheme to more states.", weight: 2 },
    ],
  },
  {
    topic: "healthcare", weight: 10,
    variants: [
      { issueEN: "Six hours at the government clinic for a simple appointment, and the specialist wait is months.", issueOriginal: "Enam jam di klinik kerajaan untuk temujanji biasa, dan menunggu pakar mengambil masa berbulan.", impactEN: "I lost a day of wages and still did not see the specialist.", askEN: "Please add appointment scheduling so people are not queuing from dawn.", weight: 3 },
      { issueEN: "The nearest clinic is far from our village and always full when we get there.", issueOriginal: "Klinik terdekat jauh dari kampung kami dan selalu penuh apabila kami tiba.", impactEN: "Elderly relatives simply stop going for check-ups.", askEN: "Please send mobile health teams to rural districts on a fixed schedule.", weight: 2 },
      { issueEN: "The nurses at our health clinic were genuinely fast and kind with my mother last week.", issueOriginal: "Jururawat di klinik kesihatan kami sangat pantas dan baik dengan ibu saya minggu lepas.", impactEN: "She was seen and treated the same morning.", askEN: "Please keep staffing the clinic at this level.", weight: 3 },
      { issueEN: "I wanted to understand how the new appointment booking works before my next visit.", issueOriginal: "Saya ingin memahami cara tempahan temujanji baharu sebelum kunjungan saya yang seterusnya.", impactEN: "It is for planning around my work shifts.", askEN: "Please publish a simple guide to the booking system.", weight: 2 },
    ],
  },
  {
    topic: "safety", weight: 8,
    variants: [
      { issueEN: "My uncle lost his retirement savings to an investment scam and the money was gone before anyone acted.", issueOriginal: "Bapa saudara saya kehilangan simpanan persaraan kepada penipuan pelaburan dan wang hilang sebelum sesiapa bertindak.", impactEN: "It took his entire savings and the family is still recovering.", askEN: "Please create one national scam hotline that can freeze transfers immediately.", weight: 3 },
      { issueEN: "Break-ins in our neighbourhood are rising and residents are genuinely afraid at night.", issueOriginal: "Kes pecah rumah di taman kami meningkat dan penduduk benar-benar takut pada waktu malam.", impactEN: "Two houses on our street were hit in one month.", askEN: "Please increase visible patrols after 10pm in residential areas.", weight: 2 },
      { issueEN: "The new bank verification step is a real improvement and my family feels safer online now.", issueOriginal: "Langkah pengesahan bank baharu ialah penambahbaikan nyata dan keluarga saya rasa lebih selamat dalam talian.", impactEN: "It stopped a suspicious transfer last month.", askEN: "Please keep strengthening the transfer safeguards.", weight: 3 },
      { issueEN: "I wanted to know the correct channel to report a suspicious investment message.", issueOriginal: "Saya ingin tahu saluran betul untuk melaporkan mesej pelaburan yang mencurigakan.", impactEN: "It is so I can warn my colleagues properly.", askEN: "Please publicise one clear reporting channel.", weight: 2 },
    ],
  },
  {
    topic: "public_services", weight: 9,
    variants: [
      { issueEN: "Renewing my licence online was genuinely fast this time and I wanted to say so.", issueOriginal: "Pembaharuan lesen saya secara online kali ini benar-benar pantas dan saya ingin menyatakannya.", impactEN: "It saved me a whole morning of queuing.", askEN: "Please move more counter services online the same way.", weight: 3 },
      { issueEN: "The counter staff at our district office were responsive and sorted my document the same day.", issueOriginal: "Kakitangan kaunter di pejabat daerah kami responsif dan menyelesaikan dokumen saya pada hari yang sama.", impactEN: "I did not need to take a second day off work.", askEN: "Please recognise the team and keep the same process.", weight: 2 },
      { issueEN: "I checked which documents I need before applying, just to get it right the first time.", issueOriginal: "Saya menyemak dokumen yang diperlukan sebelum memohon, supaya betul pada kali pertama.", impactEN: "It is a routine renewal for my family.", askEN: "Please keep the document checklist updated online.", weight: 2 },
    ],
  },
  {
    topic: "unity", weight: 3,
    variants: [
      { issueEN: "I am proud to speak to the Prime Minister in my own language from Sarawak, but we feel far from the decisions.", issueOriginal: "Saya bangga bercakap dengan Perdana Menteri dalam bahasa saya dari Sarawak, tetapi kami rasa jauh dari keputusan.", impactEN: "Development here still lags what we see across the water.", askEN: "Please give East Malaysia a stronger voice in national planning.", weight: 2 },
    ],
  },
];

export const PMO_PROFILE: DeploymentProfile = {
  id: "pmo",
  institution: "Prime Minister's Office",
  leaderTitle: "Prime Minister",
  deliveryRole: "PMO Delivery Unit",
  referencePrefix: "PM",
  executorNoun: "ministry",
  taxonomy: PMO_TAXONOMY,
  departments: PMO_DEPARTMENTS,
  topicKeywords: PMO_TOPIC_KEYWORDS,
  packs: PMO_PACKS,
};

/* ============================================================
   MINISTRY OF HOME AFFAIRS — the first deployment
   (taxonomy & departments live in ./cvif/taxonomy; packs live in ./seed)
   ============================================================ */

export const HOME_AFFAIRS_PROFILE: Pick<
  DeploymentProfile,
  "id" | "institution" | "leaderTitle" | "deliveryRole" | "referencePrefix" | "executorNoun" | "taxonomy" | "departments"
> = {
  id: "home-affairs",
  institution: "Ministry of Home Affairs",
  leaderTitle: "Minister",
  deliveryRole: "Secretary General",
  referencePrefix: "TTM",
  executorNoun: "agency",
  taxonomy: TAXONOMY,
  departments: DEPARTMENTS,
};

/** Resolve a department/ministry display name within a profile. */
export function profileDepartmentName(
  profile: Pick<DeploymentProfile, "departments">,
  id: string,
): string {
  return profile.departments.find((d) => d.id === id)?.name ?? id;
}

/** Lead ministry/agency for a topic label within a profile. */
export function profileOwnerForTopic(
  profile: Pick<DeploymentProfile, "taxonomy" | "departments">,
  topicLabel: string,
): string {
  const topic = profile.taxonomy.find((t) => t.label === topicLabel);
  return profileDepartmentName(profile, topic?.defaultDepartment ?? "pmo");
}
