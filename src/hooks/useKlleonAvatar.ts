"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  ensureKlleonSendReady,
  hasKlleonVideoCanPlay,
  initKlleonClient,
  KLLEON_AVATAR_ID,
  klleonVoiceCodes,
  releaseKlleonClient,
  retainKlleonClient,
  setKlleonContainerVolume,
  setKlleonListeners,
  unlockKlleonAudio,
} from "@/lib/digital-human/adapters/klleon";
import type { KlleonChatData, KlleonStatus } from "@/types/klleon";

export type UseKlleonAvatarOptions = {
  sdkKey: string;
  /** Session language code: MS | EN | ZH | TA | AR */
  langCode: string;
  enabled?: boolean;
};

export type UseKlleonAvatarResult = {
  ready: boolean;
  error: string | null;
  avatarRef: RefObject<HTMLElement | null>;
  speak: (text: string, after?: () => void) => void;
  startStt: () => void;
  endStt: () => void;
  cancelStt: () => void;
  stopSpeech: () => void;
  unlockAudio: () => void;
  setVolume: (vol: number) => void;
  /** Subscribe to STT / speech lifecycle for session UI. */
  onChat: (handler: (data: KlleonChatData) => void) => () => void;
};

/**
 * Client hook wrapping the Klleon Chat SDK.
 * TTS audio is Agora remoteAudioTrack — unlockAudio() must run under a gesture.
 */
export function useKlleonAvatar({
  sdkKey,
  langCode,
  enabled = true,
}: UseKlleonAvatarOptions): UseKlleonAvatarResult {
  const avatarRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const echoAfterRef = useRef<(() => void) | null>(null);
  const pendingEchoRef = useRef<string | null>(null);
  const chatHandlersRef = useRef(new Set<(data: KlleonChatData) => void>());

  const setVolume = useCallback((vol: number) => {
    setKlleonContainerVolume(avatarRef.current, vol);
  }, []);

  const unlockAudio = useCallback(() => {
    unlockKlleonAudio(avatarRef.current);
  }, []);

  const flushPending = useCallback(() => {
    if (!pendingEchoRef.current || !window.KlleonChat) return;
    const text = pendingEchoRef.current;
    pendingEchoRef.current = null;
    try {
      ensureKlleonSendReady();
      window.KlleonChat.echo(text);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!sdkKey) {
      setError(
        "Missing Klleon SDK key. Set KLLEON_SDK_KEY (or NEXT_PUBLIC_KLLEON_SDK_KEY) in .env and restart."
      );
      return;
    }

    retainKlleonClient();
    let alive = true;
    const codes = klleonVoiceCodes(langCode);

    const onStatus = (status: KlleonStatus) => {
      if (!alive) return;
      if (status === "VIDEO_CAN_PLAY") {
        setReady(true);
        setError(null);
        setKlleonContainerVolume(avatarRef.current, 100);
        unlockKlleonAudio(avatarRef.current);
        flushPending();
      } else if (status === "DESTROYED") {
        setReady(false);
      } else if (
        status === "CONNECTING_FAILED" ||
        status === "SOCKET_FAILED" ||
        status === "STREAMING_FAILED"
      ) {
        setError(
          `Klleon connection failed (${status}). Check SDK key and domain registration.`
        );
      }
    };

    const onChat = (data: KlleonChatData) => {
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
    setKlleonListeners({ onStatus, onChat, onError });

    (async () => {
      try {
        await initKlleonClient(
          {
            sdk_key: sdkKey,
            avatar_id: KLLEON_AVATAR_ID,
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
          setKlleonContainerVolume(el, 100);
        }

        // VIDEO_CAN_PLAY may have fired while the previous Strict Mode mount
        // was tearing down — recover ready from the module flag.
        if (hasKlleonVideoCanPlay()) {
          setReady(true);
          setError(null);
          unlockKlleonAudio(avatarRef.current);
          flushPending();
        }

      } catch (e) {
        if (alive) {
          setError(
            `Klleon init failed: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }
    })();

    return () => {
      alive = false;
      releaseKlleonClient();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkKey, enabled, flushPending]);

  const speak = useCallback(
    (text: string, after?: () => void) => {
      echoAfterRef.current = after ?? null;
      unlockAudio();
      if (!window.KlleonChat || !ready) {
        pendingEchoRef.current = text;
        if (after) setTimeout(after, 2200);
        return;
      }
      try {
        // Restore VIDEO_CAN_PLAY gate — CONNECTED_FINISH otherwise drops echo.
        ensureKlleonSendReady();
        window.KlleonChat.echo(text);
      } catch {
        if (after) setTimeout(after, 1500);
      }
    },
    [ready, unlockAudio]
  );

  const startStt = useCallback(() => {
    if (!window.KlleonChat || !ready) return;
    try {
      ensureKlleonSendReady();
      window.KlleonChat.stopSpeech();
    } catch {
      /* ignore */
    }
    window.KlleonChat.startStt();
  }, [ready]);

  const endStt = useCallback(() => {
    try {
      window.KlleonChat?.endStt();
    } catch {
      /* ignore */
    }
  }, []);

  const cancelStt = useCallback(() => {
    try {
      window.KlleonChat?.cancelStt();
    } catch {
      /* ignore */
    }
  }, []);

  const stopSpeech = useCallback(() => {
    try {
      window.KlleonChat?.stopSpeech();
    } catch {
      /* ignore */
    }
  }, []);

  const onChat = useCallback((handler: (data: KlleonChatData) => void) => {
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
