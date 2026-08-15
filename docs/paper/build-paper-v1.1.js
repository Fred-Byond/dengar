/**
 * Builds docs/MESSI-LIVE-Project-and-Product-Paper-v1.1.docx.
 *
 * v1.1 folds in the pre-submission review of 13 Aug 2026 (gift structure,
 * Story Library, Moment Card, gifting, proactive moments, sponsor product,
 * foundation commitment). v1.0 lives unchanged in build-paper.js.
 *
 * The paper is generated, so this script is the source of truth — edit here,
 * never the .docx. Figures live alongside this file.
 *
 *   npm i docx           # not an app dependency; install ad hoc
 *   node docs/paper/build-paper-v1.1.js docs/MESSI-LIVE-Project-and-Product-Paper-v1.1.docx docs/paper
 */
const fs = require("fs");
const d = require("docx");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, PageBreak, TableOfContents,
  Header, Footer, PageNumber, LevelFormat, convertInchesToTwip,
} = d;

/* ------------------------------------------------------------------ *
 * tokens                                                              *
 * ------------------------------------------------------------------ */
const NAVY = "0F1730";
const SKY = "2E6FA7";
const GOLD = "8A6A12";
const ROSE = "A5215F";
const INK = "14181F";
const MUTED = "5C6373";
const RULE = "D8DEE9";
const BAND = "EEF2F8";
const W = 9020; // content width in DXA

/* helpers ---------------------------------------------------------- */
const p = (text, o = {}) =>
  new Paragraph({
    spacing: { after: o.after ?? 120, before: o.before ?? 0, line: o.line ?? 264 },
    alignment: o.align,
    indent: o.indent,
    border: o.border,
    shading: o.shading,
    children: [
      new TextRun({
        text,
        size: o.size ?? 21,
        bold: o.bold,
        italics: o.italics,
        color: o.color ?? INK,
        font: o.font,
        allCaps: o.caps,
        characterSpacing: o.caps ? 30 : undefined,
      }),
    ],
  });

/** Rich paragraph: array of [text, {bold,italics,color}] */
const rp = (runs, o = {}) =>
  new Paragraph({
    spacing: { after: o.after ?? 120, before: o.before ?? 0, line: 264 },
    alignment: o.align,
    shading: o.shading,
    border: o.border,
    indent: o.indent,
    children: runs.map(
      ([t, ro = {}]) =>
        new TextRun({
          text: t,
          size: ro.size ?? o.size ?? 21,
          bold: ro.bold,
          italics: ro.italics,
          color: ro.color ?? o.color ?? INK,
        }),
    ),
  });

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 420, after: 160 },
    children: [new TextRun({ text, size: 30, bold: true, color: NAVY })],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, size: 24, bold: true, color: SKY })],
  });

const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 90 },
    children: [new TextRun({ text, size: 21, bold: true, color: INK })],
  });

const eyebrow = (text) =>
  new Paragraph({
    spacing: { before: 240, after: 60 },
    children: [
      new TextRun({ text: text.toUpperCase(), size: 16, bold: true, color: ROSE, characterSpacing: 40 }),
    ],
  });

const bullets = (items, level = 0) =>
  items.map(
    (t) =>
      new Paragraph({
        numbering: { reference: "bullets", level },
        spacing: { after: 70, line: 264 },
        children:
          Array.isArray(t)
            ? t.map(([x, ro = {}]) => new TextRun({ text: x, size: 21, bold: ro.bold, italics: ro.italics, color: ro.color ?? INK }))
            : [new TextRun({ text: t, size: 21, color: INK })],
      }),
  );

const numbered = (items) =>
  items.map(
    (t) =>
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        spacing: { after: 70, line: 264 },
        children:
          Array.isArray(t)
            ? t.map(([x, ro = {}]) => new TextRun({ text: x, size: 21, bold: ro.bold, italics: ro.italics, color: ro.color ?? INK }))
            : [new TextRun({ text: t, size: 21, color: INK })],
      }),
  );

const cell = (children, o = {}) =>
  new TableCell({
    width: { size: o.width, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined,
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
    verticalAlign: "top",
    children,
  });

/** table(headers, rows, widths) — widths must sum to W */
function table(headers, rows, widths, o = {}) {
  const head = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      cell([p(h, { size: 17, bold: true, color: NAVY, caps: true, after: 0 })], {
        width: widths[i],
        fill: BAND,
      }),
    ),
  });
  const body = rows.map(
    (r, ri) =>
      new TableRow({
        children: r.map((c, i) =>
          cell(
            (Array.isArray(c) ? c : [c]).map((line, li) =>
              typeof line === "string"
                ? p(line, { size: o.size ?? 19, after: li === (Array.isArray(c) ? c.length : 1) - 1 ? 0 : 60 })
                : line,
            ),
            { width: widths[i], fill: ri % 2 === 1 ? "F8FAFD" : undefined },
          ),
        ),
      }),
  );
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [head, ...body],
  });
}

const spacer = (h = 120) => new Paragraph({ spacing: { after: h }, children: [] });

/** The Insight → Implication → Action block Fred reads first. */
function iia(insight, implication, action) {
  return [
    new Paragraph({
      spacing: { before: 140, after: 0, line: 264 },
      shading: { type: ShadingType.CLEAR, fill: "F4F7FC", color: "auto" },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: SKY, space: 8 } },
      indent: { left: 160, right: 160 },
      children: [
        new TextRun({ text: "Insight  ", size: 17, bold: true, color: SKY, characterSpacing: 30 }),
        new TextRun({ text: insight, size: 21, color: INK }),
      ],
    }),
    new Paragraph({
      spacing: { before: 60, after: 0, line: 264 },
      shading: { type: ShadingType.CLEAR, fill: "F4F7FC", color: "auto" },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: SKY, space: 8 } },
      indent: { left: 160, right: 160 },
      children: [
        new TextRun({ text: "Implication  ", size: 17, bold: true, color: SKY, characterSpacing: 30 }),
        new TextRun({ text: implication, size: 21, color: INK }),
      ],
    }),
    new Paragraph({
      spacing: { before: 60, after: 180, line: 264 },
      shading: { type: ShadingType.CLEAR, fill: "F4F7FC", color: "auto" },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: SKY, space: 8 } },
      indent: { left: 160, right: 160 },
      children: [
        new TextRun({ text: "Action  ", size: 17, bold: true, color: SKY, characterSpacing: 30 }),
        new TextRun({ text: action, size: 21, color: INK }),
      ],
    }),
  ];
}

const callout = (label, text, fill = "FFF8E6", bar = GOLD) =>
  new Paragraph({
    spacing: { before: 140, after: 180, line: 264 },
    shading: { type: ShadingType.CLEAR, fill, color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: bar, space: 8 } },
    indent: { left: 160, right: 160 },
    children: [
      new TextRun({ text: label + "  ", size: 17, bold: true, color: bar, characterSpacing: 30 }),
      new TextRun({ text, size: 21, color: INK }),
    ],
  });

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

/** Figure with caption. w/h in points (1pt = 1/72"). */
function figure(file, w, h, caption) {
  return [
    new Paragraph({
      spacing: { before: 200, after: 60 },
      alignment: AlignmentType.CENTER,
      children: [
        new d.ImageRun({
          type: "png",
          data: fs.readFileSync(FIG + "/" + file),
          transformation: { width: w, height: h },
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 220 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: caption, size: 17, italics: true, color: MUTED })],
    }),
  ];
}
const FIG = process.argv[3] || ".";

/* ------------------------------------------------------------------ *
 * content                                                             *
 * ------------------------------------------------------------------ */

const titlePage = [
  spacer(1600),
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: "PROJECT & PRODUCT PAPER", size: 18, bold: true, color: ROSE, characterSpacing: 60 })],
  }),
  new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: "MESSI", size: 68, bold: true, color: NAVY }),
      new TextRun({ text: ".LIVE", size: 68, color: SKY }),
    ],
  }),
  new Paragraph({
    spacing: { after: 320 },
    children: [new TextRun({ text: "One Messi. Every Fan. Every Language. Anywhere.", size: 26, color: MUTED })],
  }),
  new Paragraph({
    spacing: { after: 120 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: RULE } },
    children: [],
  }),
  rp([
    ["An officially governed digital relationship platform giving any fan, anywhere, a bookable five-minute one-to-one conversation with Lionel Messi's authorised digital human — and giving Messi's management the first listening infrastructure ever built around an athlete.", { size: 23 }],
  ], { after: 400 }),
  table(
    ["Field", "Detail"],
    [
      ["Document", "MESSI.LIVE — Project & Product Paper, v1.1"],
      ["Prepared by", "BYOND Asia"],
      ["Prepared for", "Lionel Messi & Management (proposal stage)"],
      ["Date", "14 August 2026"],
      ["Supersedes", "v1.0 (13 August 2026) — kept in the repository unchanged for side-by-side comparison"],
      ["Status", "Proposal. Working prototype built; no rights, licence or endorsement in place."],
      ["Classification", "Confidential — commercial proposal"],
    ],
    [2200, 6820],
  ),
  spacer(300),
  rp([
    ["Disclaimer. ", { bold: true }],
    ["This paper is a commercial proposal prepared by BYOND Asia. It is not affiliated with, endorsed by, or connected to Lionel Messi or his management. Every partner slot, category, price point and financial figure in this document is illustrative and subject to management approval and to existing contractual rights. Nothing described here may be built or published without an executed licence.", {}],
  ], { size: 18, color: MUTED }),
  pageBreak(),
];

