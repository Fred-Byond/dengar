import { NextResponse } from "next/server";
import { COACHING_FOCUSES } from "@/lib/coach/types";
import { LANGUAGES } from "@/lib/coach/languages";
import { BRANDS, DIVISIONS } from "@/lib/coach/org";
import { listPackLanguages, listProducts } from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const products = listProducts().map((p) => ({
    ...p,
    // Only languages an advisor may actually train in.
    languages: listPackLanguages(p.id)
      .filter((l) => l.status !== "draft")
      .map((l) => l.language),
  }));
  return NextResponse.json({
    products,
    focuses: COACHING_FOCUSES,
    languages: LANGUAGES,
    divisions: DIVISIONS.map((d) => ({
      id: d.id, name: d.name, shortName: d.shortName,
      advisorType: d.advisorType, channels: d.channels,
    })),
    brands: BRANDS,
  });
}
