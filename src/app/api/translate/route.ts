import { NextRequest, NextResponse } from "next/server";
import { translateText, type Lang } from "@/lib/translate";

export async function POST(request: NextRequest) {
  const { text, to, from } = await request.json();
  if (!text || !to) {
    return NextResponse.json({ error: "text и to обязательны" }, { status: 400 });
  }
  const translated = await translateText(text, to as Lang, from as Lang | undefined);
  return NextResponse.json({ translated, to });
}
