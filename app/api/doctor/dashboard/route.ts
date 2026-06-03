import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDoctor } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { doctor, error } = await getDoctor(req);
    if (error) return error;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Stats
    const totalPatients = await prisma.doctorPatient.count({
      where: { doctorId: doctor!.id },
    });

    const todaysAppointmentsCount = await prisma.appointment.count({
      where: {
        doctorId: doctor!.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const totalPrescriptions = await prisma.prescription.count({
      where: { doctorId: doctor!.id },
    });

    // 2. Today's Appointments (limit 5)
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor!.id,
        date: {
          gte: todayStart,
        },
      },
      orderBy: { date: "asc" },
      take: 5,
      include: {
        patient: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    const formattedAppointments = appointments.map((apt) => ({
      id: apt.id,
      patient: apt.patient.user.name,
      time: new Date(apt.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: apt.type || "Consultation",
      status: apt.status,
    }));

    // 3. Recent Patients (limit 5)
    const recentPatients = await prisma.doctorPatient.findMany({
      where: { doctorId: doctor!.id },
      orderBy: { lastVisit: "desc" },
      take: 5,
      include: {
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    const formattedRecentPatients = recentPatients.map((dp) => ({
      id: dp.patient.id,
      name: dp.patient.user.name,
      lastVisit: dp.lastVisit.toISOString().split("T")[0],
    }));

    return NextResponse.json({
      doctorName: doctor!.user.name,
      stats: {
        totalPatients,
        todaysAppointments: todaysAppointmentsCount,
        totalPrescriptions,
      },
      appointments: formattedAppointments,
      recentPatients: formattedRecentPatients,
    });
  } catch (err) {
    console.error("[GET /api/doctor/dashboard]", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
