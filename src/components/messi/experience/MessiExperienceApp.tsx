"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useKlleonAvatar } from "@/hooks/useKlleonAvatar";
import type { KlleonChatData } from "@/types/klleon";
import { MARKETS, type Market } from "@/lib/messi/markets";
import { TIERS } from "@/lib/messi/commercial";
import type { MembershipTier } from "@/lib/messi/fvif";
import { I18N, type UiLang } from "./i18n";
import {
  LANGS,
  LANG_BY_CODE,
  VEILED_SCREENS,
  type ScreenId,
  type SessionLang,
} from "./langs";
import { M, pickScriptReply } from "./script";
import styles from "./messi.module.css";

export type MessiExperienceAppProps = {
  sdkKey: string;
};

type DayOption = { date: Date; full: boolean };

function fmt(secs: number) {
  return (
    String(Math.floor(secs / 60)).padStart(2, "0") +
    ":" +
    String(secs % 60).padStart(2, "0")
  );
}

/**
 * MESSI.LIVE lockup. On the landing screen the right slot is the language
 * chooser rather than the territory label — the digital human is the hero, so
 * the only chrome over him is the brand and the one choice that changes the
 * conversation.
 */
function Brand({
  territory,
  langLabel,
  onPickLang,
}: {
  territory: string;
  langLabel?: string;
  onPickLang?: () => void;
}) {
  return (
    <div className={styles.brand}>
      <div className={styles.wordmark}>
        <svg className={styles.mark} viewBox="0 0 26 26" fill="none" aria-hidden>
          <circle cx="13" cy="13" r="12" stroke="#75AADB" strokeWidth="1.4" opacity=".55" />
          <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
            <path d="M7 18 V9" />
            <path d="M13 18 V7" />
            <path d="M19 18 V9" />
          </g>
          <circle cx="13" cy="20.5" r="1.6" fill="#E7B94E" />
        </svg>
        <div className={styles.wm}>
          MESSI<span>.LIVE</span>
        </div>
      </div>
      {onPickLang ? (
        <button type="button" className={styles.langPillTop} onClick={onPickLang}>
          🌐 {langLabel} ▾
        </button>
      ) : (
        <div className={styles.market}>
          <div className={styles.t}>{territory}</div>
        </div>
      )}
    </div>
  );
}

function Screen({
  id,
  active,
  children,
  className,
}: {
  id: ScreenId;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`${styles.screen} ${active ? styles.screenActive : ""} ${className ?? ""}`}
      data-screen={id}
      aria-hidden={!active}
    >
      {children}
    </section>
  );
}

const COUNTRIES = MARKETS.map((m) => m.country);