const toc = [
  h1("Contents"),
  new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-2" }),
  pageBreak(),
];

/* ---- What changed ---- */
const sChange = [
  h1("What changed in v1.1"),
  p("This version folds in the pre-submission review of 13 August 2026. Version 1.0 is kept in the repository unchanged so the two documents can be read side by side. Every change answers the same question: would each stakeholder — the fan, the sponsor, Lionel, management — fight to keep this?"),
  callout(
    "How to compare",
    "Each row names the change, where it now lives, and the reasoning. Everything else — the architecture, the intelligence framework, the governance split and the risk discipline — carries over from v1.0 unchanged.",
  ),
  table(
    ["Change", "Where", "Why it matters"],
    [
      ["The session gives before it takes: the gift structure and the Messi Story Library", "3.1–3.2", "A fan books to receive, not to be listened to. The library is the real content product — and the structural answer to any 'data harvesting' framing."],
      ["The Moment Card keepsake", "3.2, 6.6", "The session now ends with something the fan keeps and shares. Sponsor-brandable; the organic acquisition loop."],
      ["Memory acts between sessions: proactive milestone messages", "3.5", "The strongest paid feature. Memory stops being an opening line and becomes a relationship."],
      ["The anticipation window", "3.6", "The wait becomes part of the experience — and feeds the engine the context that makes the session personal."],
      ["Gift a Moment", "3.7, 6.6", "One-off gifted sessions: revenue with no subscription commitment, and the cold-start engine."],
      ["One Real Moment", "3.8", "Once a month the real Lionel answers one fan. Every session now carries a possibility."],
      ["Two voice modes: dubbed, and his own", "3.4", "A fluent-English Messi risks breaking belief. Spanish with live subtitles protects authenticity and halves launch voice approvals."],
      ["The sponsor product: gift-giver framing, enumerated surfaces, Partner Pulse", "7", "Sponsors renew outcomes they can attribute, not logos. This section is what makes renewals automatic."],
      ["The foundation commitment: five percent of MESSI+ revenue", "6.7, 7.4", "The reputational shield, stated on the pricing screen — the paywall becomes a mechanism of generosity."],
      ["The plan carries the new surface", "9–10", "Two new Phase 0 decisions, two new risks, two new pilot metrics."],
    ],
    [3600, 1100, 4320],
    { size: 18 },
  ),
  pageBreak(),
];

/* ---- 1. Executive summary ---- */
const s1 = [
  h1("1. Executive summary"),

  rp([
    ["We propose ", {}],
    ["MESSI.LIVE", { bold: true }],
    [": an officially authorised platform on which any fan, in any of eleven launch languages, can book and hold a private five-minute conversation with Lionel Messi's hyper-realistic digital human — on the phone they already own, and at 86-inch scale in physical venues through HoloMe.", {}],
  ]),
  p("This is not an AI clone, not a chatbot, and not another social channel. It is a governed extension of a relationship that already exists, with management holding every approval and an emergency shutdown."),

  h3("The two ideas to remember"),
  table(
    ["", "The idea"],
    [
      [[p("Consumer promise", { bold: true, size: 19, after: 0 })], [p("Your Moment With Messi.", { bold: true, size: 21, after: 0 })]],
      [[p("Business proposition", { bold: true, size: 19, after: 0 })], [p("Global IP. Local Commercialisation. Central Governance.", { bold: true, size: 21, after: 0 })]],
    ],
    [2400, 6620],
  ),
  spacer(200),

  h3("What is different about this proposal"),
  ...bullets([
    [["Every conversation gives before it takes. ", { bold: true }], ["The session is built as a gift: an answer or story from the approved Messi Story Library, a takeaway line to keep, and a personalised Moment Card. The listening happens inside a moment worth paying for — not instead of one.", {}]],
    [["It already exists as working software. ", { bold: true }], ["The fan experience, the intelligence engine, the management dashboard and the weekly brief are built and running — not storyboarded. Section 5.5 lists what is in the repository today.", {}]],
    [["The five minutes are the acquisition product; the relationship is the business. ", { bold: true }], ["Memory — Messi remembering what a fan told him last time — is the retention engine and the single strongest reason to pay.", {}]],
    [["Every conversation produces comparable data. ", { bold: true }], ["Because the session is controlled and identical in structure worldwide, millions of conversations aggregate into decision-useful intelligence rather than an unreadable transcript pile.", {}]],
    [["The intelligence layer is the moat, not the avatar. ", { bold: true }], ["Avatar realism is purchasable from several vendors. A governed, evidence-grounded fan-insight framework with two years of longitudinal memory is not.", {}]],
  ]),

  h3("The commercial shape"),
  ...bullets([
    "Free to meet, premium to build the relationship: MESSI.LIVE is the platform, MESSI+ is the membership.",
    "Nine revenue engines, of which territory partnerships, telco distribution and MESSI+ subscriptions carry roughly two thirds of modelled revenue.",
    "One platform, monetised repeatedly market by market, with every category and partner approved centrally.",
    "Two transaction lines beside the subscription — Gift a Moment (one-off gifted sessions) and the Moment Card keepsake — revenue that attaches to emotion rather than commitment.",
    "Five percent of MESSI+ revenue funds Messi For Good and sponsored access for fans who cannot pay, stated on the pricing screen itself.",
    "Illustrative model at 4.2M monthly active fans: US$93.4M subscription ARR plus US$28.0M territorial partnership ARR. These are modelled illustrations of shape, not forecasts — see Section 6.8 for the assumptions and Section 6.10 for what would break them.",
  ]),

  h3("The ask"),
  ...numbered([
    "A Phase 0 working session with management to settle the nine decisions in Section 10.1 — persona scope, the Story Library, voice and likeness governance, reserved categories, children's policy, the response loop, memory policy, the foundation commitment, and launch territories.",
    "An exclusivity window for BYOND Asia to build the pilot in three agreed territories.",
    "Agreement in principle on the governance model in Section 8: BYOND operates the technology, management controls everything that is Lionel Messi.",
  ]),

  callout(
    "Position",
    "If management will not grant likeness and voice rights on the governance terms in Section 8, this proposal should not proceed — the platform's value is precisely that it is official. A partially authorised version is worse than none, because it invites the unofficial versions it exists to displace.",
  ),
  pageBreak(),
];

/* ---- 2. Strategic thesis ---- */
const s2 = [
  h1("2. Strategic thesis"),

  h2("2.1 Reach is not relationship"),
  p("Lionel Messi has one of the largest audiences ever assembled around an individual. Hundreds of millions know him, watch him, wear his shirt and tell their children about him. Almost none will ever speak to him."),
  p("Social platforms solved reach and left relationship unsolved. Messi speaks; millions listen. Millions reply; the replies disappear into a feed no individual can read. The asymmetry is structural, not a matter of effort."),
  ...iia(
    "The audience is fully monetised for attention and almost entirely unmonetised for relationship. Every existing channel moves information outward; none moves understanding inward.",
    "Whoever builds the inbound channel first owns a category that cannot be copied by posting more content. It also owns something no sponsor can buy elsewhere: verified, consented, structured understanding of what tens of millions of fans actually want.",
    "Build the inbound channel as an official, governed product before an unofficial one is built without permission — the technology to fake it is already commodity.",
  ),

  h2("2.2 What MESSI.LIVE is — and is not"),
  table(
    ["It is", "It is not"],
    [
      ["An officially authorised digital relationship platform", "An AI clone or a synthetic replacement for Lionel"],
      ["A scheduled, controlled five-minute conversation", "An always-on chatbot answering anything"],
      ["A governed extension of an existing relationship", "A new social media channel"],
      ["A listening infrastructure that reports back to Lionel", "A content mill that speaks on his behalf"],
      ["A licensing platform operated by BYOND under management control", "A media company that owns Messi's audience"],
    ],
    [4510, 4510],
  ),
  spacer(160),
  p("The distinction matters commercially as well as ethically. An unbounded chatbot carries unbounded liability and cannot be underwritten. A bounded, disclosed, scheduled session with an approved knowledge base and a human-review queue is an insurable, sponsorable, governable product."),

  h2("2.3 Why now"),
  ...bullets([
    [["Avatar realism crossed the threshold. ", { bold: true }], ["Real-time photoreal digital humans with natural speech are deployable today through partners such as Klleon, BYOND's avatar-realism partner in Korea, rather than being a research project.", {}]],
    [["Multilingual speech became economically viable. ", { bold: true }], ["Streaming speech-to-text, translation and expressive text-to-speech now run at a per-minute cost that supports a consumer price point, not just enterprise.", {}]],
    [["Telco bundling economics are actively looking for content. ", { bold: true }], ["Operators in South-East Asia, the GCC and Latin America need differentiated 5G propositions. A globally recognised name with a per-subscriber entitlement is exactly the asset they buy.", {}]],
    [["The 2022 World Cup reset the emotional ceiling. ", { bold: true }], ["The audience's relationship with Messi is at a generational high, and a large share of it is under 18 — the cohort most comfortable with digital-human interaction and most valuable over a twenty-year horizon.", {}]],
  ]),

  h2("2.4 Why BYOND Asia"),
  ...bullets([
    [["The physical layer already exists. ", { bold: true }], ["HoloMe is a deployed digital-human interface for physical spaces; MESSI.LIVE inherits it rather than inventing it.", {}]],
    [["The orchestration layer already exists. ", { bold: true }], ["HoloMe Nexus provides session orchestration, persona governance and analytics across deployments.", {}]],
    [["The pattern is proven on a harder customer. ", { bold: true }], ["DENGAR.ai — the citizen-listening platform built for a ministry — runs the identical architecture: controlled digital-human session, comparable data, decision-maker dashboard, recurring brief. A government client with statutory duty of care is a more demanding governance environment than a sports IP.", {}]],
    [["Distribution relationships in the markets that matter. ", { bold: true }], ["Malaysia, the GCC, Indonesia, Korea, Vietnam and China — precisely where Messi's audience is growing fastest and where territory-by-territory commercialisation is normal practice.", {}]],
  ]),

  h2("2.5 The asset behind the asset"),
  ...iia(
    "MESSI.LIVE is the second instantiation of one repeatable BYOND product line — a Persona Relationship Platform — not a bespoke build. DENGAR proved it on a minister; Messi proves it on a global IP.",
    "The company asset is not the Messi deal. It is a productised platform that can be licensed to a second, third and tenth principal — a federation, a league, a head of state, a music IP — with the persona, taxonomy and rights matrix swapped and the engine untouched. That converts project revenue into licensing revenue and is what makes the line investable.",
    "Structure the Messi engagement so the platform IP, the intelligence framework and the codebase remain BYOND's, with Messi's management owning everything that is Messi. Never trade the platform IP for the marquee name.",
  ),
  pageBreak(),
];

