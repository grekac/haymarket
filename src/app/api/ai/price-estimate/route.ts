import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { estimateCarPrice } from "@/lib/ai-price-estimate";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 });

  const body = await request.json();

  if (!body.brand?.trim() || !body.model?.trim() || !body.year) {
    return NextResponse.json({ error: "Марка, модель и год обязательны" }, { status: 400 });
  }

  try {
    const result = await estimateCarPrice({
      brand: String(body.brand).trim(),
      model: String(body.model).trim(),
      generation: body.generation || null,
      year: Number(body.year),
      mileage: body.mileage != null ? Number(body.mileage) : undefined,
      transmission: body.transmission || undefined,
      engineType: body.engineType || undefined,
      engineVolume: body.engineVolume != null ? Number(body.engineVolume) : null,
      power: body.power != null ? Number(body.power) : null,
      driveType: body.driveType || null,
      bodyType: body.bodyType || null,
      condition: body.condition || "used",
      city: body.city || "Ереван",
      listedPrice: body.listedPrice != null ? Number(body.listedPrice) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка оценки";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
