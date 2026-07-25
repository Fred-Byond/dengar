"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CLIMATE_BY_ID,
  INTERVENTION_BY_ID,
  LEVELS,
  MIN_SEGMENT_N,
  OWNERS,
  CONSTRUCT_OWNER,
  indexColour,
  levelColour,
} from "@/lib/tif";
import type {
  ConstructLevel,
  ConstructResult,
  InterventionPriority,
  TeamIntelligenceProfile,
  Wave,
} from "@/lib/tif/types";

/* ============================================================
   Props — the server renders the profiles from the seeded pipeline
   ============================================================ */

export type DashboardProps = {
  organisation: string;
  orgContext: string;
  profiles: Record<Wave, TeamIntelligenceProfile>;
  waves: { id: Wave; label: string; short: string }[];
  /** Constructs the recommended programme is designed to move. */
  targeted: string[];
};

type Role = "facilitator" | "hr";

type Task = {
  id: string;
  issue: string;
  ownerId: string;
  ownerName: string;
  priority: "normal" | "elevated" | "high";
  due: string;
  note: string;
  status: "Assigned" | "In progress" | "Resolved";
  source: string;
};

/* ============================================================
   Small building blocks — the DENGAR card system, MIROME palette
   ============================================================ */

const CARD =
  "rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(20,25,40,0.06),0_8px_24px_rgba(20,25,40,0.05)]";

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${CARD} ${className ?? ""}`}>{children}</div>;
}

function CardHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-[14.5px] font-extrabold">{title}</h2>
      {hint ? <small className="text-[11px] font-semibold text-grey">{hint}</small> : null}
    </div>
  );
}

function FlowTag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div
      className={`mx-0.5 -mb-1 mt-0.5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] ${
        accent ? "text-indigo" : "text-grey"
      }`}
    >
      <span>{label}</span>
      <i className="inline-block h-0.5 w-6 rounded bg-line" />
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  accent,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  accent: string;
  tone?: "up" | "down" | "flat";
}) {
  return (
    <div className={`relative overflow-hidden ${CARD} px-[18px] py-[15px]`}>
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />
      <div className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-grey">
        {label}
      </div>
      <div className="my-0.5 text-[29px] font-extrabold tabular-nums tracking-tight">
        {value}
      </div>
      <div
        className={`text-[11.5px] font-bold ${
          tone === "up" ? "text-strength" : tone === "down" ? "text-priority" : "text-grey"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}

function LevelChip({ level }: { level: ConstructLevel }) {
  return (
    <span
      className="whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-extrabold tracking-[0.03em] text-white"
      style={{ background: levelColour(level) }}
    >
      {level.toUpperCase()}
    </span>
  );
}

function ConfidenceDot({ confidence }: { confidence: string }) {
  const colour =
    confidence === "high"
      ? "#1E9E52"
      : confidence === "moderate"
        ? "#E8A400"
        : confidence === "low"
          ? "#C6222F"
          : "#A9B0BF";
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-grey">
      <i className="h-2 w-2 rounded-full" style={{ background: colour }} />
      {confidence}
    </span>
  );
}

/* ============================================================
   Charts
   ============================================================ */

function ProgressChart({
  series,
  waves,
}: {
  series: { id: string; name: string; values: number[]; colour: string }[];
  waves: { short: string }[];
}) {
  const W = 520;
  const H = 210;
  const pad = { l: 34, r: 12, t: 12, b: 26 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (i / Math.max(1, waves.length - 1)) * iw;
  const y = (v: number) => pad.t + (1 - v / 100) * ih;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible">
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={pad.l}
            y1={y(v)}
            x2={W - pad.r}
            y2={y(v)}
            stroke="#EDEFF4"
            strokeWidth="1.5"
          />
          <text
            x={pad.l - 8}
            y={y(v) + 4}
            fontSize="10"
            fill="#9AA0AE"
            textAnchor="end"
            fontWeight="700"
          >
            {v}
          </text>
        </g>
      ))}
      {/* the Functional threshold — the line a programme is trying to cross */}
      <line
        x1={pad.l}
        y1={y(66)}
        x2={W - pad.r}
        y2={y(66)}
        stroke="#7FB13B"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      {series.map((s) => (
        <g key={s.id}>
          <polyline
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
            fill="none"
            stroke={s.colour}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {s.values.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r="3.6" fill={s.colour} />
          ))}
          <text
            x={x(s.values.length - 1) - 4}
            y={y(s.values[s.values.length - 1]) - 9}
            fontSize="10.5"
            fontWeight="800"
            fill={s.colour}
            textAnchor="end"
          >
            {Math.round(s.values[s.values.length - 1])}
          </text>
        </g>
      ))}
      {waves.map((w, i) => (
        <text
          key={w.short}
          x={x(i)}
          y={H - 6}
          fontSize="10"
          fill="#9AA0AE"
          fontWeight="700"
          textAnchor="middle"
        >
          {w.short}
        </text>
      ))}
    </svg>
  );
}

function DistributionBar({ distribution }: { distribution: number[] }) {
  const total = distribution.reduce((a, b) => a + b, 0) || 1;
  const colours = ["#C6222F", "#E07B39", "#E8A400", "#7FB13B", "#1E9E52"];
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-md">
      {distribution.map((d, i) => (
        <span
          key={i}
          style={{ width: `${(d / total) * 100}%`, background: colours[i] }}
          title={`${i + 1}: ${d}`}
        />
      ))}
    </div>
  );
}

