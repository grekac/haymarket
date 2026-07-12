import { prisma } from "../src/lib/prisma";
import { buildCarCatalogFromPackage } from "../src/lib/car-catalog-builder";
import { groupGenerationsForDisplay } from "../src/lib/car-generation-groups";

type Issue = {
  severity: "error" | "warn" | "info";
  brand: string;
  model: string;
  slug: string;
  message: string;
};

const issues: Issue[] = [];

function normKey(slug: string, name?: string) {
  return (name ?? slug).toLowerCase().trim().replace(/-class$/i, "").replace(/[^a-z0-9]/g, "");
}

async function main() {
  const catalog = buildCarCatalogFromPackage();
  const catalogByBrand = new Map(catalog.map((b) => [b.slug, b]));

  const dbModels = await prisma.carModel.findMany({
    include: {
      brand: { select: { slug: true, name: true } },
      generations: { orderBy: { sortOrder: "asc" } },
    },
  });

  const catalogModelMap = new Map<string, (typeof catalog)[0]["models"][0]>();
  for (const brand of catalog) {
    for (const m of brand.models) {
      catalogModelMap.set(`${brand.slug}|${normKey(m.slug, m.name)}`, m);
    }
  }

  let totalModels = 0;
  let withGens = 0;
  let allOnly = 0;
  let groupedReduced = 0;

  for (const model of dbModels) {
    const gens = model.generations;
    if (gens.length === 0) continue;
    totalModels++;

    const brandSlug = model.brand.slug;
    const norm = normKey(model.slug, model.name);
    const cat = catalogModelMap.get(`${brandSlug}|${norm}`);

    const raw = gens.map((g) => ({ ...g, modelId: model.id }));
    const grouped = groupGenerationsForDisplay(raw, brandSlug);

    if (gens.some((g) => g.code !== "ALL")) withGens++;
    if (gens.length === 1 && gens[0].code === "ALL") allOnly++;

    if (grouped.length < gens.length) groupedReduced++;

    // Junk codes
    for (const g of gens) {
      if (/^\d+$/.test(g.code)) {
        issues.push({
          severity: "error",
          brand: brandSlug,
          model: model.name,
          slug: model.slug,
          message: `Мусорный код поколения: "${g.code}" (${g.yearFrom}-${g.yearTo ?? "now"})`,
        });
      }
      if (g.code.includes("(") && !g.code.includes(")")) {
        issues.push({
          severity: "error",
          brand: brandSlug,
          model: model.name,
          slug: model.slug,
          message: `Битый код: "${g.code}"`,
        });
      }
      if (g.yearFrom > (g.yearTo ?? 9999)) {
        issues.push({
          severity: "error",
          brand: brandSlug,
          model: model.name,
          slug: model.slug,
          message: `Неверные годы: ${g.code} ${g.yearFrom}-${g.yearTo}`,
        });
      }
    }

    // Catalog mismatch
    if (cat && cat.generations.some((g) => g.code !== "ALL")) {
      const catCodes = cat.generations.map((g) => g.code).sort().join("|");
      const dbCodes = gens.map((g) => g.code).sort().join("|");
      if (catCodes !== dbCodes) {
        const catN = cat.generations.filter((g) => g.code !== "ALL").length;
        const dbN = gens.filter((g) => g.code !== "ALL").length;
        if (Math.abs(catN - dbN) >= 2 || (catN >= 3 && dbN <= 1)) {
          issues.push({
            severity: "warn",
            brand: brandSlug,
            model: model.name,
            slug: model.slug,
            message: `Расхождение с каталогом: DB ${dbN} vs каталог ${catN} [${dbCodes.slice(0, 80)}]`,
          });
        }
      }
    }

    // ALL only but catalog has real generations
    if (gens.length === 1 && gens[0].code === "ALL" && cat && cat.generations.some((g) => g.code !== "ALL")) {
      issues.push({
        severity: "error",
        brand: brandSlug,
        model: model.name,
        slug: model.slug,
        message: `Только ALL, но в каталоге ${cat.generations.length} поколений`,
      });
    }

    // Suspicious grouping: merged unrelated years
    for (const g of grouped) {
      if (g.variants.length < 2) continue;
      const years = new Set(g.variants.map((v) => {
        const gen = gens.find((x) => x.id === v.id);
        return `${gen?.yearFrom}|${gen?.yearTo ?? "null"}`;
      }));
      if (years.size > 1) {
        issues.push({
          severity: "warn",
          brand: brandSlug,
          model: model.name,
          slug: model.slug,
          message: `Группа ${g.code} объединила разные годы: ${g.variants.map((v) => v.code).join(", ")}`,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warns = issues.filter((i) => i.severity === "warn");

  console.log("=== СВОДКА ===");
  console.log(`Моделей с поколениями: ${totalModels}`);
  console.log(`С реальными поколениями: ${withGens}`);
  console.log(`Только ALL: ${allOnly}`);
  console.log(`С группировкой кузовов: ${groupedReduced}`);
  console.log(`Ошибок: ${errors.length}, предупреждений: ${warns.length}`);

  console.log("\n=== ОШИБКИ (топ 40) ===");
  errors.slice(0, 40).forEach((i) => console.log(`[${i.brand}/${i.slug}] ${i.message}`));

  console.log("\n=== ПРЕДУПРЕЖДЕНИЯ (топ 40) ===");
  warns.slice(0, 40).forEach((i) => console.log(`[${i.brand}/${i.slug}] ${i.message}`));

  // Popular brands spot check
  const popular = ["bmw", "mercedes-benz", "audi", "toyota", "honda", "volkswagen", "hyundai", "kia", "nissan", "lexus"];
  console.log("\n=== ПОПУЛЯРНЫЕ МАРКИ ===");
  for (const slug of popular) {
    const models = dbModels.filter((m) => m.brand.slug === slug && m.generations.some((g) => g.code !== "ALL"));
    const allModels = dbModels.filter((m) => m.brand.slug === slug);
    const allOnlyCount = allModels.filter((m) => m.generations.length === 1 && m.generations[0]?.code === "ALL").length;
    const mismatch = issues.filter((i) => i.brand === slug && i.severity === "error").length;
    console.log(`${slug}: ${models.length} с поколениями, ${allOnlyCount} только ALL, ${mismatch} ошибок`);
  }

  // Write full report
  const fs = await import("fs");
  const path = await import("path");
  const reportPath = path.join(process.cwd(), "scripts", "generation-audit-report.txt");
  fs.writeFileSync(
    reportPath,
    issues.map((i) => `${i.severity}\t${i.brand}\t${i.slug}\t${i.model}\t${i.message}`).join("\n"),
    "utf8"
  );
  console.log(`\nПолный отчёт: ${reportPath} (${issues.length} записей)`);
}

main().finally(() => prisma.$disconnect());
