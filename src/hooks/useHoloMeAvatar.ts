"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  ensureHoloMeSendReady,
  getHoloMeSdk,
  hasHoloMeVideoCanPlay,
  initHoloMeClient,
  HOLOME_AVATAR_ID,
  holomeVoiceCodes,
  releaseHoloMeClient,
  retainHoloMeClient,
  setHoloMeContainerVolume,
  setHoloMeListeners,
  unlockHoloMeAudio,
} from "@/lib/digital-human/adapters/holome";
import type { HoloMeChatData, HoloMeStatus } from "@/types/holome";

export type UseHoloMeAvatarOptions = {
  sdkKey: string;
  /** Session language code: MS | EN | ZH | TA | AR */
  langCode: string;
  enabled?: boolean;
  /** HoloMe avatar UUID; defaults to the original dengar avatar. */
  avatarId?: string;
};

export type UseHoloMeAvatarResult = {
  ready: boolean;
  error: string | null;
  avatarRef: RefObject<HTMLElement | null>;
  speak: (text: string, after?: () => void) => void;
  /** Wait until VIDEO_CAN_PLAY (or timeout). Needed before startStt. */
  waitUntilReady: (timeoutMs?: number) => Promise<boolean>;
  /** Starts STT; returns false if SDK/avatar not ready or start throws. */
  startStt: () => boolean;
  endStt: () => void;
  cancelStt: () => void;
  stopSpeech: () => void;
  unlockAudio: () => void;
  setVolume: (vol: number) => void;
  /** Subscribe to STT / speech lifecycle for session UI. */
  onChat: (handler: (data: HoloMeChatData) => void) => () => void;
};

/**
 * Client hook wrapping the HoloMe avatar SDK.
 * TTS audio is Agora remoteAudioTrack — unlockAudio() must run under a gesture.
 */
