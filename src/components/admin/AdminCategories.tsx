"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChevronDown, ChevronUp, GripVertical, Pencil, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  showOnHome: boolean;
  parentId: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  _count: { listings: number; children: number };
};

type CategoryForm = {
  name: string;
  slug: string;
  icon: string;
  imageUrl: string;
  sortOrder: string;
  parentId: string;
  showOnHome: boolean;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  icon: "LayoutGrid",
  imageUrl: "",
  sortOrder: "10",
  parentId: "",
  showOnHome: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildTree(items: Category[]) {
  const roots = items
    .filter((c) => !c.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  return roots.map((root) => ({
    ...root,
    children: items
      .filter((c) => c.parentId === root.id)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
  }));
}

function getSiblings(items: Category[], category: Category) {
  return items
    .filter((c) => c.parentId === category.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const tree = useMemo(() => buildTree(items), [items]);
  const parentOptions = useMemo(
    () => items.filter((c) => !c.parentId).sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) setItems(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          icon: form.icon,
          imageUrl: form.imageUrl || undefined,
          sortOrder: Number(form.sortOrder) || 0,
          parentId: form.parentId || null,
          showOnHome: form.showOnHome,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Ошибка");
        return;
      }
      setForm(EMPTY_FORM);
      await load();
    } finally {
      setLoading(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      imageUrl: category.imageUrl || "",
      sortOrder: String(category.sortOrder),
      parentId: category.parentId || "",
      showOnHome: category.showOnHome,
    });
  }

  async function saveEdit(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          slug: editForm.slug,
          icon: editForm.icon,
          imageUrl: editForm.imageUrl || null,
          sortOrder: Number(editForm.sortOrder) || 0,
          parentId: editForm.parentId || null,
          showOnHome: editForm.showOnHome,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Ошибка");
        return;
      }
      setEditingId(null);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  }

  async function toggleShowOnHome(id: string, showOnHome: boolean) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showOnHome: !showOnHome }),
    });
    await load();
  }

  async function removeCategory(id: string, name: string) {
    if (!confirm(`Удалить категорию «${name}»?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Ошибка удаления");
      return;
    }
    if (editingId === id) setEditingId(null);
    await load();
  }

  async function persistOrder(siblings: Category[]) {
    const payload = siblings.map((item, index) => ({
      id: item.id,
      sortOrder: (index + 1) * 10,
    }));

    const res = await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: payload }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Ошибка сортировки");
      await load();
      return;
    }

    await load();
  }

  async function moveCategory(category: Category, direction: -1 | 1) {
    const siblings = getSiblings(items, category);
    const index = siblings.findIndex((c) => c.id === category.id);
    const target = index + direction;
    if (target < 0 || target >= siblings.length) return;

    const next = [...siblings];
    [next[index], next[target]] = [next[target], next[index]];
    await persistOrder(next);
  }

  async function handleDrop(target: Category) {
    if (!draggingId || draggingId === target.id) return;

    const dragged = items.find((c) => c.id === draggingId);
    if (!dragged || dragged.parentId !== target.parentId) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    const siblings = getSiblings(items, target);
    const from = siblings.findIndex((c) => c.id === draggingId);
    const to = siblings.findIndex((c) => c.id === target.id);
    if (from < 0 || to < 0) return;

    const next = [...siblings];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDraggingId(null);
    setDropTargetId(null);
    await persistOrder(next);
  }

  function renderEditForm(id: string) {
    return (
      <div className="mt-3 grid md:grid-cols-3 gap-3 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
        <input
          placeholder="Название"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
        />
        <input
          placeholder="slug"
          value={editForm.slug}
          onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
          className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
        />
        <input
          placeholder="icon (Lucide)"
          value={editForm.icon}
          onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
          className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
        />
        <input
          placeholder="imageUrl (опционально)"
          value={editForm.imageUrl}
          onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
          className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)] md:col-span-2"
        />
        <input
          placeholder="порядок"
          value={editForm.sortOrder}
          onChange={(e) => setEditForm({ ...editForm, sortOrder: e.target.value })}
          className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
        />
        <select
          value={editForm.parentId}
          onChange={(e) => setEditForm({ ...editForm, parentId: e.target.value })}
          className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)] md:col-span-2"
        >
          <option value="">Без родителя (корневая)</option>
          {parentOptions
            .filter((p) => p.id !== id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={editForm.showOnHome}
            onChange={(e) => setEditForm({ ...editForm, showOnHome: e.target.checked })}
          />
          Показывать на главной
        </label>
        <div className="flex gap-2 md:col-span-3">
          <Button type="button" onClick={() => saveEdit(id)} disabled={loading}>
            Сохранить
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
            Отмена
          </Button>
        </div>
      </div>
    );
  }

  function renderRow(category: Category, depth = 0) {
    const isDragging = draggingId === category.id;
    const isDropTarget = dropTargetId === category.id;

    return (
      <div key={category.id}>
        <div
          draggable
          onDragStart={() => setDraggingId(category.id)}
          onDragEnd={() => {
            setDraggingId(null);
            setDropTargetId(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDropTargetId(category.id);
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(category);
          }}
          className={`flex items-start gap-3 p-4 rounded-2xl border bg-[var(--bg-card)] transition-colors ${
            isDropTarget ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20" : "border-[var(--border)]"
          } ${isDragging ? "opacity-50" : ""}`}
          style={{ marginLeft: depth * 24 }}
        >
          <button
            type="button"
            className="mt-1 text-[var(--text-muted)] cursor-grab active:cursor-grabbing"
            aria-label="Перетащить"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">
                {category.name}{" "}
                <span className="text-[var(--text-muted)] text-sm">/{category.slug}</span>
              </p>
              {!category.isActive && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-700">Скрыта</span>
              )}
              {category.showOnHome && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700">На главной</span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {category._count.listings} объявл. · {category._count.children} подкат. · порядок {category.sortOrder}
              {category.parent ? ` · родитель: ${category.parent.name}` : ""}
              {category.imageUrl ? " · есть картинка" : ""}
            </p>
            {editingId === category.id && renderEditForm(category.id)}
          </div>

          <div className="flex flex-wrap items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => moveCategory(category, -1)}
              className="p-2 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)]"
              aria-label="Выше"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => moveCategory(category, 1)}
              className="p-2 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)]"
              aria-label="Ниже"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => (editingId === category.id ? setEditingId(null) : startEdit(category))}
              className="p-2 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)]"
              aria-label="Редактировать"
            >
              {editingId === category.id ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => toggleShowOnHome(category.id, category.showOnHome)}
              className={`text-xs font-medium px-2.5 py-1.5 rounded-full ${
                category.showOnHome ? "bg-blue-500/15 text-blue-700" : "bg-[var(--bg)] text-[var(--text-muted)]"
              }`}
            >
              Главная
            </button>
            <button
              type="button"
              onClick={() => toggleActive(category.id, category.isActive)}
              className={`text-xs font-medium px-2.5 py-1.5 rounded-full ${
                category.isActive ? "bg-emerald-500/15 text-emerald-700" : "bg-red-500/15 text-red-700"
              }`}
            >
              {category.isActive ? "Активна" : "Скрыта"}
            </button>
            <button
              type="button"
              onClick={() => removeCategory(category.id, category.name)}
              className="p-2 rounded-lg hover:bg-red-500/10 text-red-600"
              aria-label="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">Категории</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Дерево категорий, порядок перетаскиванием или стрелками. Изменения сразу попадают на главную.
          </p>
        </div>
        <span className="text-sm text-[var(--text-muted)]">{items.length} всего</span>
      </div>

      <Card className="p-5 mb-6">
        <h3 className="font-semibold mb-3">Новая категория</h3>
        <form onSubmit={onCreate} className="grid md:grid-cols-3 gap-3">
          <input
            placeholder="Название"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: form.slug || slugify(e.target.value),
              })
            }
            className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
            required
          />
          <input
            placeholder="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
            required
          />
          <input
            placeholder="icon (Lucide)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
            required
          />
          <input
            placeholder="imageUrl (опционально)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)] md:col-span-2"
          />
          <input
            placeholder="порядок"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)]"
          />
          <select
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            className="rounded-xl border border-[var(--border)] px-3 py-2 bg-[var(--bg-card)] md:col-span-2"
          >
            <option value="">Без родителя (корневая)</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.showOnHome}
              onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
            />
            Показывать на главной
          </label>
          <Button type="submit" disabled={loading} className="md:col-span-3 md:max-w-xs">
            Добавить
          </Button>
        </form>
      </Card>

      <div className="space-y-2">
        {tree.map((root) => (
          <div key={root.id} className="space-y-2">
            {renderRow(root, 0)}
            {root.children.map((child) => renderRow(child, 1))}
          </div>
        ))}
        {!tree.length && (
          <p className="text-sm text-[var(--text-muted)] p-6 text-center border border-dashed border-[var(--border)] rounded-2xl">
            Категорий пока нет
          </p>
        )}
      </div>
    </section>
  );
}
