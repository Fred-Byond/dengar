import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Citizen Experience — DENGAR.ai",
  description:
    "The bookable 5-minute digital-human listening session with the Minister. Bahasa Melayu / English / 中文 / தமிழ் / العربية.",
};

/**
 * The citizen experience. Serves the approved prototype
 * (public/prototypes/dengar-citizen.html) full-bleed. Phase 1 of the roadmap
 * replaces this with the React/Next PWA implementation of the same flow
 * (booking → session gateway → session → close), reusing the CVIF layer.
 */
export default function ExperiencePage() {
  return (
    <iframe
      className="prototype-frame"
      src="/prototypes/dengar-citizen.html"
      title="DENGAR.ai — Citizen Experience"
      allow="microphone"
    />
  );
}
