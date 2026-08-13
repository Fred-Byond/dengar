/**
 * MESSI.LIVE commercial model — slides 15–19.
 *
 * "Global IP. Local Commercialisation. Central Governance."
 *
 * Everything here is an illustrative model for the management conversation:
 * no partner is named, all pricing is illustrative, and every commercial slot
 * is expressed as a category that management approves, holds or vetoes.
 */

import type { MembershipTier } from "./fvif";

/* ------------------------------------------------------------------ *
 * MESSI+ — the membership layer                                       *
 * ------------------------------------------------------------------ */

export interface TierDefinition {
  id: MembershipTier;
  name: string;
  /** Illustrative global price band. Territories set local pricing. */
  price: string;
  positioning: string;
  benefits: string[];
  /** Illustrative share of the active base, used by the demo model. */
  mixPct: number;
  /** Illustrative monthly ARPU in US$ for the revenue model. */
  arpu: number;
}

export const TIERS: TierDefinition[] = [
  {
    id: "free",
    name: "MESSI.LIVE",
    price: "Free",
    positioning: "Free to meet. Widely available, potentially subsidised by territorial partners.",
    benefits: [
      "Scheduled conversations",
      "Limited monthly access",
      "Selected Messi Stories",
      "Public Messi Inspires content",
      "Sponsor-supported experiences",
    ],
    mixPct: 84,
    arpu: 0,
  },
  {
    id: "plus",
    name: "MESSI+",
    price: "US$5.99–9.99 / month",
    positioning: "Premium to build the relationship.",
    benefits: [
      "More conversations each month",
      "Priority scheduling",
      "Relationship memory (My Messi)",
      "Full Messi Stories library",
      "Messi Inspires personalised encouragement",
      "Exclusive career content",
    ],
    mixPct: 11,
    arpu: 7.49,
  },
  {
    id: "family",
    name: "MESSI+ FAMILY",
    price: "US$14.99–19.99 / month",
    positioning: "A household relationship, built around children.",
    benefits: [
      "Multiple profiles",
      "Children's stories with parental controls",
      "Messi Academy for young players",
      "Family experiences and milestones",
    ],
    mixPct: 4,
    arpu: 16.99,
  },
  {
    id: "premium",
    name: "MESSI+ PREMIUM",
    price: "Priority / on-demand",
    positioning: "Immediate access and premium personalised moments.",
    benefits: [
      "Priority or immediate conversations",
      "Longer sessions",
      "Premium personalised experiences",
      "Exclusive content and privileges",
    ],
    mixPct: 1,
    arpu: 34.99,
  },
];

export const TIER_BY_ID: Record<string, TierDefinition> = Object.fromEntries(
  TIERS.map((t) => [t.id, t]),
);

export function tierLabel(id: MembershipTier): string {
  return TIER_BY_ID[id]?.name ?? "MESSI.LIVE";
}

/* ------------------------------------------------------------------ *
 * The nine revenue engines (slide 18)                                 *
 * ------------------------------------------------------------------ */

export interface RevenueEngine {
  no: string;
  name: string;
  description: string;
  /** Illustrative share of modelled annual revenue at scale. */
  sharePct: number;
  /** How quickly it can be switched on. */
  horizon: "Now" | "Year 1" | "Year 2+";
}

export const REVENUE_ENGINES: RevenueEngine[] = [
  { no: "01", name: "Country partnerships", description: "Territorial presenting partners, one per market, approved category by category.", sharePct: 22, horizon: "Now" },
  { no: "02", name: "Mobile operators", description: "Distribution, bundling and connectivity partnerships — the B2B2C engine.", sharePct: 19, horizon: "Now" },
  { no: "03", name: "MESSI+ subscriptions", description: "Individual, Family and Premium memberships.", sharePct: 24, horizon: "Now" },
  { no: "04", name: "Category sponsorship", description: "Approved partners attached to specific experiences, never to Lionel directly.", sharePct: 9, horizon: "Year 1" },
  { no: "05", name: "Messi Academy", description: "Consumer programmes plus schools, clubs, academies and youth institutions.", sharePct: 8, horizon: "Year 1" },
  { no: "06", name: "Premium transactions", description: "Priority conversations, personalised moments and special experiences.", sharePct: 6, horizon: "Now" },
  { no: "07", name: "Commerce", description: "Merchandise, tickets and official collections attached to the moment.", sharePct: 5, horizon: "Year 1" },
  { no: "08", name: "Content licensing", description: "Airlines, hotels, schools, museums, broadcasters and platforms.", sharePct: 4, horizon: "Year 2+" },
  { no: "09", name: "Physical experiences", description: "HoloMe installations, fan zones, retail and exhibitions.", sharePct: 3, horizon: "Year 1" },
];

/* ------------------------------------------------------------------ *
 * The Global Rights Matrix (slide 19)                                 *
 * ------------------------------------------------------------------ */

export type CategoryStatus = "available" | "held" | "reserved" | "prohibited";

export interface RightsCategory {
  category: string;
  status: CategoryStatus;
  note: string;
}

