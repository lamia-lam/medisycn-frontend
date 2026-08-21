import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDoctor } from "@/app/lib/auth";

export async function DELETE(
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

    // Remove the DoctorPatient relationship (does NOT delete the patient record itself)
    const existing = await prisma.doctorPatient.findUnique({
      where: {
        doctorId_patientId: {
          doctorId: doctor!.id,
          patientId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Patient not found in your list" },
        { status: 404 }
      );
    }

    await prisma.doctorPatient.delete({
      where: {
        doctorId_patientId: {
          doctorId: doctor!.id,
          patientId,
        },
      },
    });

    return NextResponse.json({ message: "Patient removed from your list" });
  } catch (err) {
    console.error("[DELETE /api/doctor/patients/[id]]", err);
    return NextResponse.json(
      { error: "Failed to remove patient" },
      { status: 500 }
    );
  }
}
