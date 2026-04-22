import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/register"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ❌ no tokens at all → block
  if (!token && !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ⚠️ access expired but refresh exists → allow
  if (!token && refreshToken) {
    return NextResponse.next();
  }

  const payload = await verifyToken(token!);

  if (!payload) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
