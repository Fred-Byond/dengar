import type { Metadata } from "next";
import WeeklyBriefing from "@/components/WeeklyBriefing";

export const metadata: Metadata = {
  title: "Weekly Ministry Briefing — DENGAR.ai",
  description:
    "The recurring deliverable: headline numbers, top pain points with representative quotes, citizen suggestions, geographic watch, emerging keywords, accountability and recommended follow-ups. Auto-generated, human-reviewed.",
};

/**
 * The Weekly Ministry Briefing (§5.1 Brief). Auto-generated from the week's
 * Session Insight Records via buildBriefing() (src/lib/briefing), print-ready
 * (Save as PDF). This is the recurring deliverable the platform fee is anchored
 * to — human-reviewed before release.
 */
export default function BriefingPage() {
  return <WeeklyBriefing />;
}
