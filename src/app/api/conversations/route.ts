import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { chatService } from "@/modules/chat/chat.service";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });
  const conversations = await chatService.getUserConversations(session.id);
  return NextResponse.json(conversations);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Войдите" }, { status: 401 });

  const { listingId } = await request.json();
  const conv = await chatService.getOrCreateConversation(listingId, session.id);
  return NextResponse.json(conv);
}
