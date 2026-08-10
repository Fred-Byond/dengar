import { NextResponse } from "next/server";
import { listLaunchSummaries } from "@/lib/hq/aggregate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Launch-level aggregation for the HQ dashboard. Open in the pilot build
 * (same posture as dengar's dashboard); production adds an HQ role on
 * access codes, same pattern as the Nexus.
 */
export async function GET() {
  return NextResponse.json(listLaunchSummaries());
}
