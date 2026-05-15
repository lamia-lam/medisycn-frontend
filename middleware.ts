import { NextRequest, NextResponse } from "next/server";

// 🔐 Map routes → allowed roles
const protectedRoutes: Record<string, string[]> = {
  "/doctor-dashboard": ["DOCTOR"],
  "/patient-dashboard": ["PATIENT"],
  "/pharmacy-dashboard": ["PHARMACY"],
  "/diagnosis-dashboard": ["DIAGNOSTIC"],
};

//  Decode JWT
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

  // Skip public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  //  Check protected routes
  for (const route in protectedRoutes) {
    if (pathname.startsWith(route)) {
      const token = req.cookies.get("token")?.value;

      //  No token → login
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      //  Decode token
      const data = parseJwt(token);

      if (!data) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const userRole = data.role; // "DOCTOR"
      const allowedRoles = protectedRoutes[route];

      //  Role not allowed
      if (!allowedRoles.includes(userRole.toUpperCase())) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }

  return NextResponse.next();
}

//  Apply middleware only to protected routes
export const config = {
  matcher: [
    "/doctor-dashboard/:path*",
    "/patient-dashboard/:path*",
    "/pharmacy-dashboard/:path*",
    "/diagnosis-dashboard/:path*",
  ],
};
