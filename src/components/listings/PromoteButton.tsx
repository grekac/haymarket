"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PromoteButton({ listingId, isPromoted }: { listingId: string; isPromoted?: boolean }) {
  const [done, setDone] = useState(isPromoted);

  async function promote() {
    const res = await fetch(`/api/listings/${listingId}/promote`, { method: "POST" });
    if (res.ok) setDone(true);
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <Zap className="w-3.5 h-3.5" /> Продвигается
      </span>
    );
  }

  return (
    <Button variant="secondary" size="sm" onClick={promote}>
      <Zap className="w-4 h-4" /> Продвинуть (7 дней)
    </Button>
  );
}
