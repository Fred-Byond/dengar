import type { Metadata } from "next";
import { TeamIntelligence } from "@/components/dashboard/TeamIntelligence";
import { ORGANISATION, ORG_CONTEXT } from "@/lib/org";
import { TARGETED, WAVES, profile } from "@/lib/seed";
import type { TeamIntelligenceProfile, Wave } from "@/lib/tif/types";

export const metadata: Metadata = {
  title: "Team Intelligence Dashboard — MIROME",
  description:
    "Team health across ten climate constructs, department heat map, leader–staff perception gap, capability distribution, ranked intervention priorities and progress from baseline to 90 days.",
};

/**
 * The dashboard reads the profile the real TIF pipeline produced — the seeded
 * transcripts are scored by src/lib/tif/scorer.ts and aggregated by
 * src/lib/tif/aggregate.ts. Replacing the seed with the production database
 * changes nothing in the view.
 */
export default function DashboardPage() {
  const profiles = Object.fromEntries(
    WAVES.map((w) => [w.id, profile(w.id)])
  ) as Record<Wave, TeamIntelligenceProfile>;

  return (
    <TeamIntelligence
      organisation={ORGANISATION}
      orgContext={ORG_CONTEXT}
      profiles={profiles}
      waves={WAVES}
      targeted={TARGETED}
    />
  );
}
