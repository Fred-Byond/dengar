# AUREN — the ordering study, and what was built from it

> Companion to **Paper III v1.1** (Intelligent Investor Interview & Coaching Engine)
> and **Paper IV v1.0** (Product Experience & Build Specification).
> Where this document and Paper III conflict, **Paper III prevails**.

---

## The finding

Paper IV orders the product by the engine's state machine: S0–S7 becomes Stage 0–7,
one to one. That is architecturally honest and it is the right call for a six-week
demo build — it minimises build risk and lets the screens *be* the architecture in
front of a regulator.

It also means three different orderings got collapsed into one:

| Ordering | What governs it | Status in Paper IV |
|---|---|---|
| **Engine** | Causal necessity — you cannot coach before you have evidence | Correct |
| **Narrative** | What a TechSprint judge must see, in what order, to believe the claim | Correct |
| **Motivational** | What the learner must *feel*, in sequence, to stay in the loop and come back | **Unspecified** |

The first two align, which is why the loop demos well in three minutes. The third
does not align, and it governs everything after Madrid.

---

## The eight defects

Scoped honestly against the six-week constraint. "Before Madrid" means the fix is
cheap **and** it improves the demonstration.

| # | Defect | Fix | When |
|---|---|---|---|
| **D1** | Mode selector is a choice before comprehension. First-run always resolves to REHEARSE, so the screen is ceremony. | Consent-to-be-pressured act on entry; mode selector deferred to after the first evidence chain. Object-level mode gate unchanged. | Before |
| **D2** | The home screen has forgotten you. Three static doors is a worse home than one live one. | The Stage-7 button ("Rehearse your next weakness") becomes the returning user's home, opening on their own unresolved element. | After |
| **D3** | Restraint ordered as absence. A waveform proves the microphone works, not that the mind does. | Give the silence a non-analytical tell. Situation Map stays invisible as doctrine demands. | Before |
| **D4** | The soul screen is specified as a layout — quote cards and map-unfreeze fire together at the emotional peak. | Three staged beats ~2s apart: their sentence alone → the signature named → the map flips. | Before |
| **D5** | The verdict is buried in the audit. Stage 7 opens with the four-column matrix. | Verdict sentence first, matrix beneath it, AILS under that. Paper III §9.2 already makes this argument. | Before |
| **D6** | RETEST has no failure branch. Stage 6's exit is simply "→ Stage 7". | Carry non-transfer honestly to the scorecard. Never loop COACH twice to manufacture a pass. | Before |
| **D7** | PROTECT's position contradicts its commercial thesis. A habit cannot form behind a menu traversal. | Persistent PROTECT control on every screen — one control, not a mode door. Still one line in the Madrid script. | Before |
| **D8** | Ten minutes does not survive arithmetic. Eight elements at one voice turn each ≈ 3 min for DIAGNOSE alone. | Hard budget of **four elements per session**; the rest route to the retraining queue, which is what brings the learner back. | Before |

---

## Time budget

Realistic voice-turn estimates, not the truncated demo path.

| Stage | As specified | As built |
|---|---|---|
| Entry (+ consent) | 0:30 | 0:25 |
| Mode selector | 0:15 | — *(deferred, D1)* |
| UNDERSTAND | 1:30 | 1:30 |
| DIAGNOSE | 3:00 *(8 elements)* | 1:30 *(4 elements, D8)* |
| STRESS | 1:30 | 1:30 |
| COACH | 1:15 | 1:15 |
| RETEST | 1:30 | 1:30 |
| EVIDENCE | 1:00 | 1:00 |
| **Total** | **10:30** | **8:40** |

The specified order lands past the ten minutes the product thesis promises, with no
slack for ASR retries. The built order leaves ~80 seconds.

---

## What was built

### `/prototypes/auren-rehearsal.html` — the self-contained prototype

Voice-first, no SDK key required. Runs the complete corrected loop with a canvas
digital-human stage, browser speech synthesis for the coach and persona voices, and
speech recognition for push-to-talk. An engine panel beside the device renders the
live session model, the state machine, the object log and the ordering fix in play —
so the screen–engine mapping of Paper IV Part VI is visible rather than asserted.

