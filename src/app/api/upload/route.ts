import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Файл не найден" }, { status: 400 });

    if (!isCloudinaryConfigured()) {
      // Fallback: convert to data URL for dev without Cloudinary
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mime = file.type || "image/jpeg";
      return NextResponse.json({
        url: `data:${mime};base64,${base64}`,
        publicId: null,
        warning: "Cloudinary не настроен — используется локальный preview",
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}
