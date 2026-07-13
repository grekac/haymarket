import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ favorites: 0, messages: 0 });
  }

  const [favorites, messages] = await Promise.all([
    prisma.favorite.count({ where: { userId: session.id } }),
    prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: session.id },
        conversation: {
          OR: [{ buyerId: session.id }, { sellerId: session.id }],
        },
      },
    }),
  ]);

  return NextResponse.json({ favorites, messages });
}
