import type { Metadata } from "next";
import ConversationExplorer from "@/components/messi/ConversationExplorer";

export const metadata: Metadata = {
  title: "Conversation Explorer — MESSI.LIVE",
  description:
    "Every completed conversation as one FVIF Fan Insight Record: the question, the confirmed summary, the memory carried forward, the transcript, and the care routing.",
};

export default function MessiConversationsPage({
  searchParams,
}: {
  searchParams?: { queue?: string };
}) {
  return <ConversationExplorer initialQueue={searchParams?.queue} />;
}
