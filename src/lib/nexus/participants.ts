/**
 * AUREN — the supervisory record: individuals, not just cohorts.
 *
 * THE PROBLEM THIS FILE HAD TO SOLVE FIRST.
 *
 * `cohort.ts` refuses to expose individuals, for a good reason: a supervisor
 * holding named files on members of the public is holding something they did
 * not ask for and cannot lawfully use. But a securities commission running a
 * readiness programme genuinely does need to see how a named participant did,
 * for the same reason a distributor needs to see whether its advisor can carry
 * the launch — and the Beauty programme resolved exactly this.
 *
 * The resolution is the population, not the permission:
 *
 *   PUBLIC REHEARSAL. Anyone can open AUREN from a link and rehearse. No
 *   account, no name, nothing retained that identifies them. These people
 *   appear in the aggregate bands and nowhere else, and no console query can
 *   reach them because there is nothing to reach.
 *
 *   ENROLLED PARTICIPANT. Someone entering through an authority's programme
 *   with an enrolment code, which carries authority → jurisdiction → cohort and
 *   is issued by the sponsor. Enrolment is where consent is captured, and the
 *   record says so on every row. This is the population the console shows.
 *
 * So the console is not "the cohort dashboard with names turned on". It reads a
 * different, smaller, consented population — and the fact that the two cannot
 * be joined is the property that makes the public rehearsal safe to offer at
 * all.
 *
 * Deterministic throughout: fixed seed, same figures for everyone who opens it.
 */

import type { Lang } from "../auren/i18n";

/* ═══════════════════════════════════════════════════════════════════════
   WHAT IS SCORED
   ═════════════════════════════════════════════════════════════════════ */

/**
 * The five AILS dimensions the competency elements already roll up into. Not a
 * new rubric — `objects.ts` has carried `ailsDimension` on every element since
 * the first build, and this is that field aggregated.
 */
export interface Dimension {
  id: string;
  label: string;
  /** Which competency elements feed it. */
  elements: string[];
  /** What a good score actually means, in a sentence a participant could read. */
  note: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "scam",
    label: "Scam Resistance",
    elements: ["E-VER-02", "E-PAY-01"],
    note: "Verified independently, and questioned where the money was actually going.",
  },
  {
    id: "risk",
    label: "Risk Awareness",
    elements: ["E-RET-01"],
    note: "Treated the return as a claim to be tested rather than a number to be enjoyed.",
  },
  {
    id: "ai",
    label: "AI Literacy",
    elements: ["E-AI-01"],
    note: "Read “AI-powered” as a description of how something is built, not proof that it works.",
  },
  {
    id: "reasoning",
    label: "Investor Reasoning",
    elements: ["E-RISK-01"],
    note: "Could say what would have to happen to lose the whole amount.",
  },
  {
    id: "stability",
    label: "Behavioural Stability",
    elements: ["E-URG-01", "E-AUTH-01", "E-SOC-01"],
    note: "Verification behaviour did not change when a deadline, a name or a crowd appeared.",
  },
];

/* Which dimension each tactic chiefly exercises — used to recommend what a
   participant should rehearse next, rather than recommending at random. */
export const EXERCISES: Record<string, string> = {
  "TYP-CLONE-FIRM": "scam",
  "TYP-SYNTHETIC-ENDORSEMENT": "stability",
  "TYP-RELATIONSHIP-INVESTMENT": "stability",
  "TYP-AI-PERFORMANCE": "ai",
  "TYP-PRE-IPO": "stability",
  "TYP-RECOVERY": "scam",
  "TYP-AUTHORITY-IMPERSONATION": "stability",
  "TYP-TASK-ONBOARDING": "scam",
};

/* ═══════════════════════════════════════════════════════════════════════
   THE VERDICT
   ═════════════════════════════════════════════════════════════════════ */

export type Verdict = "ready" | "coach" | "priority";

/** `null` = no failure arose, so transfer was never put to the test. */
export type Transfer = boolean | null;

