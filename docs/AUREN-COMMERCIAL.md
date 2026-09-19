# AUREN — the commercial model

> **Not in the demo, and deliberately.** A regulator watching a TechSprint
> demonstration that surfaces a price list learns that they are being sold to.
> The entitlements are enforced in `src/lib/tenant/`; what they cost lives here
> and nowhere in the runtime, so packaging can change without a release.

---

## What is actually being sold

Three things, and confusing them is the fastest way to price this wrongly.

| | What it is | Who pays for it | Why they keep paying |
|---|---|---|---|
| **The engine** | The governed interview loop: understand → diagnose → stress → coach → retest → evidence | Every tenant | It is the product |
| **The corpus** | Released, anchored, gate-passed objects the network has authored | Every tenant except a private deployment | It decays without contribution, so it has to be maintained by somebody |
| **The tenancy** | Their own members, their own modules, their own supervision | Every tenant | Their programme, their record, their auditor |

The **corpus is the moat and the engine is the entry ticket.** Anyone can build
a voice role-play in a quarter. Nobody can assemble eight regulators'
classification of the same eight typologies, with anchored clauses and a
publish gate behind them, in a quarter — and the thing that makes it hard is
the thing that makes it defensible. Pricing that treats the corpus as a
free accompaniment to the software is pricing away the asset.

---

## The metering unit, and why it is CCU

A rehearsal holds a speech-recognition stream, a synthesis pipeline and a
session state machine open for five to eight minutes, whether or not the
learner is talking. So the cost that matters is **how many run at the same
instant**, not how many ran this month.

Two programmes with identical annual volume are an order of magnitude apart:

| Programme | Annual sessions | Peak concurrent | What it costs to serve |
|---|---|---|---|
| Ministry campaign, publication-day spike | 200,000 | ~900 | Provision for 900 |
| Bank, advised sessions in branch diaries | 200,000 | ~220 | Provision for 220 |

A monthly-active-user figure cannot tell these apart, and a per-session price
charges the first one the same as the second while the first one is the one
that falls over. `src/lib/tenant/ccu.ts` models all three demand shapes —
campaign, advised, steady — and reports the peak beside the p95, because
provisioning to the peak means paying all year for the worst minute of a launch
day and provisioning to the mean means failing every campaign.

**At the ceiling the honest behaviour is a queue with a stated wait, never a
degraded session.** A rehearsal that drops its speech pipeline halfway through
produces a record nobody should rely on, and the record is the product.

### Seats and CCU do different jobs

- **Seats** = enrolled members a tenant may hold. The unit of a *programme*.
  Uncapped for a citizen population, where a seat count would be a fiction.
- **CCU** = rehearsals at one instant. The unit of *capacity*.

A bank with 60,000 customers and 220 CCU is a normal shape. A ministry with
uncapped residents and 900 CCU is a normal shape. A tenant asking for 60,000
seats and 50 CCU is telling you their programme has no campaign behind it, and
that is worth knowing before the renewal rather than after it.

---

## The four buyers

They are not one market with four logos. They buy for different reasons, on
different budgets, with different procurement.

### Securities commissions and regulators

**Why they buy.** Investor education is a statutory obligation they currently
discharge with leaflets and cannot measure. AUREN gives them the one number
their annual report has never had: not how many people were reached, but how
many held under pressure — and which tactics beat them.

**What they will not accept.** Content they did not approve reaching their
market. Every governance property in the build exists because of this
sentence, and none of it is optional to get the sale.

**Shape.** Annual licence, seats to the programme size, CCU to the campaign.
Long cycle, budget-year aligned, reference-driven — the second regulator is
far easier than the first, and the first is worth discounting heavily for.

### Banks and brokers

**Why they buy.** Two reasons, and the second is the real one. Publicly, it is
customer protection. Commercially, it is that **the bank is the one who
refunds**. Authorised push-payment reimbursement moved the loss from the
customer to the institution, and a bank can now put a number on a scam it did
not stop. That makes this a loss-prevention line item rather than a marketing
one, and loss-prevention budgets are larger and faster.

A second line follows: **suitability evidence**. A bank that can show a
customer rehearsed the exact pressure tactic that later hit them, and held, is
in a materially different position with an ombudsman than one that sent a
warning email.

**What they will not accept.** Another bank seeing their customers. This is
why `scopeOf` returns a grain and not a boolean, and why a supervising
regulator counts a bank's cohort without being able to open a single customer
in it.

**Shape.** Per-seat with a CCU band, annual, renewable. Often starts as a
private deployment — own modules only — which is the weakest configuration
and the one procurement asks for. Sell the network corpus at renewal, when
their own coverage gap is visible in their own console.

### Governments and ministries

