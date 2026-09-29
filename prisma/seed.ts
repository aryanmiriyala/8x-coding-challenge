import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const category = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      slug: 'electronics',
      name: 'Electronics',
      description: 'Gadgets and electronic devices',
    },
  });

  console.log({ category });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
