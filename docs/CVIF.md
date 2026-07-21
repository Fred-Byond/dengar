# Citizen Voice Intelligence Framework (CVIF)

The intelligence layer of DENGAR.ai. It converts a controlled 5-minute listening session
into a de-identified, evidence-grounded **Session Insight Record**.

> **Core instruction.** Reuse the evidence architecture (exact-quote extraction, construct
> mapping, evidence-quality controls, confidence, reproducibility, human-review triggers).
> **Score the conversation as evidence about an issue — never the citizen as a person.**

Employment-assessment constructs (confidence, stress handling, charisma, fluency,
communication style) are explicitly **not** used. Citizens are not candidates.

Code: [`src/lib/cvif`](../src/lib/cvif).

## The seven dimensions

Each dimension answers a distinct Ministry question and stays **visible** in the dashboard
rather than collapsing into one opaque master score. Full rubric anchors are encoded in
[`dimensions.ts`](../src/lib/cvif/dimensions.ts).

| # | Dimension | Scale | Answers |
|---|-----------|-------|---------|
| 1 | Sentiment Direction & Intensity | −2 … +2 · IE | How does the citizen feel about a specific issue target? |
| 2 | Issue Clarity | 1 … 5 · NE · IE | Can the Ministry understand what happened, where and why it matters? |
| 3 | Evidence Strength | 1 … 5 · IE | How confidently can the Ministry act on this claim? |
| 4 | Impact Severity | 1 … 5 · IE | How serious is the reported consequence? |
| 5 | Request Actionability | 1 … 5 · NE · IE | Is there a concrete improvement to cluster into a backlog? |
| 6 | Confirmation Status | C · CC · NC · NE · IE | Did the citizen agree the reflected summary was accurate? |
| 7 | Urgency & Escalation | Normal · Priority · Urgent · Critical | What routing does this require? |

### Control codes

- **NE — Not Elicited**: the digital Minister did not create the opportunity to surface it.
- **IE — Insufficient Evidence**: the transcript is too weak or unclear to score fairly.
- **Confidence**: every score carries `high · moderate · low · insufficient` — publish
  confidence, never false precision.

## The pipeline (§7 of the Project Paper)

1. **Capture** — transcript, speaker turns, language tag, timestamps, quality metadata.
2. **Normalise** — translate non-English to a working language; always preserve the original.
3. **Segment** — into issue / evidence / impact / request / confirmation turns.
4. **Extract** — exact supporting quote for every proposed field and score.
5. **Map** — each excerpt to one *primary* dimension (best-fit; no double-counting — §7.1).
6. **Control** — apply evidence-quality and excluded-confound rules.
7. **Score or abstain** — assign a score only where evidence exists; else NE / IE.
8. **Confidence** — high / moderate / low / insufficient.
9. **Escalate** — run urgency rules and human-review triggers.
10. **Summarise** — produce the citizen-confirmed neutral summary + Session Insight Record.
11. **Aggregate** — only de-identified records feed dashboard trends and the weekly briefing.

## Best-fit evidence mapping (§7.1)

The same excerpt should not produce full scores across multiple dimensions unless it contains
distinct evidence. *&ldquo;I went back three times and still have no answer&rdquo;* primarily
supports **evidence strength** and **impact**; it may provide context for negative sentiment,
but its influence is not multiplied across weighted outputs without separate evidence.

## Human-review triggers (§7 step 9)

Low-confidence-on-high-severity, impact 4–5, urgency Urgent/Critical, abusive/illegal/
safety-critical content, reputationally sensitive content, or a Not-Confirmed summary on a
material issue — each routes the session to a Ministry reviewer / trained analyst regardless
of the automated scores. See `HUMAN_REVIEW_TRIGGERS` in `dimensions.ts`.

## Swapping in the LLM scorer

`deterministicScorer` (dependency-free heuristics) is used for the demo dashboard and for
pipeline tests. The production **LLM structured-extraction** pass implements the same
[`Scorer`](../src/lib/cvif/scorer.ts) interface and returns the same `SessionInsightRecord`,
so nothing downstream changes. Reproducibility testing (§3) holds the LLM pass to materially
consistent results on the same transcript + rubric version.
