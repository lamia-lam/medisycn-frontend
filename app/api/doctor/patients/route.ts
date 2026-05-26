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
  });

  if (!doctor) {
    return { error: NextResponse.json({ error: "Doctor not found" }, { status: 404 }) };
  }

  return { doctor };
}

export async function GET(req: NextRequest) {
  try {
    const { doctor, error } = await getDoctor(req);
    if (error) return error;

    // Return all patients so the doctor can prescribe to anyone in the system
    // (If it's a new interaction, POST /api/doctor/prescription will add the relation)
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(patients);
  } catch (err) {
    console.error("[GET /api/doctor/patients]", err);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
