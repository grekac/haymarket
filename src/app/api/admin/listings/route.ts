import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminService } from "@/modules/admin/admin.service";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await adminService.getListings());
}
