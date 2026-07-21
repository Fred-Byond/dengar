/**
 * Weekly Ministry Briefing generator — §5.1 (Brief) of the Development Plan.
 *
 * The recurring deliverable the platform fee is anchored to. Pure function:
 * takes the week's Session Insight Records (via the seeded generator for the
 * demo, or the live aggregation API in production) and produces the briefing
 * model — headline, top pain points with representative quotes, citizen
 * suggestions, geographic watch, emerging keywords, accountability and
 * recommended follow-ups. Always human-reviewed before release.
 */

import { generateSessions, type SeededSession } from "./seed";
import { TAXONOMY, departmentName } from "./cvif";

export interface BriefingPainPoint {
  rank: number;
  topic: string;
  sessions: number;
  quote: string;
  quoteMeta: string;
  districts: string[];
  owner: string;
}

export interface BriefingSuggestion {
  ask: string;
  sessions: number;
  states: number;
  status: "ACTIONED" | "ACKNOWLEDGED" | "UNDER REVIEW";
}

export interface BriefingGeo {
  state: string;
  divergence: number; // pts vs national mean
  topTopic: string;
  sessions: number;
}

export interface Briefing {
  weekLabel: string;
  classification: string;
  headline: string;
  kpis: { sessions: number; citizens: number; netSentiment: number; satisfaction: string };
  painPoints: BriefingPainPoint[];
  suggestions: BriefingSuggestion[];
  sentiment: { positive: number; neutral: number; negative: number };
  languages: { label: string; pct: number }[];
  nationalMean: number;
  geoNegative: BriefingGeo[];
  geoPositive: BriefingGeo[];
  keywords: { word: string; count: number }[];
  accountability: { department: string; open: number }[];
  urgentCount: number;
  reviewCount: number;
  followUps: string[];
}

function num(v: number | "IE"): number {
  return v === "IE" ? 0 : v;
}

function ownerFor(topicLabel: string): string {
  const t = TAXONOMY.find((x) => x.label === topicLabel);
  return departmentName(t?.defaultDepartment ?? "polisi");
}

