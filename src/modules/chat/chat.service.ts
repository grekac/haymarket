import { prisma } from "@/lib/prisma";
import { detectLang } from "@/lib/translate";

export class ChatService {
  async getConversation(conversationId: string, userId: string) {
    const conv = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        listing: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            category: { select: { name: true, slug: true } },
          },
        },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
      },
    });
    if (!conv) throw new Error("Доступ запрещён");
    return conv;
  }

  async getOrCreateConversation(listingId: string, buyerId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });
    if (!listing) throw new Error("Объявление не найдено");
    if (listing.userId === buyerId) throw new Error("Нельзя написать себе");

    const existing = await prisma.conversation.findUnique({
      where: { listingId_buyerId: { listingId, buyerId } },
      include: {
        listing: { include: { images: { take: 1 } } },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (existing) return existing;

    return prisma.conversation.create({
      data: { listingId, buyerId, sellerId: listing.userId },
      include: {
        listing: { include: { images: { take: 1 } } },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        messages: true,
      },
    });
  }

  async getUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      orderBy: { updatedAt: "desc" },
      include: {
        listing: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            category: { select: { name: true } },
          },
        },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: {
          select: {
            messages: {
              where: { readAt: null, senderId: { not: userId } },
            },
          },
        },
      },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    const conv = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });
    if (!conv) throw new Error("Доступ запрещён");

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conv = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ buyerId: senderId }, { sellerId: senderId }],
      },
      include: {
        listing: { select: { id: true, title: true } },
        buyer: { select: { id: true } },
        seller: { select: { id: true } },
      },
    });
    if (!conv) throw new Error("Доступ запрещён");

    const lang = detectLang(content.trim());
    const message = await prisma.message.create({
      data: { conversationId, senderId, content: content.trim(), lang },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const recipientId = conv.buyerId === senderId ? conv.sellerId : conv.buyerId;
    const { notifyUser } = await import("@/lib/notifications");
    await notifyUser({
      userId: recipientId,
      type: "chat_message",
      title: "Новое сообщение",
      body: `${message.sender.name}: ${content.trim().slice(0, 80)}`,
      link: `/messages/${conversationId}`,
    }).catch(() => {});

    return message;
  }
}

export const chatService = new ChatService();
