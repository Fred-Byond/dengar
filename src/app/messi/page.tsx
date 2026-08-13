import type { Metadata } from "next";
import Link from "next/link";
import { DIMENSIONS, EXPERIENCES } from "@/lib/messi/fvif";
import { REVENUE_ENGINES, TIERS } from "@/lib/messi/commercial";
import { LANGUAGES, MARKETS } from "@/lib/messi/markets";

export const metadata: Metadata = {
  title: "MESSI.LIVE — Your Moment With Messi",
  description:
    "An officially governed digital relationship platform: a five-minute one-to-one conversation with Lionel Messi's authorised digital human, in every language, plus the management intelligence platform behind it.",
};

const FVIF_SUMMARY = DIMENSIONS.map((d) => ({ name: d.name, purpose: d.purpose }));

function Mark() {
  return (
    <svg viewBox="0 0 26 26" className="h-9 w-9" aria-hidden>
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

export default function MessiHome() {
  const liveMarkets = MARKETS.filter((m) => m.status === "live").length;

  return (
    <main className="min-h-screen bg-messi-canvas text-ink">
      {/* Hero */}
      <section className="bg-gradient-to-br from-messi-night via-messi-deep to-messi-slate text-white">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="mb-8 flex items-center gap-3">
            <Mark />
            <div className="text-sm font-extrabold leading-tight tracking-wide">
              PROPOSED BY BYOND ASIA
              <span className="block text-[10px] font-bold tracking-[0.14em] text-white/70">
                FOR LIONEL MESSI &amp; MANAGEMENT · DEMO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            MESSI<span className="font-light text-messi-sky">.LIVE</span>
          </div>
          <h1 className="mt-4 max-w-2xl text-balance text-2xl font-extrabold leading-tight sm:text-3xl">
            Hundreds of millions know Messi. MESSI.LIVE creates the opportunity for Messi to begin
            knowing them.
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Five minutes. One to one. In any language, anywhere — through an officially authorised
            hyper-realistic digital human. Every conversation is private for the fan and, in
            de-identified aggregate, becomes the first listening infrastructure an athlete has ever
            had.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/messi/experience"
              className="rounded-xl bg-messi-sky-deep px-5 py-3 text-sm font-extrabold text-white transition hover:brightness-110"
            >
              Open the fan experience →
            </Link>
            <Link
              href="/messi/dashboard"
              className="rounded-xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              Open the Global Pulse →
            </Link>
            <Link
              href="/messi/conversations"
              className="rounded-xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              Conversation Explorer →
            </Link>
            <Link
              href="/messi/brief"
              className="rounded-xl bg-messi-gold px-5 py-3 text-sm font-extrabold text-[#3A2C00] transition hover:brightness-105"
            >
              The World Brief →
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <HeroStat k="One" v="global identity, centrally governed" />
            <HeroStat k={`${LANGUAGES.length}`} v="launch languages, one Messi" />
            <HeroStat k={`${liveMarkets}`} v="live territories in the demo model" />
          </div>

          <p className="mt-6 text-xs font-semibold text-white/55">
            Demo prototype · synthetic data · every session discloses that the fan is speaking with
            an official AI-powered digital representation · no partner named, all commercial slots
            illustrative and subject to management approval
          </p>
        </div>
      </section>

      {/* Two ideas */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-messi-plus">
          Two ideas to remember
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-messi-sky-deep">
              The consumer promise
            </p>
            <h3 className="mt-1 text-2xl font-extrabold">Your Moment With Messi</h3>
            <p className="mt-2 text-sm leading-relaxed text-grey">
              A child in Riyadh selects Arabic, books 7:30 PM, and at 7:30 PM his phone says
              &ldquo;Messi is ready.&rdquo; For that child it is not content. It is his moment.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-messi-sky-deep">
              The business proposition
            </p>
            <h3 className="mt-1 text-2xl font-extrabold">
              Global IP. Local Commercialisation. Central Governance.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-grey">
              One official platform, monetised repeatedly across territories and partners — with
              management holding every approval, every category and the shutdown switch.
            </p>
          </div>
        </div>
      </section>

      {/* Two halves */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-messi-plus">
            One product, two halves
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <ProductCard
              href="/messi/experience"
              eyebrow="Fan experience"
              title="5 Minutes With Messi"
              body="Bookable, multilingual, five-minute controlled conversation: welcome → listen → probe → reflect → confirm → close. The emotional product and the source of the data."
              points={[
                "Booking + OTP + reminder, on any phone",
                `${LANGUAGES.map((l) => l.label).slice(0, 6).join(" · ")} and more`,
                "Memory is opt-in — and it is what makes fans return",
                "AI disclosure before every conversation; under-18 sessions are guarded",
              ]}
            />
            <ProductCard
              href="/messi/dashboard"
              eyebrow="Management intelligence"
              title="The Messi Global Pulse"
              body="Understand millions of fans without reading millions of conversations: what the world is asking, what is emerging, which countries are moving, who needs care — and the queue of questions worth thirty seconds of Lionel's own voice."
              points={[
                "Two role views: Messi (the relationship) vs management (the business)",
                "Territory performance, membership mix and the Global Rights Matrix",
                "Demand-led content commissions, not guesswork",
                "Fan-care queue with human review before any content use",
              ]}
            />
          </div>
        </div>
      </section>

      {/* The loop */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-messi-plus">
          The loop that makes it real
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">AI creates scale. Lionel provides humanity.</h2>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] font-extrabold">
          {["FAN", "DIGITAL MESSI", "INTELLIGENCE", "LIONEL", "FAN"].map((s, i, arr) => (
            <span key={s + i} className="flex items-center gap-2">
              <span className="rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-line">{s}</span>
              {i < arr.length - 1 && <span className="text-messi-sky-deep">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm text-grey">
          Every week the platform surfaces the questions that deserve Lionel himself. He records
          thirty seconds. That authentic response is then delivered, under an approved localisation
          process, to every fan who asked something close — in their own language.
        </p>
      </section>

      {/* FVIF */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-messi-plus">
            The intelligence layer — the moat
          </p>
          <h2 className="mt-3 text-2xl font-extrabold">Fan Voice Intelligence Framework</h2>
          <p className="mt-3 max-w-2xl text-grey">
            The system scores the{" "}
            <b className="text-ink">conversation as evidence about a fan need</b>, never the fan as a
            person. Membership tier, spend, fluency and market value are excluded from every score.
            Each conversation produces an evidence-grounded Fan Insight Record across seven visible
            dimensions — implemented as a typed engine in{" "}
            <code className="rounded bg-messi-canvas px-1.5 py-0.5 text-sm">src/lib/messi/fvif</code>.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FVIF_SUMMARY.map((d, i) => (
              <div key={d.name} className="rounded-xl border border-line p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-extrabold tabular-nums text-messi-sky-deep">
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

      {/* Content universe */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-messi-plus">
          Millions of reasons to return
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">One identity, an expanding content universe</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERIENCES.map((e) => (
            <div key={e.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
              <h3 className="text-sm font-extrabold">{e.name}</h3>
              <p className="mt-1 text-[12.5px] text-grey">{e.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Membership + revenue */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-messi-plus">
            Free to meet. Premium to build the relationship.
          </p>
          <h2 className="mt-3 text-2xl font-extrabold">MESSI.LIVE is the platform. MESSI+ is the membership.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((t) => (
              <div key={t.id} className="rounded-xl border border-line p-4">
                <h3 className="text-sm font-extrabold">{t.name}</h3>
                <div className="mt-0.5 text-[12px] font-extrabold text-messi-plus">{t.price}</div>
                <p className="mt-1.5 text-[12.5px] text-grey">{t.positioning}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-10 text-lg font-extrabold">Nine revenue engines around one relationship</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {REVENUE_ENGINES.map((e) => (
              <div key={e.no} className="rounded-xl border border-line px-3.5 py-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-extrabold tabular-nums text-messi-sky-deep">{e.no}</span>
                  <b className="text-[13px]">{e.name}</b>
                </div>
                <p className="mt-0.5 text-[11.5px] text-grey">{e.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-messi-plus">
          Platform architecture
        </p>
        <div className="mt-5 space-y-3">
          <Layer n="Front end" desc="Next.js PWA — fan booking + conversation experience and the role-gated management dashboard, one codebase. HoloMe runs the same session on an 86-inch presence." />
          <Layer n="Back end" desc="Booking API, notification service, session gateway + digital-human integration, transcript ingestion, memory service, territory/billing and partner admin." />
          <Layer n="Intelligence" desc="Transcribe → translate → FVIF extraction → aggregate → Global Pulse → weekly World Brief → Lionel's 30-second response queue." />
          <Layer n="Governance" desc="AI disclosure, children's environment with parental consent, opt-in memory the fan can delete, identity masking with audit-logged reveal, Global Rights Matrix and management emergency shutdown." />
        </div>
        <p className="mt-6 text-sm text-grey">
          Same architecture as{" "}
          <Link href="/" className="font-bold text-messi-sky-deep hover:underline">
            DENGAR.ai
          </Link>
          , the citizen-listening platform this codebase was built for: a controlled digital-human
          session produces comparable data, aggregation turns it into a decision-maker&rsquo;s view,
          and a recurring document closes the loop back to the principal.
        </p>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs font-semibold text-grey">
        MESSI.LIVE · One Messi. Every Fan. Every Language. Anywhere. · Demo prototype by BYOND Asia
        with synthetic data · not affiliated with or endorsed by Lionel Messi or his management
      </footer>
    </main>
  );
}

function HeroStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
      <div className="text-2xl font-extrabold">{k}</div>
      <div className="text-[12px] font-semibold text-white/70">{v}</div>
    </div>
  );
}

function ProductCard({
  href,
  eyebrow,
  title,
  body,
  points,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-messi-sky-deep">{eyebrow}</p>
      <h3 className="mt-1 text-xl font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-grey">{body}</p>
      <ul className="mt-4 space-y-1.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[13px] text-ink">
            <span className="text-messi-sky-deep">▸</span>
            {p}
          </li>
        ))}
      </ul>
      <span className="mt-4 inline-block text-sm font-extrabold text-messi-sky-deep group-hover:underline">
        Open →
      </span>
    </Link>
  );
}

function Layer({ n, desc }: { n: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="w-40 flex-none text-sm font-extrabold text-messi-sky-deep">{n}</div>
      <div className="text-[13px] text-grey">{desc}</div>
    </div>
  );
}
