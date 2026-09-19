# AUREN Nexus — the scam-intelligence layer

> The same three-layer shape as the Beauty programme on
> `claude/loreal-beauty-coach-appointments-z74555`, pointed at investor
> protection: **Product Nexus → Coach → HQ dashboard** becomes
> **Intelligence → Rehearsal → Supervision**.

| | |
|---|---|
| `/prototypes/auren-index.html` | The hub. Three doors: rehearsal, Nexus, Supervision Console. |
| `/prototypes/auren-nexus.html` | Self-contained. Three workspaces, real derivation, the real publish gate. |
| `/prototypes/auren-console.html` | The Supervision Console — named participants, individual assessments, verdicts. |
| `src/lib/nexus/` | Vocabulary, signal model, derivation, corpus, cohort analytics, participants. |
| `npm run nexus` | Compiles the library and the console's governance spine into **both** prototypes. |

---

## The thing this is not

An upload box wired to a model.

"Authorities upload new tactics, the coach learns them" is the obvious design
and it destroys the product. If a freshly-lodged signal can reach a learner as
speech, then nobody approved what the persona says, the escalation ladder has
no ceiling anyone signed, and a scam tactic submitted as intelligence becomes a
script a machine reads to a retail investor while applying pressure to them.

So the Nexus is a **pipeline with a human gate**, which is exactly what makes
L'Oréal's Product Nexus work: the product team writes plain content into a
fixed frame, publishing mints an immutable version, and the coach may read only
what was published. Nothing about that changes because the subject changed from
a serum to a fraud typology.

```
SIGNAL → TRIAGE → DERIVE → REVIEW → PUBLISH GATE → BUNDLE → RUNTIME → RECORDS
   ↑                                                                      │
   └──────────────  what is defeating people, and what we lack  ──────────┘
```

The arrow back is the point. A supervisory dashboard that only reports how
learners did is a report. One that reports **which tactics are beating people
and which of those we cannot yet rehearse against** tells the network what
intelligence it actually needs next. That loop is the asset.

---

## Three workspaces

### Intelligence — what authorities are seeing

A signal is lodged against a fixed frame: title, method, observable indicators,
four-axis classification, target profile, and the field that matters most —
**what reasoning this tactic defeats**. Without that last field nothing can be
derived, because there is nothing to connect the tactic to a competency
element. The intake check says so before anyone spends review time on it.

Signals carry a **traffic-light protocol marking**, the convention authorities
already share intelligence under. The marking governs who may *see* the signal.
It does not govern whether objects derived from it may *deploy* — a TLP:RED
signal can still produce a released challenge, because the challenge no longer
carries the source. That separation is what lets an authority contribute
intelligence it could never publish.

Contributors are organisations, never individuals — Pioneer's resolution, for
Pioneer's reason.

### Authoring — derivation proposes, humans dispose

`derive()` does the mechanical half: classify, map the tactic onto a competency
element, shape the candidate objects, carry the surface profile through, and
pre-compute eligibility. Everything it emits is DRAFT, carries the roles that
must sign it, and comes with an explicit list of **what it could not supply**:

| Gap | Whose signature |
|---|---|
| Authority anchor on a new element | Legal reviewer |
| The persona's actual words, every ladder step | Safety + domain reviewer |
| Ladder ceiling | Safety reviewer |
| Question wording, every deployed language | Domain reviewer + native reviewers |
| Signature definition and coaching line | Domain reviewer |

The gaps are the product. A console reporting "4 objects created" from an
upload would be telling the operator they had finished when they had not
started.

Then the candidates go through **the same publish gate as everything else** —
not a copy of it, the same compiled ten tests. And the gate's answer is
instructive: the derived objects are DRAFT, so they are not in the bundle at
all. Lodging intelligence and deriving from it changed nothing about what a
learner meets today. That is the system behaving correctly.

### Supervision — the regulator's view

Supervision is **two surfaces over two populations**, and they are not joinable.

| | Population | Grain | Where |
|---|---|---|---|
| Nexus · Supervision | Anyone who opened AUREN from a link — no account, no name | Cohort and tactic only | `auren-nexus.html?ws=super` |
| Supervision Console | People enrolled through an authority's programme, consent captured at enrolment | Named individual, every assessment | `auren-console.html` |

The public population is the larger one and is deliberately unreachable: nothing
retained identifies anybody, which is the property that makes a public rehearsal
safe to offer at all. Asking it "how did Nurul do" is not a permissions question
with a stricter answer — the record does not exist.

The enrolled population is the one a securities commission actually supervises,
and there a name is not a leak but the point: the sponsor is arranging the
coaching. Cohort membership still arrives through the access code, which carries
authority, jurisdiction and cohort — so the analytics dimensions are trustworthy
without anyone self-declaring. That idea is lifted directly from the Beauty
build's distributor analytics, where it solves the same problem.

