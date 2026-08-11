/**
 * HoloMe avatar SDK client adapter — vendor-specific surface used by useHoloMeAvatar.
 * Keeps SDK calls out of UI components.
 */

import { getLanguage } from "@/lib/coach/languages";
import type {
  HoloMeChatData,
  HoloMeSdk,
  HoloMeErrorData,
  HoloMeInitOption,
  HoloMeStatus,
} from "@/types/holome";

export const HOLOME_AVATAR_ID = "e9da27d3-9f03-4043-aa35-3bb369baf994";
/**
 * The avatar runtime is supplied by our realism partner, so both the bundle URL
 * and the window global it registers are deployment configuration rather than
 * source constants. Set NEXT_PUBLIC_HOLOME_SDK_URL and
 * NEXT_PUBLIC_HOLOME_RUNTIME_GLOBAL in the environment — see .env.example.
 */
export const HOLOME_SDK_URL = process.env["NEXT_PUBLIC_HOLOME_SDK_URL"] ?? "";
const RUNTIME_GLOBAL = process.env["NEXT_PUBLIC_HOLOME_RUNTIME_GLOBAL"] ?? "";

/** The live avatar runtime, or null before the bundle has registered itself. */
function runtime(): HoloMeSdk | null {
  if (typeof window === "undefined" || !RUNTIME_GLOBAL) return null;
  return (window[RUNTIME_GLOBAL] as HoloMeSdk | undefined) ?? null;
}

export type HoloMeVoiceCodes = {
  voice_code: string;
  subtitle_code: string;
};

/**
 * Coaching languages resolve from the session-language table, which is the
 * single source of truth for what the coach may speak. MS (dengar legacy)
 * keeps its Indonesian stand-in; anything unknown falls back to en_us rather
 * than letting the avatar attempt a voice that was never confirmed.
 */
export function holomeVoiceCodes(langCode: string): HoloMeVoiceCodes {
  if (langCode === "MS") return { voice_code: "id_id", subtitle_code: "id_id" };
  const lang = getLanguage(langCode);
  if (lang) {
    return { voice_code: lang.voiceCode, subtitle_code: lang.subtitleCode };
  }
  return { voice_code: "en_us", subtitle_code: "en_us" };
}

export function getHoloMeSdk(): HoloMeSdk | null {
  return runtime();
}

let scriptPromise: Promise<void> | null = null;

export function loadHoloMeScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (runtime()) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${HOLOME_SDK_URL}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("HoloMe avatar SDK failed to load."))
      );
      if (runtime()) resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = HOLOME_SDK_URL;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("HoloMe avatar SDK failed to load."));
    document.head.appendChild(el);
  });

  return scriptPromise;
}

export type HoloMeListeners = {
  onStatus?: (status: HoloMeStatus) => void;
  onChat?: (data: HoloMeChatData) => void;
  onError?: (error: HoloMeErrorData) => void;
};

/**
 * Ref-counted client so React Strict Mode / fast refresh remounts do not
 * destroy mid-init. HoloMe destroy() is async and no-ops while initializing.
 *
 * SDK listeners are registered ONCE and forwarded to whatever the current
 * React mount installed via setHoloMeListeners — Strict Mode must not leave
 * a cancelled closure as the only SDK callback (that dropped all chat/TTS).
 */
let opChain: Promise<void> = Promise.resolve();
let clientReady = false;
let seenVideoCanPlay = false;
let retainCount = 0;
let destroyTimer: ReturnType<typeof setTimeout> | null = null;
let liveListeners: HoloMeListeners = {};
let sdkListenersBound = false;

