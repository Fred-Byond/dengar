# DENGAR.ai — Talk to the Minister

> A scheduled digital-human **citizen-listening platform** and national **sentiment intelligence dashboard** for the Ministry of Home Affairs, Malaysia.
> By **BYOND Asia** × **Malaysia MADANI**.

DENGAR.ai gives every Malaysian a bookable, personal **5-minute audience** with the
Home Minister&rsquo;s digital human — not an open-ended chatbot, but a purpose-designed
listening session. Because every session follows the same controlled structure, every
conversation produces **comparable data**. Thousands of sessions become a continuously
updating national dataset.

The product has **two halves**:

| Half | Route | What it is |
|------|-------|------------|
| **Citizen experience** | `/experience` | Bookable, multilingual, 5-minute controlled session with the Minister&rsquo;s digital human. The political narrative and the source of the data. |
| **Ministry intelligence** | `/dashboard` | National Pulse — sentiment map, top issues, citizen suggestions, urgent review queue, action tracker. The enduring value and the recurring revenue. |
| **Session Explorer** | `/sessions` | Dashboard view 5, **React-native**. Search/filter every session, open the CVIF Session Insight Record, read the transcript (original + English), work the urgent queue. PII masked by default; reveal is audit-logged. Wired to the real CVIF scorer. |

The **intelligence layer** — the moat — is the [Citizen Voice Intelligence Framework
(CVIF)](docs/CVIF.md): it scores the *conversation as evidence about an issue*, never the
citizen as a person.

---

## Repository layout

```
dengar/
├── src/
│   ├── app/
│   │   ├── page.tsx            Product hub (this README, as a page)
│   │   ├── experience/         Citizen experience  → /experience
│   │   ├── dashboard/          National Pulse       → /dashboard
│   │   └── sessions/           Session Explorer     → /sessions  (dashboard view 5)
│   ├── components/
│   │   └── SessionExplorer.tsx React-native view over the CVIF scorer
│   └── lib/
│       ├── types.ts            Domain model (Citizen, Slot, Booking, Session, Insight, AuditLog)
│       ├── seed.ts             Deterministic session generator (feeds the Session Explorer)
│       ├── briefing.ts         Weekly Ministry Briefing generator
│       ├── digital-human/      ★ Digital-human SDK seam (interface + mock; team implements adapter)
│       └── cvif/               ★ Citizen Voice Intelligence Framework (the intelligence layer)
│           ├── types.ts        Session Insight Record + dimension types
│           ├── dimensions.ts   The 7 dimension rubrics, excluded confounds, review triggers
│           ├── taxonomy.ts     Home-Ministry topic taxonomy + department routing
│           ├── scorer.ts       Scoring pipeline (deterministic now, LLM-swappable)
│           └── index.ts        Public API
├── public/prototypes/          The two APPROVED prototypes, served verbatim
│   ├── dengar-citizen.html
│   └── national-pulse.html
└── docs/                       ENGINEERING-HANDOFF · INTEGRATION-DIGITAL-HUMAN · CVIF · ARCHITECTURE · ROADMAP
```

> **Team taking this over?** Start at [`docs/ENGINEERING-HANDOFF.md`](docs/ENGINEERING-HANDOFF.md) —
> the role split, the two integration seams, and the Phase-1 build order.

### About the prototypes

`public/prototypes/*` are the **approved** self-contained demos. The app currently serves
them verbatim at `/experience` and `/dashboard` so there is **zero visual regression** while
the production React components are built out (see [ROADMAP](docs/ROADMAP.md)). They are the
single source of truth for the visual identity and copy.

---

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run typecheck # tsc --noEmit
```

Requires Node 18.17+.

### Using the intelligence layer

```ts
import { deterministicScorer, type TranscriptInput } from "@/lib/cvif";

const insight = deterministicScorer.score(transcript);
// → { topicL1, sentiment, evidence, impact, actionability, urgency,
//     confirmation, painPoint, suggestion, summary, humanReview, ... }
```

The `Scorer` interface is the seam: the production LLM structured-extraction pass
implements the same interface and drops in behind it — the dashboard aggregations and the
weekly briefing never change shape.

---

## Status

Demo prototype with synthetic data. Not connected to any Ministry system. The digital human
is a **disclosed AI representation** of the Minister. Personal data handling follows the
PDPA-2010 posture described in the Development Plan.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the ~12-week path to public pilot.
