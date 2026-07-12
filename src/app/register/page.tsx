import { RegisterForm } from "@/components/RegisterForm";

export const metadata = { title: "Регистрация — HayMarket" };

export default function RegisterPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-16 md:py-24">
      <h1 className="text-xl font-medium mb-1">Регистрация</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Создайте аккаунт</p>
      <RegisterForm />
    </div>
  );
}
