import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCarCatalog } from "./seed-cars";
import { cityCoords } from "../src/lib/geo";

const prisma = new PrismaClient();
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

async function main() {
  console.log("🌱 Seeding HayMarket...");
  const hash = await bcrypt.hash(PASSWORD, 10);

  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.carDetails.deleteMany();
  await prisma.realEstateDetails.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  await seedCarCatalog(prisma);

  const admin = await prisma.user.create({
    data: { name: "Админ", phone: "+374 91 000000", email: "admin@haymarket.am", passwordHash: hash, role: "ADMIN" },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Арам Петросян", phone: "+374 91 123456", email: "aram@test.com",
        passwordHash: hash, isVerified: true, verifiedAt: new Date(), ratingAvg: 4.8, ratingCount: 12,
      },
    }),
    prisma.user.create({ data: { name: "Анна Саркисян", phone: "+374 99 234567", passwordHash: hash } }),
    prisma.user.create({ data: { name: "Гарик Мкртчян", phone: "+374 77 345678", passwordHash: hash } }),
  ]);

  const cats = await Promise.all(categories.map((c) => prisma.category.create({ data: c })));
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const transportChildren = [
    { name: "Новые из салона", slug: "new-cars", icon: "Sparkles", sortOrder: 2, showOnHome: false, parentId: catMap.cars, imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=90" },
    { name: "Аренда авто", slug: "car-rental", icon: "KeyRound", sortOrder: 3, showOnHome: false, parentId: catMap.cars, imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=90" },
    { name: "Запчасти и аксессуары", slug: "car-parts", icon: "Cog", sortOrder: 4, showOnHome: false, parentId: catMap.cars, imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=90" },
    { name: "Грузовики и спецтехника", slug: "trucks", icon: "Truck", sortOrder: 5, showOnHome: false, parentId: catMap.cars, imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=90" },
    { name: "Аренда техники", slug: "machinery-rental", icon: "Hammer", sortOrder: 6, showOnHome: false, parentId: catMap.cars, imageUrl: "https://images.unsplash.com/photo-1581094271901-55bfc9cbf11d?w=800&q=90" },
    { name: "Мотоциклы и мототехника", slug: "motorcycles", icon: "Bike", sortOrder: 7, showOnHome: false, parentId: catMap.cars, imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=90" },
    { name: "Водный транспорт", slug: "water-transport", icon: "Ship", sortOrder: 8, showOnHome: false, parentId: catMap.cars, imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22cf2d96b?w=800&q=90" },
    { name: "Автобусы", slug: "buses", icon: "Bus", sortOrder: 9, showOnHome: false, parentId: catMap.cars, imageUrl: "https://images.unsplash.com/photo-1544628181-4243ffdf4b87?w=800&q=90" },
  ];
  await Promise.all(transportChildren.map((c) => prisma.category.create({ data: c })));
  Object.assign(catMap, Object.fromEntries((await prisma.category.findMany({ where: { parentId: catMap.cars } })).map((c) => [c.slug, c.id])));

  const yerevan = cityCoords("Ереван");
  const gyumri = cityCoords("Гюмри");

  // Car listing (promoted)
  await prisma.listing.create({
    data: {
      title: "Toyota Camry 2019, полный привод",
      description: "Один владелец, полная сервисная история. Кожаный салон, камера, подогрев.",
      price: 12500000, city: "Ереван", district: "Арабкир", userId: users[0].id,
      categoryId: catMap["cars"], views: 234,
      latitude: yerevan.lat, longitude: yerevan.lng,
      isPromoted: true, promotedUntil: new Date(Date.now() + 7 * 86400000),
      aiPriceHint: 12000000,
      images: { create: [{ url: "https://images.unsplash.com/photo-1621007947382-bcb3e97e3bdb?w=800&q=90", sortOrder: 0 }, { url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=90", sortOrder: 1 }] },
      carDetails: { create: { brand: "Toyota", model: "Camry", generation: "XV70", year: 2019, mileage: 45000, transmission: "Автомат", engineType: "Бензин", engineVolume: 2.5, power: 203, driveType: "Полный", bodyType: "Седан", color: "Белый", ownersCount: 1, customsCleared: true, bargainingPossible: true } },
    },
  });

  // Real estate
  await prisma.listing.create({
    data: {
      title: "2-комнатная квартира в центре Еревана",
      description: "65 м², свежий ремонт, мебель, техника. Рядом метро и парк.",
      price: 85000000, city: "Ереван", district: "Кентрон", address: "ул. Абовяна, 12", userId: users[1].id,
      categoryId: catMap["real-estate"], views: 512,
      latitude: yerevan.lat + 0.01, longitude: yerevan.lng + 0.01,
      images: { create: [{ url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=90", sortOrder: 0 }] },
      realEstate: { create: { propertyType: "APARTMENT", area: 65, rooms: 2, floor: 5, totalFloors: 9, renovationType: "Евроремонт", heating: "Центральное", furniture: true, parking: false } },
    },
  });

  // Electronics
  await prisma.listing.create({
    data: {
      title: "iPhone 15 Pro Max 256GB",
      description: "Идеальное состояние, 3 месяца использования. Полный комплект.",
      price: 580000, city: "Гюмри", userId: users[2].id,
      categoryId: catMap["electronics"], views: 189,
      latitude: gyumri.lat, longitude: gyumri.lng,
      images: { create: [{ url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=90", sortOrder: 0 }] },
    },
  });

  // Hyundai
  await prisma.listing.create({
    data: {
      title: "Hyundai Elantra 2021",
      description: "Седан в идеальном состоянии. Автомат, один владелец.",
      price: 7800000, city: "Раздан", userId: users[0].id,
      categoryId: catMap["cars"], views: 98,
      latitude: cityCoords("Раздан").lat, longitude: cityCoords("Раздан").lng,
      images: { create: [{ url: "https://images.unsplash.com/photo-1619767886554-ef1f579abdae?w=800&q=90", sortOrder: 0 }] },
      carDetails: { create: { brand: "Hyundai", model: "Elantra", year: 2021, mileage: 32000, transmission: "Автомат", engineType: "Бензин", engineVolume: 2.0, driveType: "Передний", bodyType: "Седан", color: "Серый", ownersCount: 1 } },
    },
  });

  // Job
  await prisma.listing.create({
    data: {
      title: "Менеджер по продажам — IT компания",
      description: "Опыт от 1 года. Зарплата от 400 000 драм + бонусы.",
      price: 400000, city: "Ереван", userId: admin.id,
      categoryId: catMap["jobs"], views: 67,
      latitude: yerevan.lat - 0.02, longitude: yerevan.lng - 0.01,
      images: { create: [{ url: "https://images.unsplash.com/photo-1521737711862-e3b97375f902?w=800&q=90", sortOrder: 0 }] },
    },
  });

  console.log("✅ Admin: +374 91 000000 / " + PASSWORD);
  console.log("✅ User:  +374 91 123456 / " + PASSWORD);
  console.log(`✅ ${categories.length} categories, 5 listings`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
