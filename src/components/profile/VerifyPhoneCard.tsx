"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function VerifyPhoneCard({ isVerified }: { isVerified: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (isVerified) {
    return (
      <Card className="p-4 mb-6 border-emerald-500/30 bg-emerald-500/10">
        <p className="text-sm font-medium text-emerald-700">Телефон подтверждён</p>
      </Card>
    );
  }

  async function sendCode() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/verify/send", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("sent");
      setMessage(data.devCode ? `Dev-код: ${data.devCode}` : data.message);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5 mb-6 border-amber-500/30 bg-amber-500/5">
      <h3 className="font-semibold mb-1">Подтвердите телефон</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">Повысьте доверие покупателей — верификация по SMS.</p>
      {step === "idle" ? (
        <Button onClick={sendCode} disabled={loading}>Получить код</Button>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2 bg-[var(--bg-card)] tracking-widest"
          />
          <Button onClick={confirm} disabled={loading || code.length !== 6}>OK</Button>
        </div>
      )}
      {message && <p className="text-xs mt-3 text-[var(--text-muted)]">{message}</p>}
    </Card>
  );
}
