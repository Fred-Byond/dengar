/**
 * THE MESSI WORLD BRIEF — the recurring deliverable (slides 8–9).
 *
 * One page Lionel and his management read each week: what the world asked,
 * what it means, what to make, who needs care, and where the business is
 * moving. Pure function over the seeded dataset (demo) or the live
 * aggregation API (production). Always human-reviewed before release.
 */

import { generateConversations, type SeededConversation } from "./seed";
import { buildPulse, type CuratedQuestion, type Pulse } from "./pulse";
import { teamName, topicByLabel, experienceName } from "./fvif";
import { MARKET_BY_COUNTRY } from "./markets";

export interface BriefTheme {
  rank: number;
  topic: string;
  conversations: number;
  deltaPts: number;
  quote: string;
  quoteCountry: string;
  quoteLanguage: string;
  quoteAge: string;
  countries: string[];
  owner: string;
  experience: string;
}

export interface ContentCommission {
  title: string;
  format: string;
  rationale: string;
  owner: string;
  demand: number;
}

export interface CommercialSignal {
  headline: string;
  detail: string;
}

export interface WorldBrief {
  weekLabel: string;
  classification: string;
  headline: string;
  pulse: Pulse;
  themes: BriefTheme[];
  askedOfLionel: CuratedQuestion[];
  commissions: ContentCommission[];
  careNote: string;
  territoryWatch: { growth: string; attention: string };
  commercial: CommercialSignal[];
  recommendedActions: string[];
}

function num(v: number | "IE" | "NE"): number {
  return typeof v === "number" ? v : 0;
}

export function buildWorldBrief(
  conversations: SeededConversation[] = generateConversations(320),
  weekLabel = "Week 33 · 10–16 August 2026",
): WorldBrief {
  const pulse = buildPulse(conversations, generateConversations(268, 20260713), weekLabel);
  const records = conversations.map((c) => c.record);
  const total = records.length || 1;

  /* --- themes: the top topics, each with a real fan voice under it --- */
  const themes: BriefTheme[] = pulse.topics.slice(0, 5).map((t, i) => {
    const group = conversations.filter((c) => c.record.topicL1 === t.label);
    const rep = [...group].sort(
      (a, b) =>
        num(b.record.significance.value) + num(b.record.contextDepth.value) -
        (num(a.record.significance.value) + num(a.record.contextDepth.value)),
    )[0];
    const countryCount = new Map<string, number>();
    group.forEach((g) =>
      countryCount.set(g.record.country, (countryCount.get(g.record.country) ?? 0) + 1),
    );
    const def = topicByLabel(t.label);
    return {
      rank: i + 1,
      topic: t.label,
      conversations: t.count,
      deltaPts: t.deltaPts,
      quote: rep?.record.questionAsked ?? rep?.record.summary ?? "—",
      quoteCountry: rep?.record.country ?? "",
      quoteLanguage: rep?.languageLabel ?? "",
      quoteAge: rep?.record.ageBand ?? "",
      countries: [...countryCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([c]) => c),
      owner: teamName(def?.defaultTeam ?? "content"),
      experience: experienceName(def?.experience ?? "five_minutes"),
    };
  });

  /* --- what to make next: demand-led commissions --- */
  const commissions = buildCommissions(conversations, pulse);

  /* --- care --- */
  const critical = pulse.care.find((c) => c.level === "Critical")?.count ?? 0;
  const careCount = pulse.care.find((c) => c.level === "Care")?.count ?? 0;
  const watch = pulse.care.find((c) => c.level === "Watch")?.count ?? 0;
  const careNote =
    `${critical} critical and ${careCount} care-level conversations were routed to trained fan-care officers this week; ` +
    `${watch} more are on the watch queue. ${pulse.reviewCount} records in total were held for human review before any content use. ` +
    `No conversation on the care queue was answered by the digital human alone.`;

  /* --- territory watch --- */
  const growth = pulse.fastestGrowingCountry;
  const attention = [...pulse.countries]
    .filter((c) => c.count >= 8)
    .sort((a, b) => a.netSentiment - b.netSentiment)[0];

  /* --- commercial signals --- */
  const openPartnerHighGrowth = pulse.countries
    .filter((c) => {
      const m = MARKET_BY_COUNTRY[c.country];
      return m && m.presentingPartner.includes("open") && c.growthPct > 0;
    })
    .sort((a, b) => b.growthPct - a.growthPct)[0];

  const holoMeShare = pulse.kpis.holoMeSharePct;
  const commercial: CommercialSignal[] = [
    {
      headline: `MESSI+ penetration at ${pulse.kpis.plusSharePct}% of conversations`,
      detail: `${pulse.tiers.filter((t) => t.tier !== "free").map((t) => `${t.label} ${t.pct}%`).join(" · ")}. Memory and priority scheduling remain the two benefits fans convert for.`,
    },
    openPartnerHighGrowth
      ? {
          headline: `${openPartnerHighGrowth.territory}: presenting-partner category still open`,
          detail: `Conversations up ${openPartnerHighGrowth.growthPct}% period on period with ${openPartnerHighGrowth.count} sessions. Strongest available territory to take to market next, subject to management approval.`,
        }
      : {
          headline: "No open presenting-partner category showed material growth this period",
          detail: "Recommend holding territory sales and concentrating on connectivity partnerships.",
        },
    {
      headline: `HoloMe accounted for ${holoMeShare}% of conversations`,
      detail:
        "Physical activations continue to convert into mobile relationships — the scan-to-continue handoff is the highest-intent acquisition path in the platform.",
    },
    {
      headline: `${pulse.memory.optInPct}% of fans opted into relationship memory`,
      detail: `${pulse.memory.hooksReady} continuity hooks are ready for the next conversation, and ${pulse.memory.returningPct}% of this week's conversations were returning fans. Memory is the retention engine, not the paywall.`,
    },
  ];

  /* --- recommended actions --- */
  const topTheme = themes[0];
  const topCommission = commissions[0];
  const recommendedActions = [
    topTheme
      ? `Commission a ${topTheme.experience} response to "${topTheme.topic}" (${topTheme.conversations} conversations, ${topTheme.deltaPts >= 0 ? "+" : ""}${topTheme.deltaPts} pts share) — owner: ${topTheme.owner}.`
      : "",
    pulse.emerging
      ? `Brief Lionel on the emerging signal: "${pulse.emerging.label}" moved ${pulse.emerging.deltaPts >= 0 ? "+" : ""}${pulse.emerging.deltaPts} pts of share period on period.`
      : "",
    pulse.curation[0]
      ? `Put "${truncate(pulse.curation[0].question, 90)}" (${pulse.curation[0].country}, ${pulse.curation[0].ageBand}) at the top of the 30-second response queue — ${pulse.curation[0].similarCount} fans asked substantially the same thing.`
      : "",
    growth
      ? `${growth.territory} grew ${growth.growthPct}% period on period (${growth.count} conversations, top theme: ${growth.topTopic}). Recommend a localised campaign and a HoloMe activation review.`
      : "",
    attention
      ? `${attention.country} carries the most discouraged emotional register of the material markets (${attention.netSentiment > 0 ? "+" : ""}${attention.netSentiment}) — review the local script, the language quality and the fan-care signposting before scaling spend.`
      : "",
    topCommission
      ? `Green-light "${topCommission.title}" for ${topCommission.owner} — ${topCommission.demand} conversations point at it.`
      : "",
  ].filter(Boolean);

  const sameLeader = !!topTheme && pulse.emerging?.label === topTheme.topic;
  const headline =
    `${total.toLocaleString("en-US")} conversations across ${pulse.kpis.countries} countries and ` +
    `${pulse.kpis.languages} languages. Average conversation ${pulse.kpis.avgDuration} of the five minutes, ` +
    `satisfaction ${pulse.kpis.satisfaction}/5. Emotional register ${pulse.registerLabel}. ` +
    (topTheme
      ? sameLeader
        ? `${topTheme.topic} both leads the world's questions and grew fastest (${topTheme.deltaPts >= 0 ? "+" : ""}${topTheme.deltaPts} pts of share).`
        : `${topTheme.topic} leads the world's questions${pulse.emerging ? `, while "${pulse.emerging.label}" is the fastest-growing theme` : ""}.`
      : "Questions were evenly spread across themes.");

  return {
    weekLabel,
    classification: "CONFIDENTIAL — DEMO · Auto-generated, human-reviewed before release",
    headline,
    pulse,
    themes,
    askedOfLionel: pulse.curation,
    commissions,
    careNote,
    territoryWatch: {
      growth: growth
        ? `${growth.territory} · +${growth.growthPct}% · ${growth.count} conversations · top theme ${growth.topTopic}`
        : "No material growth outlier this period.",
      attention: attention
        ? `${attention.country} · emotional register ${attention.netSentiment > 0 ? "+" : ""}${attention.netSentiment} · ${attention.count} conversations`
        : "No market required attention this period.",
    },
    commercial,
    recommendedActions,
  };
}

