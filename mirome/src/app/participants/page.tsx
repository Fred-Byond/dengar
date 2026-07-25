import type { Metadata } from "next";
import { ParticipantExplorer } from "@/components/ParticipantExplorer";
import { records } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Participant Explorer — MIROME Team Intelligence",
  description:
    "The evidence behind every dashboard number: capability scores with their verbatim support, climate responses, scenario observations and the human-review queue.",
};

export default function ParticipantsPage() {
  return <ParticipantExplorer records={records("baseline")} />;
}
