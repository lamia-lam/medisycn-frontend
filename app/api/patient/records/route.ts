import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

/**
 * GET /api/patient/records
 * Returns all completed DiagnosticReport records for the logged-in patient.
 */
export async function GET(req: NextRequest) {
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

    // Get patient record
    const patient = await prisma.patient.findUnique({
      where: { userId: decoded.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch completed diagnostic reports
    const reports = await prisma.diagnosticReport.findMany({
      where: {
        patientId: patient.id,
        status: "Completed",
      },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with doctor info from prescription
    const enriched = await Promise.all(
      reports.map(async (report) => {
        let doctorName = "MediSync Diagnostics";
        let department = "Diagnostics";

        if (report.prescriptionId) {
          const rx = await prisma.prescription.findUnique({
            where: { id: report.prescriptionId },
            include: { doctor: { include: { user: true } } },
          });
          if (rx) {
            doctorName = rx.doctor.user.name;
            department = rx.doctor.department || rx.doctor.specialization || "General";
          }
        }

        return {
          id: report.id,
          testName: report.testName,
          testDate: report.createdAt.toISOString().split("T")[0],
          testTime: report.createdAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          doctor: doctorName,
          department,
          reportUrl: report.reportUrl,
          findings: report.findings,
          type: "Lab Report",
        };
      }),
    );

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("[GET /api/patient/records]", err);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 },
    );
  }
}