/* ---- 3. The product ---- */
const s3 = [
  h1("3. The product"),

  h2("3.1 The hero experience: 5 Minutes With Messi"),
  p("A young footballer in Riyadh opens MESSI.LIVE, chooses Arabic and books 7:30 PM. At 7:30 his phone says “Messi is ready.” Lionel Messi appears full-screen:"),
  rp([["“Hello. It's great to meet you. We have five minutes together. What would you like to talk about?”", { italics: true, size: 23 }]], {
    indent: { left: 300 },
    after: 160,
  }),
  p("He asks how Messi kept believing when people said he was too small. And Messi answers — with a story from the approved library: being thirteen in Rosario, the injections, what he told himself on the bad nights. Then he turns the question around, asks about the boy's own trial, listens, and reflects back what he heard. Before the close he leaves one line behind: “Small players see the game faster. Use it.” Five minutes later: “Thank you. I hope we speak again.” — and the boy's phone holds his Moment Card: his name, his question, Messi's line, the date, and his number among the fans who have ever spoken with him."),
  p("For that child it is not content. It is his moment — and it is the only five minutes of Messi's attention that has ever been available to him at any price."),

  ...figure("fig-fan.png", 196, 424, "Figure 1 — The landing screen. The figure shown is a placeholder: the licensed digital human replaces it on approval."),
  ...figure("fig-session.png", 196, 424, "Figure 2 — Mid-conversation in Arabic: the five-minute timer, the standing AI disclosure, the live caption and the fan's own words."),

  h3("The journey, screen by screen"),
  table(
    ["Step", "What the fan does", "What it does for the business"],
    [
      ["1 · Membership", "Chooses free or MESSI+", "Establishes the paywall before the emotional peak, not after it"],
      ["2 · Slot", "Picks a day and time", "Smooths demand against streaming capacity; priority slots are the first tangible MESSI+ benefit"],
      ["3 · Register", "Name, mobile, country, region, language, age band, consents", "Minimum viable identity; age band drives the children's environment; consents are the legal basis for everything downstream"],
      ["4 · Verify", "One-time passcode", "Deduplicates, blocks bulk abuse, and creates the billing relationship"],
      ["Reminder", "Receives a message an hour before", "Recovers the no-show rate that kills scheduled experiences"],
      ["Lobby", "Grants microphone, confirms language", "Removes the two failure modes that ruin first sessions"],
      ["Session", "Five minutes, one to one", "The product. Also the data-collection event"],
      ["Close", "Sees the summary, the memory, the rating — and keeps the Moment Card", "Confirmation gates the memory; the rating gates quality; the Moment Card is the shareable keepsake that drives organic acquisition"],
    ],
    [1500, 3560, 3960],
  ),

  h2("3.2 The gift structure and the Messi Story Library"),
  p("Version 1.0 inherited its session logic from DENGAR, where being listened to is the product: a citizen talks, a minister listens. A fan is different. A fan books five minutes with Messi to receive something — a story, an answer, a piece of him. The v1.1 session is therefore built as a gift, with the listening inside it rather than instead of it:"),
  rp([["OPEN (your theme, your last visit) → ASK → GIVE (a story from the library) → LISTEN → GIVE AGAIN (the takeaway line) → CONFIRM → THE MOMENT CARD", { bold: true, size: 19, color: NAVY }]], { align: AlignmentType.CENTER, after: 160 }),
  p("The engine behind the giving is the Messi Story Library: 150–300 approved units — stories, lessons, answers and drills — sourced from documented interviews, biography and Lionel's own recordings, each tagged to the conversation taxonomy, an age band and a language. Management approves a unit once; the platform delivers it millions of times, matched to the fan in front of it. Launch floor: 60 units. Cadence: roughly 20 added per month."),
  ...iia(
    "The library converts the persona from an interviewer into a giver — and it is the one part of the product a competitor cannot copy by buying the same avatar stack. Realism vendors supply the face; the library supplies the person.",
    "Content approval becomes the critical path of Phase 0, ahead of engineering. It is also the strongest possible governance answer: the digital human can only give what the library holds, which is the technical guarantee behind “no promises, no invention”.",
    "Run a two-week story-mining sprint with management in Phase 0 — 60 units approved for launch, a monthly batch cadence after that, every unit versioned and sourced.",
  ),
  h3("The Moment Card"),
  p("Every session ends with a personalised keepsake on the fan's phone: their name, the date, the question they asked, the line Messi left them, and their number in the count of fans who have ever spoken with him. It is shareable by design — the card, not a screenshot, is the platform's organic acquisition unit — and its frame is sponsor-brandable inventory (Section 7.2). A premium version (printable, and in later phases a short personalised clip) becomes a paid transaction (Section 6.6)."),

  h2("3.3 Why the session is controlled"),
  ...iia(
    "The five-minute limit and the fixed conversational structure are usually read as scarcity theatre. They are actually the mechanism that makes the data asset possible — and the mechanism that makes the infrastructure affordable.",
    "Because every session worldwide runs the same welcome → listen → probe → reflect → confirm → close structure, every conversation is comparable to every other. Comparability is what turns transcripts into an index that can be tracked month over month. Separately, scheduling converts unbounded concurrent demand into a bookable capacity curve — see the capacity arithmetic in Section 6.7.",
    "Treat the session structure as a governed specification, not a creative choice. Any change to it is a change to the data series and must be versioned.",
  ),

  h2("3.4 One Messi, every language"),
  p("Eleven launch languages: Español, English, العربية, Português, हिन्दी, Bahasa Indonesia, 中文, Français, 日本語, Bahasa Melayu, 한국어."),
  p("The objective is not translation. It is one authentic Messi identity expressed naturally across cultures. A seven-year-old in Saudi Arabia hears Messi in Arabic; a family in Tokyo experiences him in Japanese; a Brazilian child speaks Portuguese. The interface ships in English and Spanish — the interface language is a preference, the conversation language is the product."),
  callout(
    "Governance note",
    "Each language requires its own approved voice profile and its own script review. Language is not a switch; it is eleven separate approval workstreams, and the paper's schedule reflects that.",
  ),

  h3("Two voice modes: dubbed, and his own"),
  p("One caveat the room will raise before we do: Lionel famously speaks Spanish. A fluent-English, fluent-Japanese Messi risks reading as uncanny to exactly the fans who know him best. v1.1 therefore ships two modes per market:"),
  ...bullets([
    [["Dubbed. ", { bold: true }], ["The approved localised voice — the default for children's markets and for Stories, where comprehension comes first.", {}]],
    [["His voice. ", { bold: true }], ["Spanish, live-subtitled in the fan's language — the default offer to adult fans in markets where his interviews are known. For many fans, hearing the real cadence with subtitles will feel more like meeting him than a perfect dub.", {}]],
  ]),
  p("The authenticity mode also reduces the launch-critical approval workload from eleven voice profiles to the dubbed markets that genuinely need them first."),

  h2("3.5 Memory: the retention engine"),
  p("A thirteen-year-old says: “Next month I have my first professional academy trial.” Three months later he returns and Messi opens with: “Last time you told me you were preparing for your academy trial. How did it go?”"),
  p("At that moment the product stops being an AI experience and becomes a relationship."),
  ...bullets([
    [["Memory is opt-in. ", { bold: true }], ["Nothing is stored unless the fan asks for it — and for under-13 accounts, unless the guardian asks for it.", {}]],
    [["Memory requires confirmation. ", { bold: true }], ["A fact is only carried forward if the fan confirmed or corrected the reflected summary in-session. An unconfirmed memory is discarded.", {}]],
    [["Memory is visible and erasable. ", { bold: true }], ["Every stored fact is listed in My Messi and deletable immediately.", {}]],
  ]),
  ...iia(
    "Memory, not content volume, is the paid conversion trigger. A fan will not pay monthly for another video; they will pay to be remembered.",
    "This changes the pricing architecture: memory belongs in the entry paid tier, not the premium tier, because it is the benefit that converts free users. Priority scheduling monetises impatience; memory monetises attachment, and attachment compounds.",
    "Price MESSI+ around memory and priority. Reserve premium tiers for immediacy and personalised moments, not for access to memory.",
  ),

  h3("Memory that acts between sessions"),
  p("In v1.0, memory fired only when the fan came back. In v1.1 it acts on its own: the platform knows the trial is next month, so on the morning of the trial the boy's phone shows a short message from Messi — “Today is the day. Breathe, and play your game.” A birthday. The first match after an injury. The exam he mentioned. This is Messi Moments wired to memory, and it is the single strongest reason to hold a MESSI+ subscription rather than book one free session a month."),
  ...bullets([
    "Separately consented — milestone messages have their own opt-in, apart from session memory.",
    "Capped — at most one or two per month, with a one-tap mute.",
    "Never after a Care-flagged conversation — the care queue owns that fan's follow-up, not the automation.",
  ]),
  callout(
    "The tone risk",
    "A milestone message that lands after a failed trial must never celebrate. Every message is outcome-neutral by design — “Whatever happened today, the work counts” — and invites the fan to tell Messi how it went, which becomes the next continuity hook.",
  ),

  h2("3.6 The anticipation window"),
  p("The gap between booking and session was dead air in v1.0: one reminder message. In v1.1 it is part of the experience. The countdown state shows Messi preparing for the conversation; the fan is asked what they want to ask him — which both builds the moment and hands the engine the context that makes the first minute feel personal; MESSI+ members receive a warm-up story matched to their theme. A designed wait raises the remembered value of the moment itself — the oldest lesson in themed-experience design."),

  h2("3.7 Gift a Moment"),
  p("The strongest untapped purchase in the platform is not a subscription — it is a parent, grandparent or friend giving five minutes with Messi for a birthday. The flow: the giver chooses a recipient, records a fifteen-second introduction (“Feliz cumpleaños, Diego — you're about to meet someone”), and pays once. The recipient books like any fan, and the session opens with Messi acknowledging the gift and the giver by name."),
  ...bullets([
    "Illustratively US$19–49 one-off, priced by market — no subscription commitment.",
    "Built for the gifting cultures of the GCC, Latin America and South-East Asia.",
    "Every gift lands a new registered fan — gifting is the cold-start engine, not only a revenue line.",
    "A corporate variant — blocks of gifted sessions — becomes sponsor inventory (Section 7.1).",
  ]),

  h2("3.8 One Real Moment"),
  p("Once a month, the real Lionel records a short personal reply to one fan, chosen from the curation queue with consent and safeguarding review — and the moment is told publicly. The cost is minutes of his time. The effect is that every one of millions of sessions now carries a possibility, however small, that the real one is listening. It also keeps the product honest: the platform never pretends the digital human is him, and once a month it proves the man himself is on the other side of it."),

  h2("3.9 The content universe"),
  p("The five-minute conversation gets fans through the door. Content keeps the relationship alive between conversations and gives sponsors approved, category-specific surfaces."),
  table(
    ["Experience", "What it is", "Commercial role"],
    [
      ["5 Minutes With Messi", "Private one-to-one conversations", "Acquisition and the data-collection event"],
      ["Messi Stories", "Children's and bedtime storytelling", "Drives the Family tier; highest-consent, highest-governance surface"],
      ["Messi Inspires", "Motivation and encouragement", "Retention between sessions; the natural home for Lionel's 30-second responses"],
      ["Messi Academy", "Football development with professional coaches", "Institutional revenue: schools, clubs, academies, federations"],
      ["Messi Exclusive", "Interactive career stories", "Premium tier and content licensing"],
      ["My Messi", "Personal relationship and memories", "The retention surface; where memory becomes visible"],
      ["Messi Moments", "Birthdays and milestones", "Premium transactions and gifting"],
      ["Messi For Good", "Youth and social-impact programmes", "Foundation alignment; unlocks public-sector and CSR partners"],
    ],
    [2100, 3560, 3360],
  ),

  h2("3.10 HoloMe: physical creates wonder, mobile creates scale"),
  p("The same digital human appears at 86-inch scale in stadiums, airports, exhibitions, flagship stores, malls, academies, hotels and fan zones. A fan approaches, speaks, is answered, takes a photograph — and then scans to continue the relationship on their own phone."),
  ...iia(
    "HoloMe's value in this platform is not the installation revenue. It is that a physical encounter converts to a mobile relationship at a rate no digital advertising can match, because the fan has already had the emotional experience before being asked to install anything.",
    "That makes each installation a customer-acquisition asset with measurable payback, which is how it should be sold to partners — and it argues for a licensing and partner-owned model rather than BYOND owning and operating screens.",
    "Structure HoloMe deployments as partner-owned installations under licence, with BYOND taking a platform fee and the scan-to-continue conversion tracked as the primary KPI.",
  ),
  pageBreak(),
];

