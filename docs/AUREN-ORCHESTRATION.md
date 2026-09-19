# AUREN — the orchestration layer

> `/prototypes/auren-nexus.html?ws=orch` · `src/lib/orchestrator/`
>
> Everything on those screens is the running engine, not a diagram of it. The
> permission matrix is the table `validateTurn()` reads; the scenario graph is
> the one `step()` walks; the turn results are computed on the page by the same
> code the runtime would call.

---

## The claim this layer has to survive

> **Why not just use an LLM?**

A generic model generates plausible language from broad training data. It does
not know which jurisdiction applies, whether a rule is still in force, who
approved the content, whether a translation has been validated, or whether its
assessment rests on sufficient evidence. It can improvise, it can hallucinate,
and it can change its answer when the question is rephrased.

AUREN surrounds the model with a governed operating system. **The model supplies
language intelligence. This layer supplies authority.** The model is the
replaceable component — swap GPT for Claude for GLM and nothing above changes,
which is the point: a moat built on model access is not a moat.

| Generic LLM | AUREN |
|---|---|
| Broad internet-trained knowledge | Authority-approved objects |
| May be outdated | Effective dates, expiry, supersession |
| Generic across countries | Jurisdiction-specific bundles |
| Prompt-based personality | Governed persona manifests |
| Improvised role-play | Bounded scenario state machines |
| Produces an opinion or a score | Produces evidence-bound determinations |
| Limited auditability | Full source, version and decision trace |
| Open web access | Allow-listed real-time connectors |
| Model-dependent | Model-agnostic orchestration |
| Answers questions | Assesses, coaches, rehearses and retests |

---

## Why not a vector database

The obvious build is: regulator PDFs into a vector store, retrieve chunks, let
the model answer. That is conventional RAG and it fails this product in four
specific ways, none fixable with a better embedding model.

1. **Retrieval returns what is *similar*, not what is *in force*.** A superseded
   clause embeds almost identically to the one that replaced it.
2. **A chunk carries no governance.** No jurisdiction, no effective date, no
   approver — so nothing downstream can tell whether it may be said here, now,
   to this person.
3. **There is no unit to approve.** A reviewer can sign off a document. They
   cannot sign off the 340 chunks it was split into, which is what the model
   actually sees.
4. **Anything in the index reaches the learner.** Poisoned or merely wrong
   content has no gate to fail.

So source material is converted into atomic objects carrying their own
governance, sorted into five libraries.

---

## 1 · Five libraries, not one store

The separation is not tidiness. Each library has a different approver, a
different review cadence, and — the reason they are separate — a different
failure mode.

| | Holds | Fails as |
|---|---|---|
| **A · Authority Knowledge** | Validated facts and guidance from regulators, legislation, registers, official warnings | Stating a rule not in force, or in force elsewhere. The learner acts on it; the institution carries it. |
| **B · Competency and Assessment** | What readiness means: behaviour, eliciting question, qualifying evidence, what constitutes failure, what cannot be determined | Scoring people against a criterion nobody approved. Every determination under it is unsound retroactively — including the passes. |
| **C · Coaching** | Misconception corrections, verification workflows, remediation, escalation, safeguarding | Coaching that is wrong, or right and unusable by the person in front of you. Feels harmless; it is the layer that changes behaviour. |
| **D · Scenario and Adversary** | Scam type, character, ladder, ceiling, evidence presented, prohibited statements, distress exit | A machine applying real pressure to a real person outside what anyone approved. The only library whose failure harms the learner *during* the session. |
| **E · Boundary and Policy** | What AUREN may never do | Not a bad answer — a regulated act. A boundary that does not hold in one deployed language does not hold. |

---

## 2 · The Knowledge Factory

Ten stages between a published source and a sentence a learner hears. Each one
names what it catches that no other stage would; a stage that catches nothing is
ceremony, and ceremony is what makes governance expensive without making it
real.

| | Stage | Catches |
|---|---|---|
| 1 | Source registration | Material of unknown provenance. Everything downstream assumes this held. |
| 2 | Ingestion and classification | Silent upstream edits — **each passage is hashed at retrieval**, and without that hash nothing later can prove the source still says what it said. |
| 3 | Object creation | Nothing, by design. Listed because its output being DRAFT is the property everything rests on. |
| 4 | Automated checks | Mechanical failures, cheaply, before a specialist spends an hour on an object that was never admissible. |
| 5 | Subject-matter review | Content formally correct and substantively useless — the failure automation cannot see. |
| 6 | Compliance approval | Deployment nobody with standing agreed to. The signature a regulator asks for first. |
| 7 | Native-language review | Translation that is linguistically fine and evidentially wrong. Cues and culturally specific scam signals change across languages; a translated rubric silently scores competent people as incompetent. |
| 8 | Adversarial testing | Failures that appear only under attack — the only condition that matters for the boundary library. |
| 9 | Publish gate | Everything above, once more, mechanically and without discretion. No waiver path. |
| 10 | Monitoring and retirement | The slow failure: a corpus right when it shipped and quietly wrong a year later. The only stage with no end. |

