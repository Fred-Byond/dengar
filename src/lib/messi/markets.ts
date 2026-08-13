/**
 * MESSI.LIVE market model — "Global IP. Local Commercialisation."
 *
 * One global platform, configured territory by territory (slides 14–16). Every
 * commercial slot below is an illustrative PLACEHOLDER: no partner is named,
 * because every category, territory and partner remains subject to Messi
 * management approval and to existing contractual rights (slide 19).
 */

export type LangCode =
  | "ES" | "EN" | "AR" | "PT" | "ZH" | "JA" | "KO" | "FR" | "HI" | "ID" | "MS";

export interface LanguageDef {
  code: LangCode;
  /** Display label in the fan UI. */
  label: string;
  /** BCP-47 tag for the speech stack. */
  bcp: string;
  rtl?: boolean;
  /** Illustrative share of global conversations, for the seeded dataset. */
  weight: number;
}

export const LANGUAGES: LanguageDef[] = [
  { code: "ES", label: "Español", bcp: "es-AR", weight: 26 },
  { code: "EN", label: "English", bcp: "en-US", weight: 21 },
  { code: "AR", label: "العربية", bcp: "ar-SA", rtl: true, weight: 12 },
  { code: "PT", label: "Português", bcp: "pt-BR", weight: 9 },
  { code: "HI", label: "हिन्दी", bcp: "hi-IN", weight: 8 },
  { code: "ID", label: "Bahasa Indonesia", bcp: "id-ID", weight: 7 },
  { code: "ZH", label: "中文", bcp: "zh-CN", weight: 6 },
  { code: "FR", label: "Français", bcp: "fr-FR", weight: 4 },
  { code: "JA", label: "日本語", bcp: "ja-JP", weight: 3 },
  { code: "MS", label: "Bahasa Melayu", bcp: "ms-MY", weight: 2 },
  { code: "KO", label: "한국어", bcp: "ko-KR", weight: 2 },
];

export const LANGUAGE_BY_CODE: Record<string, LanguageDef> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
);

/** Commercial status of a territory in the rollout. */
export type TerritoryStatus = "live" | "launching" | "pipeline" | "reserved";

export interface Market {
  id: string;
  country: string;
  /** MESSI.LIVE <MARKET> — the fan-facing territory brand. */
  territory: string;
  /** ISO-ish region label used in the fan record. */
  regions: string[];
  primaryLanguage: LangCode;
  otherLanguages: LangCode[];
  status: TerritoryStatus;
  /** Illustrative share of global conversations, for the seeded dataset. */
  weight: number;
  /** Local MESSI+ price point, illustrative, in local currency. */
  localPrice: string;
  /** Placeholder commercial slots — never a named partner. */
  presentingPartner: string;
  connectivityPartner: string;
  /** Physical HoloMe presence in-market. */
  holoMeSites: number;
}

const OPEN = "[Presenting Partner — category open]";
const HELD = "[Presenting Partner — under management review]";
const RESERVED = "[Reserved — existing rights holder]";
const TELCO_OPEN = "[National connectivity partner — open]";
const TELCO_HELD = "[National connectivity partner — in negotiation]";

