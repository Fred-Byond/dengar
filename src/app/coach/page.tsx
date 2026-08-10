import type { Metadata } from "next";
import { CoachClient } from "./CoachClient";

// Read the SDK key at request time (not build time) — same pattern as
// /experience: bracket access defeats Next's build-time env inlining.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "L'Oréal Beauty Coach — Launch Readiness Coaching",
  description:
    "Appointment-based AI coaching for L'Oréal distributors, agents and beauty advisors.",
};

export default function CoachPage() {
  const sdkKey =
    process.env["KLLEON_SDK_KEY"] ||
    process.env["NEXT_PUBLIC_KLLEON_SDK_KEY"] ||
    "";
  return <CoachClient sdkKey={sdkKey} />;
}
