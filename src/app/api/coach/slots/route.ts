import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/coach/auth";
import { listSlots } from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = verifySessionCookie(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!ctx) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({ slots: listSlots(ctx.marketId) });
}
