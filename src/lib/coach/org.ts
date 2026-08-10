/**
 * L'Oréal group structure — divisions, brands and channels.
 *
 * The group is not one training problem; it is four. Each division sells
 * through different channels, to different advisor types, under different
 * claim-regulation regimes. The coach persona, rubric weighting and pack
 * frame all key off the division, so a single platform serves the whole
 * group without flattening those differences.
 *
 * Brand roster reflects L'Oréal's public portfolio (~40 international
 * brands). Extend per deployment; nothing here is hardcoded downstream.
 */

export type DivisionId = "cpd" | "luxe" | "derm" | "ppd";

export type ChannelId =
  | "mass-retail"
  | "department-store"
  | "pharmacy"
  | "salon"
  | "travel-retail"
  | "brand-boutique"
  | "e-commerce";

export interface Division {
  id: DivisionId;
  name: string;
  shortName: string;
  /** Who the coach is actually training in this division. */
  advisorType: string;
  channels: ChannelId[];
  /** What "good" means here — drives rubric weighting and coach tone. */
  coachEmphasis: string;
  /** Division-specific guardrail added to the persona. */
  guardrail: string;
  /** Relative rubric weights; keys are readiness dimension ids. */
  weights: Record<string, number>;
}

export const CHANNELS: Record<ChannelId, string> = {
  "mass-retail": "Mass retail / hypermarket",
  "department-store": "Department store counter",
  pharmacy: "Pharmacy / drugstore",
  salon: "Salon",
  "travel-retail": "Travel retail",
  "brand-boutique": "Brand boutique",
  "e-commerce": "E-commerce / live selling",
};

export const DIVISIONS: Division[] = [
  {
    id: "cpd",
    name: "Consumer Products Division",
    shortName: "Consumer",
    advisorType: "In-store promoter / retail staff (often third-party)",
    channels: ["mass-retail", "e-commerce", "travel-retail"],
    coachEmphasis:
      "Speed and message fidelity. High staff turnover means the launch message must land in one short session.",
    guardrail:
      "Keep answers short and repeatable — this advisor has seconds with a shopper in a busy aisle. Prioritise the hero claim and one routine step over depth.",
    weights: {
      "message-fidelity": 1.4,
      "product-accuracy": 1.2,
      "brand-tone": 0.8,
      "objection-handling": 1.0,
      personalization: 0.8,
      "upsell-fluency": 1.0,
    },
  },
  {
    id: "luxe",
    name: "L'Oréal Luxe",
    shortName: "Luxe",
    advisorType: "Beauty Advisor at counter / boutique / travel retail",
    channels: [
      "department-store",
      "brand-boutique",
      "travel-retail",
      "e-commerce",
    ],
    coachEmphasis:
      "Service ritual and personalisation. The advisor sells an experience and a diagnosis, not a fact sheet.",
    guardrail:
      "Coach the service ritual: greet, diagnose the customer's skin or scent preference, then recommend. Reward personalised recommendation over recitation.",
    weights: {
      "message-fidelity": 1.0,
      "product-accuracy": 1.0,
      "brand-tone": 1.3,
      "objection-handling": 1.0,
      personalization: 1.4,
      "upsell-fluency": 1.2,
    },
  },
  {
    id: "derm",
    name: "Dermatological Beauty",
    shortName: "Derm Beauty",
    advisorType: "Pharmacist / pharmacy assistant / medi-spa staff",
    channels: ["pharmacy", "e-commerce"],
    coachEmphasis:
      "Clinical accuracy above all. Claims are regulated; a wrong ingredient statement is a compliance incident, not a missed sale.",
    guardrail:
      "Be precise and clinical. Never soften or embellish a claim, never imply medical treatment, and always state concentrations and tolerance data exactly as approved.",
    weights: {
      "message-fidelity": 1.3,
      "product-accuracy": 1.6,
      "brand-tone": 0.9,
      "objection-handling": 1.1,
      personalization: 1.1,
      "upsell-fluency": 0.6,
    },
  },
  {
    id: "ppd",
    name: "Professional Products Division",
    shortName: "Professional",
    advisorType: "Hairdresser / colourist / salon owner",
    channels: ["salon", "e-commerce"],
    coachEmphasis:
      "Technical protocol plus retail confidence. The stylist must perform the service correctly and recommend take-home product.",
    guardrail:
      "Coach the technical protocol first (mixing ratio, processing time, sequence), then the retail recommendation the stylist makes at the chair.",
    weights: {
      "message-fidelity": 1.0,
      "product-accuracy": 1.4,
      "brand-tone": 0.9,
      "objection-handling": 1.0,
      personalization: 1.0,
      "upsell-fluency": 1.4,
    },
  },
];

