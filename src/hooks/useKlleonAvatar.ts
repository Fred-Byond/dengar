"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  destroyKlleonClient,
  initKlleonClient,
  KLLEON_AVATAR_ID,
  klleonVoiceCodes,
  setKlleonContainerVolume,
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
 * Preserves debug-proven behaviour: volume stays at 100 after connect;
 * callers must not stopSpeech on their own echo's PREPARING_RESPONSE.
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
      window.KlleonChat.echo(text);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!sdkKey) {
      setError(
        "Missing Klleon SDK key. Set NEXT_PUBLIC_KLLEON_SDK_KEY in .env.local and restart Next."
      );
      return;
    }

    let cancelled = false;
    const codes = klleonVoiceCodes(langCode);

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
          {
            onStatus: (status: KlleonStatus) => {
              if (cancelled) return;
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
            },
            onChat: (data) => {
              if (cancelled) return;
              if (data.chat_type === "RESPONSE_IS_ENDED") {
                const cb = echoAfterRef.current;
                echoAfterRef.current = null;
                cb?.();
              }
              chatHandlersRef.current.forEach((h) => h(data));
            },
            onError: (err) => {
              if (cancelled) return;
              if (err?.message) setError(err.message);
            },
          }
        );

        if (!cancelled && avatarRef.current) {
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
      } catch (e) {
        if (!cancelled) {
          setError(
            `Klleon init failed: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      destroyKlleonClient();
      setReady(false);
    };
    // Re-init only when key/enable change; lang is set at first init for demo.
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

  return {
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
  };
}
