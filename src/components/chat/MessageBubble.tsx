"use client";

import Image from "next/image";
import { formatDuration } from "@/lib/chat-media";

export type ChatMessage = {
  id: string;
  type?: string;
  content: string;
  mediaUrl?: string | null;
  mimeType?: string | null;
  duration?: number | null;
  thumbnailUrl?: string | null;
  createdAt: string;
  lang?: string | null;
  sender: { id: string; name: string };
};

export function MessageBubble({
  message,
  mine,
  translation,
}: {
  message: ChatMessage;
  mine: boolean;
  translation?: string;
}) {
  const bubbleClass = mine
    ? "bg-[var(--accent)] text-[var(--accent-fg)] rounded-[20px] rounded-br-[6px]"
    : "bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-[20px] rounded-bl-[6px] border border-[var(--border)]/50";

  const type = message.type ?? "TEXT";

  return (
    <div className={`max-w-[82%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
      {!mine && (
        <p className="text-[10px] text-[var(--text-muted)] mb-1 px-1">{message.sender.name}</p>
      )}
      <div className={`px-3 py-2.5 text-[15px] leading-relaxed overflow-hidden ${bubbleClass}`}>
        {type === "IMAGE" && message.mediaUrl && (
          <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="block">
            <div className="relative w-56 max-w-full aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src={message.mediaUrl}
                alt={message.content || "Фото"}
                fill
                className="object-cover"
                sizes="224px"
                unoptimized={message.mediaUrl.startsWith("data:")}
              />
            </div>
          </a>
        )}

        {type === "VIDEO" && message.mediaUrl && (
          <video
            src={message.mediaUrl}
            controls
            playsInline
            preload="metadata"
            poster={message.thumbnailUrl ?? undefined}
            className="w-56 max-w-full rounded-xl bg-black"
          />
        )}

        {type === "VOICE" && message.mediaUrl && (
          <div className="flex items-center gap-2 min-w-[200px]">
            <audio src={message.mediaUrl} controls preload="metadata" className="w-full max-w-[220px] h-9" />
            {message.duration ? (
              <span className="text-[11px] opacity-70 shrink-0">{formatDuration(message.duration)}</span>
            ) : null}
          </div>
        )}

        {type === "TEXT" && (
          <p className="whitespace-pre-wrap break-words px-1">{message.content}</p>
        )}

        {type !== "TEXT" && message.content?.trim() && (
          <p className="whitespace-pre-wrap break-words mt-2 text-[13px] opacity-90 px-1">
            {message.content}
          </p>
        )}

        {translation && !mine && type === "TEXT" && (
          <p className="text-[12px] opacity-70 mt-1.5 pt-1.5 border-t border-[var(--border)]/40 italic px-1">
            {translation}
          </p>
        )}
      </div>
    </div>
  );
}
