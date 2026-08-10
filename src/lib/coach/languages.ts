/**
 * Session languages.
 *
 * A launch pack is authored PER LANGUAGE, not translated on the fly.
 * Approved claim wording is a regulatory artifact: what may legally be said
 * about an SPF, a "dermatologist tested" claim or an anti-ageing benefit
 * differs by market. Machine-translating an approved claim silently
 * produces an unapproved claim — so each language pack carries its own
 * approved claims and its own translation status, and the fidelity scorer
 * matches against the claims of the language actually spoken.
 */

export interface SessionLanguage {
  code: string;
  englishName: string;
  nativeName: string;
  bcp47: string;
  rtl: boolean;
  /** Klleon voice/subtitle code, or null where vendor coverage is unproven. */
  voiceCode: string | null;
  /** Markets where this is a primary coaching language. */
  markets: string[];
}

export const LANGUAGES: SessionLanguage[] = [
  {
    code: "EN", englishName: "English", nativeName: "English",
    bcp47: "en-US", rtl: false, voiceCode: "en_us",
    markets: ["UAE", "Malaysia", "Singapore", "India", "UK", "USA"],
  },
  {
    code: "AR", englishName: "Arabic", nativeName: "العربية",
    bcp47: "ar-SA", rtl: true, voiceCode: null,
    markets: ["UAE", "Saudi Arabia", "Egypt", "Morocco"],
  },
  {
    code: "FR", englishName: "French", nativeName: "Français",
    bcp47: "fr-FR", rtl: false, voiceCode: null,
    markets: ["France", "Morocco", "Côte d'Ivoire", "Canada"],
  },
  {
    code: "ZH", englishName: "Chinese (Mandarin)", nativeName: "中文",
    bcp47: "zh-CN", rtl: false, voiceCode: null,
    markets: ["China", "Taiwan", "Singapore", "Malaysia"],
  },
  {
    code: "JA", englishName: "Japanese", nativeName: "日本語",
    bcp47: "ja-JP", rtl: false, voiceCode: null,
    markets: ["Japan"],
  },
  {
    code: "HI", englishName: "Hindi", nativeName: "हिन्दी",
    bcp47: "hi-IN", rtl: false, voiceCode: null,
    markets: ["India"],
  },
];

export const DEFAULT_LANGUAGE = "EN";

export function getLanguage(code: string): SessionLanguage | null {
  return LANGUAGES.find((l) => l.code === code.toUpperCase()) ?? null;
}
export function isRtl(code: string): boolean {
  return getLanguage(code)?.rtl ?? false;
}

/**
 * Governance state of a language pack. Only `approved` content may be
 * spoken to advisors as brand truth; `draft` is visible to the product
 * team only, and the coach refuses to run a session on it.
 */
export type TranslationStatus = "source" | "approved" | "draft";

export const TRANSLATION_STATUS_LABEL: Record<TranslationStatus, string> = {
  source: "Source of truth",
  approved: "Market-approved",
  draft: "Draft — not for coaching",
};
