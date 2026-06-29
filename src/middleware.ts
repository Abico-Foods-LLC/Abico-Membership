import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const protectedRoutes: Record<string, string[]> = {
  "/dashboard": ["MEMBER", "EMPLOYEE", "STORE_ADMIN", "PLATFORM_ADMIN"],
  "/profile": ["MEMBER", "EMPLOYEE", "STORE_ADMIN", "PLATFORM_ADMIN"],
  "/employee": ["EMPLOYEE", "STORE_ADMIN", "PLATFORM_ADMIN"],
  "/admin": ["STORE_ADMIN", "PLATFORM_ADMIN"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const matched = Object.entries(protectedRoutes).find(([route]) =>
    pathname.startsWith(route),
  );

  if (!matched) return NextResponse.next();

  const session = await getSessionFromRequest(request);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const [, allowedRoles] = matched;
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/employee/:path*", "/admin/:path*"],
};
