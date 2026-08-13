import type { Metadata } from "next";
import GlobalPulse from "@/components/messi/GlobalPulse";

export const metadata: Metadata = {
  title: "MESSI GLOBAL PULSE — Management Dashboard",
  description:
    "What the world is asking Messi: topics, emerging signals, country growth, the response queue for Lionel, duty of care, territories, membership and the rights matrix.",
};

/**
 * The management dashboard — two role views over one dataset:
 * "Messi view" (the relationship) and "Management view" (the business).
 * Wired to the real FVIF aggregation in src/lib/messi.
 */
export default function MessiDashboardPage() {
  return <GlobalPulse />;
}