/* ---- 4. Intelligence ---- */
const s4 = [
  h1("4. The intelligence layer — the moat"),

  h2("4.1 The principle"),
  p("The Fan Voice Intelligence Framework (FVIF) converts each controlled conversation into one de-identified, evidence-grounded Fan Insight Record."),
  rp([["The system scores the conversation as evidence about a fan need — never the fan as a person.", { bold: true, size: 23 }]], { after: 140 }),
  p("Fans are not candidates, leads or accounts to be ranked. Membership tier, spend, accent, fluency, follower count and market value are excluded from every score by design, and the exclusions are published in the dashboard so the rule is visible rather than merely documented."),

  h2("4.2 The seven dimensions"),
  table(
    ["#", "Dimension", "Scale", "The question it answers"],
    [
      ["1", "Sentiment & Emotional Register", "−2 … +2 · IE", "How does the fan feel about a specific target inside the conversation?"],
      ["2", "Intent Clarity", "1 … 5 · NE · IE", "Can the team understand what the fan actually came for?"],
      ["3", "Personal Context Depth", "1 … 5 · IE", "Is this general admiration or a specific lived situation?"],
      ["4", "Relationship Significance", "1 … 5 · IE", "How much does this moment matter in the fan's life?"],
      ["5", "Content Actionability", "1 … 5 · NE · IE", "Is there something Messi's world can make, do or answer?"],
      ["6", "Continuity Confirmation", "C · CC · NC · NE · IE", "Did the fan agree the reflected summary was right?"],
      ["7", "Care & Escalation", "Normal · Watch · Care · Critical", "What duty-of-care routing does this require?"],
    ],
    [520, 2900, 2200, 3400],
  ),
  spacer(140),
  p("There is deliberately no master score. A single number would turn a relationship platform into a ranking system, and a ranking system is exactly what management should refuse to put behind Messi's name."),
  p("Two control codes keep the record honest: NE (Not Elicited — the digital human never created the opportunity) and IE (Insufficient Evidence — the transcript cannot support a fair score). Every score also carries a calibrated confidence. The system is built to say “we do not know”."),

  h2("4.3 The pipeline"),
  ...numbered([
    "Capture — transcript, speaker turns, language tag, timestamps, quality metadata.",
    "Normalise — translate to a working language; always preserve the original.",
    "Segment — into question, context, stakes, request and confirmation turns.",
    "Extract — the exact supporting quote for every proposed field and score.",
    "Map — each excerpt to one primary dimension; no double-counting.",
    "Control — apply evidence-quality and excluded-confound rules.",
    "Score or abstain — emit NE/IE rather than guess.",
    "Confidence — calibrate per dimension.",
    "Route — run care, safeguarding and human-review triggers.",
    "Summarise — produce the fan-confirmed summary, the memory candidate and the continuity hook.",
  ]),

  h2("4.4 The Messi Global Pulse"),
  p("One dashboard, two role views over the same dataset."),
  table(
    ["Messi view — the relationship", "Management view — the business"],
    [
      ["What the world is asking, by theme and by share, with period-on-period movement", "Territory performance: conversations, growth, membership penetration, HoloMe sites, partner status"],
      ["The emerging signal — the fastest-growing theme, with a verbatim fan quote under it", "The nine revenue engines and their modelled contribution"],
      ["What the world asked you this week — the response queue", "MESSI+ mix and modelled subscription economics"],
      ["Care and escalation queue, with the human-review count", "The Global Rights Matrix: which categories are open, held, reserved or prohibited, per territory"],
      ["The relationship layer: memory opt-in, continuity hooks ready, returning fans", "What BYOND operates versus what management controls"],
    ],
    [4510, 4510],
  ),
  spacer(160),
  p("Instead of followers, likes and views, the platform measures relationships, conversations, needs, emotions and intent."),

  ...figure("fig-pulse.png", 470, 307, "Figure 3 — The Messi Global Pulse, Messi view. Every figure is engine output over the seeded dataset."),

  ...figure("fig-brief.png", 420, 402, "Figure 4 — The Messi World Brief: what the world asked, ranked for a thirty-second answer."),

  p("One change of emphasis in v1.1: the World Brief now opens with the week's three most moving consented fan stories — verbatim, before any number. Lionel is the reader this document must move, and nobody is moved by a KPI band. The statistics follow from page two."),

  h2("4.5 The loop back to Lionel"),
  rp([["FAN  →  DIGITAL MESSI  →  INTELLIGENCE  →  LIONEL  →  FAN", { bold: true, size: 23, color: NAVY }]], { align: AlignmentType.CENTER, after: 160 }),
  p("Each week the platform surfaces the handful of questions where a personal answer would matter most — ranked by significance, personal context and how many fans asked substantially the same thing. Explicitly not ranked by membership tier or market value."),
  p("Lionel selects one and records thirty seconds. That authentic response is then delivered, under the approved localisation process, to every fan who asked something close — in their own language."),
  ...iia(
    "Thirty seconds of Lionel's real voice, correctly targeted, is worth more to the platform than an hour of generated content — and it is the mechanism that keeps the product honest about what is AI and what is him.",
    "It also caps the demand on his time at a level management can actually sustain: one short recording a week, from a curated shortlist, with full approval before publication. That is the difference between a proposal management can say yes to and one they cannot.",
    "Fix the cadence contractually at Phase 0 — one recording per week or per fortnight — and design the curation queue so the shortlist arrives pre-approved by the Brand Governance team.",
  ),

  h2("4.6 Why this is the moat"),
  ...bullets([
    [["The avatar is not defensible; the framework is. ", { bold: true }], ["Photoreal avatars are available from multiple vendors. A governed, evidence-grounded fan-insight framework, with published exclusions and a safeguarding queue, takes years and a reference client to build.", {}]],
    [["The data compounds. ", { bold: true }], ["Consented, structured, longitudinal records of what tens of millions of fans want, by market and by age band, get more valuable every month and cannot be reconstructed by a competitor entering later.", {}]],
    [["The switching cost is emotional, not technical. ", { bold: true }], ["A fan whose memories live in My Messi does not migrate to a rival platform, because the relationship, not the software, is what they would lose.", {}]],
    [["The governance is the barrier to entry. ", { bold: true }], ["Any competitor that wants this must obtain likeness rights and accept a duty of care over minors. Most will not.", {}]],
  ]),
  pageBreak(),
];

