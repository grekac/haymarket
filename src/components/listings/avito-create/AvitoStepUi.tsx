"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function AvitoStepShell({
  title,
  subtitle,
  onBack,
  showSaveExit = false,
  continueLabel = "Продолжить",
  onContinue,
  continueDisabled,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  showSaveExit?: boolean;
  continueLabel?: string;
  onContinue?: () => void;
  continueDisabled?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-1 rounded-full hover:bg-[var(--bg-hover)]"
          aria-label="Назад"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        {showSaveExit && (
          <button
            type="button"
            onClick={() => router.push("/my")}
            className="px-2 py-2 text-[14px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            Сохранить и выйти
          </button>
        )}
      </div>

      <div className="flex-1 px-4 pb-28">
        <h1 className="text-[28px] font-bold tracking-tight leading-tight mt-2">{title}</h1>
        {subtitle && (
          <p className="text-[14px] text-[var(--text-muted)] mt-2 leading-relaxed">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>

      {onContinue && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 px-4 pt-3 bg-[var(--bg-primary)] border-t border-[var(--border)]/40"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={onContinue}
            disabled={continueDisabled}
            className={cn(
              "w-full h-12 rounded-2xl text-[16px] font-semibold transition-opacity",
              continueDisabled
                ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] opacity-60"
                : "bg-[var(--text-primary)] text-[var(--bg-primary)] active:scale-[0.99]"
            )}
          >
            {continueLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export function AvitoRadioRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 py-4 text-left active:opacity-80"
    >
      <span className="text-[17px] font-medium leading-snug">{label}</span>
      <span
        className={cn(
          "w-6 h-6 rounded-full border-2 shrink-0 transition-colors",
          selected
            ? "border-[var(--text-primary)] bg-[var(--text-primary)] shadow-[inset_0_0_0_3px_var(--bg-primary)]"
            : "border-[var(--text-muted)]/50"
        )}
      />
    </button>
  );
}

export function AvitoChoicePill({
  label,
  selected,
  onClick,
  className,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 px-4 rounded-xl text-[15px] font-medium border transition-colors",
        selected
          ? "border-[var(--text-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
          : "border-transparent bg-[var(--bg-secondary)] text-[var(--text-primary)]",
        className
      )}
    >
      {label}
    </button>
  );
}

export function AvitoField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[15px] font-medium">{label}</span>
      {children}
      {hint && <span className="block text-[12px] text-[var(--text-muted)]">{hint}</span>}
    </label>
  );
}

export const avitoInputClass =
  "w-full h-12 px-4 rounded-2xl bg-[var(--bg-secondary)] border border-transparent text-[15px] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border)]";