**Why they buy.** Population-scale campaigns with a measurable outcome, in a
policy area where the alternative is an awareness week nobody can evaluate.

**What they will not accept.** Per-head pricing at population scale, and any
suggestion that citizen records leave the jurisdiction.

**Shape.** Fixed-fee programme with a CCU ceiling sized to the campaign, plus
a data-residency commitment. Seats uncapped. Procurement is slow, the contract
is large, and the reference value is disproportionate.

### Enterprises

**Why they buy.** Staff who are targeted because of where they work — finance
teams, family offices, anyone with payment authority. It is the same engine
with `AUD-BANK-STAFF` material instead of retail material.

**Shape.** Smallest deal, shortest cycle, least strategic. Useful for revenue
between regulator cycles; dangerous if it becomes the roadmap, because
enterprise buyers do not care about the corpus and will happily pay for the
engine alone — which trains the company to sell the commodity half.

---

## Pricing shape

Three levers, and they should stay three. Every additional lever is a
negotiation the sales cycle has to survive.

1. **Platform fee** — the tenancy: their console, their members, their
   supervision. Scales with buyer kind, not with usage.
2. **CCU band** — capacity. The only usage-linked lever, because it is the
   only one with a real marginal cost behind it.
3. **Corpus access** — `own` / `own_plus_released` / `network_full`. Priced
   as a subscription to a maintained asset, because that is what it is.

**Language is not a lever.** Charging per language sounds obvious and is a
trap: it tells a buyer that the Spanish variant is an upsell rather than a
governed object that passed native review, and it prices against exactly the
reach the product is for. Languages are licensed per tenant (`Entitlement.languages`)
for a governance reason — an unreviewed variant must not score a real person —
and that constraint should never be quietly converted into a price.

**Certification is the consumer-side line and it is not the business.** A
verified Investor Readiness Record has real value to a learner, and building a
company on retail micro-payments for it would put AUREN into consumer
marketing against a CAC it cannot win. Keep it as an option that raises the
perceived value of the record; do not model revenue on it.

---

## Who pays for the corpus

The genuinely hard question, and the one that decides whether this is a
product or a commons.

The authorities contribute the intelligence and receive the supervision. The
programme operator carries the authoring cost — and authoring is the expensive
part, because every gap in a derivation is a named human in a declared role.
Three workable answers:

| Model | How it works | Risk |
|---|---|---|
| **Vendor-maintained** | The operator employs the reviewers and sells corpus access. Cleanest to run. | The corpus becomes a vendor asset, and the authorities who contributed to it eventually notice. |
| **Secretariat commons** | IOSCO or an equivalent holds the corpus; the operator is a supplier of the engine. | Slowest to move, and the operator loses the moat it built. |
| **Contribute-to-access** | Network-full access requires releasing objects back. Contribution is priced in kind. | Only works once enough contributors exist to make access worth earning. |

The third is the right destination and the first is the only viable start.
Say so in the paper rather than pretending the first is the destination —
regulators can tell, and the ones who can tell are the ones worth having.

---

## What would make this fail commercially

Worth writing down while it is still cheap to change.

- **Selling the engine and giving away the corpus.** The engine is
  reproducible; a competitor with a voice API and a quarter can match the demo.
  The corpus is not, and pricing that treats it as an accompaniment gives away
  the only defensible thing.
- **Letting a private deployment become the default.** Every bank asks for
  `own` first. A network where most tenants rehearse only against what they
  already knew is a network with no network effect, and the product becomes
  eight disconnected training tools that happen to share a renderer.
- **Per-session pricing.** It charges the campaign the same as the plateau,
  undercharges the load that actually costs money, and gives the operator an
  incentive to want more sessions rather than better ones.
- **Certification revenue in the model.** It moves the company into consumer
  acquisition, which is a different business with a worse CAC and no moat.
- **Any commercial constraint that changes what a learner is told.** The moment
  a licence tier changes the content of a governed object, Rule 2 is gone and
  with it every regulatory claim the product makes. Entitlements may restrict
  *whether* content loads; they may never alter *what it says*.

---

## Where this is implemented

| | |
|---|---|
| `src/lib/tenant/tenant.ts` | Tenant kinds, entitlements, the scope rule, entitlement checks |
| `src/lib/tenant/roster.ts` | The seeded tenants — regulators, banks, a ministry, two network bodies |
| `src/lib/tenant/ccu.ts` | Concurrency profiles, peak/p95, capacity readings |
| `docs/AUREN-NEXUS.md` | The knowledge layer the corpus lever sells access to |
| `docs/AUREN-ORCHESTRATION.md` | The governed layer around the model — the reason the corpus is worth access to |

Nothing in this document is enforced in code, and nothing in those files
mentions money. That separation is the point.
