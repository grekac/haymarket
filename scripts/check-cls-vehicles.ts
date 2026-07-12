import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "prisma/data/vehicles.min.json");
const db = JSON.parse(fs.readFileSync(file, "utf8")) as {
  models: [string, string, string, string, unknown[]][];
};

const cls = db.models.filter((m) => m[0] === "mercedes-benz" && /cls/i.test(m[2]));
console.log("vehicles.min CLS entries:", cls.length);
for (const m of cls) {
  console.log("\nModel:", m[2], "kind:", m[3]);
  const gens = m[4] as { name?: string; yearFrom?: number; yearTo?: number }[] | undefined;
  if (Array.isArray(gens)) {
    gens.forEach((g) => console.log(`  ${JSON.stringify(g)}`));
  } else {
    console.log("  gens:", m[4]);
  }
}
