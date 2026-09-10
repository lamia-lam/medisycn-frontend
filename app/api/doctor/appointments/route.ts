import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function getUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;
  return { userId: parseInt(userId) };
}

// ─────────────────────────────────────────────
// GET /api/doctor/appointments
// Doctor sees all their appointments
// Optional: ?status=Pending | Confirmed | Cancelled
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
    orderBy: { createdAt: "desc" },
  });

  const format12Hour = (time24: string) => {
    if (!time24) return "";
    const [h, m = "00"] = time24.split(":");
    const hours = parseInt(h, 10);
    if (isNaN(hours)) return time24;
    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${m.padStart(2, "0")} ${suffix}`;
  };

  let doctorSchedule: Array<{ day: string; start: string; end: string }> = [];
  if (doctor.availability) {
    try {
      doctorSchedule =
        typeof doctor.availability === "string"
          ? JSON.parse(doctor.availability)
          : (doctor.availability as any);
      if (!Array.isArray(doctorSchedule)) {
        doctorSchedule = [];
      }
    } catch (e) {
      doctorSchedule = [];
    }
  }

  const result = appointments.map((a) => {
    const aptDate = new Date(a.date);
    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(aptDate);
    const matchingSchedule = doctorSchedule.filter(
      (s) => s.day && s.day.toLowerCase() === dayName.toLowerCase()
    );

    let timeSlot = "";
    if (matchingSchedule.length > 0) {
      timeSlot = matchingSchedule
        .map((s) => (s.start && s.end ? `${format12Hour(s.start)} - ${format12Hour(s.end)}` : format12Hour(s.start)))
        .filter(Boolean)
        .join(", ");
    }
    if (!timeSlot && (aptDate.getHours() !== 0 || aptDate.getMinutes() !== 0)) {
      timeSlot = aptDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }

    return {
      id: a.id,
      date: a.date,
      timeSlot: timeSlot || "—",
      type: a.type,
      notes: a.notes,
      status: a.status,
      serialNo: a.serialNo,
      patientId: a.patient.id,
      patientName: a.patient.user.name,
      patientPhone: a.patient.user.phone,
      patientGender: a.patient.gender,
      patientBloodGroup: a.patient.bloodGroup,
      createdAt: a.createdAt,
    };
  });

  return NextResponse.json(result);
}

// ─────────────────────────────────────────────
// PATCH /api/doctor/appointments
// Doctor confirms or cancels an appointment
// body: { appointmentId, action: "accept" | "cancel" }
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

  const { appointmentId, action } = await req.json();

  if (!appointmentId || !action) {
    return NextResponse.json(
      { error: "appointmentId and action are required" },
      { status: 400 },
    );
  }

  if (!["accept", "cancel"].includes(action)) {
    return NextResponse.json(
      { error: "action must be: accept | cancel" },
      { status: 400 },
    );
  }

  // Ensure this appointment belongs to this doctor
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId: doctor.id },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  // Only Pending appointments can be acted on
  if (appointment.status !== "Pending") {
    return NextResponse.json(
      { error: "Only pending appointments can be confirmed or cancelled" },
      { status: 400 },
    );
  }

  const newStatus = action === "accept" ? "Confirmed" : "Cancelled";

  let serialNo = null;
  if (action === "accept") {
    // Generate serialNo for the given date and doctor
    const startOfDay = new Date(appointment.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(appointment.date);
    endOfDay.setHours(23, 59, 59, 999);

    const maxAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "Confirmed",
      },
      orderBy: {
        serialNo: "desc",
      },
    });

    serialNo = (maxAppointment?.serialNo || 0) + 1;
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { 
      status: newStatus,
      ...(serialNo !== null && { serialNo }),
    },
  });

  return NextResponse.json(updated);
}
