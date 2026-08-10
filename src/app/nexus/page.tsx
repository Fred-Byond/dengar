import type { Metadata } from "next";
import { NexusApp } from "@/components/nexus/NexusApp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Nexus — L'Oréal Beauty Coach",
  description:
    "Product-team console: upload launches, maintain the governed product knowledge library the Beauty Coach trains on.",
};

export default function NexusPage() {
  return <NexusApp />;
}
