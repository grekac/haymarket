import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/ui/BackButton";
import { EditListingForm } from "@/components/listings/EditListingForm";

type Params = Promise<{ id: string }>;

export default async function EditListingPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/listing/${id}/edit`);

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();
  if (listing.userId !== session.id && session.role !== "ADMIN") redirect(`/listing/${id}`);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
      <BackButton href={`/listing/${id}`} />
      <h1 className="text-xl font-bold mb-6">Редактировать объявление</h1>
      <EditListingForm
        listingId={listing.id}
        title={listing.title}
        description={listing.description}
        price={listing.price}
        city={listing.city}
        district={listing.district}
      />
    </div>
  );
}
