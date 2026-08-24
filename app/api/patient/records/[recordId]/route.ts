import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

/**
 * GET /api/patient/records/[recordId]
 * Returns a single completed DiagnosticReport for the logged-in patient.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };

    if (decoded.role !== "PATIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: decoded.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const report = await prisma.diagnosticReport.findFirst({
      where: {
        id: Number(params.recordId),
        patientId: patient.id,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Enrich with patient & doctor info
    const patientWithUser = await prisma.patient.findUnique({
      where: { id: patient.id },
      include: { user: true },
    });

    let doctorName = "MediSync Diagnostics";
    let department = "Diagnostics";
    let reportedBy = "MediSync Diagnostics Lab";

    if (report.prescriptionId) {
      const rx = await prisma.prescription.findUnique({
        where: { id: report.prescriptionId },
        include: { doctor: { include: { user: true } } },
      });
      if (rx) {
        doctorName = rx.doctor.user.name;
        department =
          rx.doctor.department || rx.doctor.specialization || "General";
        reportedBy = rx.doctor.user.name;
      }
    }

    return NextResponse.json({
      id: report.id,
      testName: report.testName,
      testDate: report.createdAt.toISOString().split("T")[0],
      testTime: report.createdAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "Lab Report",
      doctor: doctorName,
      department,
      reportedBy,
      findings: report.findings || "",
      reportUrl: report.reportUrl || null,
      status: report.status,
      patient: {
        name: patientWithUser?.user.name || "—",
        id: `P${String(patient.id).padStart(4, "0")}`,
        age: patientWithUser ? (patientWithUser as any).age ?? "—" : "—",
        gender: patientWithUser ? (patientWithUser as any).gender ?? "—" : "—",
      },
    });
  } catch (err) {
    console.error("[GET /api/patient/records/[recordId]]", err);
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    );
  }
}
