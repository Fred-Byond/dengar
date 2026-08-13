"use client";

import { useMemo } from "react";
import Link from "next/link";
import { buildWorldBrief } from "@/lib/messi/brief";

export default function WorldBrief() {
  const b = useMemo(() => buildWorldBrief(), []);
  const p = b.pulse;

  return (
    <div className="min-h-screen bg-messi-canvas pb-16 text-ink">
      {/* action bar — hidden in print */}
      <div className="no-print sticky top-0 z-20 flex flex-wrap items-center gap-3 bg-gradient-to-r from-messi-night via-messi-deep to-messi-slate px-5 py-3 text-white sm:px-7">
        <Link href="/messi/dashboard" className="text-sm font-bold text-white/80 hover:text-white">
          ← Global Pulse
        </Link>
        <span className="border-l border-white/25 pl-3 text-sm font-extrabold">The Messi World Brief</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-messi-gold px-3.5 py-2 text-xs font-extrabold text-[#3A2C00]"
          >
            🖨 Print / Save as PDF
          </button>
          <Link href="/messi" className="rounded-lg bg-white/15 px-3.5 py-2 text-xs font-extrabold text-white">
            Home
          </Link>
        </div>
      </div>

      <article className="briefing-page mx-auto mt-6 max-w-[900px] bg-white shadow-sm">
        {/* header band */}
        <header className="bg-gradient-to-r from-messi-night to-messi-slate px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 26 26" className="h-9 w-9" aria-hidden>
              <circle cx="13" cy="13" r="12" stroke="#75AADB" strokeWidth="1.4" fill="none" opacity=".55" />
              <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                <path d="M7 18 V9" />
                <path d="M13 18 V7" />
                <path d="M19 18 V9" />
              </g>
              <circle cx="13" cy="20.5" r="1.6" fill="#E7B94E" />
            </svg>
            <div className="text-[15px] font-extrabold leading-tight tracking-wide">
              MESSI<span className="font-light text-messi-sky">.LIVE</span>
              <span className="block text-[10px] font-bold tracking-[0.14em] text-white/70">
                GLOBAL FAN RELATIONSHIP PLATFORM
              </span>
            </div>
            <div className="ml-auto text-right text-[11px] font-bold text-white/70">
              Prepared by BYOND asia
            </div>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">The Messi World Brief</h1>
          <p className="mt-1 text-sm text-white/80">{b.weekLabel}</p>
          <p className="mt-3 inline-block rounded-md bg-white/15 px-2.5 py-1 text-[10px] font-extrabold tracking-wide">
            {b.classification}
          </p>
        </header>

        <div className="px-8 py-7">
          <Section n="" title="Headline">
            <p className="text-[15px] leading-relaxed">{b.headline}</p>
          </Section>

          {/* KPIs */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Conversations" value={p.kpis.conversations.toLocaleString("en-US")} accent="#2E6FA7" />
            <Kpi label="Countries · languages" value={`${p.kpis.countries} · ${p.kpis.languages}`} accent="#75AADB" />
            <Kpi
              label="Emotional register"
              value={`${p.kpis.netSentiment > 0 ? "+" : ""}${p.kpis.netSentiment}`}
              accent={p.kpis.netSentiment >= 0 ? "#22C58B" : "#D22030"}
            />
            <Kpi label="Avg conversation" value={p.kpis.avgDuration} accent="#E7B94E" />
          </div>

          {/* what the world asked you */}
          <Section n="1" title="What the world asked you">
            <p className="mb-3 text-[12.5px] text-grey">
              Six questions, chosen for how much a personal answer would matter. Select one, record
              thirty seconds, and it reaches every fan who asked something close — in their language,
              under the approved localisation process.
            </p>
            <div className="space-y-3">
              {b.askedOfLionel.map((q, i) => (
                <div key={q.reference} className="rounded-xl border border-line p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-messi-plus">{i + 1}.</span>
                    <b className="text-[15px] leading-snug">&ldquo;{q.question}&rdquo;</b>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-grey">
                    <span>
                      {q.country} · <bdi>{q.languageLabel}</bdi> · {q.ageBand}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5">{q.topic}</span>
                    <span className="rounded-md bg-messi-gold/20 px-2 py-0.5 text-[#7a5c00]">
                      {q.similarCount} fans asked this
                    </span>
                    <span className="rounded-md bg-messi-sky/15 px-2 py-0.5 text-messi-sky-deep">
                      Publishes via {q.experience}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] text-slate-500">{q.rationale}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* themes */}
          <Section n="2" title="What the world is asking about">
            <div className="space-y-3">
              {b.themes.map((t) => (
                <div key={t.rank} className="rounded-xl border border-line p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-messi-sky-deep">{t.rank}.</span>
                    <b className="text-[15px]">{t.topic}</b>
                    <span className="ml-auto text-[12px] font-bold text-grey">
                      {t.conversations} conversations · {t.deltaPts >= 0 ? "+" : ""}
                      {t.deltaPts} pts
                    </span>
                  </div>
                  <p className="mt-2 border-l-[3px] border-messi-sky bg-slate-50 px-3 py-2 text-[13px] italic text-slate-600">
                    &ldquo;{t.quote}&rdquo;
                    <span className="mt-1 block text-[11px] font-semibold not-italic text-grey">
                      {t.quoteCountry} · <bdi>{t.quoteLanguage}</bdi> · {t.quoteAge}
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-grey">
                    <span>Strongest in: {t.countries.join(" · ")}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5">Owner: {t.owner}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5">Feeds: {t.experience}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* sentiment & reach */}
          <Section n="3" title="Emotion & reach">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-grey">
                  Emotional register
                </div>
                <div className="flex h-6 overflow-hidden rounded-lg">
                  <Bar pct={p.sentiment.positive} color="#22C58B" />
                  <Bar pct={p.sentiment.neutral} color="#B9BFCC" />
                  <Bar pct={p.sentiment.negative} color="#E8804A" />
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-[12px] font-semibold">
                  <Legend color="#22C58B" label={`Warm ${p.sentiment.positive}%`} />
                  <Legend color="#B9BFCC" label={`Neutral ${p.sentiment.neutral}%`} />
                  <Legend color="#E8804A" label={`Discouraged ${p.sentiment.negative}%`} />
                </div>
                <p className="mt-2 text-[11.5px] text-grey">
                  Negative here does not mean negative about Messi — it is almost always a fan being
                  honest about their own setback.
                </p>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-grey">
                  Conversations by language
                </div>
                <div className="space-y-1.5">
                  {p.languages.slice(0, 7).map((l) => (
                    <div key={l.label} className="flex items-center gap-2 text-[12px]">
                      <span className="w-28 truncate font-bold">{l.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
                        <div className="h-full rounded bg-messi-sky-deep" style={{ width: `${l.pct * 3}%` }} />
                      </div>
                      <b className="w-9 text-right tabular-nums">{l.pct}%</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* commissions */}
          <Section n="4" title="What to make next">
            <div className="space-y-2">
              {b.commissions.map((c) => (
                <div key={c.title} className="rounded-xl border border-line p-4">
                  <div className="flex items-baseline gap-2">
                    <b className="text-[14.5px]">{c.title}</b>
                    <span className="ml-auto text-[12px] font-bold text-grey">{c.demand} conversations</span>
                  </div>
                  <div className="mt-0.5 text-[12px] font-semibold text-messi-sky-deep">{c.format}</div>
                  <p className="mt-1 text-[12px] text-slate-500">{c.rationale}</p>
                  <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    Owner: {c.owner}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* care */}
          <Section n="5" title="Duty of care">
            <p className="rounded-xl border-l-[3px] border-red bg-red/5 px-4 py-3 text-[13px] leading-relaxed">
              {b.careNote}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {p.care.map((c) => (
                <div key={c.level} className="rounded-xl border border-line px-3 py-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-grey">{c.level}</div>
                  <div className="text-xl font-extrabold tabular-nums">{c.count}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* territories */}
          <Section n="6" title="Territory watch">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-4">
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-600">
                  Fastest growing
                </div>
                <p className="mt-1 text-[13.5px] font-semibold">{b.territoryWatch.growth}</p>
              </div>
              <div className="rounded-xl border border-line p-4">
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-messi-plus">
                  Needs attention
                </div>
                <p className="mt-1 text-[13.5px] font-semibold">{b.territoryWatch.attention}</p>
              </div>
            </div>
          </Section>

          {/* commercial */}
          <Section n="7" title="Commercial signals">
            <div className="space-y-2">
              {b.commercial.map((c) => (
                <div key={c.headline} className="border-l-[3px] border-messi-gold pl-3">
                  <b className="text-[13.5px]">{c.headline}</b>
                  <p className="mt-0.5 text-[12.5px] text-slate-500">{c.detail}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* actions */}
          <Section n="8" title="Recommended this week">
            <ol className="space-y-2">
              {b.recommendedActions.map((a, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3 text-[13px] leading-relaxed">
                  <span className="font-extrabold text-messi-sky-deep">{i + 1}.</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </Section>

          <footer className="mt-8 border-t border-line pt-4 text-[11px] leading-relaxed text-grey">
            Generated from de-identified Fan Insight Records produced by the Fan Voice Intelligence
            Framework. Every conversation disclosed to the fan as an official AI-powered digital
            representation of Lionel Messi. Nothing in this brief is published without management
            approval. Demo document with synthetic data.
          </footer>
        </div>
      </article>
    </div>
  );
}

/* ---------- atoms ---------- */

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-baseline gap-2 border-b border-line pb-1.5 text-[13px] font-extrabold uppercase tracking-[0.12em] text-messi-sky-deep">
        {n && <span className="tabular-nums">{n}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line px-3.5 py-2.5">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />
      <div className="text-[10px] font-extrabold uppercase tracking-wide text-grey">{label}</div>
      <div className="text-xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return <div style={{ width: `${pct}%`, background: color }} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