export const READY_THRESHOLD = 78;

/**
 * Readiness requires transfer, not a score.
 *
 * This is where AUREN departs from a launch-readiness rubric and it is
 * deliberate. The whole claim of the programme is behaviour under pressure, so
 * a participant who scores well and then fails the surface-distant retest is
 * not ready — they are someone who knows the rule. Certifying them on the
 * number would be certifying exactly the thing the product exists to say is
 * insufficient.
 *
 * Transfer is only *measured* when there was something to coach. A participant
 * who held every element they met on first contact has no failure to retest,
 * so `transferred` is `null` — not tested, which is not the same as failed and
 * must not be scored as one. Only an actual failed retest blocks readiness.
 */
export function verdictFor(
  overall: number,
  transferred: Transfer,
  signatures: number
): Verdict {
  if (overall >= READY_THRESHOLD && transferred !== false) return "ready";
  if (overall < 58 || (signatures >= 3 && transferred === false)) return "priority";
  return "coach";
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  ready: "Investor-ready",
  coach: "Coaching recommended",
  priority: "Priority coaching",
};

/* ═══════════════════════════════════════════════════════════════════════
   POPULATION
   ═════════════════════════════════════════════════════════════════════ */

export interface Participant {
  id: string;
  name: string;
  cohortId: string;
  cohortName: string;
  authorityId: string;
  jurisdiction: string;
  region: string;
  segment: string;
  /** The language the rehearsal was actually delivered in. */
  language: Lang;
  /**
   * Set where the cohort's own language is not one AUREN deploys, so the
   * rehearsal ran in a second language. It is not a footnote: a person
   * reasoning under pressure in their second language is being measured on
   * something slightly different, and a score compared across cohorts without
   * this stated is a score that overclaims.
   */
  secondLanguage: string | null;
  enrolledOn: string;
  /** Recorded at enrolment. Shown on every row that names a person. */
  consentBasis: string;
}

export interface ScoredElement {
  id: string;
  label: string;
  status: "demonstrated" | "failed" | "not-tested";
  /** The participant's own sentence. Empty when not tested. */
  quote: string;
}

export interface Assessment {
  id: string;
  participantId: string;
  at: string;
  week: number;
  /** The tactic they were actually put under pressure by. */
  typology: string;
  minutes: number;
  turns: number;
  dims: Record<string, number>;
  overall: number;
  elements: ScoredElement[];
  signatures: Array<{ id: string; label: string; quote: string }>;
  transferred: Transfer;
  verdict: Verdict;
  strengths: string[];
  improve: string[];
  recommendation: { action: string; next: string; why: string };
}

/* ── Deterministic generation ─────────────────────────────────────────── */

function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface RegionSeed {
  cohortId: string;
  cohortName: string;
  authorityId: string;
  jurisdiction: string;
  language: Lang;
  regions: string[];
  names: string[][];
  /** The cohort's own language, when AUREN does not deploy it. */
  nativeLanguage?: string;
  /** Programme maturity: a cohort that started late scores lower, honestly. */
  lift: number;
}

