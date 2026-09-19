# AUREN — the economic impact framework

> `src/lib/impact/` · Supervision Console → **Impact**
>
> The business case is not "we improve financial literacy". It is: **AUREN
> reduces the probability that a person transfers money, shares credentials or
> invests through a fraudulent platform when placed under real-world pressure**
> — and that is measurable, in units a loss book is already kept in.

---

## The baselines, and the two blanks

| Market | Annual loss | Grade | 1% of it |
|---|---|---|---|
| Malaysia | RM2.8bn (2025) | **published** — BNM Annual Report | RM28m |
| Global | US$442bn (2024) | **survey estimate** — GASA, ≈46,000 adults / 42 markets | US$4.42bn |
| UAE | — | **none defensible** | — |
| Spain | — | **none defensible** | — |

The blanks are the point, and `annualLoss: null` is a first-class state that
propagates: `computeImpact()` returns a refusal with the reason rather than a
figure. In a deck a blank cell next to Spain looks like a gap in the work and a
plausible number looks like diligence. It is the reverse — the blank *is* the
diligence, and the first regulator who asks where the number came from ends the
conversation if the answer is "we scaled it from elsewhere".

For the UAE, prevalence is well evidenced (≈7 in 10 encountered a scam, 1 in 3
of those lost money, 67% of victims hit by investment scams, 2.8 scams per
victim per year) and none of it yields a monetary aggregate. For Spain, incident
counts and CNMV warning lists are published — **incidents are not losses, and a
warning list is not a loss ledger.** Both markets carry an `establishWith` list
naming what a real baseline would have to come from.

The three grades are not interchangeable. A survey extrapolation carries market
context well and is not the denominator of a contractual savings claim.

---

## The model

```
Annual avoided loss = L × A × C × R × F
```

Reproduced exactly, and with two corrections.

### 1 · A point estimate implies precision the inputs do not have

Four shares multiplied together compound their uncertainty. At ±30% per input —
generous, early in a deployment — the product is uncertain by roughly a factor
of two each way. "RM11.2m" is not conservative, it is false precision, and it is
the first number a sceptical CFO attacks. So the model returns a **range** and
labels the midpoint as one.

| Malaysia scenario | Modelled | Range |
|---|---|---|
| Conservative pilot | RM840k | RM202k – RM2.4m |
| National institutional rollout | RM11.2m | RM2.7m – RM32.0m |
| Scaled national programme | RM94.5m | RM22.7m – RM269.9m |

### 2 · F double-discounts once R comes from a control group

Attribution exists because some improvement would have happened anyway —
campaigns, coverage, the institution's own warnings, people simply getting more
careful. **That is exactly what a control arm measures and removes.**

| How R was measured | F | Why |
|---|---|---|
| Assumed | 0.4 | F is doing the work of an error bar. A planning figure that must not leave the room described as a result. |
| Pre/post, no control | 0.5 | Contains everything else that was happening. Half is the conventional haircut and it is a guess about the counterfactual's size. |
| **Randomised control arm** | **0.9** | The counterfactual is already netted out. A further 50% discounts it twice. The residual 10% covers spillover and the simulated-to-real gap. |
| Control arm + linked transactions | 1.0 | Counterfactual measured, outcome real. Discounting here discards evidence that was expensive to obtain. |

This is why the scaled scenario comes out at RM94.5m rather than RM63m: the
framework applies F=60% to a controlled measurement. **Under-claiming is not
free.** A programme that reports half its real effect gets funded at half its
real value, and the next renewal is argued against the smaller number.

### The institutional case

A bank with RM96m in customer losses, 30% addressable, 50% reached, 10%
reduction, pre/post evidence: **RM720k direct, range RM173k – RM2.1m.** On
controlled evidence the same inputs give **RM1.3m**, because F moves from 0.5 to
0.9.

Direct avoided loss is the first layer and usually the smallest. The others —
reimbursement exposure, investigation and contact-centre cost, complaints and
ombudsman workload, demonstrable preventive action — are why a fraud-prevention
budget signs rather than a marketing one. Each carries how it is evidenced from
the institution's own systems, because a benefit that cannot be measured there
will be argued away at renewal by somebody who was not in the original room.

**Reimbursement is the cleanest line in the case**, because it is already
denominated in the institution's own money. Social value is deliberately left
unmonetised: it belongs in a government procurement case and out of an ROI
ratio, since a number invented there contaminates the ones that were real.

---

## An improvement is never a bare percentage

> 20% → 19% is **one percentage point** and a **five percent relative** fall.
> 20% → 19.8% is 0.2 points and one percent relative.

They differ by a factor of five, get written identically, and the ambiguity
always resolves in the vendor's favour — which is why a procurement officer who
has been burned once discounts both readings.

So `Improvement` is a type constructed from a before and an after, and the only
renderer is `describe()`, which always states both plus the count per 10,000 and
the n. **Nothing in the codebase can emit "a 5% improvement" without saying of
what.** It is a small idea and the one most likely to survive contact with a
contract, because it is the sentence a dispute is eventually about.

### The trial has to be much larger than it looks

`sampleSizePerArm()`, at 80% power and α=0.05:

| Effect | Per arm |
|---|---|
| 20% → 19% (1 point, 5% relative) | **≈ 24,600** |
| 20% → 17% (3 points, 15% relative) | ≈ 2,600 |
| 20% → 15% (5 points, 25% relative) | ≈ 900 |
| 20% → 10% (10 points, 50% relative) | ≈ 200 |

Read the other way: a 400-per-arm pilot can only detect about **7 percentage
points**; 1,200 per arm detects about 4.4.

