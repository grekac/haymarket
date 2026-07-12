import fs from "fs";
import path from "path";
import { parseGenerationCodes } from "../src/lib/car-catalog-utils";

const file = path.join(process.cwd(), "prisma/data/vehicles.min.json");
const db = JSON.parse(fs.readFileSync(file, "utf8")) as {
  makes: [string, string, string[], ...unknown[]][];
};

const honda = db.makes.find((m) => m[0] === "honda");
if (!honda) {
  console.log("no honda");
  process.exit(0);
}

// makes structure: [slug, name, types, models?]
import { getBrand } from "auto-parts-db";

const brand = getBrand("Honda");
const accord = brand?.models.find((m) => m.name === "Accord");
if (!accord) {
  console.log("no accord", brand?.models.slice(0, 5).map((m) => m.name));
  process.exit(0);
}

console.log("Honda Accord source generations:");
for (const gen of accord.generations) {
  const codes = parseGenerationCodes(gen.name);
  console.log(`  "${gen.name}" (${gen.yearFrom}-${gen.yearTo}) → [${codes.join(", ")}]`);
}