export const MARKETS: Market[] = [
  {
    id: "ar", country: "Argentina", territory: "MESSI.LIVE ARGENTINA",
    regions: ["Buenos Aires", "Santa Fe", "Córdoba", "Rosario", "Mendoza"],
    primaryLanguage: "ES", otherLanguages: ["EN"], status: "live", weight: 148,
    localPrice: "ARS 6.900/mes", presentingPartner: RESERVED, connectivityPartner: TELCO_HELD, holoMeSites: 6,
  },
  {
    id: "in", country: "India", territory: "MESSI.LIVE INDIA",
    regions: ["Kerala", "West Bengal", "Maharashtra", "Goa", "Delhi NCR"],
    primaryLanguage: "HI", otherLanguages: ["EN"], status: "live", weight: 141,
    localPrice: "₹399/month", presentingPartner: HELD, connectivityPartner: TELCO_HELD, holoMeSites: 4,
  },
  {
    id: "id", country: "Indonesia", territory: "MESSI.LIVE INDONESIA",
    regions: ["Jakarta", "West Java", "East Java", "Bali", "North Sumatra"],
    primaryLanguage: "ID", otherLanguages: ["EN"], status: "live", weight: 118,
    localPrice: "Rp 79.000/bulan", presentingPartner: OPEN, connectivityPartner: TELCO_HELD, holoMeSites: 3,
  },
  {
    id: "sa", country: "Saudi Arabia", territory: "MESSI.LIVE SAUDI ARABIA",
    regions: ["Riyadh", "Makkah", "Eastern Province", "Madinah"],
    primaryLanguage: "AR", otherLanguages: ["EN"], status: "live", weight: 104,
    localPrice: "SAR 29/شهر", presentingPartner: HELD, connectivityPartner: TELCO_HELD, holoMeSites: 5,
  },
  {
    id: "us", country: "United States", territory: "MESSI.LIVE USA",
    regions: ["Florida", "California", "Texas", "New York", "Illinois"],
    primaryLanguage: "EN", otherLanguages: ["ES"], status: "live", weight: 96,
    localPrice: "US$7.99/month", presentingPartner: RESERVED, connectivityPartner: TELCO_OPEN, holoMeSites: 7,
  },
  {
    id: "mx", country: "Mexico", territory: "MESSI.LIVE MÉXICO",
    regions: ["CDMX", "Jalisco", "Nuevo León", "Puebla"],
    primaryLanguage: "ES", otherLanguages: ["EN"], status: "launching", weight: 74,
    localPrice: "MXN 129/mes", presentingPartner: OPEN, connectivityPartner: TELCO_OPEN, holoMeSites: 2,
  },
  {
    id: "br", country: "Brazil", territory: "MESSI.LIVE BRASIL",
    regions: ["São Paulo", "Rio de Janeiro", "Bahia", "Minas Gerais"],
    primaryLanguage: "PT", otherLanguages: ["ES", "EN"], status: "launching", weight: 68,
    localPrice: "R$ 29,90/mês", presentingPartner: OPEN, connectivityPartner: TELCO_OPEN, holoMeSites: 2,
  },
  {
    id: "eg", country: "Egypt", territory: "MESSI.LIVE EGYPT",
    regions: ["Cairo", "Giza", "Alexandria"],
    primaryLanguage: "AR", otherLanguages: ["EN"], status: "launching", weight: 58,
    localPrice: "EGP 149/شهر", presentingPartner: OPEN, connectivityPartner: TELCO_HELD, holoMeSites: 1,
  },
  {
    id: "my", country: "Malaysia", territory: "MESSI.LIVE MALAYSIA",
    regions: ["Selangor", "Kuala Lumpur", "Johor", "Penang", "Sabah"],
    primaryLanguage: "MS", otherLanguages: ["EN", "ZH"], status: "live", weight: 52,
    localPrice: "RM 24.90/bulan", presentingPartner: HELD, connectivityPartner: TELCO_HELD, holoMeSites: 3,
  },
  {
    id: "es", country: "Spain", territory: "MESSI.LIVE ESPAÑA",
    regions: ["Cataluña", "Madrid", "Andalucía", "Valencia"],
    primaryLanguage: "ES", otherLanguages: ["EN", "FR"], status: "live", weight: 49,
    localPrice: "€6,99/mes", presentingPartner: RESERVED, connectivityPartner: TELCO_OPEN, holoMeSites: 3,
  },
  {
    id: "ng", country: "Nigeria", territory: "MESSI.LIVE NIGERIA",
    regions: ["Lagos", "Abuja", "Kano", "Rivers"],
    primaryLanguage: "EN", otherLanguages: ["FR"], status: "pipeline", weight: 44,
    localPrice: "₦4,500/month", presentingPartner: OPEN, connectivityPartner: TELCO_OPEN, holoMeSites: 0,
  },
  {
    id: "jp", country: "Japan", territory: "MESSI.LIVE JAPAN",
    regions: ["Tokyo", "Osaka", "Aichi", "Fukuoka"],
    primaryLanguage: "JA", otherLanguages: ["EN"], status: "launching", weight: 38,
    localPrice: "¥980/月", presentingPartner: HELD, connectivityPartner: TELCO_HELD, holoMeSites: 4,
  },
  {
    id: "cn", country: "China", territory: "MESSI.LIVE 中国",
    regions: ["Guangdong", "Shanghai", "Beijing", "Zhejiang"],
    primaryLanguage: "ZH", otherLanguages: ["EN"], status: "reserved", weight: 36,
    localPrice: "¥49/月", presentingPartner: RESERVED, connectivityPartner: TELCO_HELD, holoMeSites: 2,
  },
  {
    id: "fr", country: "France", territory: "MESSI.LIVE FRANCE",
    regions: ["Île-de-France", "PACA", "Occitanie"],
    primaryLanguage: "FR", otherLanguages: ["EN", "AR"], status: "live", weight: 33,
    localPrice: "€6,99/mois", presentingPartner: RESERVED, connectivityPartner: TELCO_OPEN, holoMeSites: 2,
  },
  {
    id: "kr", country: "South Korea", territory: "MESSI.LIVE KOREA",
    regions: ["Seoul", "Gyeonggi", "Busan"],
    primaryLanguage: "KO", otherLanguages: ["EN"], status: "pipeline", weight: 21,
    localPrice: "₩9,900/월", presentingPartner: OPEN, connectivityPartner: TELCO_OPEN, holoMeSites: 1,
  },
];

export const MARKET_BY_COUNTRY: Record<string, Market> = Object.fromEntries(
  MARKETS.map((m) => [m.country, m]),
);

/** HoloMe venue types used in the physical-experience view (slide 13). */
export const HOLOME_VENUES = [
  "Stadium concourse", "International airport", "Messi exhibition", "Sportswear flagship",
  "Shopping mall", "Football academy", "Hotel lobby", "Fan zone", "Major sporting event",
] as const;
