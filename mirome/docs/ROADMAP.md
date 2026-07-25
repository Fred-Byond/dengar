# Roadmap

Where this prototype sits, and what a commercial pilot needs.

## Built

- Participant Assessment Portal: consent → context → 10-item pulse → structured
  digital-human interview → two scenario role-plays → reflection → summary
  confirmation, in four languages with an EN/BM interface toggle.
- Team Intelligence Framework: Layer 1 (6 capabilities), Layer 2 (10 climate
  constructs), Layer 3 (5 scenarios), the theme taxonomy, the intervention
  mapping, the scorer seam and the aggregation engine.
- Team Intelligence dashboard: team health, department × construct heat map with
  drill-down, leader–staff perception gap, capability distribution, ranked
  intervention priorities, themes, participant suggestions, anonymised voices,
  human-review queue, progress across five waves, and an action tracker in the
  HR view.
- Facilitator Intelligence Pack (printable) and Participant Explorer (evidence).
- Governance: minimum group size, non-scores, confidence, excluded confounds,
  review routing, quote provenance.

## Not built (deliberately)

Invitation and consent service, persistence, authentication and role gating,
the LLM extraction pass, the reviewer console workflow, the reassessment
scheduler, notifications, and any HR-system integration.

## Phase 1 — pilot engineering (≈8 weeks)

1. **Persistence and identity separation.** Postgres; the identity mapping lives
   in the invitation service and is never joined to analysis records.
2. **Auth and role gating.** Facilitator, HR, reviewer, admin. The HR view must
   not be reachable by role escalation.
3. **LLM extraction behind `Scorer`.** Structured output per construct with the
   verbatim span, the confidence and the non-score codes. Keep the deterministic
   scorer as the regression baseline.
4. **Session gateway.** Vendor adapter, webhook ingress with signature
   verification, retry and idempotency.
5. **Reviewer console.** Queue, decision capture, audit log.
6. **Reassessment.** Scheduler, short-form pulse, invitation and reminder flow.

## Phase 2 — validation (runs alongside the first pilots)

Per §17 of the concept paper, and required before any stronger claim:

1. Expert review — organisational psychologists, HR specialists, facilitators,
   psychometric advisors.
2. Pilot: 5–10 partner providers, 20–30 corporate teams, multiple industries and
   team sizes.
3. Reliability — score consistency, AI–human agreement, scenario consistency,
   internal construct performance, test–retest where appropriate.
4. Practical validity — do the findings match facilitator observation, help
   customise the programme, get accepted by HR, and identify actionable
   priorities?
5. Outcome validity — is the intervention associated with improvement in the
   constructs it targeted, and in selected operational indicators?

## Phase 3 — product

Industry scenario libraries, manager dashboard, live workshop polling, provider
marketplace and white-label reporting, benchmarking, LMS/HRIS integration,
continuous pulse, and predictive risk indicators **only after** Phase 2.
