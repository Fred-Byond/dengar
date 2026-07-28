# MIROME Team Intelligence

> AI-powered **team diagnosis**, workshop customisation and organisational
> development. A digital-human assessment experience plus a team intelligence
> dashboard.
> By **BYOND Asia**.

> **Diagnose the team before designing the intervention.**

Most corporate team building starts with an activity — outdoor challenges,
communication games, personality profiling — chosen before anyone has diagnosed
how the team actually works. The event creates enthusiasm and little change,
because "communication is poor" is a symptom, and the cause might be
psychological safety, unclear decision rights, departmental silos, conflict
avoidance or competing targets.

MIROME Team Intelligence puts the evidence first: a confidential pulse, a
structured digital-human interview and workplace scenario simulations, scored
into a team profile that tells the facilitator what the programme actually has
to fix — and measured again at 30, 60 and 90 days to show whether it did.

## The product has two halves

| Half | Route | What it is |
|------|-------|------------|
| **Participant experience** | `/experience` | The confidential 15-minute journey: consent → context → 10-item pulse → digital-human interview → two workplace scenarios → reflection → summary confirmation. The employee-trust surface and the source of every data point. |
| **Organisational intelligence** | `/dashboard` | Team health across ten climate constructs, department × construct heat map, leader–staff perception gap, capability distribution, ranked intervention priorities, progress from baseline to 90 days. Two role views: **Facilitator** (design the programme) and **HR & Management** (assign, track, resolve). The enduring value and the recurring revenue. |
| **Facilitator Intelligence Pack** | `/facilitator` | The printable pre-programme briefing: evidence base, priority findings, recommended programme design with activities and prompts, group composition, anonymised voices, governance constraints. |
| **Participant Explorer** | `/participants` | The evidence behind every dashboard number — capability scores with their verbatim support, climate responses, scenario observations, and the human-review queue. |

The intelligence layer — the moat — is the
[Team Intelligence Framework (TIF)](docs/TIF.md): it assesses **how the team
functions**, never the employee as a person, and never as a disciplinary
instrument.

---

## Repository layout

```
mirome/
├── src/
│   ├── app/
│   │   ├── page.tsx            Product hub (this README, as a page)
│   │   ├── experience/         Participant Assessment Portal → /experience
│   │   ├── dashboard/          Team Intelligence            → /dashboard
│   │   ├── facilitator/        Facilitator Intelligence Pack → /facilitator
│   │   └── participants/       Participant Explorer          → /participants
│   ├── components/
│   │   ├── experience/         The phone-framed digital-human journey
│   │   ├── dashboard/          The dashboard (React, wired to the real pipeline)
│   │   ├── FacilitatorPack.tsx Printable pre-programme briefing
│   │   └── ParticipantExplorer.tsx  Reviewer/evidence view
│   └── lib/
│       ├── org.ts              Demo client organisation + language banks
│       ├── seed.ts             Deterministic synthetic dataset (scored by the real scorer)
│       ├── digital-human/      ★ Digital-human SDK seam (interface + mock + Klleon adapter)
│       └── tif/                ★ Team Intelligence Framework
│           ├── types.ts        Participant Insight Record + aggregate shapes
│           ├── constructs.ts   Layer 1 + Layer 2 rubrics, levels, excluded confounds
│           ├── scenarios.ts    Layer 3 workplace scenarios
│           ├── taxonomy.ts     Theme taxonomy + owner routing
│           ├── interventions.ts Diagnosis → intervention recommendation engine
│           ├── scorer.ts       Scoring pipeline (deterministic now, LLM-swappable)
│           └── aggregate.ts    Team Intelligence Engine
└── docs/                       TIF · ARCHITECTURE · INTEGRATION-DIGITAL-HUMAN · GOVERNANCE · ROADMAP · MIROME-STYLE
```

## The framework in one screen

**Layer 1 — individual capability.** Communication effectiveness · empathy and
perspective-taking · constructive assertiveness · collaborative problem-solving ·
critical thinking · stress handling.

**Layer 2 — team climate.** Psychological safety · trust · role clarity · goal
alignment · collaboration · constructive conflict · leadership openness ·
inclusion and belonging · accountability · collective resilience.

**Layer 3 — scenario simulation.** Missed deadline · disagreement with a manager
· departmental conflict · overloaded colleague · sudden change.

Rules the pipeline enforces, in code:

- every score points at a verbatim response, or is reported as **Not Elicited** /
  **Insufficient Evidence** — a missed opportunity is never a low score;
- confidence and sample size travel with every number;
- accent, grammar, fluency, appearance, charisma and technical failures never
  move a score;
- no group below **five** participants is displayed, under any filter;
- **no universal team score** — distinct constructs stay visible;
- welfare, safety and named-individual disclosures route to a human reviewer.

See [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md) for where each rule is enforced.

## Layer 0 — MIROME Style (specified, not built)

[`docs/MIROME-STYLE.md`](docs/MIROME-STYLE.md) specifies a seven-minute
behavioural style session — the four-factor D/I/S/C model delivered as a
conversation instead of a twenty-four-item form. It is the commercial land for
the team diagnosis: providers already buy style profiles per participant, so it
replaces an existing line item rather than creating one.

It drops in behind the same seams: `Scorer` is unchanged, `ParticipantInsightRecord`
gains an optional `style`, and the only new aggregate is team composition. The
spec covers the instrument, the elicitation script per dimension, the data
contract, the four-study validation protocol and the pricing model.

