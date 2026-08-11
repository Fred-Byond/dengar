"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Capture one spoken advisor turn and transcribe it with Whisper.
 *
 * HoloMe's built-in STT is tuned for its own conversational loop; here the
 * transcript is scored evidence, so it goes through Whisper with the session
 * language pinned server-side. HoloMe remains the voice OUT (the avatar speaks
 * the approved pack); Whisper is the ear.
 *
 * Push-to-talk rather than voice-activity detection: an advisor practising a
 * pitch pauses mid-sentence to think, and VAD cuts them off exactly there.
 */

export type MicState = "idle" | "recording" | "transcribing";

export interface UseWhisperMicResult {
  state: MicState;
  error: string | null;
  /** True once a MediaRecorder-capable mic has been granted. */
  supported: boolean;
  start: () => Promise<boolean>;
  /** Stops capture and resolves the transcript, or null if nothing usable. */
  stop: () => Promise<string | null>;
  cancel: () => void;
}

/** First container the browser will actually give us. Safari differs from Chrome. */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

export function useWhisperMic(sessionId: string | null): UseWhisperMicResult {
  const [state, setState] = useState<MicState>("idle");
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);

  const teardown = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const start = useCallback(async () => {
    if (!sessionId) return false;
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices) {
      setError("This browser cannot record audio. Type your answer instead.");
      return false;
    }
    setError(null);
    cancelledRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorderRef.current = rec;
      rec.start();
      setState("recording");
      return true;
    } catch {
      teardown();
      setError("Microphone permission is needed to talk to your coach.");
      return false;
    }
  }, [sessionId, teardown]);

  const stop = useCallback(async () => {
    const rec = recorderRef.current;
    if (!rec || !sessionId) {
      teardown();
      setState("idle");
      return null;
    }
    const blob = await new Promise<Blob | null>((resolve) => {
      rec.onstop = () => {
        if (cancelledRef.current || chunksRef.current.length === 0) {
          resolve(null);
          return;
        }
        resolve(new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }));
      };
      try {
        rec.stop();
      } catch {
        resolve(null);
      }
    });
    teardown();

    // Sub-second blobs are almost always a mis-tap, not an utterance.
    if (!blob || blob.size < 2000) {
      setState("idle");
      return null;
    }

    setState("transcribing");
    try {
      const form = new FormData();
      form.append("audio", blob, "utterance.webm");
      const res = await fetch(`/api/coach/sessions/${sessionId}/stt`, {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => null)) as
        | { text?: string; error?: string }
        | null;
      setState("idle");
      if (!res.ok || !data?.text) {
        setError(data?.error ?? "Could not make that out. Try again, or type it.");
        return null;
      }
      return data.text;
    } catch {
      setState("idle");
      setError("Could not reach the transcription service. Type your answer.");
      return null;
    }
  }, [sessionId, teardown]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    try {
      recorderRef.current?.stop();
    } catch {
      /* ignore */
    }
    teardown();
    setState("idle");
  }, [teardown]);

  return {
    state,
    error,
    supported: typeof MediaRecorder !== "undefined",
    start,
    stop,
    cancel,
  };
}
