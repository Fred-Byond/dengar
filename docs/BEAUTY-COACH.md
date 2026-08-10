# L'Oréal Beauty Coach — Phase 1 (Foundation)

Appointment-based launch-readiness coaching for L'Oréal distributors, agents
and beauty advisors, built on the dengar chassis. Route: **`/coach`**.

## User journey

1. **Landing** → value proposition for the current launch.
2. **Access** — advisor signs in with a **distributor-issued access code**.
   The code carries market → territory → distributor, so those analytics
   dimensions are trustworthy, never self-declared. Advisor adds name + role
   (distributor staff / agent / salesperson).
3. **Slots** — real slot inventory (SQLite-backed, capacity-guarded booking
   transaction). Slot capacity = concurrent-session tier (pilot: 3).
4. **Setup** — product/launch of interest, coaching focus (product knowledge /
   objection handling / routine building / price positioning), language.
5. **Confirmed** → booking reference `LBC-2026-XXXXXX`.
6. **Lobby** — mic check + launch pack preload.
7. **Session** — live voice conversation with the Klleon avatar. Every advisor
   utterance goes to the **governed conversation engine**
   (`src/lib/coach/engine.ts`): Claude answering ONLY from the versioned
   launch knowledge pack; deterministic pack-grounded fallback without an API
   key. 15-minute timer with wrap-up cue.
8. **Debrief** — six-dimension launch-readiness scorecard (Product Accuracy,
   Message Fidelity, Brand Tone, Objection Handling, Personalization, Upsell
   Fluency) with verbatim evidence quotes and NE abstention, adapted from the
   CVIF architecture. Certification at ≥80.

## Architecture

| Layer | Where |
|---|---|
| Domain types | `src/lib/coach/types.ts` |
| Launch knowledge packs (SAMPLE content) | `src/lib/coach/packs.ts` |
| Coach persona (swappable config) | `src/lib/coach/persona.ts` |
| Conversation engine (Claude + fallback) | `src/lib/coach/engine.ts` |
| Advisor auth (HMAC cookie + access codes) | `src/lib/coach/auth.ts` |
| SQLite data layer + seed | `src/lib/db/` |
| Readiness scoring | `src/lib/readiness/` |
| API routes | `src/app/api/coach/**` |
| Advisor UI | `src/components/coach/CoachApp.tsx`, `src/app/coach/` |

## Demo access codes (seeded)

`GULF-DXB-2026` (Gulf Beauty Trading, Dubai) · `EMERALD-AUH-2026` (Emerald
Distribution, Abu Dhabi) · `KL-BEAUTY-2026` (KL Beauty Network, Kuala Lumpur)
· `DEMO-2026`.

## Environment

See `.env.example`: `ANTHROPIC_API_KEY` (governed engine; optional),
`COACH_MODEL`, `COACH_SESSION_SECRET`, `COACH_DB_PATH`, plus the existing
Klleon variables.

## Deliberate Phase-1 limits

- Session language is English only pending the Klleon voice-coverage test
  (current vendor mapping falls back to `en_us` for ZH/TA/AR).
- Scoring is a deterministic heuristic with evidence quotes; the Week-5
  upgrade is an LLM judge on the same rubric (same seam, `readiness/scorer.ts`).
- WhatsApp reminders, HQ dashboard, and role-play digital customers are
  Phase 2 per the approved proposal.
- Pack content in `packs.ts` is sample copy, clearly not brand-approved.

## Product Nexus (product-team console) — `/nexus`

The knowledge-ingestion layer: the product team signs in with a
**product-team access code** (seeded demo: `LOREAL-PM-2026`) and maintains
the product knowledge library the coach trains on.

- **Library** — every product with its live pack version, photo, category
  and last-updated date.
- **Upload / edit** — product details + hero photo (stored in SQLite,
  served at `/api/coach/product-image/[id]`), and the governed pack in a
  fixed six-section frame (positioning, hero claims, ingredient story,
  routine, price positioning, complete-the-routine) plus approved claim
  phrases, do-not-say list and objection library. Retrieval keywords are
  derived automatically (`src/lib/coach/packbuild.ts`).
- **Publish = new immutable pack version.** The coach reads the latest
  version immediately; history stays auditable. Advisors see new products
  (with photos) in the catalog with no deploy.

Routes: `/api/nexus/auth`, `/api/nexus/products` (GET list / POST publish),
`/api/nexus/products/[id]` (detail). Access codes now carry a `role`
(`advisor` | `product-team`); each app rejects the other's codes.
