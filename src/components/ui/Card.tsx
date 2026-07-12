import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-[var(--bg-card)] border border-[var(--border)] shadow-[var(--shadow-sm)]",
        className
      )}
      {...props}
    />
  );
}
