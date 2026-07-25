"use client";

import dynamic from "next/dynamic";

/**
 * The portal is client-only: it owns the digital-human SDK, the microphone
 * and the session timers.
 */
const ExperienceApp = dynamic(
  () => import("@/components/experience").then((m) => m.ExperienceApp),
  { ssr: false }
);

export function ExperienceClient({ sdkKey }: { sdkKey: string }) {
  return <ExperienceApp sdkKey={sdkKey} />;
}
