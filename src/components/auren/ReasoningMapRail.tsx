"use client";

import { ELEMENTS } from "@/lib/auren/objects";
import { t, ui, type Lang } from "@/lib/auren/i18n";
import type { AurenSession } from "@/lib/auren/session";
import styles from "./auren.module.css";

/**
 * The Reasoning Map rail — the measurement heart of the session, and the only
 * map the learner ever sees. (The Situation Map routes scenarios and PROTECT
 * markers and is never rendered in REHEARSE — Paper III §3.5.)
 *
 * Three component states, per Paper IV Part V:
 *   building  — DIAGNOSE
 *   frozen    — STRESS and RETEST (the freeze rule)
 *   revealed  — COACH, with evidence attached
 *
 * The freeze rule is implemented HERE rather than at the call site, so there
 * is no code path in which a failing element flips live during a challenge.
 */
export type RailState = "building" | "frozen" | "revealed";

export function ReasoningMapRail({
  session,
  elementIds,
  state,
  flipped,
  lang,
}: {
  session: AurenSession;
  elementIds: string[];
  state: RailState;
  lang: Lang;
  /** Elements that just flipped — animated once, on reveal. */
  flipped?: string[];
}) {
  const frozen = state === "frozen";

  return (
    <div className={`${styles.rail} ${frozen ? styles.railFrozen : ""}`}>
      <div className={styles.railHead}>
        <span className={styles.railTitle}>{ui("reasoningMap", lang)}</span>
        <span className={styles.railState}>
          {frozen
            ? ui("railFrozen", lang)
            : state === "revealed"
              ? ui("railRevealed", lang)
              : ui("railBuilding", lang)}
        </span>
      </div>
      <div className={styles.chips}>
        {elementIds.map((id) => {
          const element = ELEMENTS[id];
          const record = session.reasoningMap[id];
          // Freeze means "stop updating", not "go blank": the rail keeps
          // showing the map as it stood BEFORE the challenge, dimmed. Nothing
          // recorded under pressure appears until COACH — a live flip would
          // tip the learner off and turn behaviour measurement back into
          // test-taking (Experience Principle 6).
          const status = record?.status ?? "unknown";

          let cls = styles.chip;
          let mark = "?";
          if (status === "demonstrated" || status === "demonstrated-under-pressure") {
            cls = `${styles.chip} ${styles.chipOk}`;
            mark = "✓";
          } else if (status === "failed") {
            cls = `${styles.chip} ${styles.chipBad}`;
            mark = "✕";
          }
          if (flipped?.includes(id)) cls += ` ${styles.chipFlip}`;

          return (
            <div key={id} className={cls}>
              <span className={styles.chipMark}>{mark}</span>
              <span className={styles.chipName}>{t(element.label, lang)}</span>
              <span className={styles.chipId}>{id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
