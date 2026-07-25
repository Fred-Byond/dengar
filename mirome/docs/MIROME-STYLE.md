# MIROME Style — Layer 0 module spec

> **A seven-minute conversation instead of a twenty-four-item form.**
> Behavioural style profiling delivered by the digital human, on the assessment
> architecture MIROME Team Intelligence already runs.

Status: specification, v0.1. Nothing in this document is built yet.
Owner: BYOND Asia · Product.

---

## 0. Why this exists

Every team-building provider in the region already buys behavioural-style
profiles per participant. That is an existing budget line with an existing
buying habit — a far shorter sale than "let us diagnose your organisation."

MIROME Style takes that line item and replaces the form with a conversation.
It is the **land**; the Team Intelligence diagnosis is the **expand**.

Two facts shape the whole design:

1. **The disclosure gain is real but conditional.** People disclose more and
   manage impressions less when they believe *no human is observing* — not
   because the interviewer is rendered well. Get the privacy architecture and
   the wording wrong and this performs *worse* than the anonymous form the
   employee fills at home.
2. **You cannot port classic DISC scoring into conversation.** The traditional
   24-item forced-choice instrument is ipsative: scores compare within a person,
   not between people. Team composition maps require between-person
   comparability. MIROME Style is therefore **normative by construction**, and
   is a new instrument that maps onto the four-factor model — not a re-skin of
   anyone's questionnaire.

---

## 1. Naming and trademark discipline

| Use | Do not use |
|---|---|
| **MIROME Style** | DiSC®, Everything DiSC® (Wiley trademarks) |
| "four-factor behavioural style model" | "a DiSC assessment" |
| "maps to the D/I/S/C model used by most workplace style tools" | "DiSC-certified", "DiSC-validated" |

The underlying four-factor model traces to Marston (1928) and is public domain.
The trademarks, item banks and norms are not. Client-facing copy names the model,
never the publisher's brand.

**Never sold for selection.** Development, self-awareness and team composition
only. This is a positioning decision, a legal decision and a contract clause,
not a disclaimer.

---

## 2. The instrument

### 2.1 Dimensions

Defined as **observable workplace behaviour**, never as personality claims.

| Code | Name | What is being observed |
|---|---|---|
| **D** | Drive & directness | Pace of decision under incomplete information; willingness to take control; orientation to outcome over process |
| **I** | Influence & interaction | How the person moves others; relational vs evidential persuasion; outward orientation; expressiveness in work settings |
| **S** | Steadiness & stability | Preference for predictability; patience; supportiveness; response to unrequested change |
| **C** | Conscientiousness & precision | Attention to accuracy and standards; analysis before action; tolerance for ambiguity in process |

### 2.2 Output shape

Per dimension: **intensity 0–100**, a **confidence**, and the **verbatim span**
that supports it — identical to the evidence contract the TIF scorer already
enforces. Plus:

- **Natural style** — how the person describes working when unpressured
- **Adapted style** — what changes under pressure (elicited by a dedicated turn)
- **Primary / secondary** style label, derived, never shown without the intensities
- **Confirmation code** (`C` / `CC` / `NC` / `NE` / `IE`) from the reflect-back gate

No single "style score". No type label without the underlying profile. A person
is never reduced to one letter in any artefact this module produces.

### 2.3 The hybrid that makes it defensible

Each dimension gets **two independent estimates**:

1. **Conversational evidence** — behavioural markers extracted from what the
   participant describes doing, across at least three separate turns.
2. **Forced-choice micro-anchors** — eight spoken binary items, ~60 seconds
   total, embedded near the end of the conversation.

The anchors are not the score. They are the **calibration bridge**: they give
the validation study a comparable item set, they stabilise the model when the
conversation runs short, and they are the answer when a buyer's HR psychologist
asks how the inference is grounded. Conversation alone gives you a demo; the
anchor set gives you a technical manual.

Blending rule: anchors carry more weight as conversational evidence thins.
When conversational confidence is `high`, anchors contribute ~25%; at `low`,
~60%; at `insufficient`, the dimension reports `IE` and the anchor result is
shown as *indicative only*.

### 2.4 Exclusions — carried from TIF, plus two specific to speech

Accent · dialect · fluency · grammar · vocabulary · speaking speed · voice
pitch · appearance · camera quality · disability-related expression · technical
failure during the session.

