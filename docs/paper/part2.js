const L = require("./lib");
const { p, h1, h2, h3, eyebrow, bullet, numbered, callout, table, spacer, pageBreak } = L;

/* ---------------- section 2: the ecosystem ---------------- */
const ecosystem = [
  eyebrow("Section 2"),
  h1("Understanding the ecosystem we are building for"),

  p("Any system that coaches L'Oréal advisors has to start from an uncomfortable fact: L'Oréal is not one training problem. It is four distribution businesses that share a logo. Each sells through a different person, in a different environment, under a different claim regime. A single coaching persona and a single scorecard cannot serve all four, and a product that pretends otherwise will be wrong in three of them."),

  h2("The four divisions"),
  p("L'Oréal reports through four operating divisions. These are not market segments of one business — they are four separate routes to the consumer, with different people standing at the end of each."),

  table(
    ["Division", "Who the advisor actually is", "Claim regime", "What fails first"],
    [
      [[{ b: "Consumer Products", color: L.CPD }, { t: " Mass & drugstore" }],
       "Retail promoter or brand ambassador, often employed by the distributor, working a shelf in a hypermarket or drugstore. Contact measured in seconds.",
       "General cosmetic advertising rules; heavy scrutiny of performance percentages and before/after language.",
       "Over-claiming to close fast; inventing a benefit the pack does not carry."],

      [[{ b: "L'Oréal Luxe", color: L.LUXE }, { t: " Selective & travel retail" }],
       "Counter beauty advisor in a department store, perfumery, boutique or airport — trained, uniformed, working a service ritual.",
       "Cosmetic rules plus tight brand codes: tone, vocabulary and story are as governed as the claim itself.",
       "Off-brand register — the right fact delivered in the wrong voice devalues the product."],

      [[{ b: "Dermatological Beauty", color: L.DERM }, { t: " Pharmacy & medical" }],
       "Pharmacist, pharmacy assistant or clinic staffer, often advising a customer with an actual skin condition, sometimes already on a prescription.",
       "The strictest. Health-adjacent wording, clinical substantiation, and a cosmetic/medicine boundary that moves between markets.",
       "Drifting into treatment or cure language — the one failure with regulatory consequences."],

      [[{ b: "Professional Products", color: L.PPD }, { t: " Salon & stylist" }],
       "Hairdresser or colourist who both uses the product and sells it, and who owns the client relationship outright.",
       "Professional and technical substantiation: process, mixing ratios and service protocol as much as end-benefit.",
       "Technical error in the service, then reciting consumer marketing to a professional peer."],
    ],
    [1900, 2700, 2300, 2126]
  ),

  spacer(200),
  h2("Around 37 brands, each inheriting its division's rules"),
  p("This is the part that breaks a naive build. An advisor never sells \"L'Oréal\" — they sell Kérastase to a salon client or CeraVe to a pharmacy customer. The brand determines the division, and the division determines how the coach must behave. So brand is modelled as a first-class entity that resolves to a division, not as a text label on a product record."),

  table(
    ["Division", "Brands in the model"],
    [
      [[{ b: "CPD", color: L.CPD }],
       "L'Oréal Paris · Garnier · Maybelline New York · NYX Professional Makeup · Essie · Mixa · SoftSheen-Carson (Dark & Lovely) · 3CE Stylenanda · Niely"],
      [[{ b: "Luxe", color: L.LUXE }],
       "Lancôme · Yves Saint Laurent Beauté · Giorgio Armani Beauty · Kiehl's · Biotherm · Helena Rubinstein · Urban Decay · IT Cosmetics · Shu Uemura · Aesop · Prada Beauty · Valentino Beauty · Mugler · Azzaro · Viktor&Rolf · Maison Margiela · Ralph Lauren · Cacharel · Diesel · Atelier Cologne · Takami · Carita"],
      [[{ b: "Derm", color: L.DERM }],
       "La Roche-Posay · Vichy · CeraVe · SkinCeuticals · Skinbetter Science · Dermablend"],
      [[{ b: "PPD", color: L.PPD }],
       "L'Oréal Professionnel · Kérastase · Redken · Matrix · Biolage · Pureology · Mizani · Shu Uemura Art of Hair"],
    ],
    [1100, 7926]
  ),

  spacer(200),
  callout("Why brand alone is not enough — the Shu Uemura case",
    "Shu Uemura makeup is Luxe, sold at a department-store counter. Shu Uemura Art of Hair is Professional Products, sold by a stylist in a salon. Same brand name, two divisions, two advisor types, two vocabularies. The coach therefore resolves division from the product, not from the brand label — which is why it speaks correctly to both."),

  spacer(200),
  h2("Five zones, and why they drive the language list"),
  p("Geographically the divisions run through five reporting zones: Europe, North America, North Asia, SAPMENA-SSA (South Asia Pacific, Middle East, North Africa, Sub-Saharan Africa) and Latin America. A single brand can therefore sit under four different claim regimes in four zones simultaneously."),
  p("The six languages in the build were not chosen for demonstration value. Between them they cover every reporting zone and the three hardest scripts a digital human has to handle — right-to-left, ideographic and Devanagari."),

  pageBreak(),
];

