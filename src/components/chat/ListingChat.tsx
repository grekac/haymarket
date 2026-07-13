"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { io, type Socket } from "socket.io-client";
import { ChevronLeft, ImageIcon, Languages, Mic, Send, Square, Video } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { LANG_LABELS, type Lang } from "@/lib/translate";
import { scanMessageForScam } from "@/lib/safety";
import { getSocketUrl } from "@/lib/socket-url";
import { type ChatMediaKind } from "@/lib/chat-media";
import { ChatMessage, MessageBubble } from "@/components/chat/MessageBubble";

type Conversation = {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    status: string;
    images: { url: string }[];
    category: { name: string };
  };
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
};

const TARGET_LANGS: Lang[] = ["ru", "hy", "en"];

const QUICK_REPLIES = [
  "Здравствуйте! Товар ещё актуален?",
  "Какая последняя цена?",
  "Можно посмотреть сегодня?",
  "Есть торг?",
  "Где можно забрать?",
];

export function ListingChat({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [translateTo, setTranslateTo] = useState<Lang>("ru");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [warning, setWarning] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const seenIds = useRef(new Set<string>());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const recordStartedRef = useRef<number>(0);

  const addMessage = useCallback((msg: ChatMessage) => {
    if (seenIds.current.has(msg.id)) return;
    seenIds.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  }, []);

  const autoTranslate = useCallback(
    async (msg: ChatMessage) => {
      if (msg.sender.id === userId || msg.type !== "TEXT" || !msg.content?.trim()) return;
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.content, to: translateTo }),
      });
      const data = await res.json();
      if (data.translated && data.translated !== msg.content) {
        setTranslations((prev) => ({ ...prev, [msg.id]: data.translated }));
      }
    },
    [userId, translateTo]
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUserId(d.user?.id ?? ""));

    fetch(`/api/conversations/${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.id) setConversation(data);
      });

    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((list: ChatMessage[]) => {
        list.forEach((m) => seenIds.current.add(m.id));
        setMessages(list);
      });
  }, [conversationId]);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      fetch("/api/auth/socket-token")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.token) socket.emit("join", { conversationId, token: data.token });
        })
        .catch(() => {});
    });

    socket.on("message", (msg: ChatMessage) => {
      addMessage(msg);
      autoTranslate(msg);
    });
    socket.on("typing", () => setTyping(true));
    socket.on("stop_typing", () => setTyping(false));

    return () => {
      socket.emit("leave", conversationId);
      socket.disconnect();
    };
  }, [conversationId, addMessage, autoTranslate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, translations]);

  useEffect(() => {
    messages.forEach((m) => {
      if (m.sender.id !== userId && !translations[m.id]) autoTranslate(m);
    });
  }, [translateTo, messages, userId, translations, autoTranslate]);

  useEffect(() => {
    return () => {
      voiceStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  async function postMessage(body: Record<string, unknown>) {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Не удалось отправить");
    }
    const msg = await res.json();
    addMessage(msg);
    return msg;
  }

  async function send(content?: string) {
    const body = (content ?? text).trim();
    if (!body || sending) return;

    const scam = scanMessageForScam(body);
    if (scam) setWarning(scam);

    setSending(true);
    try {
      await postMessage({ type: "TEXT", content: body });
      setText("");
      socketRef.current?.emit("stop_typing", { conversationId, userId });
      inputRef.current?.focus();
    } catch (err) {
      setWarning(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  }

  async function sendMedia(file: File, kind: ChatMediaKind, caption = "") {
    if (sending || uploading) return;

    setUploading(true);
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "chat");
      fd.append("kind", kind);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Ошибка загрузки");

      let duration = uploadData.duration as number | undefined;
      if (kind === "voice" && !duration && recordStartedRef.current) {
        duration = Math.max(1, Math.round((Date.now() - recordStartedRef.current) / 1000));
      }

      await postMessage({
        type: uploadData.type ?? kind.toUpperCase(),
        content: caption,
        mediaUrl: uploadData.url,
        mediaPublicId: uploadData.publicId,
        mimeType: file.type,
        duration: duration ?? null,
      });
    } catch (err) {
      setWarning(err instanceof Error ? err.message : "Ошибка отправки файла");
    } finally {
      setUploading(false);
      setSending(false);
    }
  }

  async function onFileSelected(files: FileList | null, kind: ChatMediaKind) {
    const file = files?.[0];
    if (!file) return;
    const caption = text.trim();
    if (caption) setText("");
    await sendMedia(file, kind, caption);
  }

  async function startRecording() {
    if (recording || sending) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceStreamRef.current = stream;
      voiceChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) voiceChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(voiceChunksRef.current, { type: mr.mimeType || "audio/webm" });
        const ext = mr.mimeType.includes("mp4") ? "m4a" : "webm";
        const file = new File([blob], `voice.${ext}`, { type: mr.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        voiceStreamRef.current = null;
        await sendMedia(file, "voice");
      };
      mediaRecorderRef.current = mr;
      recordStartedRef.current = Date.now();
      mr.start();
      setRecording(true);
    } catch {
      setWarning("Нет доступа к микрофону");
    }
  }

  function stopRecording() {
    if (!recording) return;
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function onInputChange(value: string) {
    setText(value);
    socketRef.current?.emit("typing", { conversationId, userId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { conversationId, userId });
    }, 1500);
  }

  const other =
    conversation && userId
      ? conversation.buyer.id === userId
        ? conversation.seller
        : conversation.buyer
      : null;

  const listingImage = conversation?.listing.images[0]?.url;
  const busy = sending || uploading;

  return (
    <div className="flex flex-col h-full md:h-[calc(100vh-8rem)] md:max-w-2xl md:mx-auto bg-[var(--bg-primary)]">
      <div className="glass border-b border-[var(--border)]/60 shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/messages" className="p-1 -ml-1 text-[var(--brand)] shrink-0">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1 min-w-0 text-center">
            <p className="font-semibold text-[15px] truncate">{other?.name ?? "Чат"}</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {uploading ? "загрузка…" : typing ? "печатает…" : "переписка о товаре"}
            </p>
          </div>
          <div className="w-6 shrink-0" />
        </div>

        {conversation && (
          <Link
            href={`/listing/${conversation.listing.id}`}
            className="flex items-center gap-3 px-4 py-3 border-t border-[var(--border)]/50 bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-hover)] transition-colors"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-secondary)] shrink-0">
              {listingImage ? (
                <Image src={listingImage} alt="" fill className="object-cover" sizes="56px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-muted)] p-1 text-center">
                  {conversation.listing.category.name}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold line-clamp-2 leading-snug">
                {conversation.listing.title}
              </p>
              <p className="text-sm font-bold text-[var(--accent)] mt-0.5">
                {formatPrice(conversation.listing.price, conversation.listing.currency)}
              </p>
            </div>
          </Link>
        )}
      </div>

      <div className="flex justify-center gap-1.5 py-2 px-4 shrink-0 border-b border-[var(--border)]/30">
        <Languages className="w-3.5 h-3.5 text-[var(--text-muted)] self-center mr-1" />
        {TARGET_LANGS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setTranslateTo(l)}
            className={`text-[11px] font-medium px-3 py-1 rounded-full transition-all ${
              translateTo === l
                ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      {warning && (
        <div className="mx-4 mt-2 p-3 rounded-2xl bg-[var(--danger-soft)] border border-[var(--danger)]/20 text-[12px] text-[var(--danger)] shrink-0">
          {warning}
          <button type="button" className="ml-2 underline" onClick={() => setWarning(null)}>
            Закрыть
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-sm text-[var(--text-muted)]">Напишите продавцу по поводу товара</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Можно отправить текст, фото, видео или голосовое
            </p>
          </div>
        )}

        {messages.map((m) => {
          const mine = m.sender.id === userId;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <MessageBubble message={m} mine={mine} translation={translations[m.id]} />
              <p className="text-[10px] text-[var(--text-muted)] mt-1 px-1">
                {formatDate(m.createdAt)}
              </p>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {messages.length < 3 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={busy}
              className="shrink-0 text-xs px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="glass border-t border-[var(--border)]/60 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-end gap-1.5 shrink-0"
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files, "image")}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files, "video")}
        />

        <button
          type="button"
          disabled={busy || recording}
          onClick={() => imageInputRef.current?.click()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 shrink-0"
          aria-label="Фото"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={busy || recording}
          onClick={() => videoInputRef.current?.click()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 shrink-0"
          aria-label="Видео"
        >
          <Video className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={recording ? stopRecording : startRecording}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            recording
              ? "bg-red-500 text-white animate-pulse"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
          }`}
          aria-label={recording ? "Остановить запись" : "Голосовое"}
        >
          {recording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
        </button>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={recording ? "Идёт запись…" : "Сообщение или подпись к файлу…"}
          rows={1}
          disabled={recording}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[15px] outline-none focus:border-[var(--brand)]/40 resize-none max-h-24 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!text.trim() || busy || recording}
          className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
