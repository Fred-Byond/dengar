import { NextRequest, NextResponse } from "next/server";
import { createNexusCookie } from "@/lib/coach/auth";
import { isProductTeamCode } from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    code?: string;
    name?: string;
  } | null;
  if (!body?.code || !body?.name?.trim()) {
    return NextResponse.json(
      { error: "Team access code and your name are required." },
      { status: 400 }
    );
  }
  if (!isProductTeamCode(body.code)) {
    return NextResponse.json(
      { error: "That code is not a product-team code." },
      { status: 401 }
    );
  }
  const cookie = createNexusCookie(body.name.trim());
  const res = NextResponse.json({ editorName: body.name.trim() });
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: cookie.maxAge,
    path: "/",
  });
  return res;
}
