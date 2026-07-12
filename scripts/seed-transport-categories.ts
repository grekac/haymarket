import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TRANSPORT_CHILDREN = [
  { name: "Новые из салона", slug: "new-cars", icon: "Sparkles", sortOrder: 2, imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=90" },
  { name: "Аренда авто", slug: "car-rental", icon: "KeyRound", sortOrder: 3, imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=90" },
  { name: "Запчасти и аксессуары", slug: "car-parts", icon: "Cog", sortOrder: 4, imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=90" },
  { name: "Грузовики и спецтехника", slug: "trucks", icon: "Truck", sortOrder: 5, imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=90" },
  { name: "Аренда техники", slug: "machinery-rental", icon: "Hammer", sortOrder: 6, imageUrl: "https://images.unsplash.com/photo-1581094271901-55bfc9cbf11d?w=800&q=90" },
  { name: "Мотоциклы и мототехника", slug: "motorcycles", icon: "Bike", sortOrder: 7, imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=90" },
  { name: "Водный транспорт", slug: "water-transport", icon: "Ship", sortOrder: 8, imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22cf2d96b?w=800&q=90" },
  { name: "Автобусы", slug: "buses", icon: "Bus", sortOrder: 9, imageUrl: "https://images.unsplash.com/photo-1544628181-4243ffdf4b87?w=800&q=90" },
];

async function main() {
  const cars = await prisma.category.findUnique({ where: { slug: "cars" } });
  if (!cars) {
    console.error("Категория cars не найдена. Сначала запустите seed.");
    process.exit(1);
  }

  for (const child of TRANSPORT_CHILDREN) {
    await prisma.category.upsert({
      where: { slug: child.slug },
      create: {
        ...child,
        showOnHome: false,
        parentId: cars.id,
        isActive: true,
      },
      update: {
        name: child.name,
        icon: child.icon,
        sortOrder: child.sortOrder,
        imageUrl: child.imageUrl,
        showOnHome: false,
        parentId: cars.id,
        isActive: true,
      },
    });
    console.log(`✓ ${child.slug}`);
  }

  console.log("Готово: подкатегории транспорта добавлены");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
