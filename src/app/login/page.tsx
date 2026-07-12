import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Вход — HayMarket" };

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-16 md:py-24">
      <h1 className="text-xl font-medium mb-1">Вход</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">HayMarket</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
