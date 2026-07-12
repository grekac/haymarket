import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg-input)] border border-[var(--border)]",
        "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
        "focus:outline-none focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_var(--brand-glow)] transition-all duration-200",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
