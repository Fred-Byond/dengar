import type { Metadata } from "next";
import { ExperienceClient } from "./ExperienceClient";

export const metadata: Metadata = {
  title: "Citizen Experience — DENGAR.ai",
  description:
    "The bookable 5-minute digital-human listening session with the Minister. Bahasa Melayu / English / 中文 / தமிழ் / العربية.",
};

/** Always read env at request time — NEXT_PUBLIC_* is otherwise inlined empty in the Docker image. */
export const dynamic = "force-dynamic";

/**
 * Citizen experience — React/TypeScript PWA journey (Phase 1).
 * The frozen HTML prototype remains at /prototypes/dengar-citizen.html for reference.
 */
export default function ExperiencePage() {
  // Prefer KLLEON_SDK_KEY (not inlined). Fall back to bracket access so a
  // runtime NEXT_PUBLIC_* from compose .env still works after image build.
  const sdkKey =
    process.env.KLLEON_SDK_KEY ||
    process.env["NEXT_PUBLIC_KLLEON_SDK_KEY"] ||
    "";
  return <ExperienceClient sdkKey={sdkKey} />;
}
