const L = require("./lib");
const { p, h1, h2, h3, eyebrow, bullet, numbered, callout, table, spacer, pageBreak } = L;

/* ---------------- section 6: value by stakeholder ---------------- */
const value = [
  eyebrow("Section 6"),
  h1("How this helps L'Oréal"),

  p("The same loop pays off differently depending on where in the organisation you sit. This section is written so each stakeholder can read their own paragraph and recognise their own problem in it."),

  h2("Product and marketing teams"),
  h3("Your launch message actually arrives"),
  p("You write the positioning once and it reaches every advisor in every market unchanged — not a summary of a summary made by someone who saw the deck in March. When you revise a claim, the revision is live in the next coaching session rather than in the next training cycle."),
  p("You also find out which of your claims advisors cannot carry. If nobody in three markets ever repeats your hero claim, that is a message problem you learn about in week two instead of after the launch. Today that signal does not exist at all."),
  callout("The gain",
    "Launch messaging lands intact, and weak claims surface before the launch rather than after it."),

  spacer(160),
  h2("Regulatory and legal"),
  h3("A claim can no longer drift quietly"),
  p("The coach quotes approved wording verbatim and refuses to speak any language pack a market has not signed off. Forbidden wording is scored against explicitly, so an advisor drifting toward treatment or cure language is caught and corrected in rehearsal — not in front of a customer, and not in a complaint file."),
  p("Every pack is versioned and every session is logged. The chain from approved claim to spoken word becomes auditable for the first time, and the approval workflow itself lives in a system rather than in an email thread."),
  callout("The gain",
    "Claim compliance becomes observable and auditable instead of assumed."),

  spacer(160),
  h2("Zone and market leadership"),
  h3("You see readiness before the launch, not after the numbers"),
  p("Sell-out data tells you a launch went badly about a month too late, and it cannot separate a message failure from a stock or pricing failure. Readiness tells you which markets, territories and distributors are cold while you can still act — reallocate coaching, delay a market, or push a distributor."),
  p("Because scoring is division-weighted, a readiness figure means the same thing whether the market is a pharmacy network or a hypermarket chain, so zones become comparable to each other in a way they currently are not."),
  callout("The gain",
    "A leading indicator of launch execution, available weeks ahead of sell-out data."),

  spacer(160),
  h2("Distributors and Learning & Development"),
  h3("Training that scales past the trainer"),
  p("A market trainer can run a handful of sessions a week. The coach runs them in parallel, at any hour, in the advisor's own language, and never tires of the same objection. High-turnover channels stop being the place where launch knowledge goes to die."),
  p("Certification stops meaning attendance. An advisor is certified because they held the approved wording under pressure, with the transcript to show for it — and the same evidence tells the trainer exactly which advisors need a human session rather than another automated one."),
  callout("The gain",
    "Coaching capacity decoupled from headcount, and certification backed by evidence rather than attendance."),

  spacer(160),
  h2("The advisor"),
  h3("Somewhere safe to be wrong"),
  p("A private session where an advisor can fumble the objection three times, in their own language, with nobody watching and no customer lost. The coach corrects gently, hands over the approved sentence, and makes them say it back."),
  p("Advisors who feel prepared sell better and stay longer. It is the least measurable benefit in this document and probably not the smallest."),
  callout("The gain",
    "Confidence at the counter, built by rehearsal rather than by reading."),

  spacer(160),
  h2("The group"),
  h3("A product-knowledge asset that compounds"),
  p("Every launch published into the Nexus stays there — versioned, in every approved language, with its claims, objections and forbidden wording intact. Over two or three years that becomes L'Oréal's structured product-knowledge library: the canonical answer to \"what are we allowed to say about this product, in this market, right now.\""),
  p("That asset outlives the training it was built for. It is the substrate for advisor apps, consumer-facing assistants, retail media compliance checks and internal search. Of everything in this paper, it is the item with the longest payback."),
  callout("The gain",
    "A durable, structured claims library — reusable far beyond coaching."),

  pageBreak(),
];

/* ---------------- section 7: status ---------------- */
const status = [
  eyebrow("Section 7"),
  h1("What is built today"),

  p("This is a working system, not a concept. The following is running end to end and has been verified across every division and language combination."),

  table(
    ["Capability", "State", "Detail"],
    [
      ["Four divisions modelled", "Built",
       "CPD, Luxe, Dermatological Beauty and PPD, each with its own advisor type, coaching guardrail, channel vocabulary and weighted rubric."],
      ["Brand portfolio", "Built",
       "Around 37 international brands mapped to divisions, with division resolved from the product so brands spanning two divisions behave correctly."],
      ["Six languages", "Built",
       "English, French, Arabic, Chinese, Japanese and Hindi. Every catalogue product carries a market-approved pack in every language."],
      ["Digital human", "Built",
       "HoloMe avatar with confirmed voice in all six languages; layout guarantees the coach is never overlapped by interface."],
      ["Speech input", "Built",
       "Whisper transcription with session language pinned and brand vocabulary primed. Requires a service credential to run live."],
      ["Product Nexus", "Built",
       "Upload, version, translate and approve launch packs; per-language governance status controlled by the market reviewer."],
      ["Governed conversation", "Built",
       "Answers only from the published pack; approved claims quoted verbatim; refuses unapproved language packs at a single enforcement point."],
      ["Readiness scoring", "Built",
       "Six dimensions, division-weighted, with verbatim evidence and explicit untested marking."],
      ["HQ dashboard", "Built",
       "Launch readiness rolled up by market, territory, distributor and advisor, wired to live session data."],
      ["Localised product names", "Gap",
       "In the application the product name currently stays English inside a non-English session. Correct for many markets, wrong for North Asia where local names are used. Small schema change; identified, not yet done."],
      ["Scoring engine depth", "Planned",
       "Current scoring is rubric-based. An evaluation model that cites the approved claim as evidence for each score is the next upgrade."],
      ["Zone as a reporting level", "Planned",
       "HQ currently rolls up to market. Adding zone above market lets SAPMENA and North Asia be compared directly."],
    ],
    [2200, 1100, 5726]
  ),

  spacer(200),
  callout("On the sample content",
    "The launch content in the current build is illustrative and written to be plausible, not client-approved. Real claims enter through the Nexus from L'Oréal's own launch materials and are approved by L'Oréal's own reviewers. Nothing in the demonstration should be read as approved L'Oréal wording."),

  pageBreak(),
];

module.exports = { value, status };
