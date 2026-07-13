import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";
import { routing } from "@/i18n/routing";
import { rateLimitEdge } from "@/lib/rate-limit-edge";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (process.env.NODE_ENV === "production" && pathname.startsWith("/api/debug")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (pathname.startsWith("/api/auth/")) {
    if (!rateLimitEdge(`auth:${ip}`, 20, 60)) {
      return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
    }
  }

  if (pathname.startsWith("/api/ai/")) {
    if (!rateLimitEdge(`ai:${ip}`, 15, 60)) {
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
  matcher: [
    "/api/auth/:path*",
    "/api/ai/:path*",
    "/admin/:path*",
    "/api/debug",
    "/((?!api|_next|.*\\..*).*)",
  ],
};