/**
 * The categories management controls per territory. "Reserved" means an
 * existing Messi commercial relationship owns the category and MESSI.LIVE must
 * not sell it; "prohibited" means the category is never sold on this platform.
 */
export const RIGHTS_CATEGORIES: RightsCategory[] = [
  { category: "Telecommunications / connectivity", status: "held", note: "Primary distribution engine — negotiated territory by territory." },
  { category: "Sportswear & equipment", status: "reserved", note: "Existing global relationship — never offered at territory level." },
  { category: "Payments & fintech", status: "available", note: "Subscriptions, rewards and commerce enablement." },
  { category: "Airlines & travel", status: "available", note: "Content licensing and in-flight experiences." },
  { category: "Consumer electronics", status: "available", note: "Device bundling and HoloMe hardware." },
  { category: "Food & beverage", status: "held", note: "Under management review — child-audience suitability applies." },
  { category: "Education & youth development", status: "available", note: "Natural fit for Messi Academy and Messi For Good." },
  { category: "Betting & gambling", status: "prohibited", note: "Never sold. Incompatible with a children's environment." },
  { category: "Alcohol & tobacco", status: "prohibited", note: "Never sold. Incompatible with a children's environment." },
  { category: "Political & advocacy", status: "prohibited", note: "Never sold. Reserved category in every territory." },
  { category: "Crypto & speculative assets", status: "prohibited", note: "Never sold. Brand-safety exclusion." },
  { category: "Healthcare & pharmaceutical", status: "reserved", note: "Reserved — no medical claims may attach to the digital human." },
];

/** The approvals management retains over the platform, always. */
export const MANAGEMENT_CONTROLS = [
  "Sponsor approval",
  "Category veto",
  "Territory approval",
  "Content approval",
  "Campaign approval",
  "Likeness approval",
  "Voice governance",
  "Brand-safety control",
  "Emergency shutdown authority",
] as const;

/** What BYOND operates versus what management controls (slide 19). */
export const OPERATING_SPLIT = {
  byond: [
    "Platform engineering and hosting",
    "Digital-human integration and HoloMe deployment",
    "Language and voice operations",
    "FVIF intelligence pipeline and dashboards",
    "Territory launch, billing and telco integration",
    "Fan care tooling and safeguarding workflow",
  ],
  management: [
    "Everything that is Lionel Messi",
    "Approved knowledge, stories and values",
    "Likeness, voice and persona governance",
    "Every partner, category and territory",
    "Every piece of published content",
    "Emergency shutdown authority",
  ],
} as const;

/* ------------------------------------------------------------------ *
 * The telco B2B2C model (slide 16)                                    *
 * ------------------------------------------------------------------ */

export interface TelcoPropositionRow {
  offer: string;
  operatorContribution: string;
  platformBenefit: string;
}

export const TELCO_MODEL: TelcoPropositionRow[] = [
  {
    offer: "“Every premium 5G subscriber receives MESSI.LIVE.”",
    operatorContribution: "National customer reach + 5G positioning",
    platformBenefit: "Millions of activated fans without one-by-one acquisition",
  },
  {
    offer: "“One free 5 Minutes With Messi every month.”",
    operatorContribution: "Retail, marketing and loyalty programmes",
    platformBenefit: "A recurring reason to return, funded by the operator",
  },
  {
    offer: "“MESSI+ FAMILY included with your family plan.”",
    operatorContribution: "Billing, identity and account integration",
    platformBenefit: "Family tier scale and low-friction payment",
  },
];

/* ------------------------------------------------------------------ *
 * Illustrative revenue model                                          *
 * ------------------------------------------------------------------ */

export interface RevenueModelInput {
  /** Monthly active fans across all territories. */
  activeFans: number;
  /** Live presenting-partner territories. */
  partnerTerritories: number;
  /** Illustrative annual value of one territorial presenting partnership. */
  partnerAnnualValue: number;
}

export interface RevenueModelOutput {
  subscriptionMrr: number;
  subscriptionArr: number;
  partnershipArr: number;
  totalArr: number;
  byTier: { tier: string; fans: number; mrr: number }[];
}

/**
 * A deliberately simple, transparent model. It exists so the management
 * conversation is about the SHAPE of the business, not about a black box.
 */
export function modelRevenue({
  activeFans,
  partnerTerritories,
  partnerAnnualValue,
}: RevenueModelInput): RevenueModelOutput {
  const byTier = TIERS.map((t) => {
    const fans = Math.round((activeFans * t.mixPct) / 100);
    return { tier: t.name, fans, mrr: Math.round(fans * t.arpu) };
  });
  const subscriptionMrr = byTier.reduce((a, b) => a + b.mrr, 0);
  const subscriptionArr = subscriptionMrr * 12;
  const partnershipArr = partnerTerritories * partnerAnnualValue;
  return {
    subscriptionMrr,
    subscriptionArr,
    partnershipArr,
    totalArr: subscriptionArr + partnershipArr,
    byTier,
  };
}
