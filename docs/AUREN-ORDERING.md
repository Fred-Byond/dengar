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

## The front door

Paper IV's Stage 0 is thirty seconds and explicitly account-free, and it moves
eKYC out of entry into a post-session "verified certification" upsell. Both
builds now carry the full journey around that constraint rather than through it:

| Screen | Position | Why there |
|---|---|---|
| **Landing** | Before everything | Brand, thesis, language, and the way in. The primary button is account-free and says so — the absence of a wall is a selling point, not an omission. |
| **Sign in** | Optional, off the landing | Number plus a six-digit code. Restores the reasoning map and the retraining queue. Skippable from the screen itself, and never on the primary path. |
| **Welcome + consent** | Immediately before the loop | The framing line, the name, and the consent-to-be-pressured act that replaces the mode menu (D1). |
| **Verified certification** | After the evidence chain | Four eKYC steps — details, document, liveness, issue. The learner is holding a record they want to be able to prove. |

**Account and identity are separate concerns, and the separation is the design.**
Signing in stores a record. Verification asserts who you are. Conflating them is
what turns a five-minute rehearsal into an onboarding funnel, and it is the exact
failure mode Paper IV deletes when it removes the legacy assessment interview.

The certificate states plainly that it attests to a rehearsal, not to investment
competence, and makes no durable-behaviour claim — the same restraint the AILS
block carries. Certification binds the result to an identity; it never improves
the result.

---

## Languages

Four variants ship: **English, Spanish, Chinese, Arabic** — text *and* voice.

Paper III §10.2 makes language a first-class dimension of every scored
determination, not a display setting. So the localisation reaches all the way
into the engine:

| Layer | What is localised |
|---|---|
| **Voice out** | Speech-synthesis voice selected for the session's BCP-47 tag, with a distinct persona voice so the doctrine switch is *audible*. In the React build, `klleonVoiceCodes` maps the language onto the avatar's own voice and subtitle codes. |
| **Voice in** | Speech recognition runs in the session language. |
| **Knowledge objects** | Questions, challenges, escalation ladders, scenario props, failure-signature definitions and coaching lines, verification actions, PROTECT markers, element labels. |
| **Satisfaction cues** | **The critical one.** A Spanish answer is evaluated against Spanish cues. Ship English cues only, and every element silently fails for every non-English learner while the UI looks perfectly translated. |
| **Resistance detection** | Per-language patterns, because "I want to verify that myself" is not a translation exercise — it is the behaviour the retest measures. |
| **AILS explainability** | Composed from record fields in the learner's language. |

### One source, two builds

`src/lib/auren/i18n.ts` and `objects.ts` are canonical. The self-contained
prototype gets its copy injected by `npm run locale`
(`scripts/build-prototype-locale.mjs`), which compiles both files and writes the
result between markers in the HTML. **Do not hand-edit the prototype's locale
block** — a demo that has drifted from the product is worse than no demo.

### Arabic

Right-to-left is set on the device element so captions, rails, cards and the
scorecard matrix mirror together. Two things break Arabic if you only flip
direction, and both are handled: `letter-spacing` severs the cursive joining and
is neutralised throughout RTL; and the Latin faces carry no Arabic glyphs, so
Noto Sans/Naskh Arabic sit *after* them in each stack — element ids and scores
still render monospaced while Arabic renders properly.

### Fidelity status — read this before Madrid

Paper III §10.2: *"Language variants deploy only with fidelity status passed."*
Every variant carries its status, and the landing screen shows it:

| Language | Status |
|---|---|
| English | `passed` |
| Spanish | `review-pending` |
| Chinese | `review-pending` |
| Arabic | `review-pending` |

The three non-English variants are complete and demonstrable, but they have not
been through native review. **Spanish is the one to get reviewed before Madrid** —
it is the host language, a native speaker in the room will hear any stiffness in
the persona's pressure lines, and those lines have to sound like a real
salesperson or the whole authentic-pressure doctrine reads as translation. Set
the status to `passed` in `i18n.ts` once a reviewer signs it off; the landing
copy follows automatically.

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
10. **No account wall before the first session.** The landing's primary path
    reaches the loop without an account, and identity verification never
    appears before the evidence chain exists.
11. **The overlay zone scrolls, it does not squeeze.** `.lower` children carry
    `flex: none` and the container scrolls to its newest content. A shrunk flex
    item overflows its own box and collides with the next one — the mobile
    defect this rule exists to prevent.
12. **The figure is sized from a figure box, not the viewport.** Deriving the
    digital-human proportions from height alone throws the shoulders past both
    edges on a phone and it stops reading as a person.
13. **Satisfaction cues are localized with the question.** Adding a language
    means adding its cues and its resistance pattern, or the variant looks
    translated and scores every learner as failing.
14. **Only signatures the Coach explained may show a coach result.** An element
    whose signature was recorded but never taught has not been coached, and
    crediting it on the scorecard overstates the record.

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
