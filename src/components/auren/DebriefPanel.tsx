import type { DebriefRow } from "@/lib/auren/debrief";
import styles from "./auren.module.css";

export type DebriefKind = "good" | "bad" | "next";

export interface DebriefCard {
  kind: DebriefKind;
  title: string;
  rows: DebriefRow[];
}

const TONE: Record<DebriefKind, string> = {
  good: styles.debriefGood,
  bad: styles.debriefBad,
  next: styles.debriefNext,
};

/**
 * The spoken debrief's visual half.
 *
 * Beat-driven, like the coach panel: the caller appends a card as the coach
 * STARTS saying it, so the card confirms what was heard rather than competing
 * with it. Nothing renders before its line is spoken, and everything stays
 * inside the overlay zone — the face is never crowded to make room for it.
 */
export function DebriefPanel({
  cards,
  quoteLabel,
  action,
}: {
  cards: DebriefCard[];
  quoteLabel: string;
  action?: { label: string; onClick: () => void };
}) {
  if (cards.length === 0 && !action) return null;
  return (
    <div>
      {cards.map((card, i) => (
        <div key={card.kind + i} className={`${styles.debriefCard} ${TONE[card.kind]}`}>
          <div className={styles.debriefTitle}>{card.title}</div>
          {card.rows.map((row, j) => (
            <div key={j} className={styles.debriefRow}>
              <span className={styles.debriefMark}>{row.mark}</span>
              <span className={styles.debriefText}>
                {row.text}
                {row.quote ? (
                  <i className={styles.debriefQuote}>
                    {quoteLabel}: “{row.quote}”
                  </i>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      ))}
      {action ? (
        <button
          type="button"
          className={`${styles.btn} ${styles.debriefBtn}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
