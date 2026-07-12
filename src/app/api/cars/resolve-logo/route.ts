import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveBrandLogo, LOGO_INITIALS } from "@/lib/car-logos";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const brand = await prisma.carBrand.findUnique({ where: { id } });
  if (!brand) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (brand.logoUrl && brand.logoUrl !== LOGO_INITIALS && !brand.logoUrl.includes("car-logos-dataset")) {
    return NextResponse.json({ url: brand.logoUrl });
  }

  const url = await resolveBrandLogo(brand.name, brand.slug);

  if (url !== LOGO_INITIALS) {
    await prisma.carBrand.update({
      where: { id },
      data: { logoUrl: url },
    });
  }

  return NextResponse.json({ url });
}
