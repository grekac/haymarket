import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cityCoords } from "@/lib/geo";

const PASSWORD = "123456";

const categories = [
  { name: "Автомобили", slug: "cars", icon: "Car", sortOrder: 1, imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=90" },
  { name: "Недвижимость", slug: "real-estate", icon: "Building2", sortOrder: 2, imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=90" },
  { name: "Электроника", slug: "electronics", icon: "Smartphone", sortOrder: 3, imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=90" },
  { name: "Работа", slug: "jobs", icon: "Briefcase", sortOrder: 4, imageUrl: "https://images.unsplash.com/photo-1521737711862-e3b97375f902?w=800&q=90" },
  { name: "Услуги", slug: "services", icon: "Wrench", sortOrder: 5, imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=90" },
  { name: "Дом и мебель", slug: "home-furniture", icon: "Sofa", sortOrder: 6, imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=90" },
  { name: "Одежда", slug: "clothing", icon: "Shirt", sortOrder: 7, imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=90" },
  { name: "Дети", slug: "kids", icon: "Baby", sortOrder: 8, imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=90" },
  { name: "Животные", slug: "animals", icon: "PawPrint", sortOrder: 9, imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=90" },
  { name: "Другое", slug: "other", icon: "LayoutGrid", sortOrder: 10, imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=90" },
];

const transportChildren = [
  { name: "Новые из салона", slug: "new-cars", icon: "Sparkles", sortOrder: 2 },
  { name: "Аренда авто", slug: "car-rental", icon: "KeyRound", sortOrder: 3 },
  { name: "Запчасти и аксессуары", slug: "car-parts", icon: "Cog", sortOrder: 4 },
  { name: "Грузовики и спецтехника", slug: "trucks", icon: "Truck", sortOrder: 5 },
  { name: "Аренда техники", slug: "machinery-rental", icon: "Hammer", sortOrder: 6 },
  { name: "Мотоциклы и мототехника", slug: "motorcycles", icon: "Bike", sortOrder: 7 },
  { name: "Водный транспорт", slug: "water-transport", icon: "Ship", sortOrder: 8 },
  { name: "Автобусы", slug: "buses", icon: "Bus", sortOrder: 9 },
];

/** Быстрый старт без каталога авто — для Render Free без Shell */
export async function runQuickSeed(prisma: PrismaClient) {
  const existing = await prisma.category.count();
  if (existing > 0) {
    return { skipped: true, message: "Данные уже есть" };
  }

  const hash = await bcrypt.hash(PASSWORD, 10);
  const cats = await Promise.all(categories.map((c) => prisma.category.create({ data: c })));
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  await Promise.all(
    transportChildren.map((c) =>
      prisma.category.create({
        data: { ...c, showOnHome: false, parentId: catMap.cars, isActive: true },
      })
    )
  );

  const admin = await prisma.user.create({
    data: { name: "Админ", phone: "+374 91 000000", email: "admin@haymarket.am", passwordHash: hash, role: "ADMIN" },
  });

  const user = await prisma.user.create({
    data: {
      name: "Арам Петросян",
      phone: "+374 91 123456",
      email: "aram@test.com",
      passwordHash: hash,
      isVerified: true,
      verifiedAt: new Date(),
      ratingAvg: 4.8,
      ratingCount: 12,
    },
  });

  const yerevan = cityCoords("Ереван");

  await prisma.listing.create({
    data: {
      title: "Toyota Camry 2019, полный привод",
      description: "Один владелец, полная сервисная история.",
      price: 12500000,
      city: "Ереван",
      district: "Арабкир",
      userId: user.id,
      categoryId: catMap.cars,
      views: 234,
      latitude: yerevan.lat,
      longitude: yerevan.lng,
      isPromoted: true,
      promotedUntil: new Date(Date.now() + 7 * 86400000),
      images: {
        create: [{ url: "https://images.unsplash.com/photo-1621007947382-bcb3e97e3bdb?w=800&q=90", sortOrder: 0 }],
      },
      carDetails: {
        create: {
          brand: "Toyota",
          model: "Camry",
          generation: "XV70",
          year: 2019,
          mileage: 45000,
          transmission: "Автомат",
          engineType: "Бензин",
          engineVolume: 2.5,
          driveType: "Полный",
          bodyType: "Седан",
          color: "Белый",
          ownersCount: 1,
        },
      },
    },
  });

  await prisma.listing.create({
    data: {
      title: "2-комнатная квартира в центре Еревана",
      description: "65 м², свежий ремонт, мебель, техника.",
      price: 85000000,
      city: "Ереван",
      district: "Кентрон",
      userId: user.id,
      categoryId: catMap["real-estate"],
      views: 512,
      latitude: yerevan.lat + 0.01,
      longitude: yerevan.lng + 0.01,
      images: {
        create: [{ url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=90", sortOrder: 0 }],
      },
      realEstate: {
        create: { propertyType: "APARTMENT", area: 65, rooms: 2, floor: 5, totalFloors: 9 },
      },
    },
  });

  return {
    skipped: false,
    admin: admin.phone,
    user: user.phone,
    password: PASSWORD,
    categories: cats.length,
    listings: 2,
  };
}
