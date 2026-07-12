"use client";

import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:block text-sm text-neutral-600">
        {user.name}
      </span>
      <button
        onClick={logout}
        className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        Выйти
      </button>
    </div>
  );
}
