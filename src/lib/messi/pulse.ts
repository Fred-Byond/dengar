/**
 * THE MESSI GLOBAL PULSE — aggregation layer (slide 8).
 *
 * "Understand millions of fans without reading millions of conversations."
 *
 * Pure functions over Fan Insight Records. The demo passes the seeded dataset;
 * production passes the live aggregation API. Nothing downstream — dashboard,
 * World Brief, curation queue — knows the difference.
 */

import { generateConversations, type SeededConversation } from "./seed";
import { TAXONOMY, teamName, experienceName, topicByLabel } from "./fvif";
import type { CareLevel, MembershipTier } from "./fvif";
import { MARKETS } from "./markets";

/* ------------------------------------------------------------------ */

export interface PulseKpis {
  conversations: number;
  countries: number;
  languages: number;
  avgDuration: string; // m:ss
  netSentiment: number; // -100…+100
  satisfaction: string; // x.x / 5
  memoryOptInPct: number;
  returningPct: number;
  plusSharePct: number;
  holoMeSharePct: number;
}

export interface TopicSignal {
  label: string;
  count: number;
  pct: number;
  /** Change in share of conversations vs the previous period, in points. */
  deltaPts: number;
  team: string;
  experience: string;
  sensitive: boolean;
}

export interface CountrySignal {
  country: string;
  territory: string;
  status: string;
  count: number;
  pct: number;
  /** Growth in conversation volume vs the previous period, %. */
  growthPct: number;
  netSentiment: number;
  plusSharePct: number;
  topTopic: string;
  holoMeSites: number;
}

export interface CuratedQuestion {
  reference: string;
  question: string;
  country: string;
  languageLabel: string;
  ageBand: string;
  topic: string;
  significance: number;
  /** How many fans asked substantially the same thing this period. */
  similarCount: number;
  /** Why this one surfaced for Lionel's attention. */
  rationale: string;
  /** Which experience a response would be published through. */
  experience: string;
}

export interface CareSummary {
  level: CareLevel;
  count: number;
  pct: number;
}

export interface Pulse {
  periodLabel: string;
  kpis: PulseKpis;
  /**
   * Human-readable gloss of the emotional register. Prose that quotes the bare
   * number reads as "fans feel negative about Messi", which is the opposite of
   * what the number means.
   */
  registerLabel: string;
  sentiment: { positive: number; neutral: number; negative: number };
  topics: TopicSignal[];
  emerging: TopicSignal | null;
  emergingQuote: { quote: string; country: string; languageLabel: string; ageBand: string } | null;
  countries: CountrySignal[];
  fastestGrowingCountry: CountrySignal | null;
  languages: { label: string; count: number; pct: number }[];
  ageBands: { band: string; count: number; pct: number }[];
  experiences: { name: string; count: number; pct: number }[];
  care: CareSummary[];
  careQueue: SeededConversation[];
  reviewCount: number;
  curation: CuratedQuestion[];
  memory: { optInPct: number; hooksReady: number; returningPct: number };
  tiers: { tier: MembershipTier; label: string; count: number; pct: number }[];
}

/* ------------------------------------------------------------------ */

function num(v: number | "IE" | "NE"): number {
  return typeof v === "number" ? v : 0;
}

