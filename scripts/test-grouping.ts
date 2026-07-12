import { prisma } from "../src/lib/prisma";
import { groupGenerationsForDisplay } from "../src/lib/car-generation-groups";
import { isRealCarPhoto } from "../src/lib/car-images";

async function main() {
  for (const slug of ["3-er-reihe", "5-series"]) {
    const model = await prisma.carModel.findFirst({
      where: { slug, brand: { slug: "bmw" } },
      include: { brand: true, generations: { orderBy: { sortOrder: "asc" } } },
    });
    if (!model) continue;
    const raw = model.generations.map((g) => ({ ...g, modelId: model.id }));
    const grouped = groupGenerationsForDisplay(raw, "bmw");
    console.log(`\nBMW ${model.name}: ${model.generations.length} → ${grouped.length}`);
    for (const g of grouped) {
      const photo = isRealCarPhoto(g.imageUrl) ? "📷" : "—";
      console.log(
        `${photo} ${g.code} [${g.variants.map((v) => v.code).join(", ")}]`
      );
    }
  }
}

main().finally(() => prisma.$disconnect());
