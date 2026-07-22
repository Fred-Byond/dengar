export type SessionLangCode = "EN" | "MS" | "ZH" | "TA" | "AR";

export type SessionLang = {
  code: SessionLangCode;
  label: string;
  bcp: string;
  rtl?: boolean;
};

export const LANGS: SessionLang[] = [
  { code: "MS", label: "Bahasa Melayu", bcp: "ms-MY" },
  { code: "EN", label: "English", bcp: "en-US" },
  { code: "ZH", label: "中文 Chinese", bcp: "zh-CN" },
  { code: "TA", label: "தமிழ் Tamil", bcp: "ta-IN" },
  { code: "AR", label: "العربية Arabic", bcp: "ar-SA", rtl: true },
];

export type ScreenId =
  | "landing"
  | "slots"
  | "register"
  | "otp"
  | "confirmed"
  | "reminder"
  | "lobby"
  | "session"
  | "closing";

export const VEILED_SCREENS: ReadonlySet<ScreenId> = new Set([
  "slots",
  "register",
  "otp",
  "confirmed",
  "reminder",
  "closing",
]);
