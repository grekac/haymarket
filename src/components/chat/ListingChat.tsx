"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { io, type Socket } from "socket.io-client";
import { ChevronLeft, Languages, Send } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { LANG_LABELS, type Lang } from "@/lib/translate";
import { scanMessageForScam } from "@/lib/safety";
import { getSocketUrl } from "@/lib/socket-url";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  lang?: string | null;
  sender: { id: string; name: string };
};

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [translateTo, setTranslateTo] = useState<Lang>("ru");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [warning, setWarning] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const seenIds = useRef(new Set<string>());

  const addMessage = useCallback((msg: Message) => {
    if (seenIds.current.has(msg.id)) return;
    seenIds.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  }, []);

  const autoTranslate = useCallback(
    async (msg: Message) => {
      if (msg.sender.id === userId) return;
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
      .then((list: Message[]) => {
        list.forEach((m) => seenIds.current.add(m.id));
        setMessages(list);
      });
  }, [conversationId]);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("join", conversationId));
    socket.on("message", (msg: Message) => {
      addMessage(msg);
      autoTranslate(msg);
    });
    socket.on("typing", () => setTyping(true));
    socket.on("stop_typing", () => setTyping(false));

    const poll = setInterval(() => {
      fetch(`/api/conversations/${conversationId}/messages`)
        .then((r) => r.json())
        .then((list: Message[]) => {
          list.forEach((m) => {
            if (!seenIds.current.has(m.id)) {
              addMessage(m);
              autoTranslate(m);
            }
          });
        })
        .catch(() => {});
    }, 8000);

    return () => {
      clearInterval(poll);
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

  async function send(content?: string) {
    const body = (content ?? text).trim();
    if (!body || sending) return;

    const scam = scanMessageForScam(body);
    if (scam) setWarning(scam);

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: body }),
      });
      if (!res.ok) return;
      const msg = await res.json();
      addMessage(msg);
      setText("");
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  }

  function onInputChange(value: string) {
    setText(value);
    socketRef.current?.emit("typing", { conversationId, userId });
  }

  const other =
    conversation && userId
      ? conversation.buyer.id === userId
        ? conversation.seller
        : conversation.buyer
      : null;

  const listingImage = conversation?.listing.images[0]?.url;

  return (
    <div className="flex flex-col h-full md:h-[calc(100vh-8rem)] md:max-w-2xl md:mx-auto bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="glass border-b border-[var(--border)]/60 shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/messages" className="p-1 -ml-1 text-[var(--brand)] shrink-0">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1 min-w-0 text-center">
            <p className="font-semibold text-[15px] truncate">{other?.name ?? "Чат"}</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {typing ? "печатает…" : "переписка о товаре"}
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

      {/* Language */}
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
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-sm text-[var(--text-muted)]">
              Напишите продавцу по поводу товара
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Не переводите деньги заранее — договоритесь о встрече
            </p>
          </div>
        )}

        {messages.map((m) => {
          const mine = m.sender.id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                {!mine && (
                  <p className="text-[10px] text-[var(--text-muted)] mb-1 px-1">{m.sender.name}</p>
                )}
                <div
                  className={`px-4 py-2.5 text-[15px] leading-relaxed ${
                    mine
                      ? "bg-[var(--accent)] text-[var(--accent-fg)] rounded-[20px] rounded-br-[6px]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-[20px] rounded-bl-[6px] border border-[var(--border)]/50"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  {translations[m.id] && !mine && (
                    <p className="text-[12px] opacity-70 mt-1.5 pt-1.5 border-t border-[var(--border)]/40 italic">
                      {translations[m.id]}
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 px-1">
                  {formatDate(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length < 3 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="shrink-0 text-xs px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="glass border-t border-[var(--border)]/60 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-end gap-2 shrink-0"
      >
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
          placeholder="Сообщение о товаре…"
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[15px] outline-none focus:border-[var(--brand)]/40 resize-none max-h-24 transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