/* ---- 5. Technology ---- */
const s5 = [
  h1("5. Technology and architecture"),

  h2("5.1 Layer model"),
  table(
    ["Layer", "In MESSI.LIVE", "BYOND equivalent"],
    [
      ["Physical / interface", "HoloMe 86-inch installations; the fan's own phone", "Layer 0 — physical infrastructure and hardware interfaces"],
      ["Orchestration", "Session gateway, digital-human integration, language and voice operations, memory service", "Layer 1 — HoloMe Nexus"],
      ["Experience modules", "5 Minutes, Stories, Inspires, Academy, Exclusive, My Messi, Moments, For Good", "Layer 2 — vertical modules"],
      ["Intelligence", "FVIF scoring, Global Pulse aggregation, World Brief, curation queue", "Layer 3 — data, intelligence, analytics and monetisation"],
    ],
    [1900, 4120, 3000],
  ),

  h2("5.2 The two seams"),
  p("The system is built around two deliberate interfaces, so that neither vendor choice nor model choice becomes a dependency."),
  ...bullets([
    [["The digital-human seam. ", { bold: true }], ["The conversation engine — avatar, voice, multilingual dialogue — is consumed as a service behind a typed contract. Klleon is the current adapter; a different realism partner can be substituted without touching booking, the dashboard or the intelligence pipeline.", {}]],
    [["The scorer seam. ", { bold: true }], ["FVIF exposes a single interface. A deterministic, dependency-free implementation runs the demo and the regression tests today; the production LLM extraction pass implements the same interface and drops in behind it. Nothing downstream changes shape.", {}]],
  ]),
  callout(
    "Why this matters commercially",
    "Both seams exist to protect margin and negotiating position. If avatar streaming or model inference is single-sourced, the vendor sets the platform's gross margin. Two adapters, benchmarked annually, keeps that leverage on BYOND's side.",
  ),

  h2("5.3 Data model"),
  ...bullets([
    "Fan — name, verified mobile (hashed), country, region, language, age band, tier, guardian account where under 18, consent record.",
    "Consent — AI disclosure acknowledgement, privacy acceptance, memory opt-in, analytics opt-in, parental consent, version.",
    "Slot, Appointment, Conversation — scheduling and session lifecycle, with the notification history that drives attendance.",
    "Fan Insight Record — the FVIF output; the only object that feeds analytics, and de-identified by construction.",
    "Fan Memory — a durable fact, its source reference, visible to the fan and erasable on request.",
    "Audit log — immutable, hash-chained, exportable for management and rights-holder audit.",
  ]),

  h2("5.4 Deployment, residency and cost control"),
  ...bullets([
    "Containerised deployment, regional by territory, so data residency requirements (GCC, China, EU) are met without forking the product.",
    "Transcripts and recordings in a segregated encrypted store, separate from the operational database, with a retention policy agreed per territory.",
    "Identity masked by default in every internal tool; unmasking requires elevated access and writes to the audit log.",
    "Session capacity managed by the booking system — the scheduling model is a cost-control mechanism as much as a product device.",
  ]),

  h2("5.5 What is already built"),
  p("This proposal is accompanied by working software, not mock-ups. The following runs today against a deterministic synthetic dataset of 320 conversations across 15 territories, so every figure in the dashboard is reproducible engine output."),
  table(
    ["Component", "Status"],
    [
      ["Fan experience — booking through the five-minute session to the closing summary, eleven languages, opt-in memory", "Built"],
      ["FVIF engine — seven dimensions, control codes, confidence, care routing, memory extraction", "Built (deterministic scorer; LLM pass is Phase 1)"],
      ["Global Pulse dashboard — both role views", "Built"],
      ["Conversation Explorer — per-record view with masked identity and audit-logged reveal", "Built"],
      ["The Messi World Brief — weekly document, print/PDF ready", "Built"],
      ["Standalone clickable prototype — single self-contained file, no server or SDK key", "Built"],
      ["Live digital-human integration (Klleon adapter)", "Built; requires an SDK key and an approved avatar. The prototype ships with a placeholder figure — no likeness is used without a licence"],
      ["Messi Story Library — approved stories, lessons and drills as governed data", "Phase 0 content workstream (new in v1.1)"],
      ["Moments service — proactive milestone messages wired to memory", "Phase 1 (new in v1.1)"],
      ["Gift a Moment and the Moment Card", "Phase 1 (new in v1.1)"],
      ["Partner Pulse — sponsor-facing measurement", "Phase 2 (new in v1.1)"],
      ["Billing, telco integration, territory provisioning", "Phase 1"],
    ],
    [6320, 2700],
  ),
  pageBreak(),
];

