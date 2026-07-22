import type { Metadata } from "next";
import { ExperienceClient } from "./ExperienceClient";

export const metadata: Metadata = {
  title: "Citizen Experience — DENGAR.ai",
  description:
    "The bookable 5-minute digital-human listening session with the Minister. Bahasa Melayu / English / 中文 / தமிழ் / العربية.",
};

/**
 * Citizen experience — React/TypeScript PWA journey (Phase 1).
 * The frozen HTML prototype remains at /prototypes/dengar-citizen.html for reference.
 */
export default function ExperiencePage() {
  const sdkKey = process.env.NEXT_PUBLIC_KLLEON_SDK_KEY ?? "";
  return <ExperienceClient sdkKey={sdkKey} />;
}
