# Architecture

DENGAR.ai is a **modular monolith** (not microservices at this scale), split into a front
end, a back end, an intelligence layer, and a governed data tier.

```
Citizen (mobile PWA)                         Ministry (role-gated dashboard)
        │                                              ▲
        ▼                                              │
┌─────────────────────────────────────────────────────────────────────┐
│  FRONT END — Next.js PWA (this repo)                                  │
│  /experience  booking · lobby · 5-min session · close                │
│  /dashboard   National Pulse (5 views) + action tracker              │
└─────────────────────────────────────────────────────────────────────┘
        │                                              ▲
        ▼                                              │
┌─────────────────────────────────────────────────────────────────────┐
│  BACK END — Node (NestJS), REST/OpenAPI                               │
│  Booking API · Notification service · Session gateway ·              │
│  Transcript ingestion · Admin API                                    │
└─────────────────────────────────────────────────────────────────────┘
        │                                              ▲
        ▼ transcript webhook                           │ aggregations
┌─────────────────────────────────────────────────────────────────────┐
│  INTELLIGENCE — queue workers                                        │
│  transcribe → translate → CVIF extraction (src/lib/cvif) →           │
│  aggregate → weekly Ministry briefing (human-reviewed)               │
└─────────────────────────────────────────────────────────────────────┘
        │                                              ▲
        ▼                                              │
┌─────────────────────────────────────────────────────────────────────┐
│  DATA & GOVERNANCE                                                   │
│  PostgreSQL (relational core) · Redis (slot locks / OTP / queues) ·  │
│  encrypted object store (transcripts/audio) · immutable audit log    │
│  PDPA 2010 · DPIA · role-based PII masking                           │
└─────────────────────────────────────────────────────────────────────┘
```

## What lives in this repo today

| Concern | Location | State |
|---------|----------|-------|
| Product hub | `src/app/page.tsx` | Built (React/Tailwind) |
| Citizen experience | `src/app/experience` + `public/prototypes/dengar-citizen.html` | Approved prototype, served verbatim |
| Dashboard | `src/app/dashboard` + `public/prototypes/national-pulse.html` | Approved prototype, served verbatim |
| CVIF intelligence | `src/lib/cvif` | Built (typed engine, deterministic scorer) |
| Domain model | `src/lib/types.ts` | Built (types) |
| Back end / DB | — | Roadmap Phase 1 |

## The one integration everything rests on

The **digital-human integration contract** (Dev Plan §4.3): the conversation engine
(avatar, voice, multilingual dialogue) already exists and is consumed as a service. The
session gateway must:

- send **per-session context** in (name, language, topic, state);
- support the **controlled-session behaviour profile** (listening-mode guardrails, wrap/close prompts);
- receive **timing signals** (4-minute wrap, 5-minute close, gateway termination);
- receive the **transcript webhook** (speaker turns + language tag) within minutes of close.

The transcript webhook is the single input to the intelligence layer.

## Key decisions

- **Custom dashboard, not an embedded BI tool** — the map-first, minister-grade presentation
  is a differentiator, role-based PII masking is easier to enforce in-app, and the dashboard
  is reusable BYOND platform IP across future government clients.
- **CVIF behind a `Scorer` interface** — deterministic now, LLM later, same output shape.
- **Malaysia-region / sovereign cloud** — data residency; WAF; TLS 1.3; encryption at rest.