export function useHoloMeAvatar({
  sdkKey,
  langCode,
  enabled = true,
  avatarId = HOLOME_AVATAR_ID,
}: UseHoloMeAvatarOptions): UseHoloMeAvatarResult {
  const avatarRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readyRef = useRef(false);
  const echoAfterRef = useRef<(() => void) | null>(null);
  const pendingEchoRef = useRef<string | null>(null);
  const chatHandlersRef = useRef(new Set<(data: HoloMeChatData) => void>());
  readyRef.current = ready;

  const setVolume = useCallback((vol: number) => {
    setHoloMeContainerVolume(avatarRef.current, vol);
  }, []);

  const unlockAudio = useCallback(() => {
    unlockHoloMeAudio(avatarRef.current);
  }, []);

  const flushPending = useCallback(() => {
    if (!pendingEchoRef.current || !getHoloMeSdk()) return;
    const text = pendingEchoRef.current;
    pendingEchoRef.current = null;
    try {
      ensureHoloMeSendReady();
      getHoloMeSdk()!.echo(text);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!sdkKey) {
      setError(
        "Missing HoloMe SDK key. Set HOLOME_SDK_KEY (or NEXT_PUBLIC_HOLOME_SDK_KEY) in .env and restart."
      );
      return;
    }

    retainHoloMeClient();
    let alive = true;
    const codes = holomeVoiceCodes(langCode);

    const onStatus = (status: HoloMeStatus) => {
      if (!alive) return;
      if (status === "VIDEO_CAN_PLAY") {
        setReady(true);
        setError(null);
        setHoloMeContainerVolume(avatarRef.current, 100);
        unlockHoloMeAudio(avatarRef.current);
        flushPending();
      } else if (status === "DESTROYED") {
        setReady(false);
      } else if (
        status === "CONNECTING_FAILED" ||
        status === "SOCKET_FAILED" ||
        status === "STREAMING_FAILED"
      ) {
        setError(
          `HoloMe connection failed (${status}). Check SDK key and domain registration.`
        );
      }
    };

    const onChat = (data: HoloMeChatData) => {
      if (!alive) return;
      if (data.chat_type === "RESPONSE_IS_ENDED") {
        const cb = echoAfterRef.current;
        echoAfterRef.current = null;
        cb?.();
      }
      chatHandlersRef.current.forEach((h) => h(data));
    };

    const onError = (err: { message?: string }) => {
      if (!alive) return;
      if (err?.message) setError(err.message);
    };

    // Install live listeners BEFORE any await so Strict Mode remount owns events.
    setHoloMeListeners({ onStatus, onChat, onError });

    (async () => {
      try {
        await initHoloMeClient(
          {
            sdk_key: sdkKey,
            avatar_id: avatarId,
            voice_code: codes.voice_code,
            subtitle_code: codes.subtitle_code,
            enable_microphone: true,
            log_level: "warn",
          },
          { onStatus, onChat, onError }
        );

        if (!alive) return;

        if (avatarRef.current) {
          const el = avatarRef.current as HTMLElement & {
            videoStyle?: CSSProperties;
          };
          el.videoStyle = {
            objectFit: "cover",
            objectPosition: "center top",
            width: "100%",
            height: "100%",
          };
          setHoloMeContainerVolume(el, 100);
        }

        // VIDEO_CAN_PLAY may have fired while the previous Strict Mode mount
        // was tearing down — recover ready from the module flag.
        if (hasHoloMeVideoCanPlay()) {
          setReady(true);
          setError(null);
          unlockHoloMeAudio(avatarRef.current);
          flushPending();
        }

      } catch (e) {
        if (alive) {
          setError(
            `HoloMe init failed: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }
    })();

    return () => {
      alive = false;
      releaseHoloMeClient();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkKey, enabled, avatarId, flushPending]);

  const speak = useCallback(
    (text: string, after?: () => void) => {
      echoAfterRef.current = after ?? null;
      unlockAudio();
      if (!getHoloMeSdk() || !ready) {
        pendingEchoRef.current = text;
        if (after) setTimeout(after, 2200);
        return;
      }
      try {
        // Restore VIDEO_CAN_PLAY gate — CONNECTED_FINISH otherwise drops echo.
        ensureHoloMeSendReady();
        getHoloMeSdk()!.echo(text);
      } catch {
        if (after) setTimeout(after, 1500);
      }
    },
    [ready, unlockAudio]
  );

  const waitUntilReady = useCallback(async (timeoutMs = 4000) => {
    if (readyRef.current || hasHoloMeVideoCanPlay()) return true;
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      await new Promise((r) => setTimeout(r, 100));
      if (readyRef.current || hasHoloMeVideoCanPlay()) return true;
    }
    return readyRef.current || hasHoloMeVideoCanPlay();
  }, []);

  const startStt = useCallback(() => {
    if (!getHoloMeSdk()) return false;
    if (!readyRef.current && !hasHoloMeVideoCanPlay()) return false;
    try {
      ensureHoloMeSendReady();
      getHoloMeSdk()!.stopSpeech();
    } catch {
      /* ignore */
    }
    try {
      getHoloMeSdk()!.startStt();
      return true;
    } catch {
      return false;
    }
  }, []);

  const endStt = useCallback(() => {
    try {
      getHoloMeSdk()?.endStt();
    } catch {
      /* ignore */
    }
  }, []);

  const cancelStt = useCallback(() => {
    try {
      getHoloMeSdk()?.cancelStt();
    } catch {
      /* ignore */
    }
  }, []);

  const stopSpeech = useCallback(() => {
    try {
      getHoloMeSdk()?.stopSpeech();
    } catch {
      /* ignore */
    }
  }, []);

  const onChat = useCallback((handler: (data: HoloMeChatData) => void) => {
    chatHandlersRef.current.add(handler);
    return () => {
      chatHandlersRef.current.delete(handler);
    };
  }, []);

  return useMemo(
    () => ({
      ready,
      error,
      avatarRef,
      speak,
      waitUntilReady,
      startStt,
      endStt,
      cancelStt,
      stopSpeech,
      unlockAudio,
      setVolume,
      onChat,
    }),
    [
      ready,
      error,
      speak,
      waitUntilReady,
      startStt,
      endStt,
      cancelStt,
      stopSpeech,
      unlockAudio,
      setVolume,
      onChat,
    ]
  );
}