The eight-state object lifecycle and the ten-stage factory are the same journey
at two grains — the lifecycle is what the record says, the factory is what a
person is doing about it this week. `stageForStatus()` maps between them, so an
operator can ask "what is blocked and who has it" while the register answers "is
this loadable".

---

## 3 · Generation permissions — the load-bearing file

> The model may select, sequence, explain and deliver.
> **It may not create authority.**

Every product in this space has a sentence like that on a slide. The difference
between a slide and a system is whether it is checkable at runtime, on the bytes
the model returned, before they reach a person.

**Freedom is a property of the mode, not of the product.** Explaining an
approved fact to a confused learner is a different act from deciding whether
they passed, and conflating them is how a system improvises an assessment
criterion. Six modes, each with its own ceiling:

| Mode | May | On violation |
|---|---|---|
| General education | select · sequence · paraphrase · explain | Fall back to the approved wording |
| Coaching | select · sequence · paraphrase · explain | Fall back to the approved wording |
| **Assessment** | select · sequence · classify | Refuse and escalate |
| Bounded role-play | select · sequence · paraphrase · escalate | Drop the turn, hold the rung |
| Regulatory answer | select · sequence | Refuse and escalate |
| High-risk | select — and refuse | Refuse and escalate |

**Paraphrase is refused during assessment, and the refusal is the point.** The
moment an assessor restates what the learner said, the determination is bound to
the restatement rather than to the person, and the evidence chain breaks exactly
where it matters most.

Four acts are refused in *every* mode with no waiver path: composing sentences
not traceable to an approved object, creating or altering an assessment
criterion, writing a new assessment question, and giving a personalised
investment recommendation. They are kept out of the per-mode table entirely
rather than set to "no" six times — a permission that can be granted somewhere
eventually is.

### The turn contract

The orchestrator hands the model a **closed candidate set** and a mode. Note
what is absent: no corpus, no retrieved chunks, no "here are some documents, be
helpful". The model returns a **structured object** — which approved things
happen, plus delivery — never prose that something downstream has to trust.

`validateTurn()` then checks, before a syllable reaches the learner:

| Rule | Catches |
|---|---|
| `closed_set` | The model cited an object it was not given. In a retrieval architecture this is invisible, because everything in the index is fair game. |
| `citation` | A user-facing sentence resting on nothing. |
| `classify` | A determination returned from a coaching turn — how an aside becomes a finding without an assessment ever being run. |
| `span` / `span_fidelity` | A finding bound to a paraphrase rather than to the transcript. Fair summary, fatal anyway. |
| `ladder_step` | A jumped rung. Both rungs approved; the jump is not. A rehearsal that skips the middle is an ambush. |
| `ceiling` | Pressure above what was approved for this cohort. |
| `refusal` | A high-risk turn that answered instead of refusing — it decided the objects were sufficient, which is the decision it was not given. |

The Orchestration workspace runs eight model returns through this live: two
admitted, six refused. **The refusals are the demonstration.** Anyone can show a
system working; what a regulator asks is what happens when the model does
something it should not.

---

## 4 · Persona manifests

The digital human is the easiest thing in the system to change carelessly. Swap
the avatar, warm the tone, rename the coach — none of it looks like a governance
event, all of it changes what a learner experiences.

> Changing the face, the voice or the personality must not change the approved
> knowledge, the competency threshold or the safety boundaries.

Four layers, one of them not configurable:

1. **Core identity** — calm, respectful, non-judgmental, evidence-led,
   protective not paternalistic, never promotional, honest about uncertainty.
   These are constants in code, not manifest fields, **specifically so that no
   manifest can express their absence.**
2. **Communication style** — warm mentor, direct examiner, patient educator,
   youth coach, senior guide, compliance trainer.
3. **Functional role** — teacher, interviewer, coach, assessor, adversary, bank
   representative, concerned friend, recruiter, handover assistant. **The role
   fixes the generation mode**, which is the mechanism that stops a costume
   change becoming a permissions change.
4. **Emotional state** — a closed list with declared triggers. "Responds
   naturally to emotion" is how a coach ends up sounding disappointed in someone
   who has just been defrauded. Distress outranks everything.

A manifest rather than a system prompt, because a prompt is a paragraph somebody
edited: no version, no approver, no diff anyone reviewed, no way to tell
afterwards which wording was live when a session ran. Two sessions on the same
manifest version are comparable; two sessions on "the prompt" are not.

`checkManifest()` refuses any manifest that tries to *loosen* something — a
non-adversarial role carrying a pressure ceiling, an adversary with no handover
condition, an emotional range without `calm`, a manifest missing any of the
always-prohibited items. A configuration layer that can widen a safety boundary
is not a configuration layer; it is an authoring tool with a friendly name.

---

## 5 · Bounded role-play

The adversarial rehearsal is the sharpest differentiator and the largest risk,
and those are the same fact.

> The persona may choose among approved branches. It may not leave the graph.

