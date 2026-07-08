import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDiagnostic } from "@/app/lib/auth";

/**
 * POST /api/diagnostic/test-requests/start
 * Body: { prescriptionId: number, testIndex: number, testName: string, patientId: number }
 *
 * Creates a DiagnosticReport with status "In_Progress" so the test
 * appears in the Upload Reports page.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getDiagnostic(req);
    if (error) return error;

    const body = await req.json();
    const { prescriptionId, testIndex, testName, patientId } = body;

    if (!prescriptionId || testIndex === undefined || !testName || !patientId) {
      return NextResponse.json(
        { error: "prescriptionId, testIndex, testName, and patientId are required" },
        { status: 400 },
      );
    }

    // Check whether this test is already started/completed
    const existing = await prisma.diagnosticReport.findFirst({
      where: {
        prescriptionId: Number(prescriptionId),
        testIndex: Number(testIndex),
        patientId: Number(patientId),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Test already started" },
        { status: 409 },
      );
    }

    const report = await prisma.diagnosticReport.create({
      data: {
        patientId: Number(patientId),
        prescriptionId: Number(prescriptionId),
        testIndex: Number(testIndex),
        testName: String(testName),
        findings: "",
        status: "In_Progress",
      },
    });

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (err) {
    console.error("[POST /api/diagnostic/test-requests/start]", err);
    return NextResponse.json(
      { error: "Failed to start test" },
      { status: 500 },
    );
  }
}
