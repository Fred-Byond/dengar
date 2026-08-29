"use client";

import { FAILURE_SIGNATURES } from "@/lib/auren/objects";
import { t, ui, type Lang } from "@/lib/auren/i18n";
import type { BoundSignature } from "@/lib/auren/session";
import styles from "./auren.module.css";

/**
 * The Coach Evidence Panel — the soul screen.
 *
 * ORDERING (study fix D4). Paper IV renders the quote card, the signature name
 * and the map reveal together. Three high-information surfaces landing at once
 * at the emotional peak of the product reads as a dashboard refresh. Here the
 * panel is driven by an explicit BEAT so the caller can stage it as a cut:
 *
 *   beat 1  the learner's own sentence, alone, in silence
 *   beat 2  the signature is named and defined
 *   beat 3  (caller) the Reasoning Map unfreezes and the element flips
 *
 * Same components, same data, sequenced rather than rendered.
 */
export type CoachBeat = 1 | 2 | 3;

export function CoachEvidencePanel({
  signature,
  beat,
  lang,
}: {
  signature: BoundSignature;
  beat: CoachBeat;
  lang: Lang;
}) {
  const fail = FAILURE_SIGNATURES[signature.failId];

  return (
    <>
      <div className={`${styles.beat} ${styles.quote}`}>
        <div className={styles.quoteText}>“{trimQuote(signature.quote)}”</div>
        <div className={styles.quoteMeta}>{ui("yourWords", lang)}</div>
      </div>

      {beat >= 2 && fail ? (
        <div className={`${styles.beat} ${styles.sig}`}>
          <div className={styles.sigId}>{fail.failId}</div>
          <div className={styles.sigDef}>{t(fail.definition, lang)}</div>
        </div>
      ) : null}
    </>
  );
}

/** Quotes render at display size; long narratives are elided, never reworded. */
export function trimQuote(quote: string, max = 96): string {
  if (quote.length <= max) return quote;
  return `${quote.slice(0, max - 3).replace(/[\s,.]+$/, "")}…`;
}
