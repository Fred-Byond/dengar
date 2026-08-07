import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk to the Prime Minister — DENGAR.ai",
  description:
    "The bookable 5-minute digital-human listening session with the Prime Minister: cost of living, jobs, governance and national priorities, in five languages.",
};

/**
 * PM deployment — citizen experience. Serves the approved prototype
 * (public/prototypes/pm-citizen.html) full-bleed.
 *
 * Same platform as /experience, re-scoped for the Prime Minister: national
 * whole-of-government topics, PM-voiced controlled session, and a
 * `DigitalHuman` adapter shaped to the production avatar web SDK
 * (see src/lib/digital-human/web-sdk.ts) — the illustrated figure is the
 * placeholder until the live stream mounts into #avatarMount.
 */
export default function PmExperiencePage() {
  return (
    <iframe
      className="prototype-frame"
      src="/prototypes/pm-citizen.html"
      title="DENGAR.ai — Talk to the Prime Minister"
      allow="microphone"
    />
  );
}
