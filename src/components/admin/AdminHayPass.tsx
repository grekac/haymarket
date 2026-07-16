"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Stats = {
  lookupsTotal: number;
  lookupsLast24h: number;
  reportsTotal: number;
  reportsPaid: number;
  partnerKeysActive: number;
};

type AuditItem = {
  id: string;
  action: string;
  actorId: string | null;
  metaJson: unknown;
  createdAt: string;
};

type Partner = {
  id: string;
  name: string;
  keyPrefix: string;
  rateLimit: number;
  isActive: boolean;
  createdAt: string;
};

export function AdminHayPass() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [name, setName] = useState("");
  const [rateLimit, setRateLimit] = useState("60");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/vehicle-history/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d.lookupsTotal === "number") setStats(d);
      })
      .catch(() => {});

    fetch("/api/admin/vehicle-history/audit?limit=30")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setAudit(d);
      })
      .catch(() => {});

    fetch("/api/admin/vehicle-history/partners")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setPartners(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createPartner(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/vehicle-history/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          rateLimit: Number(rateLimit) || 60,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка создания");
        return;
      }
      if (typeof data.apiKey === "string" && data.apiKey) {
        setCreatedKey(data.apiKey);
      }
      setName("");
      setRateLimit("60");
      load();
    } catch {
      setError("Ошибка сети");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(p: Partner) {
    const res = await fetch("/api/admin/vehicle-history/partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setPartners((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
    load();
  }

  async function copyKey() {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey);
    } catch {
      /* ignore */
    }
  }

  const counters: { label: string; value: number }[] = stats
    ? [
        { label: "Запросы всего", value: stats.lookupsTotal },
        { label: "Запросы за 24ч", value: stats.lookupsLast24h },
        { label: "Отчёты", value: stats.reportsTotal },
        { label: "Оплаченные", value: stats.reportsPaid },
        { label: "Активные ключи", value: stats.partnerKeysActive },
      ]
    : [];

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">HayPass</h2>

      {counters.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {counters.map((c) => (
            <div
              key={c.label}
              className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-center"
            >
              <p className="text-2xl font-extrabold">{c.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-8">
        <h3 className="font-semibold mb-3">Последние действия</h3>
        {audit.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Нет записей аудита</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {audit.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm"
              >
                <p className="font-medium">{a.action}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {a.actorId ? `actor: ${a.actorId}` : "system"} ·{" "}
                  {new Date(a.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-3">Партнёрские ключи</h3>

        {createdKey && (
          <div className="mb-4 p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-sm">
            <p className="font-medium mb-2">API-ключ создан — сохраните сейчас, он больше не покажется:</p>
            <code className="block break-all text-xs mb-3 select-all">{createdKey}</code>
            <div className="flex gap-2">
              <Button size="sm" type="button" onClick={copyKey}>
                Копировать
              </Button>
              <Button size="sm" variant="secondary" type="button" onClick={() => setCreatedKey(null)}>
                Скрыть
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={createPartner} className="flex flex-wrap gap-2 items-end mb-4">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-[var(--text-muted)] block mb-1">Имя</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Партнёр"
              required
            />
          </div>
          <div className="w-28">
            <label className="text-xs text-[var(--text-muted)] block mb-1">Лимит / мин</label>
            <Input
              type="number"
              min={1}
              max={10000}
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
          </div>
          <Button size="sm" type="submit" disabled={creating || !name.trim()}>
            {creating ? "…" : "Создать"}
          </Button>
        </form>
        {error && <p className="text-sm text-[var(--danger)] mb-3">{error}</p>}

        {partners.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Нет партнёрских ключей</p>
        ) : (
          <div className="space-y-2">
            {partners.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {p.keyPrefix}… · лимит {p.rateLimit}/мин ·{" "}
                    {new Date(p.createdAt).toLocaleString("ru-RU")}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    p.isActive
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-[var(--bg-hover)] text-[var(--text-muted)]"
                  }`}
                >
                  {p.isActive ? "активен" : "выкл"}
                </span>
                <Button
                  size="sm"
                  variant={p.isActive ? "danger" : "secondary"}
                  onClick={() => toggleActive(p)}
                >
                  {p.isActive ? "Выкл" : "Вкл"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
