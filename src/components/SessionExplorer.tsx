"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { generateSessions, type SeededSession } from "@/lib/seed";
import {
  DIMENSIONS, TAXONOMY, departmentName,
  type SessionInsightRecord, type UrgencyLevel,
} from "@/lib/cvif";

/* ---------- presentation helpers ---------- */

function sentimentMeta(v: SessionInsightRecord["sentiment"]["overall"]["value"]) {
  const map: Record<string, { label: string; color: string }> = {
    "2": { label: "Strongly positive", color: "#1E9E52" },
    "1": { label: "Positive", color: "#5FB878" },
    "0": { label: "Neutral / mixed", color: "#B9BFCC" },
    "-1": { label: "Negative", color: "#E8804A" },
    "-2": { label: "Strongly negative", color: "#D22030" },
    IE: { label: "Insufficient", color: "#9AA0AE" },
  };
  return map[String(v)] ?? map["0"];
}

const URGENCY_STYLE: Record<UrgencyLevel, string> = {
  Normal: "bg-slate-100 text-slate-500",
  Priority: "bg-amber/15 text-[#8a6400]",
  Urgent: "bg-orange-100 text-orange-700",
  Critical: "bg-red/10 text-red",
};

function scoreString(dimId: string, rec: SessionInsightRecord): string {
  switch (dimId) {
    case "sentiment": {
      const v = rec.sentiment.overall.value;
      return v === "IE" ? "IE" : (v as number) > 0 ? `+${v}` : `${v}`;
    }
    case "clarity": return String(rec.clarity.value);
    case "evidence": return String(rec.evidence.value);
    case "impact": return String(rec.impact.value);
    case "actionability": return String(rec.actionability.value);
    case "confirmation": return rec.confirmation;
    case "urgency": return rec.urgency;
    default: return "—";
  }
}

function dimConfidence(dimId: string, rec: SessionInsightRecord) {
  const map: Record<string, { confidence?: string; evidenceQuote?: string | null }> = {
    sentiment: rec.sentiment.overall, clarity: rec.clarity, evidence: rec.evidence,
    impact: rec.impact, actionability: rec.actionability,
  };
  return map[dimId];
}

function departmentForTopic(label: string): string {
  const t = TAXONOMY.find((x) => x.label === label);
  return departmentName(t?.defaultDepartment ?? "polisi");
}

/* ---------- component ---------- */

const TOPICS = ["All topics", ...TAXONOMY.map((t) => t.label)];
const LANGS = ["All languages", "Bahasa Melayu", "English", "中文", "தமிழ்", "العربية"];
const SENTS = ["All sentiment", "Positive", "Neutral", "Negative"];
const URGENCIES: (UrgencyLevel | "All urgency")[] = ["All urgency", "Normal", "Priority", "Urgent", "Critical"];

