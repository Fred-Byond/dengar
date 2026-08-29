# Knowledge Authority — the governance console

> Reconciles three specifications that independently arrived at the same
> architecture: **AUREN** Paper III v1.1 / IV v1.0, **Project Pioneer** Paper
> III v1.0 / IV v1.0 (KB Spec), and **Beauty Intelligence**.

**Two builds, one engine.**

| | |
|---|---|
| `/console` | The React build inside the app. |
| `/prototypes/knowledge-authority.html` | Self-contained, opens from a file, nothing to run. |

The prototype does **not** get its own copy of the schema, the libraries or the
gate. `npm run console` compiles `src/lib/console/*` and `src/lib/auren/objects.ts`
and injects them between markers in the HTML, so the two cannot disagree about
whether a bundle is releasable. Both produce the same bundle hash from the same
library — `bundle-auren-e6362ee3` — which is the cheapest possible proof they
have not drifted.

Source: `src/lib/console/`, `src/components/console/`, `scripts/build-console-prototype.mjs`.

---

## What is realistic, and what is not

**Realistic, and built here.** An internal administrator signs in, chooses a
vertical, works a versioned object library through the governance chain, runs
the publish gate, reads the release report, and — only if every hard gate
passes — signs a release into an append-only ledger.

**Not realistic, and deliberately absent.** An administrator cannot "build a
vertical" in this console. A vertical is an authority-anchored ontology with
legal review behind it: Pioneer's own checklist puts every offence category
through legal-workstream review and AGC status tracking. That is expert months
of work, and no dashboard shortens it. The console makes that work **auditable
and repeatable** — it does not make it cheap, and any pitch that implies
otherwise will not survive the first delivery.

There is also no "train" step, anywhere, by design. All three papers forbid it
in the same words: the model does not author content at runtime. Ingestion
produces DRAFT objects for a human to anchor and approve; nothing an
administrator uploads ever changes runtime behaviour directly.

---

## The admin journey

```
sign in (name + role)
  → workspace switch  ── Governance │ Operations
  → choose vertical   ── AUREN │ Pioneer │ Beauty
  → object library    ── registry, status, anchors, eligibility
  → object detail     ── advance through the chain, or retire
  → publish gate      ── ten tests, seven blocking
  → release report    ── the screen that closes a compliance-led buyer
  → release           ── enabled only when every hard gate passes
  → release ledger    ── who signed it, when, into which markets
```

Two things the journey enforces rather than suggests:

- **Release is disabled while any hard gate fails.** There is no waive path,
  for BYOND either. Beauty Intelligence makes that a contractual commitment on
  four of its gates; the platform extends it to all six.
- **Advancing an object invalidates the report.** A verdict that describes a
  library which no longer exists is worse than no verdict, so it is discarded
  rather than shown stale.

---

## Four conflicts, resolved in the schema

The papers agree on almost everything. These four are where they genuinely
disagree, and each is a fork if decided wrongly — so each is settled in
`schema.ts` rather than in a convention document.

| # | Conflict | Resolution |
|---|---|---|
| **1** | AUREN Rule 3 says *mode* is first-class. Pioneer Rule 3 says *language*. Beauty needs *market scope*. | One `eligibility` block carrying all three axes. The resolver evaluates the conjunction; an unused axis is left unconstrained. |
| **2** | Pioneer: *"Named individuals never appear in objects."* Beauty: *"the named person who signed the release."* | Role on the **object**; identity on the **release event**, in a separate append-only ledger. Pioneer exports the register, Beauty exports the ledger, neither compromises. |
| **3** | Pioneer prohibits `leading_risk: high` outright. AUREN's escalation ladder is the product. Beauty runs personas at staff only. | The vertical pack declares `doctrine`. A challenge object in a neutral vertical is a hard gate failure, and the console does not render the form there. |
| **4** | AUREN assesses the person and tells them; Pioneer assesses nothing about the declarant; Beauty assesses the advisor, never the customer. | Assessment binds to the **surface**, not the vertical. Beauty proves it: one vertical, two surfaces, assessment on one. |

---

## The publish gate

Generalised from Beauty Intelligence §3.3 (eight tests, four hard) across all
three papers, plus the Candidate-set test the first run proved was missing:
**ten tests, seven blocking**. Implemented in `gate.ts` and run
against real libraries, not fixtures.

