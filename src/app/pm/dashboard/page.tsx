import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DENGAR Intelligence — Prime Minister's Office",
  description:
    "Whole-of-government listening intelligence: national agenda tracker, cost-of-living index, ministry-routed directives, and the PMO delivery cockpit.",
};

/**
 * PM deployment — DENGAR Intelligence for the Prime Minister's Office.
 * Serves the approved prototype (public/prototypes/pm-dashboard.html).
 *
 * Differs from /dashboard in scope, not architecture: national topics
 * (cost of living, jobs, corruption, housing…), execution routed to
 * MINISTRIES rather than KDN agencies, a National Agenda tracker, and a
 * Prime Minister ↔ PMO Delivery Unit role split (the front end of RBAC).
 */
export default function PmDashboardPage() {
  return (
    <iframe
      className="prototype-frame"
      src="/prototypes/pm-dashboard.html"
      title="DENGAR Intelligence — Prime Minister's Office"
    />
  );
}
