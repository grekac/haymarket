import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth";
import {
  getVehicleHistoryReport,
  toViewerPayload,
} from "@/modules/vehicle-history/history.service";
import { VehicleHistoryReportView } from "@/components/vehicle-history/VehicleHistoryReportView";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function VehicleHistoryReportPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const report = await getVehicleHistoryReport(id);
  if (!report || report.status !== "READY") notFound();

  const session = await getSession();
  const { payload, viewerPaymentStatus } = toViewerPayload(
    report,
    session?.id ?? null
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 pb-28">
      <VehicleHistoryReportView
        reportId={report.id}
        payload={payload}
        paymentStatus={viewerPaymentStatus}
      />
    </div>
  );
}
