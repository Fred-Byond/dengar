import { NextRequest, NextResponse } from "next/server";
import { getProductImage } from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Product hero image, served for both the Nexus and the advisor catalog. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const img = getProductImage(params.id);
  if (!img) {
    return new NextResponse(null, { status: 404 });
  }
  return new NextResponse(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.mime,
      "Cache-Control": "no-cache",
    },
  });
}
