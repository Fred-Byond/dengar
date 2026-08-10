import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/coach/auth";
import { activeEngineName } from "@/lib/coach/engine";
import { BEAUTY_COACH_PERSONA } from "@/lib/coach/persona";
import {
  addTurn,
  createSession,
  getAppointment,
  getLatestPack,
  getProduct,
} from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start a coaching session from a confirmed appointment. */
export async function POST(req: NextRequest) {
  const ctx = verifySessionCookie(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!ctx) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    appointmentRef?: string;
  } | null;
  const appointment = body?.appointmentRef
    ? getAppointment(body.appointmentRef)
    : null;
  if (!appointment || appointment.advisorId !== ctx.advisorId) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }
  const product = getProduct(appointment.productId);
  const pack = product
    ? getLatestPack(product.id, appointment.language) ??
      getLatestPack(product.id, "EN")
    : null;
  if (!product || !pack) {
    return NextResponse.json(
      { error: "No launch pack available for this product." },
      { status: 409 }
    );
  }

  const session = createSession({
    appointmentRef: appointment.ref,
    advisorId: ctx.advisorId,
    productId: product.id,
    focus: appointment.focus,
    language: appointment.language,
    engine: activeEngineName(),
  });

  const firstName = ctx.advisorName.split(" ")[0];
  const greeting = BEAUTY_COACH_PERSONA.lines.greet(
    firstName,
    product,
    appointment.focus
  );
  addTurn(session.id, {
    speaker: "coach",
    text: greeting,
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    session,
    greeting,
    wrapLine: BEAUTY_COACH_PERSONA.lines.wrap(),
    closeLine: BEAUTY_COACH_PERSONA.lines.close(firstName),
    product,
  });
}
