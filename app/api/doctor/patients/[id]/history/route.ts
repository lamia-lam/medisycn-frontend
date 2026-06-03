import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDoctor } from "@/app/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { doctor, error } = await getDoctor(req);
    if (error) return error;

    const resolvedParams = await params;
    const patientId = parseInt(resolvedParams.id);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    // Fetch the patient with their user info
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch prescriptions for this patient ordered by newest first
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ patient, prescriptions });
  } catch (err) {
    console.error("[GET /api/doctor/patients/[id]/history]", err);
    return NextResponse.json(
      { error: "Failed to fetch patient history" },
      { status: 500 }
    );
  }
}
