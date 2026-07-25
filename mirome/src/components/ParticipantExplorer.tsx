"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CAPABILITY_BY_ID,
  CLIMATE,
  CLIMATE_BY_ID,
  SCENARIO_BY_ID,
  THEME_BY_ID,
  indexColour,
} from "@/lib/tif";
import type { ParticipantInsightRecord } from "@/lib/tif/types";

/**
 * Participant Explorer — the evidence view behind every dashboard number.
 *
 * This is where a reviewer checks that a score is defensible: each capability
 * shows the verbatim response that produced it, its confidence, or an explicit
 * non-score. There is no PII to mask because none is ever stored against the
 * record (§16.1) — the identity mapping lives in the invitation service and is
 * not exposed to analysis.
 */
export function ParticipantExplorer({
  records,
}: {
  records: ParticipantInsightRecord[];
}) {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("");
  const [role, setRole] = useState("");
  const [onlyReview, setOnlyReview] = useState(false);
  const [selected, setSelected] = useState<string | null>(records[0]?.reference ?? null);

  const departments = useMemo(
    () => Array.from(new Set(records.map((r) => r.context.department))).sort(),
    [records]
  );
  const roles = useMemo(
    () => Array.from(new Set(records.map((r) => r.context.roleLevel))),
    [records]
  );

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (dept && r.context.department !== dept) return false;
        if (role && r.context.roleLevel !== role) return false;
        if (onlyReview && !r.humanReview) return false;
        if (query) {
          const hay = `${r.reference} ${r.summary} ${r.anonymisedQuote ?? ""} ${r.themes.join(" ")}`;
          if (!hay.toLowerCase().includes(query.toLowerCase())) return false;
        }
        return true;
      }),
    [dept, onlyReview, query, records, role]
  );

  const record =
    filtered.find((r) => r.reference === selected) ?? filtered[0] ?? null;

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-4 bg-gradient-to-r from-indigo-deep via-indigo to-indigo-light px-6 py-4 text-white">
        <div>
          <b className="block text-[15px] font-extrabold tracking-[0.04em]">MIROME</b>
          <small className="text-[10px] font-bold tracking-[0.14em] text-white/75">
            TEAM INTELLIGENCE
          </small>
        </div>
        <div className="ml-1.5 border-l border-white/25 pl-4">
          <h1 className="text-[19px] font-extrabold">Participant Explorer</h1>
          <p className="mt-0.5 text-[11px] text-white/75">
            The evidence behind every score · reviewer view
          </p>
        </div>
        <Link
          href="/dashboard"
          className="ml-auto rounded-xl bg-white/15 px-4 py-2.5 text-xs font-extrabold"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-dashboard px-6 py-5">
        <div className="mb-4 rounded-xl border border-[#CFE8E3] bg-[#EEF7F5] px-4 py-3 text-[12px] font-semibold leading-relaxed text-[#0B5C53]">
          No name, employee number or contact detail is stored against an assessment
          record. Reviewers work from the reference and the transcript evidence only;
          the invitation service holds the identity mapping and is not reachable from
          here.
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, summary, quote or theme…"
            className="min-w-[260px] flex-1 rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo"
          />
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-sm font-semibold outline-none"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-sm font-semibold outline-none"
          >
            <option value="">All role levels</option>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-sm font-semibold">
            <input
              type="checkbox"
              checked={onlyReview}
              onChange={(e) => setOnlyReview(e.target.checked)}
              className="h-4 w-4 accent-violet"
            />
            Review queue only
          </label>
          <span className="text-[12.5px] font-semibold text-grey">
            <b className="text-ink">{filtered.length}</b> of {records.length} records
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
          {/* List */}
          <div className="max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-2 shadow-[0_1px_3px_rgba(20,25,40,0.06),0_8px_24px_rgba(20,25,40,0.05)]">
            {filtered.map((r) => {
              const weakest = Object.entries(r.climate).sort((a, b) => a[1] - b[1])[0];
              return (
                <button
                  key={r.reference}
                  type="button"
                  onClick={() => setSelected(r.reference)}
                  className={`mb-1.5 flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition ${
                    record?.reference === r.reference
                      ? "bg-indigo text-white"
                      : "hover:bg-[#F5F7FB]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <b className="text-[12.5px] tabular-nums">{r.reference}</b>
                    {r.humanReview ? (
                      <span className="rounded bg-priority px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                        REVIEW
                      </span>
                    ) : null}
                    <span
                      className={`ml-auto text-[10.5px] font-bold ${
                        record?.reference === r.reference ? "text-white/75" : "text-grey"
                      }`}
                    >
                      {r.context.language}
                    </span>
                  </div>
                  <span
                    className={`text-[11.5px] font-semibold ${
                      record?.reference === r.reference ? "text-white/85" : "text-grey"
                    }`}
                  >
                    {r.context.department} · {r.context.roleLevel}
                    {r.context.managesPeople ? " · manages people" : ""}
                  </span>
                  {weakest ? (
                    <span
                      className={`text-[11px] ${
                        record?.reference === r.reference ? "text-white/70" : "text-grey"
                      }`}
                    >
                      Lowest: {CLIMATE_BY_ID[weakest[0]]?.name} ({weakest[1]}/5)
                    </span>
                  ) : null}
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <p className="px-3 py-10 text-center text-[12.5px] text-grey">
                No records match these filters.
              </p>
            ) : null}
          </div>

          {/* Detail */}
          {record ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(20,25,40,0.06),0_8px_24px_rgba(20,25,40,0.05)]">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-extrabold">{record.reference}</h2>
                  <span className="rounded-md bg-[#E7ECFF] px-2 py-1 text-[10px] font-extrabold text-indigo">
                    {record.wave.toUpperCase()}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-extrabold ${
                      record.confirmation === "C"
                        ? "bg-[#E2F6E9] text-[#137A3D]"
                        : record.confirmation === "CC"
                          ? "bg-[#FFF3D6] text-[#8A6400]"
                          : "bg-[#FDECEC] text-[#A31C28]"
                    }`}
                  >
                    SUMMARY {record.confirmation}
                  </span>
                  {record.humanReview ? (
                    <span className="rounded-md bg-priority px-2 py-1 text-[10px] font-extrabold text-white">
                      HUMAN REVIEW
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-grey">
                  {record.context.department} · {record.context.roleLevel} ·{" "}
                  {record.context.tenure} · {record.context.workArrangement} ·{" "}
                  {record.context.language}
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed">{record.summary}</p>
                {record.humanReview ? (
                  <ul className="mt-3 rounded-xl border border-[#F5C9C9] bg-[#FFF1F1] p-3 text-[12.5px] leading-relaxed">
                    {record.humanReviewReasons.map((x) => (
                      <li key={x}>⚑ {x}</li>
                    ))}
                  </ul>
                ) : null}
                {record.themes.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {record.themes.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#F1F3F8] px-3 py-1 text-[11px] font-bold text-indigo"
                      >
                        {THEME_BY_ID[t]?.label ?? t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* Layer 1 */}
                <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(20,25,40,0.06),0_8px_24px_rgba(20,25,40,0.05)]">
                  <h3 className="mb-3 text-[14.5px] font-extrabold">
                    Layer 1 — capability, with its evidence
                  </h3>
                  <div className="flex flex-col gap-3">
                    {Object.entries(record.capabilities).map(([id, s]) => (
                      <div key={id} className="border-b border-line pb-3 last:border-0">
                        <div className="flex items-center gap-2">
                          <b className="flex-1 text-[12.5px]">
                            {CAPABILITY_BY_ID[id]?.name ?? id}
                          </b>
                          <span
                            className="rounded-md px-2 py-0.5 text-[11px] font-extrabold text-white"
                            style={{
                              background:
                                typeof s.value === "number"
                                  ? indexColour(((s.value - 1) / 4) * 100)
                                  : "#A9B0BF",
                            }}
                          >
                            {typeof s.value === "number" ? `${s.value}/5` : s.value}
                          </span>
                          <span className="w-20 text-right text-[10.5px] font-bold text-grey">
                            {s.confidence}
                          </span>
                        </div>
                        {s.evidenceQuote ? (
                          <p className="mt-1.5 rounded-r-lg border-l-[3px] border-violet bg-[#F7F8FB] px-3 py-2 text-[12px] italic leading-snug text-[#3C3F48]">
                            “{s.evidenceQuote}”
                          </p>
                        ) : (
                          <p className="mt-1.5 text-[11.5px] font-semibold text-grey">
                            No supporting evidence — reported as a non-score, not as a
                            low score.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layer 2 */}
                <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(20,25,40,0.06),0_8px_24px_rgba(20,25,40,0.05)]">
                  <h3 className="mb-3 text-[14.5px] font-extrabold">
                    Layer 2 — how this person experiences the team
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {CLIMATE.map((c) => {
                      const v = record.climate[c.id];
                      return (
                        <div key={c.id} className="flex items-center gap-2.5">
                          <span className="w-[46%] text-[12px] font-semibold leading-tight">
                            {c.name}
                          </span>
                          <span className="h-2 flex-1 overflow-hidden rounded bg-[#EDEFF4]">
                            <span
                              className="block h-full rounded"
                              style={{
                                width: `${v ? ((v - 1) / 4) * 100 : 0}%`,
                                background: v ? indexColour(((v - 1) / 4) * 100) : "#A9B0BF",
                              }}
                            />
                          </span>
                          <b className="w-8 text-right text-[11.5px] tabular-nums">
                            {v ?? "—"}
                          </b>
                        </div>
                      );
                    })}
                  </div>

                  <h3 className="mb-2 mt-5 text-[14.5px] font-extrabold">Reflection</h3>
                  <dl className="flex flex-col gap-2 text-[12.5px] leading-relaxed">
                    {(
                      [
                        ["Strength", record.reflection.strength],
                        ["Obstacle", record.reflection.obstacle],
                        ["Change asked for", record.reflection.priority],
                        ["Own commitment", record.reflection.personalAction],
                      ] as [string, string | null][]
                    ).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-grey">
                          {k}
                        </dt>
                        <dd>{v ?? "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Layer 3 */}
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(20,25,40,0.06),0_8px_24px_rgba(20,25,40,0.05)]">
                <h3 className="mb-3 text-[14.5px] font-extrabold">
                  Layer 3 — scenario simulation
                </h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  {record.scenarios.map((s) => (
                    <div key={s.scenarioId} className="rounded-xl border border-line p-4">
                      <div className="flex items-center gap-2">
                        <b className="flex-1 text-[13px]">
                          {SCENARIO_BY_ID[s.scenarioId]?.title ?? s.scenarioId}
                        </b>
                        <span className="text-[10.5px] font-bold text-grey">
                          {s.confidence} confidence
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.06em] text-strength">
                        Observed
                      </p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {s.observed.length ? (
                          s.observed.map((b) => (
                            <li key={b} className="flex gap-2 text-[12px] leading-snug">
                              <span className="text-strength">✓</span>
                              {b}
                            </li>
                          ))
                        ) : (
                          <li className="text-[12px] text-grey">Nothing evidenced.</li>
                        )}
                      </ul>
                      <p className="mt-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-grey">
                        Not evidenced
                      </p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {s.notObserved.map((b) => (
                          <li
                            key={b}
                            className="flex gap-2 text-[12px] leading-snug text-grey"
                          >
                            <span>·</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {record.scenarios.length === 0 ? (
                    <p className="text-[12.5px] text-grey">
                      No scenario was completed in this session.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
