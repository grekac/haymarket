import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { adminService } from "@/modules/admin/admin.service";
import { Card } from "@/components/ui/Card";
import { AdminListings } from "@/components/admin/AdminListings";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminReports } from "@/components/admin/AdminReports";

export default async function AdminPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/");

  const stats = await adminService.getStats();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl font-bold mb-8">Админ-панель</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Пользователи", value: stats.users },
          { label: "Объявления", value: stats.listings },
          { label: "Активные", value: stats.activeListings },
          { label: "Сегодня", value: stats.newToday },
        ].map((s) => (
          <Card key={s.label} className="p-5 text-center">
            <p className="text-3xl font-extrabold">{s.value}</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <AdminAnalytics />
      <AdminListings />
      <AdminReports />
      <AdminCategories />
      <div className="mt-10"><AdminUsers /></div>
    </div>
  );
}
