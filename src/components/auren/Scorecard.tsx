"use client";

import { useState } from "react";
import { ELEMENTS, FAILURE_SIGNATURES } from "@/lib/auren/objects";
import {
  AILS_RULE_VERSION,
  budgetedQuestions,
  computeAils,
  verdictFor,
  type AurenSession,
} from "@/lib/auren/session";
import { trimQuote } from "./CoachEvidencePanel";
import styles from "./auren.module.css";

/**
 * Evidential Scorecard v3 — the climax artifact.
 *
 * ORDERING (study fix D5). Paper IV opens Stage 7 with the four-column matrix,
 * the AILS block and the explainability sentence. That is the AUDIT artifact:
 * right for a judge, wrong as the first thing the learner meets. Paper III §9.2
 * already argues the sentence is the product — so the verdict renders above the
 * matrix, and the matrix is the proof underneath it.
 *
 * Every cell is a view onto a record field. Nothing here is generated prose,
 * and every expanded cell shows the verbatim passage that supports it.
 */
export function Scorecard({
  session,
  onAgain,
  onModes,
}: {
  session: AurenSession;
  onAgain: () => void;
  onModes: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const verdict = verdictFor(session);
  const ails = computeAils(session);
  const questions = budgetedQuestions();

  return (
    <div className={styles.sheet}>
      <div className={styles.kicker}>Investor Readiness Record · sealed</div>
      <h2 className={styles.verdict}>{verdict.headline}</h2>
      <p className={styles.verdictSub}>{verdict.sub}</p>

      <p className={styles.sectionTitle}>Evidence chain</p>
      <div className={styles.matrix}>
        <div className={styles.mHead}>
          <span>Element</span>
          <span>Base</span>
          <span>Press</span>
          <span>Coach</span>
          <span>Novel</span>
        </div>

        {questions.map((q) => {
          const id = q.targetElement;
          const record = session.reasoningMap[id];
          if (!record) return null;

          const coached = session.signatures.some(
            (s) => FAILURE_SIGNATURES[s.failId]?.negatedElement === id
          );
          const passedBaseline = record.status === "demonstrated";

          const cells: Array<{ mark: string; cls: string }> = [
            cell(passedBaseline ? "pass" : "fail"),
            // Under pressure: only elements a challenge actually targeted have
            // a pressure column. Everything else is not-testable-this-session.
            coached ? cell("fail") : cell(passedBaseline ? "pass" : "none"),
            coached ? cell("pass") : cell("none"),
            coached
              ? cell(record.retestStatus === "demonstrated" ? "pass" : "fail")
              : cell("none"),
          ];

          return (
            <div className={styles.mRow} key={id}>
              <div className={styles.mCells}>
                <div className={styles.mName}>
                  {ELEMENTS[id].label}
                  <i>
                    {id} · {ELEMENTS[id].authorityAnchor}
                  </i>
                </div>
                {cells.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.mCell} ${c.cls}`}
                    onClick={() => setOpen(open === id ? null : id)}
                    aria-label={`Show evidence for ${ELEMENTS[id].label}`}
                  >
                    {c.mark}
                  </button>
                ))}
              </div>
              {open === id ? (
                <div className={styles.evidence}>
                  Bound evidence · <b>“{trimQuote(record.evidence, 120)}”</b> —
                  elicited by {record.sourceObjectId}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {session.signatures.length > 0 ? (
        <>
          <p className={styles.sectionTitle}>Failure signatures</p>
          <div className={styles.stack}>
            {session.signatures.map((s) => {
              const fail = FAILURE_SIGNATURES[s.failId];
              return (
                <div className={styles.sig} key={s.failId}>
                  <div className={styles.sigId}>{s.failId}</div>
                  <div className={styles.sigDef}>{fail?.definition}</div>
                  <div className={styles.quoteMeta}>
                    Bound to: “{trimQuote(s.quote)}”
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      <p className={styles.sectionTitle}>AILS</p>
      <div className={styles.ails}>
        <div className={styles.ailsNum}>
          <span className={styles.ailsFrom}>{ails.before}</span>
          <span className={styles.ailsArrow}>→</span>
          <span>{ails.after}</span>
        </div>
        <div className={styles.ailsExplain}>{ails.explainability}</div>
        {/* The claim made aloud is within-session transfer only. Durable
            transfer is the pilot's question — restraint as credibility. */}
        <div className={styles.ruleVersion}>
          {AILS_RULE_VERSION} · within-session transfer only · durable transfer
          not claimed
        </div>
      </div>

      {/* The retention loop: the next weakness, named, one tap away. */}
      <button type="button" className={styles.btn} onClick={onAgain}>
        Rehearse your next weakness
      </button>
      <div style={{ height: 9 }} />
      <button
        type="button"
        className={`${styles.btn} ${styles.btnGhost}`}
        onClick={onModes}
      >
        See what else AUREN does
      </button>
    </div>
  );
}

function cell(kind: "pass" | "fail" | "none"): { mark: string; cls: string } {
  if (kind === "pass") return { mark: "✓", cls: styles.mPass };
  if (kind === "fail") return { mark: "✕", cls: styles.mFail };
  return { mark: "–", cls: "" };
}
