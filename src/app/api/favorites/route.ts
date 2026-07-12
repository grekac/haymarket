import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { favoriteService } from "@/modules/favorites/favorite.service";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const { listingId } = await request.json();
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const result = await favoriteService.toggle(session.id, listingId);
  return NextResponse.json(result);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const items = await favoriteService.getUserFavorites(session.id);
  return NextResponse.json(items);
}
