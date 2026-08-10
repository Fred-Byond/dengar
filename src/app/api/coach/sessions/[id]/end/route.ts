import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/coach/auth";
import { scoreSession } from "@/lib/readiness/scorer";
import { READINESS_DIMENSIONS } from "@/lib/readiness/dimensions";
import {
  endSession,
  getLatestPack,
  getProduct,
  getRunnablePack,
  getSession,
  listTurns,
  saveScorecard,
} from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** End the session and return the launch-readiness scorecard. */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = verifySessionCookie(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!ctx) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const session = getSession(params.id);
  if (!session || session.advisorId !== ctx.advisorId) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  const pack =
    getRunnablePack(session.productId, session.language) ??
    getLatestPack(session.productId, "EN");
  if (!pack) {
    return NextResponse.json({ error: "Launch pack missing." }, { status: 409 });
  }
  const turns = listTurns(session.id);
  endSession(session.id);
  const product = getProduct(session.productId);
  const scorecard = scoreSession(session, turns, pack, product?.divisionId);
  saveScorecard(scorecard);
  return NextResponse.json({ scorecard, dimensions: READINESS_DIMENSIONS });
}
