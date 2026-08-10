import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/coach/auth";
import { COACHING_FOCUSES, type CoachingFocus } from "@/lib/coach/types";
import { bookAppointment, getProduct, SlotFullError } from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ctx = verifySessionCookie(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!ctx) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    slotId?: string;
    productId?: string;
    focus?: string;
    language?: string;
  } | null;
  if (!body?.slotId || !body?.productId) {
    return NextResponse.json(
      { error: "Slot and product are required." },
      { status: 400 }
    );
  }
  if (!getProduct(body.productId)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }
  const focus: CoachingFocus = COACHING_FOCUSES.some((f) => f.id === body.focus)
    ? (body.focus as CoachingFocus)
    : "product-knowledge";
  try {
    const appointment = bookAppointment({
      advisorId: ctx.advisorId,
      slotId: body.slotId,
      productId: body.productId,
      focus,
      language: body.language || "EN",
    });
    return NextResponse.json({ appointment });
  } catch (e) {
    if (e instanceof SlotFullError) {
      return NextResponse.json(
        { error: "That slot just filled up. Please pick another." },
        { status: 409 }
      );
    }
    throw e;
  }
}
