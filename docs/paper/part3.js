const L = require("./lib");
const { p, h1, h2, h3, eyebrow, bullet, numbered, callout, table, spacer, pageBreak } = L;

/* ---------------- section 4: how it works ---------------- */
const architecture = [
  eyebrow("Section 4"),
  h1("How it works: governed by design"),

  p("Most AI assistants are built to be helpful and are then restrained. This one is built the other way round: it starts from what it is forbidden to do, and helpfulness is what is left over. Four architectural decisions carry that."),

  h2("1. The coach cannot make anything up"),
  p("The coach answers only from the published launch pack. Approved claims are quoted verbatim — never paraphrased, never summarised, never re-worded for flow. If the pack does not contain an answer, the coach says so and returns the advisor to what the pack does cover."),
  p("This is deliberately more restrictive than a general assistant, and it is the reason the system can be placed near a regulated claim at all. An AI that improvises beauty advice is a liability in a pharmacy; an AI that can only recite approved wording is an asset."),

  h2("2. Language is governance, not translation"),
  p("This is the single most important design decision in the product, and the one most often got wrong elsewhere."),
  p("An approved claim is a regulatory artifact for one market in one language. Machine-translating it does not produce a translated claim — it produces an unapproved one, generated at runtime, that no reviewer has ever seen. A system that translates on the fly is manufacturing new claims at the exact moment it appears most helpful."),
  p("So launch packs are authored per language and each carries its own governance status:"),

  table(
    ["Status", "Meaning", "What the coach does"],
    [
      ["Source", "The original authored pack — English today.", "Speaks it."],
      ["Market-approved", "Localised and signed off by that market's reviewer inside the Nexus.", "Speaks it."],
      ["Draft", "Translated but not yet approved by the market.", "Refuses the session and names who must approve it."],
    ],
    [1900, 4400, 2726]
  ),

  spacer(200),
  callout("A refusal is the feature, not a failure",
    "Ask for a language a market has not signed off and the coach declines to start, explaining what is missing. This is enforced at a single point in the code rather than scattered across the interface, so there is no path — no button, no URL, no edge case — that opens a coaching session on unapproved wording. Silence is the only safe answer when approved wording does not yet exist."),

  spacer(200),
  h2("3. Four divisions, four definitions of \"ready\""),
  p("A pharmacist and a hypermarket promoter are not the same advisor and must not be graded the same way. Three things vary by division, and one does not:"),

  table(
    ["What varies", "How", "Worked example"],
    [
      ["Rubric weights", "The six dimensions are weighted per division, so the overall score means something different — and correct — in each.",
       "Dermatological Beauty weights Product Accuracy at 1.6× and Upsell Fluency at 0.6×. A pharmacist who upsells beautifully but misstates a clinical claim must fail. Consumer Products inverts it."],
      ["Persona guardrail", "A division-specific rule injected into the coach alongside its standing rules.",
       "Derm: never cross into treatment or cure language. Luxe: hold brand register — the fact alone is not enough. PPD: lead with service protocol before end-benefit."],
      ["Channel vocabulary", "Who the advisor is and where they are standing, so the role-play is the right role-play.",
       "The coach role-plays a pharmacy counter for La Roche-Posay and a salon chair for Kérastase — never a generic \"customer\"."],
      [[{ b: "The approved claim" }], [{ b: "Does not vary. Ever." }],
       "Quoted verbatim from the pack. Never paraphrased, never translated at runtime, never generated. This is the whole point of the product."],
    ],
    [1700, 3300, 4026]
  ),

  spacer(200),
  h2("4. Every score carries its evidence"),
  p("Scores are not opinions. Each dimension cites the advisor's own words back to them, so a manager reading a scorecard sees why the number is what it is, and an advisor disputing a score has something concrete to dispute. Where a session never exercised a dimension — an advisor who was never asked about price cannot be scored on price positioning — the dimension is reported as untested rather than filled in with a plausible number."),
  p("That last rule matters more than it sounds. A system that quietly invents scores for untested dimensions produces a readiness dashboard that looks complete and is partly fiction. HQ would then act on it."),

  h2("Immutable versioning and the audit trail"),
  p("Publishing a launch pack creates a new version rather than overwriting the previous one. Every coaching session records which pack version, in which language, was used. For the first time there is a traceable line between the claim regulatory approved and the words an advisor actually used with a customer."),

  pageBreak(),
];

/* ---------------- section 5: digital human & language ---------------- */
const dhLang = [
  eyebrow("Section 5"),
  h1("The digital human, and the six languages"),

  p("The hero of the product is the coach herself. Everything else on screen is subordinate to that: the interface is constrained to under half the screen and is structurally incapable of overlapping her face — the layout is built as separate bands rather than as overlays, so no card, message or control can be drawn across her."),
  p("This is a design rule, not a preference. An advisor rehearsing a customer conversation is practising eye contact and delivery. A face obscured by a dialogue box turns a rehearsal back into reading a screen."),

  h2("Voice out, voice in"),
  p("HoloMe provides the avatar and her voice; Whisper is how she hears. Both are confirmed across all six coaching languages."),

  table(
    ["Language", "Zone coverage and why it earns a place", "Voice out", "Voice in"],
    [
      ["English",
       "Global HQ, North America, India, South-East Asia. The source language every pack is authored in.",
       "HoloMe ✓", "Whisper ✓"],
      ["Français",
       "Europe, Canada and francophone Sub-Saharan Africa — and the language of the Paris approval chain itself.",
       "HoloMe ✓", "Whisper ✓"],
      ["العربية  Arabic",
       "SAPMENA — Gulf, Levant, North Africa. Pharmacy-heavy, so Dermatological Beauty-critical. Full right-to-left interface.",
       "HoloMe ✓", "Whisper ✓"],
      ["中文  Chinese",
       "North Asia. Among the group's largest markets, and the one with the tightest local advertising-claim enforcement.",
       "HoloMe ✓", "Whisper ✓"],
      ["日本語  Japanese",
       "North Asia. Quasi-drug classification makes exact claim wording legally load-bearing.",
       "HoloMe ✓", "Whisper ✓"],
      ["हिन्दी  Hindi",
       "SAPMENA — India. Mass-channel scale, where promoter turnover is highest.",
       "HoloMe ✓", "Whisper ✓"],
    ],
    [1700, 4626, 1350, 1350]
  ),

  spacer(200),
  h2("Two decisions inside the speech layer worth knowing"),

  h3("The session language is pinned, never detected"),
  p("Speech recognition guesses language from short audio and confuses neighbours — Arabic with Farsi, Hindi with Marathi. Because the transcript becomes scored evidence with a verbatim quote attached, a guess one language off would grade an advisor against a pack they never spoke. The language is therefore taken from the booked session and fixed, not inferred from the audio."),

  h3("A failed transcription returns nothing, not a best guess"),
  p("If the system cannot make out what was said, it says so and asks the advisor to type instead. It never fabricates an utterance in order to have something to score. Speech capture is also push-to-talk rather than automatic: an advisor rehearsing a pitch pauses mid-sentence to think, and automatic cut-off ends the sentence exactly there."),

  p("Transcription is additionally primed with brand and ingredient vocabulary per language. Left untuned, speech recognition renders \"Kérastase\" and \"Effaclar\" as nonsense, which then silently fails claim matching and scores an advisor down for wording they said correctly."),

  pageBreak(),
];

module.exports = { architecture, dhLang };