function pctOf(n: number, total: number): number {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const AGE_LABEL: Record<string, string> = {
  "under-13": "Under 13",
  "13-17": "13–17",
  "18-24": "18–24",
  "25-34": "25–34",
  "35+": "35+",
};

const TIER_LABEL: Record<MembershipTier, string> = {
  free: "MESSI.LIVE (free)",
  plus: "MESSI+",
  family: "MESSI+ FAMILY",
  premium: "MESSI+ PREMIUM",
};

/* ------------------------------------------------------------------ */

/**
 * Build the Global Pulse. `previous` is the prior period, used to compute the
 * signals that actually matter to management — what is GROWING, not just what
 * is large.
 */
export function buildPulse(
  current: SeededConversation[] = generateConversations(320),
  previous: SeededConversation[] = generateConversations(268, 20260713),
  periodLabel = "August 2026 · month to date",
): Pulse {
  const records = current.map((c) => c.record);
  const total = records.length || 1;

  /* --- headline KPIs --- */
  const netSentiment = Math.round(
    (records.reduce((a, r) => a + num(r.sentiment.overall.value), 0) / total) * 50,
  );
  const avgDuration = mmss(
    current.reduce((a, c) => a + c.durationSec, 0) / total,
  );
  const satisfaction = (
    current.reduce((a, c) => a + c.satisfaction, 0) / total
  ).toFixed(1);
  const countries = new Set(records.map((r) => r.country)).size;
  const languages = new Set(records.map((r) => r.language)).size;
  const memoryOptIn = records.filter((r) => r.memoryConsent).length;
  const returning = current.filter((c) => c.returning).length;
  const plusCount = records.filter((r) => r.tier !== "free").length;
  const holoMe = records.filter((r) => r.surface === "holome").length;

  /* --- sentiment split --- */
  let positive = 0, neutral = 0, negative = 0;
  records.forEach((r) => {
    const v = num(r.sentiment.overall.value);
    if (v > 0) positive++;
    else if (v < 0) negative++;
    else neutral++;
  });

  /* --- what the world is asking --- */
  const countBy = <T>(items: T[], key: (t: T) => string) => {
    const m = new Map<string, number>();
    items.forEach((i) => m.set(key(i), (m.get(key(i)) ?? 0) + 1));
    return m;
  };

  const topicNow = countBy(records, (r) => r.topicL1);
  const topicPrev = countBy(previous.map((c) => c.record), (r) => r.topicL1);
  const prevTotal = previous.length || 1;

  const topics: TopicSignal[] = TAXONOMY.map((t) => {
    const count = topicNow.get(t.label) ?? 0;
    const pct = pctOf(count, total);
    const prevPct = pctOf(topicPrev.get(t.label) ?? 0, prevTotal);
    return {
      label: t.label,
      count,
      pct,
      deltaPts: pct - prevPct,
      team: teamName(t.defaultTeam),
      experience: experienceName(t.experience),
      sensitive: t.sensitive,
    };
  })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  const emerging =
    [...topics].sort((a, b) => b.deltaPts - a.deltaPts)[0] ?? null;

  // A verbatim line to put a human voice under the emerging signal.
  const emergingSource = emerging
    ? current
        .filter((c) => c.record.topicL1 === emerging.label && c.record.questionAsked)
        .sort(
          (a, b) =>
            num(b.record.significance.value) + num(b.record.contextDepth.value) -
            (num(a.record.significance.value) + num(a.record.contextDepth.value)),
        )[0]
    : undefined;
  const emergingQuote = emergingSource
    ? {
        quote: emergingSource.record.questionAsked ?? emergingSource.record.summary,
        country: emergingSource.record.country,
        languageLabel: emergingSource.languageLabel,
        ageBand: AGE_LABEL[emergingSource.record.ageBand] ?? emergingSource.record.ageBand,
      }
    : null;

  /* --- country signal --- */
  const countryNow = countBy(records, (r) => r.country);
  const countryPrev = countBy(previous.map((c) => c.record), (r) => r.country);

  const countries_: CountrySignal[] = MARKETS.map((m) => {
    const rows = records.filter((r) => r.country === m.country);
    const count = countryNow.get(m.country) ?? 0;
    const prevCount = countryPrev.get(m.country) ?? 0;
    // Normalise for the different period sizes so growth is a real signal.
    const normalisedPrev = (prevCount * total) / prevTotal;
    const growthPct =
      normalisedPrev === 0
        ? count > 0 ? 100 : 0
        : Math.round(((count - normalisedPrev) / normalisedPrev) * 100);
    const topicCounts = countBy(rows, (r) => r.topicL1);
    const topTopic = [...topicCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return {
      country: m.country,
      territory: m.territory,
      status: m.status,
      count,
      pct: pctOf(count, total),
      growthPct,
      netSentiment: rows.length
        ? Math.round((rows.reduce((a, r) => a + num(r.sentiment.overall.value), 0) / rows.length) * 50)
        : 0,
      plusSharePct: rows.length
        ? pctOf(rows.filter((r) => r.tier !== "free").length, rows.length)
        : 0,
      topTopic,
      holoMeSites: m.holoMeSites,
    };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const fastestGrowingCountry =
    [...countries_].filter((c) => c.count >= 8).sort((a, b) => b.growthPct - a.growthPct)[0] ?? null;

  /* --- language, age, experience, tier mixes --- */
  const langMap = countBy(current, (c) => c.languageLabel);
  const languages_ = [...langMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, pct: pctOf(count, total) }));

  const ageMap = countBy(records, (r) => r.ageBand);
  const ageBands = (["under-13", "13-17", "18-24", "25-34", "35+"] as const)
    .map((band) => ({
      band: AGE_LABEL[band],
      count: ageMap.get(band) ?? 0,
      pct: pctOf(ageMap.get(band) ?? 0, total),
    }))
    .filter((a) => a.count > 0);

  const expMap = new Map<string, number>();
  records.forEach((r) => {
    const t = topicByLabel(r.topicL1);
    const name = experienceName(t?.experience ?? "five_minutes");
    expMap.set(name, (expMap.get(name) ?? 0) + 1);
  });
  const experiences = [...expMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: pctOf(count, total) }));

  const tierMap = countBy(records, (r) => r.tier);
  const tiers = (["free", "plus", "family", "premium"] as MembershipTier[]).map((tier) => ({
    tier,
    label: TIER_LABEL[tier],
    count: tierMap.get(tier) ?? 0,
    pct: pctOf(tierMap.get(tier) ?? 0, total),
  }));

  /* --- care & escalation --- */
  const careMap = countBy(records, (r) => r.care);
  const care: CareSummary[] = (["Critical", "Care", "Watch", "Normal"] as CareLevel[]).map((level) => ({
    level,
    count: careMap.get(level) ?? 0,
    pct: pctOf(careMap.get(level) ?? 0, total),
  }));
  const careRank: Record<CareLevel, number> = { Critical: 0, Care: 1, Watch: 2, Normal: 3 };
  const careQueue = current
    .filter((c) => c.record.care !== "Normal")
    .sort((a, b) => careRank[a.record.care] - careRank[b.record.care])
    .slice(0, 24);
  const reviewCount = records.filter((r) => r.humanReview).length;

  /* --- what the world asked you this week (slide 9 curation) --- */
  const curation = buildCuration(current);

  const registerLabel =
    `${netSentiment > 0 ? "+" : ""}${netSentiment} — ${pctOf(positive, total)}% warm, ` +
    `${pctOf(neutral, total)}% neutral, ${pctOf(negative, total)}% discouraged about their own situation`;

  return {
    periodLabel,
    registerLabel,
    kpis: {
      conversations: total,
      countries,
      languages,
      avgDuration,
      netSentiment,
      satisfaction,
      memoryOptInPct: pctOf(memoryOptIn, total),
      returningPct: pctOf(returning, total),
      plusSharePct: pctOf(plusCount, total),
      holoMeSharePct: pctOf(holoMe, total),
    },
    sentiment: {
      positive: pctOf(positive, total),
      neutral: pctOf(neutral, total),
      negative: pctOf(negative, total),
    },
    topics,
    emerging,
    emergingQuote,
    countries: countries_,
    fastestGrowingCountry,
    languages: languages_,
    ageBands,
    experiences,
    care,
    careQueue,
    reviewCount,
    curation,
    memory: {
      optInPct: pctOf(memoryOptIn, total),
      hooksReady: records.filter((r) => r.continuityHook).length,
      returningPct: pctOf(returning, total),
    },
    tiers,
  };
}

