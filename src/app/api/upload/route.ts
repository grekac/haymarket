import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  type ChatMediaKind,
  messageTypeFromKind,
  validateChatMedia,
} from "@/lib/chat-media";
import { isCloudinaryConfigured, uploadImage, uploadMedia } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const purpose = (formData.get("purpose") as string) || "listing";
    const kind = ((formData.get("kind") as string) || "image") as ChatMediaKind;

    if (!file) return NextResponse.json({ error: "Файл не найден" }, { status: 400 });

    if (purpose === "chat") {
      validateChatMedia({ type: file.type, size: file.size }, kind);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";

    if (!isCloudinaryConfigured()) {
      const base64 = buffer.toString("base64");
      return NextResponse.json({
        url: `data:${mime};base64,${base64}`,
        publicId: null,
        type: purpose === "chat" ? messageTypeFromKind(kind) : "IMAGE",
        warning: "Cloudinary не настроен — используется локальный preview",
      });
    }

    if (purpose === "chat") {
      if (kind === "image") {
        const result = await uploadImage(buffer, "haymarket/chat");
        return NextResponse.json({ ...result, type: "IMAGE" });
      }

      const resourceType = kind === "voice" ? "video" : "video";
      const result = await uploadMedia(buffer, {
        folder: "haymarket/chat",
        resourceType,
        mimeType: mime,
      });
      return NextResponse.json({
        ...result,
        type: messageTypeFromKind(kind),
      });
    }

    const result = await uploadImage(buffer);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
