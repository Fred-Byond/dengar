"use client";

import { useMemo } from "react";
import Link from "next/link";
import { buildBriefing } from "@/lib/briefing";

export default function WeeklyBriefing() {
  const b = useMemo(() => buildBriefing(), []);

  return (
    <div className="min-h-screen bg-canvas pb-16 text-ink">
      {/* action bar — hidden in print */}
      <div className="no-print sticky top-0 z-20 flex flex-wrap items-center gap-3 bg-gradient-to-r from-navy-deep via-navy to-navy-light px-5 py-3 text-white sm:px-7">
        <Link href="/dashboard" className="text-sm font-bold text-white/80 hover:text-white">← DENGAR Intelligence</Link>
        <span className="border-l border-white/25 pl-3 text-sm font-extrabold">Weekly Ministry Briefing</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-gold px-3.5 py-2 text-xs font-extrabold text-[#3A2C00]"
          >
            🖨 Print / Save as PDF
          </button>
          <Link href="/" className="rounded-lg bg-white/15 px-3.5 py-2 text-xs font-extrabold text-white">Home</Link>
        </div>
      </div>

      {/* the document */}
      <article className="briefing-page mx-auto mt-6 max-w-[900px] bg-white shadow-sm">
        {/* header band */}
        <header className="bg-gradient-to-r from-navy-deep to-navy px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <Flag />
            <div className="text-[13px] font-extrabold leading-tight tracking-wide">
              MALAYSIA MADANI
              <span className="block text-[10px] font-bold tracking-[0.14em] text-white/70">
                MINISTRY OF HOME AFFAIRS · KEMENTERIAN DALAM NEGERI
              </span>
            </div>
            <div className="ml-auto text-right text-[11px] font-bold text-white/70">
              DENGAR.ai · BYOND asia
            </div>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">Weekly Ministry Briefing</h1>
          <p className="mt-1 text-sm text-white/80">{b.weekLabel}</p>
          <p className="mt-3 inline-block rounded-md bg-white/15 px-2.5 py-1 text-[10px] font-extrabold tracking-wide">
            {b.classification}
          </p>
        </header>

        <div className="px-8 py-7">
          {/* headline */}
          <Section n="" title="Headline">
            <p className="text-[15px] leading-relaxed">{b.headline}</p>
          </Section>

          {/* KPIs */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Sessions" value={b.kpis.sessions.toLocaleString("en-MY")} accent="#1B2A6B" />
            <Kpi label="Citizens reached" value={b.kpis.citizens.toLocaleString("en-MY")} accent="#FFCC00" />
            <Kpi label="Net sentiment" value={`${b.kpis.netSentiment > 0 ? "+" : ""}${b.kpis.netSentiment}`}
              accent={b.kpis.netSentiment >= 0 ? "#1E9E52" : "#D22030"} />
            <Kpi label="Avg satisfaction" value={`${b.kpis.satisfaction} / 5`} accent="#1E9E52" />
          </div>

          {/* pain points */}
          <Section n="1" title="Top pain points">
            <div className="space-y-3">
              {b.painPoints.map((p) => (
                <div key={p.rank} className="rounded-xl border border-line p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-red">{p.rank}.</span>
                    <b className="text-[15px]">{p.topic}</b>
                    <span className="ml-auto text-[12px] font-bold text-grey">{p.sessions} sessions</span>
                  </div>
                  <p className="mt-2 border-l-[3px] border-navy bg-slate-50 px-3 py-2 text-[13px] italic text-slate-600">
                    &ldquo;{p.quote}&rdquo;<span className="mt-1 block text-[11px] not-italic font-semibold text-grey">{p.quoteMeta}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-grey">
                    <span>Hotspots: {p.districts.join(" · ")}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5">Owner: {p.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* sentiment & engagement */}
          <Section n="2" title="Sentiment & engagement">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-grey">Sentiment split</div>
                <div className="flex h-6 overflow-hidden rounded-lg">
                  <Bar pct={b.sentiment.positive} color="#1E9E52" />
                  <Bar pct={b.sentiment.neutral} color="#B9BFCC" />
                  <Bar pct={b.sentiment.negative} color="#D22030" />
                </div>
                <div className="mt-2 flex gap-4 text-[12px] font-semibold">
                  <Legend color="#1E9E52" label={`Positive ${b.sentiment.positive}%`} />
                  <Legend color="#B9BFCC" label={`Neutral ${b.sentiment.neutral}%`} />
                  <Legend color="#D22030" label={`Negative ${b.sentiment.negative}%`} />
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-grey">Engagement by language</div>
                <div className="space-y-1.5">
                  {b.languages.map((l) => (
                    <div key={l.label} className="flex items-center gap-2 text-[12px]">
                      <span className="w-24 font-bold">{l.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
                        <div className="h-full rounded bg-navy" style={{ width: `${l.pct}%` }} />
                      </div>
                      <b className="w-9 text-right tabular-nums">{l.pct}%</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* suggestions */}
          <Section n="3" title="Top citizen suggestions">
            <div className="space-y-2">
              {b.suggestions.map((s) => (
                <div key={s.ask} className="flex items-start gap-3 rounded-xl border border-line p-3.5">
                  <div className="flex-1">
                    <b className="text-[13px]">{s.ask}</b>
                    <div className="mt-1 text-[11px] font-semibold text-grey">
                      {s.sessions} sessions · {s.states} states
                    </div>
                  </div>
                  <StatusTag status={s.status} />
                </div>
              ))}
            </div>
          </Section>

          {/* geographic watch */}
          <Section n="4" title="Geographic watch">
            <p className="mb-3 text-[12px] text-grey">National mean net sentiment: <b className="text-ink">{b.nationalMean > 0 ? "+" : ""}{b.nationalMean}</b>. States diverging most:</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <GeoList title="Below national mean" tone="neg" rows={b.geoNegative} />
              <GeoList title="Above national mean" tone="pos" rows={b.geoPositive} />
            </div>
          </Section>

          {/* keywords */}
          <Section n="5" title="Emerging keywords">
            <div className="flex flex-wrap gap-2">
              {b.keywords.map((k) => (
                <span key={k.word} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-navy">
                  {k.word}<em className="rounded-full bg-navy px-1.5 py-0.5 text-[10px] not-italic text-white">{k.count}</em>
                </span>
              ))}
            </div>
          </Section>

          {/* accountability */}
          <Section n="6" title="Accountability">
            <p className="mb-3 text-[12px] text-grey">
              <b className="text-red">{b.urgentCount}</b> urgent/critical · <b className="text-ink">{b.reviewCount}</b> flagged for human review this week. Open items by responsible agency:
            </p>
            <div className="space-y-1.5">
              {b.accountability.map((a) => {
                const max = b.accountability[0].open;
                return (
                  <div key={a.department} className="flex items-center gap-2 text-[12px]">
                    <span className="w-56 font-semibold">{a.department}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
                      <div className="h-full rounded bg-[#5A2CA0]" style={{ width: `${(a.open / max) * 100}%` }} />
                    </div>
                    <b className="w-8 text-right tabular-nums">{a.open}</b>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* follow-ups */}
          <Section n="7" title="Recommended follow-ups">
            <ol className="space-y-2">
              {b.followUps.map((f, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-line bg-slate-50 p-3.5 text-[13px] leading-relaxed">
                  <span className="font-extrabold text-navy">{i + 1}</span>
                  <span>{f}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* sign-off */}
          <div className="mt-8 border-t border-line pt-5 text-[12px] text-grey">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-6 text-[11px] font-extrabold uppercase tracking-wide">Reviewed &amp; approved for release</div>
                <div className="w-56 border-t border-ink pt-1 text-[11px]">BYOND Asia — human review before release</div>
              </div>
              <p className="max-w-[280px] text-[11px] leading-relaxed">
                Auto-generated from anonymised Session Insight Records. Every figure traces to
                verbatim-grounded evidence. Confidence is published, not implied.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

/* ---------- atoms ---------- */

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 break-inside-avoid">
      <h2 className="mb-3 flex items-center gap-2 border-b-2 border-navy pb-1.5 text-[13px] font-extrabold uppercase tracking-wide text-navy">
        {n && <span className="text-red">§{n}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line px-4 py-3">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />
      <div className="text-[10px] font-extrabold uppercase tracking-wide text-grey">{label}</div>
      <div className="text-xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return <div style={{ width: `${pct}%`, background: color }} className="h-full" />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function StatusTag({ status }: { status: "ACTIONED" | "ACKNOWLEDGED" | "UNDER REVIEW" }) {
  const style =
    status === "ACTIONED" ? "bg-[#E2F6E9] text-[#137A3D]"
      : status === "ACKNOWLEDGED" ? "bg-[#E7ECFF] text-navy"
        : "bg-[#FFF3D6] text-[#8A6400]";
  return <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-extrabold ${style}`}>{status}</span>;
}

function GeoList({ title, tone, rows }: { title: string; tone: "neg" | "pos"; rows: { state: string; divergence: number; topTopic: string; sessions: number }[] }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-grey">{title}</div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.state} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12px]">
            <b className="w-24">{r.state}</b>
            <span className={`font-extrabold tabular-nums ${tone === "neg" ? "text-red" : "text-positive"}`}>
              {r.divergence > 0 ? "+" : ""}{r.divergence} pts
            </span>
            <span className="ml-auto truncate text-[11px] text-grey">{r.topTopic}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Flag() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
      <path d="M8 22 c0-9 5-16 12-16 c7 0 12 7 12 16 l-2 12 H10 Z" fill="#fff" opacity=".18" />
      <path d="M8 22 c0-9 5-16 12-16 c7 0 12 7 12 16 l-2 12 H10 Z" fill="none" stroke="#fff" strokeWidth="1.4" />
      <g fill="#D22030">
        <rect x="12" y="2" width="3" height="10" rx="1.5" />
        <rect x="17" y="0" width="3" height="12" rx="1.5" />
        <rect x="22" y="1" width="3" height="11" rx="1.5" />
        <rect x="27" y="3" width="3" height="9" rx="1.5" />
      </g>
      <circle cx="17" cy="24" r="7" fill="#FFCC00" />
      <circle cx="20" cy="24" r="6" fill="#1B2A6B" />
      <path d="M27 24 l1.6 3.4 3.6.4 -2.7 2.5 .7 3.6 -3.2-1.9 -3.2 1.9 .7-3.6 -2.7-2.5 3.6-.4 Z" fill="#FFCC00" />
    </svg>
  );
}
