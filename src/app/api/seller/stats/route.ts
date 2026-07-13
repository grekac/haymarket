import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSellerStats } from "@/lib/analytics";
import { PROMOTION_PACKAGES } from "@/lib/promotion";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const stats = await getSellerStats(session.id);
  return NextResponse.json({ ...stats, packages: PROMOTION_PACKAGES });
}
