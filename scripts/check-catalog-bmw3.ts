import { buildCarCatalogFromPackage } from "../src/lib/car-catalog-builder";

const catalog = buildCarCatalogFromPackage();
const bmw = catalog.find((b) => b.slug === "bmw");
const m = bmw?.models.find((x) => x.slug === "3-er-reihe");
console.log("Catalog BMW 3-er-reihe generations:");
m?.generations.forEach((g) => console.log(`  ${g.code} ${g.yearFrom}-${g.yearTo}`));
