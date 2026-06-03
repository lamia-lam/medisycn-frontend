import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDoctor } from "@/app/lib/auth";
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

export async function POST(req: NextRequest) {
  try {
    const { doctor, error } = await getDoctor(req);
    if (error) return error;

    const body = await req.json();
    const { name, phone, age, gender, dateOfBirth } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    let patient;

    // Check if phone already exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      include: { patient: true },
    });

    if (existingUser) {
      if (!existingUser.patient) {
        // User exists but is not a patient, so create patient record
        patient = await prisma.patient.create({
          data: {
            userId: existingUser.id,
            age: age ? parseInt(age) : null,
            gender: gender || null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            status: "Active",
          },
        });
      } else {
        patient = existingUser.patient;
      }
    } else {
      const newUser = await prisma.user.create({
        data: {
          name,
          phone,
          role: "PATIENT",
          isOffline: true,
          patient: {
            create: {
              age: age ? parseInt(age) : null,
              gender: gender || null,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              status: "Active",
            },
          },
        },
        include: { patient: true },
      });
      patient = newUser.patient!;
    }

    // Ensure DoctorPatient relation exists
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

    // Return the new patient in the format expected by the frontend
    const patientData = await prisma.patient.findUnique({
      where: { id: patient.id },
      include: {
        user: { select: { name: true, phone: true } },
      },
    });

    return NextResponse.json(patientData, { status: 201 });
  } catch (err) {
    console.error("[POST /api/doctor/patients]", err);
    return NextResponse.json(
      { error: "Failed to register patient" },
      { status: 500 }
    );
  }
}