const SEEDS: RegionSeed[] = [
  /* Spain first, and at depth. A CNMV supervisor opening this in Madrid should
     find their own programme on the first screen, not a foreign one they have
     to filter down to. */
  {
    cohortId: "CO-ES-RETAIL",
    cohortName: "Programa de educación financiera · minoristas",
    authorityId: "AUTH-CNMV-ES",
    jurisdiction: "ES",
    language: "ES",
    regions: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Zaragoza", "Málaga"],
    names: [
      ["Lucía", "Javier", "Carmen", "Álvaro", "Marta", "Sergio", "Elena", "Iñaki", "Rocío", "Pablo"],
      ["Moreno", "Vidal", "Serrano", "Iglesias", "Cabrera", "Ruiz", "Ferrer", "Blanco", "Ortega", "Navarro"],
    ],
    lift: -2,
  },
  {
    cohortId: "CO-ES-SENIOR",
    cohortName: "Inversores mayores de 65 · piloto",
    authorityId: "AUTH-CNMV-ES",
    jurisdiction: "ES",
    language: "ES",
    regions: ["Madrid", "Barcelona", "Valencia", "A Coruña", "Murcia"],
    names: [
      ["Josefa", "Antonio", "Dolores", "Manuel", "Pilar", "Francisco", "Encarnación", "Ramón", "Amparo", "Vicente"],
      ["Gómez", "Fernández", "Sáez", "Martín", "Calvo", "Herrero", "Nieto", "Bravo", "Lorenzo", "Prieto"],
    ],
    // The targeted population, running the hardest tactics. It scores lowest,
    // and that is the finding rather than a flaw in the cohort.
    lift: -7,
  },
  {
    cohortId: "CO-FR-RETAIL",
    cohortName: "Parcours investisseur particulier",
    authorityId: "AUTH-AMF-FR",
    jurisdiction: "FR",
    language: "EN",
    nativeLanguage: "French",
    regions: ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux"],
    names: [
      ["Camille", "Thomas", "Aurélie", "Nicolas", "Sophie", "Karim", "Émilie", "Julien", "Nadia", "Mathieu"],
      ["Dubois", "Lefèvre", "Benali", "Rousseau", "Girard", "Marchand", "Da Silva", "Perrin", "Caron", "Meyer"],
    ],
    lift: -4,
  },
  {
    cohortId: "CO-DE-RETAIL",
    cohortName: "Privatanleger-Programm",
    authorityId: "AUTH-BAFIN-DE",
    jurisdiction: "DE",
    language: "EN",
    nativeLanguage: "German",
    regions: ["Berlin", "München", "Frankfurt am Main", "Hamburg", "Köln"],
    names: [
      ["Lena", "Stefan", "Miriam", "Jonas", "Katrin", "Emre", "Annika", "Tobias", "Svenja", "Hakan"],
      ["Brandt", "Keller", "Yilmaz", "Hoffmann", "Schreiber", "Neumann", "Kowalski", "Bauer", "Friedrich", "Engel"],
    ],
    lift: -1,
  },
  {
    cohortId: "CO-IT-RETAIL",
    cohortName: "Percorso investitori retail",
    authorityId: "AUTH-CONSOB-IT",
    jurisdiction: "IT",
    language: "EN",
    nativeLanguage: "Italian",
    regions: ["Milano", "Roma", "Torino", "Napoli", "Bologna"],
    names: [
      ["Giulia", "Matteo", "Chiara", "Alessandro", "Federica", "Davide", "Sara", "Luca", "Martina", "Stefano"],
      ["Ferrari", "Esposito", "Colombo", "Ricci", "Greco", "Marino", "Costa", "Rizzo", "Barbieri", "Fontana"],
    ],
    lift: -5,
  },
  {
    cohortId: "CO-GB-PANEL",
    cohortName: "Consumer panel · pre-campaign baseline",
    authorityId: "AUTH-FCA-UK",
    jurisdiction: "GB",
    language: "EN",
    regions: ["Greater London", "North West", "Scotland", "West Midlands"],
    names: [
      ["Eleanor", "Marcus", "Priya", "Tom", "Grace", "Oliver", "Amara", "Ruth", "Callum", "Joy"],
      ["Whitfield", "Okonkwo", "Hargreaves", "Patel", "Buchanan", "Fletcher", "Adeyemi", "Doyle", "Reid", "Barnes"],
    ],
    // A pre-campaign baseline is measured before anyone is taught anything.
    lift: -8,
  },
  {
    cohortId: "CO-MY-RETAIL",
    cohortName: "Retail investor outreach · Q3",
    authorityId: "AUTH-SC-MY",
    jurisdiction: "MY",
    language: "EN",
    regions: ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah"],
    names: [
      ["Aishah", "Daniel", "Mei Ling", "Ravi", "Nurul", "Wei Jie", "Suresh", "Farah", "Kai", "Priya"],
      ["Rahman", "Tan", "Kumar", "Lim", "Abdullah", "Chong", "Pillai", "Ismail", "Ng", "Devi"],
    ],
    lift: 0,
  },
  {
    cohortId: "CO-SG-SENIOR",
    cohortName: "Senior investor programme",
    authorityId: "AUTH-MAS-SG",
    jurisdiction: "SG",
    language: "EN",
    regions: ["Central", "East", "North East", "West"],
    names: [
      ["Bee Hoon", "Anthony", "Salmah", "Kok Wah", "Theresa", "Hassan", "Siew Lan", "Raj", "Peik Yee", "Joseph"],
      ["Koh", "D'Cruz", "Bin Omar", "Teo", "Nathan", "Yeo", "Chandran", "Ho", "Wong", "Menon"],
    ],
    lift: -3,
  },
];