export interface Brand {
  id: string;
  name: string;
  divisionId: DivisionId;
}

/** The international brand portfolio, grouped by division. */
export const BRANDS: Brand[] = [
  // Consumer Products
  { id: "loreal-paris", name: "L'Oréal Paris", divisionId: "cpd" },
  { id: "garnier", name: "Garnier", divisionId: "cpd" },
  { id: "maybelline", name: "Maybelline New York", divisionId: "cpd" },
  { id: "nyx", name: "NYX Professional Makeup", divisionId: "cpd" },
  { id: "essie", name: "Essie", divisionId: "cpd" },
  { id: "mixa", name: "Mixa", divisionId: "cpd" },
  { id: "dark-and-lovely", name: "Dark & Lovely", divisionId: "cpd" },
  { id: "3ce", name: "3CE / Stylenanda", divisionId: "cpd" },
  // Luxe
  { id: "lancome", name: "Lancôme", divisionId: "luxe" },
  { id: "ysl-beauty", name: "Yves Saint Laurent Beauté", divisionId: "luxe" },
  { id: "armani-beauty", name: "Giorgio Armani Beauty", divisionId: "luxe" },
  { id: "kiehls", name: "Kiehl's", divisionId: "luxe" },
  { id: "prada-beauty", name: "Prada Beauty", divisionId: "luxe" },
  { id: "valentino-beauty", name: "Valentino Beauty", divisionId: "luxe" },
  { id: "maison-margiela", name: "Maison Margiela Fragrances", divisionId: "luxe" },
  { id: "mugler", name: "Mugler", divisionId: "luxe" },
  { id: "aesop", name: "Aesop", divisionId: "luxe" },
  { id: "helena-rubinstein", name: "Helena Rubinstein", divisionId: "luxe" },
  { id: "shu-uemura", name: "Shu Uemura", divisionId: "luxe" },
  { id: "biotherm", name: "Biotherm", divisionId: "luxe" },
  { id: "urban-decay", name: "Urban Decay", divisionId: "luxe" },
  { id: "it-cosmetics", name: "IT Cosmetics", divisionId: "luxe" },
  { id: "takami", name: "Takami", divisionId: "luxe" },
  // Dermatological Beauty
  { id: "la-roche-posay", name: "La Roche-Posay", divisionId: "derm" },
  { id: "vichy", name: "Vichy", divisionId: "derm" },
  { id: "cerave", name: "CeraVe", divisionId: "derm" },
  { id: "skinceuticals", name: "SkinCeuticals", divisionId: "derm" },
  { id: "skinbetter", name: "Skinbetter Science", divisionId: "derm" },
  { id: "dermablend", name: "Dermablend", divisionId: "derm" },
  // Professional Products
  { id: "loreal-professionnel", name: "L'Oréal Professionnel", divisionId: "ppd" },
  { id: "kerastase", name: "Kérastase", divisionId: "ppd" },
  { id: "redken", name: "Redken", divisionId: "ppd" },
  { id: "matrix", name: "Matrix", divisionId: "ppd" },
  { id: "pureology", name: "Pureology", divisionId: "ppd" },
  { id: "shu-art-of-hair", name: "Shu Uemura Art of Hair", divisionId: "ppd" },
  { id: "pulp-riot", name: "Pulp Riot", divisionId: "ppd" },
];

export function getDivision(id: string): Division | null {
  return DIVISIONS.find((d) => d.id === id) ?? null;
}
export function getBrand(id: string): Brand | null {
  return BRANDS.find((b) => b.id === id) ?? null;
}
export function brandsByDivision(divisionId: DivisionId): Brand[] {
  return BRANDS.filter((b) => b.divisionId === divisionId);
}
