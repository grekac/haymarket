import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "prisma/data/vehicles.min.json");
const raw = JSON.parse(fs.readFileSync(file, "utf8"));

console.log("type", typeof raw, Array.isArray(raw));
console.log("version", raw.v);
console.log("makes", raw.makes?.length);
console.log("models", raw.models?.length);
console.log("make sample", JSON.stringify(raw.makes?.[0], null, 2));
console.log("model sample", JSON.stringify(raw.models?.[0], null, 2));

const carModels = raw.models?.filter((m: string[]) => m[3] === "car");
console.log("car models", carModels?.length);
console.log("car make slugs", new Set(carModels?.map((m: string[]) => m[0])).size);

const carMakes = raw.makes?.filter((m: string[][]) => m[2]?.includes("car"));
console.log("car makes", carMakes?.length);
console.log("bmw models", carModels?.filter((m: string[]) => m[0] === "bmw").slice(0, 10));