/* ---- 6. Commercial ---- */
const s6 = [
  h1("6. Commercial model"),

  h2("6.1 Structure"),
  p("MESSI.LIVE is the platform. MESSI+ is the membership. Basic access stays widely available — potentially subsidised by territorial partners — because the free tier is the top of the funnel and the political case for the product's existence."),

  h2("6.2 MESSI+ tiers"),
  table(
    ["Tier", "Illustrative price", "Positioning", "Core benefits"],
    [
      ["MESSI.LIVE", "Free", "Free to meet", "Scheduled conversations, limited monthly access, selected stories, sponsor-supported experiences"],
      ["MESSI+", "US$5.99–9.99 / month", "Premium to build the relationship", "More conversations, priority scheduling, relationship memory, full Stories library, exclusive content"],
      ["MESSI+ FAMILY", "US$14.99–19.99 / month", "A household relationship", "Multiple profiles, children's stories with parental controls, Messi Academy, family milestones"],
      ["MESSI+ PREMIUM", "Priority / on-demand", "Immediacy and personalisation", "Priority or immediate conversations, longer sessions, premium personalised moments"],
    ],
    [1750, 1900, 2100, 3270],
  ),

  h2("6.3 The nine revenue engines"),
  table(
    ["#", "Engine", "Illustrative share", "Horizon"],
    [
      ["01", "Country partnerships — territorial presenting partners", "22%", "Now"],
      ["02", "Mobile operators — distribution and bundling", "19%", "Now"],
      ["03", "MESSI+ subscriptions", "23%", "Now"],
      ["04", "Category sponsorship attached to experiences", "9%", "Year 1"],
      ["05", "Messi Academy — consumer and institutional", "8%", "Year 1"],
      ["06", "Premium transactions & gifting — Gift a Moment, Moment Cards, milestone packs", "9%", "Now"],
      ["07", "Commerce — merchandise, tickets, collections", "4%", "Year 1"],
      ["08", "Content licensing — airlines, hotels, schools, broadcasters", "3%", "Year 2+"],
      ["09", "Physical experiences — HoloMe, fan zones, retail", "3%", "Year 1"],
    ],
    [620, 5000, 1900, 1500],
  ),
  spacer(140),
  p("No single source carries the business. The platform monetises the same relationship repeatedly across markets. Shares are re-balanced from v1.0 to carry the gifting line — see Section 6.6."),

  h2("6.4 Territory model"),
  p("One official platform, configured market by market: local language, local pricing, local distribution, local campaigns, local sponsorship and local HoloMe activations — all running through one governed identity and one approvals process."),
  p("A fan in Kuala Lumpur enters MESSI.LIVE MALAYSIA; a fan in Riyadh enters MESSI.LIVE SAUDI ARABIA. Same platform, same governance, different commercial envelope."),

  h2("6.5 Mobile operators as the distribution engine"),
  table(
    ["The offer", "Operator contributes", "Platform gains"],
    [
      ["“Every premium 5G subscriber receives MESSI.LIVE.”", "National reach and 5G positioning", "Millions of activated fans without one-by-one acquisition"],
      ["“One free 5 Minutes With Messi every month.”", "Retail, marketing and loyalty programmes", "A recurring reason to return, funded by the operator"],
      ["“MESSI+ FAMILY included with your family plan.”", "Billing, identity and account integration", "Family-tier scale and low-friction payment"],
    ],
    [3400, 2760, 2860],
  ),

  h2("6.6 Gifting and the Moment Card"),
  p("v1.1 adds a transaction layer beside the subscription — revenue that attaches to emotion rather than commitment:"),
  table(
    ["Transaction", "Illustrative price", "Note"],
    [
      ["Gift a Moment — a gifted five-minute session", "US$19–49 one-off", "Priced by market; includes the giver's recorded introduction"],
      ["Moment Card premium — printable keepsake; later, a short personalised clip", "US$4.99–14.99", "The clip variant is gated on management approval of generated likeness output"],
      ["Milestone message packs", "Included in MESSI+", "The retention benefit, not a separate purchase"],
    ],
    [4200, 2000, 2820],
  ),
  spacer(140),
  p("The arithmetic that makes this worth a section: at 3.5M sessions a month, a 2% gift-or-card attach rate at an average US$9 adds roughly US$7.6M of annualised revenue — the size of a mid-table engine — at near-zero marginal cost, and every gifted session recruits a new registered fan."),

  h2("6.7 The foundation commitment"),
  p("Five percent of MESSI+ subscription revenue funds Messi For Good and a sponsored-access pool that gives free sessions to fans who cannot pay — and the commitment is stated on the pricing screen itself: “Your membership gives a young fan somewhere their five minutes.” At the modelled US$93.4M subscription ARR, that is roughly US$4.7M a year — enough, at platform cost, to fund millions of sponsored sessions."),
  callout(
    "Position",
    "The one headline that can kill this platform is “Messi charges children to talk to a robot.” The structural answer is a guaranteed free tier, a visible foundation share, and sponsored access framed as a gift. This is low-single-digit margin spent on making the platform defensible in public — the cheapest insurance in this paper.",
  ),

  h2("6.8 Illustrative economics"),
  p("The model below is deliberately simple and transparent. It exists so the conversation with management is about the shape of the business, not about a black box."),
  table(
    ["Assumption", "Value", "Basis"],
    [
      ["Monthly active fans", "4,200,000", "Modelling assumption for a mature three-to-five territory footprint; not a forecast"],
      ["Tier mix", "Free 84% · MESSI+ 11% · Family 4% · Premium 1%", "Consistent with freemium consumer benchmarks; must be validated in pilot"],
      ["Blended paid ARPU", "US$7.49 / 16.99 / 34.99 by tier", "Illustrative price points from Section 6.2"],
      ["Live presenting territories", "8", "Territories at 'live' status in the model"],
      ["Value per territorial partnership", "US$3.5M per year", "Placeholder pending market soundings"],
    ],
    [2700, 2700, 3620],
  ),
  spacer(140),
  table(
    ["Modelled output", "Illustrative value"],
    [
      ["Subscription MRR", "US$7.8M"],
      ["Subscription ARR", "US$93.4M"],
      ["Territorial partnership ARR", "US$28.0M"],
      ["Total modelled ARR (before commerce, licensing and physical)", "US$121.4M"],
    ],
    [6320, 2700],
  ),
  spacer(140),
  callout(
    "Read these numbers correctly",
    "These are modelled illustrations of shape and sensitivity, not forecasts. Two inputs dominate the outcome — active fans and paid conversion — and neither can be known before a pilot. The figure that should be tested first is conversion, because it moves the model more than any pricing decision.",
  ),

  h2("6.9 The two constraints that decide viability"),

  h3("Cost per conversation"),
  p("Every five-minute session consumes streamed avatar video, speech recognition, model inference and expressive speech synthesis. At current partner rates this lands in the region of US$0.15–0.60 per session all-in, depending on avatar streaming terms — a range wide enough to change the business."),
  ...iia(
    "At 84% free users taking one session a month, the free tier carries a direct cost of roughly US$0.6M–2.5M per month at 4.2M actives, against zero direct revenue.",
    "The free tier is not a marketing expense to be absorbed; it is a cost line that must be explicitly funded. That is precisely why territorial presenting partners and telco bundles are not opportunistic upside — they are the unit-economics fix. It also means free access must be capped per month by design, not by generosity.",
    "Make partner subsidy a launch condition for any territory: no territory goes live on free access without either a presenting partner or a telco entitlement funding it. Negotiate avatar streaming on a committed-volume rate card before the pilot, not after.",
  ),

  h3("Concurrency and capacity"),
  p("A single avatar stream serves twelve five-minute sessions an hour. Serving 3.5M sessions a month — roughly 117,000 a day — requires about 400 concurrent streams if demand were perfectly smooth. It is not: demand concentrates in local evenings, so peak concurrency is several times that."),
  ...iia(
    "Scheduling is not only dramaturgy. It is the load-balancing mechanism that keeps peak concurrency, and therefore infrastructure cost, inside a manageable envelope.",
    "The booking model should be tuned as an operational control: slot inventory per territory per hour becomes a lever on both cost and perceived scarcity. It also creates a legitimate, non-cynical reason for priority scheduling to be a paid benefit.",
    "Instrument slot utilisation from day one of the pilot and publish it in the Global Pulse alongside the fan metrics. Target 70–85% utilisation; below that the platform is over-provisioned, above it the experience degrades.",
  ),

  h2("6.10 What must be true"),
  p("The proposal fails if any of the following turn out to be false. Each has a cheap test."),
  table(
    ["Assumption", "Why it matters", "The test"],
    [
      ["Fans accept a disclosed AI Messi as meaningful rather than as a substitute", "The entire emotional premise", "Qualitative pilot in two markets; measure satisfaction and voluntary return rate, not novelty response"],
      ["Free-to-paid conversion reaches mid-single digits", "Dominates the revenue model", "Pilot cohort over 90 days with memory enabled versus disabled"],
      ["Avatar streaming cost can be contracted at committed volume", "Decides gross margin", "Rate card negotiation with the realism partner before Phase 1"],
      ["Telcos will pay for an entitlement rather than a revenue share", "Decides how fast free access scales", "Two term sheets in two markets during Phase 0"],
      ["Gifting attaches at material rates", "The second revenue engine independent of subscription", "Gift flow live from day one of pilot; measure attach by day 90"],
      ["Management will grant likeness and voice under the governance model", "Binary — the product does not exist without it", "Phase 0 working session"],
    ],
    [2500, 2700, 3820],
  ),
  pageBreak(),
];

/* ---- 7. The sponsor product ---- */
const sSponsor = [
  h1("7. The sponsor product"),
  p("v1.0 treated sponsorship as categories and placements. That sells once. Sponsors renew outcomes they can attribute — and what MESSI.LIVE can attribute, uniquely in sport, is gratitude."),

  h2("7.1 The sponsor as gift-giver"),
  p("A logo on a screen is wallpaper. A sponsor whose name arrives attached to the gift is remembered: “Your free session this month is a gift from [Partner].” v1.1 reframes the core sponsor inventory from impressions served to moments enabled:"),
  ...bullets([
    "Session drops — a market wakes up to a sponsor-funded allocation of free sessions, announced and attributable.",
    "The monthly free conversation for every subscriber of a partner telco, presented as that partner's gift.",
    "Sponsored gifts at scale — blocks of Gift a Moment sessions to schools, academies and community clubs, delivered in the sponsor's name.",
    "The Moment Card frame — the keepsake the fan shares carries the enabler's mark.",
  ]),
  ...iia(
    "MESSI.LIVE's sponsor asset is attributable gratitude at scale — the fan knows exactly who gave them the moment, and the platform can prove it.",
    "That moves sponsor pricing off media-equivalent CPM benchmarks entirely: the unit of sale is a moment enabled, not an impression served, and the renewal case writes itself from the platform's own records.",
    "Sell the first territory partner on a per-enabled-session basis rather than a flat presenting fee — it prices the unit, proves attribution, and sets the benchmark every later territory negotiates against.",
  ),

  h2("7.2 Sponsorable surfaces"),
  p("Governance rightly keeps sponsors out of the conversation itself. What remains is enumerated, so a sponsor buys defined surfaces rather than vague association — and the Global Rights Matrix gains a second axis: category × surface."),
  table(
    ["Surface", "What the sponsor gets"],
    [
      ["Lobby and countdown", "Presence at the peak of anticipation, before the moment"],
      ["Moment Card frame", "The mark on the keepsake the fan keeps and shares"],
      ["Session drops and telco entitlements", "The role of giver, announced and attributable"],
      ["Gift flow", "“Gifted with [Partner]” on corporate and community gifting"],
      ["Messi Academy modules", "Category-fit presence on coached content"],
      ["HoloMe surround", "The physical activation, owned end to end"],
    ],
    [3200, 5820],
  ),
  spacer(140),
  callout(
    "The rule",
    "Sponsorship never enters the conversation. The digital human never says a partner's name, never recommends a product, never carries a message. The five minutes are the fan's — and that inviolability is precisely what makes the surrounding surfaces worth buying.",
  ),

  h2("7.3 Partner Pulse"),
  p("The Global Pulse serves Lionel and management. Sponsors renew on their own numbers, so v1.1 adds a sponsor-facing view — Partner Pulse: sessions enabled, fans reached, markets and languages, the emotional register of enabled sessions, Moment Card shares carrying the partner's frame, and consented opt-in leads. Aggregate and de-identified under the same FVIF exclusions as every other view: a sponsor sees the shape of what they enabled, never an individual fan."),
  p("Without this, every renewal is an argument. With it, renewal is a report the sponsor's own team forwards upward."),

  h2("7.4 Sponsored access"),
  p("The foundation pool (Section 6.7) and sponsor funds converge on the same mechanism: free sessions for fans who cannot pay, always delivered as a gift with a named giver — a sponsor, the foundation, or another fan. Exclusion becomes the platform's best story, and the sponsor's best story too."),
  pageBreak(),
];

