const L = require("./lib");
const { p, h1, h2, h3, eyebrow, bullet, numbered, callout, table, spacer, pageBreak } = L;

/* ---------------- section 8: deployment ---------------- */
const deployment = [
  eyebrow("Section 8"),
  h1("Deployment and data"),

  h2("How it reaches advisors"),
  p("The coach runs as a web application. There is no app to install, which matters in channels where the device is a shared shop tablet or the advisor's own phone, and where asking a promoter to install anything reduces adoption to near zero."),
  p("Access is by distributor-issued code. That establishes country, territory and distributor at sign-in rather than asking an advisor to type them — which also means the readiness roll-up is accurate without depending on anyone entering their own market correctly."),

  h2("Data residency is a setting, not an afterthought"),
  p("Speech transcription can point either at a hosted service for a pilot, or at a compatible endpoint inside L'Oréal's own network for markets where advisor voice recordings cannot leave the perimeter. The same applies to the pack store and the session log."),
  p("This matters because the system records named staff speaking. Several of the markets in scope treat that as personal data with residency obligations, and a system that can only run in one region would be blocked in exactly the zones with the most advisors."),

  h2("Ownership of the content"),
  p("Launch content enters through the Nexus and belongs to L'Oréal. Packs, versions, approvals and session records are exportable in open formats. There is no scenario in which the coaching library becomes locked inside a vendor's proprietary structure — which is the correct arrangement for an asset intended to outlive any single tool."),

  h2("What BYOND provides"),
  bullet("The platform: coach, Nexus, scorecard and HQ dashboard, with the governed generation layer."),
  bullet("The digital human integration and the multi-language speech layer."),
  bullet("Brand enablement: loading real launch content, configuring divisions and rubrics, and training market reviewers on the approval workflow."),
  bullet("Ongoing operation and the roadmap items listed in Section 7."),

  pageBreak(),
];

/* ---------------- section 9: pilot ---------------- */
const pilot = [
  eyebrow("Section 9"),
  h1("Proposed pilot: one launch, two markets, ninety days"),

  p("The fastest way to prove this is not a broad rollout. It is a single real launch, run properly, in two markets that differ enough to be a genuine test."),

  callout("Recommended shape",
    "One Dermatological Beauty market in SAPMENA and one Consumer Products market in North Asia. That pairing exercises the strictest claim regime and the highest-volume channel at the same time, and covers Arabic and Chinese — two of the three hardest scripts. If either market succeeds, the argument generalises; if the Derm market succeeds, the regulatory argument is settled."),

  spacer(200),
  table(
    ["Phase", "What happens", "What it proves"],
    [
      [[{b:"Weeks 1–3"},{t:"  ·  Load"}],
       "The product team publishes one real launch into the Nexus. Markets translate and approve their language packs. Reviewer roles are assigned.",
       "That the approval workflow fits how L'Oréal actually signs off claims — the single biggest integration risk."],
      [[{b:"Weeks 4–9"},{t:"  ·  Coach"}],
       "Advisors across both markets book and rehearse. Scorecards accumulate. Advisors below threshold are re-coached and re-scored.",
       "That advisors will use it voluntarily, and that scores move with practice rather than staying flat."],
      [[{b:"Weeks 10–13"},{t:"  ·  Read"}],
       "HQ compares readiness against actual launch execution in both markets, by territory and distributor.",
       "Whether readiness predicts execution. This is the number that decides a rollout."],
    ],
    [1600, 3900, 3526]
  ),

  spacer(200),
  h2("What we would measure"),
  table(
    ["Measure", "Why it is the right measure"],
    [
      ["Claim-fidelity rate", "Share of advisors who can carry the hero claim verbatim under objection pressure. The primary outcome — everything else is secondary to whether the message survives."],
      ["Forbidden-wording incidence", "Frequency of prohibited phrasing, before and after coaching. The regulatory outcome, and the one that most directly reduces exposure."],
      ["Time to certification", "How long an advisor takes to reach threshold. The operational outcome — it tells L&D what coaching capacity a launch actually costs."],
      ["Coverage", "Share of the target advisor base that rehearsed at all. The honest test of whether advisors find it useful or merely mandated."],
      ["Readiness vs execution", "Correlation between market readiness score and launch execution. The commercial outcome, and the basis of the rollout decision."],
    ],
    [2200, 6826]
  ),

  spacer(200),
  h2("What we would need from L'Oréal"),
  numbered("One real launch, with its approved claims, objection library and forbidden wording — the content the Nexus is loaded with."),
  numbered("Two markets, with a named sponsor in each and access to their advisor base through the distributor network."),
  numbered("A named approver per market for language packs, with the authority to sign off translated claims."),
  numbered("Agreement on where session and voice data may reside for each market."),
  numbered("Access to launch execution data at the end, so the readiness-versus-execution question can actually be answered."),

  pageBreak(),
];

