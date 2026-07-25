import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAdmin(req);
    if (auth.error) return auth.error;

    const [
      totalPatients,
      totalDoctors,
      totalPharmacies,
      totalDiagnostics,
      pendingApprovals,
      totalAppointments,
      totalPrescriptions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.user.count({ where: { role: "DOCTOR" } }),
      prisma.user.count({ where: { role: "PHARMACY" } }),
      prisma.user.count({ where: { role: "DIAGNOSTIC" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.appointment.count(),
      prisma.prescription.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalPharmacies,
        totalDiagnostics,
        pendingApprovals,
        totalAppointments,
        totalPrescriptions,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
