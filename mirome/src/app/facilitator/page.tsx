import type { Metadata } from "next";
import { FacilitatorPack } from "@/components/FacilitatorPack";
import { ORGANISATION, ORG_CONTEXT } from "@/lib/org";
import { profile } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Facilitator Intelligence Pack — MIROME",
  description:
    "The pre-programme briefing: evidence base, priority findings, recommended programme design, group composition, anonymised voices and the governance constraints.",
};

export default function FacilitatorPage() {
  return (
    <FacilitatorPack
      organisation={ORGANISATION}
      orgContext={ORG_CONTEXT}
      profile={profile("baseline")}
    />
  );
}