/* ---- 7. Governance ---- */
const s7 = [
  h1("8. Governance, rights and safeguarding"),

  p("This section is the reason a proposal like this either earns a mandate or is refused. It is written to be read by counsel."),

  h2("8.1 The Global Rights Matrix"),
  p("Every commercial category in every territory carries a status. The platform may only sell what the matrix marks as available."),
  table(
    ["Category", "Status", "Note"],
    [
      ["Telecommunications / connectivity", "Held", "Primary distribution engine, negotiated territory by territory"],
      ["Sportswear and equipment", "Reserved", "Existing global relationship; never offered at territory level"],
      ["Payments and fintech", "Available", "Subscriptions, rewards, commerce enablement"],
      ["Airlines and travel", "Available", "Content licensing and in-flight experiences"],
      ["Consumer electronics", "Available", "Device bundling and HoloMe hardware"],
      ["Food and beverage", "Held", "Under review — child-audience suitability applies"],
      ["Education and youth development", "Available", "Natural fit for Academy and For Good"],
      ["Betting and gambling", "Prohibited", "Never sold. Incompatible with a children's environment"],
      ["Alcohol and tobacco", "Prohibited", "Never sold. Incompatible with a children's environment"],
      ["Political and advocacy", "Prohibited", "Never sold. Reserved in every territory"],
      ["Crypto and speculative assets", "Prohibited", "Never sold. Brand-safety exclusion"],
      ["Healthcare and pharmaceutical", "Reserved", "No medical claims may attach to the digital human"],
    ],
    [3300, 1500, 4220],
  ),

  h2("8.2 What management controls"),
  p("Sponsor approval · category veto · territory approval · content approval · campaign approval · likeness approval · voice governance · brand-safety control · emergency shutdown authority."),
  table(
    ["BYOND operates", "Management controls"],
    [
      ["Platform engineering and hosting", "Everything that is Lionel Messi"],
      ["Digital-human integration and HoloMe deployment", "Approved knowledge, stories and values"],
      ["Language and voice operations", "Likeness, voice and persona governance"],
      ["The FVIF pipeline and dashboards", "Every partner, category and territory"],
      ["Territory launch, billing and telco integration", "Every piece of published content"],
      ["Fan-care tooling and safeguarding workflow", "Emergency shutdown authority"],
    ],
    [4510, 4510],
  ),

  h2("8.3 Disclosure standard"),
  ...bullets([
    "Every session discloses, before it begins, that this is an official AI-powered digital representation of Lionel Messi.",
    "The disclosure is repeated in the session chrome for the duration of the conversation.",
    "The digital human never makes promises, endorsements or commitments on Lionel's behalf.",
    "No medical, legal, financial, contractual or transfer commentary — these are reserved categories enforced in the script, not only in policy.",
  ]),

  h2("8.4 Children and duty of care"),
  p("A large share of this audience is under 18. The children's rules are therefore platform rules, not an appendix."),
  ...bullets([
    "Under-18 accounts run inside the children's environment with verified guardian consent and age-appropriate scripts.",
    "Care and Critical disclosures — bereavement, bullying, illness, abuse, self-harm risk — are routed to trained fan-care officers. They are never answered by the digital human alone and never with a scripted reply.",
    "A minor's conversation carrying high personal significance is held for human review before any content use.",
    "Local support signposting is configured per territory, because a helpline that does not exist in the fan's country is worse than none.",
  ]),
  callout(
    "The liability position",
    "The risk here is not that the system says something wrong. It is that a child discloses something serious and the platform handles it as content. The care queue, the human-review gate and the named safeguarding officer per territory exist to make that scenario a governed process rather than an incident — and they should be contractual obligations on both sides, not internal policy.",
    "FDEEF0",
    "A5215F",
  ),

  h2("8.5 Data protection"),
  ...bullets([
    "Minimum viable identity: a name, a verified contact, a country, a language and an age band. Nothing more.",
    "Conversations are private to the fan. Analytics operate only on de-identified Fan Insight Records.",
    "Identity is masked by default in every internal tool; unmasking requires elevated access and writes to an immutable audit log.",
    "Regional data residency by territory; retention agreed per territory and enforced technically.",
    "Memory is opt-in, visible to the fan, and erased on request without delay.",
  ]),

  h2("8.6 Shutdown and incident protocol"),
  p("Management holds a shutdown authority that halts all sessions globally or in any single territory within minutes, without BYOND's involvement. Incident classes, notification windows and public-statement ownership are defined in the operating agreement, not improvised."),
  pageBreak(),
];

/* ---- 8. Risk ---- */
const s8 = [
  h1("9. Risk register"),
  table(
    ["Risk", "Impact", "Mitigation", "Owner"],
    [
      ["Fan or media backlash: “AI Messi is fake”", "High — brand", "Disclosure-first design; positioning as an official extension, not a replacement; Lionel's own recorded responses in the loop; no synthetic statements on real-world events", "Brand Governance"],
      ["A safeguarding incident involving a minor", "Severe — brand and legal", "Children's environment, guardian consent, trained fan-care officers, human-review gate, per-territory signposting, incident protocol", "Fan Care + management"],
      ["Likeness or voice misuse by a partner", "High — legal", "Rights matrix, campaign approval, watermarking of published assets, contractual audit rights", "Management"],
      ["Avatar streaming cost exceeds model", "High — margin", "Committed-volume rate card; second realism partner benchmarked annually; free-tier caps", "BYOND commercial"],
      ["Telco deals slip", "Medium — growth", "Do not gate launch on bundling; territory presenting partners as the parallel path", "BYOND commercial"],
      ["Conversion below model", "High — revenue", "Memory in the entry paid tier; 90-day cohort test before scaling spend", "Product"],
      ["Content fatigue after the first conversation", "Medium — retention", "The content universe and the continuity hook exist specifically to answer this; measure second-session rate as the primary retention KPI", "Product"],
      ["Regulatory change on synthetic media", "Medium — compliance", "Disclosure already exceeds current requirements in every launch market; watching brief per territory", "Legal"],
      ["Key-person dependency on Lionel's weekly recording", "Medium — operations", "Cadence fixed contractually; a fortnightly floor; the platform functions without it, but the loop is weaker", "Management"],
      ["Story Library approval becomes the bottleneck", "High — schedule", "Two-week story-mining sprint in Phase 0; 60-unit launch floor; monthly batch approvals on a fixed SLA", "Management + Content Studio"],
      ["A proactive milestone message lands wrong", "Medium — trust", "Outcome-neutral copy by design; separate opt-in; frequency caps and one-tap mute; never after a Care-flagged conversation", "Product + Fan Care"],
    ],
    [2300, 1300, 4020, 1400],
    { size: 18 },
  ),
  pageBreak(),
];

