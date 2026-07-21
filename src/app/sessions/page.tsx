import type { Metadata } from "next";
import SessionExplorer from "@/components/SessionExplorer";

export const metadata: Metadata = {
  title: "Session Explorer — Ministry Intelligence",
  description:
    "Search and filter every listening session, open the CVIF Session Insight Record, read the transcript (original + English), and work the urgent review queue. PII masked by default.",
};

/**
 * Dashboard view 5 — Session Explorer. The first React-native dashboard view,
 * wired to the real CVIF `deterministicScorer` (src/lib/cvif) over a seeded
 * dataset (src/lib/seed). This is where the intelligence layer becomes visible
 * to the Ministry: one record per session, with evidence-grounded scores.
 */
export default function SessionsPage() {
  return <SessionExplorer />;
}
