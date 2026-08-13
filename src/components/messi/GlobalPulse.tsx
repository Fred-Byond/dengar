"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { generateConversations } from "@/lib/messi/seed";
import { buildPulse, type CountrySignal, type TopicSignal } from "@/lib/messi/pulse";
import { buildWorldBrief } from "@/lib/messi/brief";
import {
  MANAGEMENT_CONTROLS,
  OPERATING_SPLIT,
  REVENUE_ENGINES,
  RIGHTS_CATEGORIES,
  TELCO_MODEL,
  TIERS,
  modelRevenue,
  type CategoryStatus,
} from "@/lib/messi/commercial";
import { MARKET_BY_COUNTRY } from "@/lib/messi/markets";
import { EXCLUDED_CONFOUNDS, PLATFORM_INVARIANTS } from "@/lib/messi/fvif";

type View = "pulse" | "business";

const STATUS_STYLE: Record<string, string> = {
  live: "bg-messi-live/15 text-emerald-700",
  launching: "bg-messi-gold/20 text-[#7a5c00]",
  pipeline: "bg-slate-100 text-slate-500",
  reserved: "bg-messi-plus/12 text-[#a01e5c]",
};

const CATEGORY_STYLE: Record<CategoryStatus, string> = {
  available: "bg-messi-live/15 text-emerald-700",
  held: "bg-messi-gold/20 text-[#7a5c00]",
  reserved: "bg-messi-sky/20 text-messi-sky-deep",
  prohibited: "bg-red/10 text-red",
};

