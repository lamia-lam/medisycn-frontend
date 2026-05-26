import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

async function getDoctor(req: NextRequest) {
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

  if (decoded.role !== "DOCTOR") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: decoded.id },
    include: {
      user: true,
    }
  });

  if (!doctor) {
    return { error: NextResponse.json({ error: "Doctor not found" }, { status: 404 }) };
  }

  return { doctor };
}

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
