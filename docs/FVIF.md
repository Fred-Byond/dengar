# Fan Voice Intelligence Framework (FVIF)

The intelligence layer of **MESSI.LIVE**. It converts a controlled five-minute conversation
with the officially authorised digital human into a de-identified, evidence-grounded
**Fan Insight Record**.

FVIF is the direct sibling of [CVIF](CVIF.md): same evidence architecture (exact-quote
extraction, construct mapping, evidence-quality controls, calibrated confidence,
reproducibility, human-review triggers), pointed at a fan relationship instead of a
citizen grievance.

> **Core instruction.** Score the conversation as evidence about a **fan need** — never the
> fan as a person. Fans are not candidates, leads, or customers to be ranked.

Code: [`src/lib/messi/fvif`](../src/lib/messi/fvif).

## The seven dimensions

Each dimension answers a distinct question Messi's team would actually ask, and stays
**visible** in the dashboard. There is deliberately **no master score** — a single number
would turn a relationship platform into a ranking system. Full rubric anchors are encoded in
[`dimensions.ts`](../src/lib/messi/fvif/dimensions.ts).

| # | Dimension | Scale | Answers |
|---|-----------|-------|---------|
| 1 | Sentiment & Emotional Register | −2 … +2 · IE | How does the fan feel about a specific target inside the conversation? |
| 2 | Intent Clarity | 1 … 5 · NE · IE | Can the team understand what the fan actually came for? |
| 3 | Personal Context Depth | 1 … 5 · IE | Is this general admiration, or a specific lived situation? |
| 4 | Relationship Significance | 1 … 5 · IE | How much does this moment matter in the fan's life? |
| 5 | Content Actionability | 1 … 5 · NE · IE | Is there something Messi's world can make, do or answer? |
| 6 | Continuity Confirmation | C · CC · NC · NE · IE | Did the fan agree the reflected summary was right? |
| 7 | Care & Escalation | Normal · Watch · Care · Critical | What duty-of-care routing does this require? |

### Control codes

- **NE — Not Elicited**: digital Messi never created the opportunity to surface it.
- **IE — Insufficient Evidence**: the transcript is too weak or unclear to score fairly.
- **Confidence**: every score carries `high · moderate · low · insufficient` — publish
  confidence, never false precision.

### Excluded confounds

These must never influence any score. Encoded as `EXCLUDED_CONFOUNDS` and surfaced in the
dashboard so the rule is visible, not just documented:

membership tier, spend or lifetime value · accent, dialect or fluency · vocabulary ·
speaking speed or hesitation · emotional volume · follower count or fame · country or
market value · perceived football knowledge.

The age band is the one attribute that changes anything — and it changes **routing**
(children's environment, guardian consent, care escalation), never a score about the child.

## The pipeline

1. **Capture** — transcript, speaker turns, language tag, timestamps, quality metadata.
2. **Normalise** — translate to a working language; always preserve the original.
3. **Segment** — into question / context / stakes / request / confirmation turns.
4. **Extract** — the exact supporting quote for every proposed field and score.
5. **Map** — each excerpt to one *primary* dimension (best fit, no double-counting).
6. **Control** — apply evidence-quality and excluded-confound rules.
7. **Score or abstain** — emit NE/IE rather than guess.
8. **Confidence** — calibrate per dimension.
9. **Route** — run care/safeguarding and human-review triggers.
10. **Summarise** — produce the fan-confirmed summary, the memory candidate and the
    continuity hook.

## What makes FVIF different from CVIF

Two fields exist here that have no citizen equivalent, and they are the product:

- **`memoryCandidate` + `continuityHook`** — the durable fact worth carrying into the next
  conversation, and the opener digital Messi uses to raise it. Written **only** when the fan
  opted into memory **and** confirmed (or corrected) the summary. The fan can see and delete
  every memory. This is the mechanism behind "*Last time you told me you were preparing for
  your academy trial. How did it go?*" — and it is the retention engine of the platform.
- **`questionAsked`** — the fan's question, verbatim. This is the raw material of the weekly
  curation queue: the questions worth thirty seconds of Lionel's own voice.

## Human-review triggers

Any of these routes a conversation to a trained fan-care reviewer regardless of the
automated scores:

- Care level **Care** or **Critical**
- Relationship significance **5** (life-defining)
- A minor with high significance, before any content use
- Low confidence on a high-significance conversation
- Reserved or brand-sensitive content
- Continuity **not confirmed (NC)** on a memory candidate
- Any record proposed for Lionel's personal response queue

**Critical** disclosures — self-harm, abuse, imminent danger — trigger the pre-approved
safeguarding protocol. They are never handled by the avatar alone and never by a scripted
reply.

## Swapping in the LLM scorer

`deterministicScorer` in [`scorer.ts`](../src/lib/messi/fvif/scorer.ts) is a
dependency-free heuristic implementation used for the demo dashboard and for pipeline
tests. The production LLM structured-extraction pass implements the same `Scorer`
interface:

```ts
export interface Scorer {
  score(input: TranscriptInput): FanInsightRecord;
}
```

Everything downstream — the Global Pulse aggregations, the World Brief, the Conversation
Explorer — reads the record shape only, so the swap changes no other file. Exactly the same
seam as CVIF.
