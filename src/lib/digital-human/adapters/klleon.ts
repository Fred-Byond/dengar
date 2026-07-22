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

export async function initKlleonClient(
  option: KlleonInitOption,
  listeners: KlleonListeners = {}
): Promise<KlleonChatSdk> {
  await loadKlleonScript();
  const sdk = getKlleonSdk();
  if (!sdk) throw new Error("Klleon Chat SDK failed to load.");

  if (listeners.onStatus) sdk.onStatusEvent(listeners.onStatus);
  if (listeners.onChat) sdk.onChatEvent(listeners.onChat);
  if (listeners.onError) sdk.onErrorEvent(listeners.onError);

  await sdk.init(option);
  return sdk;
}

export function destroyKlleonClient(): void {
  try {
    getKlleonSdk()?.destroy();
  } catch {
    /* ignore */
  }
}

/** Klleon avatar-container.volume is 0–100 (not HTMLMediaElement 0–1). */
export function setKlleonContainerVolume(
  el: HTMLElement | null,
  vol: number
): void {
  if (!el) return;
  const klleonVol = Math.max(0, Math.min(100, vol));
  try {
    (el as HTMLElement & { volume?: number }).volume = klleonVol;
  } catch {
    /* ignore */
  }
  try {
    (el as HTMLElement & { muted?: boolean }).muted = false;
  } catch {
    /* ignore */
  }
  const videos = collectVideos(el);
  videos.forEach((v) => {
    try {
      v.volume = klleonVol === 0 ? 0 : 1;
      v.muted = false;
    } catch {
      /* ignore */
    }
  });
}

export function unlockKlleonAudio(el: HTMLElement | null): void {
  if (!el) return;
  setKlleonContainerVolume(el, 100);
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
  document.querySelectorAll("video").forEach((v) => {
    if (!videos.includes(v as HTMLVideoElement)) videos.push(v as HTMLVideoElement);
  });
  return videos;
}
