import fs from "fs";
import path from "path";

const full = JSON.parse(fs.readFileSync(path.join(process.cwd(), "prisma/data/vehicles.json"), "utf8"));
const min = JSON.parse(fs.readFileSync(path.join(process.cwd(), "prisma/data/vehicles.min.json"), "utf8"));

console.log("full keys", Object.keys(full));
console.log("full makes", full.makes?.length);

let fullModelCount = 0;
const kinds = new Set<string>();
for (const make of full.makes ?? []) {
  for (const model of make.models ?? []) {
    fullModelCount++;
    kinds.add(model.kind ?? model.k);
  }
}
console.log("full nested models", fullModelCount, "kinds", [...kinds]);
console.log("min models", min.models?.length);

// sample make
const bmw = full.makes?.find((m: { slug?: string; name?: string }) => m.slug === "bmw" || m.name === "BMW");
console.log("bmw models in full", bmw?.models?.length);