Two additional rules this module must enforce, because inference from speech
introduces failure modes the pulse survey does not have:

- **No dimension score may be a monotonic function of response length.** Talkative
  participants would otherwise read as high-I and low-C. Marker counts are
  normalised by words spoken; the fairness audit tests for it explicitly.
- **No emotion inference.** The module scores described and enacted *behaviour*,
  never inferred affect from voice or face. This is a design rule and a
  regulatory one — see §7.

---

## 3. Conversational elicitation script

Seven to nine minutes. Six turns plus the anchor block and the reflect-back.
Every turn is designed to force a **contrast between two dimensions**, so the
participant reveals preference rather than reciting virtues. Every dimension
receives at least three independent observations.

Wording below is the English master. BM / 中文 / தமிழ் variants are translated for
*behavioural equivalence*, not literal wording, and re-checked against the
marker sets after translation.

### Turn 1 — decision under incomplete information · **D vs S**

> "Tell me about the last time you had to make a call at work without all the
> information you wanted. What did you do?"

*Probe if thin:* "How long did you sit with it before deciding?"

| D markers | S markers |
|---|---|
| Moved without full data; named the call as theirs; set direction; accepted the risk explicitly | Sought a second view; waited for more information; protected continuity; checked who would be affected |

### Turn 2 — moving others · **I vs C**

> "When you need people to get behind something, how do you go about it?"

*Probe:* "What do you lead with — the case or the conversation?"

| I markers | C markers |
|---|---|
| Relationship first; informal conversations before the meeting; enthusiasm and narrative; reads the room | Evidence first; prepares the document; lets the numbers argue; anticipates objections in writing |

### Turn 3 — the standard that slows things down · **C vs D**

> "Describe a time when following the proper process would have slowed something
> down. What did you actually do?"

*Probe:* "What did that cost, either way?"

| C markers | D markers |
|---|---|
| Kept the standard; raised the risk formally; checked before proceeding; documented the exception | Went around it; prioritised the outcome; accepted rework; escalated to get it unblocked |

### Turn 4 — change you did not ask for · **S vs I**

> "A change lands that you did not ask for and do not fully agree with. Walk me
> through your first week with it."

*Probe:* "Who did you talk to first?"

| S markers | I markers |
|---|---|
| Absorbed it; adapted steadily; supported others through it; needed time before committing | Talked it through immediately; rallied or vented; engaged the group; processed it out loud |

### Turn 5 — the pressure shift · **all four (adapted style)**

> "When the pressure is highest, what do people see from you that they do not see
> normally?"

*Probe:* "And what would your closest colleague say changes?"

This single turn produces the **natural vs adapted** distinction that carries most
of the perceived value in commercial style reports.

| Under pressure | Reads as |
|---|---|
| More directive, faster, less consultative | D ↑ |
| More vocal, more persuasive, more socially active | I ↑ |
| Quieter, more accommodating, absorbs load silently | S ↑ |
| More exacting, more critical of detail, slows to verify | C ↑ |

### Turn 6 — team-facing behaviour · **cross-check**

> "In a team meeting where something has gone wrong, what is your role in the
> first ten minutes?"

Used as an independent cross-check on Turns 1–4 rather than as a primary source.
Where it contradicts them, confidence is downgraded — a disagreement between
turns is information, not noise.

### Anchor block — eight spoken forced-choice items (~60s)

> "Last part, and it is quick. For each pair, tell me which is more true of you
> at work. There is no better answer."

| # | Pair | Poles |
|---|---|---|
| 1 | Decide fast and adjust **/** decide once and get it right | D / C |
| 2 | Talk it through with people **/** think it through on my own | I / C |
| 3 | Push for the change **/** protect what is working | D / S |
| 4 | Known team, known process **/** new people, new problem | S / I |
| 5 | Tell people where we are going **/** ask people where we should go | D / S |
| 6 | Get it moving **/** get it exact | D / C |
| 7 | Energy in the room **/** quiet focus | I / S |
| 8 | Rules give us speed **/** rules cost us speed | C / D |

### Reflect-back and confirmation

> "Here is what I heard about how you work: [two-sentence summary]. Tell me if
> any of that is off, and I will correct it."

Same confirmation gate the TIF session already uses. Here it does double duty:
it is the governance requirement **and** the face-validity moment that drives
participant acceptance of the report. A profile the participant corrected is a
profile they believe.