function enqueue(op: () => Promise<void>): Promise<void> {
  const next = opChain.then(op, op);
  opChain = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

/** Install/replace the React-facing callbacks without rebinding the SDK. */
export function setHoloMeListeners(listeners: HoloMeListeners): void {
  liveListeners = listeners;
}

/**
 * HoloMe 1.3.0 sendMessage only transmits when sdkState.status === "VIDEO_CAN_PLAY".
 * Agora user-joined often sets CONNECTED_FINISH *after* canplay, overwriting that
 * gate — echo/STT then no-op silently. Re-fire canplay to restore the gate.
 */
export function ensureHoloMeSendReady(): boolean {
  const host =
    (document.querySelector("avatar-container") as HTMLElement | null) ??
    (document.getElementById("avatar-container") as HTMLElement | null);
  const videos = host
    ? collectVideos(host)
    : Array.from(document.querySelectorAll("video"));
  let fired = 0;
  for (const v of videos) {
    try {
      v.dispatchEvent(new Event("canplay"));
      fired += 1;
    } catch {
      /* ignore */
    }
  }
  return fired > 0;
}

function bindSdkListenersOnce(sdk: HoloMeSdk): void {
  if (sdkListenersBound) return;
  sdkListenersBound = true;
  sdk.onStatusEvent((status) => {
    if (status === "VIDEO_CAN_PLAY") seenVideoCanPlay = true;
    // Race: CONNECTED_FINISH after VIDEO_CAN_PLAY blocks all socket sends.
    if (status === "CONNECTED_FINISH" && seenVideoCanPlay) {
      ensureHoloMeSendReady();
    }
    liveListeners.onStatus?.(status);
  });
  sdk.onChatEvent((data) => {
    liveListeners.onChat?.(data);
  });
  sdk.onErrorEvent((err) => {
    liveListeners.onError?.(err);
  });
}

/** Call synchronously at the start of the avatar hook effect. */
export function retainHoloMeClient(): void {
  retainCount += 1;
  if (destroyTimer) {
    clearTimeout(destroyTimer);
    destroyTimer = null;
  }
}

/** Call from the avatar hook effect cleanup. */
export function releaseHoloMeClient(): void {
  retainCount = Math.max(0, retainCount - 1);
  if (retainCount > 0) return;
  if (destroyTimer) clearTimeout(destroyTimer);
  destroyTimer = setTimeout(() => {
    destroyTimer = null;
    if (retainCount > 0) return;
    void destroyHoloMeClient();
  }, 2000);
}

export function hasHoloMeVideoCanPlay(): boolean {
  return seenVideoCanPlay;
}

export async function initHoloMeClient(
  option: HoloMeInitOption,
  listeners: HoloMeListeners = {}
): Promise<{ sdk: HoloMeSdk; reused: boolean }> {
  setHoloMeListeners(listeners);
  let reused = false;
  await enqueue(async () => {
    await loadHoloMeScript();
    const sdk = getHoloMeSdk();
    if (!sdk) throw new Error("HoloMe avatar SDK failed to load.");

    bindSdkListenersOnce(sdk);

    if (!clientReady) {
      await sdk.init(option);
      clientReady = true;
      reused = false;
    } else {
      reused = true;
    }
  });
  const sdk = getHoloMeSdk();
  if (!sdk) throw new Error("HoloMe avatar SDK failed to load.");
  return { sdk, reused };
}

export function destroyHoloMeClient(): Promise<void> {
  return enqueue(async () => {
    if (retainCount > 0) return;
    const sdk = getHoloMeSdk();
    if (!sdk || !clientReady) {
      clientReady = false;
      seenVideoCanPlay = false;
      sdkListenersBound = false;
      liveListeners = {};
      return;
    }
    try {
      await sdk.destroy();
    } catch {
      /* ignore */
    }
    clientReady = false;
    seenVideoCanPlay = false;
    sdkListenersBound = false;
    liveListeners = {};
  });
}

type HoloMeRemoteAudioTrack = {
  play?: () => void;
  setVolume?: (n: number) => void;
  isPlaying?: boolean;
};

type HoloMeAvatarHost = HTMLElement & {
  volume?: number;
  muted?: boolean;
  applyVolume?: () => void;
  getRemoteAudioTrack?: () => HoloMeRemoteAudioTrack | null | undefined;
};

function safeRemoteTrack(host: HoloMeAvatarHost): HoloMeRemoteAudioTrack | null {
  try {
    return host.getRemoteAudioTrack?.() ?? null;
  } catch {
    return null;
  }
}

/** HoloMe avatar-container.volume is 0–100 (not HTMLMediaElement 0–1). */
export function setHoloMeContainerVolume(
  el: HTMLElement | null,
  vol: number
): void {
  if (!el) return;
  const holomeVol = Math.max(0, Math.min(100, vol));
  const host = el as HoloMeAvatarHost;
  try {
    if (host.volume !== holomeVol) host.volume = holomeVol;
    else host.applyVolume?.();
  } catch {
    /* ignore */
  }
  try {
    host.muted = false;
  } catch {
    /* ignore */
  }
  const track = safeRemoteTrack(host);
  if (track) {
    try {
      track.setVolume?.(holomeVol);
    } catch {
      /* ignore */
    }
  }
  collectVideos(el).forEach((v) => {
    try {
      v.volume = holomeVol === 0 ? 0 : 1;
      v.muted = false;
    } catch {
      /* ignore */
    }
  });
}

/**
 * Unlock audible TTS. HoloMe routes speech through Agora `remoteAudioTrack`
 * (avatar-container.applyVolume / getRemoteAudioTrack) — not the HTML <video>.
 * Must re-call track.play() under a user gesture after subscribe-time autoplay.
 */
export function unlockHoloMeAudio(el: HTMLElement | null): void {
  if (!el) return;
  const host = el as HoloMeAvatarHost;
  setHoloMeContainerVolume(el, 100);
  const track = safeRemoteTrack(host);
  if (track) {
    try {
      track.setVolume?.(100);
    } catch {
      /* ignore */
    }
    try {
      track.play?.();
    } catch {
      /* ignore */
    }
  }
  document.querySelectorAll("audio").forEach((a) => {
    try {
      const elAudio = a as HTMLAudioElement;
      elAudio.muted = false;
      elAudio.volume = 1;
      const p = elAudio.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* ignore */
    }
  });
  collectVideos(el).forEach((v) => {
    try {
      v.muted = false;
      v.volume = 1;
      const p = v.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* ignore */
    }
  });
}

function collectVideos(root: HTMLElement): HTMLVideoElement[] {
  const videos: HTMLVideoElement[] = [];
  if (root.tagName === "VIDEO") videos.push(root as HTMLVideoElement);
  root.querySelectorAll?.("video").forEach((v) => videos.push(v as HTMLVideoElement));
  const sr = (root as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
  sr?.querySelectorAll("video").forEach((v) => videos.push(v as HTMLVideoElement));
  return videos;
}
