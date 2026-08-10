import { NextResponse } from "next/server";
import { COACHING_FOCUSES } from "@/lib/coach/types";
import { listProducts } from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    products: listProducts(),
    focuses: COACHING_FOCUSES,
  });
}
