import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DENGAR.ai — Check the status of your voice",
  description:
    "Citizen-facing status check: enter your session reference and see exactly where your voice went and what happened because of it.",
};

/**
 * PM deployment — citizen status check.
 *
 * Closes the loop the citizen experience opens. Reference + last four digits
 * of the phone number resolves to one session and shows its journey. Protected
 * disclosures deliberately do NOT resolve here or at a counter — they route the
 * citizen to the receiving authority instead.
 *
 * Serves the approved prototype (public/prototypes/pm-status.html).
 */
export default function PmStatusPage() {
  return (
    <iframe
      className="prototype-frame"
      src="/prototypes/pm-status.html"
      title="DENGAR.ai — Check the status of your voice"
    />
  );
}
