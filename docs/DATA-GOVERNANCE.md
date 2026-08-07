# Data Governance, Sovereignty & Security — Position Paper

**DENGAR.ai · Citizen Listening Platform**
Prepared by BYOND Asia · for Ministry / PMO security, legal and technical review
Status: **Draft for Government review** — items marked ⚖️ require sign-off by Government legal

> This paper answers the three questions a government will actually ask:
> **Where does the data live? Who can read it? What happens when a citizen
> alleges corruption?**
>
> The enforceable half of this paper is code, not prose:
> [`src/lib/governance`](../src/lib/governance) — classification, access
> policy, and the restricted-disclosure lifecycle.

---

## 1. The real risk, named honestly

The platform's security problem is **not** primarily an external attacker. It is:

| Risk | Why it is the real one |
|---|---|
| **Insider misuse** | An official searching what a named critic, journalist or rival said about the government. |
| **Political weaponisation** | The perception — or reality — that the office holds a sentiment file on citizens. |
| **Vendor over-reach** | A private company (us) able to read a nation's candid political speech. |
| **Corruption-report mishandling** | Allegations accumulating in a political office's analytics system with no whistleblower protection for the discloser. |

An architecture that only answers "is it encrypted?" fails all four. So the
design goal is **provable non-access**: almost nobody — *including BYOND* —
can read raw citizen content, and every exception leaves an immutable trace.

**The claim we can defend in a review:** the platform is built so that reading
what an individual citizen said is *hard, rare, attributed, and provable* —
and, for the vendor, cryptographically impossible.

---

## 2. Data classification — nothing is stored untiered

Five tiers, each with its own store, key, retention and egress rule. Full
definitions: [`classification.ts`](../src/lib/governance/classification.ts).

| Tier | What | Store | Leaves Malaysia? | Retention |
|---|---|---|---|---|
| **T0** Public aggregate | State sentiment, topic volumes, language mix | Aggregate | Yes | Indefinite |
| **T1** De-identified insight | CVIF Session Insight Record, pseudonymous token, district | Insight | **No** | 24 months → T0 |
| **T2** Citizen identity | Name, hashed mobile, email, consent record | **Identity vault** | **No** | 12 months → deleted |
| **T3** Raw session content | Transcript, audio, verbatim quotes | **Content vault** | **No** | Transcripts 12mo · audio 90 days ⚖️ |
| **T4** Restricted disclosure | Corruption allegations, named third parties, safety-critical | **Sealed** | **No** | Until referral acknowledged → purged |

**The structural move:** the dashboard, Session Explorer and weekly briefing
all run on **T1 only**. Identity (T2) and content (T3) live in *physically
separate stores with separate keys*, joined only by a pseudonymous session
token. Re-linking a token to a person requires break-glass with two-person
authorisation. A compromise of the analytics store therefore yields
**no names**.

---

## 3. Where the data lives — residency & sovereignty

### 3.1 Hosting

All tiers are stored and processed **inside Malaysia**. Three viable options,
in our order of recommendation:

| Option | Description | Trade-off |
|---|---|---|
| **A. Government cloud / public-sector data centre** *(recommended if the PMO wants maximum sovereignty)* | Deployment inside the Government's own cloud or public-sector data-centre environment, under the public-sector cloud framework | Strongest sovereignty and simplest political defence; slower provisioning, more constrained tooling |
| **B. Malaysia-region hyperscaler under the public-sector cloud framework** | Major CSPs now operate in-country regions (Kuala Lumpur / Malaysia West). Deploy pinned to that region, with data-residency controls enforced | Fastest to a pilot with strong managed security; requires contractual residency guarantees and CSP already appointed under the framework |
| **C. Sovereign / local operator cloud** | A Malaysian-operated cloud with local jurisdiction over the operating entity | Local legal control; verify certification level and resilience |

**Non-negotiables in all three:** region pinning with no cross-region
replication; encryption at rest and in transit (TLS 1.3); backups held in the
same jurisdiction; no data in any test/staging environment that isn't itself
in-country and de-identified.

⚖️ **Decision needed:** which option. It materially affects timeline — Option A
typically adds provisioning lead time, Option B is the fastest path to pilot.

### 3.2 Key custody — the strongest single guarantee

> **The Government holds the encryption keys. BYOND does not.**

