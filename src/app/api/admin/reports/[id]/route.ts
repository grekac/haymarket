import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminService } from "@/modules/admin/admin.service";

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await adminService.resolveReport(id);
  return NextResponse.json({ ok: true });
}
