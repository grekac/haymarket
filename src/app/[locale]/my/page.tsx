import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyAdsView } from "@/components/listings/MyAdsView";

export const dynamic = "force-dynamic";

export default async function MyAdsPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/my");

  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      status: true,
      images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <MyAdsView listings={listings} />
    </div>
  );
}
