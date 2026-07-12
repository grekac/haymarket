import fs from "fs";
import path from "path";

const URL = "https://cdn.jsdelivr.net/gh/vehiclesdb/vehiclesdb@latest/dist/vehicles.min.json";
const OUT = path.join(process.cwd(), "prisma/data/vehicles.min.json");

async function main() {
  console.log("Downloading VehiclesDB catalog...");
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(OUT, text);
  const data = JSON.parse(text);
  console.log(`✓ Saved ${OUT} (${(text.length / 1024).toFixed(0)} KB)`);
  console.log(`  Version: ${data.v}, Makes: ${data.makes?.length}, Models: ${data.models?.length}`);
}

main().catch(console.error);
