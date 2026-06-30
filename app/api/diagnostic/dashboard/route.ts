import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDiagnostic } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getDiagnostic(req);
    if (error) return error;

    // Get today's start and end date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all prescriptions that have tests
    const prescriptionsWithTests = await prisma.prescription.findMany({
      where: {
        tests: {
          not: "null",
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const reports = await prisma.diagnosticReport.findMany();

    let totalRequestsToday = 0;
    let pendingReports = 0;
    let completedToday = 0;
    const recentRequests: any[] = [];

    // Count completions today
    const completedReportsToday = await prisma.diagnosticReport.count({
      where: {
        status: "Completed",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    completedToday = completedReportsToday;

    // Process prescriptions to extract test requests
    for (const rx of prescriptionsWithTests) {
      if (!rx.tests) continue;

      let testsArray: any[] = [];
      try {
        if (typeof rx.tests === "string") {
          testsArray = JSON.parse(rx.tests);
        } else if (Array.isArray(rx.tests)) {
          testsArray = rx.tests;
        } else if (typeof rx.tests === "object") {
          testsArray = Object.values(rx.tests);
        }
      } catch (e) {
        console.error("Failed to parse tests JSON", e);
      }

      if (testsArray.length === 0) continue;

      const isToday = rx.createdAt >= today && rx.createdAt < tomorrow;

      for (let index = 0; index < testsArray.length; index++) {
        const test = testsArray[index];
        
        if (isToday) {
          totalRequestsToday++;
        }

        const report = reports.find(
          (r) => r.prescriptionId === rx.id && r.testIndex === index
        );

        let statusVal: "Pending" | "In Progress" | "Completed" = "Pending";
        if (report) {
          statusVal = report.status === "Completed" ? "Completed" : "In Progress";
        }

        if (statusVal !== "Completed") {
          pendingReports++;
        }

        // Add to recent requests if we haven't reached the limit (e.g. 5)
        if (recentRequests.length < 5) {
          recentRequests.push({
            id: `REQ-${rx.id}-${index}`,
            patient: rx.patient.user.name,
            test: test.name || "Unknown Test",
            doctor: rx.doctor.user.name,
            time: rx.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: rx.createdAt,
            status: statusVal,
            priority: test.urgency || "Normal",
          });
        }
      }
    }

    // Sort recent requests by date
    recentRequests.sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json({
      centerName: user.name,
      stats: {
        totalRequestsToday,
        pendingReports,
        completedToday,
      },
      recentRequests,
    });
  } catch (err) {
    console.error("[GET /api/diagnostic/dashboard]", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
