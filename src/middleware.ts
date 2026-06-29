import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "abico_loyalty_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? "abico-loyalty-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

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

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const [, allowedRoles] = matched;
    if (!allowedRoles.includes(payload.role as string)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/employee/:path*", "/admin/:path*"],
};
