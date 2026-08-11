"use client";

/**
 * L'Oréal Beauty Coach — advisor journey (Phase 1).
 *
 * access → slots → setup → confirmed → lobby → session → debrief
 *
 * Reuses the dengar chassis patterns: HoloMe avatar puppet (echo/STT),
 * echo-ack retry for silently dropped speech, screen state machine.
 * The conversation itself is served by /api/coach/sessions/[id]/turns —
 * the governed engine — not a hardcoded script.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHoloMeAvatar } from "@/hooks/useHoloMeAvatar";
import { useWhisperMic } from "@/hooks/useWhisperMic";
import type { HoloMeChatData } from "@/types/holome";
import type {
  AdvisorContext,
  Appointment,
  CoachSession,
  DimensionScore,
  Product,
  Scorecard,
  Slot,
} from "@/lib/coach/types";
import { ADVISOR_ROLES } from "@/lib/coach/types";
import styles from "./coach.module.css";

type ScreenId =
  | "landing"
  | "access"
  | "slots"
  | "setup"
  | "confirmed"
  | "lobby"
  | "session"
  | "debrief";

const SESSION_SECONDS = 15 * 60;
const WRAP_AT_SECONDS = 120;

type CatalogFocus = { id: string; label: string };
type DimensionMeta = { id: string; label: string };
type CatalogLang = {
  code: string; englishName: string; nativeName: string;
  bcp47: string; rtl: boolean; voiceCode: string;
};
type CatalogDivision = { id: string; shortName: string; advisorType: string };
type CatalogProduct = Product & { languages?: string[] };

type SessionStart = {
  session: CoachSession;
  greeting: string;
  wrapLine: string;
  closeLine: string;
  product: Product;
};

function Screen({
  active,
  className,
  children,
}: {
  active: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`${styles.screen}${active ? ` ${styles.active}` : ""}${
        className ? ` ${className}` : ""
      }`}
      aria-hidden={!active}
    >
      {children}
    </section>
  );
}

function Brand() {
  return (
    <div>
      <div className={styles.brand}>L&apos;ORÉAL</div>
      <div className={styles.brandSub}>Beauty Coach</div>
    </div>
  );
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export function CoachApp({ sdkKey }: { sdkKey: string }) {
  const [screen, setScreen] = useState<ScreenId>("landing");
  const [error, setError] = useState<string | null>(null);

  // access
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(ADVISOR_ROLES[1].id);
  const [ctx, setCtx] = useState<AdvisorContext | null>(null);
  const [busy, setBusy] = useState(false);

  // booking
  const [slots, setSlots] = useState<Slot[]>([]);
  const [day, setDay] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [focuses, setFocuses] = useState<CatalogFocus[]>([]);
  const [languages, setLanguages] = useState<CatalogLang[]>([]);
  const [divisions, setDivisions] = useState<CatalogDivision[]>([]);
  const [productId, setProductId] = useState<string | null>(null);
  const [focus, setFocus] = useState<string>("product-knowledge");
  const [language, setLanguage] = useState<string>("EN");
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  // lobby + session
  const [lobbyCount, setLobbyCount] = useState(5);
  const [micOk, setMicOk] = useState(false);
  const [start, setStart] = useState<SessionStart | null>(null);
  const [secs, setSecs] = useState(SESSION_SECONDS);
  const [listening, setListening] = useState(false);
  const [caption, setCaption] = useState("…");
  const [youSaid, setYouSaid] = useState("");
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [dimMeta, setDimMeta] = useState<DimensionMeta[]>([]);

  const holome = useHoloMeAvatar({ sdkKey, langCode: language, enabled: true });
  // HoloMe speaks; Whisper listens. The transcript is scored evidence, so it
  // goes through Whisper with the session language pinned server-side.
  const mic = useWhisperMic(start?.session.id ?? null);

  const speakRef = useRef(holome.speak);
  const unlockAudioRef = useRef(holome.unlockAudio);
  const stopSpeechRef = useRef(holome.stopSpeech);
  speakRef.current = holome.speak;
  unlockAudioRef.current = holome.unlockAudio;
  stopSpeechRef.current = holome.stopSpeech;

  const startRef = useRef<SessionStart | null>(null);
  startRef.current = start;
  const closingRef = useRef(false);
  const wrapSaidRef = useRef(false);
  const listeningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStartedRef = useRef(false);
  const awaitingEchoAckRef = useRef<string | null>(null);
  const echoAckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const echoRetryUsedRef = useRef(false);
  const endSessionRef = useRef<() => void>(() => {});
  const sendTurnRef = useRef<(text: string) => void>(() => {});
  const micRef = useRef<ReturnType<typeof useWhisperMic> | null>(null);
  micRef.current = mic;

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  /** Speak with one retry if the SDK silently drops the echo (dengar lesson). */
  const deliverSpeak = useCallback((text: string) => {
    unlockAudioRef.current();
    awaitingEchoAckRef.current = text;
    echoRetryUsedRef.current = false;
    if (echoAckTimerRef.current) clearTimeout(echoAckTimerRef.current);
    speakRef.current(text);
    echoAckTimerRef.current = setTimeout(() => {
      if (awaitingEchoAckRef.current !== text || echoRetryUsedRef.current) return;
      echoRetryUsedRef.current = true;
      unlockAudioRef.current();
      speakRef.current(text);
    }, 1400);
  }, []);

  const sendTurn = useCallback(
    async (utterance: string) => {
      const s = startRef.current;
      if (!s || closingRef.current) return;
      setAwaitingReply(true);
      try {
        const { reply } = await api<{ reply: string }>(
          `/api/coach/sessions/${s.session.id}/turns`,
          { utterance }
        );
        if (closingRef.current) return;
        setCaption(reply);
        deliverSpeak(reply);
      } catch {
        const line =
          "I didn't catch that — could you say it again?";
        setCaption(line);
        deliverSpeak(line);
      } finally {
        setAwaitingReply(false);
      }
    },
    [deliverSpeak]
  );
  sendTurnRef.current = sendTurn;

  const endSession = useCallback(async () => {
    const s = startRef.current;
    if (!s || closingRef.current) return;
    closingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    holome.cancelStt();
    micRef.current?.cancel();
    setListening(false);
    setCaption(s.closeLine);
    deliverSpeak(s.closeLine);
    try {
      const { scorecard: card, dimensions } = await api<{
        scorecard: Scorecard;
        dimensions: DimensionMeta[];
      }>(`/api/coach/sessions/${s.session.id}/end`, {});
      setScorecard(card);
      setDimMeta(dimensions);
    } catch {
      setScorecard(null);
    }
    setTimeout(() => {
      stopSpeechRef.current();
      setScreen("debrief");
    }, 9000);
  }, [deliverSpeak, holome]);
  useEffect(() => {
    endSessionRef.current = endSession;
  }, [endSession]);

  // HoloMe chat events — the turn loop entry point.
  useEffect(() => {
    const unsub = holome.onChat((data: HoloMeChatData) => {
      const type = data.chat_type || "";
      const msg = data.message || "";
      if (type === "STT_RESULT") {
        setListening(false);
        if (msg.trim() && !closingRef.current) {
          setYouSaid(`“${msg.trim()}”`);
          sendTurnRef.current(msg.trim());
        }
      } else if (type === "STT_ERROR") {
        setListening(false);
      } else if (type === "USER_SPEECH_STARTED") {
        setListening(true);
      } else if (type === "PREPARING_RESPONSE") {
        if (echoAckTimerRef.current) clearTimeout(echoAckTimerRef.current);
        awaitingEchoAckRef.current = null;
      }
    });
    return unsub;
  }, [holome]);

  const startSessionTimer = useCallback(() => {
    if (timerStartedRef.current) return;
    timerStartedRef.current = true;
    timerRef.current = setInterval(() => {
      setSecs((prev) => {
        if (closingRef.current) return prev;
        const next = prev - 1;
        const s = startRef.current;
        if (
          next <= WRAP_AT_SECONDS &&
          !wrapSaidRef.current &&
          !listeningRef.current &&
          s
        ) {
          wrapSaidRef.current = true;
          setCaption(s.wrapLine);
          deliverSpeak(s.wrapLine);
        }
        if (next <= 0) {
          endSessionRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [deliverSpeak]);

  // ---------- flow actions ----------

  const doSignIn = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const { context } = await api<{ context: AdvisorContext }>(
        "/api/coach/auth",
        { code, name, role }
      );
      setCtx(context);
      const [{ slots: slotList }, catalog] = await Promise.all([
        api<{ slots: Slot[] }>("/api/coach/slots"),
        api<{
          products: CatalogProduct[]; focuses: CatalogFocus[];
          languages: CatalogLang[]; divisions: CatalogDivision[];
        }>("/api/coach/catalog"),
      ]);
      setSlots(slotList);
      setProducts(catalog.products);
      setFocuses(catalog.focuses);
      setLanguages(catalog.languages ?? []);
      setDivisions(catalog.divisions ?? []);
      setScreen("slots");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }, [code, name, role]);

  const doBook = useCallback(async () => {
    if (!slotId || !productId) return;
    setBusy(true);
    setError(null);
    try {
      const { appointment: appt } = await api<{ appointment: Appointment }>(
        "/api/coach/appointments",
        { slotId, productId, focus, language }
      );
      setAppointment(appt);
      setScreen("confirmed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed.");
    } finally {
      setBusy(false);
    }
  }, [slotId, productId, focus, language]);

  const enterLobby = useCallback(() => {
    setError(null);
    setScreen("lobby");
    setLobbyCount(5);
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setMicOk(true);
      })
      .catch(() => setMicOk(false));
  }, []);

  const beginSession = useCallback(async () => {
    if (!appointment) return;
    setBusy(true);
    setError(null);
    try {
      const started = await api<SessionStart>("/api/coach/sessions", {
        appointmentRef: appointment.ref,
      });
      setStart(started);
      startRef.current = started;
      closingRef.current = false;
      wrapSaidRef.current = false;
      timerStartedRef.current = false;
      setSecs(SESSION_SECONDS);
      setScreen("session");
      unlockAudioRef.current();
      await holome.waitUntilReady(6000);
      setCaption(started.greeting);
      deliverSpeak(started.greeting);
      startSessionTimer();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the session.");
    } finally {
      setBusy(false);
    }
  }, [appointment, deliverSpeak, holome, startSessionTimer]);

  // Lobby countdown → auto start.
  useEffect(() => {
    if (screen !== "lobby") return;
    if (lobbyCount <= 0) {
      void beginSession();
      return;
    }
    const t = setTimeout(() => setLobbyCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, lobbyCount]);

  const toggleMic = useCallback(async () => {
    unlockAudioRef.current();
    if (listening) {
      setListening(false);
      const text = await mic.stop();
      if (text && !closingRef.current) {
        setYouSaid(`\u201c${text}\u201d`);
        sendTurnRef.current(text);
      }
      return;
    }
    // The coach must stop talking before the advisor does, or the avatar's
    // own voice lands in the recording and gets scored as the advisor's.
    stopSpeechRef.current();
    const ok = await mic.start();
    if (ok) setListening(true);
  }, [listening, mic]);

  // ---------- derived ----------

  const days = useMemo(() => {
    const seen = new Map<string, Date>();
    for (const s of slots) {
      const d = new Date(s.startsAt);
      const key = d.toDateString();
      if (!seen.has(key)) seen.set(key, d);
    }
    return Array.from(seen.entries()).slice(0, 7);
  }, [slots]);

  const daySlots = useMemo(
    () => slots.filter((s) => new Date(s.startsAt).toDateString() === day),
    [slots, day]
  );

  const timeLabel = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const mmss = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const selectedProduct = products.find((p) => p.id === productId) ?? null;

  const inSession = screen === "session";

  return (
    <div className={styles.root}>
      <div className={styles.phone}>
        <div className={styles.scene}>
          <avatar-container
            ref={holome.avatarRef as React.RefObject<HTMLElement>}
            className={`${styles.avatar}${holome.ready ? ` ${styles.ready}` : ""}`}
          />
        </div>
        {!inSession ? <div className={styles.veil} /> : null}
        {holome.error && inSession ? (
          <div className={styles.holomeErr}>{holome.error}</div>
        ) : null}

        {/* Landing */}
        <Screen active={screen === "landing"}>
          <Brand />
          <div className={styles.spacer} />
          <h1 className={styles.h1}>
            One launch message.
            <br />
            <em>Every language.</em> Every advisor.
          </h1>
          <p className={styles.lead}>
            Book a private session with your AI Beauty Coach to master the
            latest launch — approved claims, routines, objection handling —
            before you meet the customer.
          </p>
          <button className={styles.btn} onClick={() => setScreen("access")}>
            Book a coaching session
          </button>
          <p className={styles.footNote}>
            For L&apos;Oréal distributors, agents and beauty advisors.
            Demo build — sample content, not brand-approved copy.
          </p>
        </Screen>

        {/* Access */}
        <Screen active={screen === "access"}>
          <Brand />
          <h1 className={styles.h1}>Sign in</h1>
          <p className={styles.lead}>
            Use the access code issued by your distributor. It identifies your
            country, territory and distributor automatically.
          </p>
          <label className={styles.label}>Distributor access code</label>
          <input
            className={styles.input}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. GULF-DXB-2026"
            autoCapitalize="characters"
          />
          <label className={styles.label}>Your name</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
          />
          <label className={styles.label}>Your role</label>
          <select
            className={styles.select}
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
          >
            {ADVISOR_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          {error ? <div className={styles.err}>{error}</div> : null}
          <button
            className={styles.btn}
            onClick={doSignIn}
            disabled={busy || !code.trim() || !name.trim()}
          >
            {busy ? "Checking…" : "Continue"}
          </button>
          <button className={styles.btnGhost} onClick={() => setScreen("landing")}>
            Back
          </button>
        </Screen>

        {/* Slots */}
        <Screen active={screen === "slots"}>
          <Brand />
          {ctx ? (
            <div className={styles.orgCard}>
              <b>{ctx.advisorName}</b> · {ctx.distributorName}
              <br />
              {ctx.territoryName}, {ctx.marketName}
            </div>
          ) : null}
          <h1 className={styles.h1}>Choose a time</h1>
          <div className={styles.dayRow}>
            {days.map(([key, d]) => (
              <button
                key={key}
                className={`${styles.dayChip}${day === key ? ` ${styles.sel}` : ""}`}
                onClick={() => {
                  setDay(key);
                  setSlotId(null);
                }}
              >
                {d.toLocaleDateString([], { weekday: "short" })}
                <br />
                {d.toLocaleDateString([], { day: "numeric", month: "short" })}
              </button>
            ))}
          </div>
          <div className={styles.slotGrid}>
            {daySlots.map((s) => {
              const left = s.capacity - s.booked;
              const full = left <= 0;
              return (
                <button
                  key={s.id}
                  className={`${styles.slot}${slotId === s.id ? ` ${styles.sel}` : ""}${full ? ` ${styles.full}` : ""}`}
                  disabled={full}
                  onClick={() => setSlotId(s.id)}
                >
                  {timeLabel(s.startsAt)}
                  <span className={styles.slotCap}>
                    {full ? "Full" : `${left} seat${left > 1 ? "s" : ""}`}
                  </span>
                </button>
              );
            })}
          </div>
          {!day ? (
            <p className={styles.lead} style={{ marginTop: 12 }}>
              Pick a day to see available coaching slots.
            </p>
          ) : null}
          <div className={styles.spacer} />
          <button
            className={styles.btn}
            disabled={!slotId}
            onClick={() => setScreen("setup")}
          >
            Next: session focus
          </button>
        </Screen>

        {/* Setup */}
        <Screen active={screen === "setup"}>
          <Brand />
          <h1 className={styles.h1}>What shall we work on?</h1>
          <label className={styles.label}>Product / launch</label>
          {products.map((p) => (
            <button
              key={p.id}
              className={`${styles.prodCard}${productId === p.id ? ` ${styles.sel}` : ""}`}
              onClick={() => setProductId(p.id)}
            >
              <span className={styles.prodRow}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/coach/product-image/${p.id}`}
                  alt=""
                  className={styles.prodImg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span>
                  {p.launchLabel ? (
                    <span className={styles.launchBadge}>{p.launchLabel}</span>
                  ) : null}
                  <div className={styles.prodBrand}>
                    {p.brand}
                    {p.divisionId
                      ? ` · ${divisions.find((d) => d.id === p.divisionId)?.shortName ?? ""}`
                      : ""}
                  </div>
                  <div className={styles.prodName}>{p.name}</div>
                  <div className={styles.prodTag}>{p.tagline}</div>
                </span>
              </span>
            </button>
          ))}
          <label className={styles.label}>Coaching focus</label>
          <div className={styles.chipRow}>
            {focuses.map((f) => (
              <button
                key={f.id}
                className={`${styles.chip}${focus === f.id ? ` ${styles.sel}` : ""}`}
                onClick={() => setFocus(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className={styles.label}>Session language</label>
          <div className={styles.chipRow}>
            {languages.map((l) => {
              const available =
                !selectedProduct?.languages ||
                selectedProduct.languages.includes(l.code);
              return (
                <button
                  key={l.code}
                  className={`${styles.chip}${language === l.code ? ` ${styles.sel}` : ""}`}
                  disabled={!available}
                  title={
                    available
                      ? `${l.englishName} — the coach speaks and listens in this language`
                      : `No market-approved ${l.englishName} pack for this product yet`
                  }
                  onClick={() => setLanguage(l.code)}
                  dir={l.rtl ? "rtl" : "ltr"}
                >
                  {l.nativeName}
                </button>
              );
            })}
          </div>
          <p className={styles.footNote} style={{ marginTop: 6, textAlign: "left" }}>
            Only languages with a market-approved pack are selectable — the coach
            will not speak a draft translation as brand truth.
          </p>
          {error ? <div className={styles.err}>{error}</div> : null}
          <button
            className={styles.btn}
            disabled={busy || !productId}
            onClick={doBook}
          >
            {busy ? "Booking…" : "Confirm appointment"}
          </button>
          <button className={styles.btnGhost} onClick={() => setScreen("slots")}>
            Back
          </button>
        </Screen>

        {/* Confirmed */}
        <Screen active={screen === "confirmed"}>
          <Brand />
          <h1 className={styles.h1}>
            You&apos;re booked, <em>{ctx?.advisorName.split(" ")[0]}</em>.
          </h1>
          <div className={styles.refBox}>
            <div className={styles.label} style={{ margin: 0 }}>
              Booking reference
            </div>
            <div className={styles.refCode}>{appointment?.ref}</div>
          </div>
          <div className={styles.sumList}>
            <b>Product:</b> {selectedProduct?.name}
            <br />
            <b>Focus:</b> {focuses.find((f) => f.id === focus)?.label}
            <br />
            <b>Distributor:</b> {ctx?.distributorName} ({ctx?.territoryName},{" "}
            {ctx?.marketName})
          </div>
          <div className={styles.spacer} />
          <button className={styles.btn} onClick={enterLobby}>
            Join session now
          </button>
          <p className={styles.footNote}>
            In production you would receive a WhatsApp reminder 15 minutes
            before your slot. For this demo, join directly.
          </p>
        </Screen>

        {/* Lobby */}
        <Screen active={screen === "lobby"}>
          <Brand />
          <h1 className={styles.h1}>Your coach is getting ready</h1>
          <div className={styles.lobbyCount}>{lobbyCount > 0 ? lobbyCount : "…"}</div>
          <div className={styles.checkItem}>
            <span className={styles.checkDot}>{micOk ? "✓" : "…"}</span>
            Microphone {micOk ? "ready" : "permission needed"} — your coach hears
            you in {languages.find((l) => l.code === language)?.englishName ?? "your language"}
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkDot}>✓</span>
            Launch pack loaded: {selectedProduct?.name}
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkDot}>✓</span>
            Session is private — practise freely, retry any time
          </div>
          {error ? <div className={styles.err}>{error}</div> : null}
        </Screen>

        {/* Session */}
        <Screen active={inSession} className={styles.sessionScreen}>
          <div className={styles.sessionTop}>
            <span className={styles.sessionBrand}>L&apos;ORÉAL</span>
            <span className={styles.timer}>{mmss}</span>
          </div>
          <div
            className={styles.captionWrap}
            dir={languages.find((l) => l.code === language)?.rtl ? "rtl" : "ltr"}
          >
            <div className={styles.caption}>
              {awaitingReply ? (
                <span className={styles.thinking}>Coach is thinking…</span>
              ) : (
                caption
              )}
            </div>
            {youSaid ? <div className={styles.youSaid}>You: {youSaid}</div> : null}
            {mic.error ? <div className={styles.err}>{mic.error}</div> : null}
          </div>
          <div className={styles.sessionControls}>
            <button className={styles.endBtn} onClick={() => endSessionRef.current()}>
              End session
            </button>
            <div style={{ position: "relative" }}>
              <button
                className={`${styles.micBtn}${listening ? ` ${styles.listening}` : ""}`}
                onClick={() => void toggleMic()}
                disabled={awaitingReply || mic.state === "transcribing"}
                aria-label={listening ? "Stop talking" : "Talk to coach"}
              >
                🎙
              </button>
              <span className={styles.micHint}>
                {mic.state === "transcribing"
                  ? "Transcribing…"
                  : listening
                    ? "Tap when done"
                    : "Tap to talk"}
              </span>
            </div>
            <span style={{ width: 88 }} />
          </div>
        </Screen>

        {/* Debrief */}
        <Screen active={screen === "debrief"}>
          <Brand />
          <h1 className={styles.h1}>Launch readiness</h1>
          {scorecard ? (
            <>
              <div className={styles.scoreHero}>
                <div className={styles.scoreBig}>{scorecard.overall}</div>
                <span
                  className={`${styles.scoreCert} ${scorecard.certified ? styles.certYes : styles.certNo}`}
                >
                  {scorecard.certified
                    ? "Launch-Ready · Certified"
                    : "Keep practising"}
                </span>
              </div>
              {scorecard.dimensions.map((d: DimensionScore) => {
                const meta = dimMeta.find((m) => m.id === d.dimensionId);
                const numeric = typeof d.score === "number";
                return (
                  <div key={d.dimensionId} className={styles.dimRow}>
                    <div className={styles.dimHead}>
                      <span>{meta?.label ?? d.dimensionId}</span>
                      <span className={styles.dimScore}>
                        {numeric ? d.score : d.score === "NE" ? "Not tested" : "—"}
                      </span>
                    </div>
                    <div className={styles.dimBar}>
                      <div
                        className={styles.dimFill}
                        style={{ width: numeric ? `${d.score}%` : "0%" }}
                      />
                    </div>
                    <div className={styles.dimNote}>{d.note}</div>
                    {d.evidence ? (
                      <div className={styles.evidence}>“{d.evidence}”</div>
                    ) : null}
                  </div>
                );
              })}
              {scorecard.practiceNext.length ? (
                <div className={styles.practiceBox}>
                  <b>Practise next</b>
                  <br />
                  {scorecard.practiceNext.map((p) => (
                    <div key={p}>• {p}</div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className={styles.lead}>
              Session recorded. Scorecard unavailable — please try again.
            </p>
          )}
          <div className={styles.spacer} />
          <button
            className={styles.btn}
            onClick={() => {
              setScorecard(null);
              setStart(null);
              setYouSaid("");
              setCaption("…");
              setScreen("slots");
            }}
          >
            Book another session
          </button>
          <p className={styles.footNote}>
            Scores are pilot heuristics with verbatim evidence. Dimensions not
            exercised in-session are marked “Not tested”, never invented.
          </p>
        </Screen>
      </div>
    </div>
  );
}
