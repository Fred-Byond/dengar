import type { Metadata } from "next";
import { ConsoleApp } from "@/components/console/ConsoleApp";

export const metadata: Metadata = {
  title: "Knowledge Authority — governance console",
  description:
    "The internal admin console for the governed interview engine: object registry, governance lifecycle, publish gate and release ledger across AUREN, Project Pioneer and Beauty Intelligence.",
};

/**
 * Knowledge Authority.
 *
 * The reconciliation of three specifications that independently arrived at the
 * same architecture — AUREN Paper III, Pioneer Paper IV and Beauty
 * Intelligence. See docs/KNOWLEDGE-AUTHORITY.md for what each contributed and
 * where they had to be reconciled.
 */
export default function ConsolePage() {
  return <ConsoleApp />;
}
