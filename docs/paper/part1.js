const L = require("./lib");
const { d, p, h1, h2, h3, eyebrow, bullet, numbered, callout, table, spacer, pageBreak, W } = L;
const { Paragraph, TextRun, AlignmentType, BorderStyle } = d;

/* ---------------- cover ---------------- */
const cover = [
  new Paragraph({ spacing: { before: 1400, after: 0 },
    children: [new TextRun({ text: "BYOND ASIA", bold: true, size: 20, color: L.GOLD,
      font: "Calibri", characterSpacing: 160 })] }),
  new Paragraph({ spacing: { before: 40, after: 520 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: L.GOLD_L, space: 8 } },
    children: [new TextRun({ text: "Project Paper", size: 19, color: L.MUTE, font: "Calibri" })] }),

  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: "L'Oréal Beauty Coach", bold: true, size: 60,
      color: L.INK, font: "Georgia" })] }),
  new Paragraph({ spacing: { after: 340 },
    children: [new TextRun({ text: "An AI digital-human coaching platform for the L'Oréal advisor network",
      size: 26, color: L.MUTE, font: "Georgia", italics: true })] }),

  p("Making sure a new launch message reaches the consumer intact — in every division, every market and every language — and proving that it did.",
    { size: 23, after: 520 }),

  table(
    ["", ""],
    [
      ["Prepared for", "L'Oréal — Brand Enablement, Regulatory and Zone leadership"],
      ["Prepared by", "BYOND Asia"],
      ["Document purpose", "Shared reference for the BYOND project team and L'Oréal stakeholders"],
      ["Status of the build", "Working system — four divisions, six languages, running end to end"],
      ["Version", "1.0"],
    ],
    [2400, 6626]
  ),

  spacer(300),
  p("This paper describes what the product is, the problem it solves, how it works, what it delivers to each part of the L'Oréal organisation, and what we propose as a pilot. It is written to be read by commercial, technical and regulatory readers alike.",
    { size: 19, color: L.MUTE }),

  pageBreak(),
];

/* ---------------- executive summary ---------------- */
const exec = [
  eyebrow("Executive summary"),
  h1("In one page"),

  p([{ b: "The problem." }, " L'Oréal writes a product claim once — in one language, cleared by legal for one market. By the time a consumer hears it, that claim has passed through zone, market, distributor and a beauty advisor standing at a shelf, usually in a different language than it was written in. Every one of those hops is a re-telling, and every re-telling is an unlogged opportunity for the message to drift. Today that drift is invisible: nobody can point to where a claim mutated, and nobody can prove it didn't."]),

  p([{ b: "Why training does not close it." }, " A launch deck read once in a ballroom is not evidence. A quiz score is not proof that an advisor can hold approved wording under pressure from a real customer asking a real objection. And a market trainer can only be in one room at a time, while advisor turnover in mass channels is high enough to erase a launch briefing within a season."]),

  p([{ b: "Our solution." }, " The L'Oréal Beauty Coach is a closed loop, not a chatbot. The product team publishes a launch into a governed knowledge base. Advisors book an appointment and rehearse it out loud against an AI digital human — objections, price, routine — in their own language. Every rehearsal is scored against six dimensions with the advisor's own words quoted as evidence. Those scores roll up to HQ by market, territory and distributor, and weak markets feed straight back into re-coaching."]),

  p([{ b: "The design decision everything follows from." }, " The coach cannot make anything up. It answers only from the published launch pack and quotes approved claims verbatim — never paraphrased, never summarised, never machine-translated at runtime. Where a market has not approved wording in a language, the coach refuses to run the session and says who must approve it. That refusal is the product working correctly; it is what makes a generative system safe to put near a regulated claim."]),

  h2("What is already built"),
  bullet("All four L'Oréal divisions modelled — Consumer Products, Luxe, Dermatological Beauty and Professional Products — each with its own advisor type, coaching guardrail and weighted scoring rubric."),
  bullet("Around 37 international brands mapped to their divisions, with division resolved from the product rather than the brand name."),
  bullet("Six languages live end to end: English, French, Arabic, Chinese, Japanese and Hindi. Every catalogue product is coachable in every one of them."),
  bullet("The digital human speaks all six languages (HoloMe) and hears all six (Whisper), with full right-to-left support for Arabic."),
  bullet("Four working surfaces: the Product Nexus, the Coach, the Readiness Scorecard and the Launch Readiness HQ dashboard."),

  h2("What we propose"),
  p("A ninety-day pilot on one real launch across two deliberately different markets — one Dermatological Beauty market in SAPMENA and one Consumer Products market in North Asia — so the strictest claim regime and the highest-volume channel are both exercised. The question the pilot answers is narrow and testable: does readiness predict launch execution?"),

  pageBreak(),
];

