import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getPharmacy } from "@/app/lib/auth";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  );
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
    const status = searchParams.get("status") ?? "all";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50),
    );

    const records = await prisma.dispenseRecord.findMany({
      orderBy: { dispensedAt: "desc" },
      include: {
        prescription: { select: { id: true, createdAt: true } },
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    const formatted = records.map((record) => {
      const patientName = record.patient.user.name;
      const displayId = `RX-${String(record.prescription.id).padStart(3, "0")}`;

      return {
        id: record.id,
        prescriptionId: displayId,
        patientName,
        initials: getInitials(patientName),
        prescriptionDate: record.prescription.createdAt.toISOString().split("T")[0],
        processedDate: record.dispensedAt.toISOString().split("T")[0],
        medicinesDispensed: record.medicinesDispensed,
        status: record.status,
      };
    });

    const filtered = formatted.filter((record) => {
      const matchesSearch =
        !search ||
        record.patientName.toLowerCase().includes(search) ||
        record.prescriptionId.toLowerCase().includes(search);
      const matchesStatus =
        status === "all" || record.status.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({
      records: paginated,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("[GET /api/pharmacy/history]", err);
    return NextResponse.json(
      { error: "Failed to fetch dispensing history" },
      { status: 500 },
    );
  }
}
