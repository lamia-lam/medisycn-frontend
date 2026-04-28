import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const role = request.cookies.get("role")?.value?.toLowerCase();
  const path = request.nextUrl.pathname;

  if (path.startsWith("/doctor-dashboard") && role !== "doctor") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/patient-dashboard") && role !== "patient") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor-dashboard/:path*", "/patient-dashboard/:path*"],
};
