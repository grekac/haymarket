import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/ui/BackButton";
import { SellerChannel } from "@/components/seller/SellerChannel";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ from?: string }>;

export default async function SellerPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isVerified: true,
      ratingAvg: true,
      ratingCount: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  const [activeListings, soldListings, totalListings] = await Promise.all([
    prisma.listing.findMany({
      where: { userId: id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: { select: { name: true } },
      },
    }),
    prisma.listing.findMany({
      where: { userId: id, status: { in: ["SOLD", "ARCHIVED"] } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: { select: { name: true } },
      },
    }),
    prisma.listing.count({ where: { userId: id } }),
  ]);

  const backHref = sp.from ? `/listing/${sp.from}` : "/search";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 pb-24">
      <BackButton href={backHref} label={sp.from ? "К объявлению" : "Назад"} />
      <SellerChannel
        seller={{
          ...user,
          activeCount: activeListings.length,
          soldCount: soldListings.length,
          totalListings,
        }}
        activeListings={activeListings}
        soldListings={soldListings}
        highlightListingId={sp.from}
      />
    </div>
  );
}