---

## 4. How it drops into the existing code

No change to the `Scorer` interface. No change to `aggregate.ts` behaviour for
existing constructs. No change to the dashboards that exist today.

```
src/lib/tif/
├── style.ts          NEW — STYLE_DIMENSIONS: markers, anchors, blending rules
├── types.ts          + StyleScore, StyleProfile; ParticipantInsightRecord.style?
├── scorer.ts         + scoreStyle(turns) called inside the existing score()
└── aggregate.ts      + styleComposition(records) — the only new aggregate
```

```ts
export interface StyleScore {
  dimension: "D" | "I" | "S" | "C";
  intensity: number;              // 0–100, normative
  confidence: Confidence;         // same union as every other TIF score
  evidenceQuote: string | null;   // verbatim, or the score is IE
  source: "conversation" | "anchor" | "blended";
}

export interface StyleProfile {
  natural: StyleScore[];
  adapted: StyleScore[];
  primary: "D" | "I" | "S" | "C" | null;
  secondary: "D" | "I" | "S" | "C" | null;
  confirmation: ConfirmationCode;
  /** True when ≥2 dimensions fall below moderate confidence. */
  indicativeOnly: boolean;
}
```

`ParticipantInsightRecord.style` is **optional**. Records without it — every
record that exists today — keep working untouched. That is the whole point of
having built the seam first.

Dashboard impact: **one new card** (team style composition) plus a new
participant-facing report route. Everything else is unchanged.

---

## 5. Data contract — who sees what

This table is the product. Get it wrong and the disclosure advantage in §0
disappears.

| Audience | Sees | Never sees |
|---|---|---|
| **Participant** | Full individual profile, immediately, downloadable, theirs to keep | — |
| **Facilitator** | Team composition map, pairing and table-mix recommendations, style gaps | Any individual profile, unless that participant opts in per session |
| **HR / management** | Aggregate composition only | Individual profiles, in any form, under any filter |
| **Reviewer** | Flagged sessions only, under the existing human-review workflow | Profiles not flagged |

Additional commitments, all cheap and all differentiating:

- **Participant-first sequencing.** The individual sees their profile *before*
  any aggregate is generated. Not simultaneously — before.
- **Transcript retention 90 days; profile 24 months.** The behavioural scores
  outlive the raw speech. No competitor offers this and it costs nothing.
- **Contractual non-use for selection**, written into the client MSA, not just
  the privacy notice.
- **Minimum group size of five** for every aggregate view, inherited from TIF.

---

## 6. Validation protocol

The instrument is unsellable to a serious HR buyer without these numbers.
Build Studies 1 and 3 into the first two paid engagements — the client is paying
for the sessions anyway, so validation costs incremental comparator licences and
analyst time, not a separate research budget.

| # | Study | n | Design | Gate to pass |
|---|---|---|---|---|
| **1** | Concurrent validity | 150–200 | MIROME Style + a licensed **normative** (Likert-based) four-factor instrument within 48h, order counterbalanced | Pearson **r ≥ 0.60** on all four dimensions; primary-style agreement **κ ≥ 0.60** |
| **2** | Test–retest | 60 | Same participants, 3–4 weeks apart, different scenario wording | **r ≥ 0.70** per dimension |
| **3** | Fairness audit | Study 1 sample | Score differences by session language, fluency band, response-length quartile, gender, role level | No dimension differs **> 0.3 SD** across language groups at equivalent content; **\|r\| ≤ 0.25** between any dimension and word count |
| **4** | Acceptance | Study 1 sample | Participant-rated accuracy and preference vs form | **≥ 80%** "accurate or mostly accurate"; **≥ 70%** prefer conversation to questionnaire |

**Decision rule.** Study 1 passes → sell as a style profile priced against
publisher profiles. Study 1 fails → the module still ships, but as *behavioural
style indicators for facilitator use*, priced lower and never used for team
composition decisions. Decide this on the data, not on the launch date.

Study 2 is the one nobody in the AI-inference category publishes, and it is the
strongest available answer to "your model is just reading their mood today."
Prioritise it accordingly.

**Human oversight.** Any profile with `indicativeOnly = true` is excluded from
composition maps and labelled as such on the participant's own report.

