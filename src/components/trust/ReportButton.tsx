"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, reason }),
    });
    if (res.ok) {
      setDone(true);
      setOpen(false);
    }
  }

  if (done) return <p className="text-xs text-[var(--text-muted)]">Жалоба отправлена</p>;

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
        <Flag className="w-4 h-4" /> Пожаловаться
      </Button>
      {open && (
        <div className="mt-2 space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Опишите проблему..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] text-sm"
          />
          <Button size="sm" onClick={submit} disabled={!reason.trim()}>Отправить</Button>
        </div>
      )}
    </div>
  );
}
