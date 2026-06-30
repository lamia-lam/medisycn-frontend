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
      where: { patientId, doctorId: doctor!.id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch diagnostic reports for this patient
    const reports = await prisma.diagnosticReport.findMany({
      where: { patientId },
    });

    // Attach reports to prescriptions
    const prescriptionsWithReports = prescriptions.map((rx) => {
      const rxReports = reports.filter((r) => r.prescriptionId === rx.id);
      return {
        ...rx,
        reports: rxReports,
      };
    });

    return NextResponse.json({ patient, prescriptions: prescriptionsWithReports });
  } catch (err) {
    console.error("[GET /api/doctor/patients/[id]/history]", err);
    return NextResponse.json(
      { error: "Failed to fetch patient history" },
      { status: 500 }
    );
  }
}
