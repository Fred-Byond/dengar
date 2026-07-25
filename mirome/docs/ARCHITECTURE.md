# Architecture

One Next.js application, two product halves, one intelligence layer between them.

```
                  ┌──────────────────────────────┐
   participant →  │  /experience                 │  consent · context · pulse
                  │  Participant Assessment      │  interview · scenarios
                  │  Portal (client-only)        │  reflection · confirmation
                  └───────────────┬──────────────┘
                                  │ transcript + pulse
                  ┌───────────────▼──────────────┐
                  │  src/lib/digital-human       │  SEAM — vendor SDK behind
                  │  gateway + Klleon adapter    │  a typed contract
                  └───────────────┬──────────────┘
                                  │ TranscriptWebhookPayload
                  ┌───────────────▼──────────────┐
                  │  src/lib/tif                 │  SEAM — deterministic now,
                  │  scorer → aggregate          │  LLM extraction later
                  └───────────────┬──────────────┘
                                  │ TeamIntelligenceProfile
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
   /dashboard                /facilitator              /participants
   Team Intelligence         Facilitator               Participant
   (Facilitator / HR)        Intelligence Pack         Explorer (evidence)
```

## Routes

| Route | Rendering | What it is |
|-------|-----------|------------|
| `/` | static | Product hub — the two halves and the framework |
| `/experience` | dynamic (reads the SDK key at request time) | The participant journey. Client-only: owns the digital-human SDK, the microphone and the session timers |
| `/dashboard` | static from the seeded pipeline | Team Intelligence. Two role views, five measurement waves, department drill-down, action tracker |
| `/facilitator` | static | The printable Facilitator Intelligence Pack |
| `/participants` | static | Participant Explorer — the evidence behind every score |
| `/api/health` | route handler | Container health check |

## The two seams

**Digital human** (`src/lib/digital-human`). `DigitalHumanGateway` is the
interface the session service programs against; `MockDigitalHumanGateway` is the
local stub; `adapters/klleon.ts` is the concrete browser SDK adapter used by
`useKlleonAvatar`. `toTranscriptInput` maps the engine's outbound webhook onto
the scorer's input — one function joins the conversation to the intelligence.

**Intelligence** (`src/lib/tif`). `Scorer` takes a transcript and returns a
Participant Insight Record. `aggregate.ts` turns records into the
`TeamIntelligenceProfile` every view reads. Replace the scorer, keep everything
downstream.

## Data flow in the demo

`src/lib/seed.ts` generates a transcript per participant, runs it through the
**real** scorer, and aggregates with the **real** engine. The dashboards are
therefore wired to the production pipeline, not to hand-written numbers.
Replacing the seed with a database read changes nothing in the views.

## Production components still to build

| Component | Status here | Production |
|-----------|-------------|------------|
| Invitation & consent service | not present | holds the identity mapping; the analysis store never sees a name |
| Pulse capture | in the portal | persisted per reference, encrypted at rest |
| Session gateway | mock | vendor adapter + webhook ingress with signature verification |
| Transcript store | not present | segregated encrypted store, retention policy, deletion |
| Scoring | deterministic | LLM structured extraction behind the same `Scorer` interface |
| Human review console | queue is visible | reviewer workflow, decisions written to the audit log |
| Audit log | not present | immutable: rubric version, model version, reviewer decisions |
| Reassessment scheduler | waves are modelled | 30 / 60 / 90-day pulses, invitations, reminders |

## Environment

| Variable | Purpose |
|----------|---------|
| `KLLEON_SDK_KEY` | Digital-human SDK key, read at **runtime** (preferred in Docker) |
| `NEXT_PUBLIC_KLLEON_SDK_KEY` | Same key for local `next dev` |
| `PORT` | Container port (8082 by default; Dengar uses 8081) |

Next inlines `NEXT_PUBLIC_*` at image build time, which is why production reads
`KLLEON_SDK_KEY` at request time instead.