export default function GlobalPulse() {
  const conversations = useMemo(() => generateConversations(320), []);
  const previous = useMemo(() => generateConversations(268, 20260713), []);
  const pulse = useMemo(
    () => buildPulse(conversations, previous),
    [conversations, previous],
  );
  const brief = useMemo(() => buildWorldBrief(conversations), [conversations]);

  const [view, setView] = useState<View>("pulse");
  const [queued, setQueued] = useState<string[]>([]);

  /**
   * The demo scales the modelled business off the seeded sample: 320 sampled
   * conversations stand in for a platform at 3.2M monthly conversations.
   */
  const revenue = useMemo(
    () =>
      modelRevenue({
        activeFans: 4_200_000,
        partnerTerritories: pulse.countries.filter(
          (c) => MARKET_BY_COUNTRY[c.country]?.status === "live",
        ).length,
        partnerAnnualValue: 3_500_000,
      }),
    [pulse.countries],
  );

  return (
    <div className="min-h-screen bg-messi-canvas text-ink">
      {/* header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-messi-night via-messi-deep to-messi-slate px-5 py-3 text-white sm:px-7">
        <div className="mx-auto flex max-w-dashboard flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Mark />
            <div>
              <div className="text-[15px] font-extrabold leading-none tracking-wide">
                MESSI<span className="font-light text-messi-sky">.LIVE</span>
              </div>
              <div className="mt-1 text-[10px] font-bold tracking-[0.14em] text-white/60">
                GLOBAL PULSE · BYOND ASIA
              </div>
            </div>
          </div>

          <div className="flex rounded-xl bg-white/10 p-0.5 text-xs font-extrabold">
            <button
              onClick={() => setView("pulse")}
              className={`rounded-lg px-3 py-2 transition ${view === "pulse" ? "bg-white text-messi-deep" : "text-white/75"}`}
            >
              Messi view — the relationship
            </button>
            <button
              onClick={() => setView("business")}
              className={`rounded-lg px-3 py-2 transition ${view === "business" ? "bg-white text-messi-deep" : "text-white/75"}`}
            >
              Management view — the business
            </button>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="hidden rounded-lg bg-white/10 px-3 py-2 text-[11px] font-bold text-white/70 lg:block">
              {pulse.periodLabel}
            </span>
            <Link href="/messi/conversations" className="rounded-lg bg-white/15 px-3 py-2 text-xs font-extrabold">
              Conversations
            </Link>
            <Link href="/messi/brief" className="rounded-lg bg-messi-gold px-3 py-2 text-xs font-extrabold text-[#3A2C00]">
              World Brief
            </Link>
            <Link href="/messi" className="rounded-lg bg-white/15 px-3 py-2 text-xs font-extrabold">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-dashboard px-5 pb-20 pt-5 sm:px-7">
        {view === "pulse" ? (
          <PulseView pulse={pulse} brief={brief} queued={queued} setQueued={setQueued} />
        ) : (
          <BusinessView pulse={pulse} brief={brief} revenue={revenue} />
        )}
      </main>
    </div>
  );
}

/* ============================ MESSI VIEW ============================ */

function PulseView({
  pulse,
  brief,
  queued,
  setQueued,
}: {
  pulse: ReturnType<typeof buildPulse>;
  brief: ReturnType<typeof buildWorldBrief>;
  queued: string[];
  setQueued: (v: string[]) => void;
}) {
  return (
    <>
      {/* KPI band */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Conversations" value={pulse.kpis.conversations.toLocaleString("en-US")} sub="this period" accent="#2E6FA7" />
        <Kpi label="Countries" value={String(pulse.kpis.countries)} sub="territories live" accent="#75AADB" />
        <Kpi label="Languages" value={String(pulse.kpis.languages)} sub="spoken by Messi" accent="#E7B94E" />
        <Kpi label="Avg conversation" value={pulse.kpis.avgDuration} sub="of five minutes" accent="#22C58B" />
        <Kpi
          label="Emotional register"
          value={`${pulse.kpis.netSentiment > 0 ? "+" : ""}${pulse.kpis.netSentiment}`}
          sub="fans' own situations, −100…+100"
          accent={pulse.kpis.netSentiment >= 0 ? "#22C58B" : "#D22030"}
        />
        <Kpi label="Satisfaction" value={`${pulse.kpis.satisfaction}/5`} sub="fan-rated" accent="#F3579A" />
      </section>

      <p className="mt-3 text-[11px] font-semibold text-grey">
        Instead of followers, likes and views, MESSI.LIVE measures relationships, conversations,
        needs, emotions and intent — one Fan Insight Record per controlled five-minute conversation.
        Emotional register reads the fan&rsquo;s own situation, not their feeling about Messi: a
        negative register is usually a young player being honest about a setback.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* what the world is asking */}
        <Panel title="What the world is asking" className="lg:col-span-2">
          <div className="space-y-2.5">
            {pulse.topics.slice(0, 8).map((t) => (
              <TopicBar key={t.label} topic={t} />
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          {/* emerging signal */}
          <Panel title="Emerging signal" accent>
            {pulse.emerging ? (
              <>
                <div className="text-[22px] font-extrabold leading-tight">{pulse.emerging.label}</div>
                <div className="mt-1 text-sm font-bold text-messi-sky-deep">
                  {pulse.emerging.deltaPts >= 0 ? "+" : ""}
                  {pulse.emerging.deltaPts} pts of share, period on period
                </div>
                {pulse.emergingQuote && (
                  <blockquote className="mt-3 border-l-[3px] border-messi-sky bg-white/70 px-3 py-2 text-[13px] italic text-slate-600">
                    &ldquo;{pulse.emergingQuote.quote}&rdquo;
                    <span className="mt-1 block text-[11px] font-semibold not-italic text-grey">
                      {pulse.emergingQuote.country} · <bdi>{pulse.emergingQuote.languageLabel}</bdi> ·{" "}
                      {pulse.emergingQuote.ageBand}
                    </span>
                  </blockquote>
                )}
                <p className="mt-3 text-[12px] text-grey">
                  Owner: <b className="text-ink">{pulse.emerging.team}</b> · feeds{" "}
                  <b className="text-ink">{pulse.emerging.experience}</b>
                </p>
              </>
            ) : (
              <p className="text-sm text-grey">No material movement this period.</p>
            )}
          </Panel>

          {/* care */}
          <Panel title="Care & escalation">
            <div className="space-y-2">
              {pulse.care.map((c) => (
                <div key={c.level} className="flex items-center gap-2 text-[13px]">
                  <span
                    className="h-2.5 w-2.5 flex-none rounded-full"
                    style={{
                      background:
                        c.level === "Critical" ? "#D22030"
                        : c.level === "Care" ? "#E8804A"
                        : c.level === "Watch" ? "#E7B94E"
                        : "#C7CDD9",
                    }}
                  />
                  <span className="font-bold">{c.level}</span>
                  <span className="ml-auto tabular-nums font-extrabold">{c.count}</span>
                  <span className="w-9 text-right text-[11px] text-grey tabular-nums">{c.pct}%</span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-red/5 px-3 py-2 text-[11.5px] leading-relaxed text-slate-600">
              {pulse.reviewCount} conversations held for human review before any content use. No
              conversation on the care queue is ever answered by the digital human alone.
            </p>
            <Link
              href="/messi/conversations?queue=care"
              className="mt-2 inline-block text-[12px] font-extrabold text-messi-sky-deep hover:underline"
            >
              Open the fan-care queue →
            </Link>
          </Panel>
        </div>
      </div>

      {/* what the world asked you this week */}
      <section className="mt-6">
        <SectionHead
          eyebrow="The loop back to Lionel"
          title="What the world asked you this week"
          note="Ranked by how much a personal answer would matter — significance, context and how many fans asked the same thing. Never ranked by membership tier or market value."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pulse.curation.map((q) => {
            const isQueued = queued.includes(q.reference);
            return (
              <article key={q.reference} className="flex flex-col rounded-2xl border border-line bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide">
                  <span className="rounded-md bg-messi-sky/15 px-1.5 py-0.5 text-messi-sky-deep">{q.topic}</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-500">{q.ageBand}</span>
                  {q.similarCount > 1 && (
                    <span className="rounded-md bg-messi-gold/20 px-1.5 py-0.5 text-[#7a5c00]">
                      {q.similarCount} asked this
                    </span>
                  )}
                </div>
                <p className="mt-2 flex-1 text-[14px] font-semibold leading-relaxed">
                  &ldquo;{q.question}&rdquo;
                </p>
                <p className="mt-2 text-[11px] font-semibold text-grey">
                  {q.country} · <bdi>{q.languageLabel}</bdi> · {q.reference}
                </p>
                <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">{q.rationale}</p>
                <button
                  onClick={() =>
                    setQueued(isQueued ? queued.filter((r) => r !== q.reference) : [...queued, q.reference])
                  }
                  className={`mt-3 rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
                    isQueued
                      ? "bg-messi-live/15 text-emerald-700"
                      : "bg-messi-deep text-white hover:brightness-125"
                  }`}
                >
                  {isQueued ? "✓ Queued for Lionel — 30-second response" : "Record a 30-second response"}
                </button>
                <p className="mt-1.5 text-[10.5px] text-grey">
                  Publishes through <b>{q.experience}</b>, localised under the approved process.
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* mixes + relationship */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Panel title="Country signal">
          <div className="space-y-2">
            {pulse.countries.slice(0, 8).map((c) => (
              <div key={c.country} className="flex items-center gap-2 text-[13px]">
                <span className="w-28 truncate font-bold">{c.country}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
                  <div className="h-full rounded bg-messi-sky-deep" style={{ width: `${Math.min(c.pct * 5, 100)}%` }} />
                </div>
                <b className="w-10 text-right tabular-nums">{c.count}</b>
                <span
                  className={`w-14 text-right text-[11px] font-extrabold tabular-nums ${c.growthPct >= 0 ? "text-emerald-600" : "text-red"}`}
                >
                  {c.growthPct >= 0 ? "+" : ""}
                  {c.growthPct}%
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Language & age">
          <div className="mb-3 space-y-1.5">
            {pulse.languages.slice(0, 6).map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-[12.5px]">
                <span className="w-28 truncate font-bold">{l.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
                  <div className="h-full rounded bg-messi-sky" style={{ width: `${l.pct * 3}%` }} />
                </div>
                <b className="w-8 text-right tabular-nums">{l.pct}%</b>
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-3">
            {pulse.ageBands.map((a) => (
              <div key={a.band} className="flex items-center gap-2 text-[12.5px]">
                <span className="w-28 font-bold">{a.band}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
                  <div className="h-full rounded bg-messi-gold" style={{ width: `${a.pct * 3}%` }} />
                </div>
                <b className="w-8 text-right tabular-nums">{a.pct}%</b>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="The relationship layer">
          <StatRow label="Memory opt-in" value={`${pulse.memory.optInPct}%`} note="fans who asked to be remembered" />
          <StatRow label="Continuity hooks ready" value={String(pulse.memory.hooksReady)} note="openers for the next conversation" />
          <StatRow label="Returning fans" value={`${pulse.memory.returningPct}%`} note="of this period's conversations" />
          <StatRow label="MESSI+ share" value={`${pulse.kpis.plusSharePct}%`} note="of conversations from members" />
          <StatRow label="HoloMe share" value={`${pulse.kpis.holoMeSharePct}%`} note="physical activations" />
          <p className="mt-3 text-[11.5px] leading-relaxed text-grey">
            Conversation creates connection. Memory creates continuity — and continuity, not
            content volume, is what turns an audience into a relationship.
          </p>
        </Panel>
      </div>

      {/* commissions */}
      <section className="mt-6">
        <SectionHead
          eyebrow="From listening to production"
          title="What the conversations say to make next"
          note="Demand-led commissions, ranked by how many fans pointed at them."
        />
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {brief.commissions.map((c) => (
            <div key={c.title} className="flex flex-wrap items-start gap-3 border-b border-line px-4 py-3 last:border-0">
              <div className="min-w-[200px] flex-1">
                <div className="text-[14px] font-extrabold">{c.title}</div>
                <div className="mt-0.5 text-[12px] text-grey">{c.format}</div>
                <p className="mt-1 text-[12px] text-slate-500">{c.rationale}</p>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-grey">Demand</div>
                <div className="text-xl font-extrabold tabular-nums">{c.demand}</div>
                <div className="mt-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600">
                  {c.owner}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* governance footer */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <SectionHead eyebrow="Fan Voice Intelligence Framework" title="What this system never does" note="" />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-messi-sky-deep">
              Excluded from every score
            </div>
            <ul className="space-y-1 text-[12.5px] text-slate-600">
              {EXCLUDED_CONFOUNDS.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-red">✕</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-messi-sky-deep">
              True on every conversation
            </div>
            <ul className="space-y-1 text-[12.5px] text-slate-600">
              {PLATFORM_INVARIANTS.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-emerald-600">✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

/* ========================== MANAGEMENT VIEW ========================== */

function BusinessView({
  pulse,
  brief,
  revenue,
}: {
  pulse: ReturnType<typeof buildPulse>;
  brief: ReturnType<typeof buildWorldBrief>;
  revenue: ReturnType<typeof modelRevenue>;
}) {
  const usd = (n: number) =>
    n >= 1_000_000 ? `US$${(n / 1_000_000).toFixed(1)}M` : `US$${Math.round(n / 1000)}k`;

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Modelled subscription ARR" value={usd(revenue.subscriptionArr)} sub="illustrative, 4.2M active fans" accent="#F3579A" />
        <Kpi label="Modelled partnership ARR" value={usd(revenue.partnershipArr)} sub="live presenting territories" accent="#E7B94E" />
        <Kpi label="Total modelled ARR" value={usd(revenue.totalArr)} sub="before commerce & licensing" accent="#2E6FA7" />
        <Kpi label="Territories active" value={String(pulse.countries.length)} sub="one platform, many markets" accent="#22C58B" />
      </section>

      <p className="mt-3 text-[11px] font-semibold text-grey">
        Illustrative model for the management conversation. Every partner slot, category and
        territory below remains subject to management approval and to existing contractual rights.
      </p>

      {/* territories */}
      <section className="mt-5">
        <SectionHead
          eyebrow="Global IP. Local commercialisation."
          title="Territory performance & commercial status"
          note="One official platform; dozens of territorial partnerships, each approved separately."
        />
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead className="bg-slate-50 text-[10.5px] font-extrabold uppercase tracking-wide text-grey">
              <tr>
                <th className="px-4 py-2.5">Territory</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Conversations</th>
                <th className="px-3 py-2.5 text-right">Growth</th>
                <th className="px-3 py-2.5 text-right">Register</th>
                <th className="px-3 py-2.5 text-right">MESSI+</th>
                <th className="px-3 py-2.5 text-right">HoloMe</th>
                <th className="px-4 py-2.5">Presenting partner</th>
              </tr>
            </thead>
            <tbody>
              {pulse.countries.map((c) => (
                <TerritoryRow key={c.country} c={c} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* revenue engines */}
        <Panel title="The nine revenue engines">
          <div className="space-y-2">
            {REVENUE_ENGINES.map((e) => (
              <div key={e.no} className="flex items-start gap-3">
                <span className="mt-0.5 text-[11px] font-extrabold tabular-nums text-messi-sky-deep">{e.no}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <b className="text-[13px]">{e.name}</b>
                    <span className="ml-auto text-[11px] font-bold text-grey">{e.horizon}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500">{e.description}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-100">
                    <div className="h-full rounded bg-messi-sky-deep" style={{ width: `${e.sharePct * 4}%` }} />
                  </div>
                </div>
                <b className="w-9 text-right text-[12px] tabular-nums">{e.sharePct}%</b>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] text-grey">
            No single source carries the business — the platform monetises the same relationship
            repeatedly across markets.
          </p>
        </Panel>

        {/* membership */}
        <Panel title="MESSI+ — the membership layer">
          <div className="space-y-2.5">
            {TIERS.map((t) => {
              const live = pulse.tiers.find((x) => x.tier === t.id);
              const model = revenue.byTier.find((x) => x.tier === t.name);
              return (
                <div key={t.id} className="rounded-xl border border-line p-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <b className="text-[13.5px]">{t.name}</b>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-bold text-slate-600">
                      {t.price}
                    </span>
                    <span className="ml-auto text-[11.5px] font-bold text-grey">
                      {live ? `${live.pct}% of conversations` : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-slate-500">{t.positioning}</p>
                  {model && model.mrr > 0 && (
                    <p className="mt-1 text-[11.5px] font-semibold text-messi-plus">
                      Modelled {usd(model.mrr)} MRR from {model.fans.toLocaleString("en-US")} members
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11.5px] text-grey">
            Fans do not pay to meet Messi. They pay to deepen the relationship — memory, priority
            and continuity are the benefits that convert.
          </p>
        </Panel>

        {/* telco */}
        <Panel title="Mobile operators as the distribution engine">
          <div className="space-y-2.5">
            {TELCO_MODEL.map((r) => (
              <div key={r.offer} className="rounded-xl bg-slate-50 p-3">
                <b className="text-[13px]">{r.offer}</b>
                <div className="mt-1.5 grid gap-1 text-[11.5px] text-slate-600 sm:grid-cols-2">
                  <div>
                    <span className="font-extrabold uppercase tracking-wide text-[10px] text-grey">Operator brings</span>
                    <div>{r.operatorContribution}</div>
                  </div>
                  <div>
                    <span className="font-extrabold uppercase tracking-wide text-[10px] text-grey">Platform gains</span>
                    <div>{r.platformBenefit}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] font-semibold text-messi-sky-deep">
            MESSI.LIVE → TELCO → MILLIONS OF FANS. A B2B2C model that does not acquire fans one by one.
          </p>
        </Panel>

        {/* rights matrix */}
        <Panel title="Global Rights Matrix — category control">
          <div className="space-y-1.5">
            {RIGHTS_CATEGORIES.map((c) => (
              <div key={c.category} className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <span className="min-w-[180px] flex-1 text-[12.5px] font-semibold">{c.category}</span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${CATEGORY_STYLE[c.status]}`}>
                  {c.status}
                </span>
                <span className="w-full text-[11px] text-grey">{c.note}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* commercial signals + governance */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Commercial signals this period">
          <div className="space-y-3">
            {brief.commercial.map((s) => (
              <div key={s.headline} className="border-l-[3px] border-messi-gold pl-3">
                <b className="text-[13px]">{s.headline}</b>
                <p className="mt-0.5 text-[12px] text-slate-500">{s.detail}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Maximise value. Protect Messi.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-messi-sky-deep">
                BYOND operates
              </div>
              <ul className="space-y-1 text-[12px] text-slate-600">
                {OPERATING_SPLIT.byond.map((x) => (
                  <li key={x}>▸ {x}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-messi-plus">
                Management controls
              </div>
              <ul className="space-y-1 text-[12px] text-slate-600">
                {OPERATING_SPLIT.management.map((x) => (
                  <li key={x}>▸ {x}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {MANAGEMENT_CONTROLS.map((c) => (
              <span key={c} className="rounded-full bg-messi-deep px-2.5 py-1 text-[10.5px] font-bold text-white">
                {c}
              </span>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function TerritoryRow({ c }: { c: CountrySignal }) {
  const market = MARKET_BY_COUNTRY[c.country];
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-2.5">
        <div className="font-extrabold">{c.territory}</div>
        <div className="text-[11px] text-grey">Top theme: {c.topTopic}</div>
      </td>
      <td className="px-3 py-2.5">
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${STATUS_STYLE[c.status] ?? ""}`}>
          {c.status}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right font-bold tabular-nums">{c.count}</td>
      <td className={`px-3 py-2.5 text-right font-extrabold tabular-nums ${c.growthPct >= 0 ? "text-emerald-600" : "text-red"}`}>
        {c.growthPct >= 0 ? "+" : ""}
        {c.growthPct}%
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        {c.netSentiment > 0 ? "+" : ""}
        {c.netSentiment}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">{c.plusSharePct}%</td>
      <td className="px-3 py-2.5 text-right tabular-nums">{c.holoMeSites}</td>
      <td className="px-4 py-2.5 text-[11.5px] text-slate-500">
        {market?.presentingPartner ?? "—"}
        <div className="text-[10.5px] text-grey">{market?.localPrice}</div>
      </td>
    </tr>
  );
}

/* ============================== atoms ============================== */

function Mark() {
  return (
    <svg viewBox="0 0 26 26" className="h-8 w-8" aria-hidden>
      <circle cx="13" cy="13" r="12" stroke="#75AADB" strokeWidth="1.4" fill="none" opacity=".55" />
      <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <path d="M7 18 V9" />
        <path d="M13 18 V7" />
        <path d="M19 18 V9" />
      </g>
      <circle cx="13" cy="20.5" r="1.6" fill="#E7B94E" />
    </svg>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white px-4 py-3 shadow-sm">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />
      <div className="text-[10px] font-extrabold uppercase tracking-wide text-grey">{label}</div>
      <div className="text-2xl font-extrabold tabular-nums">{value}</div>
      <div className="text-[10.5px] font-semibold text-grey">{sub}</div>
    </div>
  );
}

function Panel({
  title,
  children,
  className,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-line p-4 shadow-sm ${accent ? "bg-gradient-to-br from-messi-sky/15 to-white" : "bg-white"} ${className ?? ""}`}
    >
      <h2 className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-messi-sky-deep">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SectionHead({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-messi-plus">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-extrabold">{title}</h2>
      {note && <p className="mt-1 max-w-3xl text-[12.5px] text-grey">{note}</p>}
    </div>
  );
}

function TopicBar({ topic }: { topic: TopicSignal }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-bold">{topic.label}</span>
        {topic.sensitive && (
          <span className="rounded bg-red/10 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase text-red">
            sensitive
          </span>
        )}
        <span className="ml-auto text-[12px] font-extrabold tabular-nums">{topic.pct}%</span>
        <span
          className={`w-12 text-right text-[11px] font-bold tabular-nums ${topic.deltaPts > 0 ? "text-emerald-600" : topic.deltaPts < 0 ? "text-red" : "text-grey"}`}
        >
          {topic.deltaPts > 0 ? "+" : ""}
          {topic.deltaPts} pts
        </span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded bg-slate-100">
        <div
          className="h-full rounded bg-gradient-to-r from-messi-sky-deep to-messi-sky"
          style={{ width: `${Math.min(topic.pct * 3.2, 100)}%` }}
        />
      </div>
      <div className="mt-0.5 text-[10.5px] text-grey">
        {topic.count} conversations · {topic.team} · {topic.experience}
      </div>
    </div>
  );
}

function StatRow({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-line py-2 last:border-0">
      <div>
        <div className="text-[13px] font-bold">{label}</div>
        <div className="text-[11px] text-grey">{note}</div>
      </div>
      <div className="ml-auto text-lg font-extrabold tabular-nums">{value}</div>
    </div>
  );
}
