"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const params = useSearchParams();

  function pageUrl(p: number) {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    return `/search?${sp.toString()}`;
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {page > 1 && (
        <Link href={pageUrl(page - 1)}>
          <Button variant="secondary" size="sm"><ChevronLeft className="w-4 h-4" /></Button>
        </Link>
      )}
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const p = i + 1;
        return (
          <Link key={p} href={pageUrl(p)}>
            <Button variant={p === page ? "primary" : "secondary"} size="sm">{p}</Button>
          </Link>
        );
      })}
      {page < totalPages && (
        <Link href={pageUrl(page + 1)}>
          <Button variant="secondary" size="sm"><ChevronRight className="w-4 h-4" /></Button>
        </Link>
      )}
    </div>
  );
}