const SEGMENTS = [
  "First-time investor",
  "Active retail",
  "Pre-retirement",
  "Returning after a loss",
  "Self-directed, high activity",
];

const ELEMENT_LABELS: Record<string, string> = {
  "E-VER-02": "Independent verification",
  "E-RET-01": "Return plausibility",
  "E-AI-01": "AI-capability scepticism",
  "E-RISK-01": "Understands downside",
  "E-URG-01": "Resists urgency",
  "E-AUTH-01": "Questions authority claims",
  "E-SOC-01": "Discounts social proof",
  "E-PAY-01": "Payment-destination scrutiny",
};

/**
 * Evidence quotes. Every score on the console cites one of these, because a
 * dimension scored without the participant's own words is a number nobody can
 * defend when the participant disagrees with it.
 */
const QUOTES: Record<string, { pass: string[]; fail: string[] }> = {
  "E-VER-02": {
    pass: [
      "I'd go to the regulator's own register and type the address in myself, then search the company name.",
      "Their website saying they're regulated is them saying it. I'd check the register independently.",
    ],
    fail: [
      "Their website says they're regulated, and it looks professional.",
      "They sent me the licence certificate, so I assumed that was the check done.",
    ],
  },
  "E-RET-01": {
    pass: [
      "Fifteen percent a month isn't a return, it's a sales pitch. Nothing sustainable pays that.",
      "If that were real everyone would be in it. The number itself is the warning.",
    ],
    fail: [
      "I assume the algorithm is just better than what most people have access to.",
      "It seemed high but they explained the strategy and it made sense to me.",
    ],
  },
  "E-AI-01": {
    pass: [
      "AI tells me how it's built, not whether it works. It says nothing about returns.",
      "Processing more data isn't the same as predicting the market. That's marketing.",
    ],
    fail: [
      "AI can process a lot more data than a person, so it should be more accurate.",
      "The model explanation was detailed, so I took that as a sign it was genuine.",
    ],
  },
  "E-RISK-01": {
    pass: [
      "All of it, if the firm isn't real. There'd be no recourse and no recovery.",
      "I could lose the entire ten thousand and have nobody to claim against.",
    ],
    fail: [
      "I suppose if the market crashed badly. But they mentioned there's capital protection.",
      "They said the downside was covered, so I didn't think about losing it all.",
    ],
  },
  "E-URG-01": {
    pass: [
      "If it closes tonight then it closes without me. A real allocation survives a day's checking.",
      "The deadline is the reason to slow down, not the reason to move.",
    ],
    fail: [
      "Okay — if it closes tonight then let's do it. Send me the details.",
      "I didn't want to lose the allocation, so I stopped asking and said yes.",
    ],
  },
  "E-AUTH-01": {
    pass: [
      "How would I confirm that video is really him? A recognisable face isn't a licence.",
      "Him backing it tells me nothing about whether they're authorised to sell it.",
    ],
    fail: [
      "I recognised the founder in the video, so I assumed it had been checked.",
      "They're working with the regulator, they said, so I took it at face value.",
    ],
  },
  "E-SOC-01": {
    pass: [
      "Screenshots from the person selling to me aren't other people. That's the same claim twice.",
      "Other investors doing well is a story, not evidence.",
    ],
    fail: [
      "There were a lot of people in the group showing their withdrawals, so it looked real.",
      "If that many people are already in, it can't be completely fake.",
    ],
  },
  "E-PAY-01": {
    pass: [
      "The account name has to match the firm name. If it's a personal account I'm not sending anything.",
      "I'd want to know exactly where the money lands before any of it moves.",
    ],
    fail: [
      "They told me which account to use and I didn't look at whose name was on it.",
      "The first few withdrawals worked, so I stopped checking where it was going.",
    ],
  },
};

