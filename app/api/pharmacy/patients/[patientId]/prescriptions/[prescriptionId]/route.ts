import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getPharmacy } from "@/app/lib/auth";

type RouteContext = {
  params: Promise<{ patientId: string; prescriptionId: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const { patientId: patientIdParam, prescriptionId: prescriptionIdParam } =
      await context.params;

    const patientId = parseInt(patientIdParam, 10);
    const prescriptionId = parseInt(prescriptionIdParam, 10);

    if (isNaN(patientId) || isNaN(prescriptionId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        patientId,
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: prescription.id,
      displayId: `RX-${String(prescription.id).padStart(3, "0")}`,
      date: prescription.createdAt.toISOString().split("T")[0],
      diagnosis: prescription.diagnosis,
      symptoms: prescription.symptoms,
      medicines: prescription.medicines ?? [],
      tests: prescription.tests ?? [],
      notes: prescription.notes,
      patient: {
        ref: `P${String(patientId).padStart(3, "0")}`,
        name: prescription.patient.user.name,
        age: prescription.patient.age,
        gender: prescription.patient.gender,
        bloodGroup: prescription.patient.bloodGroup,
      },
      doctor: {
        name: prescription.doctor.user.name,
        specialization: prescription.doctor.specialization,
        department: prescription.doctor.department,
        license: prescription.doctor.license,
      },
    });
  } catch (err) {
    console.error(
      "[GET /api/pharmacy/patients/[patientId]/prescriptions/[prescriptionId]]",
      err,
    );
    return NextResponse.json(
      { error: "Failed to fetch prescription" },
      { status: 500 },
    );
  }
}
