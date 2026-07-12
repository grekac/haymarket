import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTrimsForModel } from "@/lib/car-model-filters";
import { getDefaultTrimsForModel } from "@/lib/car-trims-defaults";

export async function GET(req: NextRequest) {
  const modelId = req.nextUrl.searchParams.get("modelId");
  if (!modelId) {
    return NextResponse.json({ error: "modelId required" }, { status: 400 });
  }

  const parent = await prisma.carModel.findUnique({
    where: { id: modelId },
    select: {
      id: true,
      name: true,
      brandId: true,
      brand: { select: { name: true } },
    },
  });

  if (!parent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allModels = await prisma.carModel.findMany({
    where: { brandId: parent.brandId },
    select: {
      id: true,
      name: true,
      slug: true,
      brandId: true,
      generations: { select: { code: true } },
    },
  });

  const trims = extractTrimsForModel(allModels, {
    ...parent,
    slug: "",
    generations: [],
  });

  const merged = [...new Set([...trims, ...getDefaultTrimsForModel(parent.name)])].sort((a, b) =>
    a.localeCompare(b, "ru")
  );

  return NextResponse.json({
    model: parent.name,
    brand: parent.brand.name,
    trims: merged,
  });
}
