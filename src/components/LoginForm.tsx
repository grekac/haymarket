"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      router.push(searchParams.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">
            {error}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Телефон</label>
          <Input name="phone" required placeholder="+374 91 123456" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Пароль</label>
          <Input name="password" type="password" required />
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Вход..." : "Войти"}
        </Button>

        <p className="text-sm text-center text-[var(--text-muted)]">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-[var(--text-primary)] font-semibold hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </Card>
  );
}
