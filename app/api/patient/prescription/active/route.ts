import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

// ── Time slots ────────────────────────────────────────────────────────────────
// Morning: 06:00 – 11:59
// Noon:    12:00 – 17:59
// Evening: 18:00 – 23:59
// (no slot) 00:00 – 05:59 → no popup (sleep hours)

type TimeSlot = "morning" | "noon" | "evening";

function getCurrentTimeSlot(hour: number): TimeSlot | null {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "noon";
  if (hour >= 18 && hour <= 23) return "evening";
  return null; // 00:00 – 05:59 — sleep hours, no reminder
}

// ── Frequency parser ─────────────────────────────────────────────────────────
// Understands formats like:
//   "1+0+1"      →  morning=1, noon=0, evening=1
//   "1+1+1"      →  morning=1, noon=1, evening=1
//   "Twice daily" / "BID" →  morning=1, noon=0, evening=1
//   "Once daily"  / "OD"  →  morning=1, noon=0, evening=0
//   "Three times" / "TID" →  morning=1, noon=1, evening=1
//   "Four times"  / "QID" →  morning=1, noon=1, evening=1
// Falls back to timesPerDay if frequency text is not recognized.

// Slot keys: morning | noon | evening
interface DoseSchedule {
  morning: number;
  noon: number;
  evening: number;
}

function parseFrequency(
  frequency: string | undefined,
  timesPerDay: number | undefined
): DoseSchedule {
  if (frequency) {
    const trimmed = frequency.trim();

    // "1+0+1" style (exactly 3 segments → morning + noon + evening)
    const plusMatch = trimmed.match(/^(\d+)\+(\d+)\+(\d+)$/);
    if (plusMatch) {
      return {
        morning: parseInt(plusMatch[1], 10),
        noon: parseInt(plusMatch[2], 10),
        evening: parseInt(plusMatch[3], 10),
      };
    }

    const lower = trimmed.toLowerCase();

    if (
      lower === "od" ||
      lower === "qd" ||
      lower.includes("once daily") ||
      lower.includes("once a day") ||
      lower.includes("1 time")
    ) {
      return { morning: 1, noon: 0, evening: 0 };
    }
    if (
      lower === "bid" ||
      lower === "bd" ||
      lower.includes("twice daily") ||
      lower.includes("twice a day") ||
      lower.includes("2 times")
    ) {
      return { morning: 1, noon: 0, evening: 1 };
    }
    if (
      lower === "tid" ||
      lower === "tds" ||
      lower.includes("three times") ||
      lower.includes("3 times")
    ) {
      return { morning: 1, noon: 1, evening: 1 };
    }
    if (
      lower === "qid" ||
      lower.includes("four times") ||
      lower.includes("4 times")
    ) {
      return { morning: 1, noon: 1, evening: 1 };
    }
  }

  // Fallback: use timesPerDay if available
  const tpd = timesPerDay;
  if (tpd !== undefined && tpd !== null) {
    if (tpd >= 3) return { morning: 1, noon: 1, evening: 1 };
    if (tpd === 2) return { morning: 1, noon: 0, evening: 1 };
    return { morning: 1, noon: 0, evening: 0 };
  }

  // No frequency info at all → assume active in ALL slots
  // (better to remind too often than to never remind)
  return { morning: 1, noon: 1, evening: 1 };
}

// ── Auth helper ───────────────────────────────────────────────────────────────
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
    include: { user: true },
  });

  if (!patient) {
    return { error: NextResponse.json({ error: "Patient not found" }, { status: 404 }) };
  }

  return { patient };
}

// ── GET handler ───────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { patient, error } = await getPatient(req);
    if (error) return error;

    // Fetch the most recent prescription
    const prescription = await prisma.prescription.findFirst({
      where: { patientId: patient!.id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!prescription) {
      return NextResponse.json({ prescription: null });
    }

    // Parse the medicines JSON
    let medicines: any[] = [];
    try {
      medicines =
        typeof prescription.medicines === "string"
          ? JSON.parse(prescription.medicines)
          : (prescription.medicines as any[]);
    } catch {
      medicines = [];
    }

    const prescriptionDate = new Date(prescription.createdAt);
    const now = new Date();

    // Days elapsed since prescription was written (calendar days, not hours)
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysElapsed = Math.floor(
      (now.getTime() - prescriptionDate.getTime()) / msPerDay
    );

    // Use the client's local hour (passed as ?hour=N) so timezone differences
    // between the server (UTC) and the patient's browser don't break slot detection.
    const paramHour = req.nextUrl.searchParams.get("hour");
    const currentHour =
      paramHour !== null ? parseInt(paramHour, 10) : new Date().getHours();
    const currentSlot = getCurrentTimeSlot(currentHour);

    // Sleep hours (00:00–05:59) → no popup
    if (!currentSlot) {
      return NextResponse.json({ prescription: null });
    }

    // ── Enrich each medicine ────────────────────────────────────────────────
    const enrichedMedicines = medicines.map((med: any) => {
      const durationDays =
        typeof med.durationDays === "number"
          ? med.durationDays
          : parseInt(String(med.durationDays ?? "0"), 10) || 0;

      // Course is expired when durationDays is set AND we've passed that many days
      const isExpired = durationDays > 0 && daysElapsed >= durationDays;
      const daysRemaining = durationDays > 0 ? Math.max(0, durationDays - daysElapsed) : null;

      // Determine dose schedule
      const schedule = parseFrequency(med.frequency, med.timesPerDay);

      // Does this medicine have a dose in the current time slot?
      const hasDoseNow =
        !isExpired &&
        schedule[currentSlot] > 0;

      return {
        ...med,
        durationDays,
        daysRemaining,
        isExpired,
        schedule,       // { morning, noon, evening }
        hasDoseNow,     // true only when a dose is due RIGHT NOW
      };
    });

    // Maximum duration across all medicines (to determine if the whole prescription is done)
    const maxDuration = medicines.reduce((max: number, med: any) => {
      const d =
        typeof med.durationDays === "number"
          ? med.durationDays
          : parseInt(String(med.durationDays ?? "0"), 10) || 0;
      return Math.max(max, d);
    }, 0);

    // ── Decide whether to show the popup ───────────────────────────────────
    // Rule 1: If ALL medicines with a set duration have expired → no popup
    const allExpired =
      maxDuration > 0 &&
      daysElapsed >= maxDuration;

    if (allExpired) {
      // Course is over — don't remind anymore
      return NextResponse.json({ prescription: null });
    }

    // Rule 2: No medicine has a dose in the current time slot → no popup
    const anyDoseNow = enrichedMedicines.some((m) => m.hasDoseNow);
    if (!anyDoseNow) {
      return NextResponse.json({ prescription: null });
    }

    // ── Return enriched prescription ────────────────────────────────────────
    return NextResponse.json({
      prescription: {
        id: prescription.id,
        diagnosis: prescription.diagnosis,
        createdAt: prescription.createdAt,
        doctor: {
          name: prescription.doctor.user.name,
          specialization: prescription.doctor.specialization,
        },
        medicines: enrichedMedicines,
        daysElapsed,
        maxDuration,
        currentSlot,
      },
    });
  } catch (err) {
    console.error("[GET /api/patient/prescription/active]", err);
    return NextResponse.json(
      { error: "Failed to fetch active prescription" },
      { status: 500 }
    );
  }
}