| Test | Blocking | Asserts |
|---|---|---|
| Candidate set | ● | At least one object has reached EFFECTIVE |
| Coverage | ● | Every mandatory, capturable element has a question that can elicit it |
| Anchor integrity | ● | Every element binds to a clause in the vertical's anchor authority |
| Prohibited formulation | ● | No unrationalised leading risk, no ladder above ceiling, no forbidden phrasing in any language |
| Scope integrity | ● | No object reachable outside its declared mode, market or doctrine |
| Boundary refusal | ● | The hard boundary is declared and proven in **every** deployed language |
| Version consistency | ● | Every reference resolves to an object present in the same bundle |
| Adversarial probe | ○ | The released set holds under hostile and leading questioning |
| Translation fidelity | ○ | Every deployable variant has passed native review |
| Traceability | ○ | Every determination resolves to an object, version and verbatim span |

### A green tick on an empty set is a lie

The **Candidate set** test exists because the first implementation reported
nine passing gates against Pioneer and Beauty — both of which had *zero*
EFFECTIVE objects. Every test passed because every test had nothing to check.

An unassessed test now renders as `n/a`, never as a pass, and an empty bundle
is a hard failure in its own right. This is the exact form of false assurance
the whole apparatus exists to prevent, and it appeared inside the apparatus.

---

## What the gate found in the shipped AUREN library

Run it and the first thing you see is a real defect in a library that is
already in a demo:

> **Coverage — blocked.** Four mandatory elements have no question that can
> elicit them: `E-URG-01` Resists urgency, `E-AUTH-01` Questions authority
> claims, `E-SOC-01` Discounts social proof, `E-PAY-01` Payment-destination
> scrutiny. They can never be resolved in a session.

That is true. `objects.ts` defines eight elements and four questions. The four
un-questioned elements are scored on the Evidential Scorecard as
not-testable-this-session, which is honest — but they were never authored, and
nothing before this gate said so out loud.

The advisory findings are equally real: five of eight mandatory elements are
never tested under pressure, and every non-English variant is at fidelity
`pending`.

**Clearing it demonstrates the point better than passing would have.** Retiring
the four elements immediately fails **Version consistency**, because their
challenges and signatures now dangle. The reviewer has to retire the dependents
too — nine objects in all — and only then does the bundle release. A cascade
made visible is the console working.

---

## Backend shape

The decision that lets one platform serve a police force and a beauty brand:
**split the planes**.

| Knowledge plane | Data plane |
|---|---|
| Object registry, release bundles, gate runner, release ledger | Session runtime, record store, evidence binder, analytics |
| Versioned, exportable, **no personal data at all** | Tenant-isolated, jurisdiction-resident, never linked across tenants |
| Centrally built; ships to a sovereign environment as a signed bundle | Deployed per tenant and per jurisdiction |

What people fear in "one dashboard for police and beauty" is a shared data
estate. What is actually shared is a bundle of versioned text objects — the
same kind of artefact as a standard form or an SOP, which is Pioneer's point:
*"Approving governed content is a familiar institutional act."*

**One rule for engineering:** the eligibility resolver must be a library the
runtime links, not a service it calls. A gate reachable over the network is a
gate that gets bypassed under deadline pressure, and all three papers stake
their regulatory position on it holding.

---

## Files

```
src/lib/console/
  schema.ts      Unified object model. The four conflict resolutions live here.
  verticals.ts   The three packs: doctrine, modes, languages, markets, surfaces.
  library.ts     Seeded libraries. AUREN is migrated from the RUNNING library.
  gate.ts        Ten tests, seven blocking. No waive path.
  release.ts     Content-addressed bundles; the ledger that carries names.

src/components/console/
  ConsoleApp.tsx      Sign-in, workspace switch, library, gate, ledger.
  console.module.css  Deliberately not any vertical's brand.
```

---

## Not built, and why

| Absent | Why |
|---|---|
| **Ingestion / extraction** | The one part with no specification in any of the three papers. Beauty says Knowledge Authority "reads from the PIM" without saying how a claim is drafted from a product record. Designing it against a real source system is the next piece of work, not a guess. |
| **Object editor** | The console advances and retires; it does not yet author. Nobody has designed the screen a legal reviewer sits in front of for six weeks, and that screen is the actual product. |
| **Tenancy and identity** | No paper models cross-vertical tenancy or the sovereign deployment fork, because none was written expecting a sibling. Genuinely new work. |
| **Persistence** | In-memory. The registry is append-only by design and wants a real store; the shape is settled, the storage is not. |
