import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { chatService } from "@/modules/chat/chat.service";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  try {
    const { id } = await params;
    const conversation = await chatService.getConversation(id, session.id);
    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "Чат не найден" }, { status: 404 });
  }
}
