# MESSI.LIVE — Your Moment With Messi

> **One Messi. Every Fan. Every Language. Anywhere.**
>
> A proposal by **BYOND Asia** for **Lionel Messi & Management**, built on the same platform
> concept as DENGAR.ai's "Talk to the Minister": a controlled five-minute digital-human
> session that is unforgettable for the person having it, and that produces comparable,
> decision-useful data for the principal.

**Status: demo prototype with synthetic data.** Not affiliated with, endorsed by, or
connected to Lionel Messi or his management. No commercial partner is named anywhere in
this repository; every partner slot is an illustrative placeholder subject to management
approval.

Routes: [`/messi`](../src/app/messi/page.tsx) · [`/messi/experience`](../src/app/messi/experience) ·
[`/messi/dashboard`](../src/app/messi/dashboard) · [`/messi/conversations`](../src/app/messi/conversations) ·
[`/messi/brief`](../src/app/messi/brief)

---

## The two ideas

Everything below serves two sentences management should remember after the meeting:

| | |
|---|---|
| **Consumer promise** | **Your Moment With Messi** |
| **Business proposition** | **Global IP. Local Commercialisation. Central Governance.** |

---

## 1. The problem: reach is not relationship

Hundreds of millions of people know Messi. He cannot possibly know them. Social media
created extraordinary reach, but every message, story and comment disappears into the feed.

MESSI.LIVE proposes a different model:

```
FOLLOW → SPEAK → LISTEN → UNDERSTAND → RESPOND → REMEMBER
```

The opportunity is to convert one of the world's largest audiences into one of the world's
largest **direct fan relationships**.

## 2. The hero experience: 5 Minutes With Messi

A young footballer in Riyadh opens MESSI.LIVE, selects Arabic, and books 7:30 PM. At 7:30
his phone says **"Messi is ready."** Lionel Messi appears full-screen:

> "Hello. It's great to meet you. We have five minutes together. What would you like to
> talk about?"

Five minutes later: *"Thank you. I hope we speak again."* For that child it is not content.
It is his moment.

The session is deliberately **controlled** — welcome → listen → probe → reflect → confirm →
close — for the same reason DENGAR's citizen session is: a controlled session is
comparable, and comparability is what makes the intelligence layer possible.

Implementation: [`MessiExperienceApp.tsx`](../src/components/messi/experience/MessiExperienceApp.tsx),
script and guardrails in [`script.ts`](../src/components/messi/experience/script.ts).

## 3. Not a video. Not a chatbot.

An officially authorised hyper-realistic digital human reproducing approved aspects of
appearance, voice, expression, gesture, communication style, career knowledge, stories and
values. The technology should be invisible: fans should not think about AI, they should
think *"I just spoke with Messi."*

**Every session discloses, before it begins, that this is an official AI-powered digital
representation.** The digital human makes no promises, no endorsements, and never comments
on medical, legal, contract or transfer matters — those are reserved categories.

The vendor SDK sits behind the existing digital-human seam
([`src/lib/digital-human`](../src/lib/digital-human)), shared with DENGAR.

## 4. One Messi, every language

Eleven launch languages: Español · English · العربية · Português · हिन्दी · Bahasa Indonesia ·
中文 · Français · 日本語 · Bahasa Melayu · 한국어 ([`markets.ts`](../src/lib/messi/markets.ts)).

The objective is not translation. It is **one authentic Messi identity expressed naturally
across cultures**. The fan interface ships in English and Spanish; the *conversation*
language is the product.

## 5. The real product is the relationship

Conversation creates connection. **Memory creates continuity.**

A thirteen-year-old says: *"Next month I have my first professional academy trial."* Three
months later he returns, and Messi opens with: *"Last time you told me you were preparing
for your academy trial. How did it go?"*

That is no longer an AI experience. It feels like a relationship — and it is the single
strongest reason to return, which makes it the engine of MESSI+ rather than a feature of it.

Memory is opt-in, requires a confirmed summary, is visible to the fan in **My Messi**, and
is deletable at any time. See `memoryCandidate` / `continuityHook` in [FVIF](FVIF.md).

## 6. The listening infrastructure

With consent and de-identification, millions of conversations produce something no athlete
has ever had: **understanding at scale**.

The **Fan Voice Intelligence Framework** ([FVIF](FVIF.md)) scores every conversation across
seven visible dimensions and produces one Fan Insight Record. Aggregated, that becomes:

- **THE MESSI GLOBAL PULSE** — what the world is asking, what is emerging, which countries
  are moving, who needs care ([`pulse.ts`](../src/lib/messi/pulse.ts)).
- **THE MESSI WORLD BRIEF** — the recurring weekly deliverable
  ([`brief.ts`](../src/lib/messi/brief.ts)).

## 7. The loop back to Lionel

```
FAN → DIGITAL MESSI → INTELLIGENCE → LIONEL → FAN
```

