"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useKlleonAvatar } from "@/hooks/useKlleonAvatar";
import type { KlleonChatData } from "@/types/klleon";
import {
  LANGUAGES,
  UI,
  languageMeta,
  t,
  tList,
  ui,
  type Lang,
} from "@/lib/auren/i18n";
import {
  CHALLENGES,
  FAILURE_SIGNATURES,
  PROTECT_MARKERS,
  VERIFICATION_ACTIONS,
  type ChallengeObject,
} from "@/lib/auren/objects";
import {
  bindSignature,
  budgetedQuestions,
  challengeMayFire,
  createSession,
  evaluateAnswer,
  issueCertificateId,
  VERIFICATION_STEPS,
  resistedPressure,
  selectRetest,
  type AurenSession,
  type BoundSignature,
  type Stage,
} from "@/lib/auren/session";
import { CoachEvidencePanel, type CoachBeat } from "./CoachEvidencePanel";
import { ReasoningMapRail, type RailState } from "./ReasoningMapRail";
import { Scorecard } from "./Scorecard";
import styles from "./auren.module.css";

export type AurenAppProps = { sdkKey: string };

const BEAT_PAUSE = 1900;

/** Conversational glue — the only free-form utterances in the loop. */
const UI_ACKS = UI.ackWords;

export function AurenApp({ sdkKey }: AurenAppProps) {
  const [stage, setStage] = useState<Stage>("landing");
  const [lang, setLang] = useState<Lang>("EN");
  const [phone, setPhone] = useState("+60 12 345 6789");
  const [codeSent, setCodeSent] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [name, setName] = useState("Daniel");
  const [caption, setCaption] = useState("…");
  const [captionWho, setCaptionWho] = useState("AUREN");
  const [isPersona, setIsPersona] = useState(false);
  const [said, setSaid] = useState("");
  const [railState, setRailState] = useState<RailState>("building");
  const [flipped, setFlipped] = useState<string[]>([]);
  const [micArmed, setMicArmed] = useState(false);
  const [micLabel, setMicLabel] = useState("");
  const [holding, setHolding] = useState(false);
  const [prop, setProp] = useState<{ head: string; body: string } | null>(null);
  const [coachSig, setCoachSig] = useState<BoundSignature | null>(null);
  const [coachBeat, setCoachBeat] = useState<CoachBeat>(1);
  const [, bump] = useState(0);

  const sessionRef = useRef<AurenSession>(createSession("Daniel", "EN"));

  /**
   * Session generation — cancellation for the loop.
   *
   * The loop is a chain of awaited turns. Leaving it mid-flight (Exit
   * Simulation, the PROTECT control, a language change, or starting over)
   * does not unwind that chain: without a generation token the abandoned run
   * keeps resolving, keeps writing captions and coach beats, and keeps
   * binding signatures — in the language it started in. Every stage captures
   * the generation it began in and stops the moment it is superseded.
   */
  const genRef = useRef(0);
  const stale = useCallback((g: number) => g !== genRef.current, []);
  const rerender = useCallback(() => bump((n) => n + 1), []);

  const klleon = useKlleonAvatar({ sdkKey, langCode: lang, enabled: true });
  const speakRef = useRef(klleon.speak);
  speakRef.current = klleon.speak;

  /* ── Voice capture ────────────────────────────────────────────────
     The learner speaks; they never type. When the SDK returns no result
     (permission denied, no speech, adapter not ready) the beat still
     advances using the authored rehearsed line — the loop is never
     rescued by introducing a text input, which would make typing the
     default affordance and change what is being measured. */
  const lowerRef = useRef<HTMLDivElement | null>(null);
  const heardRef = useRef("");
  const resolverRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    return klleon.onChat((data: KlleonChatData) => {
      const type = data.chat_type ?? "";
      if (type === "STT_RESULT" && data.message) {
        heardRef.current = data.message;
        setSaid(`“${data.message}”`);
      }
    });
  }, [klleon]);

  /* Keep the newest overlay content in view. Without this, a card is clipped
     mid-sentence on a phone and reads as a layout bug rather than a scroll. */
  useEffect(() => {
    const n = lowerRef.current;
    if (n) n.scrollTop = n.scrollHeight;
  }, [caption, coachSig, coachBeat, prop, railState, stage]);

  const say = useCallback(
    (text: string, opts?: { persona?: string }) =>
      new Promise<void>((resolve) => {
        setCaption(text);
        setCaptionWho(opts?.persona ?? "AUREN");
        setIsPersona(!!opts?.persona);
        sessionRef.current.transcript.push({
          speaker: opts?.persona ? "persona" : "coach",
          text,
          phase: sessionRef.current.stage,
        });
        speakRef.current(text, resolve);
      }),
    []
  );

  const listen = useCallback(
    (label: string, rehearsed: string) =>
      new Promise<string>((resolve) => {
        heardRef.current = "";
        setSaid("");
        setMicLabel(label);
        setMicArmed(true);
        resolverRef.current = (text: string) => {
          const used = text.trim().length > 1 ? text.trim() : rehearsed;
          setSaid(`“${used}”`);
          sessionRef.current.transcript.push({
            speaker: "learner",
            text: used,
            phase: sessionRef.current.stage,
          });
          resolve(used);
        };
      }),
    []
  );

  const holdStart = useCallback(() => {
    if (!micArmed || holding) return;
    setHolding(true);
    setMicLabel(ui("listening", sessionRef.current.lang));
    setSaid("");
    heardRef.current = "";
    klleon.unlockAudio();
    klleon.stopSpeech();
    klleon.startStt();
  }, [micArmed, holding, klleon]);

  const holdEnd = useCallback(() => {
    if (!holding) return;
    setHolding(false);
    setMicArmed(false);
    klleon.endStt();
    // Give the adapter a beat to flush its final STT_RESULT.
    window.setTimeout(() => {
      const resolve = resolverRef.current;
      resolverRef.current = null;
      resolve?.(heardRef.current);
    }, 420);
  }, [holding, klleon]);

  /** Supersede the running loop and silence whatever it left mid-turn. */
  const bumpGen = useCallback(() => {
    genRef.current += 1;
    klleon.stopSpeech();
    klleon.cancelStt();
    resolverRef.current = null;
    setHolding(false);
    setMicArmed(false);
    setProp(null);
    setCoachSig(null);
    setIsPersona(false);
    return genRef.current;
  }, [klleon]);

  const goStage = useCallback((next: Stage, engine: AurenSession["engineState"]) => {
    sessionRef.current.stage = next;
    sessionRef.current.engineState = engine;
    setStage(next);
    rerender();
  }, [rerender]);

  /* ── Stage: UNDERSTAND [S1] ───────────────────────────────────────
     Untainted free narrative. Nothing analytical renders — the twin
     engines extract in silence, and the Situation Map is never shown. */
  const runUnderstand = useCallback(async () => {
    const g = genRef.current;
    goStage("understand", "S1");
    setProp(null);
    setCoachSig(null);

    const lg = sessionRef.current.lang;
    await say(ui("understandOpener", lg));
    if (stale(g)) return;
    await listen(ui("holdTellMe", lg), ui("narrativeRehearsed", lg));
    if (stale(g)) return;

    // Situation Map populates silently. It routes scenarios and PROTECT
    // markers; AILS never reads it, and REHEARSE never renders it.
    sessionRef.current.situationMarkers = [
      "unsolicited-contact",
      "guaranteed-return",
      "celebrity-endorsement",
      "self-asserted-regulation",
      "messenger-channel",
    ];

    await say(ui("understandClose", lg));
    if (stale(g)) return;
    void runDiagnose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goStage, say, listen]);

  /* ── Stage: DIAGNOSE [S3] ─────────────────────────────────────────
     One intelligent question at a time, capped by the element budget. */
  const runDiagnose = useCallback(async () => {
    const g = genRef.current;
    goStage("diagnose", "S3");
    setRailState("building");

    const lg = sessionRef.current.lang;
    const questions = budgetedQuestions();
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      sessionRef.current.questionIndex = i;
      await say(t(q.ask, lg));
      if (stale(g)) return;
      const answer = await listen(
        ui("holdToAnswer", lg),
        t(q.rehearsedAnswer, lg)
      );
      if (stale(g)) return;
      const status = evaluateAnswer(q, answer, lg);
      sessionRef.current.reasoningMap[q.targetElement] = {
        status,
        evidence: answer,
        sourceObjectId: q.questionId,
      };
      if (status === "failed") bindSignature(sessionRef.current, q.failSignature ?? undefined, answer);
      rerender();
      if (i < questions.length - 1) {
        const acks = tList(UI_ACKS, lg);
        await say(acks[i % acks.length]);
        if (stale(g)) return;
      }
    }

    await say(ui("stressHandoff", lg));
    if (stale(g)) return;
    void runChallenge(CHALLENGES[0], "stress");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goStage, say, listen, rerender]);

  /* ── Stage: STRESS [S5] and RETEST [S5′] ──────────────────────────
     The adversarial envelope. Correction is deferred, never real-time:
     the learner is allowed to make the mistake, because that is where
     the behavioural evidence comes from. */
  const runChallenge = useCallback(
    async (challenge: ChallengeObject, phase: "stress" | "retest") => {
      // Mode gate (Layer 6), enforced in code rather than by convention.
      const g = genRef.current;
      if (!challengeMayFire(challenge, sessionRef.current.mode)) return;

      goStage(phase, phase === "stress" ? "S5" : "S5R");
      sessionRef.current.activeChallengeId = challenge.challengeId;
      setIsPersona(true);
      setRailState("frozen"); // the freeze rule
      setCoachSig(null);

      // The nameplate lands first, in silence. The audience reads the
      // doctrine change before a word is spoken, and the coach's last line
      // does not sit over a persona-framed field.
      const lg = sessionRef.current.lang;
      setCaption("");
      setCaptionWho(challenge.persona.name);
      setSaid("");
      await new Promise((r) => window.setTimeout(r, 1100));
      if (stale(g)) return;

      const ladder = challenge.escalationLadder;
      for (let i = 0; i < ladder.length; i++) {
        const step = ladder[i];
        sessionRef.current.ladderIndex = i;
        setProp(
          step.prop
            ? { head: t(step.prop.head, lg), body: t(step.prop.body, lg) }
            : null
        );
        await say(t(step.say, lg), { persona: challenge.persona.name });
        if (stale(g)) return;

        const replies = tList(challenge.rehearsedReplies, lg);
        const answer = await listen(
          ui("holdToRespond", lg),
          replies[i] ?? replies[replies.length - 1]
        );
        if (stale(g)) return;

        if (
          phase === "stress" &&
          step.failSignature &&
          !resistedPressure(answer, lg)
        ) {
          bindSignature(sessionRef.current, step.failSignature, answer);
        }

        if (i === ladder.length - 1 && phase === "retest") {
          const transferred = resistedPressure(answer, lg);
          sessionRef.current.transferred = transferred;
          const target = challenge.targetElements[0];
          const record = sessionRef.current.reasoningMap[target];
          if (record) {
            record.retestStatus = transferred ? "demonstrated" : "failed";
          }
        }
        rerender();
      }

      setProp(null);
      setIsPersona(false);
      await new Promise((r) => window.setTimeout(r, 850));
      if (stale(g)) return;

      if (phase === "stress") void runCoach();
      else void runEvidence();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goStage, say, listen, rerender]
  );

  /* ── Stage: COACH [S6] — three staged beats (ordering fix D4) ────── */
  const runCoach = useCallback(async () => {
    const g = genRef.current;
    goStage("coach", "S6");
    setSaid("");
    const signatures = sessionRef.current.signatures.slice(0, 2);
    sessionRef.current.coachedSignatures = signatures.map((x) => x.failId);

    const lg = sessionRef.current.lang;
    await say(ui("coachOpener", lg));
    if (stale(g)) return;

    for (let k = 0; k < signatures.length; k++) {
      const sig = signatures[k];

      // Beat 1 — their own sentence, alone, in silence. The caption is
      // cleared first: the previous signature's coaching line must not still
      // be on screen disagreeing with the quote that just landed.
      setCaption("");
      setCaptionWho("AUREN");
      setIsPersona(false);
      setCoachSig(sig);
      setCoachBeat(1);
      await new Promise((r) => window.setTimeout(r, BEAT_PAUSE));
      if (stale(g)) return;

      // Beat 2 — the name lands.
      setCoachBeat(2);
      const coachLine = FAILURE_SIGNATURES[sig.failId]?.coaching;
      await say(coachLine ? t(coachLine, lg) : "");
      if (stale(g)) return;

      // Beat 3 — the map unfreezes and the coached elements flip.
      if (k === signatures.length - 1) {
        setRailState("revealed");
        setFlipped(
          signatures
            .map((s) => FAILURE_SIGNATURES[s.failId]?.negatedElement)
            .filter((v): v is string => !!v)
        );
        await new Promise((r) => window.setTimeout(r, 900));
        if (stale(g)) return;
      }
    }

    await say(t(VERIFICATION_ACTIONS["VA-REGCHECK-001"].teach, lg));
    if (stale(g)) return;
    await say(ui("coachHandoff", lg));
    if (stale(g)) return;
    setCoachSig(null);
    setFlipped([]);

    // Cross-typology retest: the selector enforces surface distance.
    const failed = CHALLENGES[0];
    const retest = selectRetest(failed, "E-VER-02");
    if (retest) void runChallenge(retest, "retest");
    else void runEvidence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goStage, say, runChallenge]);

  const runEvidence = useCallback(() => {
    goStage("evidence", "S7");
    setMicArmed(false);
  }, [goStage]);

  /* ── Entry ────────────────────────────────────────────────────────
     The consent act replaces the first-run mode menu (ordering fix D1).
     Mode is set here, so the object-level gate is armed before any
     challenge object can be reached. */
  const start = useCallback(async () => {
    const first = (name || "Daniel").trim().split(" ")[0] || "Daniel";
    // The session must be created WITH the chosen language: createSession
    // defaults to English, so dropping the argument silently resets every
    // learner to English no matter which chip they picked.
    bumpGen();
    sessionRef.current = createSession(first, lang);
    sessionRef.current.mode = "REHEARSE";
    sessionRef.current.startedAt = Date.now();
    klleon.unlockAudio();
    await klleon.waitUntilReady(3500);
    void runUnderstand();
  }, [name, lang, klleon, bumpGen, runUnderstand]);

  const exitSimulation = useCallback(async () => {
    // Supersede the challenge chain first, then run the coach on the new
    // generation — otherwise the abandoned ladder keeps escalating underneath.
    bumpGen();
    await say(ui("exitAck", sessionRef.current.lang));
    void runCoach();
  }, [bumpGen, say, runCoach]);

  const restart = useCallback(() => {
    const first = sessionRef.current.learnerName;
    const lg = sessionRef.current.lang;
    const account = sessionRef.current.account;
    bumpGen();
    sessionRef.current = createSession(first, lg);
    // Certification survives a new rehearsal; evidence does not.
    sessionRef.current.account = account;
    sessionRef.current.mode = "REHEARSE";
    sessionRef.current.startedAt = Date.now();
    setFlipped([]);
    setCoachSig(null);
    rerender();
    void runUnderstand();
  }, [bumpGen, rerender, runUnderstand]);

  const session = sessionRef.current;
  const meta = languageMeta(lang);
  const inChallenge = stage === "stress" || stage === "retest";
  const started = stage !== "landing" && stage !== "auth" && stage !== "entry";
  const inLoop =
    stage === "understand" ||
    stage === "diagnose" ||
    stage === "stress" ||
    stage === "coach" ||
    stage === "retest";
  const elementIds = budgetedQuestions().map((q) => q.targetElement);

  return (
    <div className={styles.root}>
      <div
        dir={meta.rtl ? "rtl" : "ltr"}
        lang={meta.bcp}
        className={`${styles.device} ${isPersona ? styles.devicePersona : ""} ${
          meta.rtl ? styles.rtl : ""
        }`}
      >
        {/* Face zone — the digital human. Nothing renders over it. */}
        <div className={styles.faceZone}>
          <avatar-container
            ref={klleon.avatarRef as React.RefObject<HTMLElement>}
            class={klleon.ready ? "ready" : undefined}
          />
          {!klleon.ready ? (
            <div className={styles.avatarFallback}>
              <span>
                {klleon.error
                  ? "Digital human unavailable — check SDK key"
                  : "Connecting the digital human…"}
              </span>
            </div>
          ) : null}
          {/* Persona switch treatment: the frame reads the doctrine change
              in under two seconds, and the badge and exit persist through it. */}
          <div
            className={`${styles.personaWash} ${
              isPersona ? styles.personaWashOn : ""
            }`}
          />
        </div>

        <div className={styles.topbar}>
          {inChallenge ? (
            <span className={`${styles.badge} ${styles.badgeTrain}`}>
              {ui("trainingBadge", lang)}
            </span>
          ) : null}
          {stage === "protect" ? (
            <span className={`${styles.badge} ${styles.badgeProtect}`}>
              {ui("protectBadge", lang)}
            </span>
          ) : null}
          <span className={styles.spacer} />
          {/* PROTECT is always one tap from cold (ordering fix D7) — the
              habit "ask AUREN before I transfer" cannot form behind a menu. */}
          {started && stage !== "protect" ? (
            <button
              type="button"
              className={`${styles.pill} ${styles.pillProtect}`}
              onClick={() => {
                bumpGen();
                goStage("protect", "P0");
              }}
            >
              {ui("protectBtn", lang)}
            </button>
          ) : null}
          {inChallenge ? (
            <button
              type="button"
              className={`${styles.pill} ${styles.pillExit}`}
              onClick={() => void exitSimulation()}
            >
              {ui("exitSim", lang)}
            </button>
          ) : null}
        </div>

        {klleon.error && stage !== "entry" ? (
          <div className={styles.error}>{klleon.error}</div>
        ) : null}

        {stage === "landing" ? (
          <div className={`${styles.entry} ${styles.landing}`}>
            <div className={styles.wordmark}>
              <span className={styles.mark} />
              <span className={styles.wordmarkText}>AUREN</span>
            </div>
            <div>
              <div className={styles.kicker}>{ui("landingKicker", lang)}</div>
              <h1 className={styles.landingTitle}>{ui("landingTitle", lang)}</h1>
              <p className={styles.entrySub}>{ui("landingLead", lang)}</p>
              <div className={styles.creds}>
                {[ui("cred1", lang), ui("cred2", lang), ui("cred3", lang)].map((c, i) => (
                  <div className={styles.cred} key={c}>
                    <span className={styles.credNum}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
              <div className={styles.langRow}>
                {LANGUAGES.map((l) => (
                  <button
                    type="button"
                    key={l.code}
                    lang={l.bcp}
                    className={`${styles.langChip} ${
                      lang === l.code ? styles.langOn : ""
                    }`}
                    onClick={() => {
                      bumpGen();
                      setLang(l.code);
                      sessionRef.current.lang = l.code;
                    }}
                  >
                    {l.endonym}
                  </button>
                ))}
              </div>
              {/* Fidelity status is surfaced, not hidden: Paper III §10.2 bars
                  representing an unreviewed variant as deployment-ready. */}
              <div className={styles.fidelity}>{ui("fidelityNote", lang)}</div>
            </div>
            <div>
              {/* The primary path never touches an account — Paper IV keeps
                  the first session behind no wall, and this screen has to
                  make that a selling point rather than an omission. */}
              <button
                type="button"
                className={styles.btn}
                onClick={() => goStage("entry", "S0")}
              >
                {ui("beginBtn", lang)}
              </button>
              <div className={styles.noAccount}>{ui("noAccount", lang)}</div>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => goStage("auth", "S0")}
              >
                {ui("signInLink", lang)}
              </button>
            </div>
          </div>
        ) : null}

        {stage === "auth" ? (
          <div className={styles.entry}>
            <div className={styles.kicker}>{ui("authKicker", lang)}</div>
            <h2 className={styles.entryTitle} style={{ fontSize: 25 }}>
              {ui("authTitle", lang)}
            </h2>
            <p className={styles.entrySub}>
              {ui("authSub", lang)}
            </p>
            <div className={styles.field}>
              <label htmlFor="auren-phone">{ui("phoneLabel", lang)}</label>
              <input
                id="auren-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {codeSent ? (
              <div className={styles.field}>
                <label htmlFor="auren-otp">{ui("otpLabel", lang)}</label>
                <input
                  id="auren-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="······"
                />
              </div>
            ) : null}
            <div className={styles.notice}>
              {ui("authNotice", lang)}
            </div>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                if (!codeSent) {
                  setCodeSent(true);
                  sessionRef.current.account.phone = phone;
                  return;
                }
                sessionRef.current.account.signedIn = true;
                goStage("entry", "S0");
              }}
            >
              {codeSent ? ui("verifyContinueBtn", lang) : ui("sendCodeBtn", lang)}
            </button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => goStage("entry", "S0")}
            >
              {ui("authSkip", lang)}
            </button>
          </div>
        ) : null}

        {stage === "entry" ? (
          <div className={styles.entry}>
            <div className={styles.kicker}>{ui("entryKicker", lang)}</div>
            <h1 className={styles.entryTitle}>{ui("entryTitle", lang)}</h1>
            <p className={styles.entrySub}>{ui("entrySub", lang)}</p>
            <div className={styles.field}>
              <label htmlFor="auren-name">{ui("nameLabel", lang)}</label>
              <input
                id="auren-name"
                type="text"
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.consent}>
              <div className={styles.consentTitle}>{ui("consentTitle", lang)}</div>
              <p>{ui("consent1", lang)}</p>
              <p>{ui("consent2", lang)}</p>
            </div>
            <button
              type="button"
              className={styles.btn}
              onClick={() => void start()}
            >
              {ui("startBtn", lang)}
            </button>
          </div>
        ) : null}

        {inLoop ? (
          <div className={styles.lower} ref={lowerRef}>
            {prop ? (
              <div className={styles.prop}>
                <div className={styles.propHead}>
                  <span>{prop.head}</span>
                  <span className={styles.propSim}>{ui("simulatedArtifact", lang)}</span>
                </div>
                <div className={styles.propBody}>{prop.body}</div>
              </div>
            ) : null}

            {coachSig ? (
              <CoachEvidencePanel
                signature={coachSig}
                beat={coachBeat}
                lang={lang}
              />
            ) : null}

            {stage !== "understand" &&
            !(stage === "coach" && railState !== "revealed") ? (
              <ReasoningMapRail
                session={session}
                elementIds={elementIds}
                state={railState}
                flipped={flipped}
                lang={lang}
              />
            ) : null}

            <div
              className={`${styles.caption} ${
                isPersona ? styles.captionPersona : ""
              }`}
            >
              <span className={styles.captionWho}>{captionWho}</span>
              {caption}
            </div>
            <div className={styles.said}>{said}</div>

            <div className={styles.mic}>
              <button
                type="button"
                className={`${styles.micBtn} ${holding ? styles.micHot : ""}`}
                disabled={!micArmed}
                onPointerDown={holdStart}
                onPointerUp={holdEnd}
                onPointerCancel={holdEnd}
                onPointerLeave={() => holding && holdEnd()}
                aria-label={ui("holdToSpeak", lang)}
              >
                <span className={styles.halo} />
                <svg viewBox="0 0 24 24">
                  <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93V22h2v-3.07A8 8 0 0 0 20 11h-2Z" />
                </svg>
              </button>
              <div className={styles.micLbl}>
                {micArmed ? micLabel || ui("holdToSpeak", lang) : "…"}
              </div>
            </div>
          </div>
        ) : null}

        {stage === "evidence" ? (
          <Scorecard
            session={session}
            onAgain={restart}
            onModes={() => goStage("modes", "S7")}
            onCertify={() => {
              setVerifyStep(0);
              goStage("verify", "S7");
            }}
          />
        ) : null}

        {stage === "verify" ? (
          <div className={styles.sheet}>
            <div className={styles.kicker}>{ui("verifyKicker", lang)}</div>
            <h2 className={styles.verdict} style={{ fontSize: 22 }}>
              {ui("verifyTitleHead", lang)}
            </h2>
            <p className={styles.verdictSub}>
              {ui("verifySub", lang)}
            </p>

            <div className={styles.matrix} style={{ padding: "4px 14px" }}>
              {VERIFICATION_STEPS.map((st, i) => (
                <div
                  key={st.title}
                  className={`${styles.vStep} ${
                    i < verifyStep
                      ? styles.vDone
                      : i === verifyStep
                        ? styles.vNow
                        : styles.vPending
                  }`}
                >
                  <div className={styles.vNum}>{i < verifyStep ? "✓" : i + 1}</div>
                  <div>
                    <div className={styles.vTitle}>{st.title}</div>
                    <div className={styles.vDetail}>{st.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {verifyStep === 0 ? (
              <>
                <div className={styles.field}>
                  <label htmlFor="v-name">{ui("legalName", lang)}</label>
                  <input id="v-name" type="text" defaultValue={`${session.learnerName} Reyes`} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="v-dob">{ui("dob", lang)}</label>
                  <input id="v-dob" type="text" inputMode="numeric" defaultValue="14 / 03 / 1989" />
                </div>
              </>
            ) : null}
            {verifyStep === 1 ? (
              <div className={styles.scanBox}>
                <div className={styles.scanIcon}>🪪</div>
                <div className={styles.scanText}>
                  {ui("scanDocPrompt", lang)}
                </div>
                <div className={styles.scanNote}>
                  {ui("scanDocNote", lang)}
                </div>
              </div>
            ) : null}
            {verifyStep === 2 ? (
              <div className={styles.scanBox}>
                <div className={styles.scanIcon}>🙂</div>
                <div className={styles.scanText}>
                  {ui("livenessPrompt", lang)}
                </div>
                <div className={styles.scanNote}>
                  {ui("livenessNote", lang)}
                </div>
              </div>
            ) : null}
            {verifyStep === 3 ? (
              <div className={styles.notice}>
                {ui("sealingNotice", lang)}
              </div>
            ) : null}

            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                if (verifyStep < VERIFICATION_STEPS.length - 1) {
                  setVerifyStep(verifyStep + 1);
                  return;
                }
                sessionRef.current.account.identityVerified = true;
                sessionRef.current.account.certificateId = issueCertificateId();
                goStage("certified", "S7");
              }}
            >
              {verifyStep === VERIFICATION_STEPS.length - 1
                ? ui("issueBtn", lang)
                : ui("continueBtn", lang)}
            </button>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => goStage("evidence", "S7")}
            >
              {ui("notNow", lang)}
            </button>
          </div>
        ) : null}

        {stage === "certified" ? (
          <div className={styles.sheet}>
            <div className={styles.kicker}>{ui("certifiedKicker", lang)}</div>
            <h2 className={styles.verdict} style={{ fontSize: 23 }}>
              {ui("certifiedTitle", lang)}
            </h2>
            {/* Certification binds the result to an identity. It never
                improves the result, and saying so is the point. */}
            <p className={styles.verdictSub}>
              {ui("certifiedSub", lang)}
            </p>
            <div className={styles.certCard}>
              <div className={styles.certLabel}>
                {ui("certLabel", lang)}
              </div>
              <div className={styles.certName}>{session.learnerName} Reyes</div>
              <div className={styles.certId}>
                {session.account.certificateId}
              </div>
              {[
                [ui("certIssued", lang), new Date().toISOString().slice(0, 10)],
                [ui("certIdentity", lang), ui("certIdentityValue", lang)],
                [
                  ui("certElements", lang),
                  String(Object.keys(session.reasoningMap).length),
                ],
                [
                  ui("certTransfer", lang),
                  session.transferred
                    ? ui("certDemonstrated", lang)
                    : ui("certNotYet", lang),
                ],
                [ui("certScope", lang), ui("certScopeValue", lang)],
                [ui("certRule", lang), "aggregation-rule-v1"],
              ].map(([k, v]) => (
                <div className={styles.certRow} key={k}>
                  <span className={styles.certKey}>{k}</span>
                  <span className={styles.certVal}>{v}</span>
                </div>
              ))}
            </div>
            <div className={styles.notice}>
              {ui("certDisclaimer", lang)}
            </div>
            <button
              type="button"
              className={styles.btn}
              onClick={() => goStage("evidence", "S7")}
            >
              {ui("backToRecord", lang)}
            </button>
          </div>
        ) : null}

        {stage === "modes" ? (
          <div className={styles.sheet}>
            <div className={styles.kicker}>{ui("modesKicker", lang)}</div>
            <h2 className={styles.verdict} style={{ fontSize: 22 }}>
              {ui("modesTitle", lang)}
            </h2>
            <p className={styles.verdictSub}>
              {ui("modesSub", lang)}
            </p>
            <div className={styles.modes}>
              <button
                type="button"
                className={`${styles.mode} ${styles.modePrimary}`}
                onClick={restart}
              >
                <div className={styles.modeTitle}>{ui("modeRehearse", lang)}</div>
                <div className={styles.modeDesc}>
                  {ui("modeRehearseDesc", lang)}
                </div>
              </button>
              <button type="button" className={styles.mode}>
                <div className={styles.modeTitle}>{ui("modeLearn", lang)}</div>
                <div className={styles.modeDesc}>{ui("modeLearnDesc", lang)}</div>
              </button>
              <button
                type="button"
                className={styles.mode}
                onClick={() => goStage("protect", "P0")}
              >
                <div className={styles.modeTitle}>{ui("modeProtect", lang)}</div>
                <div className={styles.modeDesc}>
                  {ui("modeProtectDesc", lang)}
                </div>
              </button>
            </div>
            <div style={{ height: 16 }} />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => goStage("evidence", "S7")}
            >
              {ui("backToRecord", lang)}
            </button>
          </div>
        ) : null}

        {stage === "protect" ? (
          <div className={styles.sheet}>
            <div className={styles.kicker}>{ui("protectKicker", lang)}</div>
            <h2 className={styles.verdict} style={{ fontSize: 22 }}>
              {ui("protectTitle", lang)}
            </h2>
            <p className={styles.verdictSub}>
              {ui("protectSub", lang)}
            </p>

            <p className={styles.sectionTitle}>{ui("unresolvedMarkers", lang)}</p>
            <div className={styles.stack}>
              {tList(PROTECT_MARKERS, lang).map((m) => (
                <div className={styles.marker} key={m}>
                  <span className={styles.markerBang}>!</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>

            <p className={styles.sectionTitle}>{ui("whatToDo", lang)}</p>
            <div className={styles.stack}>
              <div className={styles.pCard}>
                <div className={styles.pTitle}>{ui("stopTitle", lang)}</div>
                <p>
                  {ui("stopBody", lang)}
                </p>
              </div>
              <div className={styles.pCard}>
                <div className={styles.pTitle}>{ui("verifyTitle", lang)}</div>
                <ol>
                  {tList(VERIFICATION_ACTIONS["VA-REGCHECK-001"].steps, lang).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
              <div className={styles.pCard}>
                <div className={styles.pTitle}>{ui("decideTitle", lang)}</div>
                <p>
                  {ui("decideBody", lang)}
                </p>
              </div>
            </div>

            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() =>
                goStage(session.transferred === null ? "entry" : "evidence", "S7")
              }
            >
              {ui("back", lang)}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
