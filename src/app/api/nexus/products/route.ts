import { NextRequest, NextResponse } from "next/server";
import { verifyNexusCookie, NEXUS_COOKIE_NAME } from "@/lib/coach/auth";
import { buildPack, type NexusPackInput } from "@/lib/coach/packbuild";
import type { Product } from "@/lib/coach/types";
import { LANGUAGES } from "@/lib/coach/languages";
import { BRANDS, DIVISIONS, getBrand } from "@/lib/coach/org";
import {
  listPackLanguages,
  listProductsForNexus,
  saveProductWithPack,
} from "@/lib/db/repos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function authed(req: NextRequest) {
  return verifyNexusCookie(req.cookies.get(NEXUS_COOKIE_NAME)?.value);
}

export async function GET(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const products = listProductsForNexus().map((p) => ({
    ...p,
    languages: listPackLanguages(p.id),
  }));
  return NextResponse.json({
    products,
    divisions: DIVISIONS.map((d) => ({
      id: d.id, name: d.name, shortName: d.shortName, advisorType: d.advisorType,
    })),
    brands: BRANDS,
    languages: LANGUAGES,
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function POST(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    product?: {
      id?: string;
      brand?: string;
      brandId?: string;
      category?: string;
      name?: string;
      tagline?: string;
      launchLabel?: string | null;
    };
    pack?: NexusPackInput;
    imageBase64?: string | null;
    imageMime?: string | null;
    translationStatus?: string;
  } | null;
  const p = body?.product;
  if (!p?.name?.trim() || !body?.pack) {
    return NextResponse.json(
      { error: "Product name and pack content are required." },
      { status: 400 }
    );
  }
  const category = ["skincare", "haircare", "makeup"].includes(p.category ?? "")
    ? (p.category as Product["category"])
    : "skincare";
  const brandRef = p.brandId ? getBrand(p.brandId) : null;
  const product: Product = {
    id: p.id?.trim() || slugify(p.name),
    brand: brandRef?.name || p.brand?.trim() || "L'Oréal Paris",
    category,
    name: p.name.trim(),
    tagline: p.tagline?.trim() || "",
    launchLabel: p.launchLabel?.trim() || null,
    brandId: brandRef?.id ?? null,
    divisionId: brandRef?.divisionId ?? null,
  };
  if (!product.id) {
    return NextResponse.json({ error: "Invalid product name." }, { status: 400 });
  }

  let image: { mime: string; data: Buffer } | null = null;
  if (body.imageBase64 && body.imageMime) {
    if (!/^image\/(png|jpeg|webp)$/.test(body.imageMime)) {
      return NextResponse.json(
        { error: "Image must be PNG, JPEG or WebP." },
        { status: 400 }
      );
    }
    const data = Buffer.from(body.imageBase64, "base64");
    if (data.length === 0 || data.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be under 3 MB." },
        { status: 400 }
      );
    }
    image = { mime: body.imageMime, data };
  }

  const pack = buildPack(body.pack);
  if (pack.sections.length === 0 || pack.approvedClaims.length === 0) {
    return NextResponse.json(
      { error: "At least one pack section and one approved claim are required." },
      { status: 400 }
    );
  }
  const status = ["source", "approved", "draft"].includes(body.translationStatus ?? "")
    ? body.translationStatus
    : undefined;
  const { version } = saveProductWithPack({
    product, pack, image, translationStatus: status,
  });
  return NextResponse.json({
    productId: product.id, version, language: pack.language,
  });
}
