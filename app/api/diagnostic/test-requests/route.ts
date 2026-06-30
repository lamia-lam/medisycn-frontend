import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDiagnostic } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getDiagnostic(req);
    if (error) return error;

    const { searchParams } = req.nextUrl;
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // Find the user with the given phone
    const targetUser = await prisma.user.findUnique({
      where: { phone: phone },
      include: {
        patient: true,
      },
    });

    if (!targetUser || !targetUser.patient) {
      // Return empty array if patient not found
      return NextResponse.json([]);
    }

    const patient = targetUser.patient;

    // Find all prescriptions for this patient
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Find diagnostic reports for this patient to map status
    const reports = await prisma.diagnosticReport.findMany({
      where: {
        patientId: patient.id,
      },
    });

    // Map prescriptions to the expected frontend format
    const prescriptionsData = [];

    for (const rx of prescriptions) {
      if (!rx.tests) continue;

      let testsArray: any[] = [];
      try {
        if (typeof rx.tests === "string") {
          testsArray = JSON.parse(rx.tests);
        } else if (Array.isArray(rx.tests)) {
          testsArray = rx.tests;
        } else if (typeof rx.tests === "object") {
           // Handle case where tests might be stored differently, but usually it's array.
           testsArray = Object.values(rx.tests);
        }
      } catch (e) {
        console.error("Failed to parse tests JSON", e);
      }

      if (testsArray.length === 0) continue;

      const mappedTests = testsArray.map((test, index) => {
        // Check if there is a report for this test in this prescription
        const report = reports.find(
          (r) => r.prescriptionId === rx.id && r.testIndex === index,
        );

        let statusVal: "Pending" | "In Progress" | "Completed" = "Pending";
        if (report) {
          statusVal = report.status === "Completed" ? "Completed" : "In Progress";
        }

        return {
          id: `${rx.id}-${index}`, // unique ID for frontend
          dbId: rx.id, // prescription id
          testIndex: index, // position in tests JSON array
          name: test.name || "Unknown Test",
          status: statusVal,
          priority: test.urgency || "Routine",
        };
      });

      prescriptionsData.push({
        id: `RX${rx.id.toString().padStart(3, "0")}`,
        dbId: rx.id, // we might need the actual ID for updates later
        doctor: rx.doctor.user.name,
        department: rx.doctor.department || "General",
        date: rx.createdAt.toISOString().split("T")[0],
        tests: mappedTests,
      });
    }

    if (prescriptionsData.length === 0) {
      // Patient has no tests
      return NextResponse.json([]);
    }

    // Format the response to match the Patient interface expected in frontend
    const patientData = {
      id: `P${patient.id.toString().padStart(3, "0")}`,
      patientDbId: patient.id,  // ← actual DB integer id for API calls
      name: targetUser.name,
      phone: targetUser.phone,
      age: patient.age || 0,
      gender: patient.gender || "Unknown",
      bloodGroup: patient.bloodGroup || "Unknown",
      prescriptions: prescriptionsData,
    };

    return NextResponse.json([patientData]);
  } catch (err) {
    console.error("[GET /api/diagnostic/test-requests]", err);
    return NextResponse.json(
      { error: "Failed to fetch test requests" },
      { status: 500 },
    );
  }
}
