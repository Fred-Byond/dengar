/**
 * Launch-readiness scoring dimensions — the six from the HoloMe Beauty Coach
 * proposal, replacing CVIF's seven citizen-sentiment dimensions while keeping
 * its architecture: rubric anchors as data, confidence codes, mandatory
 * evidence quotes, and NE/IE abstention instead of fabricated scores.
 */

export interface ReadinessDimension {
  id: string;
  label: string;
  description: string;
  anchorHigh: string;
  anchorLow: string;
}

export const READINESS_DIMENSIONS: ReadinessDimension[] = [
  {
    id: "product-accuracy",
    label: "Product Accuracy",
    description: "Facts stated about the product are correct per the pack.",
    anchorHigh: "Ingredients, concentrations and usage stated exactly as approved.",
    anchorLow: "Invented or incorrect facts about the product.",
  },
  {
    id: "message-fidelity",
    label: "Message Fidelity",
    description: "Advisor's phrasing matches the approved claim wording.",
    anchorHigh: "Uses approved claim phrases naturally and completely.",
    anchorLow: "Paraphrases that lose or distort the approved claims.",
  },
  {
    id: "brand-tone",
    label: "Brand Tone",
    description: "Warm, professional, on-brand; avoids forbidden wording.",
    anchorHigh: "Consistently brand-professional; nothing from the do-not-say list.",
    anchorLow: "Off-brand language or forbidden claims used.",
  },
  {
    id: "objection-handling",
    label: "Objection Handling",
    description: "Responds to objections with the approved response library.",
    anchorHigh: "Handles objections confidently with approved responses.",
    anchorLow: "Concedes or improvises off-pack answers to objections.",
  },
  {
    id: "personalization",
    label: "Personalization",
    description: "Adapts advice to the customer's skin/hair type and concerns.",
    anchorHigh: "References customer context (skin type, concern, routine).",
    anchorLow: "Generic pitch with no customer adaptation.",
  },
  {
    id: "upsell-fluency",
    label: "Upsell Fluency",
    description: "Recommends the routine, not just the product.",
    anchorHigh: "Naturally pairs companion products into a routine.",
    anchorLow: "Never mentions routine completion or companions.",
  },
];
