import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const role = request.cookies.get("role")?.value?.toLowerCase();
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/doctor-dashboard") && role !== "doctor") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/patient-dashboard") && role !== "patient") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/diagnostic-dashboard") && role !== "diagnostic") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/pharmacy-dashboard") && role !== "pharmacy") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/doctor-dashboard/:path*",
    "/patient-dashboard/:path*",
    "/diagnostic-dashboard/:path*",
    "/pharmacy-dashboard/:path*",
  ],
};
