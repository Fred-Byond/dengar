import { LANGUAGES, type LangCode } from "@/lib/messi/markets";

export type SessionLangCode = LangCode;

export type SessionLang = {
  code: SessionLangCode;
  label: string;
  bcp: string;
  rtl?: boolean;
};

/** The eleven launch languages of MESSI.LIVE (slide 5), Spanish first. */
export const LANGS: SessionLang[] = LANGUAGES.map((l) => ({
  code: l.code,
  label: l.label,
  bcp: l.bcp,
  rtl: l.rtl,
}));

export const LANG_BY_CODE: Record<string, SessionLang> = Object.fromEntries(
  LANGS.map((l) => [l.code, l]),
);

export type ScreenId =
  | "landing"
  | "tiers"
  | "slots"
  | "register"
  | "otp"
  | "confirmed"
  | "reminder"
  | "lobby"
  | "session"
  | "closing";

/** Screens that dim the avatar behind a veil so the form is readable. */
export const VEILED_SCREENS: ReadonlySet<ScreenId> = new Set([
  "tiers",
  "slots",
  "register",
  "otp",
  "confirmed",
  "reminder",
  "closing",
]);
