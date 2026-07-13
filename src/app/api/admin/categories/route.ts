import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { invalidateCategoryCache } from "@/lib/category-cache";
import { adminService } from "@/modules/admin/admin.service";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const categories = await adminService.getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

  const body = await request.json();
  if (!body.name?.trim() || !body.slug?.trim() || !body.icon?.trim()) {
    return NextResponse.json({ error: "name, slug, icon обязательны" }, { status: 400 });
  }

  try {
    const category = await adminService.createCategory(body);
    invalidateCategoryCache();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
