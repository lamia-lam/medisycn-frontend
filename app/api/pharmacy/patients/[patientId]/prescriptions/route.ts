import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getPharmacy } from "@/app/lib/auth";

type RouteContext = { params: Promise<{ patientId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const { patientId: patientIdParam } = await context.params;
    const patientId = parseInt(patientIdParam, 10);

    if (isNaN(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: { select: { name: true } },
        prescriptions: {
          orderBy: { createdAt: "desc" },
          include: {
            doctor: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const initials =
      patient.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??";

    const prescriptions = patient.prescriptions.map((rx) => ({
      id: rx.id,
      displayId: `RX-${String(rx.id).padStart(3, "0")}`,
      doctorName: rx.doctor.user.name,
      department: rx.doctor.department ?? rx.doctor.specialization ?? "—",
      date: rx.createdAt.toISOString().split("T")[0],
      diagnosis: rx.diagnosis,
      status: "Pending",
    }));

    return NextResponse.json({
      patient: {
        id: patient.id,
        displayId: `P${String(patient.id).padStart(3, "0")}`,
        name: patient.user.name,
        initials,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
      },
      prescriptions,
    });
  } catch (err) {
    console.error("[GET /api/pharmacy/patients/[patientId]/prescriptions]", err);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 },
    );
  }
}
