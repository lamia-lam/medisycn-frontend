import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function getUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;
  return { userId: parseInt(userId) };
}

// ─────────────────────────────────────────────
// GET /api/patient/appointments
// Patient sees all their appointments + status
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = getUser(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // find this patient's profile row using their userId
    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        // bring doctor name and specialization
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // shape the data cleanly for the frontend
    const result = appointments.map((a) => ({
      id: a.id,
      date: a.date,
      type: a.type,
      notes: a.notes,
      status: a.status, // Pending / Confirmed / Cancelled
      serialNo: a.serialNo,
      doctorName: a.doctor.user.name,
      doctorSpecialization: a.doctor.specialization,
      createdAt: a.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch patient appointments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// POST /api/patient/appointments
// Patient requests a new appointment
// body: { doctorId, date, type, notes }
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = getUser(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.userId },
  });
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const { doctorId, date, type, notes } = await req.json();

  if (!doctorId || !date) {
    return NextResponse.json(
      { error: "doctorId and date are required" },
      { status: 400 },
    );
  }

  // create the appointment — always starts as Pending
  const appointment = await prisma.appointment.create({
    data: {
      doctorId: parseInt(doctorId),
      patientId: patient.id,
      date: new Date(date),
      type: type ?? "In-Person",
      notes: notes ?? null,
      status: "Pending",
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}

// ─────────────────────────────────────────────
// PATCH /api/patient/appointments
// Patient can only cancel their own pending appointment
// body: { appointmentId, action: "cancel" }
// ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = getUser(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointmentId, action } = await req.json();

  if (action !== "cancel") {
    return NextResponse.json(
      { error: "Patients can only cancel appointments" },
      { status: 400 },
    );
  }

  if (!appointmentId) {
    return NextResponse.json(
      { error: "appointmentId is required" },
      { status: 400 },
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.userId },
  });
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  // make sure this appointment actually belongs to this patient
  // prevents one patient from cancelling another patient's appointment
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patientId: patient.id,
    },
  });

  if (!appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 },
    );
  }

  // only Pending appointments can be cancelled
  if (appointment.status !== "Pending") {
    return NextResponse.json(
      { error: "Only pending appointments can be cancelled" },
      { status: 400 },
    );
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "Cancelled" },
  });

  return NextResponse.json(updated);
}
