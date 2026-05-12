import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "@/lib/jwt-secret";
import { getJwtVerifyOptions } from "@/lib/jwt-claims";

const protectedRoutes = [
  { path: "/admin", role: "ADMIN" },
  { path: "/dashboard", role: null }
] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/forgot-password")) {
    return NextResponse.next();
  }

  const match = protectedRoutes.find((route) => pathname.startsWith(route.path));
  if (!match) return NextResponse.next();

  const token = request.cookies.get("session")?.value;
  const loginRedirect = new URL("/admin/login", request.url);

  if (!token) {
    return NextResponse.redirect(loginRedirect);
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), getJwtVerifyOptions());
    const role = typeof payload.role === "string" ? payload.role.trim() : "";
    if (match.role && role !== match.role) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginRedirect);
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard", "/dashboard/:path*"]
};
