import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/coach/auth";
import { coachReply } from "@/lib/coach/engine";
import {
  addTurn,
  getProduct,
  getRunnablePack,
  getSession,
  listTurns,
} from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One conversation turn: advisor utterance in, governed coach reply out. */
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
  if (session.endedAt) {
    return NextResponse.json({ error: "Session has ended." }, { status: 409 });
  }
  const body = (await req.json().catch(() => null)) as {
    utterance?: string;
  } | null;
  const utterance = body?.utterance?.trim();
  if (!utterance) {
    return NextResponse.json({ error: "Empty utterance." }, { status: 400 });
  }

  const product = getProduct(session.productId);
  const pack = product ? getRunnablePack(product.id, session.language) : null;
  if (!product || !pack) {
    return NextResponse.json({ error: "Launch pack missing." }, { status: 409 });
  }

  const history = listTurns(session.id);
  const now = new Date().toISOString();
  addTurn(session.id, { speaker: "advisor", text: utterance, at: now });

  const { reply, engine } = await coachReply(
    {
      advisor: {
        advisorName: ctx.advisorName,
        role: ctx.role,
        marketName: ctx.marketName,
      },
      product,
      pack,
      focus: session.focus,
      language: session.language,
    },
    history,
    utterance
  );
  addTurn(session.id, {
    speaker: "coach",
    text: reply,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ reply, engine });
}
