import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId обязателен" }, { status: 400 });

  const items = await prisma.review.findMany({
    where: { targetId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true } },
    },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const { targetId, listingId, rating, comment } = await request.json();
  if (!targetId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  if (targetId === session.id) {
    return NextResponse.json({ error: "Нельзя оценить себя" }, { status: 400 });
  }

  try {
    const review = await prisma.review.create({
      data: {
        authorId: session.id,
        targetId,
        listingId: listingId || null,
        rating: Number(rating),
        comment: comment?.trim() || null,
      },
    });

    const agg = await prisma.review.aggregate({
      where: { targetId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.user.update({
      where: { id: targetId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Вы уже оставляли отзыв" }, { status: 409 });
  }
}
