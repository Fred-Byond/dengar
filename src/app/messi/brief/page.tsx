import type { Metadata } from "next";
import WorldBrief from "@/components/messi/WorldBrief";

export const metadata: Metadata = {
  title: "The Messi World Brief — MESSI.LIVE",
  description:
    "The recurring deliverable: what the world asked Lionel this week, what it means, what to make next, who needs care, and where the business is moving.",
};

export default function MessiBriefPage() {
  return <WorldBrief />;
}
