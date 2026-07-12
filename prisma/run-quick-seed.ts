import { PrismaClient } from "@prisma/client";
import { runQuickSeed } from "../src/lib/quick-seed";

const prisma = new PrismaClient();

async function main() {
  const result = await runQuickSeed(prisma);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
