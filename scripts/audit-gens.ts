import { prisma } from "../src/lib/prisma";
import { groupGenerationsForDisplay } from "../src/lib/car-generation-groups";
import { isRealCarPhoto } from "../src/lib/car-images";

async function audit(slug: string, model: string) {
  const m = await prisma.carModel.findFirst({
    where: { slug: model, brand: { slug } },
    include: { generations: { orderBy: { sortOrder: "asc" } } },
  });
  if (!m) return;
  const raw = m.generations.map((g) => ({ ...g, modelId: m.id }));
  const grouped = groupGenerationsForDisplay(raw, slug);
  console.log(`\n${slug} ${m.name}: DB ${raw.length} → UI ${grouped.length}`);
  for (const g of grouped) {
    const photo = isRealCarPhoto(g.imageUrl) ? "✓" : "—";
    const vars = g.variants.length > 1 ? ` [${g.variants.map((v) => v.code).join(",")}]` : "";
    console.log(`  ${photo} ${g.code} ${g.yearFrom}-${g.yearTo ?? "now"}${vars}`);
    if (g.imageUrl && g.imageUrl.includes("wikimedia")) {
      const match = g.imageUrl.match(/\/([A-Za-z0-9_%()-]+)\/640px/);
      if (match) console.log(`       photo: ${match[1].slice(0, 60)}`);
    }
  }
}

async function main() {
  await audit("bmw", "3-er-reihe");
  await audit("mercedes-benz", "c-class");
  await audit("volkswagen", "golf");
  await audit("toyota", "camry");
  await audit("honda", "accord");
}

main().finally(() => prisma.$disconnect());
