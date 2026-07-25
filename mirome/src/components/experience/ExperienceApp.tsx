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
import { ARRANGEMENTS, DEPARTMENTS, ROLE_LEVELS, TENURES } from "@/lib/org";
import { CLIMATE, CLIMATE_BY_ID, scenariosForFocus } from "@/lib/tif";
import type { LikertScore } from "@/lib/tif/types";
import { I18N, type UiLang } from "./i18n";
import {
  LANGS,
  VEILED_SCREENS,
  type ScreenId,
  type SessionLang,
} from "./langs";
import { M, pickScriptReply } from "./script";
import styles from "./experience.module.css";

export type ExperienceAppProps = {
  sdkKey: string;
};

/** Interview budget in seconds. The pulse and reflection sit outside it. */
const SESSION_SECS = 600;

function fmt(secs: number) {
  return (
    String(Math.floor(secs / 60)).padStart(2, "0") +
    ":" +
    String(secs % 60).padStart(2, "0")
  );
}

function Brand() {
  return (
    <div className={styles.brand}>
      <div className={styles.mirome}>
        <svg className={styles.mark} viewBox="0 0 28 28" fill="none" aria-hidden>
          <circle cx="14" cy="14" r="12.5" stroke="#F2B705" strokeWidth="1.6" opacity=".5" />
          <g stroke="#F2B705" strokeWidth="2.6" strokeLinecap="round">
            <path d="M8 17 v-6" />
            <path d="M14 20 v-12" />
            <path d="M20 17 v-6" />
          </g>
        </svg>
        <div className={styles.wm}>
          MIROME
          <small>TEAM INTELLIGENCE</small>
        </div>
      </div>
      <div className={styles.byond}>
        BYOND ASIA
        <br />
        <span style={{ opacity: 0.7 }}>ASSESSMENT PORTAL</span>
      </div>
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

export function ExperienceApp({ sdkKey }: ExperienceAppProps) {
  const [uiLang, setUiLang] = useState<UiLang>("en");
  const [screen, setScreen] = useState<ScreenId>("landing");
  const [sessionLang, setSessionLang] = useState<SessionLang>(LANGS[0]);

  // consent + context
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [roleLevel, setRoleLevel] = useState("");
  const [tenure, setTenure] = useState("");
  const [arrangement, setArrangement] = useState("");
  const [managesPeople, setManagesPeople] = useState<boolean | null>(null);

  // pulse
  const [pulseIdx, setPulseIdx] = useState(0);
  const [pulse, setPulse] = useState<Record<string, LikertScore>>({});

  // reflection + confirmation
  const [strength, setStrength] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [priority, setPriority] = useState("");
  const [personalAction, setPersonalAction] = useState("");
  const [correcting, setCorrecting] = useState(false);
  const [correction, setCorrection] = useState("");
  const [corrected, setCorrected] = useState(false);

  const [reference] = useState(
    () => `MTI-2026-${String(1000 + Math.floor(Math.random() * 8000))}`
  );
  const [participantNo] = useState(() => 47 + Math.floor(Math.random() * 20));

  // lobby + session
  const [lobbyCount, setLobbyCount] = useState(10);
  const [micOk, setMicOk] = useState(false);
  const [micBtnLabel, setMicBtnLabel] = useState<string | null>(null);
  const [secs, setSecs] = useState(SESSION_SECS);
  const [listening, setListening] = useState(false);
  const [caption, setCaption] = useState("…");
  const [youSaid, setYouSaid] = useState("");
  const [stage, setStage] = useState(0);
  const [saidText, setSaidText] = useState("");
  const [micUnavailable, setMicUnavailable] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [awaitingAudioTap, setAwaitingAudioTap] = useState(false);

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

  /**
   * §Component 5 — the two scenarios are chosen from the participant's own
   * weakest climate responses, so the role-play probes what the pulse flagged.
   */
  const scenarios = useMemo(() => {
    const focus = Object.entries(pulse)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([id]) => id);
    return scenariosForFocus(focus);
  }, [pulse]);
  const scenariosRef = useRef(scenarios);
  scenariosRef.current = scenarios;

  const go = useCallback((id: ScreenId) => setScreen(id), []);

  const clearEchoAckWatch = useCallback(() => {
    awaitingEchoAckRef.current = null;
    echoRetryUsedRef.current = false;
    if (echoAckTimerRef.current) {
      clearTimeout(echoAckTimerRef.current);
      echoAckTimerRef.current = null;
    }
  }, []);

  /** Speak scripted line and retry once if the SDK never acks (silent echo drop). */
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
          if (awaitingEchoAckRef.current === text) clearEchoAckWatch();
        }, 1500);
      }, 1200);
    },
    [clearEchoAckWatch]
  );

  /** The structured ladder: experience → probe → scenario → scenario probe → wrap. */
  const replyForStage = useCallback(
    (s: number) => {
      const code = sessionLang.code;
      if (s === 2) {
        const sc = scenariosRef.current[0];
        return M.scenarioIntro[code](`${sc.setup} ${sc.ask}`);
      }
      if (s === 4) {
        const sc = scenariosRef.current[1] ?? scenariosRef.current[0];
        return M.scenarioIntro[code](`${sc.setup} ${sc.ask}`);
      }
      return pickScriptReply(s > 4 ? 4 : s, code);
    },
    [sessionLang.code]
  );

  const queueScriptReply = useCallback(() => {
    const reply = replyForStage(stageRef.current);
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
  }, [deliverScriptSpeak, replyForStage]);
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
          queueScriptReplyRef.current();
        }
        setListening(false);
      } else if (type === "STT_ERROR") {
        // Klleon fires STT_ERROR mainly when there is no voice data — not a
        // broken mic. Keep the turn moving.
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

  const showReflection = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    stopSpeechRef.current();
    closingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    go("reflect");
  }, [go]);

  const endSession = useCallback(() => {
    closingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    klleon.cancelStt();
    setListening(false);
    const first = (name || "rakan").split(" ")[0];
    speakRef.current(M.close[sessionLang.code](first), () => {
      setTimeout(showReflection, 600);
    });
    setTimeout(showReflection, 14000);
  }, [klleon.cancelStt, name, sessionLang.code, showReflection]);

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
        if (next <= 75 && !wrapSaidRef.current && !listeningRef.current) {
          wrapSaidRef.current = true;
          speakRef.current(M.wrap[sessionLang.code]());
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
    const first = (name || "there").split(" ")[0];
    const text = M.greet[sessionLang.code](first);
    // Caption comes from SDK TEXT chunks as TTS streams — do not fake full text.
    setCaption("…");
    unlockAudioRef.current();
    speakRef.current(text, () => {
      setTimeout(() => {
        if (closingRef.current) return;
        deliverScriptSpeak(M.experience[sessionLang.code]());
      }, 400);
    });
  }, [deliverScriptSpeak, name, sessionLang.code]);

  const startSession = useCallback(
    (opts?: { hasUserGesture?: boolean }) => {
      const hasGesture = !!opts?.hasUserGesture;
      go("session");
      unlockAudioRef.current();
      klleon.setVolume(100);
      stageRef.current = 0;
      setStage(0);
      setSecs(SESSION_SECS);
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
      if (scriptTimerRef.current) clearTimeout(scriptTimerRef.current);
    };
  }, []);

  /* ---------------- navigation guards ---------------- */

  const toContext = () => {
    if (!consent) {
      alert(t.vConsent);
      return;
    }
    go("context");
  };

  const toPulse = () => {
    if (!department || !roleLevel || !tenure || managesPeople === null) {
      alert(t.vContext);
      return;
    }
    setPulseIdx(0);
    go("pulse");
  };

  const answerPulse = (v: LikertScore) => {
    const spec = CLIMATE[pulseIdx];
    setPulse((p) => ({ ...p, [spec.id]: v }));
    if (pulseIdx < CLIMATE.length - 1) {
      setPulseIdx((i) => i + 1);
    }
  };

  const restart = () => {
    closedRef.current = false;
    stageRef.current = 0;
    setStage(0);
    setConsent(false);
    setPulse({});
    setPulseIdx(0);
    setStrength("");
    setObstacle("");
    setPriority("");
    setPersonalAction("");
    setCorrecting(false);
    setCorrection("");
    setCorrected(false);
    setSecs(SESSION_SECS);
    go("landing");
  };

  /* ---------------- derived ---------------- */

  const weakest = useMemo(() => {
    const entries = Object.entries(pulse);
    if (!entries.length) return null;
    const [id] = entries.sort((a, b) => a[1] - b[1])[0];
    return CLIMATE_BY_ID[id] ?? null;
  }, [pulse]);

  const recordedSummary = useMemo(() => {
    const dept = department || "your department";
    const weakLine = weakest
      ? weakest.name.toLowerCase()
      : "how the team works together";
    const spoken = saidText.trim();
    const quoted =
      spoken.length > 150 ? `${spoken.slice(0, 148).replace(/\s+\S*$/, "")}…` : spoken;
    return {
      lead: `A ${(roleLevel || "team member").toLowerCase()} in ${dept} described ${weakLine} as the main constraint on getting work done.`,
      quote: quoted,
      points: [
        strength ? `Strength: ${strength}` : null,
        obstacle ? `Obstacle: ${obstacle}` : null,
        priority ? `Change asked for: ${priority}` : null,
        personalAction ? `Own commitment: ${personalAction}` : null,
      ].filter(Boolean) as string[],
    };
  }, [
    department,
    obstacle,
    personalAction,
    priority,
    roleLevel,
    saidText,
    strength,
    weakest,
  ]);

  const pulseSpec = CLIMATE[pulseIdx];
  const pulseAnswer = pulse[pulseSpec.id];
  const stageLabel =
    stage <= 1 ? "Team experience" : stage <= 3 ? "Scenario 1" : stage <= 5 ? "Scenario 2" : "Wrap-up";

  return (
    <div className={styles.root}>
      <div
        className={`${styles.phone} ${veiled ? styles.veiled : ""}`}
        onPointerDown={() => {
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
              onClick={() => setUiLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={uiLang === "ms" ? styles.on : ""}
              onClick={() => setUiLang("ms")}
            >
              BM
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
          <Brand />
          <div className={styles.who}>
            <b>{t.clientLine}</b>
            <small>Confidential team diagnosis · 15 minutes</small>
          </div>
          <div className={styles.heroSpacer} />
          <div className={styles.sheet}>
            <h1>
              {t.heroA}
              <em>{t.heroB}</em>
              {t.heroC}
            </h1>
            <p className={styles.lead}>{t.lead}</p>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.ic}>🔒</div>
                <b>{t.st1}</b>
                <small>{t.st1s}</small>
              </div>
              <div className={styles.step}>
                <div className={styles.ic}>💬</div>
                <b>{t.st2}</b>
                <small>{t.st2s}</small>
              </div>
              <div className={styles.step}>
                <div className={styles.ic}>✅</div>
                <b>{t.st3}</b>
                <small>{t.st3s}</small>
              </div>
            </div>
            <button type="button" className={styles.btn} onClick={() => go("consent")}>
              {t.cta}
            </button>
            <div className={styles.langrow}>
              {LANGS.map((l) => (
                <span key={l.code}>{l.label}</span>
              ))}
            </div>
            <p className={styles.pdpa}>{t.privacyStrap}</p>
          </div>
        </Screen>

        {/* Consent */}
        <Screen id="consent" active={screen === "consent"}>
          <button type="button" className={styles.back} onClick={() => go("landing")}>
            ←
          </button>
          <div className={styles.formwrap}>
            <div className={styles.card}>
              <div className={styles.eyebrow}>{t.step1}</div>
              <h2 className={styles.title}>{t.consentTitle}</h2>
              <p className={styles.sub}>{t.consentSub}</p>
              <div className={styles.consentList}>
                {t.consentPoints.map((p) => (
                  <div key={p} className={styles.consentItem}>
                    <i>✓</i>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>{t.consentCheck}</span>
              </label>
              <button
                type="button"
                className={styles.btn}
                style={{ marginTop: 16 }}
                onClick={toContext}
              >
                {t.consentBtn}
              </button>
            </div>
          </div>
        </Screen>

        {/* Context */}
        <Screen id="context" active={screen === "context"}>
          <button type="button" className={styles.back} onClick={() => go("consent")}>
            ←
          </button>
          <div className={styles.formwrap}>
            <div className={styles.card}>
              <div className={styles.eyebrow}>{t.step2}</div>
              <h2 className={styles.title}>{t.ctxTitle}</h2>
              <p className={styles.sub}>{t.ctxSub}</p>

              <label className={styles.labelF}>Preferred name (greeting only)</label>
              <input
                className={styles.inputF}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aisyah"
              />

              <label className={styles.labelF}>{t.fDept}</label>
              <select
                className={styles.selectF}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">{t.choose}</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <label className={styles.labelF}>{t.fRole}</label>
              <select
                className={styles.selectF}
                value={roleLevel}
                onChange={(e) => setRoleLevel(e.target.value)}
              >
                <option value="">{t.choose}</option>
                {ROLE_LEVELS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <label className={styles.labelF}>{t.fTenure}</label>
              <select
                className={styles.selectF}
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
              >
                <option value="">{t.choose}</option>
                {TENURES.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>

              <label className={styles.labelF}>{t.fArrangement}</label>
              <select
                className={styles.selectF}
                value={arrangement}
                onChange={(e) => setArrangement(e.target.value)}
              >
                <option value="">{t.choose}</option>
                {ARRANGEMENTS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>

              <label className={styles.labelF}>{t.fManages}</label>
              <div className={styles.pillRow}>
                <button
                  type="button"
                  className={`${styles.pill}${managesPeople === true ? ` ${styles.sel}` : ""}`}
                  onClick={() => setManagesPeople(true)}
                >
                  {t.yes}
                </button>
                <button
                  type="button"
                  className={`${styles.pill}${managesPeople === false ? ` ${styles.sel}` : ""}`}
                  onClick={() => setManagesPeople(false)}
                >
                  {t.no}
                </button>
              </div>

              <label className={styles.labelF}>{t.fLang}</label>
              <div className={styles.langGrid}>
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`${styles.langBtn}${
                      sessionLang.code === l.code ? ` ${styles.sel}` : ""
                    }`}
                    onClick={() => setSessionLang(l)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <p className={styles.note}>{t.minimalNote}</p>
              <button
                type="button"
                className={styles.btn}
                style={{ marginTop: 14 }}
                onClick={toPulse}
              >
                {t.continueBtn}
              </button>
            </div>
          </div>
        </Screen>

        {/* Pulse */}
        <Screen id="pulse" active={screen === "pulse"}>
          <button type="button" className={styles.back} onClick={() => go("context")}>
            ←
          </button>
          <div className={styles.formwrap}>
            <div className={styles.card}>
              <div className={styles.eyebrow}>{t.step3}</div>
              <h2 className={styles.title}>{t.pulseTitle}</h2>
              <p className={styles.sub}>{t.pulseSub}</p>

              <div className={styles.progressBar}>
                <i style={{ width: `${((pulseIdx + 1) / CLIMATE.length) * 100}%` }} />
              </div>
              <div className={styles.pulseCount}>
                {t.pulseOf(pulseIdx + 1, CLIMATE.length)}
              </div>

              <div className={styles.construct}>{pulseSpec.name}</div>
              <div className={styles.statement}>{pulseSpec.pulseItem}</div>

              <div className={styles.scaleList}>
                {t.scale.map((label, i) => {
                  const v = (i + 1) as LikertScore;
                  return (
                    <button
                      key={label}
                      type="button"
                      className={`${styles.scaleBtn}${pulseAnswer === v ? ` ${styles.sel}` : ""}`}
                      onClick={() => answerPulse(v)}
                    >
                      <i />
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className={styles.rowBtns}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.ghost}`}
                  disabled={pulseIdx === 0}
                  onClick={() => setPulseIdx((i) => Math.max(0, i - 1))}
                >
                  {t.back}
                </button>
                {pulseIdx < CLIMATE.length - 1 ? (
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={!pulseAnswer}
                    onClick={() => setPulseIdx((i) => i + 1)}
                  >
                    {t.next}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={Object.keys(pulse).length < CLIMATE.length}
                    onClick={startLobby}
                  >
                    {t.toInterview}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Screen>

        {/* Lobby */}
        <Screen id="lobby" active={screen === "lobby"} className={styles.sLobby}>
          <Brand />
          <div className={styles.mid}>
            <div className={styles.countWrap}>
              <small>{t.lobbyIn}</small>
              <div className={styles.countNum}>
                00:{String(lobbyCount).padStart(2, "0")}
              </div>
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
                  <span>{t.micLbl}</span>
                  {!micOk ? (
                    <button type="button" onClick={askMic}>
                      {micBtnLabel || t.allow}
                    </button>
                  ) : null}
                </div>
                <div className={`${styles.readyItem} ${styles.ok}`}>
                  <div className={styles.dot} style={{ background: "var(--indigo)" }}>
                    文
                  </div>
                  <span>
                    {t.langLbl}: <b style={{ marginLeft: 4 }}>{sessionLang.label}</b>
                  </span>
                </div>
              </div>
              <p className={styles.note}>{t.etiquette}</p>
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
          <div className={styles.stagePill}>{stageLabel}</div>
          <div className={styles.sessBottom}>
            <div className={styles.caption} dir={sessionLang.rtl ? "rtl" : "ltr"}>
              <span className={styles.n}>{t.interviewerName}</span>
              <span>{caption}</span>
            </div>
            <div className={styles.youSaid}>{youSaid}</div>
            <div className={styles.micRow}>
              <div>
                <button
                  type="button"
                  className={`${styles.micBtn}${listening ? ` ${styles.listening}` : ""}${
                    awaitingAudioTap ? ` ${styles.micPulse}` : ""
                  }`}
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
            DEMO ⏩ SKIP TO WRAP
          </button>
        </Screen>

        {/* Reflection */}
        <Screen id="reflect" active={screen === "reflect"}>
          <div className={styles.formwrap}>
            <div className={`${styles.card} ${styles.fadeUp}`}>
              <div className={styles.eyebrow}>{t.step4}</div>
              <h2 className={styles.title}>{t.reflectTitle}</h2>
              <p className={styles.sub}>{t.reflectSub}</p>

              <label className={styles.labelF}>{t.qStrength}</label>
              <textarea
                className={styles.textareaF}
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
              />
              <label className={styles.labelF}>{t.qObstacle}</label>
              <textarea
                className={styles.textareaF}
                value={obstacle}
                onChange={(e) => setObstacle(e.target.value)}
              />
              <label className={styles.labelF}>{t.qPriority}</label>
              <textarea
                className={styles.textareaF}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
              <label className={styles.labelF}>{t.qAction}</label>
              <textarea
                className={styles.textareaF}
                value={personalAction}
                onChange={(e) => setPersonalAction(e.target.value)}
              />

              <button
                type="button"
                className={styles.btn}
                style={{ marginTop: 16 }}
                onClick={() => go("confirm")}
              >
                {t.continueBtn}
              </button>
            </div>
          </div>
        </Screen>

        {/* Confirm */}
        <Screen id="confirm" active={screen === "confirm"}>
          <div className={styles.formwrap}>
            <div className={`${styles.card} ${styles.fadeUp}`}>
              <div className={styles.eyebrow}>{t.step5}</div>
              <h2 className={styles.title}>{t.confirmTitle}</h2>
              <p className={styles.sub}>{t.confirmSub}</p>

              <div className={styles.summaryBox}>
                <div className={styles.sHead}>{t.recordedLbl}</div>
                <p>{recordedSummary.lead}</p>
                {recordedSummary.quote ? (
                  <p style={{ marginTop: 8, fontStyle: "italic" }}>
                    “{recordedSummary.quote}”
                  </p>
                ) : null}
                {recordedSummary.points.length ? (
                  <ul>
                    {recordedSummary.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {correcting ? (
                <>
                  <label className={styles.labelF}>{t.correctionPh}</label>
                  <textarea
                    className={styles.textareaF}
                    value={correction}
                    onChange={(e) => setCorrection(e.target.value)}
                  />
                </>
              ) : null}

              {corrected ? <p className={styles.note}>{t.correctedNote}</p> : null}

              <div className={styles.rowBtns}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.ghost}`}
                  onClick={() => setCorrecting(true)}
                >
                  {t.correctBtn}
                </button>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => {
                    if (correcting && correction.trim()) setCorrected(true);
                    go("done");
                  }}
                >
                  {t.confirmBtn}
                </button>
              </div>
            </div>
          </div>
        </Screen>

        {/* Done */}
        <Screen id="done" active={screen === "done"}>
          <div className={styles.formwrap}>
            <div className={`${styles.card} ${styles.fadeUp}`}>
              <div className={styles.bigTick}>✓</div>
              <h2 className={styles.title} style={{ textAlign: "center" }}>
                {t.doneTitle}
              </h2>
              <p className={styles.sub} style={{ textAlign: "center" }}>
                {t.doneThanks} <b>{(name || "").split(" ")[0]}</b>
              </p>
              <p className={styles.sub} style={{ textAlign: "center" }}>
                {t.doneSub}
              </p>

              <div className={styles.refBox}>
                <small>{t.refLbl}</small>
                <b>{reference}</b>
              </div>

              <div className={styles.summaryBox}>
                <div className={styles.sHead}>{t.whatNextLbl}</div>
                <div className={styles.nextList}>
                  {t.whatNext.map((x, i) => (
                    <div key={x} className={styles.nextItem}>
                      <b>{i + 1}</b>
                      <span>{x}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.counterBox}>
                <small>{t.counterPre}</small>
                <div className={styles.counterNum}>{participantNo}</div>
                <small>{t.counterPost}</small>
              </div>

              <div className={styles.privacyCard}>{t.privacyNote}</div>

              <button
                type="button"
                className={`${styles.btn} ${styles.ghost}`}
                style={{ marginTop: 14 }}
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
                  onClick={() => {
                    setSessionLang(l);
                    setLangModalOpen(false);
                  }}
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
