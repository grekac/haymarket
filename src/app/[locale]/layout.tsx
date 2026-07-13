import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CompareBar } from "@/components/listings/CompareBar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { routing, type AppLocale, openGraphLocales } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates("/", locale as AppLocale),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: openGraphLocales[locale as AppLocale],
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as AppLocale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} data-theme="light" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans min-h-screen flex flex-col`}
        style={{
          fontFamily:
            "var(--font-inter), -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif",
        }}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <div className="app-frame">
              <Header />
              <main className="flex-1 pb-24">{children}</main>
              <Footer />
              <CompareBar />
              <MobileNav />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
