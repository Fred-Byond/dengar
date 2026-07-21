import Link from "next/link";
import { DIMENSIONS } from "@/lib/cvif";

const CVIF_SUMMARY = DIMENSIONS.map((d) => ({ name: d.name, purpose: d.purpose }));

function Flag() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
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

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-deep via-navy to-navy-light text-white">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="mb-8 flex items-center gap-3">
            <Flag />
            <div className="text-sm font-extrabold leading-tight tracking-wide">
              MALAYSIA MADANI
              <span className="block text-[10px] font-bold tracking-[0.14em] text-white/70">
                MINISTRY OF HOME AFFAIRS · BYOND ASIA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            DENGAR<span className="font-light text-gold">.ai</span>
          </div>
          <h1 className="mt-4 max-w-2xl text-balance text-2xl font-extrabold leading-tight sm:text-3xl">
            Every citizen&rsquo;s voice, heard by the Minister — and turned into national intelligence.
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            A scheduled 5-minute conversation with the Minister&rsquo;s digital human, in five
            languages. Every controlled session becomes a comparable data point: sentiment by
            state, pain points by district, and a citizen-generated priority backlog for the
            Ministry.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/experience"
              className="rounded-xl bg-red px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110"
            >
              Open citizen experience →
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              Open Ministry dashboard →
            </Link>
            <Link
              href="/sessions"
              className="rounded-xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              Open Session Explorer →
            </Link>
            <Link
              href="/briefing"
              className="rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-[#3A2C00] transition hover:brightness-105"
            >
              Weekly Briefing →
            </Link>
          </div>
          <p className="mt-4 text-xs font-semibold text-white/55">
            Demo prototype · synthetic data · AI representation of the Minister (disclosed)
          </p>
        </div>
      </section>

      {/* Two halves */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-red">
          One product, two halves
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <ProductCard
            href="/experience"
            eyebrow="Citizen experience"
            title="Bercakap dengan Menteri"
            body="Bookable, multilingual, 5-minute controlled session: welcome → listen → clarify → confirm → close. The political narrative and the source of the data."
            points={["Booking + OTP + WhatsApp reminders", "BM / EN / 中文 / தமிழ் / العربية", "Confirm step validates the AI summary"]}
            accent="red"
          />
          <ProductCard
            href="/dashboard"
            eyebrow="Ministry intelligence"
            title="National Pulse dashboard"
            body="Near-real-time national listening: sentiment map, top issues, citizen suggestions, urgent review queue, and an action tracker that routes issues to agencies. The enduring value and the recurring revenue."
            points={["Sentiment by state → district drill-down", "Suggestions ranked by frequency × spread", "Assign → track → “you said, we did”"]}
            accent="navy"
          />
        </div>
      </section>

      {/* CVIF */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-red">
            The intelligence layer — the moat
          </p>
          <h2 className="mt-3 text-2xl font-extrabold">Citizen Voice Intelligence Framework</h2>
          <p className="mt-3 max-w-2xl text-grey">
            The system scores the <b className="text-ink">conversation as evidence about an issue</b>,
            never the citizen as a person. Each session produces an evidence-grounded Session
            Insight Record across seven visible dimensions — implemented as a typed engine in{" "}
            <code className="rounded bg-canvas px-1.5 py-0.5 text-sm">src/lib/cvif</code>.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {CVIF_SUMMARY.map((d, i) => (
              <div key={d.name} className="rounded-xl border border-line p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-extrabold tabular-nums text-navy">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-extrabold">{d.name}</h3>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-grey">{d.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-red">
          Platform architecture
        </p>
        <div className="mt-5 space-y-3">
          <Layer n="Front end" desc="Next.js PWA — citizen booking + session experience and the role-gated dashboard, one codebase." />
          <Layer n="Back end" desc="Booking API, notification service (WhatsApp/SMS/email), session gateway + digital-human integration, transcript ingestion, admin API." />
          <Layer n="Intelligence" desc="Transcribe → translate → CVIF extraction → aggregate → weekly Ministry briefing. The recurring deliverable." />
          <Layer n="Data & governance" desc="PostgreSQL + Redis + encrypted store · PDPA 2010 · DPIA · role-based PII masking · immutable audit log." />
        </div>
        <p className="mt-6 text-sm text-grey">
          See <code className="rounded bg-white px-1.5 py-0.5">docs/</code> for the CVIF spec,
          architecture, data model and the 12-week roadmap.
        </p>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs font-semibold text-grey">
        DENGAR.ai · BYOND Asia × Malaysia MADANI · Demo prototype with synthetic data
      </footer>
    </main>
  );
}

function ProductCard({
  href, eyebrow, title, body, points, accent,
}: {
  href: string; eyebrow: string; title: string; body: string; points: string[]; accent: "red" | "navy";
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className={`text-[11px] font-extrabold uppercase tracking-[0.14em] ${accent === "red" ? "text-red" : "text-navy"}`}>
        {eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-grey">{body}</p>
      <ul className="mt-4 space-y-1.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[13px] text-ink">
            <span className={accent === "red" ? "text-red" : "text-navy"}>▸</span>
            {p}
          </li>
        ))}
      </ul>
      <span className="mt-4 inline-block text-sm font-extrabold text-navy group-hover:underline">
        Open →
      </span>
    </Link>
  );
}

function Layer({ n, desc }: { n: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="w-40 flex-none text-sm font-extrabold text-navy">{n}</div>
      <div className="text-[13px] text-grey">{desc}</div>
    </div>
  );
}