T2, T3 and T4 are encrypted with keys held in a **Government-controlled key
management service** (BYOK/HYOK). The platform requests decryption per
operation, and the Government can **revoke access unilaterally** — including
revoking BYOND entirely — without our cooperation.

This converts "the vendor promises not to look" into "the vendor **cannot**
look." It is the answer to the sharpest question in any procurement review,
and it is also the answer to *"what if BYOND is acquired, breached or in
dispute with us?"*

### 3.3 The sovereignty weak point we are flagging ourselves

**Two components process citizen speech and are the genuine cross-border
risk:**

1. **The digital-human / avatar service** — speech-to-text and the avatar
   stream may run offshore.
2. **The AI scoring step (CVIF)** — if transcripts are sent to a foreign
   large-language-model API, that is a cross-border transfer of T3 content.

We will not pretend this is solved by hosting the database in Malaysia. Three
options, and our recommendation:

| Option | Sovereignty | Quality | Effort |
|---|---|---|---|
| **1. In-country model hosting** — run the scoring model inside the Malaysian environment *(recommended for production)* | Full — no content egress | Good, tunable | Highest |
| **2. De-identification gateway** — strip names, contacts and identifying specifics before any external call; only a scrubbed extract leaves | Partial — scrubbed text still leaves | High | Medium |
| **3. In-country commercial AI region with contractual no-training, no-retention terms** | Contractual, not physical | Highest | Low |

**Recommendation:** Option 2 for the pilot (fastest to quality, with egress
controlled and logged), **Option 1 before national rollout**. State this
plainly to the Government rather than letting it be discovered in review —
volunteering it is what makes the rest of the paper credible.

The egress guard is already expressed in code: `refuseCrossBorder(tier)` in
[`classification.ts`](../src/lib/governance/classification.ts) blocks
T1–T4 from leaving jurisdiction, so this is a build-time constraint rather
than a policy memo.

---

## 4. Who can access it

Full matrix: [`access.ts`](../src/lib/governance/access.ts). Summary:

| Role | Baseline read | Break-glass | Never |
|---|---|---|---|
| **Prime Minister / Minister** | T0, T1 | — | T2, T3, T4 |
| **PMO Delivery Unit / Sec-Gen office** | T0, T1 | T3 | T2, T4 |
| **Trained analyst** | T0, T1 | T3 | T2, T4 |
| **Protected-disclosure officer** (named) | T0 | T3, T4 | T2 |
| **Service desk** (booking/notify) | T2 | — | T1, T3, T4 |
| **BYOND platform ops** | T0 | — | **T1, T2, T3, T4** |
| **Independent auditor** | audit log only | — | all data |
| **Citizen (own record)** | own T2, T3 | — | others |

Four points worth making explicitly to the Government:

1. **The leader has no route to raw content — by design.** This protects the
   office: the Prime Minister cannot be accused of reading who said what,
   because the system gives no such capability.
2. **Identity and content are never in one role.** The service desk knows who
   booked but not what they said; analysts know what was said but not who.
3. **Break-glass is not a login.** It requires a stated purpose bound to a
   *single* session reference, a **second approver**, an automatic expiry, and
   an audit entry naming the *individual* — never a shared account, never "all
   sessions."
4. **The dashboard's role toggle is presentation only.** Authorisation is
   server-side. The demo's Minister ↔ Delivery-Unit switch must never be
   mistaken for the security boundary — this is stated in the handoff so no
   engineer ships it as one.

### 4.1 Audit — tamper-evident by construction

Every read, unmask, export, config change and deletion writes an
**append-only, hash-chained** entry (`AuditEntry`). Editing or removing an
entry breaks the chain and is detectable. The log is **replicated to a
Government-held store that BYOND cannot write to**, so the vendor cannot
quietly erase evidence of its own access.

The Session Explorer already demonstrates the citizen-facing half of this:
PII is masked by default, unmasking requires an explicit elevated action, and
each reveal is recorded in a visible access log.

---

## 5. Corruption reports — the carve-out (most important section)

**Our position: this platform must not become an unofficial corruption
reporting channel.** Code: [`referral.ts`](../src/lib/governance/referral.ts).

If allegations accumulate here, three failures occur simultaneously:

1. **The citizen loses protection.** Statutory whistleblower protection
   attaches to disclosures made to a *competent authority through the proper
   channel*. A disclosure made to a sentiment platform may attract none of it
   — while still exposing the discloser.
