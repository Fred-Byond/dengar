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
| **Ministry intelligence** | `/dashboard` | DENGAR Intelligence — sentiment map, top issues, citizen suggestions, urgent review queue, action tracker. Two role views: **Minister** (the pulse) and **Secretary General** (assign, track, resolve). The enduring value and the recurring revenue. |
| **Session Explorer** | `/sessions` | Dashboard view 5, **React-native**. Search/filter every session, open the CVIF Session Insight Record, read the transcript (original + English), work the urgent queue. PII masked by default; reveal is audit-logged. Wired to the real CVIF scorer. |
| **AUREN rehearsal** | `/auren` | Investor rehearsal loop for the AUREN programme — a second configuration of the same governed-interview method. Voice-first digital-human session in **English / Español / 中文 / العربية**: understand → diagnose → stress → coach → retest → evidence chain. See [`docs/AUREN-ORDERING.md`](docs/AUREN-ORDERING.md). |

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
│   │   ├── sessions/           Session Explorer     → /sessions  (dashboard view 5)
│   │   └── auren/              AUREN rehearsal loop → /auren
│   ├── components/
│   │   ├── SessionExplorer.tsx React-native view over the CVIF scorer
│   │   └── auren/              Stage router, Reasoning Map rail, coach beats, scorecard
│   └── lib/
│       ├── types.ts            Domain model (Citizen, Slot, Booking, Session, Insight, AuditLog)
│       ├── seed.ts             Deterministic session generator (feeds the Session Explorer)
│       ├── briefing.ts         Weekly Ministry Briefing generator
│       ├── digital-human/      ★ Digital-human SDK seam (interface + mock; team implements adapter)
│       ├── auren/              ★ AUREN knowledge objects + session state machine
│       │   ├── i18n.ts         EN/ES/ZH/AR variants + fidelity status (canonical)
│       │   ├── objects.ts      Frozen inventory (elements, signatures, questions, challenges)
│       │   └── session.ts      Session model, retest selector, mode gate, AILS rule
│       └── cvif/               ★ Citizen Voice Intelligence Framework (the intelligence layer)
│           ├── types.ts        Session Insight Record + dimension types
│           ├── dimensions.ts   The 7 dimension rubrics, excluded confounds, review triggers
│           ├── taxonomy.ts     Home-Ministry topic taxonomy + department routing
│           ├── scorer.ts       Scoring pipeline (deterministic now, LLM-swappable)
│           └── index.ts        Public API
├── public/prototypes/          The APPROVED prototypes, served verbatim
│   ├── dengar-citizen.html
│   ├── national-pulse.html
│   └── auren-rehearsal.html    Voice-first AUREN loop, 4 languages (no SDK key needed)
├── scripts/
│   └── build-prototype-locale.mjs  `npm run locale` — injects the canonical copy
└── docs/                       ENGINEERING-HANDOFF · INTEGRATION-DIGITAL-HUMAN · CVIF · ARCHITECTURE · ROADMAP · AUREN-ORDERING
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
npm run locale    # regenerate the prototype's locale from src/lib/auren
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

## Deploy with Docker

The image is **Node only** (no nginx inside). On a shared server, run **host
nginx** for TLS and routing; each project is a container on its own localhost
port (Wooby: `8080`, Dengar: `8081`).

```bash
cp .env.example .env   # put real keys in .env only — never commit it
docker compose up -d --build
# app: http://127.0.0.1:8081
```

Host nginx example (on the server, not in this image):

```nginx
server {
  server_name dengar.example.com;
  location / {
    proxy_pass http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Compose binds `127.0.0.1:8081` only so the container is not public except through
host nginx.

### GitHub Actions

- **CI** (`.github/workflows/ci.yml`) — on push/PR to `main`: `npm ci`, lint, typecheck, build, `docker build`.
- **Deploy** (`.github/workflows/deploy.yml`) — on push to `main` (and manual **Run workflow**): SSH + `docker compose up -d --build`.

Set these repository secrets for deploy: `DEPLOY_HOST`, `DEPLOY_USER`,
`DEPLOY_SSH_KEY`, `DEPLOY_PATH`, `NEXT_PUBLIC_KLLEON_SDK_KEY` (and optionally `DEPLOY_PORT`).

Both workflows write a `.env` with your `NEXT_PUBLIC_KLLEON_SDK_KEY` secret mapped to
both `KLLEON_SDK_KEY` and `NEXT_PUBLIC_KLLEON_SDK_KEY` (deploy writes it on the server
before `docker compose up`). Production reads `KLLEON_SDK_KEY` at **runtime** — Next
inlines `NEXT_PUBLIC_*` at image build time, so a compose `.env` alone was not enough.

---

## Status

Demo prototype with synthetic data. Not connected to any Ministry system. The digital human
is a **disclosed AI representation** of the Minister. Personal data handling follows the
PDPA-2010 posture described in the Development Plan.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the ~12-week path to public pilot.
