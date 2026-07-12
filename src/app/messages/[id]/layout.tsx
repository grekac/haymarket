export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 top-12 z-20 bg-[var(--bg-primary)] md:static md:z-auto md:bg-transparent md:top-auto">
      {children}
    </div>
  );
}
