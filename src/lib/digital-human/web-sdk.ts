/**
 * Browser-side digital-human connection contract — the AS-BUILT pattern,
 * captured from the working kiosk integration and kept vendor-neutral.
 *
 * In production the citizen experience embeds the avatar web SDK: a UMD
 * script that exposes a global chat object and renders the live avatar
 * video into an `<avatar-container>` custom element (mounted full-bleed
 * behind the session UI). This file types that surface so the PWA session
 * screen, the prototype adapters (`DigitalHuman` in the citizen
 * prototypes), and the real SDK wiring all stay aligned.
 *
 * Transcript capture is PER TURN, client → server: every avatar line
 * (`TEXT`) and citizen utterance (`STT_RESULT`) is POSTed to the
 * transcript-record endpoint as it happens; at session close the endpoint
 * folds the turns into the CVIF `TranscriptInput` (see
 * `turnsToTranscriptInput`). The `sdk_key` and `avatar_id` come from
 * deployment configuration — never hard-coded in the page.
 */

import type { TranscriptInput } from "../cvif";
import type { SessionLanguage } from "../types";

/** Locale codes the avatar SDK expects (`voice_code` / `subtitle_code`). */
export type AvatarLocale = "ms_my" | "en_us" | "zh_cn" | "ta_in" | "ar_sa";

/** Our five session languages → the SDK's locale codes. */
export const SESSION_LANGUAGE_TO_LOCALE: Record<SessionLanguage, AvatarLocale> = {
  ms: "ms_my",
  en: "en_us",
  zh: "zh_cn",
  ta: "ta_in",
  ar: "ar_sa",
};

/**
 * Lifecycle statuses from `onStatusEvent`. `VIDEO_CAN_PLAY` is the one the
 * UI depends on: hide the loader/placeholder and reveal the live stream.
 */
export type AvatarStatus = "VIDEO_CAN_PLAY" | (string & {});

export type AvatarChatType =
  | "TEXT" // the avatar spoke a line → left/caption bubble + turn log
  | "STT_RESULT" // the citizen's speech transcript → right bubble + turn log
  | "RESPONSE_IS_ENDED"; // the avatar finished responding → unlock mic / advance flow

export interface AvatarChatEvent {
  chat_type: AvatarChatType;
  message?: string;
}

export interface AvatarSdkInitOptions {
  /** Per-deployment key, from configuration — never committed. */
  sdk_key: string;
  /** Per-leader avatar id (each deployment has its own). */
  avatar_id: string;
  voice_code: AvatarLocale;
  subtitle_code: AvatarLocale;
  log_level?: "debug" | "info" | "warn" | "error";
}

/** Mid-session language switch (re-boots the avatar in the new locale). */
export interface AvatarChangeOptions {
  avatar_id: string;
  voice_code: AvatarLocale;
  subtitle_code: AvatarLocale;
  /** 1.0 default; configurable per deployment. */
  voice_tts_speech_speed?: number;
}

/**
 * The global chat object the SDK's UMD script exposes. The session gateway
 * / PWA session screen programs against this interface only.
 */
export interface AvatarWebSdk {
  init(options: AvatarSdkInitOptions): Promise<void>;
  onStatusEvent(cb: (status: AvatarStatus) => void): void;
  onChatEvent(cb: (event: AvatarChatEvent) => void): void;
  /** Speak a scripted line — how the controlled-session prompts are driven. */
  echo(text: string): void;
  wakeUpAvatar(): void;
  /** Open the mic; the transcript arrives as an `STT_RESULT` chat event. */
  startStt(): void;
  endStt(): void;
  /** Interrupt the avatar mid-sentence. */
  stopSpeech(): void;
  changeAvatar(options: AvatarChangeOptions): void;
}

/** One captured turn, POSTed to the transcript-record endpoint as it happens. */
export interface TurnRecordPayload {
  /** Booking reference (TTM-… / PM-…). */
  sessionRef: string;
  /** `TEXT` events → "avatar"; `STT_RESULT` events → "citizen". */
  side: "avatar" | "citizen";
  text: string;
  /** mm:ss offset within the session, for auditability. */
  at?: string;
  /** Deployment tag (which experience produced the turn). */
  sourceType?: string;
}

export interface TurnSessionMeta {
  reference: string;
  language: string; // display label, e.g. "Bahasa Melayu"
  state: string;
  district: string;
  topicHint?: string;
}

/**
 * Fold the per-turn records into the CVIF scorer's input at session close.
 * This is the single line that joins the live avatar to the intelligence
 * layer: `scorer.score(turnsToTranscriptInput(meta, turns))`.
 */
export function turnsToTranscriptInput(
  meta: TurnSessionMeta,
  turns: TurnRecordPayload[],
): TranscriptInput {
  return {
    reference: meta.reference,
    language: meta.language,
    state: meta.state,
    district: meta.district,
    topicHint: meta.topicHint,
    turns: turns.map((t) => ({
      speaker: t.side === "avatar" ? "minister" : "citizen",
      text: t.text,
      at: t.at,
    })),
  };
}