Where speech recognition is unavailable (browser support, denied permission,
sandboxed frame) the beat still advances by voice using the authored rehearsed line.
**A text input is never introduced as a fallback** — typing produces edited answers,
and the interview needs unedited ones.

The canvas figure is a deliberate stand-in, labelled as such on screen. The shipped
build renders the Klleon avatar in that same zone.

### `/auren` — the React build

Steps 1–3 of Paper IV §8.3, on the corrected ordering, reusing the existing digital-
human runtime untouched.

```
src/lib/auren/
  objects.ts     Frozen inventory as DATA: 8 competency elements with authority
                 anchors, 8 failure signatures, 4 question objects, 2 challenge
                 objects with surface profiles and escalation ladders,
                 verification actions, PROTECT markers, the element budget.
  session.ts     Session model, engine states, satisfaction-rule evaluation,
                 the surface-distance retest selector, the mode gate, the AILS
                 aggregation rule, and the verdict.

src/components/auren/
  AurenApp.tsx            Stage router driving the loop over useKlleonAvatar.
  ReasoningMapRail.tsx    Three states; the freeze rule lives here.
  CoachEvidencePanel.tsx  Beat-driven, so the caller stages it as a cut.
  Scorecard.tsx           Verdict first, then the four-column evidence chain.
  auren.module.css        Brand system; face zone / overlay zone layout law.
```

**Carried over from the citizen experience, unchanged:** `useKlleonAvatar` and the
Klleon adapter (mic lifecycle, STT, TTS, audio-unlock gesture, echo suppression),
and the face-zone/overlay-zone layout law.

---

## Invariants a future change must not break

These are doctrine from Paper III, not preferences. Each is enforced in code at the
place named, so a component change cannot quietly undo it.

1. **The face is never occluded.** All content renders inside `.lower`, constrained
   by the layout system. There is no path for a component to draw over the face
   without moving itself out of that container.
2. **Voice is the primary affordance.** No multiple-choice component exists in the
   codebase, and no text input is offered as a session fallback.
3. **The freeze rule.** `ReasoningMapRail` stops updating during a challenge and
   shows its pre-challenge state, dimmed. Freeze means *stop updating*, not *go
   blank* — and a failing element never flips live.
4. **No mid-scenario correction.** The persona never breaks character except on a
   distress or exit trigger. The learner is allowed to make the mistake; that is
   where the behavioural evidence comes from.
5. **The mode gate is object-level.** `challengeMayFire()` gates on declared mode
   eligibility. A Challenge object can never fire outside REHEARSE.
6. **AILS reads only from the Reasoning Map.** The Situation Map routes scenarios
   and PROTECT markers and is never rendered in REHEARSE.
7. **Every determination is bound verbatim.** Nothing on the scorecard is generated
   prose; every cell points at the learner's own sentence and the object that
   elicited it.
8. **Within-session transfer only.** The scorecard prints the rule version and says
   durable transfer is not claimed. Restraint delivered as credibility.
9. **Ontology is data.** Adding a scam typology, element or signature is an edit to
   `objects.ts`, never a component change.

---

## Open decisions

| Decision | Options | Recommendation |
|---|---|---|
| Mode selector | Defer to post-loop, or keep at Stage 1 | **Defer** — as built. Keep the consent act unmistakably visible so the governance signal survives. |
| Failed retest | Carry honestly, or re-coach to a pass | **Carry honestly** — as built. This is where the measurement restraint either is or isn't true. |
| Element budget | 4 or 8 per session | **4** — as built. A fuller matrix nobody finished is worth less than a complete loop they repeat. |
| Repository | Build in place, or extract first | **In place now, extract before any external share.** See below. |

### The firewall risk

Paper III §10.4 binds: no companion-programme name, client name or parent brand may
appear in any AUREN-facing asset. This repository's product hub, brand component and
CSS carry exactly those marks. Building here is right for velocity; a shared
repository is an audit failure the first time a build, a branch or a screen recording
leaves the room.

**Recommended trigger, not date:** before any external share, extract the digital-human
runtime (`src/hooks/useKlleonAvatar.ts`, `src/lib/digital-human/`) into a standalone
internal package and seed a clean AUREN repository from it. That extraction is three
files today and a week's work once the router hardens.
