"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      router.push("/");
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
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Имя</label>
          <Input name="name" required placeholder="Арам" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Телефон</label>
          <Input name="phone" required placeholder="+374 91 123456" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
          <Input name="email" type="email" placeholder="необязательно" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Пароль</label>
          <Input name="password" type="password" required minLength={6} placeholder="минимум 6 символов" />
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Регистрация..." : "Создать аккаунт"}
        </Button>

        <p className="text-sm text-center text-[var(--text-muted)]">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-[var(--text-primary)] font-semibold hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </Card>
  );
}
