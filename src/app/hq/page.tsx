import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Launch Readiness Command — L'Oréal Beauty Coach",
  description:
    "HQ intelligence: launch readiness by market, territory and distributor, message fidelity, pack-version adoption and the re-coaching queue.",
};

/**
 * The HQ Launch Readiness dashboard. Serves the approved prototype
 * (public/prototypes/launch-readiness.html) full-bleed — same pattern as
 * /dashboard. The next phase wires it to live scorecard aggregation from
 * src/lib/db (sessions + scorecards) instead of the in-page synthetic set.
 */
export default function HqPage() {
  return (
    <iframe
      className="prototype-frame"
      src="/prototypes/launch-readiness.html"
      title="Launch Readiness Command — L'Oréal Beauty Coach"
    />
  );
}