/**
 * Demand-led content commissions: what the conversations say should be made
 * next, ranked by how many fans pointed at it. This is the mechanism that
 * turns listening into a production plan.
 */
function buildCommissions(
  conversations: SeededConversation[],
  pulse: Pulse,
): ContentCommission[] {
  const byL2 = new Map<string, { count: number; topic: string; sample: SeededConversation }>();
  conversations.forEach((c) => {
    const r = c.record;
    if (!r.topicL2 || r.brandSensitive) return;
    const key = `${r.topicL1}::${r.topicL2}`;
    const cur = byL2.get(key);
    if (cur) {
      cur.count += 1;
      // Prefer a sample that actually contains a question to quote.
      if (!cur.sample.record.questionAsked && r.questionAsked) cur.sample = c;
    } else {
      byL2.set(key, { count: 1, topic: r.topicL1, sample: c });
    }
  });

  const FORMAT: Record<string, string> = {
    "Messi Academy": "Coached module — 3 × 4-minute drills with a digital-Messi introduction",
    "Messi Inspires": "Personalised encouragement script + one 30-second Lionel response",
    "Messi Stories": "8-minute bedtime story, age 5–9, parental-controlled environment",
    "Messi Exclusive": "Interactive career story with branching questions",
    "5 Minutes With Messi": "Conversation script update",
    "My Messi": "Memory-led follow-up moment",
    "Messi Moments": "Milestone message template",
    "Messi For Good": "Community programme response pack",
  };

  return [...byL2.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([key, v]) => {
      const l2 = key.split("::")[1];
      const def = topicByLabel(v.topic);
      const experience = experienceName(def?.experience ?? "five_minutes");
      const share = pulse.topics.find((t) => t.label === v.topic);
      return {
        title: l2,
        format: FORMAT[experience] ?? "Content module",
        rationale:
          `${v.count} conversations landed on this sub-theme` +
          (share ? ` (${share.pct}% of all conversations sit in ${v.topic.toLowerCase()}${share.deltaPts >= 0 ? `, ${share.deltaPts >= 0 ? "+" : ""}${share.deltaPts} pts period on period` : ""})` : "") +
          `. Example: "${truncate(v.sample.record.questionAsked ?? v.sample.record.summary, 90)}"`,
        owner: teamName(def?.defaultTeam ?? "content"),
        demand: v.count,
      };
    });
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}