export function MessiExperienceApp({ sdkKey }: MessiExperienceAppProps) {
  const [uiLang, setUiLang] = useState<UiLang>("en");
  const [screen, setScreen] = useState<ScreenId>("landing");
  const [sessionLang, setSessionLang] = useState<SessionLang>(LANGS[0]);
  const [userPickedLang, setUserPickedLang] = useState(false);

  const [tier, setTier] = useState<MembershipTier>("free");
  const [day, setDay] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [theme, setTheme] = useState("");
  const [consentAI, setConsentAI] = useState(false);
  const [consentMemory, setConsentMemory] = useState(true);
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [refCode, setRefCode] = useState("");
  /** Demo affordance for slide 6 — the fan Messi already remembers. */
  const [returning, setReturning] = useState(false);

  const [lobbyCount, setLobbyCount] = useState(10);
  const [micOk, setMicOk] = useState(false);
  const [micBtnLabel, setMicBtnLabel] = useState<string | null>(null);

  const [secs, setSecs] = useState(300);
  const [listening, setListening] = useState(false);
  const [caption, setCaption] = useState("…");
  const [youSaid, setYouSaid] = useState("");
  const [, setStage] = useState(0);
  const [saidText, setSaidText] = useState("");
  const [micUnavailable, setMicUnavailable] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [stars, setStars] = useState(-1);
  const [fanNo, setFanNo] = useState(0);
  const [summaryHtml, setSummaryHtml] = useState("");
  const [memoryFact, setMemoryFact] = useState("");

  const stageRef = useRef(0);
  const closingRef = useRef(false);
  const wrapSaidRef = useRef(false);
  const listeningRef = useRef(false);
  const endSessionRef = useRef<() => void>(() => {});
  const scriptReplyRef = useRef<string | null>(null);
  const expectScriptRef = useRef(false);
  const scriptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Text pending until SDK PREPARING_RESPONSE / RESPONSE_IS_ENDED; retry once if silent-dropped. */
  const awaitingEchoAckRef = useRef<string | null>(null);
  const echoAckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const echoRetryUsedRef = useRef(false);
  const queueScriptReplyRef = useRef<() => void>(() => {});
  const closedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lobbyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [awaitingAudioTap, setAwaitingAudioTap] = useState(false);
  const awaitingAudioTapRef = useRef(false);
  const lobbyAutoStartedRef = useRef(false);
  const startSessionRef = useRef<(opts?: { hasUserGesture?: boolean }) => void>(
    () => {}
  );
  const saidTextRef = useRef("");
  const noteUserUtteranceRef = useRef<(txt: string) => void>(() => {});
  const sessionTimerStartedRef = useRef(false);

  const t = I18N[uiLang];
  const veiled = VEILED_SCREENS.has(screen);

  const market: Market | undefined = useMemo(
    () => MARKETS.find((m) => m.country === country),
    [country]
  );
  const territory = market?.territory ?? "MESSI.LIVE GLOBAL";
  const isMinor = ageBand === "under-13" || ageBand === "13-17";
  const tierDef = TIERS.find((x) => x.id === tier) ?? TIERS[0];

  const klleon = useKlleonAvatar({
    sdkKey,
    langCode: sessionLang.code,
    enabled: true,
  });

  const speakRef = useRef(klleon.speak);
  const stopSpeechRef = useRef(klleon.stopSpeech);
  const unlockAudioRef = useRef(klleon.unlockAudio);
  speakRef.current = klleon.speak;
  stopSpeechRef.current = klleon.stopSpeech;
  unlockAudioRef.current = klleon.unlockAudio;
  saidTextRef.current = saidText;

  const days: DayOption[] = useMemo(() => {
    const now = new Date();
    const out: DayOption[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      out.push({ date: d, full: i === 2 || i === 4 });
    }
    return out;
  }, []);

  const go = useCallback((id: ScreenId) => setScreen(id), []);

  const changeUiLang = (l: UiLang) => {
    setUiLang(l);
    if (!userPickedLang) {
      setSessionLang(l === "es" ? LANG_BY_CODE.ES : LANG_BY_CODE.EN);
    }
  };

  const pickLang = (l: SessionLang) => {
    setSessionLang(l);
    setUserPickedLang(true);
    setLangModalOpen(false);
  };

  /**
   * Slots. Priority slots are a MESSI+ benefit (slide 17) — free members can
   * see them but not take them, which is the whole membership argument in one
   * interaction.
   */
  const buildSlots = (seed: number) => {
    const times: string[] = [];
    for (let h = 17; h <= 18; h++) {
      for (let m = 0; m < 60; m += 5) {
        times.push(`${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} PM`);
      }
    }
    times.push("8:00 PM", "8:05 PM", "8:10 PM", "8:15 PM", "8:20 PM", "8:25 PM");
    return times.map((tm, j) => ({
      tm,
      taken: (seed * 7 + j * 13) % 10 < 5,
      priority: (seed * 3 + j * 5) % 7 === 0,
    }));
  };

  const selectedDayIdx = day
    ? days.findIndex((d) => d.date.getTime() === day.getTime())
    : -1;
  const slots = selectedDayIdx >= 0 ? buildSlots(selectedDayIdx) : [];

  const clearEchoAckWatch = useCallback(() => {
    awaitingEchoAckRef.current = null;
    echoRetryUsedRef.current = false;
    if (echoAckTimerRef.current) {
      clearTimeout(echoAckTimerRef.current);
      echoAckTimerRef.current = null;
    }
  }, []);

  /** Speak a scripted line and retry once if the SDK never acks (silent echo drop). */
  const deliverScriptSpeak = useCallback(
    (text: string) => {
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
        echoAckTimerRef.current = setTimeout(() => {
          if (awaitingEchoAckRef.current === text) {
            clearEchoAckWatch();
          }
        }, 1500);
      }, 1200);
    },
    [clearEchoAckWatch]
  );

  const queueScriptReply = useCallback(() => {
    const reply = pickScriptReply(stageRef.current, sessionLang.code);
    expectScriptRef.current = true;
    scriptReplyRef.current = reply;
    setCaption(reply);
    if (scriptTimerRef.current) clearTimeout(scriptTimerRef.current);
    scriptTimerRef.current = setTimeout(() => {
      if (!scriptReplyRef.current) return;
      const text = scriptReplyRef.current;
      scriptReplyRef.current = null;
      try {
        stopSpeechRef.current();
      } catch {
        /* ignore */
      }
      deliverScriptSpeak(text);
    }, 700);
  }, [deliverScriptSpeak, sessionLang.code]);
  queueScriptReplyRef.current = queueScriptReply;

  const noteUserUtterance = useCallback(
    (txt: string) => {
      setListening(false);
      if (closingRef.current) return;
      if (txt.trim() && !saidTextRef.current) setSaidText(txt.trim());
      queueScriptReply();
      stageRef.current += 1;
      setStage(stageRef.current);
    },
    [queueScriptReply]
  );
  noteUserUtteranceRef.current = noteUserUtterance;

  useEffect(() => {
    const unsub = klleon.onChat((data: KlleonChatData) => {
      const type = data.chat_type || "";
      const msg = data.message || "";
      if (type === "STT_RESULT") {
        if (msg.trim()) {
          setYouSaid(`“${msg}”`);
          noteUserUtteranceRef.current(msg);
        } else if (!closingRef.current) {
          // Empty transcript — still speak so the turn never goes silent.
          queueScriptReplyRef.current();
        }
        setListening(false);
      } else if (type === "STT_ERROR") {
        // Klleon fires STT_ERROR mainly when there is no voice data (e.g. stop
        // without speaking) — not a broken mic. Keep the turn moving.
        setListening(false);
        if (!closingRef.current) queueScriptReplyRef.current();
      } else if (type === "PREPARING_RESPONSE") {
        if (awaitingEchoAckRef.current) {
          if (echoAckTimerRef.current) {
            clearTimeout(echoAckTimerRef.current);
            echoAckTimerRef.current = null;
          }
          awaitingEchoAckRef.current = null;
        }
        if (expectScriptRef.current && scriptReplyRef.current) {
          const text = scriptReplyRef.current;
          scriptReplyRef.current = null;
          if (scriptTimerRef.current) clearTimeout(scriptTimerRef.current);
          stopSpeechRef.current();
          deliverScriptSpeak(text);
        }
      } else if (type === "TEXT" && msg) {
        if (expectScriptRef.current) return;
        setCaption(msg);
      } else if (type === "RESPONSE_IS_ENDED") {
        clearEchoAckWatch();
        expectScriptRef.current = false;
      } else if (type === "USER_SPEECH_STARTED") {
        setListening(true);
      }
    });
    return () => {
      unsub();
    };
  }, [clearEchoAckWatch, deliverScriptSpeak, klleon.onChat]);

  const showClosing = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    stopSpeechRef.current();
    closingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);

    const place = region && country ? `${region}, ${country}` : country || "your city";
    const themeLabel = theme || t.themes[0];
    let quote = saidText.trim();
    if (quote.length > 140) {
      quote = quote.slice(0, 138).replace(/\s+\S*$/, "") + "…";
    }
    let summary: string;
    if (quote) summary = t.sumWith(themeLabel, place, quote);
    else if (theme) summary = t.sumTheme(themeLabel, place);
    else summary = t.sumGeneric(place);
    setSummaryHtml(summary);

    // The memory candidate — what digital Messi would carry into the next
    // conversation, and only if the fan opted in.
    setMemoryFact(quote ? (quote.length > 90 ? quote.slice(0, 88).replace(/\s+\S*$/, "") + "…" : quote) : themeLabel);

    const n =
      4_100_000 +
      Math.floor(Math.random() * 90_000) +
      (refCode ? parseInt(refCode.slice(-3), 10) || 0 : 0);
    setFanNo(n);
    go("closing");
  }, [country, go, refCode, region, saidText, t, theme]);

  const endSession = useCallback(() => {
    closingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    klleon.cancelStt();
    setListening(false);
    const first = (name || "amigo").split(" ")[0];
    speakRef.current(M.close(sessionLang.code, first), () => {
      setTimeout(showClosing, 600);
    });
    setTimeout(showClosing, 14000);
  }, [klleon.cancelStt, name, sessionLang.code, showClosing]);

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  useEffect(() => {
    endSessionRef.current = endSession;
  }, [endSession]);

  const startSessionTimer = useCallback(() => {
    if (sessionTimerStartedRef.current) return;
    sessionTimerStartedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecs((prev) => {
        if (closingRef.current) return prev;
        const next = prev - 1;
        if (next <= 60 && !wrapSaidRef.current && !listeningRef.current) {
          wrapSaidRef.current = true;
          speakRef.current(M.wrap(sessionLang.code));
        }
        if (next <= 0) {
          endSessionRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [sessionLang.code]);

  const speakGreeting = useCallback(() => {
    const first = (name || "amigo").split(" ")[0];
    const text = M.greet(sessionLang.code, first, returning && consentMemory);
    // Caption comes from SDK TEXT chunks as TTS streams — do not fake full text.
    setCaption("…");
    unlockAudioRef.current();
    speakRef.current(text);
  }, [consentMemory, name, returning, sessionLang.code]);

  const startSession = useCallback(
    (opts?: { hasUserGesture?: boolean }) => {
      const hasGesture = !!opts?.hasUserGesture;
      go("session");
      unlockAudioRef.current();
      klleon.setVolume(100);
      stageRef.current = 0;
      setStage(0);
      setSecs(300);
      wrapSaidRef.current = false;
      closingRef.current = false;
      closedRef.current = false;
      sessionTimerStartedRef.current = false;
      setSaidText("");
      setYouSaid("");
      setMicUnavailable(false);

      if (timerRef.current) clearInterval(timerRef.current);

      if (hasGesture) {
        awaitingAudioTapRef.current = false;
        setAwaitingAudioTap(false);
        setCaption("…");
        startSessionTimer();
        setTimeout(() => speakGreeting(), 600);
      } else {
        // Timer auto-start has no user gesture — browsers block audible TTS.
        // Enter the session UI, then wait for a tap before greeting.
        awaitingAudioTapRef.current = true;
        setAwaitingAudioTap(true);
        setCaption(t.tapToHear);
      }
    },
    [go, klleon.setVolume, speakGreeting, startSessionTimer, t.tapToHear]
  );

  startSessionRef.current = startSession;

  const primeMicAndUnlock = useCallback(async () => {
    unlockAudioRef.current();
    let ok = micOk;
    if (!micOk && navigator.mediaDevices?.getUserMedia) {
      try {
        const st = await navigator.mediaDevices.getUserMedia({ audio: true });
        st.getTracks().forEach((x) => x.stop());
        setMicOk(true);
        setMicBtnLabel(null);
        ok = true;
      } catch {
        /* ignore — mic permission denied or unavailable */
      }
    }
    unlockAudioRef.current();
    return ok;
  }, [micOk]);

  const beginFromGesture = useCallback(async () => {
    if (!awaitingAudioTapRef.current) return;
    awaitingAudioTapRef.current = false;
    setAwaitingAudioTap(false);
    await primeMicAndUnlock();
    setCaption("…");
    startSessionTimer();
    speakGreeting();
  }, [primeMicAndUnlock, speakGreeting, startSessionTimer]);

  const enterSessionFromLobby = useCallback(async () => {
    if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
    lobbyAutoStartedRef.current = true;
    await primeMicAndUnlock();
    startSessionRef.current({ hasUserGesture: true });
  }, [primeMicAndUnlock]);

  // Auto-enter the session UI when the lobby countdown reaches 0 — the greeting
  // still waits for a tap (browser autoplay blocks audible TTS).
  useEffect(() => {
    if (screen !== "lobby" || lobbyCount !== 0 || lobbyAutoStartedRef.current) return;
    lobbyAutoStartedRef.current = true;
    startSessionRef.current({ hasUserGesture: false });
  }, [lobbyCount, screen]);

  const startLobby = () => {
    lobbyAutoStartedRef.current = false;
    go("lobby");
    setLobbyCount(10);
    if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
    lobbyTimerRef.current = setInterval(() => {
      setLobbyCount((n) => {
        if (n <= 1) {
          if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
  };

  const askMic = async () => {
    unlockAudioRef.current();
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicBtnLabel(t.micNA);
      return;
    }
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: true });
      st.getTracks().forEach((x) => x.stop());
      setMicOk(true);
      setMicBtnLabel(null);
    } catch {
      setMicBtnLabel(t.micBlocked);
    }
    unlockAudioRef.current();
  };

  const toggleMic = async () => {
    if (closingRef.current) return;
    if (awaitingAudioTapRef.current) {
      await beginFromGesture();
      return;
    }
    if (listeningRef.current) {
      klleon.endStt();
      setListening(false);
      return;
    }
    // Mic tap is a user gesture — prime permission + audio unlock before STT.
    const micPrimed = await primeMicAndUnlock();
    if (!micPrimed) {
      setMicUnavailable(true);
      return;
    }
    const avatarReady = await klleon.waitUntilReady();
    if (!avatarReady) {
      setMicUnavailable(true);
      return;
    }
    setYouSaid("");
    setMicUnavailable(false);
    if (!klleon.startStt()) {
      setMicUnavailable(true);
      return;
    }
    setListening(true);
  };

  const toOtp = () => {
    if (!name.trim()) {
      alert(t.vName);
      return;
    }
    if (!phone.trim()) {
      alert(t.vPhone);
      return;
    }
    if (!country || !region) {
      alert(t.vGeo);
      return;
    }
    if (!ageBand) {
      alert(t.vAge);
      return;
    }
    if (!consentAI) {
      alert(t.vConsent);
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtp(code);
    setOtpDigits(["", "", "", "", "", ""]);
    go("otp");
  };

  const confirmBooking = () => {
    const r =
      "MSL-2026-" +
      String(Math.floor(1000 + Math.random() * 9000)) +
      String(Math.floor(10 + Math.random() * 89));
    setRefCode(r);
    go("confirmed");
  };

  const restart = () => {
    closedRef.current = false;
    stageRef.current = 0;
    setStage(0);
    setDay(null);
    setTime(null);
    setSaidText("");
    setFanNo(0);
    setStars(-1);
    setConsentAI(false);
    setReturning(false);
    go("landing");
  };

  /** Demo shortcut: enter as a fan MESSI.LIVE already remembers (slide 6). */
  const startAsReturning = () => {
    setReturning(true);
    setConsentMemory(true);
    setName(uiLang === "es" ? "Mateo" : "Mateo");
    setCountry("Argentina");
    setRegion("Rosario");
    setAgeBand("13-17");
    setTheme(t.themes[4]);
    setSessionLang(LANG_BY_CODE.ES);
    setUserPickedLang(true);
    setRefCode("MSL-2026-004512");
    go("reminder");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
      if (scriptTimerRef.current) clearTimeout(scriptTimerRef.current);
    };
  }, []);

  const dateLabel = day
    ? day.toLocaleDateString(t.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

  return (
    <div className={styles.root}>
      <div
        className={`${styles.phone} ${veiled ? styles.veiled : ""}`}
        onPointerDown={() => {
          // Only unlock during session / audio gate — lobby pointer spam was
          // thrashing Agora volume/play and dropping echo signalling.
          if (awaitingAudioTapRef.current) {
            void beginFromGesture();
            return;
          }
          if (screen === "session") unlockAudioRef.current();
        }}
      >
        <div className={styles.demoTag}>{t.demoTag}</div>

        <div className={styles.uiLangTgl}>
          <div className={styles.box}>
            <button
              type="button"
              className={uiLang === "en" ? styles.on : ""}
              onClick={() => changeUiLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={uiLang === "es" ? styles.on : ""}
              onClick={() => changeUiLang("es")}
            >
              ES
            </button>
          </div>
        </div>

        <div className={styles.scene}>
          <avatar-container
            ref={klleon.avatarRef as React.RefObject<HTMLElement>}
            className={`${styles.avatar}${klleon.ready ? ` ${styles.ready}` : ""}`}
          />
        </div>
        <div className={styles.veil} />
        {klleon.error ? (
          <div className={styles.klleonErr}>{klleon.error}</div>
        ) : null}

        {/* Landing */}
        <Screen id="landing" active={screen === "landing"} className={styles.sLanding}>
          <Brand
            territory={territory}
            langLabel={sessionLang.code}
            onPickLang={() => setLangModalOpen(true)}
          />
          <div className={styles.who}>
            <b>Lionel Messi</b>
            <small>
              {t.role} · {territory}
            </small>
          </div>
          <div className={styles.heroSpacer} />
          <div className={styles.sheet}>
            <h1>
              {t.heroA}
              <em>{t.heroB}</em>
              {t.heroC}
            </h1>
            <p className={styles.lead}>{t.leadShort}</p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.ic}>📅</div>
                <b>{t.st1}</b>
                <small>{t.st1s}</small>
              </div>
              <div className={styles.step}>
                <div className={styles.ic}>💬</div>
                <b>{t.st2}</b>
                <small>{t.st2s}</small>
              </div>
              <div className={styles.step}>
                <div className={styles.ic}>🧠</div>
                <b>{t.st3}</b>
                <small>{t.st3s}</small>
              </div>
            </div>
            <button type="button" className={styles.btn} onClick={() => go("tiers")}>
              {t.cta}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.ghost}`}
              style={{ marginTop: 10, fontSize: 13.5 }}
              onClick={startAsReturning}
            >
              {t.returningCta}
            </button>
            <p className={styles.pdpa}>{t.privacyShort}</p>
          </div>
        </Screen>

        {/* Membership */}
        <Screen id="tiers" active={screen === "tiers"}>
          <button type="button" className={styles.back} onClick={() => go("landing")}>
            ←
          </button>
          <div className={styles.formwrap}>
            <div className={styles.card}>
              <div className={styles.eyebrow}>{t.step1}</div>
              <h2 className={styles.title}>{t.tierTitle}</h2>
              <p className={styles.sub}>{t.tierSub}</p>
              <div className={styles.tierGrid}>
                {TIERS.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    className={`${styles.tierCard}${x.id === "free" ? "" : ` ${styles.plus}`}${
                      tier === x.id ? ` ${styles.sel}` : ""
                    }`}
                    onClick={() => setTier(x.id)}
                  >
                    <div className={styles.tierHead}>
                      <span className={styles.tierName}>{x.name}</span>
                      {x.id !== "free" ? (
                        <span className={styles.badgePlus}>MESSI+</span>
                      ) : null}
                      <span className={styles.tierPrice}>{x.price}</span>
                    </div>
                    <div className={styles.tierPos}>{x.positioning}</div>
                    <ul className={styles.tierBenefits}>
                      {x.benefits.slice(0, 4).map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <p className={styles.lockNote}>{t.tierFreeNote}</p>
              <button type="button" className={styles.btn} onClick={() => go("slots")}>
                {t.continue}
              </button>
            </div>
          </div>
        </Screen>

        {/* Slots */}
        <Screen id="slots" active={screen === "slots"}>
          <button type="button" className={styles.back} onClick={() => go("tiers")}>
            ←
          </button>
          <div className={styles.formwrap}>
            <div className={styles.card}>
              <div className={styles.eyebrow}>{t.step2}</div>
              <h2 className={styles.title}>{t.slotTitle}</h2>
              <p className={styles.sub}>{t.slotSub}</p>
              <label className={styles.labelF}>{t.dateLbl}</label>
              <div className={styles.days}>
                {days.map((d, i) => (
                  <div
                    key={d.date.toISOString()}
                    className={`${styles.day}${d.full ? ` ${styles.full}` : ""}${
                      selectedDayIdx === i ? ` ${styles.sel}` : ""
                    }`}
                    onClick={() => {
                      if (d.full) return;
                      setDay(d.date);
                      setTime(null);
                    }}
                  >
                    <small>
                      {d.date.toLocaleDateString(t.locale, { weekday: "short" })}
                    </small>
                    <b>{d.date.getDate()}</b>
                    <em>
                      {d.full
                        ? t.fullyBooked
                        : d.date.toLocaleDateString(t.locale, { month: "short" })}
                    </em>
                  </div>
                ))}
              </div>
              <label className={styles.labelF}>{t.timeLbl}</label>
              <div className={styles.slots}>
                {slots.map(({ tm, taken, priority }) => {
                  const locked = taken || (priority && tier === "free");
                  return (
                    <div
                      key={tm}
                      className={`${styles.slot}${locked ? ` ${styles.taken}` : ""}${
                        time === tm ? ` ${styles.sel}` : ""
                      }`}
                      onClick={() => {
                        if (locked) return;
                        setTime(tm);
                      }}
                    >
                      {priority ? "★ " : ""}
                      {tm}
                    </div>
                  );
                })}
              </div>
              <p className={styles.lockNote}>
                {t.lockNote} ★ {t.priorityNote}
              </p>
              <button
                type="button"
                className={styles.btn}
                disabled={!day || !time}
                onClick={() => go("register")}
              >
                {t.continue}
              </button>
            </div>
          </div>
        </Screen>

        {/* Register */}
        <Screen id="register" active={screen === "register"}>
          <button type="button" className={styles.back} onClick={() => go("slots")}>
            ←
          </button>
          <div className={styles.formwrap}>
            <div className={styles.card}>
              <div className={styles.eyebrow}>{t.step3}</div>
              <h2 className={styles.title}>{t.regTitle}</h2>
              <p className={styles.sub}>{t.regSub}</p>
              <label className={styles.labelF}>{t.fName}</label>
              <input
                className={styles.inputF}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePh}
              />
              <label className={styles.labelF}>{t.fPhone}</label>
              <input
                className={styles.inputF}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePh}
              />
              <label className={styles.labelF}>{t.fCountry}</label>
              <select
                className={styles.selectF}
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setRegion("");
                  const m = MARKETS.find((x) => x.country === e.target.value);
                  if (m && !userPickedLang) {
                    setSessionLang(LANG_BY_CODE[m.primaryLanguage] ?? LANGS[0]);
                  }
                }}
              >
                <option value="">{t.chooseCountry}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label className={styles.labelF}>{t.fRegion}</label>
              <select
                className={styles.selectF}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={!country}
              >
                <option value="">
                  {country ? t.chooseRegion : t.chooseCountryFirst}
                </option>
                {(market?.regions ?? []).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <label className={styles.labelF}>{t.fLang}</label>
              <div className={styles.langGrid}>
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`${styles.langBtn}${
                      sessionLang.code === l.code ? ` ${styles.sel}` : ""
                    }`}
                    onClick={() => pickLang(l)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <label className={styles.labelF}>{t.fAge}</label>
              <select
                className={styles.selectF}
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value)}
              >
                <option value="">—</option>
                {t.ageBands.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              {isMinor ? <div className={styles.ageNote}>{t.guardianNote}</div> : null}
              <label className={styles.labelF}>
                {t.fTheme} <i>{t.optional}</i>
              </label>
              <select
                className={styles.selectF}
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="">{t.chooseTheme}</option>
                {t.themes.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={consentAI}
                  onChange={(e) => setConsentAI(e.target.checked)}
                />
                <span>{t.consentAI}</span>
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={consentMemory}
                  onChange={(e) => setConsentMemory(e.target.checked)}
                />
                <span>{t.consentMemory}</span>
              </label>
              <button type="button" className={styles.btn} onClick={toOtp}>
                {t.verify}
              </button>
            </div>
          </div>
        </Screen>

        {/* OTP */}
        <Screen id="otp" active={screen === "otp"}>
          <button type="button" className={styles.back} onClick={() => go("register")}>
            ←
          </button>
          <div className={styles.formwrap}>
            <div className={styles.card}>
              <div className={styles.eyebrow}>{t.step4}</div>
              <h2 className={styles.title}>{t.otpTitle}</h2>
              <p className={styles.sub}>
                {t.otpSub} <b>{phone}</b>
              </p>
              <div className={styles.otpRow}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    value={d}
                    maxLength={1}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...otpDigits];
                      next[i] = v;
                      setOtpDigits(next);
                      if (v && e.target.nextElementSibling instanceof HTMLInputElement) {
                        e.target.nextElementSibling.focus();
                      }
                    }}
                  />
                ))}
              </div>
              <p className={styles.hint}>
                {t.demoCode}{" "}
                <button
                  type="button"
                  style={{
                    border: 0,
                    background: "transparent",
                    fontWeight: 800,
                    cursor: "pointer",
                    color: "inherit",
                  }}
                  onClick={() => setOtpDigits(otp.split(""))}
                >
                  {otp}
                </button>{" "}
                — {t.tapFill}
              </p>
              <button type="button" className={styles.btn} onClick={confirmBooking}>
                {t.confirmBk}
              </button>
            </div>
          </div>
        </Screen>

        {/* Confirmed */}
        <Screen id="confirmed" active={screen === "confirmed"}>
          <div className={styles.formwrap}>
            <div className={`${styles.card} ${styles.fadeUp}`}>
              <div className={styles.bigTick}>✓</div>
              <h2 className={styles.title} style={{ textAlign: "center" }}>
                {t.bookedTitle}
              </h2>
              <p className={styles.sub} style={{ textAlign: "center" }}>
                {t.bookedSub}
              </p>
              <div className={styles.refBox}>
                <small>{t.refLbl}</small>
                <b>{refCode}</b>
              </div>
              <div className={styles.detail}>
                <span>{t.dDate}</span>
                <b>{dateLabel}</b>
              </div>
              <div className={styles.detail}>
                <span>{t.dTime}</span>
                <b>{time || "—"}</b>
              </div>
              <div className={styles.detail}>
                <span>{t.dLang}</span>
                <b>{sessionLang.label}</b>
              </div>
              <div className={styles.detail}>
                <span>{t.dFrom}</span>
                <b>
                  {region}, {country}
                </b>
              </div>
              <div className={styles.detail}>
                <span>{t.dTier}</span>
                <b>{tierDef.name}</b>
              </div>
              <button
                type="button"
                className={`${styles.btn} ${styles.ghost}`}
                style={{ marginTop: 14 }}
                onClick={() => alert(t.calAlert)}
              >
                {t.addCal}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.navy}`}
                style={{ marginTop: 10 }}
                onClick={() => go("reminder")}
              >
                {t.demoJump}
              </button>
            </div>
          </div>
        </Screen>

        {/* Reminder */}
        <Screen id="reminder" active={screen === "reminder"}>
          <div className={styles.formwrap}>
            <div className={styles.card}>
              <div className={styles.phoneTop}>
                <div className={styles.av}>ML</div>
                {t.waFrom}
              </div>
              <div className={styles.wa}>
                <div className={styles.from}>{t.waFrom}</div>
                <p
                  dangerouslySetInnerHTML={{
                    __html: t.waBody(
                      (name || "amigo").split(" ")[0],
                      time || "7:30 PM",
                      refCode || "MSL-2026-004512"
                    ),
                  }}
                />
                <div className={styles.time}>18:30</div>
              </div>
              <button
                type="button"
                className={styles.btn}
                style={{ marginTop: 16 }}
                onClick={startLobby}
              >
                {t.waJoin}
              </button>
              <p className={styles.sub} style={{ textAlign: "center", marginTop: 10 }}>
                {t.waValid}
              </p>
            </div>
          </div>
        </Screen>

        {/* Lobby */}
        <Screen id="lobby" active={screen === "lobby"} className={styles.sLobby}>
          <Brand territory={territory} />
          <div className={styles.mid}>
            <div className={styles.countWrap}>
              <small>{t.lobbyIn}</small>
              <div className={styles.countNum}>00:{String(lobbyCount).padStart(2, "0")}</div>
              <small className={styles.demoNote}>{t.lobbyDemo}</small>
            </div>
            <div className={styles.card}>
              <p className={styles.sub} style={{ textAlign: "center", marginBottom: 4 }}>
                <b style={{ color: "var(--ink)" }}>{t.ready}</b>
              </p>
              <div className={styles.readyList}>
                <div className={`${styles.readyItem} ${styles.ok}`}>
                  <div className={styles.dot}>✓</div>
                  <span>{t.linkOk}</span>
                </div>
                <div className={`${styles.readyItem}${micOk ? ` ${styles.ok}` : ""}`}>
                  <div className={styles.dot}>{micOk ? "✓" : "🎤"}</div>
                  <span>{t.micLbl2}</span>
                  {!micOk ? (
                    <button type="button" onClick={askMic}>
                      {micBtnLabel || t.allow}
                    </button>
                  ) : null}
                </div>
                <div className={`${styles.readyItem} ${styles.ok}`}>
                  <div className={styles.dot} style={{ background: "var(--navy)" }}>
                    文
                  </div>
                  <span>
                    {t.langLbl2}: <b style={{ marginLeft: 4 }}>{sessionLang.label}</b>
                  </span>
                </div>
                {returning && consentMemory ? (
                  <div className={`${styles.readyItem} ${styles.ok}`}>
                    <div className={styles.dot} style={{ background: "var(--gold)" }}>
                      🧠
                    </div>
                    <span>
                      {uiLang === "es"
                        ? "Messi se acuerda de vos"
                        : "Messi remembers you"}
                    </span>
                  </div>
                ) : null}
              </div>
              <p className={styles.sub} style={{ marginTop: 12, fontSize: 11.5 }}>
                {t.etiquette}
              </p>
              <button
                type="button"
                className={styles.btn}
                style={{ marginTop: 14 }}
                onClick={enterSessionFromLobby}
              >
                {t.enterSession}
              </button>
            </div>
          </div>
        </Screen>

        {/* Session */}
        <Screen id="session" active={screen === "session"} className={styles.sSession}>
          <div className={styles.sessTop}>
            <div className={styles.timerPill}>
              <span className={styles.rec} />
              <span>{fmt(Math.max(secs, 0))}</span>
            </div>
            <button
              type="button"
              className={styles.langPill}
              onClick={() => setLangModalOpen(true)}
            >
              文A · {sessionLang.code}
            </button>
          </div>
          <div className={styles.sessBottom}>
            <div className={styles.caption} dir={sessionLang.rtl ? "rtl" : "ltr"}>
              <span className={styles.n}>{t.sessName}</span>
              <span>{caption}</span>
            </div>
            <div className={styles.youSaid}>{youSaid}</div>
            <div className={styles.micRow}>
              <div>
                <button
                  type="button"
                  className={`${styles.micBtn}${listening ? ` ${styles.listening}` : ""}${awaitingAudioTap ? ` ${styles.micPulse}` : ""}`}
                  onClick={toggleMic}
                  aria-label="mic"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93V22h2v-3.07A8 8 0 0 0 20 11h-2Z" />
                  </svg>
                </button>
                <div className={styles.micLbl}>
                  {awaitingAudioTap
                    ? t.tapToHear
                    : micUnavailable
                      ? t.micFallback
                      : listening
                        ? t.listening
                        : t.tapSpeak}
                </div>
              </div>
            </div>
          </div>
          {awaitingAudioTap ? (
            <button
              type="button"
              className={styles.audioGate}
              onClick={() => void beginFromGesture()}
            >
              {t.tapToHear}
            </button>
          ) : null}
          <button
            type="button"
            className={styles.ffBtn}
            onClick={() => {
              if (!closingRef.current) setSecs(10);
            }}
          >
            DEMO ⏩ 4:50
          </button>
        </Screen>

        {/* Closing */}
        <Screen id="closing" active={screen === "closing"}>
          <div className={styles.formwrap}>
            <div className={`${styles.card} ${styles.fadeUp}`}>
              <h2 className={styles.title} style={{ textAlign: "center" }}>
                {t.doneTitle}
              </h2>
              <p className={styles.sub} style={{ textAlign: "center" }}>
                {t.doneThanks} <b>{(name || "amigo").split(" ")[0]}</b>
              </p>
              <p className={styles.sub} style={{ textAlign: "center" }}>
                {t.doneSub}
              </p>
              <div className={styles.refBox}>
                <small>{t.yourRef}</small>
                <b>{refCode}</b>
              </div>
              <p className={styles.sub} style={{ textAlign: "center" }}>
                {t.rateQ}
              </p>
              <div className={styles.stars}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={i <= stars ? styles.on : ""}
                    onClick={() => setStars(i)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className={styles.summaryBox}>
                <div className={styles.sHead}>{t.summaryLbl}</div>
                <p dangerouslySetInnerHTML={{ __html: summaryHtml }} />
              </div>
              <div className={styles.memoryBox}>
                <div className={styles.mHead}>{t.memoryLbl}</div>
                <p>{consentMemory ? t.memoryOn(memoryFact) : t.memoryOff}</p>
                <small>
                  {uiLang === "es"
                    ? "Podés ver y borrar esto cuando quieras en My Messi."
                    : "You can view and delete this at any time in My Messi."}
                </small>
              </div>
              <div className={styles.counterBox}>
                <small>{t.counterPre}</small>
                <div className={styles.counterNum}>{fanNo.toLocaleString(t.locale)}</div>
                <small>{t.counterPost}</small>
              </div>
              {tier === "free" ? (
                <div className={styles.upsell}>
                  <b>{t.upsellTitle}</b>
                  <p>{t.upsellBody}</p>
                  <button type="button" onClick={() => go("tiers")}>
                    {t.upsellCta}
                  </button>
                </div>
              ) : null}
              <div className={styles.shareCard}>
                <b>{t.shareQuote}</b>
                <small>{t.share}</small>
                <div className={styles.slogan}>{t.slogan}</div>
              </div>
              <button
                type="button"
                className={styles.btn}
                style={{ marginTop: 14 }}
                onClick={() => alert(t.shareAlert)}
              >
                {t.share}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.ghost}`}
                style={{ marginTop: 10 }}
                onClick={restart}
              >
                {t.restart}
              </button>
            </div>
          </div>
        </Screen>

        {/* Language modal */}
        <div className={`${styles.langModal}${langModalOpen ? ` ${styles.open}` : ""}`}>
          <div className={styles.card}>
            <h3>
              {t.langsTitle}
              <button type="button" onClick={() => setLangModalOpen(false)}>
                ✕
              </button>
            </h3>
            <div className={styles.langGrid}>
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`${styles.langBtn}${
                    sessionLang.code === l.code ? ` ${styles.sel}` : ""
                  }`}
                  onClick={() => pickLang(l)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
