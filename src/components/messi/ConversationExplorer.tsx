"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { generateConversations, type SeededConversation } from "@/lib/messi/seed";
import {
  DIMENSIONS,
  TAXONOMY,
  teamName,
  topicByLabel,
  type CareLevel,
  type FanInsightRecord,
} from "@/lib/messi/fvif";
import { LANGUAGES } from "@/lib/messi/markets";
import { tierLabel } from "@/lib/messi/commercial";

/* ---------- presentation helpers ---------- */

function sentimentMeta(v: FanInsightRecord["sentiment"]["overall"]["value"]) {
  const map: Record<string, { label: string; color: string }> = {
    "2": { label: "Joy / deep gratitude", color: "#1E9E52" },
    "1": { label: "Warm / hopeful", color: "#5FB878" },
    "0": { label: "Neutral / mixed", color: "#B9BFCC" },
    "-1": { label: "Discouraged", color: "#E8804A" },
    "-2": { label: "Distressed", color: "#D22030" },
    IE: { label: "Insufficient", color: "#9AA0AE" },
  };
  return map[String(v)] ?? map["0"];
}

const CARE_STYLE: Record<CareLevel, string> = {
  Normal: "bg-slate-100 text-slate-500",
  Watch: "bg-messi-gold/20 text-[#7a5c00]",
  Care: "bg-orange-100 text-orange-700",
  Critical: "bg-red/10 text-red",
};

function scoreString(dimId: string, rec: FanInsightRecord): string {
  switch (dimId) {
    case "sentiment": {
      const v = rec.sentiment.overall.value;
      return v === "IE" ? "IE" : (v as number) > 0 ? `+${v}` : `${v}`;
    }
    case "intentClarity": return String(rec.intentClarity.value);
    case "contextDepth": return String(rec.contextDepth.value);
    case "significance": return String(rec.significance.value);
    case "actionability": return String(rec.actionability.value);
    case "confirmation": return rec.confirmation;
    case "care": return rec.care;
    default: return "—";
  }
}

function dimDetail(dimId: string, rec: FanInsightRecord) {
  const map: Record<string, { confidence?: string; evidenceQuote?: string | null }> = {
    sentiment: rec.sentiment.overall,
    intentClarity: rec.intentClarity,
    contextDepth: rec.contextDepth,
    significance: rec.significance,
    actionability: rec.actionability,
  };
  return map[dimId];
}

/* ---------- component ---------- */

const TOPICS = ["All topics", ...TAXONOMY.map((t) => t.label)];
const LANGS = ["All languages", ...LANGUAGES.map((l) => l.label)];
const SENTS = ["All sentiment", "Positive", "Neutral", "Negative"];
const CARES: string[] = ["All care levels", "Normal", "Watch", "Care", "Critical"];
const TIERS_F = ["All members", "Free", "MESSI+ (any)"];
const AGES = ["All ages", "Under 13", "13–17", "18–24", "25–34", "35+"];

const AGE_MAP: Record<string, string> = {
  "Under 13": "under-13", "13–17": "13-17", "18–24": "18-24",
  "25–34": "25-34", "35+": "35+",
};

