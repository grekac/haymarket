"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUnread(d.unread ?? 0))
      .catch(() => {});
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      aria-label="Уведомления"
    >
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span
          className={cn(
            "absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1",
            "rounded-full bg-[var(--danger)] text-white text-[9px] font-bold flex items-center justify-center leading-none"
          )}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