/* ============================================================
   The dashboard
   ============================================================ */

export function TeamIntelligence({
  organisation,
  orgContext,
  profiles,
  waves,
  targeted,
}: DashboardProps) {
  const [role, setRole] = useState<Role>("facilitator");
  const [wave, setWave] = useState<Wave>("baseline");
  const [segment, setSegment] = useState<string | null>(null);
  const [openPriority, setOpenPriority] = useState<InterventionPriority | null>(null);
  const [assignFor, setAssignFor] = useState<{ issue: string; constructId: string } | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(() => seedTasks());
  const [toast, setToast] = useState<string | null>(null);

  const profile = profiles[wave];
  const isHr = role === "hr";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const segmentProfile = segment
    ? profile.segments.find((s) => s.segment === segment) ?? null
    : null;

  /** Climate rows, re-scoped to the selected department when one is picked. */
  const climateRows: ConstructResult[] = useMemo(() => {
    if (!segmentProfile || segmentProfile.suppressed) return profile.climate;
    return profile.climate.map((c) => ({
      ...c,
      index: segmentProfile.scores[c.id] ?? c.index,
      n: segmentProfile.n,
      level:
        segmentProfile.n < MIN_SEGMENT_N
          ? ("Insufficient Evidence" as ConstructLevel)
          : levelFromIndex(segmentProfile.scores[c.id] ?? c.index),
    }));
  }, [profile.climate, segmentProfile]);

  const priorityCount = profile.climate.filter(
    (c) => c.level === "Priority Attention"
  ).length;
  const topGap = profile.gaps.find((g) => !g.suppressed);

  const progressSeries = useMemo(
    () =>
      targeted.slice(0, 4).map((id, i) => ({
        id,
        name: CLIMATE_BY_ID[id]?.name ?? id,
        colour: ["#6B4EE6", "#0E9F8F", "#E8A400", "#22306E"][i % 4],
        values: waves.map(
          (w) => profiles[w.id].climate.find((c) => c.id === id)?.index ?? 0
        ),
      })),
    [profiles, targeted, waves]
  );

  const openTasks = tasks.filter((t) => t.status !== "Resolved");
  const overdue = openTasks.filter((t) => new Date(t.due) < new Date());
  const resolved = tasks.filter((t) => t.status === "Resolved");

  const ownerLoad = useMemo(() => {
    const agg = new Map<string, number>();
    openTasks.forEach((t) => agg.set(t.ownerName, (agg.get(t.ownerName) ?? 0) + 1));
    return Array.from(agg.entries()).sort((a, b) => b[1] - a[1]);
  }, [openTasks]);

  const createTask = (t: Omit<Task, "id">) => {
    setTasks((prev) => [
      { ...t, id: `ACT-${1000 + prev.length + 1}` },
      ...prev,
    ]);
    setAssignFor(null);
    showToast(`✓ Action assigned to ${t.ownerName} — tracked in the Action Tracker`);
  };

  return (
    <main className="min-h-screen bg-canvas text-ink">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-4 bg-gradient-to-r from-indigo-deep via-indigo to-indigo-light px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" aria-hidden>
            <circle cx="14" cy="14" r="12.5" stroke="#F2B705" strokeWidth="1.6" opacity=".5" />
            <g stroke="#F2B705" strokeWidth="2.8" strokeLinecap="round">
              <path d="M8 17 v-6" />
              <path d="M14 20 v-12" />
              <path d="M20 17 v-6" />
            </g>
          </svg>
          <div>
            <b className="block text-[15px] font-extrabold tracking-[0.04em]">MIROME</b>
            <small className="text-[10px] font-bold tracking-[0.14em] text-white/75">
              TEAM INTELLIGENCE
            </small>
          </div>
        </div>
        <div className="ml-1.5 border-l border-white/25 pl-4">
          <h1 className="text-[19px] font-extrabold">{organisation} — team diagnosis</h1>
          <p className="mt-0.5 text-[11px] text-white/75">{orgContext}</p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl bg-white/[0.12] p-[3px]">
            {(
              [
                ["facilitator", "🎓 Facilitator"],
                ["hr", "🏢 HR & Management"],
              ] as [Role, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                  role === id
                    ? "bg-white text-indigo shadow"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex rounded-xl bg-white/[0.12] p-[3px]">
            {waves.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWave(w.id)}
                title={w.label}
                className={`rounded-lg px-3 py-[7px] text-xs font-bold transition ${
                  wave === w.id ? "bg-white text-indigo" : "text-white/70 hover:text-white"
                }`}
              >
                {w.short}
              </button>
            ))}
          </div>

          {isHr ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative rounded-xl bg-white/15 px-4 py-2.5 text-xs font-extrabold"
            >
              📋 Action Tracker
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-violet px-1 text-[10px] font-extrabold">
                {openTasks.length}
              </span>
            </button>
          ) : null}

          <Link
            href="/facilitator"
            className="rounded-xl bg-gold px-4 py-2.5 text-xs font-extrabold text-[#3A2C00]"
          >
            📄 Facilitator Pack
          </Link>
        </div>
      </header>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-wrap items-center gap-2.5 px-6 pt-3">
        <span className="text-[12.5px] font-semibold text-grey">
          Showing: <b className="text-ink">{segment ?? "Whole organisation"}</b> ·{" "}
          <b className="text-ink">{waves.find((w) => w.id === wave)?.label}</b>
        </span>
        {segment ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo py-1.5 pl-3.5 pr-2 text-xs font-bold text-white">
            {segment}
            <button
              type="button"
              onClick={() => setSegment(null)}
              className="h-[18px] w-[18px] rounded-full bg-white/25 text-[10px] leading-none"
            >
              ✕
            </button>
          </span>
        ) : null}
        <span className="ml-auto text-[12.5px] font-semibold text-grey">
          {isHr
            ? "HR & Management view — participation, priorities, actions and follow-through"
            : "Facilitator view — the diagnosis, the evidence and the programme design"}
        </span>
      </div>

      <div className="mx-auto flex max-w-dashboard flex-col gap-4 px-6 pb-10 pt-4">
        {/* ================= KPIs ================= */}
        <FlowTag label="Diagnosis" />
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <Kpi
            label="Assessments completed"
            value={`${profile.participation.completed}`}
            delta={`${profile.participation.completionRate}% of ${profile.participation.invited} invited`}
            accent="#22306E"
            tone="flat"
          />
          <Kpi
            label="Constructs at priority"
            value={`${priorityCount} of ${profile.climate.length}`}
            delta={
              priorityCount
                ? `Lowest: ${profile.priorities[0]?.constructName ?? "—"}`
                : "No construct in the priority band"
            }
            accent="#C6222F"
            tone={priorityCount ? "down" : "up"}
          />
          <Kpi
            label="Largest perception gap"
            value={topGap ? `${topGap.gap > 0 ? "+" : ""}${topGap.gap}` : "—"}
            delta={
              topGap
                ? `${topGap.constructName} · leaders vs staff`
                : "Insufficient evidence"
            }
            accent="#E8A400"
            tone="down"
          />
          <Kpi
            label="Human review queue"
            value={`${profile.participation.humanReview}`}
            delta="Routed to a trained reviewer"
            accent="#6B4EE6"
            tone="flat"
          />
        </div>

        {/* ================= HR COMMAND STRIP ================= */}
        {isHr ? (
          <>
            <FlowTag label="Action" accent />
            <div className="grid grid-cols-1 items-center gap-4 rounded-2xl bg-gradient-to-r from-[#141C46] via-indigo to-[#33409B] px-5 py-4 text-white shadow-[0_8px_24px_rgba(20,25,40,0.08)] lg:grid-cols-[auto_1px_auto_1px_auto_1fr_auto]">
              <div>
                <div className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] opacity-70">
                  Open actions
                </div>
                <div className="text-[26px] font-extrabold tabular-nums leading-none">
                  {openTasks.length}
                </div>
              </div>
              <div className="hidden h-9 w-px bg-white/20 lg:block" />
              <div>
                <div className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] opacity-70">
                  Overdue
                </div>
                <div className="text-[26px] font-extrabold tabular-nums leading-none text-[#FFB4B4]">
                  {overdue.length}
                </div>
              </div>
              <div className="hidden h-9 w-px bg-white/20 lg:block" />
              <div>
                <div className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] opacity-70">
                  Resolved
                </div>
                <div className="text-[26px] font-extrabold tabular-nums leading-none text-[#8FE9AE]">
                  {resolved.length}
                </div>
              </div>
              <div className="min-w-0">
                <div className="mb-1 text-[10.5px] font-extrabold uppercase tracking-[0.06em] opacity-70">
                  Owner workload
                </div>
                {ownerLoad.length ? (
                  ownerLoad.slice(0, 3).map(([owner, n]) => (
                    <div
                      key={owner}
                      className="flex items-center gap-2 text-[11.5px] font-semibold"
                    >
                      <span className="w-40 truncate opacity-90">{owner}</span>
                      <span className="h-[7px] flex-1 overflow-hidden rounded bg-white/20">
                        <span
                          className="block h-full rounded bg-gold"
                          style={{ width: `${(n / ownerLoad[0][1]) * 100}%` }}
                        />
                      </span>
                      <b className="w-4 text-right">{n}</b>
                    </div>
                  ))
                ) : (
                  <div className="text-[11.5px] opacity-60">No open actions</div>
                )}
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setAssignFor({
                      issue: profile.priorities[0]?.finding ?? "Team development action",
                      constructId: profile.priorities[0]?.constructId ?? "collaboration",
                    })
                  }
                  className="whitespace-nowrap rounded-xl bg-gold px-4 py-2.5 text-[12.5px] font-extrabold text-[#3A2C00]"
                >
                  ⚡ Assign action
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-[12.5px] font-extrabold text-indigo"
                >
                  📋 Tracker
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* ================= HEALTH + SIDE ================= */}
        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-4">
            {/* Dashboard 1 — Team Health Overview */}
            <Card>
              <CardHead
                title="🩺 Team health — the ten climate constructs"
                hint={`${segment ?? "whole organisation"} · descriptive levels, never a single team score`}
              />
              <div className="flex flex-col">
                {climateRows.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center gap-2.5 border-b border-line py-2.5 last:border-0"
                  >
                    <div className="w-[190px] shrink-0 text-[12.5px] font-bold leading-tight">
                      {c.name}
                    </div>
                    <div className="h-2.5 min-w-[120px] flex-1 overflow-hidden rounded-md bg-[#EDEFF4]">
                      <div
                        className="h-full rounded-md"
                        style={{
                          width: `${c.index}%`,
                          background: levelColour(c.level),
                        }}
                      />
                    </div>
                    <div className="w-11 text-right text-xs font-extrabold tabular-nums">
                      {Math.round(c.index)}
                    </div>
                    <LevelChip level={c.level} />
                    <div className="w-24 text-right text-[10.5px] font-bold text-grey">
                      n={c.n}
                    </div>
                    <ConfidenceDot confidence={c.confidence} />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {LEVELS.map((l) => (
                  <span
                    key={l.level}
                    className="flex items-center gap-1.5 text-[10.5px] font-bold text-grey"
                  >
                    <i className="h-2.5 w-2.5 rounded-sm" style={{ background: l.colour }} />
                    {l.level}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-grey">
                  <i className="h-2.5 w-2.5 rounded-sm bg-insufficient" />
                  Insufficient evidence (n&lt;{MIN_SEGMENT_N})
                </span>
              </div>
            </Card>

            {/* Department heat matrix — the DENGAR map, re-cast for an org */}
            <Card>
              <CardHead
                title="🏢 Where it is happening — department × construct"
                hint="Colour = construct index · click a department to re-scope the dashboard"
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-separate border-spacing-[3px]">
                  <thead>
                    <tr>
                      <th className="w-40 text-left text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-grey">
                        Department
                      </th>
                      {profile.climate.map((c) => (
                        <th
                          key={c.id}
                          className="text-[9.5px] font-bold leading-tight text-grey"
                          title={c.name}
                        >
                          {shortName(c.name)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.segments.map((s) => (
                      <tr key={s.segment}>
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              setSegment(segment === s.segment ? null : s.segment)
                            }
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] font-bold transition ${
                              segment === s.segment
                                ? "bg-indigo text-white"
                                : "bg-[#F5F7FB] hover:bg-[#EDEFF6]"
                            }`}
                          >
                            <span className="truncate">{s.segment}</span>
                            <span
                              className={`ml-2 text-[10px] font-bold ${
                                segment === s.segment ? "text-white/75" : "text-grey"
                              }`}
                            >
                              n={s.n}
                            </span>
                          </button>
                        </td>
                        {profile.climate.map((c) =>
                          s.suppressed ? (
                            <td key={c.id}>
                              <div
                                className="flex h-9 items-center justify-center rounded-lg bg-[repeating-linear-gradient(45deg,#E9EBF1,#E9EBF1_4px,#F5F6FA_4px,#F5F6FA_8px)] text-[9px] font-extrabold text-grey"
                                title={`Suppressed — fewer than ${MIN_SEGMENT_N} participants`}
                              >
                                n&lt;{MIN_SEGMENT_N}
                              </div>
                            </td>
                          ) : (
                            <td key={c.id}>
                              <div
                                className="flex h-9 items-center justify-center rounded-lg text-[11px] font-extrabold text-white"
                                style={{ background: indexColour(s.scores[c.id]) }}
                                title={`${s.segment} · ${c.name}: ${Math.round(s.scores[c.id])}`}
                              >
                                {Math.round(s.scores[c.id])}
                              </div>
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2.5 text-[11px] font-semibold text-grey">
                Groups below {MIN_SEGMENT_N} participants are never displayed — the cells stay
                hatched however the dashboard is filtered.
              </p>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            {/* Dashboard 2 — Perception gap */}
            <Card>
              <CardHead
                title="🔍 Perception gap"
                hint="leaders vs their teams · the gap is the finding"
              />
              <div className="flex flex-col gap-2.5">
                {profile.gaps.slice(0, 6).map((g) => (
                  <div key={g.constructId}>
                    <div className="flex items-baseline justify-between text-[12px] font-bold">
                      <span>{g.constructName}</span>
                      <span
                        className={
                          Math.abs(g.gap) >= 12
                            ? "text-priority"
                            : Math.abs(g.gap) >= 6
                              ? "text-developing"
                              : "text-grey"
                        }
                      >
                        {g.gap > 0 ? "+" : ""}
                        {g.gap}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="w-14 text-[10px] font-bold text-grey">
                        Leaders
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded bg-[#EDEFF4]">
                        <span
                          className="block h-full rounded bg-indigo"
                          style={{ width: `${g.managerIndex}%` }}
                        />
                      </span>
                      <b className="w-8 text-right text-[10.5px] tabular-nums">
                        {Math.round(g.managerIndex)}
                      </b>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="w-14 text-[10px] font-bold text-grey">Staff</span>
                      <span className="h-2 flex-1 overflow-hidden rounded bg-[#EDEFF4]">
                        <span
                          className="block h-full rounded bg-violet"
                          style={{ width: `${g.staffIndex}%` }}
                        />
                      </span>
                      <b className="w-8 text-right text-[10.5px] tabular-nums">
                        {Math.round(g.staffIndex)}
                      </b>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] font-semibold text-grey">
                Leaders rate{" "}
                <b className="text-ink">{profile.gaps[0]?.constructName.toLowerCase()}</b>{" "}
                {Math.abs(profile.gaps[0]?.gap ?? 0)} points higher than the people who
                report to them.
              </p>
            </Card>

            {/* Dashboard 5 — Progress over time */}
            <Card>
              <CardHead
                title="📈 Progress over time"
                hint="targeted constructs · baseline → 90 days"
              />
              <ProgressChart series={progressSeries} waves={waves} />
              <div className="mt-2 flex flex-wrap gap-3">
                {progressSeries.map((s) => (
                  <span
                    key={s.id}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-grey"
                  >
                    <i className="h-2.5 w-2.5 rounded-sm" style={{ background: s.colour }} />
                    {s.name}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] font-semibold text-grey">
                The dashed line is the Functional threshold. The immediate post-programme
                lift is participant enthusiasm; what matters is whether day 30 holds it.
              </p>
            </Card>

            {/* Dashboard 3 — Capability distribution */}
            <Card>
              <CardHead
                title="🧠 Individual capability distribution"
                hint="Layer 1 · never attributed to a named employee"
              />
              <div className="flex flex-col gap-2.5">
                {profile.capabilities.map((c) => (
                  <div key={c.id}>
                    <div className="flex items-baseline justify-between text-[12px] font-bold">
                      <span>{c.name}</span>
                      <span className="tabular-nums text-grey">
                        {Math.round(c.index)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <DistributionBar distribution={c.distribution} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] font-semibold text-grey">
                Accent, grammar, fluency, appearance and confidence are excluded from every
                capability score.
              </p>
            </Card>
          </div>
        </div>

        {/* ================= PRIORITIES + THEMES + SUGGESTIONS ================= */}
        <FlowTag label="Recommendation" accent />
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
          {/* Dashboard 4 — Intervention priorities */}
          <Card>
            <CardHead
              title="🎯 Intervention priorities"
              hint="scale × spread × confidence"
            />
            <div className="flex flex-col">
              {profile.priorities.slice(0, 6).map((p) => (
                <button
                  key={p.constructId}
                  type="button"
                  onClick={() => setOpenPriority(p)}
                  className="flex flex-col gap-1.5 border-b border-line py-3 text-left transition last:border-0 hover:bg-[#F5F7FB]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-indigo text-[11px] font-extrabold text-white">
                      {p.rank}
                    </span>
                    <span className="flex-1 text-[13px] font-extrabold leading-tight">
                      {p.constructName}
                    </span>
                    <LevelChip level={p.level} />
                  </div>
                  <p className="text-[12px] leading-snug text-grey">{p.finding}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-bold text-grey">
                    <span>{p.affectedShare}% of participants at or below neutral</span>
                    {p.concentratedIn.length ? (
                      <span className="rounded-full bg-[#FDECEC] px-2 py-0.5 text-[#A31C28]">
                        Concentrated in {p.concentratedIn.join(", ")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#EEF0F6] px-2 py-0.5">
                        Organisation-wide
                      </span>
                    )}
                    <ConfidenceDot confidence={p.confidence} />
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-semibold text-grey">
              👉 Open a priority to see the recommended programme design
              {isHr ? " and assign the follow-through" : ""}.
            </p>
          </Card>

          {/* Themes */}
          <Card>
            <CardHead title="💬 What people actually talked about" hint="theme frequency" />
            <div className="flex flex-col gap-2">
              {profile.themes.slice(0, 8).map((th) => (
                <div key={th.theme} className="flex items-center gap-2.5">
                  <span className="w-[46%] text-[12px] font-bold leading-tight">
                    {th.theme}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded bg-[#EDEFF4]">
                    <span
                      className="block h-full rounded bg-indigo"
                      style={{
                        width: `${(th.count / (profile.themes[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </span>
                  <b className="w-8 text-right text-[11.5px] tabular-nums">{th.count}</b>
                  <span
                    className={`w-9 text-right text-[11px] font-extrabold ${
                      th.delta > 0 ? "text-priority" : th.delta < 0 ? "text-strength" : "text-grey"
                    }`}
                  >
                    {th.delta > 0 ? "▲" : th.delta < 0 ? "▼" : "—"}
                    {Math.abs(th.delta)}
                  </span>
                </div>
              ))}
            </div>

            {isHr ? (
              <div className="mt-5">
                <CardHead title="🏛️ Owner workload" hint="open actions from this platform" />
                {ownerLoad.length ? (
                  <div className="flex flex-col gap-1.5">
                    {ownerLoad.map(([owner, n]) => (
                      <div key={owner} className="flex items-center gap-2.5 text-[12px]">
                        <span className="w-[52%] truncate font-semibold">{owner}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded bg-[#EDEFF4]">
                          <span
                            className="block h-full rounded bg-violet"
                            style={{ width: `${(n / ownerLoad[0][1]) * 100}%` }}
                          />
                        </span>
                        <b className="w-5 text-right">{n}</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-center text-[12px] text-grey">
                    No actions assigned yet. Open a priority to assign one.
                  </p>
                )}
              </div>
            ) : null}
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHead
              title="💡 What people asked for"
              hint="participant reflections, ranked by frequency × spread"
            />
            <div className="flex flex-col gap-2.5">
              {profile.suggestions.slice(0, 5).map((s) => {
                const assigned = tasks.find((t) => t.source === s.text);
                return (
                  <div key={s.text} className="rounded-xl border border-line p-3">
                    <div className="flex items-start gap-2">
                      <b className="flex-1 text-[13px] leading-snug">{s.text}</b>
                      <span
                        className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-extrabold ${
                          assigned
                            ? "bg-[#F1E6FF] text-[#5A2CA0]"
                            : "bg-[#E7ECFF] text-indigo"
                        }`}
                      >
                        {assigned ? "ASSIGNED" : "RAISED"}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] font-semibold text-grey">
                      <span>
                        <b className="text-ink">{s.count}</b> participants
                      </span>
                      <span>
                        Spread: <b className="text-ink">{s.spread}</b>
                      </span>
                    </div>
                    {isHr && !assigned ? (
                      <button
                        type="button"
                        onClick={() =>
                          setAssignFor({ issue: s.text, constructId: "collaboration" })
                        }
                        className="mt-2 rounded-lg border-[1.5px] border-indigo px-3 py-1.5 text-[11px] font-extrabold text-indigo transition hover:bg-indigo hover:text-white"
                      >
                        ⚡ Assign action
                      </button>
                    ) : null}
                    {assigned ? (
                      <div className="mt-2 text-[11px] font-bold text-[#5A2CA0]">
                        → {assigned.ownerName} · due {assigned.due}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ================= VOICES + REVIEW ================= */}
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHead
              title="🗣️ Team voices"
              hint="anonymised · quoted from the interview, never from a scenario role-play"
            />
            <div className="flex flex-col">
              {profile.voices
                .filter((v) => !segment || v.department === segment)
                .map((v, i) => (
                  <div
                    key={`${v.quote}-${i}`}
                    className="flex items-start gap-3 border-b border-line py-3 last:border-0"
                  >
                    <span
                      className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full"
                      style={{ background: levelColour(v.level) }}
                    />
                    <div className="flex-1 text-[12.5px] leading-relaxed">
                      <span className="italic text-[#3C3F48]">“{v.quote}”</span>
                      <small className="mt-1 block text-[11px] font-semibold text-grey">
                        {v.department} · {v.roleLevel} · {v.theme} · {v.language}
                      </small>
                    </div>
                  </div>
                ))}
              {profile.voices.filter((v) => !segment || v.department === segment).length ===
              0 ? (
                <p className="py-6 text-center text-[12.5px] text-grey">
                  No quotes are displayed for this scope — the group is below the reporting
                  threshold.
                </p>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHead
              title="🚨 Human review queue"
              hint="welfare, safety or named-individual disclosures"
            />
            <div className="flex flex-col gap-2.5">
              {profile.flags.map((f) => (
                <div
                  key={f.reference}
                  className="rounded-xl border border-[#F5C9C9] bg-[#FFF1F1] p-3"
                >
                  <b className="text-[12px] tracking-[0.04em] text-priority">
                    ⚑ {f.raisedAt.toUpperCase()}
                  </b>
                  <p className="mt-1 text-[12.5px] leading-snug">
                    <b>{f.department}</b> — {f.reason}. Content withheld from the dashboard
                    and routed to a trained reviewer.
                  </p>
                  <div className="mt-1.5 text-[11px] font-semibold text-grey">
                    Reference {f.reference}
                  </div>
                  {isHr ? (
                    <button
                      type="button"
                      onClick={() =>
                        setAssignFor({
                          issue: `Reviewer follow-up — ${f.reason} (${f.department})`,
                          constructId: "psychSafety",
                        })
                      }
                      className="mt-2 rounded-lg border-[1.5px] border-indigo px-3 py-1.5 text-[11px] font-extrabold text-indigo transition hover:bg-indigo hover:text-white"
                    >
                      ⚡ Assign action
                    </button>
                  ) : null}
                </div>
              ))}
              {profile.flags.length === 0 ? (
                <p className="py-6 text-center text-[12.5px] text-grey">
                  Nothing in the review queue for this wave.
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <FlowTag label="Outcomes" accent />
              <CardHead title="✅ You said, we did" hint="closing the loop with participants" />
              <div className="rounded-xl border border-line p-3">
                <div className="flex items-start gap-2">
                  <b className="flex-1 text-[13px] leading-snug">
                    Handover standard published for the Operations → Customer Service
                    interface, with named owners
                  </b>
                  <span className="whitespace-nowrap rounded-md bg-[#E2F6E9] px-2 py-1 text-[10px] font-extrabold text-[#137A3D]">
                    ACTIONED
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] font-semibold text-grey">
                  <span>
                    Raised by <b className="text-ink">37 participants</b>
                  </span>
                  <span>
                    Participants notified: <b className="text-ink">82</b>
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <footer className="pb-6 pt-2 text-center text-[11px] font-semibold text-grey">
          MIROME Team Intelligence · diagnose the team before designing the intervention ·
          Demo prototype with synthetic data · BYOND Asia
        </footer>
      </div>

      {/* ================= PRIORITY / INTERVENTION MODAL ================= */}
      {openPriority ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[rgba(10,14,30,0.55)] px-5 py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenPriority(null);
          }}
        >
          <div className="w-full max-w-[760px] rounded-[18px] bg-white p-6">
            <button
              type="button"
              onClick={() => setOpenPriority(null)}
              className="float-right h-[34px] w-[34px] rounded-full bg-canvas text-[15px]"
            >
              ✕
            </button>
            <h3 className="pr-10 text-lg font-extrabold">{openPriority.constructName}</h3>
            <div className="mb-3 text-xs font-semibold text-grey">
              Priority {openPriority.rank} · index {Math.round(openPriority.index)} ·{" "}
              {openPriority.level} · confidence {openPriority.confidence}
            </div>

            <div className="rounded-xl border-l-[3px] border-indigo bg-[#F7F8FB] p-3.5 text-[13px] leading-relaxed">
              <b className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-indigo">
                Diagnosis
              </b>
              {openPriority.finding}
            </div>

            {(() => {
              const iv = INTERVENTION_BY_ID[openPriority.interventionId];
              if (!iv) {
                return (
                  <p className="mt-4 text-[13px] text-grey">
                    No standard intervention is mapped to this construct — the facilitator
                    designs the response.
                  </p>
                );
              }
              return (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Section title="Workshop objective">
                    <p className="text-[13px] leading-relaxed">{iv.objective}</p>
                    <p className="mt-2 text-[11.5px] font-bold text-grey">{iv.format}</p>
                  </Section>
                  <Section title="Recommended activities">
                    <List items={iv.activities} />
                  </Section>
                  <Section title="Facilitator prompts">
                    <List items={iv.facilitatorPrompts} quote />
                  </Section>
                  <Section title="Observation checklist">
                    <List items={iv.observationChecklist} />
                  </Section>
                  <Section title="Management follow-through">
                    <List items={iv.managerActions} />
                  </Section>
                  <Section title="How we will know it worked">
                    <p className="text-[13px] leading-relaxed">{iv.measure}</p>
                  </Section>
                </div>
              );
            })()}

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/facilitator"
                className="flex-1 rounded-xl border-[1.5px] border-line bg-white px-4 py-3 text-center text-[13.5px] font-bold"
              >
                Open the facilitator pack
              </Link>
              {isHr ? (
                <button
                  type="button"
                  onClick={() => {
                    setAssignFor({
                      issue: `${openPriority.constructName} — ${openPriority.finding}`,
                      constructId: openPriority.constructId,
                    });
                    setOpenPriority(null);
                  }}
                  className="flex-1 rounded-xl bg-indigo px-4 py-3 text-[13.5px] font-extrabold text-white"
                >
                  ⚡ Assign the follow-through
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ================= ASSIGN MODAL ================= */}
      {assignFor ? (
        <AssignModal
          issue={assignFor.issue}
          constructId={assignFor.constructId}
          onCancel={() => setAssignFor(null)}
          onCreate={createTask}
        />
      ) : null}

      {/* ================= ACTION TRACKER DRAWER ================= */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] flex w-[min(460px,94vw)] flex-col bg-white shadow-[-14px_0_44px_rgba(10,14,30,0.25)] transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-[105%]"
        }`}
      >
        <div className="flex items-center gap-2.5 bg-indigo px-5 py-4 text-white">
          <h3 className="flex-1 text-[15.5px] font-extrabold">📋 Action Tracker</h3>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="h-8 w-8 rounded-full bg-white/20"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {tasks.length === 0 ? (
            <p className="px-3 py-8 text-center text-[12.5px] leading-relaxed text-grey">
              No actions yet. Open a priority or a suggestion and tap{" "}
              <b>Assign action</b>. Every assignment is logged here with an owner, a due
              date and a status.
            </p>
          ) : (
            tasks.map((t, i) => {
              const over = new Date(t.due) < new Date() && t.status !== "Resolved";
              return (
                <div key={t.id} className="mb-3 rounded-xl border border-line p-3.5">
                  <div className="flex items-start gap-2">
                    <b className="flex-1 text-[13px] leading-snug">{t.issue}</b>
                    <span
                      className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-extrabold ${
                        t.status === "Resolved"
                          ? "bg-[#E2F6E9] text-[#137A3D]"
                          : t.status === "In progress"
                            ? "bg-[#DFF3FF] text-[#0A6C9E]"
                            : "bg-[#F1E6FF] text-[#5A2CA0]"
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-grey">
                    <span>{t.id}</span>
                    <span>
                      Owner: <b className="text-ink">{t.ownerName}</b>
                    </span>
                    <span className={over ? "text-priority" : ""}>
                      Due: <b className={over ? "text-priority" : "text-ink"}>{t.due}</b>
                      {over ? " ⚠ OVERDUE" : ""}
                    </span>
                    <span>
                      Priority: <b className="text-ink">{t.priority}</b>
                    </span>
                  </div>
                  {t.note ? (
                    <p className="mt-1.5 text-[11px] italic text-grey">“{t.note}”</p>
                  ) : null}
                  <select
                    value={t.status}
                    onChange={(e) => {
                      const status = e.target.value as Task["status"];
                      setTasks((prev) =>
                        prev.map((x, xi) => (xi === i ? { ...x, status } : x))
                      );
                      if (status === "Resolved") {
                        showToast(
                          "✓ Resolved — participants who raised this can be notified (“you said, we did”)."
                        );
                      }
                    }}
                    className="mt-2.5 w-full rounded-lg border-[1.5px] border-line px-2.5 py-1.5 text-xs font-bold"
                  >
                    <option>Assigned</option>
                    <option>In progress</option>
                    <option>Resolved</option>
                  </select>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= TOAST ================= */}
      <div
        className={`fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-[13px] font-bold text-white shadow-2xl transition-transform duration-300 ${
          toast ? "translate-y-0" : "translate-y-24"
        }`}
      >
        {toast}
      </div>
    </main>
  );
}

/* ============================================================
   Sub-components
   ============================================================ */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.06em] text-indigo">
        {title}
      </h4>
      {children}
    </div>
  );
}

function List({ items, quote }: { items: string[]; quote?: boolean }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((x) => (
        <li key={x} className="flex gap-2 text-[12.5px] leading-snug">
          <span className="text-violet">▸</span>
          <span className={quote ? "italic text-[#3C3F48]" : ""}>
            {quote ? `“${x}”` : x}
          </span>
        </li>
      ))}
    </ul>
  );
}

function AssignModal({
  issue,
  constructId,
  onCancel,
  onCreate,
}: {
  issue: string;
  constructId: string;
  onCancel: () => void;
  onCreate: (t: Omit<Task, "id">) => void;
}) {
  const recommended = CONSTRUCT_OWNER[constructId] ?? "od";
  const [text, setText] = useState(issue);
  const [ownerId, setOwnerId] = useState(recommended);
  const [priority, setPriority] = useState<Task["priority"]>("elevated");
  const [due, setDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [note, setNote] = useState("");

  const owner = OWNERS.find((o) => o.id === ownerId) ?? OWNERS[0];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-[rgba(10,14,30,0.55)] px-5 py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-[560px] rounded-[18px] bg-white p-6">
        <button
          type="button"
          onClick={onCancel}
          className="float-right h-[34px] w-[34px] rounded-full bg-canvas text-[15px]"
        >
          ✕
        </button>
        <h3 className="pr-10 text-lg font-extrabold">Assign action</h3>
        <p className="mb-3 text-xs font-semibold text-grey">
          Routes the finding to an owner with a due date. Every assignment is logged and
          tracked to closure — findings without follow-through are the failure mode this
          product exists to fix.
        </p>

        <label className="mt-3 block text-[11.5px] font-extrabold">Finding / action</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1.5 min-h-[70px] w-full rounded-xl border-[1.5px] border-line p-3 text-sm outline-none focus:border-indigo"
        />

        <label className="mt-3 block text-[11.5px] font-extrabold">Owner</label>
        <select
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className="mt-1.5 w-full rounded-xl border-[1.5px] border-line p-3 text-sm outline-none focus:border-indigo"
        >
          {OWNERS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <div className="mt-1.5 text-[11px] font-bold text-teal">
          ✓ Suggested owner for {CLIMATE_BY_ID[constructId]?.name ?? "this finding"}:{" "}
          {OWNERS.find((o) => o.id === recommended)?.name}
        </div>

        <label className="mt-3 block text-[11.5px] font-extrabold">Priority</label>
        <div className="mt-1.5 flex gap-2">
          {(["normal", "elevated", "high"] as Task["priority"][]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`flex-1 rounded-xl border-[1.5px] p-2.5 text-[12.5px] font-extrabold capitalize ${
                priority === p
                  ? p === "high"
                    ? "border-priority bg-priority text-white"
                    : "border-indigo bg-indigo text-white"
                  : "border-line bg-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-[11.5px] font-extrabold">Due date</label>
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="mt-1.5 w-full rounded-xl border-[1.5px] border-line p-3 text-sm outline-none focus:border-indigo"
        />

        <label className="mt-3 block text-[11.5px] font-extrabold">
          Instruction to the owner <i className="font-medium text-grey">(optional)</i>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Publish the dependency map and named owners within 14 days, then report at the management meeting."
          className="mt-1.5 min-h-[70px] w-full rounded-xl border-[1.5px] border-line p-3 text-sm outline-none focus:border-indigo"
        />

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border-[1.5px] border-line bg-white px-4 py-3 text-[13.5px] font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onCreate({
                issue: text,
                ownerId,
                ownerName: owner.name,
                priority,
                due,
                note,
                status: "Assigned",
                source: issue,
              })
            }
            className="flex-1 rounded-xl bg-indigo px-4 py-3 text-[13.5px] font-extrabold text-white"
          >
            Assign &amp; track
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function levelFromIndex(index: number): ConstructLevel {
  for (const l of LEVELS) if (index >= l.min) return l.level;
  return "Priority Attention";
}

const SHORT_NAMES: Record<string, string> = {
  "Psychological safety": "Psych. safety",
  Trust: "Trust",
  "Role clarity": "Role clarity",
  "Goal alignment": "Goal align.",
  Collaboration: "Collab.",
  "Constructive conflict": "Conflict",
  "Leadership openness": "Leader open.",
  "Inclusion and belonging": "Inclusion",
  Accountability: "Account.",
  "Collective resilience": "Resilience",
};

function shortName(name: string): string {
  return SHORT_NAMES[name] ?? name;
}

/** Seeded operational state so the HR view opens on a live-looking programme. */
function seedTasks(): Task[] {
  const d = (n: number) => {
    const x = new Date();
    x.setDate(x.getDate() + n);
    return x.toISOString().slice(0, 10);
  };
  return [
    {
      id: "ACT-1003",
      issue:
        "Publish the Operations → Customer Service handover standard with named owners",
      ownerId: "pmo",
      ownerName: "Operations / PMO",
      priority: "elevated",
      due: d(5),
      note: "Draft from the dependency-mapping output; review at the management meeting.",
      status: "In progress",
      source: "seed-1",
    },
    {
      id: "ACT-1002",
      issue: "Executive committee to resolve the Sales volume vs Finance margin conflict",
      ownerId: "exco",
      ownerName: "Executive committee",
      priority: "high",
      due: d(-2),
      note: "",
      status: "Assigned",
      source: "seed-2",
    },
    {
      id: "ACT-1001",
      issue: "Each manager names one decision they will consult on before deciding",
      ownerId: "hrbp",
      ownerName: "HR Business Partner",
      priority: "normal",
      due: d(11),
      note: "",
      status: "Resolved",
      source: "seed-3",
    },
  ];
}
