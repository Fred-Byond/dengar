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
import { GEO, STATES } from "./geo";
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

type DayOption = { date: Date; full: boolean };

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
      <div className={styles.dengar}>
        <svg className={styles.wave} viewBox="0 0 26 26" fill="none">
          <g stroke="#FFCC00" strokeWidth="2.6" strokeLinecap="round">
            <path d="M4 11 v4" />
            <path d="M9 7 v12" />
            <path d="M14 4 v18" />
            <path d="M19 8 v10" />
            <path d="M24 11 v4" strokeOpacity=".6" />
          </g>
        </svg>
        <div className={styles.wm}>
          DENGAR<span>.ai</span>
        </div>
      </div>
      <div className={styles.madani}>
        <svg className={styles.flag} viewBox="0 0 40 40">
          <g>
            <path
              d="M8 22 c0-9 5-16 12-16 c7 0 12 7 12 16 l-2 12 H10 Z"
              fill="#1B2A6B"
            />
            <g fill="#D22030">
              <rect x="12" y="2" width="3" height="10" rx="1.5" />
              <rect x="17" y="0" width="3" height="12" rx="1.5" />
              <rect x="22" y="1" width="3" height="11" rx="1.5" />
              <rect x="27" y="3" width="3" height="9" rx="1.5" />
            </g>
            <circle cx="17" cy="24" r="7" fill="#FFCC00" />
            <circle cx="20" cy="24" r="6" fill="#1B2A6B" />
            <path
              d="M27 24 l1.6 3.4 3.6.4 -2.7 2.5 .7 3.6 -3.2-1.9 -3.2 1.9 .7-3.6 -2.7-2.5 3.6-.4 Z"
              fill="#FFCC00"
            />
          </g>
        </svg>
        <div className={styles.t}>
          MALAYSIA
          <br />
          MADANI
        </div>
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
  const [uiLang, setUiLang] = useState<UiLang>("ms");
  const [screen, setScreen] = useState<ScreenId>("landing");
  const [sessionLang, setSessionLang] = useState<SessionLang>(LANGS[0]);
  const [userPickedLang, setUserPickedLang] = useState(false);

  const [day, setDay] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [topic, setTopic] = useState("");
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [refCode, setRefCode] = useState("");

  const [lobbyCount, setLobbyCount] = useState(10);
  const [micOk, setMicOk] = useState(false);
  const [micBtnLabel, setMicBtnLabel] = useState<string | null>(null);

  const [secs, setSecs] = useState(300);
  const [listening, setListening] = useState(false);
  const [caption, setCaption] = useState("…");
  const [youSaid, setYouSaid] = useState("");
  const [stage, setStage] = useState(0);
  const [saidText, setSaidText] = useState("");
  const [txtFallback, setTxtFallback] = useState(false);
  const [txtInput, setTxtInput] = useState("");
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [stars, setStars] = useState(-1);
  const [voiceNo, setVoiceNo] = useState(0);
  const [summaryHtml, setSummaryHtml] = useState("");

  const stageRef = useRef(0);
  const closingRef = useRef(false);
  const wrapSaidRef = useRef(false);
  const listeningRef = useRef(false);
  const endSessionRef = useRef<() => void>(() => {});
  const scriptReplyRef = useRef<string | null>(null);
  const expectScriptRef = useRef(false);
  const scriptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lobbyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const t = I18N[uiLang];
  const veiled = VEILED_SCREENS.has(screen);

  const klleon = useKlleonAvatar({
    sdkKey,
    langCode: sessionLang.code,
    enabled: true,
  });

  const days: DayOption[] = useMemo(() => {
    const now = new Date();
    const out: DayOption[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      out.push({ date: d, full: i === 2 || i === 5 });
    }
    return out;
  }, []);

  const go = useCallback((id: ScreenId) => setScreen(id), []);

  const changeUiLang = (l: UiLang) => {
    setUiLang(l);
    if (!userPickedLang) {
      setSessionLang(l === "ms" ? LANGS[0] : LANGS[1]);
    }
  };

  const pickLang = (l: SessionLang) => {
    setSessionLang(l);
    setUserPickedLang(true);
    setLangModalOpen(false);
  };

  const buildSlots = (seed: number) => {
    const times: string[] = [];
    for (let h = 10; h <= 11; h++) {
      for (let m = 0; m < 60; m += 5) {
        times.push(`${h}:${String(m).padStart(2, "0")} AM`);
      }
    }
    times.push("2:00 PM", "2:05 PM", "2:10 PM", "2:15 PM", "2:20 PM", "2:25 PM");
    return times.map((tm, j) => ({
      tm,
      taken: (seed * 7 + j * 13) % 10 < 4,
    }));
  };

  const selectedDayIdx = day
    ? days.findIndex((d) => d.date.getTime() === day.getTime())
    : -1;
  const slots = selectedDayIdx >= 0 ? buildSlots(selectedDayIdx) : [];

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
        klleon.stopSpeech();
      } catch {
        /* ignore */
      }
      klleon.speak(text);
    }, 700);
  }, [klleon, sessionLang.code]);

  const noteUserUtterance = useCallback(
    (txt: string) => {
      setListening(false);
      if (closingRef.current) return;
      if (txt.trim() && !saidText) setSaidText(txt.trim());
      queueScriptReply();
      stageRef.current += 1;
      setStage(stageRef.current);
    },
    [queueScriptReply, saidText]
  );

  useEffect(() => {
    return klleon.onChat((data: KlleonChatData) => {
      const type = data.chat_type || "";
      const msg = data.message || "";
      if (type === "STT_RESULT") {
        if (msg) {
          setYouSaid(`“${msg}”`);
          noteUserUtterance(msg);
        }
        setListening(false);
      } else if (type === "STT_ERROR") {
        setListening(false);
        setTxtFallback(true);
      } else if (type === "PREPARING_RESPONSE") {
        if (expectScriptRef.current && scriptReplyRef.current) {
          const text = scriptReplyRef.current;
          scriptReplyRef.current = null;
          if (scriptTimerRef.current) clearTimeout(scriptTimerRef.current);
          klleon.stopSpeech();
          klleon.unlockAudio();
          klleon.speak(text);
        }
      } else if (type === "TEXT" && msg) {
        if (expectScriptRef.current) return;
        setCaption(msg);
      } else if (type === "RESPONSE_IS_ENDED") {
        expectScriptRef.current = false;
      } else if (type === "USER_SPEECH_STARTED") {
        setListening(true);
      }
    });
  }, [klleon, noteUserUtterance]);

  const showClosing = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    klleon.stopSpeech();
    closingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);

    const place =
      district && state
        ? `${district}, ${state}`
        : state || (uiLang === "ms" ? "Malaysia" : "Malaysia");
    const topicLabel = topic || t.topicGeneral;
    let quote = saidText.trim();
    if (quote.length > 140) {
      quote = quote.slice(0, 138).replace(/\s+\S*$/, "") + "…";
    }
    let summary: string;
    if (quote) summary = t.sumWith(topicLabel, place, quote);
    else if (topic) summary = t.sumTopic(topicLabel, place);
    else summary = t.sumGeneric(place);
    setSummaryHtml(summary);

    const vn =
      17000 +
      Math.floor(Math.random() * 900) +
      (refCode ? parseInt(refCode.slice(-2), 10) || 0 : 0);
    setVoiceNo(vn);
    go("closing");
  }, [
    district,
    go,
    klleon,
    refCode,
    saidText,
    state,
    t,
    topic,
    uiLang,
  ]);

  const endSession = useCallback(() => {
    closingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    klleon.cancelStt();
    setListening(false);
    const first = (name || "rakan").split(" ")[0];
    klleon.speak(M.close[sessionLang.code](first), () => {
      setTimeout(showClosing, 600);
    });
    setTimeout(showClosing, 14000);
  }, [klleon, name, sessionLang.code, showClosing]);

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  useEffect(() => {
    endSessionRef.current = endSession;
  }, [endSession]);

  const startSession = useCallback(() => {
    go("session");
    klleon.unlockAudio();
    klleon.setVolume(100);
    stageRef.current = 0;
    setStage(0);
    setSecs(300);
    wrapSaidRef.current = false;
    closingRef.current = false;
    closedRef.current = false;
    setSaidText("");
    setYouSaid("");
    setTxtFallback(false);
    setCaption("…");

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecs((prev) => {
        if (closingRef.current) return prev;
        const next = prev - 1;
        if (next <= 60 && !wrapSaidRef.current && !listeningRef.current) {
          wrapSaidRef.current = true;
          klleon.speak(M.wrap[sessionLang.code]());
        }
        if (next <= 0) {
          endSessionRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);

    const first = (name || "rakan").split(" ")[0];
    setTimeout(() => {
      klleon.unlockAudio();
      klleon.speak(M.greet[sessionLang.code](first));
    }, 600);
  }, [go, klleon, name, sessionLang.code]);

  const enterSessionFromLobby = async () => {
    if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
    // Browser autoplay: TTS/video often stay blocked unless getUserMedia (or
    // similar) ran under a user gesture. "Benarkan" does that; if the citizen
    // skips it, do the same unlock here on "Mula sesi".
    klleon.unlockAudio();
    if (!micOk && navigator.mediaDevices?.getUserMedia) {
      try {
        const st = await navigator.mediaDevices.getUserMedia({ audio: true });
        st.getTracks().forEach((x) => x.stop());
        setMicOk(true);
        setMicBtnLabel(null);
      } catch {
        /* mic denied — typing fallback; unlockAudio may still help on some browsers */
      }
    }
    klleon.unlockAudio();
    startSession();
  };

  const startLobby = () => {
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
    klleon.unlockAudio();
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
  };

  const toggleMic = () => {
    if (closingRef.current) return;
    klleon.unlockAudio();
    if (!klleon.ready) {
      setTxtFallback(true);
      return;
    }
    if (listening) {
      klleon.endStt();
      setListening(false);
      return;
    }
    setYouSaid("");
    try {
      klleon.startStt();
      setListening(true);
    } catch {
      setTxtFallback(true);
    }
  };

  const submitText = () => {
    const v = txtInput.trim();
    if (!v) return;
    setYouSaid(`“${v}”`);
    setTxtInput("");
    noteUserUtterance(v);
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
    if (!state || !district) {
      alert(t.vGeo);
      return;
    }
    if (!consent) {
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
      "TTM-2026-" +
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
    setVoiceNo(0);
    setStars(-1);
    setConsent(false);
    go("landing");
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
          if (screen === "session" || klleon.ready) klleon.unlockAudio();
        }}
      >
        <div className={styles.demoTag}>{t.demoTag}</div>

        <div className={styles.uiLangTgl}>
          <div className={styles.box}>
            <button
              type="button"
              className={uiLang === "ms" ? styles.on : ""}
              onClick={() => changeUiLang("ms")}
            >
              BM
            </button>
            <button
              type="button"
              className={uiLang === "en" ? styles.on : ""}
              onClick={() => changeUiLang("en")}
            >
              EN
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
            <b>Saifuddin Nasution</b>
            <small>{t.minRole}</small>
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
                <div className={styles.ic}>✅</div>
                <b>{t.st3}</b>
                <small>{t.st3s}</small>
              </div>
            </div>
            <button type="button" className={styles.btn} onClick={() => go("slots")}>
              {t.cta}
            </button>
            <div className={styles.langrow}>
              <span>Bahasa Melayu</span>
              <span>English</span>
              <span>中文</span>
              <span>தமிழ்</span>
              <span>العربية</span>
            </div>
            <p className={styles.pdpa}>{t.pdpa}</p>
            <p className={styles.siteUrl}>www.dengar.ai</p>
          </div>
        </Screen>

        {/* Slots */}
        <Screen id="slots" active={screen === "slots"}>
          <button type="button" className={styles.back} onClick={() => go("landing")}>
            ←
          </button>
          <div className={styles.formwrap}>
            <div className={styles.card}>
              <div className={styles.eyebrow}>{t.step1}</div>
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
                {slots.map(({ tm, taken }) => (
                  <div
                    key={tm}
                    className={`${styles.slot}${taken ? ` ${styles.taken}` : ""}${
                      time === tm ? ` ${styles.sel}` : ""
                    }`}
                    onClick={() => {
                      if (taken) return;
                      setTime(tm);
                    }}
                  >
                    {tm}
                  </div>
                ))}
              </div>
              <p className={styles.lockNote}>{t.lockNote}</p>
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
              <div className={styles.eyebrow}>{t.step2}</div>
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
              <label className={styles.labelF}>{t.fState}</label>
              <select
                className={styles.selectF}
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setDistrict("");
                }}
              >
                <option value="">{t.chooseState}</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label className={styles.labelF}>{t.fDistrict}</label>
              <select
                className={styles.selectF}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!state}
              >
                <option value="">
                  {state ? t.chooseDistrict : t.chooseStateFirst}
                </option>
                {(GEO[state] || []).map((d) => (
                  <option key={d} value={d}>
                    {d}
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
              <label className={styles.labelF}>
                {t.fTopic} <i>{t.optional}</i>
              </label>
              <select
                className={styles.selectF}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="">{t.chooseTopic}</option>
                {t.topics.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>{t.consent}</span>
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
              <div className={styles.eyebrow}>{t.step3}</div>
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
                  {district}, {state}
                </b>
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
                <div className={styles.av}>MD</div>
                {t.waFrom}
              </div>
              <div className={styles.wa}>
                <div className={styles.from}>{t.waFrom}</div>
                <p
                  dangerouslySetInnerHTML={{
                    __html: t.waBody(
                      (name || "rakan").split(" ")[0],
                      time || "",
                      refCode
                    ),
                  }}
                />
                <div className={styles.time}>14:45</div>
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
          <Brand />
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
            <div
              className={styles.caption}
              dir={sessionLang.rtl ? "rtl" : "ltr"}
            >
              <span className={styles.n}>{t.minName}</span>
              <span>{caption}</span>
            </div>
            <div className={styles.youSaid}>{youSaid}</div>
            <div className={styles.micRow}>
              <div>
                <button
                  type="button"
                  className={`${styles.micBtn}${listening ? ` ${styles.listening}` : ""}`}
                  onClick={toggleMic}
                  aria-label="mic"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93V22h2v-3.07A8 8 0 0 0 20 11h-2Z" />
                  </svg>
                </button>
                <div className={styles.micLbl}>
                  {txtFallback
                    ? t.micFallback
                    : listening
                      ? t.listening
                      : t.tapSpeak}
                </div>
              </div>
            </div>
            {txtFallback ? (
              <div className={styles.txtFallback} style={{ display: "flex" }}>
                <input
                  value={txtInput}
                  onChange={(e) => setTxtInput(e.target.value)}
                  placeholder={t.txtPh}
                />
                <button type="button" onClick={submitText}>
                  {t.send}
                </button>
              </div>
            ) : null}
          </div>
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
                {t.doneThanks}{" "}
                <b>{(name || "rakan").split(" ")[0]}</b>
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
              <div className={styles.counterBox}>
                <small>{t.counterPre}</small>
                <div className={styles.counterNum}>
                  {voiceNo.toLocaleString(t.locale)}
                </div>
                <small>{t.counterPost}</small>
              </div>
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

        {/* Lang modal */}
        <div
          className={`${styles.langModal}${langModalOpen ? ` ${styles.open}` : ""}`}
        >
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