2. **The office inherits legal and political risk.** Identified allegations
   against named individuals, held in a political office's analytics system,
   are discoverable, leakable, and open to the charge of being an intelligence
   file on critics.
3. **The evidence is degraded.** Allegations need investigator handling and
   chain of custody, not machine sentiment scoring.

### The lifecycle: detect → quarantine → triage → seal → refer → purge

| Step | What happens |
|---|---|
| **Flagged** | Classifier flags a Tier-4 candidate. Record is *immediately quarantined* — pulled from the analytics pool, dashboard, Session Explorer and briefing. |
| **Quarantined** | Only a **named** protected-disclosure officer can open it, under the two-person rule. Nobody else — including the leader — sees more than an anonymous count. |
| **Triaged** | Human decides. Rejected ⇒ returns to the normal pool. Confirmed ⇒ referral. |
| **Sealed** | Narrative encrypted **to the receiving authority's key**. Once sealed, nobody at the PMO or BYOND can read it — including the officer who sealed it. |
| **Acknowledged** | Receiving authority returns a reference; recorded as proof of discharge. |
| **Purged** | Transcript, audio, narrative, names and identity linkage irreversibly deleted. |

**What survives in the platform** is only the aggregate signal the leader
legitimately needs — *"governance concern is rising in these states"* — with
kind, topic, state, ISO week and referral proof. **Never** the allegation, the
accused, or the discloser.

**No automated adverse decision.** The classifier flags; a named human decides.
Detection is deliberately tuned for **recall** — over-flagging costs a human
review, under-flagging costs someone their protection.

**The citizen is told, not handled silently.** In-session and in writing: this
is not a formal report, it is being referred, here is your reference, here is
the official channel, and you may withdraw it before referral. Risk-to-life
cases are the documented exception, stated up front.

⚖️ **Decisions needed:** the competent authority for each disclosure kind; the
named protected-disclosure officers; the withdrawal window; and whether
"corruption & governance" remains a *selectable* citizen topic at all, or
becomes referral-only.

---

## 6. Minimisation, retention and deletion

**Collected:** name, verified mobile, optional email, language, state,
district, optional topic.
**Deliberately never collected:** MyKad/national ID number, age, race,
religion, income, precise location, browser fingerprint.

That refusal is a security control, not a UX choice: data not collected cannot
be leaked, subpoenaed, or misused.

| Data | Retention | Then |
|---|---|---|
| Audio recording | 90 days ⚖️ | Deleted |
| Transcript (T3) | 12 months ⚖️ | Deleted |
| Insight record (T1) | 24 months | Reduced to T0 aggregate |
| Identity (T2) | 12 months post-session | Deleted |
| Restricted disclosure (T4) | Until referral acknowledged | Purged |
| Audit log | 7 years ⚖️ | Retained for accountability |
| Aggregate (T0) | Indefinite | Retained |

Deletion is **executed and evidenced**, not just flagged: deletion jobs write
an audit entry, and the citizen's own deletion request is honoured through the
manage-booking page. Aggregates already computed are not reversible to the
individual — which is why they can survive.

---

## 7. Legal & regulatory posture

⚖️ *All of §7 requires confirmation by Malaysian counsel — this is our
engineering read, not a legal opinion.*

| Instrument | Relevance | Our posture |
|---|---|---|
| **PDPA 2010 (Act 709)** | Malaysia's personal data protection law. Note: it has historically **excluded Federal and State Governments** — so the Ministry as data user may sit outside it, while **BYOND as a private processor does not**. | We do not rely on the government exemption. We build to PDPA standards regardless, because public trust — not just compliance — is what determines participation. |
| **PDPA (Amendment) Act 2024** | Introduced direct obligations on **data processors**, mandatory **breach notification**, mandatory **Data Protection Officer**, data portability, and revised cross-border transfer rules. | BYOND appoints a DPO, operates a breach-notification runbook, and treats itself as a directly-obligated processor. |
| **Cyber Security Act 2024 (Act 854)** | National Critical Information Infrastructure obligations. A national PMO listening platform is plausibly **NCII-adjacent or NCII**. ⚖️ | Assume NCII-grade duties: risk assessment, audit, incident reporting to the national authority. Cheaper to build in than retrofit. |
| **Whistleblower Protection Act 2010 (Act 711)** | Protection attaches to disclosures to a competent authority via proper channel. | The entire §5 carve-out exists to keep citizens inside this protection rather than outside it. |
| **Anti-corruption legislation / commission** | Competent authority for corruption allegations. | Sealed referral channel; platform does not investigate or retain. |
| **Official Secrets Act 1972** | Government information handling. | Classification scheme and access matrix align to it; audit log supports it. |
| **Public-sector cloud framework** | Governs where public-sector workloads may run. | Hosting options in §3.1 are constrained to it. |