A scenario is a state machine: nodes carrying a rung, a persuasion technique, the
**authored lines** the persona may speak, the props it may show, and the failure
signature the node is designed to elicit. The safety exit is reachable from every
node and is added by the engine — not something an author can forget to wire.

The interesting code is not `step()` succeeding. It is `step()` refusing:

| Request | Result |
|---|---|
| An approved transition | Allowed |
| A branch not in the graph | **Refused**, rung holds |
| A line the persona wrote itself | **Refused** — it may choose among authored strings, not write the adversary's words |
| Above the manifest's ceiling | **Refused** — the effective ceiling is the lower of scenario and manifest, and neither may be raised at runtime |
| Distress detected | **Safety exit**, regardless of rung or objective |
| The learner held | **Safety exit** — escalating past a successful resistance would teach that resisting does not work |

That last row is a design decision rather than a safety minimum, and it is the
one worth arguing about: it costs a harder test in exchange for not teaching the
opposite of the learning objective.

OWASP's LLM risks — prompt injection, excessive agency, misinformation — are not
addressed here by better prompting. They are addressed by the model not being
the thing that decides where the conversation goes.

---

## 6 · The Real-Time Trust Gateway

The coach needs facts that change daily and therefore cannot live in a bundle
approved quarterly.

> Live information never flows from the internet into the digital human.

Everything arrives through an allow-listed, authenticated connector and is
verified, schema-validated, injection-scanned, freshness-checked and classified
before it can be spoken.

**Fact and signal are not the same sentence.** A register entry is a fact and may
be stated plainly with its publisher named. A scam-intelligence pattern match is
a signal and may only ever be reported as something needing a check — saying the
second in the voice of the first is how an educational system ends up accusing a
real business of fraud.

The injection scanner is a **tripwire, not a filter**: a hit quarantines the
whole field rather than editing it, because deciding what the safe remainder
means is the same judgement the injection was attacking.

When the gateway refuses, the session **narrows rather than guesses**: drop the
live check, keep the rehearsal, and hand the learner the verification step to
perform themselves. The behaviour being taught is the check — having AUREN
perform it was always the lesser half.

---

## 7 · Provenance

Source → interpretation → approved object → conversation → determination, shaped
on **W3C PROV** (Entity, Activity, Agent; `wasDerivedFrom`, `hadPrimarySource`,
`wasAttributedTo`, `wasRevisionOf`, `wasInvalidatedBy`). Using the standard's
vocabulary is not pedantry: an auditor who already reads PROV can read this, and
an export to a regulator's own system becomes a mapping rather than a
translation.

Every link is separately attackable, and a chain missing one link is worth
nothing:

- A citation with no hash cannot prove the source did not silently change.
- A hash with no approver cannot prove anyone read it.
- An approver with no verbatim span cannot prove the finding came from what the
  learner said rather than from what the model expected them to say.

`checkChain()` reports these separately rather than as one boolean, because the
failures are not equivalent: a determination with no span cannot be defended at
all, while one missing a source hash is defensible today and not in a year.

---

## The moat, stated plainly

Access to a frontier model is not defensible — competitors have the same models.
What is defensible is everything in this document plus what it produces:

- the regulator-approved knowledge-object schema
- the competency and scoring framework
- the multilingual evidence rules
- the governed scenario and persona libraries
- the behavioural transcript dataset
- the publish-gate and audit architecture
- the authority, bank and enforcement integrations
- longitudinal evidence that rehearsal improves real-world scam resistance

The last one does not exist yet and is the most valuable. Everything else is an
asset that can be built; that one can only be accumulated, and every month of
operation is a month a competitor cannot buy.

---

## Where it lives

| | |
|---|---|
| `src/lib/orchestrator/factory.ts` | The five libraries, the ten-stage factory, lifecycle mapping |
| `src/lib/orchestrator/permissions.ts` | Acts, modes, the NEVER list, the turn contract, `validateTurn()` |
| `src/lib/orchestrator/persona.ts` | The four layers, the manifest, `checkManifest()` |
| `src/lib/orchestrator/scenario.ts` | The scenario graph, authoring checks, `step()` |
| `src/lib/orchestrator/gateway.ts` | Connector allow-list, injection scanning, `admit()` |
| `src/lib/orchestrator/provenance.ts` | PROV entities and relations, determinations, `checkChain()`, source hashing |
| `src/lib/orchestrator/seed.ts` | Three manifests, one full scenario graph, eight demonstration turns |

## Not built

| Absent | Why |
|---|---|
| **A model actually wired in** | Every turn here is a fixture. The contract is real and the validation runs; what has not been proven is a live model's return rate against it, which is the number that decides whether the fall-back path fires once a day or once a turn. |
| **Live connectors** | The gateway is real; the feeds are fixtures. Each one is an integration against a real authority's real format. |
| **Adversarial test corpus** | Stage 8 is declared and the probes are not written. The boundary library is the one where that gap matters most. |
| **Determination storage** | `Determination` is modelled and nothing persists it. The evidence chain is only as good as the store it survives in. |
