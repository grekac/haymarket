import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminService } from "@/modules/admin/admin.service";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await adminService.getStats());
}