/* ---------------- section 1: the problem ---------------- */
const problem = [
  eyebrow("Section 1"),
  h1("The problem: a message that nobody can follow"),

  p("Every consumer-facing claim L'Oréal makes begins life as a controlled artifact. It is written, substantiated, reviewed and approved — for a specific market, under a specific regulatory regime, in a specific language. That control is real and it is expensive to produce."),

  p("It is also where the control ends."),

  h2("Five hops, none of them observable"),
  p("From the moment the claim leaves the approval file, it travels by re-telling:"),

  table(
    ["Hop", "What happens to the message"],
    [
      ["HQ → Zone", "Compressed into a launch deck; nuance and hedging language start to thin"],
      ["Zone → Market", "Adapted to local priorities; often translated informally at this point"],
      ["Market → Distributor", "Retold in a briefing, usually by someone who was not in the original session"],
      ["Distributor → Advisor", "Retold again, frequently second-hand and often months later"],
      ["Advisor → Consumer", "Improvised live, under time pressure, against an objection nobody rehearsed"],
    ],
    [2400, 6626]
  ),

  spacer(160),
  p("Each hop is reasonable in isolation. Together they form a chain in which the original wording is never checked again. A percentage gets rounded up. A hedge — \"helps reduce\" — hardens into a promise. A cosmetic benefit drifts into medical language. None of it is malicious; all of it is invisible."),

  callout("The core insight",
    "The message-consistency brief is really a claims-governance problem. Because approved wording is a regulatory artifact and not marketing copy, the risk is not that advisors forget the message — it is that nothing between HQ and the shop floor is observable."),

  spacer(160),
  h2("Three consequences L'Oréal is carrying today"),

  h3("1. Regulatory exposure that cannot be located"),
  p("If a market regulator queries what an advisor told a consumer, there is no record. The organisation can produce the approved claim and the training deck, but nothing that connects them to the words actually spoken at a counter. In Dermatological Beauty — where the line between a cosmetic and a medicinal claim is legally sharp and varies by market — that gap is the most expensive one on this list."),

  h3("2. Launch performance that is diagnosed too late"),
  p("Sell-out data tells you a launch underperformed roughly a month after you could have done anything about it, and it does not tell you why. A market that missed its number because the message never landed looks identical, in the data, to a market that missed it because of stock or pricing."),

  h3("3. Training capacity that cannot scale"),
  p("Coaching quality is bounded by trainer headcount. A market trainer runs a handful of sessions a week; advisor turnover in mass channels routinely exceeds that. The result is a structural gap between the number of people who need launch knowledge and the number who can be given it properly — and the gap is widest in exactly the channels with the highest consumer contact."),

  h2("What good would look like"),
  p("Three things, none of which exist today:"),
  numbered("Every advisor rehearses the launch out loud, in their own language, before they meet a customer — not once as a group, but as often as they need."),
  numbered("Every rehearsal produces evidence: what the advisor actually said, measured against the approved wording, with the quote attached."),
  numbered("HQ can see readiness by market before the launch goes live, and act on it while acting still matters."),

  pageBreak(),
];

module.exports = { cover, exec, problem };
