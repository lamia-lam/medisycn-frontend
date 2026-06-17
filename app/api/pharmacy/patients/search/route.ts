import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getPharmacy } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const phone = req.nextUrl.searchParams.get("phone")?.trim() ?? "";

    if (!phone) {
      return NextResponse.json(
        { error: "Patient phone number is required" },
        { status: 400 },
      );
    }

    const normalizedPhone = phone.replace(/\D/g, "");

    const users = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        OR: [
          { phone: { contains: phone, mode: "insensitive" } },
          ...(normalizedPhone
            ? [
                {
                  phone: {
                    contains: normalizedPhone,
                    mode: "insensitive" as const,
                  },
                },
              ]
            : []),
        ],
      },
      include: {
        patient: {
          include: {
            prescriptions: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                doctor: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
              },
            },
            doctors: {
              orderBy: { lastVisit: "desc" },
              take: 1,
              include: {
                doctor: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
              },
            },
            _count: {
              select: { prescriptions: true },
            },
          },
        },
      },
    });

    const patients = users
      .filter((u) => u.patient)
      .map((u) => {
        const p = u.patient!;
        const initials =
          u.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "??";

        const latestPrescriptionDoctor =
          p.prescriptions[0]?.doctor.user.name ?? null;
        const linkedDoctor = p.doctors[0]?.doctor.user.name ?? null;
        const doctorName = latestPrescriptionDoctor ?? linkedDoctor ?? "—";

        const lastVisitDate =
          p.doctors[0]?.lastVisit ??
          p.prescriptions[0]?.createdAt ??
          p.createdAt;

        return {
          id: p.id,
          displayId: `P${String(p.id).padStart(3, "0")}`,
          name: u.name,
          initials,
          age: p.age,
          gender: p.gender,
          bloodGroup: p.bloodGroup,
          doctorName,
          lastVisit: lastVisitDate.toISOString().split("T")[0],
          totalPrescriptions: p._count.prescriptions,
        };
      });

    return NextResponse.json({ patients });
  } catch (err) {
    console.error("[GET /api/pharmacy/patients/search]", err);
    return NextResponse.json(
      { error: "Failed to search patients" },
      { status: 500 },
    );
  }
}
