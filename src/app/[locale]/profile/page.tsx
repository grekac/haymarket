import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { VerifiedBadge, RatingStars } from "@/components/trust/VerifiedBadge";
import { PromoteButton } from "@/components/listings/PromoteButton";
import { MyListingActions } from "@/components/listings/MyListingActions";
import { SellerAnalytics } from "@/components/seller/SellerAnalytics";
import { MyVehicleReports } from "@/components/vehicle-history/MyVehicleReports";
import { VerifyPhoneCard } from "@/components/profile/VerifyPhoneCard";
import { PromotionCheckoutBanner } from "@/components/listings/PromotionCheckoutBanner";
import { BackButton } from "@/components/ui/BackButton";
import { RecentlyViewed } from "@/components/listings/RecentlyViewed";
import { fixMojibake } from "@/lib/text-encoding";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Активно",
  PENDING: "На модерации",
  REJECTED: "Отклонено",
  SOLD: "Продано",
  ARCHIVED: "В архиве",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ promoted?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login?next=/profile");

  const { promoted } = await searchParams;

  let listings: Array<{
    id: string;
    title: string;
    status: string;
    isPromoted: boolean;
    promotedUntil: Date | null;
    category: { name: string };
  }> = [];
  let dbUser: { isVerified: boolean; ratingAvg: number; ratingCount: number } | null = null;
  let favCount = 0;
  let loadError: string | null = null;

  try {
    const [rows, userRow, favs] = await Promise.all([
      prisma.listing.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: { images: { take: 1 }, category: true },
      }),
      prisma.user.findUnique({ where: { id: user.id } }),
      prisma.favorite.count({ where: { userId: user.id } }),
    ]);
    listings = rows;
    dbUser = userRow;
    favCount = favs;
  } catch (e) {
    console.error("[profile] database error:", e);
    loadError =
      "Не удалось загрузить данные профиля. Возможно, схема БД не синхронизирована (нужен prisma db push).";
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
      <BackButton href="/" />
      <PromotionCheckoutBanner status={promoted} />
      {loadError && (
        <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {loadError}
        </div>
      )}
      <VerifyPhoneCard isVerified={dbUser?.isVerified ?? false} />
      <Card className="p-6 mb-6 shadow-[var(--shadow-md)]">
        <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center text-2xl font-bold mb-4">
          {user.name.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          {dbUser?.isVerified && <VerifiedBadge />}
          {dbUser && <RatingStars rating={dbUser.ratingAvg} count={dbUser.ratingCount} />}
        </div>
        <p className="text-[var(--text-muted)]">{user.phone}</p>
        {user.email && <p className="text-sm text-[var(--text-muted)]">{user.email}</p>}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <Link href={`/seller/${user.id}`} className="text-[var(--accent)] font-medium hover:underline">
            Мой канал продавца
          </Link>
          <Link href="/favorites" className="text-[var(--text-secondary)] hover:underline">{favCount} избранных</Link>
          <Link href="/saved-searches" className="text-[var(--text-secondary)] hover:underline">Сохранённые поиски</Link>
          <Link href="/notifications" className="text-[var(--text-secondary)] hover:underline">Уведомления</Link>
          <Link href="/messages" className="text-[var(--text-secondary)] hover:underline">Чат</Link>
          <a href="#haypass" className="text-[var(--text-secondary)] hover:underline">Отчёты HayPass</a>
          <span className="text-[var(--text-muted)]">{listings.length} объявлений</span>
        </div>
      </Card>

      <SellerAnalytics />

      <MyVehicleReports />

      <div className="-mx-4 mb-6">
        <RecentlyViewed />
      </div>

      <h2 className="font-bold mb-4">Мои объявления</h2>
      {listings.length === 0 ? (
        <Link href="/create"><Button>Подать первое объявление</Button></Link>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
              <Link href={`/listing/${l.id}`} className="flex-1 hover:opacity-80">
                <p className="font-medium">{fixMojibake(l.title)}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {fixMojibake(l.category.name)} ·{" "}
                  <span className={l.status === "PENDING" ? "text-amber-600 font-medium" : ""}>
                    {STATUS_LABEL[l.status] ?? l.status}
                  </span>
                </p>
              </Link>
              {l.status === "ACTIVE" && (
                <PromoteButton
                  listingId={l.id}
                  isPromoted={l.isPromoted}
                  promotedUntil={l.promotedUntil}
                />
              )}
              <MyListingActions listingId={l.id} />
            </div>
          ))}
        </div>
      )}

      <LogoutButton />
    </div>
  );
}