const SIGNATURE_FOR: Record<string, { id: string; label: string }> = {
  "E-VER-02": { id: "FAIL-VERIFY-SELFASSERTED", label: "Trusts promoter-supplied evidence as independent evidence" },
  "E-RET-01": { id: "FAIL-GREED-OVERRIDE", label: "Recognises implausibility but proceeds anyway" },
  "E-AI-01": { id: "FAIL-AI-AUTHORITY", label: "Treats “AI-powered” as evidence of capability" },
  "E-RISK-01": { id: "FAIL-SUNK-COST", label: "Continues because money or time is already committed" },
  "E-URG-01": { id: "FAIL-URGENCY-COMPLIANCE", label: "Verification stops under artificial time pressure" },
  "E-AUTH-01": { id: "FAIL-AUTHORITY-DEFERENCE", label: "Reduces scrutiny when status is invoked" },
  "E-SOC-01": { id: "FAIL-SOCIAL-PROOF", label: "Uses others' apparent success as evidence" },
  "E-PAY-01": { id: "FAIL-PAYMENT-BLIND", label: "Stops scrutinising the payment destination" },
};

const TYPOLOGY_POOL = Object.keys(EXERCISES);

export interface Programme {
  participants: Participant[];
  assessments: Assessment[];
  /** Rehearsals by members of the public, aggregate only — no records exist. */
  anonymousRehearsals: number;
}

