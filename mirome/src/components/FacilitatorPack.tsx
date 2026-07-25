import Link from "next/link";
import { PrintButton } from "./PrintButton";
import {
  CLIMATE_BY_ID,
  EXCLUDED_CONFOUNDS,
  INTERVENTION_BY_ID,
  MIN_SEGMENT_N,
  levelColour,
} from "@/lib/tif";
import type { TeamIntelligenceProfile } from "@/lib/tif/types";

/**
 * The Facilitator Intelligence Pack (§Component 6 / §12 Phase 3 output).
 *
 * Deliberately printable: the facilitator walks into the room with this, and
 * every finding on it carries its evidence, its confidence and the measure
 * that will show whether the intervention worked (§23.1).
 */
export function FacilitatorPack({
  organisation,
  orgContext,
  profile,
}: {
  organisation: string;
  orgContext: string;
  profile: TeamIntelligenceProfile;
}) {
  const top = profile.priorities.slice(0, 3);
  const strengths = [...profile.climate]
    .sort((a, b) => b.index - a.index)
    .slice(0, 2);
  const topGap = profile.gaps.find((g) => !g.suppressed);
  const suppressed = profile.segments.filter((s) => s.suppressed);

  return (
    <main className="min-h-screen bg-canvas py-8 text-ink">
      <div className="no-print mx-auto mb-4 flex max-w-[900px] flex-wrap items-center gap-3 px-6">
        <Link
          href="/dashboard"
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold"
        >
          ← Back to the dashboard
        </Link>
        <PrintButton />
        <span className="text-xs font-semibold text-grey">
          Print or Save as PDF for the pre-programme briefing.
        </span>
      </div>

      <article className="pack-page mx-auto max-w-[900px] bg-white px-10 py-12 shadow-[0_8px_30px_rgba(20,25,40,0.08)]">
        {/* Cover */}
        <div className="flex items-start justify-between gap-6 border-b-2 border-indigo pb-6">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-violet">
              Facilitator Intelligence Pack
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight">
              {organisation}
            </h1>
            <p className="mt-1 text-sm text-grey">{orgContext}</p>
          </div>
          <div className="text-right text-[11px] font-bold leading-relaxed text-grey">
            MIROME
            <br />
            TEAM INTELLIGENCE
            <br />
            <span className="text-violet">BYOND ASIA</span>
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-[#FFF8E1] px-4 py-3 text-[12px] font-semibold text-[#6B5900]">
          CONFIDENTIAL — for the named facilitator and the programme sponsor.
          Team-level results only. No individual is identified anywhere in this pack.
        </p>

        {/* Evidence base */}
        <Section n="01" title="Evidence base">
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Completed" value={`${profile.participation.completed}`} />
            <Stat
              label="Completion rate"
              value={`${profile.participation.completionRate}%`}
            />
            <Stat label="Departments" value={`${profile.segments.length}`} />
            <Stat
              label="Human review"
              value={`${profile.participation.humanReview}`}
            />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-grey">
            Each participant completed a ten-item confidential pulse, a structured
            digital-human interview and two workplace scenarios. Scores are
            evidence-grounded: every construct points at a verbatim response or is
            reported as insufficient evidence.{" "}
            {suppressed.length
              ? `${suppressed.map((s) => s.segment).join(", ")} ${
                  suppressed.length > 1 ? "are" : "is"
                } below the ${MIN_SEGMENT_N}-participant reporting threshold and ${
                  suppressed.length > 1 ? "are" : "is"
                } suppressed throughout.`
              : `Every segment met the ${MIN_SEGMENT_N}-participant reporting threshold.`}
          </p>
        </Section>

        {/* Headline */}
        <Section n="02" title="Headline — what the data actually says">
          <p className="text-[14px] leading-relaxed">
            The presenting complaint was that{" "}
            <b>the departments are not collaborating</b>. The diagnosis is more
            specific:{" "}
            <b>{top[0]?.finding.toLowerCase()}</b>{" "}
            Trust <i>inside</i> departments is not the problem — it sits at{" "}
            {Math.round(
              profile.climate.find((c) => c.id === "trust")?.index ?? 0
            )}
            . The failure is at the boundary between them.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed">
            The strongest conditions to build on are{" "}
            {strengths.map((s, i) => (
              <span key={s.id}>
                <b>{s.name.toLowerCase()}</b> ({Math.round(s.index)})
                {i === 0 ? " and " : ""}
              </span>
            ))}
            . Design the programme to spend that credit, not to repair it.
          </p>
          {topGap ? (
            <p className="mt-3 rounded-xl border-l-[3px] border-developing bg-[#FFFBF0] px-4 py-3 text-[13px] leading-relaxed">
              <b>Handle with care in the room:</b> leaders rate{" "}
              {topGap.constructName.toLowerCase()} {Math.abs(topGap.gap)} points
              higher than their teams ({Math.round(topGap.managerIndex)} vs{" "}
              {Math.round(topGap.staffIndex)}). Put the gap on the wall as data, not
              as an accusation, and let the leaders react to it first.
            </p>
          ) : null}
        </Section>

        {/* Priorities */}
        <Section n="03" title="Priority findings">
          {top.map((p) => (
            <div key={p.constructId} className="mb-5 rounded-xl border border-line p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo text-[11px] font-extrabold text-white">
                  {p.rank}
                </span>
                <h3 className="flex-1 text-base font-extrabold">{p.constructName}</h3>
                <span
                  className="rounded-md px-2 py-1 text-[10px] font-extrabold text-white"
                  style={{ background: levelColour(p.level) }}
                >
                  {p.level.toUpperCase()}
                </span>
                <span className="text-[11px] font-bold text-grey">
                  index {Math.round(p.index)} · {p.confidence} confidence
                </span>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed">{p.finding}</p>
              <p className="mt-2 text-[12px] font-semibold text-grey">
                {p.affectedShare}% of participants answered at or below neutral.{" "}
                {p.concentratedIn.length
                  ? `Concentrated in ${p.concentratedIn.join(", ")}.`
                  : "Reported across the whole organisation."}
              </p>
            </div>
          ))}
        </Section>

        {/* Programme design */}
        <Section n="04" title="Recommended programme design">
          <p className="mb-4 text-[13px] leading-relaxed text-grey">
            One day, mixed-department tables. The sequence deliberately opens on the
            constructs the data says are strong, so the room has the credit to spend
            on the harder session after lunch.
          </p>
          {top.map((p, i) => {
            const iv = INTERVENTION_BY_ID[p.interventionId];
            if (!iv) return null;
            return (
              <div key={p.constructId} className="mb-6">
                <h3 className="text-sm font-extrabold text-indigo">
                  Block {i + 1} · {CLIMATE_BY_ID[p.constructId]?.name}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed">
                  <b>Objective.</b> {iv.objective}
                </p>
                <p className="mt-1 text-[12px] font-bold text-grey">{iv.format}</p>
                <Grid>
                  <Col title="Activities" items={iv.activities} />
                  <Col title="Facilitator prompts" items={iv.facilitatorPrompts} quote />
                  <Col title="Watch for" items={iv.observationChecklist} />
                  <Col title="Management follow-through" items={iv.managerActions} />
                </Grid>
                <p className="mt-2 text-[12.5px] leading-relaxed">
                  <b>Measure.</b> {iv.measure}
                </p>
              </div>
            );
          })}
        </Section>

        {/* Composition */}
        <Section n="05" title="Group composition">
          <ul className="flex flex-col gap-2 text-[13px] leading-relaxed">
            <li>
              <b>Mix departments at every table.</b> The diagnosis is about the
              boundary between departments — a table of one department cannot
              rehearse the fix.
            </li>
            <li>
              <b>Keep leaders in the room, not at the front.</b> Their perception gap
              is one of the findings; they need to hear the data with their teams.
            </li>
            <li>
              <b>Do not sit the two lowest-scoring departments together</b> —
              {" "}
              {profile.segments
                .filter((s) => !s.suppressed)
                .slice(0, 2)
                .map((s) => s.segment)
                .join(" and ")}
              . Split them across tables so the handover conversation is live.
            </li>
            <li>
              <b>Under-threshold groups</b>
              {suppressed.length ? ` (${suppressed.map((s) => s.segment).join(", ")})` : ""}{" "}
              take part in the workshop but are never named in any results slide.
            </li>
          </ul>
        </Section>

        {/* Voices */}
        <Section n="06" title="Anonymised voices — usable in the room">
          <div className="flex flex-col gap-2.5">
            {profile.voices.slice(0, 5).map((v, i) => (
              <blockquote
                key={i}
                className="rounded-r-xl border-l-[3px] border-indigo bg-[#F7F8FB] px-4 py-3 text-[13px] italic leading-relaxed"
              >
                “{v.quote}”
                <span className="mt-1 block text-[11px] font-bold not-italic text-grey">
                  {v.department} · {v.roleLevel}
                </span>
              </blockquote>
            ))}
          </div>
          <p className="mt-3 text-[12px] font-semibold text-grey">
            Quotes are drawn only from the open interview, never from a scenario
            role-play, and never from a session in the review queue.
          </p>
        </Section>

        {/* Governance */}
        <Section n="07" title="Governance — the constraints you are working inside">
          <ul className="flex flex-col gap-1.5 text-[12.5px] leading-relaxed">
            <li>
              Results are team-level only. No individual report exists, and none can be
              produced from this pack.
            </li>
            <li>
              {profile.participation.humanReview} session
              {profile.participation.humanReview === 1 ? " is" : "s are"} with a trained
              reviewer for welfare or safety content. Do not raise those themes from the
              front — the reviewer route handles them.
            </li>
            <li>
              Groups below {MIN_SEGMENT_N} participants are suppressed in every view,
              including this pack.
            </li>
            <li>
              Excluded from every score: {EXCLUDED_CONFOUNDS.join(", ").toLowerCase()}.
            </li>
            <li>
              Reassessment is scheduled at 30, 60 and 90 days. Findings without a
              measure do not enter the programme design.
            </li>
          </ul>
        </Section>

        <p className="mt-10 border-t border-line pt-4 text-center text-[11px] font-semibold text-grey">
          MIROME Team Intelligence · Facilitator Intelligence Pack · synthetic
          demonstration data · BYOND Asia
        </p>
      </article>
    </main>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="text-sm font-extrabold tabular-nums text-violet">{n}</span>
        <h2 className="text-lg font-extrabold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas px-4 py-3">
      <small className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-grey">
        {label}
      </small>
      <b className="mt-0.5 block text-xl">{value}</b>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Col({
  title,
  items,
  quote,
}: {
  title: string;
  items: string[];
  quote?: boolean;
}) {
  return (
    <div>
      <h4 className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-grey">
        {title}
      </h4>
      <ul className="flex flex-col gap-1">
        {items.map((x) => (
          <li key={x} className="flex gap-2 text-[12.5px] leading-snug">
            <span className="text-violet">▸</span>
            <span className={quote ? "italic" : ""}>{quote ? `“${x}”` : x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