export function buildBriefing(
  sessions: SeededSession[] = generateSessions(240),
  weekLabel = "Week 29 · 13–19 July 2026",
): Briefing {
  const records = sessions.map((s) => s.record);
  const total = records.length;

  // --- headline KPIs ---
  // sentiment values are -2…+2; normalise the mean to a -100…+100 net index
  const netSentiment = Math.round(
    (records.reduce((a, r) => a + num(r.sentiment.overall.value), 0) / total) * 50,
  );
  const avgSat = (sessions.reduce((a, s) => a + s.satisfaction, 0) / total).toFixed(1);
  const citizens = Math.round(total * 0.93);

  // --- sentiment split ---
  let positive = 0, neutral = 0, negative = 0;
  records.forEach((r) => {
    const v = num(r.sentiment.overall.value);
    if (v > 0) positive++;
    else if (v < 0) negative++;
    else neutral++;
  });
  const pct = (n: number) => Math.round((n / total) * 100);

  // --- pain points: negative records grouped by topic ---
  const byTopicNeg = new Map<string, SeededSession[]>();
  sessions.forEach((s) => {
    if (num(s.record.sentiment.overall.value) < 0) {
      const k = s.record.topicL1;
      byTopicNeg.set(k, [...(byTopicNeg.get(k) ?? []), s]);
    }
  });
  const painPoints: BriefingPainPoint[] = [...byTopicNeg.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([topic, group], i) => {
      // representative = strongest evidence + impact
      const rep = [...group].sort(
        (a, b) =>
          num(b.record.impact.value) + num(b.record.evidence.value) -
          (num(a.record.impact.value) + num(a.record.evidence.value)),
      )[0];
      const distCount = new Map<string, number>();
      group.forEach((g) => distCount.set(g.record.district, (distCount.get(g.record.district) ?? 0) + 1));
      const districts = [...distCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map((d) => d[0]);
      return {
        rank: i + 1,
        topic,
        sessions: group.length,
        quote: rep.record.painPoint ?? rep.record.summary,
        quoteMeta: `${rep.record.district}, ${rep.record.state} · ${rep.languageLabel}`,
        districts,
        owner: ownerFor(topic),
      };
    });

  // --- suggestions: cluster by suggestion text ---
  const sugMap = new Map<string, { count: number; states: Set<string> }>();
  records.forEach((r) => {
    if (!r.suggestion) return;
    const cur = sugMap.get(r.suggestion) ?? { count: 0, states: new Set<string>() };
    cur.count++;
    cur.states.add(r.state);
    sugMap.set(r.suggestion, cur);
  });
  const suggestions: BriefingSuggestion[] = [...sugMap.entries()]
    .map(([ask, v]) => ({ ask, count: v.count, states: v.states.size }))
    .sort((a, b) => b.count * b.states - a.count * a.states)
    .slice(0, 5)
    .map((s, i) => ({
      ask: s.ask,
      sessions: s.count,
      states: s.states,
      status: (i === 0 ? "ACTIONED" : i <= 2 ? "ACKNOWLEDGED" : "UNDER REVIEW") as BriefingSuggestion["status"],
    }));

  // --- languages ---
  const langMap = new Map<string, number>();
  sessions.forEach((s) => langMap.set(s.languageLabel, (langMap.get(s.languageLabel) ?? 0) + 1));
  const languages = [...langMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, n]) => ({ label, pct: pct(n) }));

  // --- geographic divergence vs national mean ---
  const stateAgg = new Map<string, { sum: number; n: number; topics: Map<string, number> }>();
  records.forEach((r) => {
    const a = stateAgg.get(r.state) ?? { sum: 0, n: 0, topics: new Map() };
    a.sum += num(r.sentiment.overall.value);
    a.n++;
    a.topics.set(r.topicL1, (a.topics.get(r.topicL1) ?? 0) + 1);
    stateAgg.set(r.state, a);
  });
  const nationalMean = netSentiment;
  const geo: BriefingGeo[] = [...stateAgg.entries()]
    .filter(([, a]) => a.n >= 4)
    .map(([state, a]) => {
      const mean = Math.round((a.sum / a.n) * 50);
      const topTopic = [...a.topics.entries()].sort((x, y) => y[1] - x[1])[0][0];
      return { state, divergence: mean - nationalMean, topTopic, sessions: a.n };
    });
  const geoNegative = [...geo].sort((a, b) => a.divergence - b.divergence).slice(0, 3);
  const geoPositive = [...geo].sort((a, b) => b.divergence - a.divergence).slice(0, 3);

  // --- keywords ---
  const kwMap = new Map<string, number>();
  records.forEach((r) => r.keywords.forEach((k) => kwMap.set(k, (kwMap.get(k) ?? 0) + 1)));
  const keywords = [...kwMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // --- accountability: open actions by recommended owner (flagged/urgent) ---
  const acctMap = new Map<string, number>();
  records.forEach((r) => {
    if (r.humanReview || r.urgency === "Urgent" || r.urgency === "Critical") {
      const owner = ownerFor(r.topicL1);
      acctMap.set(owner, (acctMap.get(owner) ?? 0) + 1);
    }
  });
  const accountability = [...acctMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([department, open]) => ({ department, open }));

  const urgentCount = records.filter((r) => r.urgency === "Urgent" || r.urgency === "Critical").length;
  const reviewCount = records.filter((r) => r.humanReview).length;

  // --- recommended follow-ups (derived from the data) ---
  const worst = geoNegative[0];
  const topPain = painPoints[0];
  const followUps = [
    topPain
      ? `Operational review of "${topPain.topic}" (${topPain.sessions} sessions) — route to ${topPain.owner}, concentrated in ${topPain.districts.slice(0, 2).join(" & ")}.`
      : "",
    worst
      ? `${worst.state} sits ${worst.divergence} pts below the national mean (top concern: ${worst.topTopic}). Recommend a dedicated ${worst.state} session block and a field feasibility review.`
      : "",
    `${urgentCount} urgent/critical sessions require same-day human review; ${reviewCount} flagged in total this week.`,
    suggestions[0]
      ? `Advance the top citizen suggestion — "${suggestions[0].ask}" (${suggestions[0].sessions} sessions across ${suggestions[0].states} states) — toward a public "you said, we did" announcement.`
      : "",
  ].filter(Boolean);

  const headline =
    `${total.toLocaleString("en-MY")} sessions this week. Net sentiment ${nationalMean > 0 ? "+" : ""}${nationalMean}, ` +
    `driven by ${topPain ? topPain.topic.toLowerCase() : "service"} concerns` +
    `${worst ? ` and a divergence in ${worst.state}` : ""}. ` +
    `Session-experience satisfaction ${avgSat}/5. ${urgentCount} urgent items escalated for same-day review.`;

  return {
    weekLabel,
    classification: "CONFIDENTIAL — DEMO · Auto-generated, human-reviewed",
    headline,
    kpis: { sessions: total, citizens, netSentiment: nationalMean, satisfaction: avgSat },
    painPoints,
    suggestions,
    sentiment: { positive: pct(positive), neutral: pct(neutral), negative: pct(negative) },
    languages,
    nationalMean,
    geoNegative,
    geoPositive,
    keywords,
    accountability,
    urgentCount,
    reviewCount,
    followUps,
  };
}