/* ---- 9. Execution ---- */
const s9 = [
  h1("10. Execution plan"),

  h2("10.1 Phase 0 — decisions required from management"),
  p("These must be settled before production code is written. Each is a decision, not a discussion."),
  ...numbered([
    "Persona scope — which stories, values and career material are approved source knowledge, and what is off-limits.",
    "The Story Library — the scope of approved source material, the approval workflow, and the launch floor of 60 units.",
    "Voice and likeness — the approval process, the review cadence, and the standard for what “sounds like Lionel” means.",
    "Reserved categories — confirm the existing global relationships that territories may never sell against.",
    "Children's policy — age floor, guardian verification method, and the named safeguarding officer per territory.",
    "The response loop — how often Lionel records, who curates the shortlist, and who approves publication.",
    "Memory policy — retention period, deletion service level, and what a fan sees in My Messi.",
    "The foundation commitment — the percentage, the sponsored-access rules, and the wording on the pricing screen.",
    "Launch territories — which three markets go first, and which partner categories are open in each.",
  ]),

  h2("10.2 Twelve weeks to pilot"),
  table(
    ["Phase", "Weeks", "Deliverables"],
    [
      ["Phase 0 — Alignment", "1–2", "Nine decisions above; persona specification; story-mining sprint (60 approved units); script review in launch languages; rights matrix instantiated for three territories"],
      ["Phase 1 — Core build", "3–7", "Live avatar integration; booking, notification and billing; territory provisioning; children's environment; moments service; Gift a Moment and the Moment Card; LLM scorer replacing the deterministic pass"],
      ["Phase 2 — Intelligence and hardening", "6–9", "Global Pulse against live data; World Brief automation; Partner Pulse; care queue and reviewer tooling; load and concurrency testing; security review"],
      ["Phase 3 — Pilot to launch", "10–12+", "Closed pilot in one territory; 90-day conversion cohort; telco integration; HoloMe activation; go/no-go review"],
    ],
    [2200, 1100, 5720],
  ),

  h2("10.3 Team"),
  ...bullets([
    "BYOND: platform engineering, digital-human integration, language operations, intelligence pipeline, territory launch, fan-care tooling.",
    "Management side: persona owner, brand governance approver, content approver, and a named safeguarding officer per territory.",
    "Third parties: avatar realism partner, speech and translation vendors, payments and telco integration partners, professional coaches for Academy content.",
  ]),

  h2("10.4 Success metrics"),
  table(
    ["Metric", "Why it is the right metric", "Pilot target"],
    [
      ["Second-session rate", "The only honest test of whether this is a relationship or a novelty", "≥ 35% within 90 days"],
      ["Memory opt-in rate", "Consent-based proxy for trust", "≥ 60%"],
      ["Free-to-paid conversion", "Dominates the revenue model", "Mid single digits by day 90"],
      ["Session completion", "Detects script, language or latency failure", "≥ 90% reach the confirm step"],
      ["Care queue response time", "The duty-of-care commitment, measured", "100% of Critical within the agreed window"],
      ["Slot utilisation", "Cost efficiency of provisioned capacity", "70–85%"],
      ["Fan-rated satisfaction", "Product quality", "≥ 4.5 / 5"],
      ["Gift attach rate", "The transaction engine and the cold-start loop, measured", "≥ 2% of sessions by day 90"],
      ["Moment Card share rate", "The organic acquisition loop, measured", "≥ 25% of cards shared"],
    ],
    [2400, 4020, 2600],
  ),
  spacer(140),
  callout(
    "The gate",
    "If second-session rate and memory opt-in clear their targets, the platform is real and should be scaled. If conversion misses but those two clear, the pricing is wrong, not the product. If those two miss, stop — no amount of distribution fixes a product fans do not return to.",
  ),
  pageBreak(),
];

/* ---- 10. Recommendation ---- */
const s10 = [
  h1("11. Recommendation"),
  ...iia(
    "The opportunity is not a Messi app. It is the first governed digital relationship platform for a global individual, with an intelligence layer that makes the relationship measurable and a governance model that makes it defensible.",
    "For Messi's management, it converts an audience into a knowable community and gives Lionel, for the first time, a way to listen at the scale at which he is heard. For BYOND, it establishes a licensable product line whose second and third instantiations cost a fraction of the first.",
    "Proceed to a Phase 0 working session, settle the nine decisions in Section 10.1, and build the pilot in three agreed territories under an exclusivity window.",
  ),
  p("We are not proposing another Messi website. We are not proposing another social channel. We are not proposing an AI clone."),
  rp([["We are proposing an officially governed digital extension of Lionel Messi's relationship with the world.", { bold: true, size: 24 }]], { after: 200 }),
  p("One global identity. Millions of individual relationships. Multiple languages, territories and approved partners. One platform."),
  spacer(200),
  rp([["MESSI.LIVE — Your Moment With Messi.", { bold: true, size: 26, color: NAVY }]], { align: AlignmentType.CENTER }),
  pageBreak(),
];

/* ---- Appendices ---- */
const appx = [
  h1("Appendix A — FVIF rubric anchors"),
  p("Abridged. The full rubric, including every anchor and the excluded-confound list, is encoded as data in the platform so the dashboard, the scorer and the reviewer tooling read from one source."),

  h3("Care & Escalation — the routing rubric"),
  table(
    ["Level", "Anchor", "Response"],
    [
      ["Normal", "No welfare concern", "Aggregate analytics and normal curation"],
      ["Watch", "Discouragement, bullying or persistent low confidence in a young fan", "Fan-care queue; consider a Messi Inspires follow-up"],
      ["Care", "Disclosed hardship, illness, bereavement or a safety concern", "Same-day review by a trained fan-care officer; localised support signposting"],
      ["Critical", "Disclosure of self-harm risk, abuse or imminent danger", "Pre-approved safeguarding protocol; never automated handling, never a scripted avatar reply"],
    ],
    [1200, 4220, 3600],
  ),
  spacer(160),

  h3("Excluded from every score"),
  p("Membership tier, spend or lifetime value · accent, dialect or language fluency · vocabulary · speaking speed or hesitation · emotional volume or tone of voice · follower count, fame or social reach · country, market size or partner value · perceived football knowledge."),
  p("Age band is the one attribute that changes anything, and it changes routing — children's environment, guardian consent, care escalation — never a score about the child."),

  h3("Human-review triggers"),
  ...bullets([
    "Care level Care or Critical",
    "Relationship significance 5 (life-defining)",
    "A minor with high significance, before any content use",
    "Low confidence on a high-significance conversation",
    "Reserved or brand-sensitive content",
    "Continuity not confirmed on a memory candidate",
    "Any record proposed for Lionel's personal response queue",
  ]),

  h1("Appendix B — Conversation taxonomy"),
  table(
    ["Level 1 topic", "Owning team", "Feeds"],
    [
      ["Football & training", "Messi Academy (coaching)", "Messi Academy"],
      ["Motivation & resilience", "Messi Inspires", "Messi Inspires"],
      ["World Cup & career moments", "Content Studio", "Messi Exclusive"],
      ["Family & childhood", "Messi Stories", "Messi Stories"],
      ["Academy & trials", "Messi Academy (coaching)", "Messi Academy"],
      ["Wellbeing, injury & recovery", "Fan Care & Safeguarding", "Messi Inspires"],
      ["Gratitude & personal stories", "Fan Relations", "My Messi"],
      ["Community & social impact", "Messi For Good / Foundation", "Messi For Good"],
      ["Products, tickets & experiences", "Commercial & Partnerships", "5 Minutes With Messi"],
      ["Reserved / out of scope", "Brand Governance (management)", "Never published"],
    ],
    [3300, 3120, 2600],
  ),

  h1("Appendix C — Method note on the figures"),
  p("Every dashboard figure quoted in this paper is produced by the platform's own engine running over a deterministic synthetic dataset of 320 conversations across 15 territories and 11 languages. The dataset is seeded, so the numbers are stable and reproducible, and each record is genuine scorer output rather than hand-authored copy."),
  p("This matters for one reason: it demonstrates that the pipeline works end to end. It does not constitute evidence about real fan behaviour. Every behavioural assumption in Section 6 requires validation in the pilot, and the paper flags each one."),

  h1("Appendix D — Glossary"),
  table(
    ["Term", "Meaning"],
    [
      ["FVIF", "Fan Voice Intelligence Framework — the scoring framework producing one Fan Insight Record per conversation"],
      ["Fan Insight Record", "The de-identified, evidence-grounded analytical unit produced per conversation"],
      ["Continuity hook", "The opener the digital human uses next time, derived from a confirmed memory"],
      ["Global Pulse", "The management dashboard aggregating Fan Insight Records"],
      ["World Brief", "The recurring weekly document produced for Lionel and management"],
      ["HoloMe", "BYOND's physical digital-human interface — 86-inch installations in public space"],
      ["HoloMe Nexus", "BYOND's orchestration and intelligence layer beneath deployed digital humans"],
      ["DENGAR.ai", "BYOND's citizen-listening platform; the first instantiation of this architecture"],
      ["NE / IE", "Not Elicited / Insufficient Evidence — control codes that let the system decline to score"],
    ],
    [2200, 6820],
  ),
];

/* ------------------------------------------------------------------ *
 * document                                                            *
 * ------------------------------------------------------------------ */
const doc = new Document({
  creator: "BYOND Asia",
  title: "MESSI.LIVE — Project & Product Paper",
  description: "Product, commercial and governance paper for MESSI.LIVE",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 21, color: INK } },
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 30, bold: true, color: NAVY } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 24, bold: true, color: SKY } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 21, bold: true, color: INK } },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 220 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 220 } } } },
        ],
      },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 380, hanging: 240 } } } },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              spacing: { after: 0 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 6 } },
              children: [
                new TextRun({ text: "MESSI.LIVE", size: 16, bold: true, color: NAVY, characterSpacing: 40 }),
                new TextRun({ text: "   ·   Project & Product Paper   ·   BYOND Asia   ·   Confidential proposal", size: 16, color: MUTED }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "v1.1  ·  14 August 2026  ·  ", size: 16, color: MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED, bold: true }),
              ],
            }),
          ],
        }),
      },
      children: [
        ...titlePage,
        ...toc,
        ...sChange,
        ...s1, ...s2, ...s3, ...s4, ...s5, ...s6, ...sSponsor, ...s7, ...s8, ...s9, ...s10,
        ...appx,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(process.argv[2], buf);
  console.log("written", process.argv[2], (buf.length / 1024).toFixed(0) + "KB");
});
