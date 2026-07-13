import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { invalidateCategoryCache } from "@/lib/category-cache";
import { adminService } from "@/modules/admin/admin.service";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();

  try {
    const category = await adminService.updateCategory(id, body);
    invalidateCategoryCache();
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const { id } = await params;

  try {
    await adminService.deleteCategory(id);
    invalidateCategoryCache();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