/**
 * The curation queue behind slide 9: "WHAT THE WORLD ASKED YOU THIS WEEK".
 *
 * Ranks conversations by how much a personal 30-second answer from Lionel
 * would matter — significance and context depth first, then how many other
 * fans asked substantially the same thing. Deliberately NOT ranked by tier,
 * market value or sentiment.
 */
export function buildCuration(
  conversations: SeededConversation[],
  limit = 6,
): CuratedQuestion[] {
  // Service and product questions belong to Fan Relations, not to Lionel's
  // thirty seconds — and reserved topics never leave the platform at all.
  const NOT_FOR_LIONEL = new Set(["Products, tickets & experiences", "Reserved / out of scope"]);
  const withQuestions = conversations.filter(
    (c) =>
      c.record.questionAsked &&
      !c.record.brandSensitive &&
      !NOT_FOR_LIONEL.has(c.record.topicL1),
  );

  // Cluster: same L1 topic + same L2 sub-theme is "substantially the same ask".
  const clusterKey = (c: SeededConversation) =>
    `${c.record.topicL1}::${c.record.topicL2 ?? ""}`;
  const clusterCount = new Map<string, number>();
  withQuestions.forEach((c) =>
    clusterCount.set(clusterKey(c), (clusterCount.get(clusterKey(c)) ?? 0) + 1),
  );

  const scored = withQuestions.map((c) => {
    const r = c.record;
    const similar = clusterCount.get(clusterKey(c)) ?? 1;
    const score =
      num(r.significance.value) * 22 +
      num(r.contextDepth.value) * 12 +
      (typeof r.intentClarity.value === "number" ? r.intentClarity.value : 0) * 6 +
      Math.min(similar, 40) * 1.5 +
      (r.confirmation === "C" || r.confirmation === "CC" ? 10 : 0);
    return { c, similar, score };
  });

  // A floor before diversity: a light product question should never take a
  // slot in Lionel's queue just because it is the only one of its kind.
  const eligible = scored.filter(
    ({ c, similar }) => num(c.record.significance.value) >= 3 || similar >= 10,
  );
  const pool = eligible.length >= limit ? eligible : scored;

  // One per topic first, so Lionel's queue is never six versions of one thing.
  const seenTopics = new Set<string>();
  const ordered = pool.sort((a, b) => b.score - a.score);
  const picked: typeof ordered = [];
  for (const row of ordered) {
    if (seenTopics.has(row.c.record.topicL1)) continue;
    seenTopics.add(row.c.record.topicL1);
    picked.push(row);
    if (picked.length >= limit) break;
  }
  for (const row of ordered) {
    if (picked.length >= limit) break;
    if (!picked.includes(row)) picked.push(row);
  }

  return picked.slice(0, limit).map(({ c, similar }) => {
    const r = c.record;
    const t = topicByLabel(r.topicL1);
    const rationale =
      similar >= 12
        ? `${similar} fans asked substantially the same question this period — one answer reaches all of them.`
        : num(r.significance.value) >= 4
          ? "High personal significance — a milestone or hardship the fan is living through right now."
          : "Clear question with strong personal context and a confirmed summary.";
    return {
      reference: r.reference,
      question: r.questionAsked ?? r.summary,
      country: r.country,
      languageLabel: c.languageLabel,
      ageBand: AGE_LABEL[r.ageBand] ?? r.ageBand,
      topic: r.topicL1,
      significance: num(r.significance.value),
      similarCount: similar,
      rationale,
      experience: experienceName(t?.experience ?? "five_minutes"),
    };
  });
}
