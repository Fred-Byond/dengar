export type SessionLangCode = "EN" | "MS" | "ZH" | "TA";

export type SessionLang = {
  code: SessionLangCode;
  label: string;
  bcp: string;
  rtl?: boolean;
};

export const LANGS: SessionLang[] = [
  { code: "EN", label: "English", bcp: "en-US" },
  { code: "MS", label: "Bahasa Melayu", bcp: "ms-MY" },
  { code: "ZH", label: "中文 Chinese", bcp: "zh-CN" },
  { code: "TA", label: "தமிழ் Tamil", bcp: "ta-IN" },
];

/** The participant journey — §9 of the Concept Paper. */
export type ScreenId =
  | "landing"
  | "consent"
  | "context"
  | "pulse"
  | "lobby"
  | "session"
  | "reflect"
  | "confirm"
  | "done";

/** Screens that dim the avatar scene so the form is readable. */
export const VEILED_SCREENS: ReadonlySet<ScreenId> = new Set([
  "consent",
  "context",
  "pulse",
  "reflect",
  "confirm",
  "done",
]);
