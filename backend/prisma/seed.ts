import { PrismaClient } from "@prisma/client";
import data from "./comments.json";

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();

  const rows = data.comments.map(({ id: _id, ...rest }) => rest);
  await prisma.comment.createMany({ data: rows });

  console.log(`Seeded ${rows.length} comments.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
