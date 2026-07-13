import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/analytics";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const analytics = await getAdminAnalytics();
  return NextResponse.json(analytics);
}
