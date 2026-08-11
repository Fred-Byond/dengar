import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/coach/auth";
import { sttConfigured, transcribe } from "@/lib/coach/stt";
import { getSession } from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cap upload size — one coaching utterance, not a recording session. */
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Transcribe one spoken advisor turn.
 *
 * The language is taken from the SESSION, never from the request body: the
 * advisor booked a session in an approved language and is scored against that
 * language's pack, so a client that asked for a different one would be asking
 * to be graded against wording it never agreed to.
 */
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
  if (!sttConfigured()) {
    return NextResponse.json(
      { error: "Voice input is not configured. Type your answer instead." },
      { status: 503 }
    );
  }

  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "No audio received." }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "Recording too long." }, { status: 413 });
  }

  const result = await transcribe(audio, session.language);
  if (!result) {
    // Deliberately not a guess: a wrong transcript becomes a wrong score with
    // a verbatim quote attached. Let the advisor type instead.
    return NextResponse.json(
      { error: "Could not make that out. Try again, or type your answer." },
      { status: 422 }
    );
  }
  return NextResponse.json(result);
}
