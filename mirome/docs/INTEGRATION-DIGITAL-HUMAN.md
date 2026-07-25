# Digital-human integration

The conversation engine already exists inside BYOND and is consumed as a
service. This document is the contract to confirm with the platform team before
Phase 2 (assessment deployment).

## Sequence

```
portal                gateway               engine                intelligence
  │  consent + pulse     │                     │                       │
  ├─ POST /sessions ────►│                     │                       │
  │                      ├─ initSession(ctx) ─►│                       │
  │◄── SessionHandle ────┤                     │                       │
  ├─ join (single use) ──┼────────────────────►│                       │
  │                      │                     │  structured interview │
  │                      │◄── started ─────────┤                       │
  │                      ├─ wrap  (T-75s) ────►│                       │
  │                      ├─ close (T-0) ──────►│                       │
  │                      │◄── transcript ──────┤                       │
  │                      ├─ toTranscriptInput ─┼──────────────────────►│
  │                      │                     │        scorer → record│
```

## What the engine receives

`SessionContext` — reference, greeting name (runtime only, never stored with the
record), language tag, wave, participant context, behaviour profile id and the
scenario ids selected for this participant.

Scenarios are chosen from the participant's own lowest pulse responses
(`scenariosForFocus`), so the role-play probes what the pulse flagged.

## Behaviour profile

`TEAM_DIAGNOSIS_PROFILE` (`src/lib/digital-human/gateway.ts`) is configuration on
the existing platform, not a new dialogue engine. Its guardrails are product
requirements:

- never evaluate the participant as a person;
- never give advice, coaching or a verdict during the session;
- never repeat a named individual back to the participant;
- never imply the assessment affects pay, promotion or discipline;
- on distress or a safety disclosure: acknowledge, stop probing, route to human
  review;
- always confirm the summary before closing, and accept a correction.

## What the engine returns

`TranscriptWebhookPayload` — session id, reference, wave, participant context,
the pulse answers captured in the portal, start/end timestamps, an early
termination flag, the turns (each tagged with `scenarioId` when it belongs to a
scenario), an optional recording pointer and whether the summary was confirmed.

`toTranscriptInput(payload)` maps it onto the scorer's input. That is the only
join between the conversation and the intelligence layer.

## Non-functional expectations to confirm

| Item | Expectation |
|------|-------------|
| Session length | 15–20 minutes; portal budgets 10 minutes for the interview itself |
| Languages | English, Bahasa Melayu, 中文, தமிழ் at minimum |
| Latency | first response within ~2s of the participant finishing a turn |
| STT | per-turn transcript with language tag; empty results must not fail the turn |
| Delivery | transcript webhook within minutes of close, signed and retryable |
| Failure | technical failure is recorded as a **system-quality** event, never as weak participant performance |

## Browser notes carried over from DENGAR.ai

The Klleon adapter in `src/lib/digital-human/adapters/klleon.ts` handles three
production problems that cost real debugging time:

1. **Audio unlock.** TTS is an Agora `remoteAudioTrack`, not the `<video>`
   element — it must be re-played under a user gesture, which is why the session
   screen shows a tap gate when the countdown auto-starts.
2. **Send gate.** `CONNECTED_FINISH` arriving after `VIDEO_CAN_PLAY` silently
   blocks sends; `ensureKlleonSendReady()` re-fires `canplay` to restore it.
3. **Strict Mode.** The client is ref-counted so a React remount does not
   destroy a session mid-initialisation.