This is the calculation to run *before* designing the trial rather than after it
disappoints. A pilot powered for a one-point hypothesis returns "no significant
difference" whatever happens — which reads as a failed product and is actually a
failed design. AUREN's premise is behaviour change under pressure, not a nudge,
so it should be tested against a hypothesis worth detecting.

---

## Measure behaviour, not completion

Seven levels, each strictly weaker evidence than the one below it:

| | Level | Why it is not enough on its own |
|---|---|---|
| 1 | Reach | Counts exposure. The number most programmes report and the weakest available. |
| 2 | Knowledge | Everyone knows the rules. Knowing them is uncorrelated with following them when someone is pushing — the entire premise of the product. |
| 3 | Demonstrated behaviour | One scenario. A person can learn the scenario rather than the behaviour, and from the inside the two look identical. |
| 4 | Transfer | Within one session. Shows the coaching landed; says nothing about next week. |
| 5 | Persistence | Still a simulation. Holding under rehearsed pressure is not holding under a real approach with your own money. |
| 6 | Real-world action | Needs institutional telemetry — the first level requiring a partner rather than a product. |
| 7 | Financial outcome | The only level that closes the business case, and the slowest to reach. |

**Most programmes measure level 1, report it in the language of level 7, and are
believed until somebody checks.**

### The headline KPI

**Verified Protective Action Rate** — the share who *independently* perform the
*required* protective action under *unfamiliar* pressure. Each of those three
words excludes a way of inflating it: not after a prompt; the specific action the
element names rather than a general show of caution; and a scenario with no
surface in common with the one they were coached on, because the same scenario
measures recall.

Reported per 10,000 exposed, which is the unit a loss book is kept in and
survives comparison across cohorts of different sizes.

### One measure that must not be omitted

**Confidence calibration.** An intervention can raise confidence without raising
competence, and a confident victim transfers faster than an uncertain one. A
programme that moves confidence and not behaviour has produced harm — and it
scores as a success on every other measure in the list.

---

## The claim ladder

| Rung | Claim | Needs |
|---|---|---|
| 1 | N people completed a governed rehearsal with an evidence-bound record | Sessions, records |
| 2 | Reduced unsafe decisions in unfamiliar simulated scams by X% vs conventional education | Randomised control + conventional arm, surface-distance-4 retest, both readings stated, a powered sample |
| 3 | The reduction was sustained at 90 days | Rung 2 + retest at 30/90 days + attrition reported |
| 4 | Rehearsed customers performed more protective actions in real conditions | Institutional telemetry linked to cohort, consent for the linkage, control cohort in the same telemetry |
| 5 | **Reduced actual scam-loss events by X% and avoided Y** | Linked transactions over ≥4 quarters, matched-exposure control, categories agreed *before* the trial, independent verification |

`claimPermitted()` refuses a claim above the evidence and names the specific
missing requirement — because "we need more data" gets waved through and "you do
not have linked transaction outcomes" does not.

**Saying rung 5 while holding rung 2 evidence is the most common overstatement
in this sector, and the one a regulator's economist finds.**

### The trial

Three arms, and the second one is the one people try to drop:

| Arm | Controls for |
|---|---|
| Control — normal scam information | Everything happening anyway. This arm is what lets F rise towards 1. |
| **Conventional education — videos and quizzes** | Attention and time-on-task. Without it, any effect is arguably just the hour spent thinking about scams — and that is the objection that matters, because it is the cheaper alternative. |
| AUREN | Nothing. This is the treatment. |

Measured immediately, at 30 days and at 90 days.

---

## What the console shows

The Impact view computes from **this programme's own records**, not from a
spreadsheet: VPAR from assessments where a failure was coached and a
surface-distant retest ran; the unsafe-action rate against the untaught baseline
cohort; the value chain with the reached levels marked; the claim ladder with
what is and is not supported; and the avoided-loss model — or, for the UAE and
Spain, the refusal and the reason.

It also states the thing that is easy to leave out: the cohort comparison is
**between cohorts, not between randomised arms**. The baseline panel differs
from the programme in more ways than the intervention — who enrolled, why, and
when. So the p-value describes the sample and not AUREN's effect, and the figure
it feeds cannot support a causal claim.

Pricing is **not** in the console — see [`AUREN-COMMERCIAL.md`](AUREN-COMMERCIAL.md).
Avoided loss is; a regulator asking "what did this programme save" is asking an
operational question, not reading a price list.

---

## Country sequence

**Malaysia first**, and the reason is evidential rather than commercial: it is
the only market in the set with a published loss aggregate, PDRM typologies, SC
content validation, and banks able to supply payment and victimisation data. A
proof needs a denominator, and Malaysia is where one exists.

The national line should be stated carefully: *every 1% of Malaysia's reported
scam losses is RM28 million protected — AUREN will begin by proving its
contribution within investment and social-engineering scams rather than claiming
the whole national pool.*

**Spain and the UAE start from a partner's loss book**, not a national
extrapolation — which is the same conclusion the baseline table reaches from the
other direction.

---

## The target

Every RM1 spent produces at least **RM3–5** in measurable economic value,
independently verified. Once demonstrated, AUREN stops being an education
product and becomes fraud-loss-prevention infrastructure — which is a different
budget, a different buyer and a different multiple.

## Not built

| Absent | Why |
|---|---|
| **Any real outcome data** | Every figure here is modelled or simulated. Nobody's money has been at stake in any rehearsal the system has run. |
| **Institutional telemetry linkage** | Rungs 4 and 5 need a partner's transaction data and consent covering the linkage. Neither exists yet, and they are the gate on the only claim that closes the case. |
| **The trial itself** | Designed here, not run. The power calculation says what size it has to be, which is the most useful thing this file currently produces. |
| **Longitudinal evidence** | The most valuable asset on the moat list and the only one that cannot be bought or built — only accumulated. Every month of unmeasured operation is a month of it not accruing. |
