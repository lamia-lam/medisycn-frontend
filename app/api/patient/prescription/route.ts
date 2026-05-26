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

export async function GET(req: NextRequest) {
  try {
    const { patient, error } = await getPatient(req);
    if (error) return error;

    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId: patient!.id,
      },
      include: {
        doctor: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = prescriptions.map((rx) => ({
      id: rx.id,
      diagnosis: rx.diagnosis,
      symptoms: rx.symptoms,
      medicines: rx.medicines,
      tests: rx.tests,
      notes: rx.notes,
      createdAt: rx.createdAt,
      doctor: {
        id: rx.doctor.id,
        name: rx.doctor.user.name,
        specialization: rx.doctor.specialization,
        license: rx.doctor.license,
        phone: rx.doctor.user.phone,
      },
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/patient/prescription]", err);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}
