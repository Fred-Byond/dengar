import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DENGAR Accountability — Directive Tracking & Ministry Response",
  description:
    "The directive lifecycle after issuance: who was assigned, what they replied, how long it took, and whether the outcome was verified.",
};

/**
 * PM deployment — dashboard 3 of 3.
 *
 * /pm/dashboard answers "what do the rakyat feel".
 * /pm/ledger    answers "what exactly was said, in which session".
 * This route answers "did the machine of government actually move" — the
 * communication trail, SLA clocks, escalation ladder, ministry responsiveness
 * index and the verification gate that stops a ministry closing its own work.
 *
 * Serves the approved prototype (public/prototypes/pm-accountability.html).
 */
export default function PmAccountabilityPage() {
  return (
    <iframe
      className="prototype-frame"
      src="/prototypes/pm-accountability.html"
      title="DENGAR Accountability — Directive Tracking & Ministry Response"
    />
  );
}
