import type { Metadata } from "next";
import WeeklyBriefing from "@/components/WeeklyBriefing";
import { generatePmSessions } from "@/lib/seed-pm";
import { PMO_PROFILE } from "@/lib/deployments";

export const metadata: Metadata = {
  title: "Weekly Prime Minister's Briefing — DENGAR.ai",
  description:
    "The recurring whole-of-government deliverable: national headline, top concerns with representative voices, citizen proposals, geographic watch and cross-ministry accountability.",
};

/**
 * PMO deployment — the Weekly Prime Minister's Briefing.
 *
 * Same generator as /briefing; the deployment profile supplies PM sessions
 * and the ministry roster, so pain points route to MOF / KPDN / KESUMA /
 * MOH / KPKT / JPM and accountability reads cross-ministry.
 */
export default function PmBriefingPage() {
  return (
    <WeeklyBriefing
      config={{
        sessions: generatePmSessions(260),
        weekLabel: "Week 29 · 13–19 July 2026",
        ownerConfig: {
          taxonomy: PMO_PROFILE.taxonomy,
          departments: PMO_PROFILE.departments,
          fallbackDepartment: "pmo",
        },
        institution: "MALAYSIA MADANI",
        institutionSub: "PRIME MINISTER'S OFFICE · JABATAN PERDANA MENTERI",
        documentTitle: "Weekly Prime Minister's Briefing",
        backHref: "/pm/dashboard",
        backLabel: "← PMO Intelligence",
        accountabilityLabel: "Cross-ministry accountability",
      }}
    />
  );
}
