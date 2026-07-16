import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  applyPaidUnlock,
  createVehicleHistoryCheckout,
  getVehicleHistoryPackage,
  isStripeEnabled,
} from "@/lib/vehicle-history-billing";

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Войдите" }, { status: 401 });
  }

  const allowed = await rateLimit(`vh:unlock:${session.id}`, 10, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Слишком много запросов. Подождите минуту." }, { status: 429 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const packageId = (body.package ?? "full") as string;
  const locale = typeof body.locale === "string" ? body.locale : "hy";

  if (!getVehicleHistoryPackage(packageId)) {
    return NextResponse.json({ error: "Неверный пакет" }, { status: 400 });
  }

  const report = await prisma.vehicleHistoryReport.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Отчёт не найден" }, { status: 404 });
  }

  if (report.paymentStatus === "PAID") {
    return NextResponse.json({ paymentStatus: "PAID", mode: "already" });
  }

  try {
    if (isStripeEnabled()) {
      const { checkoutUrl } = await createVehicleHistoryCheckout({
        reportId: id,
        userId: session.id,
        packageId,
        locale,
      });
      return NextResponse.json({ checkoutUrl, mode: "stripe" });
    }

    const allowDemo =
      process.env.ALLOW_DEMO_PAYMENTS === "true" ||
      process.env.NODE_ENV !== "production";
    if (!allowDemo) {
      return NextResponse.json(
        { error: "Настройте Stripe для оплаты отчётов" },
        { status: 503 }
      );
    }

    const updated = await applyPaidUnlock(id, {
      userId: session.id,
      packageId,
    });

    return NextResponse.json({
      paymentStatus: "PAID",
      mode: "demo",
      report: {
        id: updated.id,
        paymentStatus: updated.paymentStatus,
        paidPackage: updated.paidPackage,
        summary: JSON.parse(updated.summaryJson),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    if (message === "Report not found") {
      return NextResponse.json({ error: "Отчёт не найден" }, { status: 404 });
    }
    console.error("[vehicle-history/unlock]", err);
    return NextResponse.json({ error: "Не удалось разблокировать отчёт" }, { status: 500 });
  }
}
