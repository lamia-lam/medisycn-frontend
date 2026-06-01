import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDoctor } from "@/app/lib/auth";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/doctor/patients/my-patients
// Returns only the patients linked to the logged-in doctor via DoctorPatient,
// sorted by most recent visit.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { doctor, error } = await getDoctor(req);
    if (error) return error;

    const relations = await prisma.doctorPatient.findMany({
      where: { doctorId: doctor!.id },
      include: {
        patient: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { lastVisit: "desc" },
    });

    const avatarColors = [
      "bg-cyan-100 text-cyan-700",
      "bg-purple-100 text-purple-700",
      "bg-green-100 text-green-700",
      "bg-orange-100 text-orange-700",
      "bg-pink-100 text-pink-700",
      "bg-blue-100 text-blue-700",
    ];

    const patients = relations.map((rel) => {
      const p = rel.patient;
      const u = p.user;

      const initials =
        u.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "XX";

      const avatarColor = avatarColors[p.id % avatarColors.length];

      return {
        id: `P${String(p.id).padStart(3, "0")}`,
        dbId: p.id,
        name: u.name,
        age: p.age,
        gender: p.gender,
        phone: u.phone,
        condition: p.condition || "Not specified",
        lastVisit: rel.lastVisit.toISOString().split("T")[0],
        status: p.status,
        initials,
        avatarColor,
      };
    });

    return NextResponse.json(patients);
  } catch (err) {
    console.error("[GET /api/doctor/patients/my-patients]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