**Lawful basis & consent:** explicit consent captured at booking, versioned
and stored with the record; purpose limitation stated in plain language in BM
and EN; consent is *specific* (session improvement + Ministry insight) and not
a blanket permission.

**Assurance:** DPIA before pilot; independent penetration test before public
launch; ISO 27001-aligned ISMS; annual third-party audit; the audit log
exportable to the Government and the regulator on demand.

---

## 8. Breach response

| Stage | Commitment |
|---|---|
| **Detect** | Central logging, anomaly alerts on unusual access patterns (volume, off-hours, repeated unmasks on one citizen). |
| **Contain** | Government can revoke platform keys unilaterally — the ultimate containment does not require BYOND. |
| **Notify** | Pre-agreed runbook: Government first, then regulator per statutory timeline, then affected citizens. ⚖️ Timelines to confirm with counsel. |
| **Communicate** | Pre-agreed comms playbook. The top reputational risk is not the database — it is a **manipulated or out-of-context clip of the digital leader**, which is why the AI-representation disclosure is visible in every session. |
| **Learn** | Post-incident report to the Government and the regulator; remediation tracked to closure. |

---

## 9. What BYOND commits to contractually

These belong in the contract, not just this paper:

1. **No vendor access to T1–T4.** Enforced cryptographically via Government-held keys.
2. **No training on citizen data.** No AI model is trained, fine-tuned or evaluated on citizen content — including by any subprocessor.
3. **No secondary use.** No analytics, resale, benchmarking or case-study use of citizen content. Aggregate T0 use only with written approval.
4. **Named subprocessors.** Every subprocessor (avatar service, messaging provider, model host) disclosed, with the Government holding veto.
5. **Data residency warranty**, with audit rights and a remedy for breach.
6. **Exit and portability.** On termination, the Government receives all data in open formats and BYOND performs evidenced destruction.
7. **Audit log co-custody.** Replicated to Government-held storage BYOND cannot write to.
8. **Breach notification** to the Government within an agreed short window.

Item 1 and item 8 are the two that end the conversation in our favour.

---

## 10. Open decisions ⚖️

| # | Decision | Owner |
|---|---|---|
| 1 | Hosting option A / B / C (§3.1) — drives timeline | Gov IT + PMO |
| 2 | Key custody model and KMS instance (§3.2) | Gov IT security |
| 3 | Cross-border AI processing: pilot posture and rollout target (§3.3) | PMO + Gov legal |
| 4 | Whether "corruption & governance" stays a selectable citizen topic (§5) | PMO + legal |
| 5 | Competent authority per disclosure kind; named disclosure officers (§5) | PMO + legal |
| 6 | Retention periods: audio, transcript, audit log (§6) | Gov legal |
| 7 | NCII designation status and consequent duties (§7) | Gov security |
| 8 | Named role holders for every row of the access matrix (§4) | PMO |
| 9 | Breach notification timelines (§8) | Gov legal |

---

## 11. The one-paragraph justification

> Citizen sessions are classified into five tiers and stored **only in
> Malaysia**, in physically separated stores. The analytics that produce the
> dashboard and the weekly briefing run on **de-identified data** — a
> compromise of that layer yields no names. Identity and raw speech are
> encrypted under **keys the Government holds, not BYOND**, so the vendor
> cannot read citizen content and the Government can revoke access
> unilaterally at any time. **No role can read raw content by default**,
> including the Prime Minister; the rare exception requires a stated purpose,
> a second approver, an automatic expiry, and an immutable audit entry naming
> the individual, replicated to a Government-held log the vendor cannot alter.
> Allegations of corruption are **not accumulated here at all**: they are
> quarantined out of the analytics pool, sealed to the receiving authority's
> key, referred through the proper statutory channel so the citizen keeps
> their legal protection, and then purged — leaving only an anonymous trend
> count. Data not needed is never collected: no MyKad number, no age, no race,
> no income.
