/**
 * Klleon Chat SDK client adapter — vendor-specific surface used by useKlleonAvatar.
 * Keeps SDK calls out of UI components.
 */

import type {
  KlleonChatData,
  KlleonChatSdk,
  KlleonErrorData,
  KlleonInitOption,
  KlleonStatus,
} from "@/types/klleon";

export const KLLEON_AVATAR_ID = "e9da27d3-9f03-4043-aa35-3bb369baf994";
export const KLLEON_SDK_URL = "https://web.sdk.klleon.io/1.3.0/klleon-chat.umd.js";

export type KlleonVoiceCodes = {
  voice_code: string;
  subtitle_code: string;
};

/** MS uses Indonesian voice as Malay stand-in; others fall back to en_us. */
export function klleonVoiceCodes(langCode: string): KlleonVoiceCodes {
  if (langCode === "MS") return { voice_code: "id_id", subtitle_code: "id_id" };
  return { voice_code: "en_us", subtitle_code: "en_us" };
}

export function getKlleonSdk(): KlleonChatSdk | null {
  if (typeof window === "undefined") return null;
  return window.KlleonChat ?? null;
}

let scriptPromise: Promise<void> | null = null;

export function loadKlleonScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.KlleonChat) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${KLLEON_SDK_URL}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Klleon Chat SDK failed to load."))
      );
      if (window.KlleonChat) resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = KLLEON_SDK_URL;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("Klleon Chat SDK failed to load."));
    document.head.appendChild(el);
  });

  return scriptPromise;
}

export type KlleonListeners = {
  onStatus?: (status: KlleonStatus) => void;
  onChat?: (data: KlleonChatData) => void;
  onError?: (error: KlleonErrorData) => void;
};

/**
 * Ref-counted client so React Strict Mode / fast refresh remounts do not
 * destroy mid-init. Klleon destroy() is async and no-ops while initializing.
 *
 * SDK listeners are registered ONCE and forwarded to whatever the current
 * React mount installed via setKlleonListeners — Strict Mode must not leave
 * a cancelled closure as the only SDK callback (that dropped all chat/TTS).
 */
let opChain: Promise<void> = Promise.resolve();
let clientReady = false;
let seenVideoCanPlay = false;
let retainCount = 0;
let destroyTimer: ReturnType<typeof setTimeout> | null = null;
let liveListeners: KlleonListeners = {};
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
export function setKlleonListeners(listeners: KlleonListeners): void {
  liveListeners = listeners;
}

/**
 * Klleon 1.3.0 sendMessage only transmits when sdkState.status === "VIDEO_CAN_PLAY".
 * Agora user-joined often sets CONNECTED_FINISH *after* canplay, overwriting that
 * gate — echo/STT then no-op silently. Re-fire canplay to restore the gate.
 */
export function ensureKlleonSendReady(): boolean {
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

function bindSdkListenersOnce(sdk: KlleonChatSdk): void {
  if (sdkListenersBound) return;
  sdkListenersBound = true;
  sdk.onStatusEvent((status) => {
    if (status === "VIDEO_CAN_PLAY") seenVideoCanPlay = true;
    // Race: CONNECTED_FINISH after VIDEO_CAN_PLAY blocks all socket sends.
    if (status === "CONNECTED_FINISH" && seenVideoCanPlay) {
      ensureKlleonSendReady();
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
export function retainKlleonClient(): void {
  retainCount += 1;
  if (destroyTimer) {
    clearTimeout(destroyTimer);
    destroyTimer = null;
  }
}

/** Call from the avatar hook effect cleanup. */
export function releaseKlleonClient(): void {
  retainCount = Math.max(0, retainCount - 1);
  if (retainCount > 0) return;
  if (destroyTimer) clearTimeout(destroyTimer);
  destroyTimer = setTimeout(() => {
    destroyTimer = null;
    if (retainCount > 0) return;
    void destroyKlleonClient();
  }, 2000);
}

export function hasKlleonVideoCanPlay(): boolean {
  return seenVideoCanPlay;
}

export async function initKlleonClient(
  option: KlleonInitOption,
  listeners: KlleonListeners = {}
): Promise<{ sdk: KlleonChatSdk; reused: boolean }> {
  setKlleonListeners(listeners);
  let reused = false;
  await enqueue(async () => {
    await loadKlleonScript();
    const sdk = getKlleonSdk();
    if (!sdk) throw new Error("Klleon Chat SDK failed to load.");

    bindSdkListenersOnce(sdk);

    if (!clientReady) {
      await sdk.init(option);
      clientReady = true;
      reused = false;
    } else {
      reused = true;
    }
  });
  const sdk = getKlleonSdk();
  if (!sdk) throw new Error("Klleon Chat SDK failed to load.");
  return { sdk, reused };
}

export function destroyKlleonClient(): Promise<void> {
  return enqueue(async () => {
    if (retainCount > 0) return;
    const sdk = getKlleonSdk();
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

type KlleonRemoteAudioTrack = {
  play?: () => void;
  setVolume?: (n: number) => void;
  isPlaying?: boolean;
};

type KlleonAvatarHost = HTMLElement & {
  volume?: number;
  muted?: boolean;
  applyVolume?: () => void;
  getRemoteAudioTrack?: () => KlleonRemoteAudioTrack | null | undefined;
};

function safeRemoteTrack(host: KlleonAvatarHost): KlleonRemoteAudioTrack | null {
  try {
    return host.getRemoteAudioTrack?.() ?? null;
  } catch {
    return null;
  }
}

/** Klleon avatar-container.volume is 0–100 (not HTMLMediaElement 0–1). */
export function setKlleonContainerVolume(
  el: HTMLElement | null,
  vol: number
): void {
  if (!el) return;
  const klleonVol = Math.max(0, Math.min(100, vol));
  const host = el as KlleonAvatarHost;
  try {
    if (host.volume !== klleonVol) host.volume = klleonVol;
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
      track.setVolume?.(klleonVol);
    } catch {
      /* ignore */
    }
  }
  collectVideos(el).forEach((v) => {
    try {
      v.volume = klleonVol === 0 ? 0 : 1;
      v.muted = false;
    } catch {
      /* ignore */
    }
  });
}

/**
 * Unlock audible TTS. Klleon routes speech through Agora `remoteAudioTrack`
 * (avatar-container.applyVolume / getRemoteAudioTrack) — not the HTML <video>.
 * Must re-call track.play() under a user gesture after subscribe-time autoplay.
 */
export function unlockKlleonAudio(el: HTMLElement | null): void {
  if (!el) return;
  const host = el as KlleonAvatarHost;
  setKlleonContainerVolume(el, 100);
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
