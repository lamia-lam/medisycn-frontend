import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";

// ─────────────────────────────────────────────
// GET /api/auth/me
// Returns the logged-in user's profile.
// Used by the booking page to show the patient
// info banner (name, phone, age, gender, blood group).
// Reads the JWT from the cookie (same pattern as
// the doctor profile route).
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };

    // Fetch user + patient sub-profile in one query
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