/* ---------------- section 3: the solution ---------------- */
const solution = [
  eyebrow("Section 3"),
  h1("Our solution: the L'Oréal Beauty Coach"),

  p("Beauty Coach is not a chatbot bolted onto a product catalogue. It is a closed loop with four surfaces, each serving a different part of the organisation, connected so that what happens at the shop floor becomes visible at HQ and what HQ learns comes back as coaching."),

  h2("The four surfaces"),
  table(
    ["Surface", "Who uses it", "What it does"],
    [
      ["Product Nexus", "Product and marketing teams",
       "Where a launch enters the system. Upload the product, photography, positioning, hero claims, the objection library and the forbidden wording. Publishing mints an immutable version — content is never edited in place, so there is always a record of what was approved and when."],
      ["The Coach", "Advisors, agents, distributor staff",
       "A digital human booked like an appointment. The advisor signs in with a distributor code that establishes country, territory and distributor, picks the product and their coaching focus, then rehearses out loud and is corrected in the moment."],
      ["Readiness Scorecard", "Advisors and L&D",
       "Six dimensions scored from what the advisor actually said, each carrying the verbatim quote it was scored on. Dimensions the session never exercised are reported as untested rather than guessed at."],
      ["Launch Readiness HQ", "HQ, zone and market leadership",
       "Readiness rolled up by market, territory, distributor and advisor. Which claims land, which get dropped, and which markets are still cold with two weeks to go."],
    ],
    [1900, 2100, 5026]
  ),

  spacer(200),
  h2("The loop"),
  table(
    ["Step", "Stage", "What happens"],
    [
      ["1", "Publish", "The product team publishes a launch into the Nexus. Each market approves its own language pack."],
      ["2", "Book", "An advisor books a session, choosing brand, coaching focus and language."],
      ["3", "Rehearse", "A spoken coaching session against the approved wording — objections, price, routine, positioning."],
      ["4", "Score", "Six dimensions scored with verbatim evidence. The advisor is certified or queued for re-coaching."],
      ["5", "See", "Scores roll up to HQ. Weak markets and distributors feed straight back into the booking queue."],
    ],
    [700, 1500, 6826]
  ),

  spacer(200),
  h2("The six readiness dimensions"),
  p("A single score would hide what matters. Six dimensions separate the failure modes that need different remedies:"),
  bullet([{ b: "Message Fidelity" }, " — did the advisor carry the approved positioning, or their own version of it?"]),
  bullet([{ b: "Product Accuracy" }, " — were the claims stated correctly, and was forbidden wording avoided?"]),
  bullet([{ b: "Brand Tone" }, " — was it said in the register the brand requires?"]),
  bullet([{ b: "Objection Handling" }, " — did the advisor use the approved response under pressure?"]),
  bullet([{ b: "Personalization" }, " — did they adapt to the customer's skin, hair or concern?"]),
  bullet([{ b: "Upsell Fluency" }, " — did they recommend the routine rather than the single product?"]),

  p("These six are weighted differently by division. That weighting is not cosmetic — it is what makes \"ready\" mean the right thing in a pharmacy and in a hypermarket."),

  pageBreak(),
];

module.exports = { ecosystem, solution };
