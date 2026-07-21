import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "National Pulse — Ministry Intelligence Dashboard",
  description:
    "What citizens are telling the Minister: sentiment by state, top issues, citizen suggestions, urgent review queue and the action tracker.",
};

/**
 * The Ministry intelligence dashboard (National Pulse v2). Serves the approved
 * prototype (public/prototypes/national-pulse.html) full-bleed. Phase 2 of the
 * roadmap wires it to the live CVIF aggregation API (src/lib/cvif) instead of
 * the in-page synthetic dataset, and adds the Session Explorer (view 5).
 */
export default function DashboardPage() {
  return (
    <iframe
      className="prototype-frame"
      src="/prototypes/national-pulse.html"
      title="National Pulse — Ministry Intelligence Dashboard"
    />
  );
}