Two design rules are non-negotiable there: the profile is **normative** (classic
forced-choice DISC is ipsative and cannot support between-person team
composition), and it is **never sold for selection** — development, self-awareness
and team composition only.

## Clickable prototypes

`public/prototypes/` holds self-contained demo pages — the same convention
DENGAR.ai uses for its approved prototypes. The two published pages are split by
audience so each one opens straight into its own surface, and both are usable on
a phone:

| File | What it is |
|------|------------|
| `mirome-dashboard.html` | The organisational-intelligence half: team health, department heat map, perception gap, ranked priorities, the intervention modal, the action tracker, and the Facilitator Pack behind the header button. Generated from `mirome-demo.html` |
| `mirome-interview.html` | The employee half, rebuilt by hand: the **digital interviewer is the surface**, in **six languages** (English · Bahasa Melayu · 中文 · العربية · 한국어 · 日本語), Arabic in full RTL. Language → welcome → consent → context → pulse → ready → interview → reflection → confirmation → close |
| `mirome-demo.html` | The combined dark-theme source the dashboard is generated from |

The numbers are not mocked: the profiles for all five measurement waves are
exported from the scoring pipeline (82 synthetic transcripts through
`src/lib/tif`) and inlined, so the prototypes and the app show the same
diagnosis. Regenerate the dashboard page after editing the combined source:

```bash
python3 scripts/split-prototype.py
```

The interview page is hand-authored and is **not** regenerated by that script.

**The interviewer is the picture, and nothing opaque ever covers her face.**
That single rule — taken from the DENGAR session this is modelled on — decides
the rest of the design. Her words are white subtitles burnt into the lower
third, over her body, the way a broadcast lower-third works; there is no
caption card, because a card is a rectangle of paint and it always lands
somewhere. Subtitles have to be white to sit on a picture, so the room is a
warm, low-key office rather than a bright studio.

She is one persistent, full-bleed layer that is never unmounted and never
scrolled away. Screens come in two modes — *stage* (language, welcome, ready,
the interview itself: white type straight on the picture) and *sheet* (consent,
context, pulse, reflection, confirmation, close: a paper document anchored to
the bottom). Sheet height and her position in frame are set against each other
so that on every screen, in every language, the subtitle begins **below her
chin**; there is a Playwright probe for exactly that clearance. The "AI, not a
person" disclosure rides in a HUD pill on every screen and is never truncated.

The drawn figure is a **stand-in**. It is lit rather than rendered: the head
sits in shadow with only its contour caught by the key light, because a
featureless bright oval reads as an egg and a hand-drawn face lands in the
uncanny valley. Proportions are taken off the reference frame — head about a
quarter of the width, shoulders about three head-widths, a shoulder *line*
rather than a cone. The composition is the deliverable: point `DH_IMAGE` at a
still of the production avatar (or a `data:` URI, so the page stays
self-contained) and the drawing is replaced without another line changing.

Its trust design follows the disclosure evidence: people disclose more, and
manage impressions less, when they believe no human is observing. So the
"nobody is listening live" promise is the first thing she says, and is repeated
immediately before the participant speaks; the consent screen shows a
who-sees-what table rather than burying it in prose; and the participant reads
their own summary before any aggregate exists.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run typecheck # tsc --noEmit
```

Requires Node 18.17+ (CI and Docker use Node 20).

The digital human needs a Klleon SDK key; without one the portal still runs the
full journey and shows a diagnostic banner where the avatar would be.

```bash
cp .env.example .env   # put real keys in .env only — never commit it
```

### Using the intelligence layer

```ts
import { deterministicScorer, buildProfile, type TranscriptInput } from "@/lib/tif";

const record = deterministicScorer.score(transcript);
// → { capabilities, climate, scenarios, reflection, themes,
//     anonymisedQuote, summary, confirmation, humanReview, ... }
```

`Scorer` is the seam: the production LLM structured-extraction pass implements
the same interface and drops in behind it — the aggregations, the dashboards and
the facilitator pack never change shape.

The demo data is not hand-written dashboard numbers. `src/lib/seed.ts` generates
a transcript per participant, runs it through the **real** scorer and aggregates
with the **real** engine, so what you see is what the production pipeline
produces.

## Deploy with Docker

The image is **Node only** (no nginx inside). On a shared server, run **host
nginx** for TLS and routing; each project is a container on its own localhost
port (Wooby: `8080`, Dengar: `8081`, MIROME: `8082`).

```bash
cp .env.example .env
docker compose up -d --build
# app: http://127.0.0.1:8082
```

Host nginx example (on the server, not in this image):

```nginx
server {
  server_name mirome.example.com;
  location / {
    proxy_pass http://127.0.0.1:8082;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Production reads `KLLEON_SDK_KEY` at **runtime** — Next inlines `NEXT_PUBLIC_*`
at image build time, so a compose `.env` alone is not enough.

## Status

Demo prototype with synthetic data for a fictional client ("Meridian Group").
Not connected to any HR system. The interviewer is a **disclosed AI**. No
individual report is produced from any session.

External positioning until the validation programme has run
([`docs/ROADMAP.md`](docs/ROADMAP.md)): *an evidence-informed team diagnosis and
programme customisation platform* — not "predicts team performance".
