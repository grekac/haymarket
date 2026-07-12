import { ListingChat } from "@/components/chat/ListingChat";

type Params = Promise<{ id: string }>;

export default async function ChatPage({ params }: { params: Params }) {
  const { id } = await params;
  return <ListingChat conversationId={id} />;
}
