import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionAdmin } from "@/lib/services/auth.service";
import { problemResponse } from "@/lib/http/problem-details";
import { SESSION_COOKIE_NAME } from "@/lib/http/session-cookie";

const PUBLIC_PATHS = ["/admin/login", "/api/admin/auth/login"];

// RF-105, RF-118 — protege /admin/** y /api/admin/**. Next.js 16: runtime Node.js
// por defecto (antes Edge en `middleware.ts`, deprecado en esta versión).
export async function proxy(request: NextRequest): Promise<NextResponse | Response> {
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminArea || PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const admin = await getSessionAdmin(token);

  if (!admin) {
    if (pathname.startsWith("/api/admin")) {
      return problemResponse(401, "No autorizado", "Sesión inválida o expirada");
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