export function buildProgramme(): Programme {
  const r = prng(20260920);
  const participants: Participant[] = [];
  const assessments: Assessment[] = [];
  let pid = 1040;
  let sid = 8300;

  SEEDS.forEach((seed) => {
    const count = 14 + Math.floor(r() * 5);
    // Two people in one cohort sharing a name reads as a duplicated row rather
    // than as two people, so draw until the pair is unused.
    const taken = new Set<string>();
    for (let i = 0; i < count; i += 1) {
      let first = "";
      let last = "";
      for (let attempt = 0; attempt < 60; attempt += 1) {
        first = seed.names[0][Math.floor(r() * seed.names[0].length)];
        last = seed.names[1][Math.floor(r() * seed.names[1].length)];
        if (!taken.has(`${first} ${last}`)) break;
      }
      taken.add(`${first} ${last}`);
      const p: Participant = {
        id: `AUR-P-${pid++}`,
        name: `${first} ${last}`,
        cohortId: seed.cohortId,
        cohortName: seed.cohortName,
        authorityId: seed.authorityId,
        jurisdiction: seed.jurisdiction,
        region: seed.regions[Math.floor(r() * seed.regions.length)],
        segment: SEGMENTS[Math.floor(r() * SEGMENTS.length)],
        language: seed.language,
        secondLanguage: seed.nativeLanguage ?? null,
        enrolledOn: `2026-0${6 + Math.floor(r() * 3)}-${String(2 + Math.floor(r() * 26)).padStart(2, "0")}`,
        consentBasis: "Programme enrolment · sponsor may review readiness",
      };
      participants.push(p);

      // One to three rehearsals each. Practice lifts scores, which is the
      // effect the programme exists to detect, so it is in the data plainly.
      const runs = 1 + Math.floor(r() * 2.4);
      for (let k = 0; k < runs; k += 1) {
        const week = 1 + k + Math.floor(r() * 2);
        const typology = TYPOLOGY_POOL[Math.floor(r() * TYPOLOGY_POOL.length)];
        const base = 57 + seed.lift + k * 9 + r() * 18;

        const dims: Record<string, number> = {};
        DIMENSIONS.forEach((d) => {
          let v = base + (r() * 14 - 7);
          // The tactic they faced pushes hardest on the dimension it exercises.
          if (EXERCISES[typology] === d.id) v -= 6;
          dims[d.id] = Math.max(24, Math.min(99, Math.round(v)));
        });
        const overall = Math.round(
          DIMENSIONS.reduce((a, d) => a + dims[d.id], 0) / DIMENSIONS.length
        );

        // Four elements are tested per session — the D8 budget, unchanged.
        const tested = Object.keys(ELEMENT_LABELS)
          .slice()
          .sort(() => r() - 0.5)
          .slice(0, 4);
        const elements: ScoredElement[] = Object.keys(ELEMENT_LABELS).map((id) => {
          if (!tested.includes(id)) {
            return { id, label: ELEMENT_LABELS[id], status: "not-tested" as const, quote: "" };
          }
          const passed = r() < (overall - 22) / 70;
          const bank = QUOTES[id];
          const pool = passed ? bank.pass : bank.fail;
          return {
            id,
            label: ELEMENT_LABELS[id],
            status: passed ? ("demonstrated" as const) : ("failed" as const),
            quote: pool[Math.floor(r() * pool.length)],
          };
        });

        const failed = elements.filter((e) => e.status === "failed");
        const signatures = failed.slice(0, 3).map((e) => ({
          id: SIGNATURE_FOR[e.id].id,
          label: SIGNATURE_FOR[e.id].label,
          quote: e.quote,
        }));
        const transferred: Transfer =
          failed.length === 0 ? null : r() < (overall - 26) / 58;
        const verdict = verdictFor(overall, transferred, signatures.length);

        const ranked = DIMENSIONS.slice().sort((a, b) => dims[b.id] - dims[a.id]);
        const weakest = ranked[ranked.length - 1];

        // Recommend a tactic they have NOT faced that exercises their weakest
        // dimension — the same surface-distance logic the retest selector uses,
        // applied to what to book next rather than what to fire now.
        const nextTactic =
          TYPOLOGY_POOL.filter((t) => t !== typology && EXERCISES[t] === weakest.id)[0] ??
          TYPOLOGY_POOL.filter((t) => t !== typology)[0];

        const recommendation =
          verdict === "ready"
            ? {
                action: "No further rehearsal this cycle",
                next: nextTactic,
                why:
                  transferred === null
                    ? "Held every element they met, so no retest was owed. Re-test in 90 days against a tactic they have not faced."
                    : "Failed, was coached, and then held on a scenario sharing nothing with the first. Re-test in 90 days against a tactic they have not faced.",
              }
            : verdict === "coach"
            ? {
                action: "Book one coached rehearsal",
                next: nextTactic,
                why: `${weakest.label} is the lowest dimension and the coached behaviour ${
                  transferred === null
                    ? "was never put to a retest, because nothing failed"
                    : transferred
                      ? "did transfer, but the margin is thin"
                      : "did not transfer to an unfamiliar scenario"
                }.`,
              }
            : {
                action: "Coached rehearsal within 14 days",
                next: nextTactic,
                why: `${signatures.length} failure signature${signatures.length === 1 ? "" : "s"} bound under pressure${
                  transferred === false ? " and nothing transferred" : ""
                }. ${weakest.label} is where it breaks first.`,
              };

        assessments.push({
          id: `IRR-${sid++}`,
          participantId: p.id,
          at: `2026-0${7 + Math.floor(week / 3)}-${String(3 + week * 4).padStart(2, "0")}`,
          week,
          typology,
          minutes: 7 + Math.floor(r() * 4),
          turns: 11 + Math.floor(r() * 7),
          dims,
          overall,
          elements,
          signatures,
          transferred,
          verdict,
          strengths: ranked.slice(0, 2).map((d) => d.label),
          improve: ranked.slice(-2).map((d) => d.label),
          recommendation,
        });
      }
    }
  });

  return { participants, assessments, anonymousRehearsals: 6840 };
}

