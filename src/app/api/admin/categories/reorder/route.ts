import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { invalidateCategoryCache } from "@/lib/category-cache";
import { adminService } from "@/modules/admin/admin.service";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!items.length || items.some((item: { id?: string; sortOrder?: number }) => !item.id || typeof item.sortOrder !== "number")) {
    return NextResponse.json({ error: "items: [{ id, sortOrder }]" }, { status: 400 });
  }

  try {
    await adminService.reorderCategories(items);
    invalidateCategoryCache();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