export default function ConversationExplorer({
  initialQueue,
}: {
  initialQueue?: string;
}) {
  const conversations = useMemo(() => generateConversations(320), []);

  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("All topics");
  const [lang, setLang] = useState("All languages");
  const [sent, setSent] = useState("All sentiment");
  const [care, setCare] = useState<string>(initialQueue === "care" ? "Care" : "All care levels");
  const [tier, setTier] = useState("All members");
  const [age, setAge] = useState("All ages");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [selected, setSelected] = useState<SeededConversation | null>(null);

  // Fan identity is masked by default. Revealing it requires elevated access
  // and is audit-logged — the control that makes wide team access safe.
  const [elevated, setElevated] = useState(false);
  const [audit, setAudit] = useState<{ ref: string; at: string }[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  const filtered = useMemo(() => {
    return conversations.filter((s) => {
      const r = s.record;
      if (topic !== "All topics" && r.topicL1 !== topic) return false;
      if (lang !== "All languages" && s.languageLabel !== lang) return false;
      if (care !== "All care levels" && r.care !== care) return false;
      if (reviewOnly && !r.humanReview) return false;
      if (tier === "Free" && r.tier !== "free") return false;
      if (tier === "MESSI+ (any)" && r.tier === "free") return false;
      if (age !== "All ages" && r.ageBand !== AGE_MAP[age]) return false;
      if (sent !== "All sentiment") {
        const v = r.sentiment.overall.value;
        const n = v === "IE" ? 0 : (v as number);
        if (sent === "Positive" && n <= 0) return false;
        if (sent === "Negative" && n >= 0) return false;
        if (sent === "Neutral" && n !== 0) return false;
      }
      if (q.trim()) {
        const hay = `${r.summary} ${r.questionAsked ?? ""} ${r.contentRequest ?? ""} ${r.country} ${r.region} ${r.keywords.join(" ")} ${r.reference}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [conversations, q, topic, lang, sent, care, tier, age, reviewOnly]);

  const careCount = conversations.filter(
    (s) => s.record.care === "Care" || s.record.care === "Critical",
  ).length;
  const reviewCount = conversations.filter((s) => s.record.humanReview).length;
  const memoryCount = conversations.filter((s) => s.record.continuityHook).length;

  function toggleElevated() {
    if (!elevated && selected) {
      setAudit((a) => [{ ref: selected.record.reference, at: nowLabel() }, ...a]);
    }
    setElevated((e) => !e);
  }

  return (
    <div className="min-h-screen bg-messi-canvas text-ink">
      {/* header */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-4 bg-gradient-to-r from-messi-night via-messi-deep to-messi-slate px-5 py-3 text-white sm:px-7">
        <Link href="/messi/dashboard" className="text-sm font-bold text-white/80 hover:text-white">
          ← Global Pulse
        </Link>
        <div className="border-l border-white/25 pl-4">
          <h1 className="text-lg font-extrabold">Conversation Explorer</h1>
          <p className="text-[11px] text-white/70">
            Every completed conversation becomes one record · FVIF Fan Insight Record
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowAudit((v) => !v)}
            className="rounded-lg bg-white/15 px-3 py-2 text-xs font-extrabold text-white"
          >
            🔐 Audit log
            {audit.length > 0 && (
              <span className="ml-1.5 rounded-full bg-messi-plus px-1.5 py-0.5 text-[10px]">{audit.length}</span>
            )}
          </button>
          <Link href="/messi" className="rounded-lg bg-white/15 px-3 py-2 text-xs font-extrabold text-white">
            Home
          </Link>
        </div>
      </header>

      {/* stats */}
      <div className="mx-auto grid max-w-dashboard grid-cols-2 gap-3 px-5 pt-4 sm:grid-cols-4 sm:px-7">
        <Stat label="Conversations" value={conversations.length.toString()} accent="#2E6FA7" />
        <Stat label="Showing" value={filtered.length.toString()} accent="#75AADB" />
        <Stat label="Care / Critical" value={careCount.toString()} accent="#D22030" />
        <Stat label="Memories carried forward" value={memoryCount.toString()} accent="#E7B94E" />
      </div>

      {/* filters */}
      <div className="mx-auto flex max-w-dashboard flex-wrap items-center gap-2 px-5 py-4 sm:px-7">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a question, request, keyword, country, reference…"
          className="min-w-[220px] flex-1 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-messi-sky-deep"
        />
        <Select value={topic} onChange={setTopic} options={TOPICS} />
        <Select value={sent} onChange={setSent} options={SENTS} />
        <Select value={lang} onChange={setLang} options={LANGS} />
        <Select value={care} onChange={setCare} options={CARES} />
        <Select value={tier} onChange={setTier} options={TIERS_F} />
        <Select value={age} onChange={setAge} options={AGES} />
        <button
          onClick={() => setReviewOnly((v) => !v)}
          className={`rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${reviewOnly ? "bg-messi-plus text-white" : "border border-line bg-white text-grey"}`}
        >
          ⚑ Human review ({reviewCount})
        </button>
      </div>

      {/* list */}
      <div className="mx-auto max-w-dashboard px-5 pb-16 sm:px-7">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center text-sm text-grey">
              No conversations match these filters.
            </div>
          )}
          {filtered.slice(0, 60).map((s) => {
            const r = s.record;
            const sm = sentimentMeta(r.sentiment.overall.value);
            return (
              <button
                key={r.reference}
                onClick={() => setSelected(s)}
                className="flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-slate-50"
              >
                <span className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full" style={{ background: sm.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold">{r.topicL1}</span>
                    {r.humanReview && (
                      <span className="rounded-md bg-messi-plus/10 px-1.5 py-0.5 text-[10px] font-extrabold text-messi-plus">
                        ⚑ REVIEW
                      </span>
                    )}
                    {r.care !== "Normal" && (
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${CARE_STYLE[r.care]}`}>
                        {r.care}
                      </span>
                    )}
                    {r.tier !== "free" && (
                      <span className="rounded-md bg-messi-plus/10 px-1.5 py-0.5 text-[10px] font-extrabold text-messi-plus">
                        {tierLabel(r.tier)}
                      </span>
                    )}
                    {r.surface === "holome" && (
                      <span className="rounded-md bg-messi-sky/20 px-1.5 py-0.5 text-[10px] font-extrabold text-messi-sky-deep">
                        HOLOME
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] italic text-slate-600">
                    &ldquo;{r.questionAsked ?? r.summary}&rdquo;
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-grey">
                    {r.region}, {r.country} · <bdi>{s.languageLabel}</bdi> · {s.timeLabel} ·{" "}
                    {r.reference}
                  </p>
                </div>
                <span className="mt-1 hidden flex-none text-[11px] font-bold text-messi-sky-deep sm:block">
                  Open ▸
                </span>
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

      {selected && (
        <ConversationDetail
          conversation={selected}
          elevated={elevated}
          onToggleElevated={toggleElevated}
          onClose={() => {
            setSelected(null);
            setElevated(false);
          }}
        />
      )}

      {showAudit && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={() => setShowAudit(false)}>
          <div className="flex h-full w-[min(420px,94vw)] flex-col bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 bg-messi-deep px-5 py-4 text-white">
              <h3 className="flex-1 text-base font-extrabold">🔐 Identity access audit log</h3>
              <button onClick={() => setShowAudit(false)} className="h-8 w-8 rounded-full bg-white/20">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {audit.length === 0 ? (
                <p className="px-2 py-10 text-center text-sm text-grey">
                  No fan identity has been unmasked. Names are masked by default; revealing one
                  requires elevated access and is logged here — the control that makes platform-wide
                  team access safe, and the same control DENGAR uses for citizens.
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

function ConversationDetail({
  conversation,
  elevated,
  onToggleElevated,
  onClose,
}: {
  conversation: SeededConversation;
  elevated: boolean;
  onToggleElevated: () => void;
  onClose: () => void;
}) {
  const r = conversation.record;
  const [showOriginal, setShowOriginal] = useState(true);
  const turns = showOriginal ? conversation.transcript.original : conversation.transcript.english;
  const owner = teamName(topicByLabel(r.topicL1)?.defaultTeam ?? "content");
  const isMinor = r.ageBand === "under-13" || r.ageBand === "13-17";

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
      <div className="flex h-full w-[min(580px,96vw)] flex-col bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 bg-gradient-to-r from-messi-night to-messi-slate px-5 py-4 text-white">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${CARE_STYLE[r.care]}`}>
                Care: {r.care}
              </span>
              {r.humanReview && (
                <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold">⚑ HUMAN REVIEW</span>
              )}
              {isMinor && (
                <span className="rounded-md bg-messi-gold/25 px-1.5 py-0.5 text-[10px] font-extrabold text-messi-gold">
                  MINOR · GUARDED SESSION
                </span>
              )}
            </div>
            <h3 className="mt-1.5 text-base font-extrabold">{r.topicL1}</h3>
            <p className="text-[11px] text-white/70">
              {r.reference} · {r.region}, {r.country} · <bdi>{conversation.languageLabel}</bdi> ·{" "}
              {conversation.timeLabel}
            </p>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex-none rounded-full bg-white/20">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* identity + PII control */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-line bg-slate-50 px-4 py-3">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-grey">Fan</div>
              <div className="text-sm font-bold">
                {elevated ? conversation.fanName : conversation.fanNameMasked}
              </div>
              <div className="text-[11px] text-grey">
                {tierLabel(r.tier)} · {r.ageBand} · {r.surface === "holome" ? "HoloMe" : "Mobile"} · {r.territory}
              </div>
            </div>
            <button
              onClick={onToggleElevated}
              className={`rounded-lg px-3 py-2 text-xs font-extrabold ${elevated ? "bg-messi-plus text-white" : "border border-messi-sky-deep text-messi-sky-deep"}`}
            >
              {elevated ? "Mask identity" : "🔓 Reveal (logged)"}
            </button>
          </div>

          {/* the question */}
          {r.questionAsked && (
            <>
              <SectionLabel>What the fan asked</SectionLabel>
              <p className="rounded-xl border-l-[3px] border-messi-sky-deep bg-slate-50 px-4 py-3 text-[15px] font-semibold leading-relaxed">
                &ldquo;{r.questionAsked}&rdquo;
              </p>
            </>
          )}

          <SectionLabel>Fan-confirmed summary</SectionLabel>
          <p className="rounded-xl border-l-[3px] border-messi-gold bg-slate-50 px-4 py-3 text-sm leading-relaxed">
            {r.summary}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <Pill>Confirmation: <b>{r.confirmation}</b></Pill>
            <Pill>Satisfaction: <b>{conversation.satisfaction}/5</b></Pill>
            <Pill>Used: <b>{Math.floor(conversation.durationSec / 60)}:{String(conversation.durationSec % 60).padStart(2, "0")}</b> of 5:00</Pill>
            <Pill>Owner: <b>{owner}</b></Pill>
          </div>

          {/* continuity */}
          <SectionLabel>Relationship memory</SectionLabel>
          {r.memoryConsent ? (
            r.continuityHook ? (
              <div className="rounded-xl border border-messi-sky/40 bg-messi-sky/10 px-4 py-3">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-messi-sky-deep">
                  Next conversation opens with
                </div>
                <p className="mt-1 text-[13.5px] italic">&ldquo;{r.continuityHook}&rdquo;</p>
                <p className="mt-1.5 text-[11px] text-grey">
                  Stored because the fan opted in AND confirmed the summary. Visible to the fan in
                  My Messi, deletable at any time.
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-line bg-slate-50 px-4 py-3 text-[12.5px] text-grey">
                Fan opted in, but nothing durable was captured or the summary was not confirmed —
                so nothing is carried forward.
              </p>
            )
          ) : (
            <p className="rounded-xl border border-line bg-slate-50 px-4 py-3 text-[12.5px] text-grey">
              The fan did not opt into memory. Nothing from this conversation is carried forward.
            </p>
          )}

          {/* FVIF record */}
          <SectionLabel>FVIF Fan Insight Record</SectionLabel>
          <div className="space-y-2">
            {DIMENSIONS.map((d) => {
              const scoreStr = scoreString(d.id, r);
              const anchor = d.anchors.find((a) => a.score === scoreStr);
              const detail = dimDetail(d.id, r);
              return (
                <div key={d.id} className="rounded-xl border border-line px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold">{d.name}</span>
                    <span className="ml-auto rounded-md bg-messi-deep px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-white">
                      {scoreStr}
                    </span>
                    {detail?.confidence && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-grey">
                        {detail.confidence}
                      </span>
                    )}
                  </div>
                  {anchor && (
                    <p className="mt-1 text-[12px] text-grey">
                      {anchor.label} — {anchor.anchor}
                    </p>
                  )}
                  {detail?.evidenceQuote && (
                    <p className="mt-1.5 border-l-2 border-line pl-2 text-[12px] italic text-slate-500">
                      &ldquo;{detail.evidenceQuote}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {r.sentiment.targets.length > 0 && (
            <>
              <SectionLabel>Sentiment targets</SectionLabel>
              <div className="space-y-1.5">
                {r.sentiment.targets.map((t, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 px-3 py-2 text-[12.5px]">
                    <b>{t.target}</b>
                    <span className="ml-2 rounded bg-white px-1.5 py-0.5 text-[11px] font-extrabold">
                      {t.score === "IE" ? "IE" : t.score > 0 ? `+${t.score}` : t.score}
                    </span>
                    {t.evidenceQuote && (
                      <p className="mt-1 italic text-slate-500">&ldquo;{t.evidenceQuote}&rdquo;</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {r.humanReview && (
            <div className="mt-3 rounded-xl border border-messi-plus/30 bg-messi-plus/5 px-4 py-3">
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-messi-plus">
                Why this is flagged
              </div>
              <ul className="mt-1 list-disc pl-5 text-[12px] text-slate-600">
                {r.humanReviewReasons.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          )}

          {/* signals */}
          <SectionLabel>Signals</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {r.keywords.map((k) => (
              <span key={k} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-messi-sky-deep">
                {k}
              </span>
            ))}
            {r.contentRequest && (
              <span className="rounded-full bg-messi-gold/15 px-3 py-1 text-[11px] font-bold text-[#7a5c00]">
                🎬 content request captured
              </span>
            )}
            {r.keywords.length === 0 && !r.contentRequest && (
              <span className="text-[12px] text-grey">No distinct signals extracted.</span>
            )}
          </div>

          {/* transcript */}
          <div className="mt-5 flex items-center justify-between">
            <SectionLabel noMargin>Transcript</SectionLabel>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
              <button
                onClick={() => setShowOriginal(true)}
                className={`rounded-md px-2.5 py-1 ${showOriginal ? "bg-white text-messi-sky-deep shadow-sm" : "text-grey"}`}
              >
                Original (<bdi>{conversation.languageLabel}</bdi>)
              </button>
              <button
                onClick={() => setShowOriginal(false)}
                className={`rounded-md px-2.5 py-1 ${!showOriginal ? "bg-white text-messi-sky-deep shadow-sm" : "text-grey"}`}
              >
                English
              </button>
            </div>
          </div>
          {showOriginal && !conversation.originalIsLocalised && (
            <p className="mt-1.5 rounded-lg bg-messi-gold/10 px-3 py-2 text-[11px] text-[#7a5c00]">
              Demo dataset: an in-language rendering of this conversation is not included, so the
              English text is shown. Production stores the original-language transcript verbatim.
            </p>
          )}
          <div className="mt-2 space-y-2">
            {turns.map((t, i) => (
              <div
                key={i}
                className={`rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${t.speaker === "messi" ? "bg-messi-sky/10" : "bg-slate-50"}`}
              >
                <div className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wide text-grey">
                  {t.speaker === "messi" ? "Messi (AI digital human)" : "Fan"} · {t.at}
                </div>
                {t.text}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-grey">
            Conversations are private to the fan. Analytics use de-identified records; identity is
            masked by default and unmasking is audit-logged. Recordings follow the retention policy
            agreed with management.
          </p>
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
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-messi-sky-deep"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function SectionLabel({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return (
    <div className={`text-[11px] font-extrabold uppercase tracking-wide text-messi-sky-deep ${noMargin ? "" : "mb-2 mt-5"}`}>
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">{children}</span>;
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
