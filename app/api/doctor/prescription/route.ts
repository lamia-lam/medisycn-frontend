import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────────────────────────────────────
// Helper – extract the verified doctor record from the JWT in the cookie.
// Returns { doctor } on success or a NextResponse error to return immediately.
// ─────────────────────────────────────────────────────────────────────────────
async function getDoctor(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader
    ?.split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  let decoded: { id: number; role: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      ),
    };
  }

  if (decoded.role !== "DOCTOR") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: decoded.id },
  });

  if (!doctor) {
    return {
      error: NextResponse.json({ error: "Doctor not found" }, { status: 404 }),
    };
  }

  return { doctor };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/doctor/prescription
//
// Body:
// {
//   patientId  : number,          // Patient.id (not User.id)
//   diagnosis  : string,
//   symptoms   : string,
//   medicines  : object[],        // JSON – stored as Json column
//   tests      : object[] | null, // optional – diagnostic tests ordered
//   notes      : string | null,
// }
//
// Logic:
//   1. Verify doctor JWT.
//   2. Confirm patient exists.
//   3. Check DoctorPatient relation – create it if this is the first prescription
//      between this doctor and patient (upsert-safe via createIfNotExists pattern).
//   4. Save the prescription.
//   5. Return the saved prescription.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { doctor, error } = await getDoctor(req);
    if (error) return error;

    const body = await req.json();
    const { patientId, diagnosis, symptoms, medicines, tests, notes } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!patientId || !diagnosis || !medicines) {
      return NextResponse.json(
        { error: "patientId, diagnosis, and medicines are required" },
        { status: 400 },
      );
    }

    // ── Confirm patient exists ────────────────────────────────────────────────
    const patient = await prisma.patient.findUnique({
      where: { id: Number(patientId) },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // ── Ensure DoctorPatient relation exists (create only if absent) ──────────
    const existingRelation = await prisma.doctorPatient.findUnique({
      where: {
        doctorId_patientId: {
          doctorId: doctor!.id,
          patientId: patient.id,
        },
      },
    });

    if (!existingRelation) {
      await prisma.doctorPatient.create({
        data: {
          doctorId: doctor!.id,
          patientId: patient.id,
        },
      });
    }

    // ── Save the prescription ─────────────────────────────────────────────────
    const prescription = await prisma.prescription.create({
      data: {
        doctorId: doctor!.id,
        patientId: patient.id,
        diagnosis: String(diagnosis),
        symptoms: symptoms ? String(symptoms) : null,
        medicines,                          // stored as Json
        tests: tests ?? null,              // stored as Json (nullable)
        notes: notes ? String(notes) : null,
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (err) {
    console.error("[POST /api/doctor/prescription]", err);
    return NextResponse.json(
      { error: "Failed to save prescription" },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/doctor/prescription
//
// Returns all prescriptions written by the authenticated doctor,
// newest first.
//
// Optional query params:
//   ?patientId=<number>   – filter to one patient
//   ?limit=<number>       – max records to return (default: 50)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { doctor, error } = await getDoctor(req);
    if (error) return error;

    const { searchParams } = req.nextUrl;
    const patientIdParam = searchParams.get("patientId");
    const limitParam = searchParams.get("limit");

    const limit = limitParam ? Math.min(parseInt(limitParam), 200) : 50;

    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctorId: doctor!.id,
        ...(patientIdParam && { patientId: parseInt(patientIdParam) }),
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const result = prescriptions.map((rx) => ({
      id: rx.id,
      diagnosis: rx.diagnosis,
      symptoms: rx.symptoms,
      medicines: rx.medicines,
      tests: rx.tests,
      notes: rx.notes,
      createdAt: rx.createdAt,
      patient: {
        id: rx.patient.id,
        name: rx.patient.user.name,
        email: rx.patient.user.email,
        phone: rx.patient.user.phone,
        age: rx.patient.age,
        gender: rx.patient.gender,
        bloodGroup: rx.patient.bloodGroup,
      },
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/doctor/prescription]", err);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 },
    );
  }
}
