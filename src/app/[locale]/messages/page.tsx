import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { chatService } from "@/modules/chat/chat.service";
import { formatDate, formatPrice } from "@/lib/utils";
import { messagePreview } from "@/lib/chat-media";
import { BackButton } from "@/components/ui/BackButton";

export default async function MessagesPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/messages");

  const conversations = await chatService.getUserConversations(user.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">
      <BackButton href="/" />
      <h1 className="text-2xl font-bold mb-2">Сообщения</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Переписка с продавцами и покупателями по объявлениям
      </p>

      {conversations.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-2xl border border-dashed border-[var(--border)]">
          <p className="text-[var(--text-muted)]">Пока нет диалогов</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Откройте объявление и нажмите «Написать», чтобы задать вопрос о товаре
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const other = c.buyerId === user.id ? c.seller : c.buyer;
            const last = c.messages[0];
            const unread = c._count.messages;
            const imageUrl = c.listing.images[0]?.url;

            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:shadow-md hover:border-[var(--border-hover)] transition-all"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--bg-secondary)] shrink-0">
                  {imageUrl ? (
                    <Image src={imageUrl} alt="" fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-muted)] p-1 text-center">
                      {c.listing.category?.name ?? "Товар"}
                    </div>
                  )}
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-[10px] font-bold flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold truncate text-[15px]">{other.name}</p>
                    {last && (
                      <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                        {formatDate(last.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[var(--accent)] truncate">
                    {formatPrice(c.listing.price, c.listing.currency)}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] truncate">{c.listing.title}</p>
                  {last && (
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        unread > 0 ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {messagePreview(
                        last,
                        last.senderId === user.id ? "Вы: " : ""
                      )}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
