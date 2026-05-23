import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function getUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;
  return { userId: parseInt(userId) };
}

// ─────────────────────────────────────────────
// GET /api/doctor/appointments?status=Pending
// Doctor sees their appointments filtered by status
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = getUser(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.userId },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  // ?status=Pending or ?status=Confirmed etc — optional filter
  const status = req.nextUrl.searchParams.get("status");

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      ...(status && { status }),
    },
    include: {
      patient: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const result = appointments.map((a) => ({
    id: a.id,
    date: a.date,
    type: a.type,
    notes: a.notes,
    status: a.status,
    rescheduleDate: a.rescheduleDate,
    rescheduleNote: a.rescheduleNote,
    patientId: a.patient.id,
    patientName: a.patient.user.name,
    patientPhone: a.patient.user.phone,
    patientGender: a.patient.gender,
    patientBloodGroup: a.patient.bloodGroup,
    createdAt: a.createdAt,
  }));

  return NextResponse.json(result);
}

// ─────────────────────────────────────────────
// PATCH /api/doctor/appointments
// Doctor accepts, cancels or reschedules
// body: { appointmentId, action, rescheduleDate?, rescheduleNote? }
// action = "accept" | "cancel" | "reschedule"
// ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = getUser(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.userId },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  const { appointmentId, action, rescheduleDate, rescheduleNote } =
    await req.json();

  if (!appointmentId || !action) {
    return NextResponse.json(
      { error: "appointmentId and action are required" },
      { status: 400 },
    );
  }

  // make sure this appointment actually belongs to this doctor
  // prevents a doctor from modifying another doctor's appointments
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId: doctor.id },
  });

  if (!appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 },
    );
  }

  // map the plain action word to a status string
  const statusMap: Record<string, string> = {
    accept: "Confirmed",
    cancel: "Cancelled",
    reschedule: "Rescheduled",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json(
      { error: "action must be: accept | cancel | reschedule" },
      { status: 400 },
    );
  }

  // reschedule needs a new date
  if (action === "reschedule" && !rescheduleDate) {
    return NextResponse.json(
      { error: "rescheduleDate is required when action is reschedule" },
      { status: 400 },
    );
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: newStatus,
      // only set these fields when rescheduling
      ...(action === "reschedule" && {
        rescheduleDate: new Date(rescheduleDate),
        rescheduleNote: rescheduleNote ?? null,
      }),
    },
  });

  return NextResponse.json(updated);
}
