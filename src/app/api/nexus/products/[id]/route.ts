import { NextRequest, NextResponse } from "next/server";
import { verifyNexusCookie, NEXUS_COOKIE_NAME } from "@/lib/coach/auth";
import { getLatestPack, getProduct, listPackLanguages } from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Full detail for the editor: product + latest pack (EN pilot). */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyNexusCookie(req.cookies.get(NEXUS_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const product = getProduct(params.id);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  const url = new URL(req.url);
  const language = (url.searchParams.get("language") || "EN").toUpperCase();
  const pack = getLatestPack(product.id, language);
  return NextResponse.json({
    product,
    pack,
    language,
    languages: listPackLanguages(product.id),
  });
}