export default function SessionExplorer() {
  const sessions = useMemo(() => generateSessions(240), []);

  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("All topics");
  const [lang, setLang] = useState("All languages");
  const [sent, setSent] = useState("All sentiment");
  const [urg, setUrg] = useState<string>("All urgency");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [selected, setSelected] = useState<SeededSession | null>(null);

  // PII masking: off by default. Elevated access is audit-logged.
  const [elevated, setElevated] = useState(false);
  const [audit, setAudit] = useState<{ ref: string; at: string }[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const r = s.record;
      if (topic !== "All topics" && r.topicL1 !== topic) return false;
      if (lang !== "All languages" && s.languageLabel !== lang) return false;
      if (urg !== "All urgency" && r.urgency !== urg) return false;
      if (reviewOnly && !r.humanReview) return false;
      if (sent !== "All sentiment") {
        const v = r.sentiment.overall.value;
        const num = v === "IE" ? 0 : (v as number);
        if (sent === "Positive" && num <= 0) return false;
        if (sent === "Negative" && num >= 0) return false;
        if (sent === "Neutral" && num !== 0) return false;
      }
      if (q.trim()) {
        const hay = `${r.summary} ${r.painPoint ?? ""} ${r.suggestion ?? ""} ${r.state} ${r.district} ${r.keywords.join(" ")} ${r.reference}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [sessions, q, topic, lang, sent, urg, reviewOnly]);

  const urgentCount = sessions.filter((s) => s.record.urgency === "Urgent" || s.record.urgency === "Critical").length;
  const reviewCount = sessions.filter((s) => s.record.humanReview).length;

  function open(s: SeededSession) { setSelected(s); }

  function toggleElevated() {
    if (!elevated && selected) {
      setAudit((a) => [{ ref: selected.record.reference, at: nowLabel() }, ...a]);
    }
    setElevated((e) => !e);
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* header */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-4 bg-gradient-to-r from-navy-deep via-navy to-navy-light px-5 py-3 text-white sm:px-7">
        <Link href="/dashboard" className="text-sm font-bold text-white/80 hover:text-white">← DENGAR Intelligence</Link>
        <div className="border-l border-white/25 pl-4">
          <h1 className="text-lg font-extrabold">Session Explorer</h1>
          <p className="text-[11px] text-white/70">Every confirmed session becomes one record · CVIF Session Insight Record</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowAudit((v) => !v)}
            className="rounded-lg bg-white/15 px-3 py-2 text-xs font-extrabold text-white"
          >
            🔐 Audit log
            {audit.length > 0 && (
              <span className="ml-1.5 rounded-full bg-red px-1.5 py-0.5 text-[10px]">{audit.length}</span>
            )}
          </button>
          <Link href="/" className="rounded-lg bg-white/15 px-3 py-2 text-xs font-extrabold text-white">Home</Link>
        </div>
      </header>

      {/* stats */}
      <div className="mx-auto grid max-w-dashboard grid-cols-2 gap-3 px-5 pt-4 sm:grid-cols-4 sm:px-7">
        <Stat label="Sessions" value={sessions.length.toString()} accent="#1B2A6B" />
        <Stat label="Showing" value={filtered.length.toString()} accent="#FFCC00" />
        <Stat label="Urgent / Critical" value={urgentCount.toString()} accent="#D22030" />
        <Stat label="Flagged for review" value={reviewCount.toString()} accent="#E8A400" />
      </div>

      {/* filters */}
      <div className="mx-auto flex max-w-dashboard flex-wrap items-center gap-2 px-5 py-4 sm:px-7">
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search summary, quote, keyword, district, reference…"
          className="min-w-[220px] flex-1 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy"
        />
        <Select value={topic} onChange={setTopic} options={TOPICS} />
        <Select value={sent} onChange={setSent} options={SENTS} />
        <Select value={lang} onChange={setLang} options={LANGS} />
        <Select value={urg} onChange={setUrg} options={URGENCIES as string[]} />
        <button
          onClick={() => setReviewOnly((v) => !v)}
          className={`rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${reviewOnly ? "bg-red text-white" : "border border-line bg-white text-grey"}`}
        >
          🚨 Review queue
        </button>
      </div>

      {/* list */}
      <div className="mx-auto max-w-dashboard px-5 pb-16 sm:px-7">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center text-sm text-grey">No sessions match these filters.</div>
          )}
          {filtered.slice(0, 60).map((s) => {
            const r = s.record;
            const sm = sentimentMeta(r.sentiment.overall.value);
            return (
              <button
                key={r.reference}
                onClick={() => open(s)}
                className="flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-slate-50"
              >
                <span className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full" style={{ background: sm.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold">{r.topicL1}</span>
                    {r.humanReview && (
                      <span className="rounded-md bg-red/10 px-1.5 py-0.5 text-[10px] font-extrabold text-red">⚑ REVIEW</span>
                    )}
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${URGENCY_STYLE[r.urgency]}`}>{r.urgency}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[13px] italic text-slate-600">
                    &ldquo;{r.painPoint ?? r.summary}&rdquo;
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-grey">
                    {r.district}, {r.state} · {s.languageLabel} · {s.timeLabel} · {r.reference}
                  </p>
                </div>
                <span className="mt-1 hidden flex-none text-[11px] font-bold text-navy sm:block">Open ▸</span>
              </button>
            );
          })}
          {filtered.length > 60 && (
            <div className="px-4 py-3 text-center text-[11px] font-semibold text-grey">
              Showing first 60 of {filtered.length} — narrow the filters to see more.
            </div>
          )}
        </div>
      </div>

      {/* detail drawer */}
      {selected && (
        <SessionDetail
          session={selected}
          elevated={elevated}
          onToggleElevated={toggleElevated}
          onClose={() => { setSelected(null); setElevated(false); }}
        />
      )}

      {/* audit log drawer */}
      {showAudit && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={() => setShowAudit(false)}>
          <div className="flex h-full w-[min(420px,94vw)] flex-col bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 bg-navy px-5 py-4 text-white">
              <h3 className="flex-1 text-base font-extrabold">🔐 PII access audit log</h3>
              <button onClick={() => setShowAudit(false)} className="h-8 w-8 rounded-full bg-white/20">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {audit.length === 0 ? (
                <p className="px-2 py-10 text-center text-sm text-grey">
                  No PII has been unmasked. Names are masked by default; revealing a citizen&rsquo;s
                  identity requires elevated access and is logged here — the control that makes
                  Ministry-wide access safe.
                </p>
              ) : (
                audit.map((a, i) => (
                  <div key={i} className="mb-2 rounded-xl border border-line p-3 text-[13px]">
                    <b>Identity revealed</b> · {a.ref}
                    <div className="mt-1 text-[11px] font-semibold text-grey">Analyst (demo) · {a.at}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- detail drawer ---------- */

function SessionDetail({
  session, elevated, onToggleElevated, onClose,
}: {
  session: SeededSession; elevated: boolean; onToggleElevated: () => void; onClose: () => void;
}) {
  const r = session.record;
  const [showOriginal, setShowOriginal] = useState(true);
  const turns = showOriginal ? session.transcript.original : session.transcript.english;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
      <div className="flex h-full w-[min(560px,96vw)] flex-col bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 bg-gradient-to-r from-navy-deep to-navy px-5 py-4 text-white">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${URGENCY_STYLE[r.urgency]}`}>{r.urgency}</span>
              {r.humanReview && <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold">⚑ HUMAN REVIEW</span>}
            </div>
            <h3 className="mt-1.5 text-base font-extrabold">{r.topicL1}</h3>
            <p className="text-[11px] text-white/70">{r.reference} · {r.district}, {r.state} · {session.languageLabel} · {session.timeLabel}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex-none rounded-full bg-white/20">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* identity + PII control */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-line bg-slate-50 px-4 py-3">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-grey">Citizen</div>
              <div className="text-sm font-bold">{elevated ? session.citizenName : session.citizenNameMasked}</div>
            </div>
            <button
              onClick={onToggleElevated}
              className={`rounded-lg px-3 py-2 text-xs font-extrabold ${elevated ? "bg-red text-white" : "border border-navy text-navy"}`}
            >
              {elevated ? "Mask identity" : "🔓 Reveal (logged)"}
            </button>
          </div>

          {/* confirmed summary */}
          <SectionLabel>Citizen-confirmed summary</SectionLabel>
          <p className="rounded-xl border-l-[3px] border-navy bg-slate-50 px-4 py-3 text-sm leading-relaxed">
            {r.summary}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <Pill>Confirmation: <b>{r.confirmation}</b></Pill>
            <Pill>Satisfaction: <b>{session.satisfaction}/5</b></Pill>
            <Pill>Recommended owner: <b>{departmentForTopic(r.topicL1)}</b></Pill>
          </div>

          {/* CVIF record */}
          <SectionLabel>CVIF Session Insight Record</SectionLabel>
          <div className="space-y-2">
            {DIMENSIONS.map((d) => {
              const spec = d;
              const scoreStr = scoreString(d.id, r);
              const anchor = spec.anchors.find((a) => a.score === scoreStr);
              const conf = dimConfidence(d.id, r);
              return (
                <div key={d.id} className="rounded-xl border border-line px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold">{d.name}</span>
                    <span className="ml-auto rounded-md bg-navy px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-white">{scoreStr}</span>
                    {conf?.confidence && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-grey">{conf.confidence}</span>
                    )}
                  </div>
                  {anchor && <p className="mt-1 text-[12px] text-grey">{anchor.label} — {anchor.anchor}</p>}
                  {conf?.evidenceQuote && (
                    <p className="mt-1.5 border-l-2 border-line pl-2 text-[12px] italic text-slate-500">
                      &ldquo;{conf.evidenceQuote}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {r.humanReview && (
            <div className="mt-3 rounded-xl border border-red/30 bg-red/5 px-4 py-3">
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-red">Why this is flagged</div>
              <ul className="mt-1 list-disc pl-5 text-[12px] text-slate-600">
                {r.humanReviewReasons.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          )}

          {/* keywords + locations */}
          <SectionLabel>Signals</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {r.keywords.map((k) => <span key={k} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-navy">{k}</span>)}
            {r.locationsMentioned.map((l) => <span key={l} className="rounded-full bg-amber/10 px-3 py-1 text-[11px] font-bold text-[#8a6400]">📍 {l}</span>)}
            {r.keywords.length === 0 && r.locationsMentioned.length === 0 && (
              <span className="text-[12px] text-grey">No distinct signals extracted.</span>
            )}
          </div>

          {/* transcript */}
          <div className="mt-5 flex items-center justify-between">
            <SectionLabel noMargin>Transcript</SectionLabel>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
              <button onClick={() => setShowOriginal(true)} className={`rounded-md px-2.5 py-1 ${showOriginal ? "bg-white text-navy shadow-sm" : "text-grey"}`}>Original ({session.languageLabel})</button>
              <button onClick={() => setShowOriginal(false)} className={`rounded-md px-2.5 py-1 ${!showOriginal ? "bg-white text-navy shadow-sm" : "text-grey"}`}>English</button>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            {turns.map((t, i) => (
              <div key={i} className={`rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${t.speaker === "minister" ? "bg-navy/5" : "bg-slate-50"}`}>
                <div className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wide text-grey">
                  {t.speaker === "minister" ? "Minister (AI)" : "Citizen"} · {t.at}
                </div>
                {t.text}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-grey">Audio playback available where retained (90-day policy). PII masked by default; unmasking is audit-logged.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- small UI atoms ---------- */

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white px-4 py-3 shadow-sm">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />
      <div className="text-[10px] font-extrabold uppercase tracking-wide text-grey">{label}</div>
      <div className="text-2xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-navy"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SectionLabel({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return <div className={`text-[11px] font-extrabold uppercase tracking-wide text-navy ${noMargin ? "" : "mb-2 mt-5"}`}>{children}</div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">{children}</span>;
}

function nowLabel() {
  // stable-enough label for the demo audit trail
  return new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
}
