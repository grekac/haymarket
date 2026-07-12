import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminService } from "@/modules/admin/admin.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "verify") {
    const user = await adminService.toggleVerifyUser(id);
    return NextResponse.json(user);
  }

  const user = await adminService.toggleBlockUser(id);
  return NextResponse.json(user);
}