**Publish a technical manual** — construct definitions, item development, the
four studies, norms, intended use and explicit misuse warnings. The incumbents
all have one. It is the real barrier to entry for AI-native competitors, and
producing it is how MIROME stops being "an AI tool" in a procurement review.

---

## 7. Regulatory and IP constraints

| Constraint | Position |
|---|---|
| **EU AI Act** prohibits emotion inference in workplace contexts and classes employment-decision systems as high-risk | MIROME Style infers **behaviour described and enacted**, never affect from voice or face; and is contractually development-only, never selection. Both must be true in the code, not just the copy |
| **PDPA 2010 (MY) / PDPL (GCC)** | Explicit consent at session start, stated purpose, stated retention, right to withdraw. Already implemented in the portal's consent screen |
| **Wiley trademarks** | §1 naming discipline. Never imply certification or equivalence to a branded instrument |
| **Comparator licensing** | Studies 1 and 2 require legitimately licensed comparator profiles. Budget them; do not scrape or reimplement a publisher's item bank |

---

## 8. Pricing

**Assumption to verify:** publisher per-profile pricing in-market sits roughly at
USD 25–100 depending on brand and report depth, with facilitator certification
sold separately. Confirm current regional quotes before finalising the sheet.

| Line | Price | Logic |
|---|---|---|
| **Style session credit** | **RM 45–75 / ~USD 10–16** per participant | Undercut publisher profiles decisively; win on speed, language coverage and the fact that no one has to fill a form |
| **Provider licence — Starter** | RM 12,000 / yr incl. 200 credits | Small facilitator practices; the volume tier that builds the corpus |
| **Provider licence — Growth** | RM 45,000 / yr incl. 1,000 credits | Established providers; co-branded report |
| **Provider licence — Partner** | RM 120,000 / yr incl. 5,000 credits | White-label report, API access, facilitator certification included |
| **Enterprise platform** | Annual subscription by headcount band | Unlimited style sessions, bundled with Team Intelligence |
| **Add-ons** | Custom scenario language, industry norming, private deployment | Priced per engagement |

**Why per-credit and not per-seat.** It matches the buying habit already in the
channel — providers buy profile credits today. No procurement re-education, no
new budget line, no new approval path.

**Unit economics.** Marginal cost per session is STT + TTS + inference:
approximately **USD 0.30–0.90** depending on model tier and session length.
Gross margin above 90% at the prices above. The real costs are one-time: the
validation programme (comparator licences, participant incentives, analyst time)
and facilitator enablement.

**The number to instrument from day one:** what share of style-only clients
convert to a full Team Intelligence engagement within 12 months. Plan on 20–30%;
if it lands below 15%, the land-and-expand thesis is wrong and Style has to
stand on its own volume economics.

---

## 9. Moat

Not the avatar — Klleon-grade rendering is licensable by anyone. Not the model —
four-factor DISC is public domain. The defensibility is:

1. **A consented first-party corpus of workplace conversation paired with
   ground-truth instrument scores**, in Bahasa Melayu, English, Mandarin and
   Tamil, including code-switched speech no US publisher handles. Every paired
   session improves inference and deepens switching cost.
2. **The evidence-grounded scoring architecture already built in TIF** — verbatim
   support, confidence, non-scores, review routing. Competitors ship a score;
   MIROME ships a score with its evidence.
3. **The provider channel.** Facilitators who certify on MIROME Style and build
   their programme design around it do not switch back to a form.
4. **The published technical manual.** Slow to produce, and the thing enterprise
   and government procurement actually asks for.

---

## 10. Build sequence

**Days 0–30 — instrument**
1. Author `style.ts`: dimensions, markers, anchor items, blending rules
2. Extend `types.ts` and `scorer.ts`; individual report route
3. Translate the script into BM / 中文 / தமிழ் for behavioural equivalence
4. Internal dogfood, n ≈ 30, to shake out elicitation wording

**Days 31–60 — evidence**
5. Study 1 and Study 3 run inside the first two paid engagements
6. Team style-composition card in the dashboard
7. Provider pricing sheet and licence agreement, including the non-use clause

**Days 61–90 — commercial**
8. Technical manual v1 with Study 1 and 3 results
9. Study 2 (test–retest) launched
10. First provider licence signed; conversion instrumentation live

**Gate at day 60:** do not sign a provider licence that claims profile-grade
accuracy before Study 1 clears its threshold. Sell it as indicative until the
number exists.