The console's own rules, each of which is a decision rather than a default:

- **Verdict comes from the latest assessment, not the best.** Someone who held in
  week one and failed in week four is not ready, and a console showing their best
  score would say the opposite.
- **Readiness requires that nothing failed a retest** — at or above 78 *and* no
  failed transfer. Transfer is only *measured* where something broke, so a
  participant who held every element they met is recorded as **not tested**,
  never scored as a pass and never penalised as a failure.
- **Transfer rate has a denominator, and it is not "all assessments".** Sessions
  with nothing to retest are outside the ratio. Counting them as passes would
  inflate the single number the programme is judged on.
- **Verdict is not a band on the score.** A session can sit above another and
  still be priority, because three failure signatures bound and the coached
  behaviour did not hold. The console says so on the page rather than letting a
  supervisor read it as a bug.
- **Every dimension score cites the participant's own sentence**, and a dimension
  the session never exercised says so rather than being filled in with a
  plausible number.

The cohort metrics that matter, on the Nexus side:

- **Resistance rate per tactic** — who held the first time they met it.
- **Transfer rate** — of those who failed and were coached, who held on a
  scenario sharing *nothing* with the one they failed.
- **Emerging** — recently observed *and* beating people more than the corpus
  mean. Either alone is noise.
- **Coverage gaps** — tactics we have intelligence on and cannot yet put anyone
  through. This is the publish gate's Coverage test one level up, and it is the
  number a supervisor cannot get from incident reports.
- **Where reasoning breaks first** — which competency element fails most, which
  tells the network what intelligence to go and find.

Transfer means transfer measured inside one session. It is not evidence of
durable behaviour change and both dashboards say so where the number is.

---

## Why the controlled vocabulary is load-bearing

Four closed axes — typology, channel, persona, product class — and they are not
a tidiness exercise.

AUREN proves transfer only on a retest sharing **nothing** with the scenario the
learner failed. With free-text classification that comparison is a guess. With
closed lists it is a set operation that still holds when the corpus grows from
two challenges to two hundred, contributed by six authorities who have never
met. `surfaceDistance()` returns 0–4; a retest must reach 4.

Adding a term changes what "different enough" means for every retest already in
the field. It is a governance act, not a dropdown an administrator edits.

---

## What this reuses rather than reinvents

| Already built | Used here as |
|---|---|
| `console/schema.ts` — eight-state lifecycle, three-axis eligibility, role-on-object | The shape every derived candidate is born into |
| `console/gate.ts` — ten tests, seven blocking, no waive path | The condition of release for intelligence-derived content |
| `console/release.ts` — content-addressed bundles, append-only ledger | Immutable versioning, the Product Nexus property |
| `auren/objects.ts` — the competency elements | What a tactic is mapped onto |
| Beauty's access-code dimensions | Trustworthy cohort analytics |

The only genuinely new work is the vocabulary, the signal model, the derivation
and the supervisory view. Everything else was already load-bearing.

---

## Not built

| Absent | Why |
|---|---|
| **Consent withdrawal** | A participant consented at enrolment. Withdrawing it should remove them from the console, and there is no mechanism here — the corpus is append-only and the erasure path is a real design problem, not a checkbox. |
| **The object editor** | Still the screen a reviewer lives in, still unbuilt, and now the bottleneck is visible: every gap in a derivation is a field someone has to fill somewhere. |
| **Ingestion from real feeds** | Signals are lodged by hand here. Parsing an authority's alert bulletin is a real integration against a real format, not a guess. |
| **Bilateral sharing enforcement** | `sharesToNetwork` is declared and displayed but nothing enforces it. Cross-border intelligence sharing agreements are legal instruments before they are code. |
| **Persistence and tenancy** | In memory. The corpus is append-only by design and wants a real store. |

---

## Open questions for the programme

1. **Who owns the corpus?** A shared ontology contributed to by many authorities
   is either a commons with a secretariat or a product with a vendor. IOSCO is
   the obvious secretariat. That is a governance decision before it is a schema.
2. **Does a national authority accept a challenge derived from another
   jurisdiction's signal?** The vocabulary makes it technically trivial and
   politically non-trivial.
3. **What is the minimum corpus for a credible pilot?** Coverage of the eight
   seeded typologies needs roughly eight challenges, eight signatures and the
   questions to diagnose them — weeks of expert review, not days.
4. **Who pays?** The authorities contribute the intelligence and receive the
   supervision; the programme operator carries the authoring cost. That is a
   workable model and it is not the only one.
