import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDoctor } from "@/app/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { doctor, error } = await getDoctor(req);
    if (error) return error;

    const resolvedParams = await params;
    const prescriptionId = parseInt(resolvedParams.id);
    
    if (isNaN(prescriptionId)) {
       return NextResponse.json({ error: "Invalid prescription ID" }, { status: 400 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: {
        id: prescriptionId,
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!prescription) {
        return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }
    
    if (prescription.doctorId !== doctor!.id) {
        return NextResponse.json({ error: "Unauthorized access to this prescription" }, { status: 403 });
    }

    const result = {
      id: prescription.id,
      diagnosis: prescription.diagnosis,
      symptoms: prescription.symptoms,
      medicines: prescription.medicines,
      tests: prescription.tests,
      notes: prescription.notes,
      createdAt: prescription.createdAt,
      doctor: {
          name: doctor!.user.name,
          specialization: doctor!.specialization,
          license: doctor!.license,
          phone: doctor!.user.phone
      },
      patient: {
        id: prescription.patient.id,
        name: prescription.patient.user.name,
        email: prescription.patient.user.email,
        phone: prescription.patient.user.phone,
        age: prescription.patient.age,
        gender: prescription.patient.gender,
        bloodGroup: prescription.patient.bloodGroup,
        address: prescription.patient.address
      },
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/doctor/prescription/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch prescription details" },
      { status: 500 }
    );
  }
}
