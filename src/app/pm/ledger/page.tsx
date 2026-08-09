import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DENGAR Session Ledger — every session, searchable by reference",
  description:
    "Every citizen session by reference number: what was discussed, its CVIF scorecard, the directive it fed, and the tier-gated transcript.",
};

/**
 * PM deployment — the session ledger.
 *
 * The citizen-facing reference number is the primary key of the whole
 * platform: it is what a citizen quotes at a PMO counter, on WhatsApp or on
 * the status page. Raw transcripts are Tier 3 and gated behind a logged,
 * time-boxed access request — see docs/DATA-GOVERNANCE.md.
 *
 * Serves the approved prototype (public/prototypes/pm-ledger.html).
 */
export default function PmLedgerPage() {
  return (
    <iframe
      className="prototype-frame"
      src="/prototypes/pm-ledger.html"
      title="DENGAR Session Ledger"
    />
  );
}
