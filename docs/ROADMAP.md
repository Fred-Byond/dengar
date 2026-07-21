# Roadmap — ~12 weeks to public pilot

From the Development Plan v2 (§7). The dashboard MVP ships in the same window because it
depends only on the transcript pipeline, not on public traffic volume.

## Phase 0 — Alignment & design (weeks 1–2)

- Session script + listening-mode guardrails agreed with the Ministry.
- Level-2 taxonomy per Home-Ministry agency ([`taxonomy.ts`](../src/lib/cvif/taxonomy.ts)).
- Launch parameters: concurrency (3–5 seats), hours (9am–9pm), cooldown (1 session / 30 days), retention.
- Digital-human API contract confirmed (context in, timing signals, transcript webhook out).
- WhatsApp Business templates submitted to Meta (longest external lead time).
- DPIA with Ministry legal.
- **Exit:** signed-off designs, contract, templates, DPIA.

## Phase 1 — Core build (weeks 3–7)

- Booking site, slot engine (Redis atomic locks), OTP, notifications.
- Session gateway + digital-human integration; closing experience; transcript ingestion.
- Admin ops view.
- **Repo work:** replace the served prototype at `/experience` with the React/Next PWA
  implementation of booking → session → close; stand up the NestJS back end and Postgres.
- **Exit:** full citizen journey end-to-end in staging with a live digital human.

## Phase 2 — Intelligence & hardening (weeks 6–9, overlaps)

- Pipeline: translate → CVIF classify → aggregate. Wire the dashboard to the live
  aggregation API instead of the in-page synthetic dataset.
- Dashboard views 1–3; weekly briefing generator; **add view 5 — Session Explorer**.
- Swap `deterministicScorer` for the LLM structured-extraction `Scorer`.
- Load test, pen test, accessibility audit (WCAG 2.1 AA), edge journeys.
- **Exit:** dashboard populates within 15 min of a session; security sign-off.

## Phase 3 — Pilot → launch (weeks 10–12+)

- Closed pilot (~200 invited citizens across all 5 languages) to tune classification and the
  Manglish glossary.
- Dashboard views 4–5; first weekly briefing to the Ministry; public launch with media plan.
- **Exit:** pilot quality targets met; Ministry sign-off; first briefing delivered.

## Pilot success metrics

- ≥ 85% session completion · ≤ 4.0 avg-satisfaction floor · ≤ 20% no-show
- ≥ 90% classification agreement with a human-labelled sample.

## Commercial anchor

One-time build fee **+ monthly platform fee** anchored to the weekly intelligence briefing
and dashboard access — the intelligence layer, not the website, carries the recurring value.
The stack is minister-agnostic: each new deployment = configuration + new avatar + adapted
taxonomy, and the taxonomy library per portfolio becomes accumulating IP.
