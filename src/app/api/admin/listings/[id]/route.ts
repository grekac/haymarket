import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminService } from "@/modules/admin/admin.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { status } = await request.json();
  const { id } = await params;
  await adminService.updateListingStatus(id, status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await adminService.deleteListing(id);
  return NextResponse.json({ ok: true });
}
