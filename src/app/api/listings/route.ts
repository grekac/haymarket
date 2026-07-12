import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { cityCoords } from "@/lib/geo";
import { notifySavedSearchesForListing } from "@/lib/notifications";
import { listingService } from "@/modules/listings/listing.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });

    const body = await request.json();
    const {
      title, description, price, categoryId, city, district, address,
      condition, images, carDetails, realEstate, attributes, videoUrl, aiPriceHint,
      latitude, longitude,
    } = body;

    if (!title || !description || !categoryId || !city) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    const coords = cityCoords(city);
    const listing = await prisma.listing.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        price: Number(price) || 0,
        categoryId,
        city,
        district: district || null,
        address: address || null,
        condition: condition || "used",
        videoUrl: videoUrl || null,
        aiPriceHint: aiPriceHint ? Number(aiPriceHint) : null,
        latitude: latitude ?? coords.lat,
        longitude: longitude ?? coords.lng,
        userId: session.id,
        status: "ACTIVE",
        images: images?.length
          ? { create: images.map((url: string, i: number) => ({ url, sortOrder: i })) }
          : undefined,
        carDetails: carDetails ? { create: carDetails } : undefined,
        realEstate: realEstate ? { create: realEstate } : undefined,
        attributes: attributes ? JSON.stringify(attributes) : null,
      },
      include: {
        category: true,
        images: true,
        carDetails: true,
        realEstate: true,
      },
    });

    notifySavedSearchesForListing(listing.id).catch(console.error);
    return NextResponse.json(listing, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка создания" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const result = await listingService.search({
    search: sp.get("q") ?? undefined,
    category: sp.get("category") ?? undefined,
    city: sp.get("city") ?? undefined,
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    sort: (sp.get("sort") as "newest") ?? "newest",
    page: sp.get("page") ? Number(sp.get("page")) : 1,
    limit: sp.get("limit") ? Number(sp.get("limit")) : 20,
    brand: sp.get("brand") ?? undefined,
    model: sp.get("model") ?? undefined,
    generation: sp.get("generation") ?? undefined,
    yearFrom: sp.get("yearFrom") ? Number(sp.get("yearFrom")) : undefined,
    propertyType: sp.get("propertyType") ?? undefined,
    dealType: sp.get("dealType") ?? undefined,
    rooms: sp.get("rooms") ? Number(sp.get("rooms")) : undefined,
  });
  return NextResponse.json(result);
}
