/**
 * AUREN — loss baselines, and what each one is actually worth.
 *
 * THE DISCIPLINE THIS FILE ENFORCES.
 *
 * A market with no defensible aggregate loss figure gets `null`, not zero and
 * not an extrapolation. That is the whole point of the file. The temptation in
 * a deck is enormous — a blank cell next to Spain looks like a gap in the work,
 * and a plausible-looking number looks like diligence. It is the reverse: the
 * blank is the diligence, and the first regulator who asks where the number
 * came from ends the conversation if the answer is "we scaled it from
 * elsewhere".
 *
 * So `annualLoss: null` is a first-class state that propagates. Nothing
 * downstream can compute an avoided loss for a market that has none, and the
 * model returns a reason rather than a figure.
 *
 * THE THREE EVIDENCE GRADES, AND WHY THEY ARE NOT INTERCHANGEABLE.
 *
 *   published        A supervisory authority published it as a loss aggregate.
 *   survey_estimate  Extrapolated from a sample. Real, useful, and not an
 *                    audited record of transactions — the difference matters
 *                    the moment somebody multiplies it by a percentage.
 *   none_defensible  Incident counts, warning lists or partial data exist. A
 *                    monetary aggregate does not.
 *
 * Incidents are not losses. A jurisdiction can publish a rising count of
 * cyber-fraud reports and a list of unauthorised firms without ever publishing
 * what was lost, and treating the first as a proxy for the second is the most
 * common error in this category of analysis.
 */

export type EvidenceStatus = "published" | "survey_estimate" | "none_defensible";

export interface MarketBaseline {
  market: string;
  label: string;
  /** Annual aggregate loss. `null` where no defensible figure exists. */
  annualLoss: number | null;
  currency: string;
  /** The year the figure describes, not the year it was published. */
  year: number | null;
  status: EvidenceStatus;
  source: string;
  /** What the figure does and does not cover. Read this before using it. */
  scope: string;
  /** Only for `none_defensible`: what a real baseline would have to come from. */
  establishWith: string[];
}

export const BASELINES: MarketBaseline[] = [
  {
    market: "MY",
    label: "Malaysia",
    annualLoss: 2_800_000_000,
    currency: "MYR",
    year: 2025,
    status: "published",
    source: "Bank Negara Malaysia Annual Report 2025",
    scope:
      "Reported losses across telecommunications, e-commerce, loan, investment, romance, malware and phishing scams. Reported — so it is a floor, since under-reporting in this category is heavy and systematic.",
    establishWith: [],
  },
  {
    market: "GLOBAL",
    label: "Global",
    annualLoss: 442_000_000_000,
    currency: "USD",
    year: 2024,
    status: "survey_estimate",
    source: "Global State of Scams 2025 (≈46,000 adults across 42 markets)",
    scope:
      "An estimate extrapolated from a sample, not an audited record of transactions. Usable as market context; not usable as the denominator of a contractual savings claim.",
    establishWith: [],
  },
  {
    market: "AE",
    label: "United Arab Emirates",
    annualLoss: null,
    currency: "AED",
    year: null,
    status: "none_defensible",
    source: "GASA UAE research — prevalence only",
    scope:
      "Prevalence is well evidenced: roughly seven in ten residents encountered a scam, one in three of those lost money, 67% of victims were hit by investment scams, and victims averaged 2.8 scams in the year. None of that yields a national monetary aggregate.",
    establishWith: [
      "Participating-bank actual loss data, by scam category",
      "Dubai and Abu Dhabi Police scam typologies with recorded amounts",
      "Central Bank or securities-authority aggregation, if one exists unpublished",
    ],
  },
  {
    market: "ES",
    label: "Spain",
    annualLoss: null,
    currency: "EUR",
    year: null,
    status: "none_defensible",
    source: "Ministry of the Interior crime statistics · CNMV warning lists",
    scope:
      "Cybercrime and online-fraud incident counts are published, and CNMV publishes warnings against unauthorised firms. Incident counts are not verified financial losses, and a warning list is not a loss ledger.",
    establishWith: [
      "A participating bank or a consortium's own loss book",
      "CNMV case data where amounts are recorded",
      "Ministry of the Interior figures, if a monetary series is ever published",
    ],
  },
];

export function baseline(market: string): MarketBaseline | undefined {
  return BASELINES.find((b) => b.market === market);
}

/** True when this market can carry a monetary impact model at all. */
export function hasBaseline(market: string): boolean {
  const b = baseline(market);
  return !!b && b.annualLoss !== null;
}

/**
 * The naive headline, and the reason it is only a headline.
 *
 * "Every 1% of Malaysia's reported losses is RM28 million" is true arithmetic
 * about the market and says nothing about what any deployment achieves. It is
 * worth computing precisely so it can be shown next to the modelled figure —
 * the gap between them is the argument for the model.
 */
export function onePercentOfMarket(market: string): number | null {
  const b = baseline(market);
  return b && b.annualLoss !== null ? b.annualLoss * 0.01 : null;
}

const FORMATS: Record<string, { prefix: string; unitBn: string; unitM: string }> = {
  MYR: { prefix: "RM", unitBn: "bn", unitM: "m" },
  USD: { prefix: "US$", unitBn: "bn", unitM: "m" },
  EUR: { prefix: "€", unitBn: "bn", unitM: "m" },
  AED: { prefix: "AED ", unitBn: "bn", unitM: "m" },
};

export function money(v: number, currency: string): string {
  const f = FORMATS[currency] ?? { prefix: currency + " ", unitBn: "bn", unitM: "m" };
  if (Math.abs(v) >= 1_000_000_000) return `${f.prefix}${(v / 1_000_000_000).toFixed(2)}${f.unitBn}`;
  if (Math.abs(v) >= 1_000_000) return `${f.prefix}${(v / 1_000_000).toFixed(1)}${f.unitM}`;
  if (Math.abs(v) >= 1_000) return `${f.prefix}${Math.round(v / 1_000)}k`;
  return `${f.prefix}${Math.round(v)}`;
}
