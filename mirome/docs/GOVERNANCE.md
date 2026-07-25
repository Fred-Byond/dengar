# Privacy, ethics and governance

Governance is a feature of this product, not a policy document attached to it.
Every rule below is enforced somewhere in the code, and the file is named.

| Rule | Where it is enforced |
|------|----------------------|
| No name, employee number or contact detail against an assessment record | `src/lib/tif/types.ts` — `ParticipantInsightRecord` has no identity field; the portal's greeting name is runtime-only |
| Minimum group size of 5 before anything is displayed | `MIN_SEGMENT_N` in `src/lib/tif/constructs.ts`; applied in `aggregate.ts` and rendered as hatched cells in the dashboard |
| Confidence and sample size shown with every number | `ConstructResult.confidence` / `.n`, displayed on every construct row |
| Non-scores instead of low scores when evidence is missing | `NE` / `IE` in the scorer; the Participant Explorer prints "reported as a non-score, not as a low score" |
| Human review for welfare, safety and named-individual content | `HUMAN_REVIEW_TRIGGERS`; the flagged content is withheld from the dashboard and only the reason is shown |
| Excluded confounds never move a score | `EXCLUDED_CONFOUNDS`; the scorer's cues are content-based, and the rule is printed in the participant lobby and the facilitator pack |
| Only interview turns are quotable, never scenario role-play | `pickAnonymisedQuote` in `src/lib/tif/scorer.ts` |
| Participant confirms or corrects the recorded summary | Confirm screen in the portal; `ConfirmationCode` on the record (`C` / `CC` / `NC` / `NE` / `IE`) |
| No individual report to the manager | Stated in consent, in the closing screen and in the facilitator pack; no per-person view exists outside the reviewer console |

## Consent

The participant is told, before anything is collected: what the assessment is
for, that it is not a performance review, what is stored, who sees what, that
groups below five are never displayed, that a trained reviewer reads welfare
content, that any question may be skipped, and the retention period.

## No hidden disciplinary use

The platform must not be introduced as a development tool and then used for
dismissal, punishment or unsupported promotion decisions (§16.3). This is a
contractual commitment to the workforce, not a technical control — but the
absence of any individual report makes the commitment credible.

## Evidence traceability

For every record the production system retains: the transcript evidence, the
scoring rationale, the confidence, the rubric version, the model version and the
review status. The Participant Explorer is the shape that reviewer console takes.

## Standards alignment

The wider BYOND governance approach references NIST AI RMF and ISO/IEC 42001 for
AI risk, transparency, traceability, fairness and human oversight. The rules
above are the product-level expression of those frameworks.

## Claims discipline

Until the validation programme in `ROADMAP.md` has run, the external claim is:

> An evidence-informed team diagnosis and programme customisation platform.

Not "predicts team performance". Not "scientifically proves cultural
improvement".
