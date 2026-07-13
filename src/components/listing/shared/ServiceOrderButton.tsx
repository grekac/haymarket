"use client";

import { AskSellerButton } from "@/components/chat/AskSellerButton";
import { cn } from "@/lib/utils";

export function ServiceOrderButton({
  listingId,
  className,
}: {
  listingId: string;
  className?: string;
}) {
  return (
    <AskSellerButton
      listingId={listingId}
      label="Заказать услугу"
      className={cn(
        "!h-12 !rounded-xl !w-full !justify-center !bg-[var(--accent)] !text-[var(--accent-fg)] !border-0 !font-semibold",
        className
      )}
    />
  );
}
