import Link from "next/link";
import { CAPABILITIES, CLIMATE, SCENARIOS } from "@/lib/tif";
import { ORGANISATION } from "@/lib/org";

function Mark() {
  return (
    <svg viewBox="0 0 28 28" className="h-9 w-9" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="12.5" stroke="#F2B705" strokeWidth="1.5" opacity=".55" />
      <g stroke="#F2B705" strokeWidth="2.8" strokeLinecap="round">
        <path d="M8 17 v-6" />
        <path d="M14 20 v-12" />
        <path d="M20 17 v-6" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-deep via-indigo to-indigo-light text-white">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="mb-8 flex items-center gap-3">
            <Mark />
            <div className="text-sm font-extrabold leading-tight tracking-wide">
              MIROME TEAM INTELLIGENCE
              <span className="block text-[10px] font-bold tracking-[0.14em] text-white/70">
                BYOND ASIA · ORGANISATIONAL DEVELOPMENT
              </span>
            </div>
          </div>

          <h1 className="mt-4 max-w-2xl text-balance text-2xl font-extrabold leading-tight sm:text-3xl">
            Diagnose the team before designing the intervention.
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Most team building starts with an activity. MIROME starts with evidence: a
            confidential pulse, a structured digital-human interview and workplace
            scenario simulations, scored into a team intelligence profile that tells the
            facilitator what the programme actually has to fix — and measured again at
            30, 60 and 90 days to show whether it did.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/experience"
              className="rounded-xl bg-violet px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110"
            >
              Open participant assessment →
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              Open team intelligence dashboard →
            </Link>
            <Link
              href="/participants"
              className="rounded-xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              Open Participant Explorer →
            </Link>
            <Link
              href="/facilitator"
              className="rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-[#3A2C00] transition hover:brightness-105"
            >
              Facilitator Pack →
            </Link>
          </div>
          <p className="mt-4 text-xs font-semibold text-white/55">
            Demo prototype · synthetic data for {ORGANISATION} · disclosed AI interviewer ·
            not connected to any HR system
          </p>
        </div>
      </section>

      {/* Two halves */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-violet">
          One product, two halves
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <ProductCard
            href="/experience"
            eyebrow="Participant experience"
            title="The 15-minute team diagnosis"
            body="Consent → context → ten-item pulse → structured digital-human interview → two workplace scenarios → reflection → summary confirmation. The employee-trust surface and the source of every data point."
            points={[
              "Confidential by construction — reference number, never a name",
              "English / Bahasa Melayu / 中文 / தமிழ்",
              "The participant confirms or corrects the recorded summary",
            ]}
            accent="violet"
          />
          <ProductCard
            href="/dashboard"
            eyebrow="Organisational intelligence"
            title="MIROME Team Intelligence"
            body="Team health across ten climate constructs, department heat map, leader–staff perception gap, capability distribution, ranked intervention priorities and progress from baseline to 90 days. The enduring value and the recurring revenue."
            points={[
              "Two role views: Facilitator (design the programme) vs HR & Management (assign, track, resolve)",
              "Every finding maps to an intervention, an owner and a measure",
              "Groups below five participants are never displayed",
            ]}
            accent="indigo"
          />
        </div>
      </section>

      {/* TIF */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-violet">
            The intelligence layer — the moat
          </p>
          <h2 className="mt-3 text-2xl font-extrabold">Team Intelligence Framework</h2>
          <p className="mt-3 max-w-2xl text-grey">
            The system assesses{" "}
            <b className="text-ink">how the team functions</b>, never the employee as a
            person, and never as a disciplinary instrument. Three layers, implemented as
            a typed engine in{" "}
            <code className="rounded bg-canvas px-1.5 py-0.5 text-sm">src/lib/tif</code>.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <Layer
              n="Layer 1"
              title="Individual capability"
              count={`${CAPABILITIES.length} constructs`}
              items={CAPABILITIES.map((c) => c.name)}
            />
            <Layer
              n="Layer 2"
              title="Team climate"
              count={`${CLIMATE.length} constructs`}
              items={CLIMATE.map((c) => c.name)}
            />
            <Layer
              n="Layer 3"
              title="Scenario simulation"
              count={`${SCENARIOS.length} scenarios`}
              items={SCENARIOS.map((s) => s.title)}
            />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Rule
              title="Evidence or nothing"
              body="Every score points at a verbatim response, or is reported as Not Elicited / Insufficient Evidence. A missing opportunity is never a low score."
            />
            <Rule
              title="Confidence travels with the number"
              body="Sample size, spread and confidence are shown next to every construct. Low-confidence consequential findings route to a human reviewer."
            />
            <Rule
              title="Excluded confounds"
              body="Accent, grammar, fluency, appearance, eye contact, charisma and technical failures never move a score."
            />
            <Rule
              title="No universal team score"
              body="Distinct constructs stay visible so the organisation can act on them. There is no single number to game."
            />
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-violet">
          Platform architecture
        </p>
        <div className="mt-5 space-y-3">
          <Row
            n="Front end"
            desc="Next.js — participant portal (digital human, mic, session timing) and the role-gated dashboards, one codebase."
          />
          <Row
            n="Back end"
            desc="Invitation & consent service, pulse capture, session gateway + digital-human integration, transcript ingestion, admin API."
          />
          <Row
            n="Intelligence"
            desc="Transcribe → translate → TIF extraction → aggregate → facilitator pack → reassessment. The recurring deliverable."
          />
          <Row
            n="Data & governance"
            desc="Reference-keyed records · minimum group size 5 · human-review routing · versioned rubric + model · immutable audit log."
          />
        </div>
        <p className="mt-6 text-sm text-grey">
          See <code className="rounded bg-white px-1.5 py-0.5">docs/</code> for the TIF
          spec, the digital-human integration contract, architecture and the pilot
          roadmap.
        </p>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs font-semibold text-grey">
        MIROME Team Intelligence · BYOND Asia · Demo prototype with synthetic data
      </footer>
    </main>
  );
}

function ProductCard({
  href,
  eyebrow,
  title,
  body,
  points,
  accent,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  accent: "violet" | "indigo";
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p
        className={`text-[11px] font-extrabold uppercase tracking-[0.14em] ${
          accent === "violet" ? "text-violet" : "text-indigo"
        }`}
      >
        {eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-grey">{body}</p>
      <ul className="mt-4 space-y-1.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[13px] text-ink">
            <span className={accent === "violet" ? "text-violet" : "text-indigo"}>▸</span>
            {p}
          </li>
        ))}
      </ul>
      <span className="mt-4 inline-block text-sm font-extrabold text-indigo group-hover:underline">
        Open →
      </span>
    </Link>
  );
}

function Layer({
  n,
  title,
  count,
  items,
}: {
  n: string;
  title: string;
  count: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-line p-5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-indigo">
        {n}
      </p>
      <h3 className="mt-1 text-base font-extrabold">{title}</h3>
      <p className="text-[11px] font-bold text-grey">{count}</p>
      <ul className="mt-3 space-y-1">
        {items.map((x) => (
          <li key={x} className="flex gap-2 text-[12.5px] leading-snug text-grey">
            <span className="text-violet">▸</span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Rule({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <h3 className="text-sm font-extrabold">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-grey">{body}</p>
    </div>
  );
}

function Row({ n, desc }: { n: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="w-40 flex-none text-sm font-extrabold text-indigo">{n}</div>
      <div className="text-[13px] text-grey">{desc}</div>
    </div>
  );
}
