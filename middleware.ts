import { NextRequest, NextResponse } from "next/server";

// 🔐 Map page routes → allowed roles
const protectedRoutes: Record<string, string[]> = {
  "/doctor-dashboard": ["DOCTOR"],
  "/patient-dashboard": ["PATIENT"],
  "/pharmacy-dashboard": ["PHARMACY"],
  "/diagnosis-dashboard": ["DIAGNOSTIC"],
};

// Decode JWT payload without verifying signature (Edge-safe)
function parseJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Skip fully public routes ────────────────────────────
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  // ── Inject x-user-id for protected API routes ───────────
  // /api/patient/* and /api/doctor/* both read x-user-id to
  // identify the caller without a full JWT verify in each handler.
  if (
    pathname.startsWith("/api/patient") ||
    pathname.startsWith("/api/doctor")
  ) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = parseJwt(token);
    if (!data?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Forward the request with the extra header
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(data.id));
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Page-level role guard ───────────────────────────────
  for (const route in protectedRoutes) {
    if (pathname.startsWith(route)) {
      const token = req.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      const data = parseJwt(token);
      if (!data) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      const allowedRoles = protectedRoutes[route];
      if (!allowedRoles.includes((data.role as string).toUpperCase())) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Page guards
    "/doctor-dashboard/:path*",
    "/patient-dashboard/:path*",
    "/pharmacy-dashboard/:path*",
    "/diagnosis-dashboard/:path*",
    // API auth injection
    "/api/patient/:path*",
    "/api/doctor/:path*",
  ],
};
