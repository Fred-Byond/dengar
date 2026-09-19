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
| `src/lib/nexus/` | Vocabulary, signal model, derivation, training modules, mapping, corpus, cohort analytics, participants. |
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
MODULE → TRIAGE → MAP ────┘                                               │
   ↑                                                                      │
   └──────────────  what is defeating people, and what we lack  ──────────┘
```

The arrow back is the point. A supervisory dashboard that only reports how
learners did is a report. One that reports **which tactics are beating people
and which of those we cannot yet rehearse against** tells the network what
intelligence it actually needs next. That loop is the asset.

---

## Two intakes, one rule

An authority has two things, and only one of them is intelligence.

> **A signal says what the adversary does. A module says what the authority teaches.**

Securities commissions have had curricula for years — facilitator guides for
investor-education sessions, practitioner briefings for advisers, frontline
procedure for the bank staff who are the last human between a customer and a
transfer. That material is authored, reviewed, versioned and cited. It is the
opposite of a threat report in every respect that matters, and feeding it
through an intake built for threat reports would lose exactly what makes it
valuable.

They derive into different things, and the asymmetry is the argument for
carrying both:

| | Produces | Because |
|---|---|---|
| Threat signal | Challenge + failure signature | It describes an adversary |
| Training module | Competency element + diagnostic question | It describes a competence |

A challenge with no element to score against is theatre. An element with no
challenge to pressure it is a quiz. **Neither intake alone produces a
rehearsal.** That is the clearest statement of why the Nexus is a network
asset rather than a document store.

### What a module can do that a signal cannot

Anchor an element. A competency element is required to cite the published
principle it derives from, and the gate blocks release without one. For a
signal that is the most expensive gap in the set — a legal reviewer has to go
and *find* the principle. A module **is** the authority's published guidance,
so a clause of it arrives as the anchor. The reviewer confirms that the clause
supports the element rather than sourcing one, which is a different order of
work. The console says so in those words: it is the work the upload removed,
not work the upload did.

Where an outcome lands on an element AUREN already carries, the mapping creates
nothing and says so — and that is a result rather than a failure, because a
second authority's published principle now stands behind a competence whose
first anchor came from one jurisdiction.

### What it still cannot do

Supply the persona's words, or set the ladder ceiling. Those are adversarial
strings spoken to a real person under pressure, and no amount of authority
behind a curriculum makes a machine entitled to write them.

It also cannot produce a scenario. **No challenge comes out of a module** — a
handbook describes a competence, not an adversary, and inventing the adversary
is not something a mapping is entitled to do. The gap list says this before a
contributing authority has to ask, because "we uploaded our handbook and got no
scenarios" is a conversation better had in the console than in a meeting.

### What the intake insists on

| Field | Why it blocks |
|---|---|
| **Learning outcomes**, stated as behaviours | The exact analogue of a signal's `defeats`. A module listing *topics covered* cannot be connected to a competency element, so there is nothing to map and nothing to score. Most real training material is written this way, and only the contributing authority can restate its own curriculum. |
| **Clauses** — verbatim text plus citation | The Nexus stores text, never an opaque file. An anchor reading "see the handbook" is not an anchor, and a reviewer confirming a mapping needs the sentence in front of them. |
| **Usage basis** | Own publication, licensed, or restricted internal. Not a tag: getting it wrong means quoting someone else's copyrighted curriculum to a retail investor, or publishing a bank's interception procedure to the people it is designed to detect. A licensed module's expiry becomes the review date of everything mapped from it, because content outliving its licence is a live exposure nobody notices until someone asks where a sentence came from. |
| **Audience** | Material written for frontline staff assumes a job, a screen, a procedure and a colleague. Every learner-facing string derived from it has to be re-authored for someone who has none of those. |

Cue matching is **per language**. A Spanish curriculum read against an English
cue list matches by accident — *transferencia* happens to contain *transfer*
and *registro* does not contain *register* — which produces a mapping that
looks like it worked while silently proposing a duplicate element. The console
names the language it read.

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

### Authoring — derivation and mapping propose, humans dispose

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

Fourteen cohorts across ten jurisdictions and five delivery languages: Spain
(three — a retail programme, a pilot for investors over 65, and a bank),
Japan (two), Hong Kong (two), the UAE, France, Germany, Italy, the UK, Malaysia
and Singapore.

**The console is multi-tenant, and the scope decision is made once.**
`src/lib/tenant/` holds it: `scopeOf(viewer, subject)` returns a *grain* —
`individual`, `aggregate` or `none` — rather than a boolean, because the real
question has no yes/no answer. May an ESMA supervisor see Spanish
participants? They may see how the Spanish cohort is doing and they may not see
who anyone in it is. A boolean forces that to be answered wrongly in one
direction, in a hundred call sites instead of one.

| Viewer | Subject | Grain |
|---|---|---|
| Any tenant | Itself | Individual (except a network body, which has no members) |
| Network body | A tenant in its network jurisdictions | Aggregate |
| Regulator | A bank that reports to it | **Aggregate** — it regulates the market, not the customer relationship |
| Anyone | Anyone else | None |

That third row is the one that matters commercially. A bank will not deploy
into a platform where its supervisor can read its customer list, and "we filter
it in the UI" is not an answer — it is the same query with a cosmetic layer on
top. A network body opening Participants gets a cohort roll-up with the absence
stated, not an empty table: an empty table reads as a bug, and a refusal reads
as a design decision, which is what it is.

Tenant kinds also carry the vocabulary: a bank has **customers**, a ministry
has **residents**, a regulator has **participants**. Printing "participants" at
a bank is a small thing that tells a reviewer the product was built for
somebody else. The consent basis comes from the tenant too, because a bank's
duty of care and a regulator's programme enrolment are different bases and one
sentence for both would misdescribe the stronger of them.

Five languages are deployed — **English, Spanish, Chinese, Arabic, Japanese** —
and the console shows which one each assessment ran in, because an element
passes on satisfaction cues authored in that language. Two people with the same
score were scored by different governed strings, and a table that hides that is
hiding the thing a fidelity reviewer needs.

Where a cohort's own language is not one AUREN deploys — French, German,
Italian — the console says the rehearsal ran in English and says why that
matters. Someone reasoning under pressure in their second language is being
measured on something slightly different, and comparing that score with a
native-language cohort without stating it is a comparison that overclaims.

Delivery languages are also an **entitlement**, not a price. A language a
tenant is not licensed for cannot be selected — for a governance reason, since
an unreviewed variant scoring a real person is the failure the fidelity rule
exists to prevent, and that constraint must never be quietly converted into an
upsell. See [`AUREN-COMMERCIAL.md`](AUREN-COMMERCIAL.md).

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
| **Document ingestion** | Clauses are pasted, not extracted. Parsing a PDF handbook into citable passages is a real integration against real formats, and a mis-extracted clause becomes a wrong anchor on a released object — which is worse than no extraction. |
| **Edition re-anchoring** | A module supersedes its own earlier edition, and objects anchored to the old one keep citing it. The corpus records the supersession; nothing yet walks the released objects and asks a legal reviewer to re-anchor them. |
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