/* ═══════════════════════════════════════════════════════════════════════
   ROLL-UPS
   ═════════════════════════════════════════════════════════════════════ */

export interface ParticipantRow {
  participant: Participant;
  sessions: number;
  best: number;
  latest: Assessment;
  verdict: Verdict;
}

export function participantRows(prog: Programme, filter: (a: Assessment, p: Participant) => boolean): ParticipantRow[] {
  const byId = new Map<string, Participant>();
  prog.participants.forEach((p) => byId.set(p.id, p));

  const grouped = new Map<string, Assessment[]>();
  prog.assessments.forEach((a) => {
    const p = byId.get(a.participantId);
    if (!p || !filter(a, p)) return;
    const list = grouped.get(a.participantId) ?? [];
    list.push(a);
    grouped.set(a.participantId, list);
  });

  const rows: ParticipantRow[] = [];
  grouped.forEach((list, id) => {
    const p = byId.get(id);
    if (!p) return;
    const sorted = list.slice().sort((x, y) => y.week - x.week);
    const latest = sorted[0];
    rows.push({
      participant: p,
      sessions: list.length,
      best: Math.max(...list.map((a) => a.overall)),
      latest,
      // The verdict that matters is the most recent one, not the best one:
      // a person who did well in week one and failed in week four is not ready.
      verdict: latest.verdict,
    });
  });
  return rows.sort((a, b) => b.best - a.best);
}

export interface RegionRow {
  region: string;
  jurisdiction: string;
  participants: number;
  sessions: number;
  mean: number;
  ready: number;
}

export function regionRows(prog: Programme, filter: (a: Assessment, p: Participant) => boolean): RegionRow[] {
  const byId = new Map<string, Participant>();
  prog.participants.forEach((p) => byId.set(p.id, p));
  const acc = new Map<string, { jur: string; people: Set<string>; scores: number[]; ready: number }>();

  prog.assessments.forEach((a) => {
    const p = byId.get(a.participantId);
    if (!p || !filter(a, p)) return;
    const key = `${p.jurisdiction}·${p.region}`;
    const e = acc.get(key) ?? { jur: p.jurisdiction, people: new Set<string>(), scores: [], ready: 0 };
    e.people.add(p.id);
    e.scores.push(a.overall);
    if (a.verdict === "ready") e.ready += 1;
    acc.set(key, e);
  });

  return Array.from(acc.entries())
    .map(([key, e]) => ({
      region: key.split("·")[1],
      jurisdiction: e.jur,
      participants: e.people.size,
      sessions: e.scores.length,
      mean: Math.round(e.scores.reduce((x, y) => x + y, 0) / e.scores.length),
      ready: Math.round((e.ready / e.scores.length) * 100),
    }))
    .sort((a, b) => a.mean - b.mean);
}

export function dimensionMeans(
  prog: Programme,
  filter: (a: Assessment, p: Participant) => boolean
): Array<{ id: string; label: string; mean: number }> {
  const byId = new Map<string, Participant>();
  prog.participants.forEach((p) => byId.set(p.id, p));
  const rows = prog.assessments.filter((a) => {
    const p = byId.get(a.participantId);
    return p ? filter(a, p) : false;
  });
  return DIMENSIONS.map((d) => ({
    id: d.id,
    label: d.label,
    mean: rows.length
      ? Math.round(rows.reduce((acc, a) => acc + a.dims[d.id], 0) / rows.length)
      : 0,
  }));
}
