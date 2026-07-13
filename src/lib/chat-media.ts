import type { MessageType } from "@prisma/client";

export const CHAT_MEDIA_LIMITS = {
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  voice: 5 * 1024 * 1024,
} as const;

const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_MIMES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"]);
const VOICE_MIMES = new Set(["audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav"]);

export type ChatMediaKind = "image" | "video" | "voice";

export function validateChatMedia(file: { type: string; size: number }, kind: ChatMediaKind) {
  const mime = file.type || "";
  const limit = CHAT_MEDIA_LIMITS[kind];

  if (file.size > limit) {
    const mb = Math.round(limit / (1024 * 1024));
    throw new Error(`Файл слишком большой (макс. ${mb} МБ)`);
  }

  if (kind === "image" && !IMAGE_MIMES.has(mime)) {
    throw new Error("Поддерживаются JPG, PNG, WebP, GIF");
  }
  if (kind === "video" && !VIDEO_MIMES.has(mime)) {
    throw new Error("Поддерживаются MP4, WebM, MOV");
  }
  if (kind === "voice" && !VOICE_MIMES.has(mime)) {
    throw new Error("Поддерживаются WebM, MP3, OGG");
  }
}

export function messageTypeFromKind(kind: ChatMediaKind): MessageType {
  if (kind === "image") return "IMAGE";
  if (kind === "video") return "VIDEO";
  return "VOICE";
}

export function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function messagePreview(
  msg: { type?: MessageType | string; content?: string },
  prefix = ""
): string {
  const p = prefix;
  switch (msg.type) {
    case "IMAGE":
      return `${p}📷 Фото${msg.content?.trim() ? `: ${msg.content.trim()}` : ""}`;
    case "VIDEO":
      return `${p}🎥 Видео${msg.content?.trim() ? `: ${msg.content.trim()}` : ""}`;
    case "VOICE":
      return `${p}🎤 Голосовое сообщение`;
    default:
      return `${p}${msg.content?.trim() || "Сообщение"}`;
  }
}

export function notificationBody(
  senderName: string,
  msg: { type?: MessageType | string; content?: string }
): string {
  switch (msg.type) {
    case "IMAGE":
      return `${senderName}: 📷 Фото`;
    case "VIDEO":
      return `${senderName}: 🎥 Видео`;
    case "VOICE":
      return `${senderName}: 🎤 Голосовое`;
    default:
      return `${senderName}: ${(msg.content ?? "").trim().slice(0, 80)}`;
  }
}
