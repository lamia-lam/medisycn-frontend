import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// ─────────────────────────────────────────────
// GET /api/doctor/list
// Public — returns every doctor so the booking
// page can build the department + doctor dropdowns.
// ─────────────────────────────────────────────
export async function GET() {
  const doctors = await prisma.doctor.findMany({
    select: {
      id: true,
      specialization: true,
      department: true,
      designation: true,
      user: {
        select: { name: true },
      },
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(doctors);
}
