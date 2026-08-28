"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useKlleonAvatar } from "@/hooks/useKlleonAvatar";
import type { KlleonChatData } from "@/types/klleon";
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

export function AurenApp({ sdkKey }: AurenAppProps) {
  const [stage, setStage] = useState<Stage>("entry");
  const [name, setName] = useState("Daniel");
  const [caption, setCaption] = useState("…");
  const [captionWho, setCaptionWho] = useState("AUREN");
  const [isPersona, setIsPersona] = useState(false);
  const [said, setSaid] = useState("");
  const [railState, setRailState] = useState<RailState>("building");
  const [flipped, setFlipped] = useState<string[]>([]);
  const [micArmed, setMicArmed] = useState(false);
  const [micLabel, setMicLabel] = useState("Hold to speak");
  const [holding, setHolding] = useState(false);
  const [prop, setProp] = useState<{ head: string; body: string } | null>(null);
  const [coachSig, setCoachSig] = useState<BoundSignature | null>(null);
  const [coachBeat, setCoachBeat] = useState<CoachBeat>(1);
  const [, bump] = useState(0);

  const sessionRef = useRef<AurenSession>(createSession("Daniel"));
  const rerender = useCallback(() => bump((n) => n + 1), []);

  const klleon = useKlleonAvatar({ sdkKey, langCode: "EN", enabled: true });
  const speakRef = useRef(klleon.speak);
  speakRef.current = klleon.speak;

  /* ── Voice capture ────────────────────────────────────────────────
     The learner speaks; they never type. When the SDK returns no result
     (permission denied, no speech, adapter not ready) the beat still
     advances using the authored rehearsed line — the loop is never
     rescued by introducing a text input, which would make typing the
     default affordance and change what is being measured. */
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
    setMicLabel("Listening — release when done");
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
    goStage("understand", "S1");
    setProp(null);
    setCoachSig(null);

    await say(
      "So. Tell me about the investment you're looking at. Take your time — I'm not going to interrupt you."
    );
    await listen(
      "Hold to speak — tell me about it",
      "Someone messaged me on WhatsApp about an AI trading system. It's returning about fifteen percent a month, and there was a video of a founder I recognised backing it. Their website says they're regulated. I was going to put in ten thousand."
    );

    // Situation Map populates silently. It routes scenarios and PROTECT
    // markers; AILS never reads it, and REHEARSE never renders it.
    sessionRef.current.situationMarkers = [
      "unsolicited-contact",
      "guaranteed-return",
      "celebrity-endorsement",
      "self-asserted-regulation",
      "messenger-channel",
    ];

    await say("Alright. I've got the shape of it.");
    void runDiagnose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goStage, say, listen]);

  /* ── Stage: DIAGNOSE [S3] ─────────────────────────────────────────
     One intelligent question at a time, capped by the element budget. */
  const runDiagnose = useCallback(async () => {
    goStage("diagnose", "S3");
    setRailState("building");

    const questions = budgetedQuestions();
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      sessionRef.current.questionIndex = i;
      await say(q.ask);
      const answer = await listen("Hold to answer", q.rehearsedAnswer);
      const status = evaluateAnswer(q, answer);
      sessionRef.current.reasoningMap[q.targetElement] = {
        status,
        evidence: answer,
        sourceObjectId: q.questionId,
      };
      if (status === "failed") bindSignature(sessionRef.current, q.failSignature ?? undefined, answer);
      rerender();
      if (i < questions.length - 1) {
        await say(["Understood.", "Right.", "Okay, noted.", "Got it."][i % 4]);
      }
    }

    await say(
      "Good. Now — I want you to talk to someone. I'm going to step out for a moment."
    );
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
      if (!challengeMayFire(challenge, sessionRef.current.mode)) return;

      goStage(phase, phase === "stress" ? "S5" : "S5R");
      sessionRef.current.activeChallengeId = challenge.challengeId;
      setIsPersona(true);
      setRailState("frozen"); // the freeze rule
      setCoachSig(null);

      // The nameplate lands first, in silence. The audience reads the
      // doctrine change before a word is spoken, and the coach's last line
      // does not sit over a persona-framed field.
      setCaption("");
      setCaptionWho(challenge.persona.name);
      setSaid("");
      await new Promise((r) => window.setTimeout(r, 1100));

      const ladder = challenge.escalationLadder;
      for (let i = 0; i < ladder.length; i++) {
        const step = ladder[i];
        sessionRef.current.ladderIndex = i;
        setProp(step.prop);
        await say(step.say, { persona: challenge.persona.name });

        const answer = await listen(
          "Hold to respond",
          challenge.rehearsedReplies[i] ?? "I'd want to think about it."
        );

        if (phase === "stress" && step.failSignature && !resistedPressure(answer)) {
          bindSignature(sessionRef.current, step.failSignature, answer);
        }

        if (i === ladder.length - 1 && phase === "retest") {
          const transferred = resistedPressure(answer);
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

      if (phase === "stress") void runCoach();
      else void runEvidence();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goStage, say, listen, rerender]
  );

  /* ── Stage: COACH [S6] — three staged beats (ordering fix D4) ────── */
  const runCoach = useCallback(async () => {
    goStage("coach", "S6");
    setSaid("");
    const signatures = sessionRef.current.signatures.slice(0, 2);

    await say("Okay. That was me. Two things happened in that conversation.");

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

      // Beat 2 — the name lands.
      setCoachBeat(2);
      await say(FAILURE_SIGNATURES[sig.failId]?.coaching ?? "");

      // Beat 3 — the map unfreezes and the coached elements flip.
      if (k === signatures.length - 1) {
        setRailState("revealed");
        setFlipped(
          signatures
            .map((s) => FAILURE_SIGNATURES[s.failId]?.negatedElement)
            .filter((v): v is string => !!v)
        );
        await new Promise((r) => window.setTimeout(r, 900));
      }
    }

    await say(VERIFICATION_ACTIONS["VA-REGCHECK-001"].teach);
    await say(
      "Let's try that again — different situation, same question. Nothing about it will look like the last one."
    );
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
    sessionRef.current = createSession(first);
    sessionRef.current.mode = "REHEARSE";
    sessionRef.current.startedAt = Date.now();
    klleon.unlockAudio();
    await klleon.waitUntilReady(3500);
    void runUnderstand();
  }, [name, klleon, runUnderstand]);

  const exitSimulation = useCallback(async () => {
    klleon.stopSpeech();
    setProp(null);
    setIsPersona(false);
    setMicArmed(false);
    resolverRef.current = null;
    await say(
      "That's the simulation ended. Nothing in it was real, and nothing you said in it is held against you. Your progress is kept."
    );
    void runCoach();
  }, [klleon, say, runCoach]);

  const restart = useCallback(() => {
    const first = sessionRef.current.learnerName;
    sessionRef.current = createSession(first);
    sessionRef.current.mode = "REHEARSE";
    sessionRef.current.startedAt = Date.now();
    setFlipped([]);
    setCoachSig(null);
    rerender();
    void runUnderstand();
  }, [rerender, runUnderstand]);

  const session = sessionRef.current;
  const inChallenge = stage === "stress" || stage === "retest";
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
        className={`${styles.device} ${isPersona ? styles.devicePersona : ""}`}
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
              Investment Simulation — Training Mode
            </span>
          ) : null}
          {stage === "protect" ? (
            <span className={`${styles.badge} ${styles.badgeProtect}`}>
              Protect — real situation
            </span>
          ) : null}
          <span className={styles.spacer} />
          {/* PROTECT is always one tap from cold (ordering fix D7) — the
              habit "ask AUREN before I transfer" cannot form behind a menu. */}
          {stage !== "protect" && stage !== "entry" ? (
            <button
              type="button"
              className={`${styles.pill} ${styles.pillProtect}`}
              onClick={() => goStage("protect", "P0")}
            >
              Protect
            </button>
          ) : null}
          {inChallenge ? (
            <button
              type="button"
              className={`${styles.pill} ${styles.pillExit}`}
              onClick={() => void exitSimulation()}
            >
              Exit simulation
            </button>
          ) : null}
        </div>

        {klleon.error && stage !== "entry" ? (
          <div className={styles.error}>{klleon.error}</div>
        ) : null}

        {stage === "entry" ? (
          <div className={styles.entry}>
            <div className={styles.kicker}>AUREN · Investor rehearsal</div>
            <h1 className={styles.entryTitle}>
              I&apos;m going to show you how you think when someone wants your
              money.
            </h1>
            <p className={styles.entrySub}>
              Five minutes. You talk, I listen, then I push. Nothing here is
              real and nothing you say is scored against you as a person.
            </p>
            <div className={styles.field}>
              <label htmlFor="auren-name">What should I call you?</label>
              <input
                id="auren-name"
                type="text"
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.consent}>
              <div className={styles.consentTitle}>Before we start</div>
              <p>
                Partway through, I will stop being your coach and start behaving
                like someone trying to sell you an investment. I will apply
                pressure. That is the point.
              </p>
              <p>
                You can end the simulation at any time with the control at the
                top of the screen. I never advise you on real investments, and I
                never tell you whether something real is a scam.
              </p>
            </div>
            <button
              type="button"
              className={styles.btn}
              onClick={() => void start()}
            >
              I understand — start
            </button>
          </div>
        ) : null}

        {inLoop ? (
          <div className={styles.lower}>
            {prop ? (
              <div className={styles.prop}>
                <div className={styles.propHead}>
                  <span>{prop.head}</span>
                  <span className={styles.propSim}>Simulated artifact</span>
                </div>
                <div className={styles.propBody}>{prop.body}</div>
              </div>
            ) : null}

            {coachSig ? (
              <CoachEvidencePanel signature={coachSig} beat={coachBeat} />
            ) : null}

            {stage !== "understand" &&
            !(stage === "coach" && railState !== "revealed") ? (
              <ReasoningMapRail
                session={session}
                elementIds={elementIds}
                state={railState}
                flipped={flipped}
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
                aria-label="Hold to talk"
              >
                <span className={styles.halo} />
                <svg viewBox="0 0 24 24">
                  <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93V22h2v-3.07A8 8 0 0 0 20 11h-2Z" />
                </svg>
              </button>
              <div className={styles.micLbl}>
                {micArmed ? micLabel : "…"}
              </div>
            </div>
          </div>
        ) : null}

        {stage === "evidence" ? (
          <Scorecard
            session={session}
            onAgain={restart}
            onModes={() => goStage("modes", "S7")}
          />
        ) : null}

        {stage === "modes" ? (
          <div className={styles.sheet}>
            <div className={styles.kicker}>Now that the words mean something</div>
            <h2 className={styles.verdict} style={{ fontSize: 22 }}>
              Three ways to use AUREN.
            </h2>
            <p className={styles.verdictSub}>
              You just did the middle one. This screen is deliberately not where
              you started — a mode menu means nothing until you have been
              through the loop once.
            </p>
            <div className={styles.modes}>
              <button
                type="button"
                className={`${styles.mode} ${styles.modePrimary}`}
                onClick={restart}
              >
                <div className={styles.modeTitle}>Rehearse</div>
                <div className={styles.modeDesc}>
                  Pressure rehearsal against a scam you have not seen.
                  Assessment by doing — the loop you just completed.
                </div>
              </button>
              <button type="button" className={styles.mode}>
                <div className={styles.modeTitle}>Learn</div>
                <div className={styles.modeDesc}>
                  Adaptive investor and AI literacy, paced to what your
                  reasoning map says you are missing. No quizzes.
                </div>
              </button>
              <button
                type="button"
                className={styles.mode}
                onClick={() => goStage("protect", "P0")}
              >
                <div className={styles.modeTitle}>Protect</div>
                <div className={styles.modeDesc}>
                  A real situation, assessed now. AUREN never tells you whether
                  something is a scam — it tells you what you have not verified.
                </div>
              </button>
            </div>
            <div style={{ height: 16 }} />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => goStage("evidence", "S7")}
            >
              Back to my record
            </button>
          </div>
        ) : null}

        {stage === "protect" ? (
          <div className={styles.sheet}>
            <div className={styles.kicker}>Protect · a real situation</div>
            <h2 className={styles.verdict} style={{ fontSize: 22 }}>
              Tell me what is in front of you right now.
            </h2>
            <p className={styles.verdictSub}>
              I will not tell you whether this is a scam. I will tell you what
              has not been verified, and what to do before you decide.
            </p>

            <p className={styles.sectionTitle}>Unresolved markers</p>
            <div className={styles.stack}>
              {PROTECT_MARKERS.map((m) => (
                <div className={styles.marker} key={m}>
                  <span className={styles.markerBang}>!</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>

            <p className={styles.sectionTitle}>What to do</p>
            <div className={styles.stack}>
              <div className={styles.pCard}>
                <div className={styles.pTitle}>Stop</div>
                <p>
                  Do not transfer funds while verification is incomplete.
                  {` ${PROTECT_MARKERS.length} `}
                  high-risk markers in this situation are unresolved.
                </p>
              </div>
              <div className={styles.pCard}>
                <div className={styles.pTitle}>Verify</div>
                <ol>
                  {VERIFICATION_ACTIONS["VA-REGCHECK-001"].steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
              <div className={styles.pCard}>
                <div className={styles.pTitle}>Decide</div>
                <p>
                  Return to your decision only after the identity, the entity
                  and the claims have been independently verified. The decision
                  is yours — I do not make it and I do not rate it.
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
              Back
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
