import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const rateMap = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (process.env.NODE_ENV === "production" && pathname.startsWith("/api/debug")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (pathname.startsWith("/api/auth/")) {
    if (!rateLimit(`auth:${ip}`, 20, 60_000)) {
      return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
    }
  }

  if (pathname.startsWith("/api/ai/")) {
    if (!rateLimit(`ai:${ip}`, 15, 60_000)) {
      return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
    }
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("session")?.value;
    const user = token ? await verifyTokenEdge(token) : null;
    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/hy", request.url));
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
