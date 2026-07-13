import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getCategoryFieldConfig,
  saveCategoryFieldSchema,
  invalidateCategoryFieldCache,
} from "@/lib/category-field-service";
import { CATEGORY_FIELD_GROUPS, type CategoryFieldGroup } from "@/lib/category-fields";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id }, select: { id: true, slug: true, name: true } });
  if (!category) return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });

  const config = await getCategoryFieldConfig(category.slug, category.id);
  const staticGroups = CATEGORY_FIELD_GROUPS[category.slug] ?? [];

  return NextResponse.json({
    category,
    groups: config.groups,
    layoutType: config.layoutType,
    source: config.source,
    staticFallback: staticGroups,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!category) return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });

  const body = await request.json();
  const groups = body.groups as CategoryFieldGroup[];
  const layoutType = typeof body.layoutType === "string" ? body.layoutType : "premium";

  if (!Array.isArray(groups)) {
    return NextResponse.json({ error: "groups должен быть массивом" }, { status: 400 });
  }

  try {
    const row = await saveCategoryFieldSchema(id, groups, layoutType);
    invalidateCategoryFieldCache(id);
    return NextResponse.json({ ok: true, updatedAt: row.updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сохранения";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const { id } = await params;

  try {
    await prisma.categoryFieldSchema.deleteMany({ where: { categoryId: id } });
    invalidateCategoryFieldCache(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 400 });
  }
}
