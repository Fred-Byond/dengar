# Integrating the digital human (SDK connection)

The conversation engine — avatar, voice, multilingual dialogue — **already exists** and
is consumed as a service. DENGAR.ai wraps it with booking, session control, and the
intelligence layer. This is the single integration everything rests on.

The seam is typed in [`src/lib/digital-human`](../src/lib/digital-human). The full-stack
team implements one adapter against the vendor SDK; nothing else changes.

## The contract (§4.3 of the Development Plan)

| Direction | What | Type |
|---|---|---|
| **In** | Per-session context at start (name, language, topic, state) | `SessionContext` |
| **In** | Behaviour profile (controlled-listening script + guardrails) | `BehaviourProfileId` |
| **In** | Timing signals mid-session (4-min wrap, 5-min close, terminate) | `TimingSignal` |
| **Out** | Session started / ended events | `SessionEvent` |
| **Out** | Full transcript webhook (speaker turns + language tag) | `TranscriptWebhookPayload` |

If any element is missing from the vendor SDK, budget 1–2 weeks of joint integration work
(Dev Plan §4.3).

## Sequence

```
Booking API           Session Gateway            Digital Human (SDK)        Intelligence
    │                       │                            │                       │
    │  slot due (T-15)      │                            │                       │
    ├──────────────────────►│  initSession(ctx) ─────────►│                       │
    │                       │◄──── SessionHandle{joinUrl} │                       │
    │                       │  (single-use link → citizen via WhatsApp)          │
    │                       │                            │                       │
    │                       │        citizen joins ──────►│ (live avatar stream)  │
    │                       │  sendTimingSignal("wrap")──►│  @ 4:00               │
    │                       │  sendTimingSignal("close")─►│  @ 5:00               │
    │                       │◄──── SessionEvent("ended")  │                       │
    │                       │◄──── TranscriptWebhookPayload (within minutes)      │
    │                       │        persist raw transcript (encrypted)           │
    │                       │        toTranscriptInput(payload) ─────────────────►│
    │                       │                            │   scorer.score(input)  │
    │                       │                            │   → SessionInsightRecord
    │                       │                            │   → aggregate → dashboard / briefing
```

## Where to plug in (full-stack team)

1. **Confirm the vendor + SDK** in Phase 0 (HoloMe Nexus / avatar-realism partner). This is
   the top external dependency.
2. **Write the adapter** — `src/lib/digital-human/adapters/<vendor>.ts` implementing
   `DigitalHumanGateway` (`initSession`, `sendTimingSignal`, `healthCheck`). Keep the
   interface stable; map onto the SDK inside the adapter only.
3. **Webhook ingress** — a NestJS controller that receives `TranscriptWebhookPayload`,
   **verifies the signature**, persists the raw transcript to the segregated encrypted
   store, then hands off to the intelligence layer.
4. **Join the intelligence layer** — one call:
   ```ts
   import { toTranscriptInput } from "@/lib/digital-human";
   import { deterministicScorer } from "@/lib/cvif"; // ← head of AI swaps for the LLM scorer
   const insight = deterministicScorer.score(toTranscriptInput(payload));
   ```
5. **Swap the mock** — replace `MockDigitalHumanGateway` with the adapter behind config so
   local dev keeps working.

## What the AI lead owns here

- The **behaviour profile** wording (welcome/probe/confirm/close) and listening-mode
  guardrails, agreed with the Ministry (Phase 0), configured on the engine — not new code.
- The **LLM `Scorer`** that replaces `deterministicScorer` behind the same interface, plus
  the Manglish/translation glossary and reproducibility testing (see `docs/CVIF.md`).

## Security notes

- Join links are single-use signed JWTs valid T-15 … T+10.
- The transcript webhook must be **signature-verified**; treat its content as sensitive.
- Recordings/transcripts go to a **segregated encrypted store**; retention per PDPA posture
  (transcripts 12 months, audio 90 days — confirm with Ministry legal).
