import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDiagnostic } from "@/app/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * GET /api/diagnostic/upload-reports
 * Returns all DiagnosticReport records with status "In_Progress" or "Completed"
 * so the Upload Reports page can display them.
 */
export async function GET(req: NextRequest) {
  try {
    const { error } = await getDiagnostic(req);
    if (error) return error;

    const reports = await prisma.diagnosticReport.findMany({
      where: {
        status: { in: ["In_Progress", "Completed"] },
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with prescription/doctor info
    const enriched = await Promise.all(
      reports.map(async (report) => {
        let doctorName = "Unknown Doctor";
        let department = "General";
        let requestedDate = report.createdAt.toISOString().split("T")[0];
        let priority = "Normal";

        if (report.prescriptionId) {
          const rx = await prisma.prescription.findUnique({
            where: { id: report.prescriptionId },
            include: { doctor: { include: { user: true } } },
          });
          if (rx) {
            doctorName = rx.doctor.user.name;
            department = rx.doctor.department || "General";
            requestedDate = rx.createdAt.toISOString().split("T")[0];

            // Try to get priority from the tests JSON
            try {
              let testsArr: any[] = [];
              if (typeof rx.tests === "string") testsArr = JSON.parse(rx.tests);
              else if (Array.isArray(rx.tests)) testsArr = rx.tests;
              const t = testsArr[report.testIndex];
              if (t?.urgency === "Urgent") priority = "Urgent";
            } catch {
              // ignore parse errors
            }
          }
        }

        return {
          id: report.id,
          patient: report.patient.user.name,
          patientId: report.patientId,
          test: report.testName,
          doctor: doctorName,
          department,
          requestedDate,
          priority,
          status: report.status,
          reportUrl: report.reportUrl || null,
          prescriptionId: report.prescriptionId,
          testIndex: report.testIndex,
        };
      }),
    );

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("[GET /api/diagnostic/upload-reports]", err);
    return NextResponse.json(
      { error: "Failed to fetch upload reports" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/diagnostic/upload-reports
 * Multipart form: reportId (number), file (PDF)
 * Saves the PDF to /public/reports/ and marks the DiagnosticReport as "Completed".
 */
export async function POST(req: NextRequest) {
  try {
    const { error } = await getDiagnostic(req);
    if (error) return error;

    const formData = await req.formData();
    const reportId = formData.get("reportId");
    const file = formData.get("file") as File | null;

    if (!reportId || !file) {
      return NextResponse.json(
        { error: "reportId and file are required" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 },
      );
    }

    // Save file to /public/reports/<reportId>-<timestamp>.pdf
    const reportsDir = path.join(process.cwd(), "public", "reports");
    await mkdir(reportsDir, { recursive: true });

    const fileName = `report-${reportId}-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const reportUrl = `/reports/${fileName}`;

    // Mark as Completed
    const updated = await prisma.diagnosticReport.update({
      where: { id: Number(reportId) },
      data: {
        status: "Completed",
        reportUrl,
        findings: `Report uploaded on ${new Date().toLocaleDateString()}`,
      },
    });

    return NextResponse.json({ success: true, reportUrl, id: updated.id });
  } catch (err) {
    console.error("[POST /api/diagnostic/upload-reports]", err);
    return NextResponse.json(
      { error: "Failed to upload report" },
      { status: 500 },
    );
  }
}