Each week the platform surfaces the questions where a personal answer would matter most —
ranked by significance, personal context and how many fans asked the same thing, and
explicitly **not** by membership tier or market value. Lionel picks one and records thirty
seconds. That authentic response reaches every fan who asked something close, in their own
language, under the approved localisation process.

**AI creates scale. Lionel provides humanity.**

## 8. The content universe

`5 Minutes With Messi` gets people through the door; content keeps the relationship alive:
Messi Stories · Messi Inspires · Messi Academy · Messi Exclusive · My Messi · Messi Moments ·
Messi For Good ([`taxonomy.ts`](../src/lib/messi/fvif/taxonomy.ts)).

Each conversation topic maps to the experience it feeds and the team that owns the
response — which is how the dashboard turns listening into a production plan.

## 9. Mobile creates scale. HoloMe creates magic.

MESSI.LIVE lives on the phone almost everyone already carries. HoloMe brings the same
digital human into stadiums, airports, exhibitions, stores, malls, academies, hotels and fan
zones at 86-inch scale. A fan approaches, speaks, is answered, takes a photograph — then:

> **SCAN TO CONTINUE WITH MESSI.LIVE**

Physical creates wonder. Mobile creates scale. Memory creates continuity.

## 10. Global IP, local commercialisation

One official platform, configured territory by territory
([`markets.ts`](../src/lib/messi/markets.ts)) — local language, pricing, distribution,
campaigns, sponsorship and HoloMe activations, all running through one governed identity.

Commercial structure ([`commercial.ts`](../src/lib/messi/commercial.ts)):

- **MESSI+** membership: free to meet, premium to build the relationship (individual,
  family, premium).
- **Nine revenue engines**: country partnerships · mobile operators · MESSI+ subscriptions ·
  category sponsorship · Messi Academy · premium transactions · commerce · content licensing ·
  physical experiences.
- **Mobile operators as the distribution engine** — a B2B2C model that does not acquire
  fans one by one.

## 11. Maximise value. Protect Messi.

The **Global Rights Matrix** governs every category in every territory: existing sponsors,
exclusivity, digital and AI/digital-human rights, competitor restrictions, reserved
categories, prohibited categories, contract periods and approvals.

Management retains: sponsor approval · category veto · territory approval · content
approval · campaign approval · likeness approval · voice governance · brand-safety control ·
**emergency shutdown authority**.

> **BYOND operates the technology. Management controls Lionel Messi.**

## 12. Safeguarding

The platform talks to children, so the children's rules are platform rules, not policy
appendices:

- Under-18 accounts run inside the children's environment with verified guardian consent.
- Care and Critical disclosures are routed to trained fan-care officers — never answered by
  the digital human alone, never by a scripted reply.
- Identity is masked by default in every internal tool; unmasking requires elevated access
  and is audit-logged ([`ConversationExplorer.tsx`](../src/components/messi/ConversationExplorer.tsx)).
- Betting, alcohol, tobacco, political and speculative-asset categories are never sold.

---

## What is in this repository

| Layer | Path |
|---|---|
| Intelligence (FVIF) | [`src/lib/messi/fvif`](../src/lib/messi/fvif) |
| Markets & territories | [`src/lib/messi/markets.ts`](../src/lib/messi/markets.ts) |
| Commercial model | [`src/lib/messi/commercial.ts`](../src/lib/messi/commercial.ts) |
| Seeded global dataset | [`src/lib/messi/seed.ts`](../src/lib/messi/seed.ts) |
| Global Pulse aggregation | [`src/lib/messi/pulse.ts`](../src/lib/messi/pulse.ts) |
| World Brief generator | [`src/lib/messi/brief.ts`](../src/lib/messi/brief.ts) |
| Fan experience | [`src/components/messi/experience`](../src/components/messi/experience) |
| Management dashboard | [`src/components/messi/GlobalPulse.tsx`](../src/components/messi/GlobalPulse.tsx) |
| Conversation Explorer | [`src/components/messi/ConversationExplorer.tsx`](../src/components/messi/ConversationExplorer.tsx) |
| World Brief document | [`src/components/messi/WorldBrief.tsx`](../src/components/messi/WorldBrief.tsx) |

The demo dataset is deterministic (seeded), so every number in the dashboard is reproducible
and every record is real engine output rather than hand-authored copy.

## Phase 0 questions for management

These are the decisions that must be made before a line of production code is written —
the same shape as DENGAR's Phase 0 with the Ministry:

1. **Persona scope** — which stories, values and career material are approved source
   knowledge, and which are off-limits?
2. **Voice and likeness** — approval process, review cadence, and the standard for what
   "sounds like Lionel" means.
3. **Reserved categories** — confirm the existing global relationships that territories may
   never sell against.
4. **Children's policy** — age floor, guardian verification method, and who the named
   safeguarding officer is in each territory.
5. **The response loop** — how often Lionel records, who curates the shortlist, and who
   approves publication.
6. **Memory policy** — retention period, deletion SLA, and what a fan sees in My Messi.
7. **Launch territories** — which three markets go first, and which partner categories are
   open in each.
