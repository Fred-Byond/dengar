import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/coach/auth";
import { activeEngineName } from "@/lib/coach/engine";
import { BEAUTY_COACH_PERSONA } from "@/lib/coach/persona";
import {
  addTurn,
  createSession,
  getAppointment,
  getProduct,
  getRunnablePack,
} from "@/lib/db/repos";
import { getLanguage } from "@/lib/coach/languages";

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
  // Language governance: a draft translation is never spoken as brand truth.
  const pack = product ? getRunnablePack(product.id, appointment.language) : null;
  if (!product || !pack) {
    return NextResponse.json(
      {
        error:
          "No market-approved launch pack in that language yet. Ask the product team to approve the translation in the Nexus.",
      },
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
  const lang = appointment.language;
  const greeting = BEAUTY_COACH_PERSONA.lines.greet(
    firstName,
    product,
    appointment.focus,
    lang
  );
  addTurn(session.id, {
    speaker: "coach",
    text: greeting,
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    session,
    greeting,
    wrapLine: BEAUTY_COACH_PERSONA.lines.wrap(lang),
    closeLine: BEAUTY_COACH_PERSONA.lines.close(firstName, lang),
    product,
    language: getLanguage(lang),
    packVersion: pack.version,
    translationStatus: pack.translationStatus,
  });
}
