import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listingService } from "@/modules/listings/listing.service";
import { favoriteService } from "@/modules/favorites/favorite.service";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await listingService.getById(id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getSession();
  const isFavorited = session ? await favoriteService.isFavorited(session.id, id) : false;

  return NextResponse.json({ ...listing, isFavorited });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  try {
    const listing = await listingService.update(
      id,
      session.id,
      {
        title: body.title,
        description: body.description,
        price: body.price,
        city: body.city,
        district: body.district,
        condition: body.condition,
      },
      session.role === "ADMIN"
    );
    return NextResponse.json(listing);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });

  const { id } = await params;

  try {
    await listingService.delete(id, session.id, session.role === "ADMIN");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
