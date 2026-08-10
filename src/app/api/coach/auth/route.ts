import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/coach/auth";
import { ADVISOR_ROLES, type AdvisorRole } from "@/lib/coach/types";
import { createAdvisor, resolveAccessCode } from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    code?: string;
    name?: string;
    role?: string;
  } | null;
  if (!body?.code || !body?.name) {
    return NextResponse.json(
      { error: "Access code and name are required." },
      { status: 400 }
    );
  }
  const role: AdvisorRole = ADVISOR_ROLES.some((r) => r.id === body.role)
    ? (body.role as AdvisorRole)
    : "agent";

  const org = resolveAccessCode(body.code);
  if (!org) {
    return NextResponse.json(
      { error: "Access code not recognised. Check with your distributor." },
      { status: 401 }
    );
  }
  const advisor = createAdvisor(body.name, role, org.distributorId);
  const ctx = {
    ...org,
    advisorId: advisor.id,
    advisorName: advisor.name,
    role,
  };
  const cookie = createSessionCookie(ctx);
  const res = NextResponse.json({ context: ctx });
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: cookie.maxAge,
    path: "/",
  });
  return res;
}
