import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

