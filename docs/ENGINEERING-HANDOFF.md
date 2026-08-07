# Engineering handoff — DENGAR.ai

For the BYOND tech team taking this over: full-stack, UI/UX, and the head of AI. This is
the map, the ownership split, and the Phase-1 backlog. The product loop already works
end-to-end on synthetic data — your job is to make it real and connect it to the digital
human.

## 1. What this is (60 seconds)

A Next.js + TypeScript + Tailwind product with two halves and one intelligence engine:

- **Citizen experience** (`/experience`) — bookable 5-minute digital-human listening session.
- **Ministry dashboard** (`/dashboard`, `/sessions`, `/briefing`) — National Pulse + Session
  Explorer + Weekly Briefing.
- **CVIF engine** (`src/lib/cvif`) — turns a session transcript into a scored, evidence-
  grounded Session Insight Record. This is the moat and the recurring-revenue layer.

The whole loop runs today: *session → CVIF score → dashboard → briefing → action.* It runs
on a **seeded synthetic dataset**; Phase 1 replaces the seed with real sessions from the
digital human.

## 2. Get it running (5 minutes)

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build && npm run lint
```

Read next, in order: this file → `ARCHITECTURE.md` → `INTEGRATION-DIGITAL-HUMAN.md` →
`CVIF.md` → `ROADMAP.md`.

## 3. Codebase map — built vs. to-build

| Area | Path | State | Owner |
|---|---|---|---|
| Product hub | `src/app/page.tsx` | ✅ built | Full-stack + UIX |
| Citizen experience | `src/app/experience` + `public/prototypes/dengar-citizen.html` | 🟡 approved prototype, served verbatim — **componentise into the PWA** | Full-stack + UIX |
| DENGAR Intelligence dashboard | `src/app/dashboard` + `public/prototypes/national-pulse.html` | 🟡 approved prototype — **wire to live aggregation API** | Full-stack |
| Session Explorer | `src/components/SessionExplorer.tsx` | ✅ React-native, on the CVIF engine | Full-stack |
| Weekly Briefing | `src/lib/briefing.ts` + `src/components/WeeklyBriefing.tsx` | ✅ generator built | Full-stack + AI |
| CVIF engine | `src/lib/cvif` | ✅ typed engine + deterministic scorer — **swap in LLM scorer** | Head of AI |
| PMO deployment (2nd) | `src/app/pm/*` + `public/prototypes/pm-*.html` | 🟡 approved prototypes — national scope, ministry routing | Full-stack + UIX |
| Digital-human seam | `src/lib/digital-human` | 🟥 server contract + browser **web-SDK contract** (`web-sdk.ts`) + mock — **implement the adapter** | Full-stack |
| Domain model | `src/lib/types.ts` | ✅ types — **back with Postgres schema** | Full-stack |
| Back end | — | 🟥 to build (NestJS) | Full-stack |

Legend: ✅ built · 🟡 works, needs productionising · 🟥 to build.

## 4. Ownership by role

### Full-stack developers
- **Back end (NestJS, modular monolith):** Booking API (Redis slot locks, OTP, state
  machine), Notification service (WhatsApp BSP → SMS → email), **Session gateway**,
  Transcript ingestion, Admin API. See `ARCHITECTURE.md`.
- **Digital-human adapter** — implement `DigitalHumanGateway` (server) and the browser
  **avatar web-SDK** wiring typed in `web-sdk.ts`: mount `<avatar-container>` full-bleed,
  drive the controlled prompts with `echo()`, open/close the mic with `startStt()`/`endStt()`,
  and POST each `TEXT` / `STT_RESULT` turn to the transcript-record endpoint. The citizen
  prototypes already carry a `DigitalHuman` adapter whose mock bodies are annotated with the
  exact real call — swap them in place. See `INTEGRATION-DIGITAL-HUMAN.md`.
  **This is the critical path.**
- **Data tier:** Postgres schema from `src/lib/types.ts`; Redis; encrypted object store for
  transcripts/audio; immutable audit log.
- **Governance enforcement (non-negotiable):** implement `src/lib/governance` server-side —
  the five data tiers in **separate stores with separate keys**, `canAccess()` as the single
  authorisation point, hash-chained `AuditEntry` replicated to a Government-held log, and the
  Tier-4 quarantine→seal→refer→purge lifecycle. Encryption keys live in the **Government's**
  KMS, not ours. `refuseCrossBorder()` must gate every egress path, including the AI scoring
  call. Read [`docs/DATA-GOVERNANCE.md`](DATA-GOVERNANCE.md) before writing any persistence
  code — retrofitting this is not feasible.
- **Dashboard API:** replace the in-page synthetic dataset with a live CVIF aggregation
  endpoint feeding the same shapes the components already consume.
- **Role-gated views:** the dashboard's **Minister ↔ Secretary General** toggle is the front
  end of RBAC (Admin API issue) — Minister = read/insights, Secretary General = the
  operational assign/track/resolve surface. Back it with real roles + the audit log; do not
  rely on the client-side `body.sg` class for authorisation.

### UI/UX designer
- Own the **7 citizen screens + 5 dashboard views** as the design source of truth (the
  approved prototypes in `public/prototypes` are the baseline — do not regress them).
- Componentise the citizen experience prototype into the React PWA with the full-stack team
  (installable, WCAG 2.1 AA, RTL for Arabic, five languages).
- The closing screen now includes a **reflected session summary** (built from topic + district +
  the citizen's own words) and a **"you are the Nth Malaysian to speak" counter** — in production
  the counter is fed by the live sessions-count endpoint (see the aggregation API), and the summary
  should reuse the CVIF `SessionInsightRecord` (topic / pain point) rather than a client heuristic.
- Weekly-briefing print/PDF template polish.

### Head of AI
- **Replace `deterministicScorer` with the LLM `Scorer`** (same interface — nothing
  downstream changes). Structured extraction against the CVIF rubric in `src/lib/cvif`.
- **Behaviour profile** (welcome/probe/confirm/close + listening-mode guardrails) agreed with
  the Ministry, configured on the digital-human engine.
- **Manglish / code-switching glossary** + machine-translation normalisation; original
  transcript always preserved.
- **Sovereignty of the model call.** Raw transcripts are Tier-3 and may not leave Malaysian
  jurisdiction. Either host the scoring model in-country or put a de-identification gateway in
  front of any external call — see `docs/DATA-GOVERNANCE.md` §3.3. Also: no citizen data is
  ever used for training, fine-tuning or evaluation, including by subprocessors.
- **Reproducibility & calibration:** ≥ 90% classification agreement vs a human-labelled
  sample; publish confidence, not false precision (see `docs/CVIF.md`).
- Weekly-briefing generation quality + the human-in-the-loop review step.

## 5. The two seams that de-risk the whole build

Both follow the same pattern — a stable interface, a swappable implementation:

| Seam | Interface | Mock today | Real later | Owner |
|---|---|---|---|---|
| Digital human | `DigitalHumanGateway` | `MockDigitalHumanGateway` | vendor adapter | Full-stack |
| Scoring | `Scorer` | `deterministicScorer` | LLM extraction | Head of AI |

Because both are interfaces, the two workstreams proceed **in parallel** and integrate at the
`toTranscriptInput(payload)` → `scorer.score(input)` join.

## 6. Phase-1 backlog (build order)

1. **Confirm the digital-human SDK/vendor** and the §4.3 contract — unblocks the critical path.
2. NestJS skeleton + Postgres schema (from `src/lib/types.ts`) + Redis.
3. Booking API (slot locking, OTP) + Notification service (submit WhatsApp templates to Meta
   early — longest external lead time).
4. Session gateway + **digital-human adapter** + webhook ingress → transcript ingestion.
5. Wire CVIF into ingestion (`toTranscriptInput` → `scorer.score`); persist Insight records.
6. Live **dashboard aggregation API**; point `/dashboard` + `/sessions` + `/briefing` at it.
7. Head of AI: LLM scorer + glossary + calibration against a labelled pilot sample.
8. Componentise the citizen PWA; accessibility + load + pen test.

## 7. Open decisions & external dependencies (Phase 0)

- **Digital-human vendor/SDK** confirmed (top dependency).
- WhatsApp Business templates submitted to Meta (longest lead time).
- DPIA with Ministry legal; hosting (Malaysia-region vs sovereign cloud).
- Session script wording + guardrail boundaries approved by Ministry comms.
- Launch parameters: concurrency (3–5 seats), hours (9am–9pm), cooldown (1/30 days),
  retention (transcripts 12mo / audio 90d).
- Level-2 taxonomy per Home-Ministry agency (`src/lib/cvif/taxonomy.ts`).

## 8. Definition of done — Phase 1

Full citizen journey end-to-end in staging with a **live digital human**; a completed
session appears in the dashboard within 15 minutes; the first weekly briefing generates from
real (pilot) data; security sign-off. (Pilot targets: ≥ 85% completion, ≤ 20% no-show,
≥ 90% classification agreement — `ROADMAP.md`.)
