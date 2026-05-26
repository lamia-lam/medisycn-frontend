import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

async function getPatient(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader
    ?.split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  let decoded: { id: number; role: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }

  if (decoded.role !== "PATIENT") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: decoded.id },
    include: {
      user: true,
    }
  });

  if (!patient) {
    return { error: NextResponse.json({ error: "Patient not found" }, { status: 404 }) };
  }

  return { patient };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { patient, error } = await getPatient(req);
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
        doctor: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!prescription) {
        return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }
    
    if (prescription.patientId !== patient!.id) {
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
          name: prescription.doctor.user.name,
          specialization: prescription.doctor.specialization,
          license: prescription.doctor.license,
          phone: prescription.doctor.user.phone
      },
      patient: {
        id: patient!.id,
        name: patient!.user.name,
        email: patient!.user.email,
        phone: patient!.user.phone,
        age: patient!.age,
        gender: patient!.gender,
        bloodGroup: patient!.bloodGroup,
        address: patient!.address
      },
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/patient/prescription/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch prescription details" },
      { status: 500 }
    );
  }
}