/* ---------------- section 10: open decisions ---------------- */
const decisions = [
  eyebrow("Section 10"),
  h1("Open decisions"),

  p("These are decisions for L'Oréal, not open technical questions. Each is better settled in week one than discovered in week six."),

  h2("1. Who signs off a language pack"),
  p("The system enforces that somebody approves a translated pack before the coach will speak it. Whether that person is zone regulatory, market legal, or the local brand general manager differs across L'Oréal's zones — and it determines who holds the approver role in the Nexus."),
  p([{ b: "Why it matters: " }, "this is the human bottleneck in the whole loop. If approval takes six weeks, a launch coached in six languages cannot go live on time regardless of how good the software is."]),

  h2("2. Where advisor voice and session data may live"),
  p("Sessions record named staff speaking. Several markets in scope treat that as personal data with residency obligations. The platform supports both hosted and in-network deployment, but the choice is per-market and needs to be made before advisors start recording."),

  h2("3. How readiness is used"),
  p([{ b: "This is the most consequential decision in the paper." }, " Readiness scores can be a coaching tool or a performance-management tool. They cannot easily be both."]),
  p("Used for coaching, advisors will practise honestly, fail safely and improve — and the data will be truthful. Used for performance management, advisors will optimise for the score, rehearse to the rubric, and the readiness dashboard will slowly become fiction that HQ acts on. We would strongly recommend the coaching framing for the pilot and a deliberate decision, later, about whether that ever changes."),

  h2("4. Which launches enter the Nexus"),
  p("Every launch, or only priority launches? Loading everything builds the product-knowledge library faster and makes the Nexus the single source of truth sooner. Loading selectively is less work for the product team in year one. This is a trade between short-term effort and how quickly the compounding asset in Section 6 becomes real."),

  pageBreak(),
];

/* ---------------- appendix ---------------- */
const appendix = [
  eyebrow("Appendix"),
  h1("Reference"),

  h2("A. Glossary"),
  table(
    ["Term", "Meaning in this document"],
    [
      ["Launch pack", "The governed body of knowledge for one product in one language: positioning, approved claims, ingredient story, routine, price positioning, objection library and forbidden wording."],
      ["Approved claim", "Wording cleared by the relevant market for consumer-facing use. Quoted verbatim by the coach and never re-worded."],
      ["Forbidden wording", "Phrases an advisor must not use for a given product — typically claims that would cross a regulatory line."],
      ["Translation status", "Governance state of a language pack: source, market-approved, or draft. Only the first two may be spoken."],
      ["Division", "One of L'Oréal's four operating divisions. Determines advisor type, guardrail and rubric weighting."],
      ["Readiness score", "Weighted result across six dimensions for one coaching session, carrying verbatim evidence."],
      ["Certification threshold", "The readiness score at which an advisor is considered launch-ready for a given product."],
      ["Product Nexus", "The product team's console, and the growing library of L'Oréal product knowledge it produces."],
    ],
    [2100, 6926]
  ),

  spacer(220),
  h2("B. Language and division coverage in the current build"),
  table(
    ["Product", "Division", "Languages available"],
    [
      ["L'Oréal Paris — Revitalift 1.5% Pure Hyaluronic Acid Serum", [{ b: "CPD", color: L.CPD }], "EN · FR · AR · ZH · JA · HI"],
      ["La Roche-Posay — Effaclar Duo+M", [{ b: "Derm", color: L.DERM }], "EN · FR · AR · ZH · JA · HI"],
      ["Lancôme — Advanced Génifique Radiance Serum", [{ b: "Luxe", color: L.LUXE }], "EN · FR · AR · ZH · JA · HI"],
      ["Kérastase — Gloss Absolu Shine Ritual", [{ b: "PPD", color: L.PPD }], "EN · FR · AR · ZH · JA · HI"],
      ["Maybelline New York — Lash Sensational Sky High", [{ b: "CPD", color: L.CPD }], "EN · FR · AR · ZH · JA · HI"],
    ],
    [4300, 1300, 3426]
  ),

  spacer(200),
  p("Sample content for demonstration. Production content is loaded from L'Oréal launch materials through the Nexus and approved by L'Oréal reviewers.",
    { size: 18, color: L.MUTE }),

  spacer(220),
  h2("C. Sources and confidence"),
  p("Division structure, the brand portfolio and channel descriptions in this paper reflect L'Oréal's public reporting. Characterisations of claim regimes by division and market are directional, based on how cosmetic and health-adjacent advertising is generally regulated in those channels, and should be confirmed with L'Oréal regulatory before being relied upon commercially."),
  p("All statements about what the platform does today describe behaviour that has been built and verified. Items marked as gaps or planned in Section 7 have not been built."),
];

module.exports = { deployment, pilot, decisions, appendix };
