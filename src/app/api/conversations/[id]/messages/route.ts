import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { chatService } from "@/modules/chat/chat.service";
import { getSocketUrl } from "@/lib/socket-url";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const { id } = await params;
  const messages = await chatService.getMessages(id, session.id);
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const message = await chatService.sendMessage(id, session.id, body);

  // Notify socket server (best-effort)
  try {
    const socketUrl = getSocketUrl();
    await fetch(`${socketUrl}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.INTERNAL_SOCKET_SECRET
          ? { "x-socket-secret": process.env.INTERNAL_SOCKET_SECRET }
          : {}),
      },
      body: JSON.stringify({ conversationId: id, message }),
    }).catch(() => {});
  } catch {}

  return NextResponse.json(message);
}
