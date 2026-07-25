# Team Intelligence Framework (TIF)

The intelligence layer — the part of MIROME Team Intelligence that is hard to copy.
Source of truth: *MIROME Team Intelligence — AI-Powered Team Diagnosis, Workshop
Customisation and Organisational Development Platform* (BYOND Asia, Concept v1.0).

Implemented in [`src/lib/tif`](../src/lib/tif):

| File | What it holds |
|------|---------------|
| `types.ts` | Participant Insight Record, aggregate shapes, non-score codes |
| `constructs.ts` | Layer 1 capability rubrics, Layer 2 climate constructs, level bands, excluded confounds, review triggers |
| `scenarios.ts` | Layer 3 workplace scenarios and their observable behaviours |
| `taxonomy.ts` | Workplace theme taxonomy + default owner routing |
| `interventions.ts` | Diagnosis → intervention mapping (the recommendation engine) |
| `scorer.ts` | The `Scorer` seam + deterministic implementation |
| `aggregate.ts` | Team Intelligence Engine: construct results, gaps, segments, priorities |

## The core principle

The system assesses **how a team functions**, using the conversation as evidence
about a working relationship. It never assesses the employee as a person, and it
is never a disciplinary instrument. If those two lines are crossed, participants
give socially desirable answers and the dataset becomes worthless (§23.3).

## Three layers

**Layer 1 — individual workplace capability.** Six behaviourally anchored
constructs: communication effectiveness, empathy and perspective-taking,
constructive assertiveness, collaborative problem-solving, critical thinking,
stress handling. Scored 1–5 from transcript evidence, or `NE` / `IE`.

**Layer 2 — team climate.** Ten conditions: psychological safety, trust, role
clarity, goal alignment, collaboration, constructive conflict, leadership
openness, inclusion and belonging, accountability, collective resilience. Each
carries one confidential pulse item and one interview probe used when the pulse
item scores low.

**Layer 3 — behavioural scenario simulation.** Five workplace situations
delivered as a digital-human role-play. Stronger evidence than self-report,
because the participant has to act rather than describe themselves.

## Rules the pipeline enforces

1. **Evidence or nothing.** Every score points at a verbatim response or is
   reported as `NE` (Not Elicited — the session never created the opportunity) or
   `IE` (Insufficient Evidence). A missed opportunity is never a low score.
2. **Confidence travels with the number.** Sample size, spread and confidence
   are attached to every construct result and shown in every view.
3. **Excluded confounds never move a score** — accent, grammar, fluency, speed,
   appearance, eye contact, camera quality, charisma, disability-related
   expression, and technical failures during the session.
4. **No universal team score.** Distinct constructs stay visible so the
   organisation can act on them. There is no single number to game.
5. **Minimum group size.** Nothing is displayed for a group below
   `MIN_SEGMENT_N` (5), in any view, under any filter.
6. **Human review routing.** Welfare, safety, harassment, named-individual
   allegations, unconfirmed material summaries and low-confidence consequential
   findings go to a trained reviewer before they reach a dashboard.
7. **Only interview turns are quotable.** A scenario answer is a hypothetical;
   quoting it as a statement about the team would misrepresent the participant.

## Descriptive levels

Results are reported as bands, not as a grade:

| Level | Climate index | Meaning |
|-------|---------------|---------|
| Established Strength | ≥ 78 | Protect it and use it as leverage |
| Functional | ≥ 66 | Works today; monitor rather than intervene |
| Developing | ≥ 54 | Inconsistent; candidate for workshop content |
| Priority Attention | < 54 | Materially limiting; design the intervention here |
| Insufficient Evidence | — | Below the reporting threshold or unscoreable |

Layer 1 uses the rubric means directly (`levelForCapability`) because a mean of
3.0 *is* "Developing" on the behavioural anchors.

## Priority ranking

`interventionPriorities` ranks by **scale × spread × confidence**, not by raw
score. A weak construct reported by the whole organisation is a different problem
from one concentrated in a single small segment, and the ranking says which.

## Swapping in the production scorer

`Scorer` is the seam:

```ts
import { deterministicScorer, type TranscriptInput } from "@/lib/tif";

const record = deterministicScorer.score(transcript);
// → { capabilities, climate, scenarios, reflection, themes,
//     anonymisedQuote, summary, confirmation, humanReview, ... }
```

The production LLM structured-extraction pass implements the same interface and
drops in behind it. The aggregations, the dashboards and the facilitator pack
never change shape. The deterministic implementation stays as the offline,
inspectable baseline for regression testing.
