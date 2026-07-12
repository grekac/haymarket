"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} className="text-sm text-[var(--text-muted)] hover:text-red-500 mt-8 transition-colors">
      Выйти из аккаунта
    </button>
  );
}
