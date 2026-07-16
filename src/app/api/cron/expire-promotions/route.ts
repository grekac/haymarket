import { NextRequest, NextResponse } from "next/server";
import { expirePromotions } from "@/lib/analytics";

/**
 * Background expiry for promoted listings — do not call on search/read paths.
 * Protect with CRON_SECRET (or SETUP_SECRET fallback).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.SETUP_SECRET;
  const auth = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || auth !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await expirePromotions();
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
