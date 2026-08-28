import type { Metadata } from "next";
import AurenClient from "./AurenClient";

export const metadata: Metadata = {
  title: "AUREN — Investor Rehearsal",
  description:
    "The AUREN rehearsal loop: understand, diagnose, stress, coach, retest. A voice-first session with the Digital Human coach, ending in an evidence chain.",
};

/** Always read env at request time — NEXT_PUBLIC_* is otherwise inlined empty in the Docker image. */
export const dynamic = "force-dynamic";

/**
 * AUREN investor-rehearsal experience.
 *
 * The screen order here is the ordering study's corrected sequence, not a
 * one-to-one rendering of the engine state machine — see
 * docs/AUREN-ORDERING.md and the Stage type in src/lib/auren/session.ts.
 *
 * The self-contained prototype (voice via the browser speech APIs, no SDK key
 * required) is served at /prototypes/auren-rehearsal.html.
 */
export default function AurenPage() {
  const sdkKey =
    process.env.KLLEON_SDK_KEY ||
    process.env["NEXT_PUBLIC_KLLEON_SDK_KEY"] ||
    "";
  return <AurenClient sdkKey={sdkKey} />;
}
