import type { Metadata } from "next";
import { MessiExperienceClient } from "./MessiExperienceClient";

export const metadata: Metadata = {
  title: "5 Minutes With Messi — MESSI.LIVE",
  description:
    "The bookable five-minute one-to-one conversation with Lionel Messi's officially authorised digital human, in eleven languages.",
};

/** Always read env at request time — NEXT_PUBLIC_* is otherwise inlined empty in the Docker image. */
export const dynamic = "force-dynamic";

export default function MessiExperiencePage() {
  // Prefer KLLEON_SDK_KEY (not inlined). Fall back to bracket access so a
  // runtime NEXT_PUBLIC_* from compose .env still works after image build.
  const sdkKey =
    process.env.KLLEON_SDK_KEY ||
    process.env["NEXT_PUBLIC_KLLEON_SDK_KEY"] ||
    "";
  return <MessiExperienceClient sdkKey={sdkKey} />;
}
