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
          lte: todayEnd,
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
    if (doctor!.availability) {
      try {
        doctorSchedule =
          typeof doctor!.availability === "string"
            ? JSON.parse(doctor!.availability)
            : (doctor!.availability as any);
        if (!Array.isArray(doctorSchedule)) {
          doctorSchedule = [];
        }
      } catch (e) {
        doctorSchedule = [];
      }
    }

    const formattedAppointments = appointments.map((apt) => {
      const aptDate = new Date(apt.date);
      // Weekday name of the appointment (e.g. "Monday", "Saturday")
      const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(aptDate);

      // Match doctor's assigned availability schedule from their profile for this weekday
      const matchingSchedule = doctorSchedule.filter(
        (s) => s.day && s.day.toLowerCase() === dayName.toLowerCase()
      );

      let timeStr = "";

      if (matchingSchedule.length > 0) {
        const timeBlocks = matchingSchedule
          .map((s) => {
            if (s.start && s.end) {
              return `${format12Hour(s.start)} - ${format12Hour(s.end)}`;
            } else if (s.start) {
              return format12Hour(s.start);
            }
            return "";
          })
          .filter(Boolean);

        timeStr = timeBlocks.join(", ");
      }

      // If doctor hasn't assigned time for this specific day, fallback to first available schedule or standard hours
      if (!timeStr) {
        if (doctorSchedule.length > 0) {
          const first = doctorSchedule[0];
          if (first?.start && first?.end) {
            timeStr = `${format12Hour(first.start)} - ${format12Hour(first.end)}`;
          } else if (first?.start) {
            timeStr = format12Hour(first.start);
          }
        }
      }

      if (!timeStr) {
        if (aptDate.getHours() !== 0 || aptDate.getMinutes() !== 0) {
          timeStr = aptDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        } else {
          timeStr = "09:00 AM - 05:00 PM";
        }
      }

      return {
        id: apt.id,
        patient: apt.patient.user.name,
        time: timeStr,
        type: apt.type || "Consultation",
        status: apt.status,
      };
    });

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
