import type { Metadata } from "next";
import SessionExplorer from "@/components/SessionExplorer";
import { generatePmSessions } from "@/lib/seed-pm";
import { PMO_PROFILE } from "@/lib/deployments";

export const metadata: Metadata = {
  title: "Session Explorer — Prime Minister's Office",
  description:
    "Search and filter every PM listening session, open the CVIF Session Insight Record, read the transcript, and work the national escalation queue. PII masked by default.",
};

/**
 * PMO deployment — Session Explorer.
 *
 * Same component as /sessions; only the deployment profile differs. The
 * sessions are scored by the CVIF engine configured with the PMO taxonomy
 * (src/lib/seed-pm.ts), so records classify into national concerns and the
 * recommended owner is a MINISTRY rather than a KDN agency.
 */
export default function PmSessionsPage() {
  return (
    <SessionExplorer
      config={{
        sessions: generatePmSessions(260),
        taxonomy: PMO_PROFILE.taxonomy,
        departments: PMO_PROFILE.departments,
        fallbackDepartment: "pmo",
        backHref: "/pm/dashboard",
        backLabel: "← PMO Intelligence",
        ownerLabel: "Lead ministry",
      }}
    />
  );
}
