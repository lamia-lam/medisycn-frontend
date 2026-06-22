import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Stats
    const prescriptionsProcessedToday = await prisma.dispenseRecord.count({
      where: {
        dispensedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });


    // Correction: Prisma does not easily support `stockQty <= lowStockThreshold` in a simple where without raw query if it's dynamic, but wait, both are fields. 
    // Wait, let's fetch medicines and filter if the count isn't huge. Or we can just use raw query for stats if needed.
    // Let's use raw query for counting low stock if possible, or fetch all medicines and count.
    // For now let's just do a fetch of all medicines to calculate stats since inventory might not be millions.
    const allMedicines = await prisma.medicine.findMany({
      select: { stockQty: true, lowStockThreshold: true }
    });
    
    let lowStockCountVal = 0;
    let outOfStockCount = 0;
    
    for (const med of allMedicines) {
      if (med.stockQty === 0) {
        outOfStockCount++;
      } else if (med.stockQty <= med.lowStockThreshold) {
        lowStockCountVal++;
      }
    }

    const totalMedicines = allMedicines.length;

    const patientsServedToday = await prisma.dispenseRecord.groupBy({
      by: ['patientId'],
      where: {
        dispensedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // 2. Recent Prescriptions
    const recentPrescriptionsData = await prisma.dispenseRecord.findMany({
      orderBy: { dispensedAt: "desc" },
      take: 5,
      include: {
        prescription: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
          }
        },
        patient: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    const recentPrescriptions = recentPrescriptionsData.map(record => {
      const patientName = record.patient.user.name;
      const initials = patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      return {
        id: `RX${record.prescriptionId.toString().padStart(3, '0')}`,
        patientName,
        initials,
        doctorName: record.prescription.doctor.user.name,
        time: record.dispensedAt.toISOString(),
        medicines: record.medicinesDispensed,
        status: record.status,
      };
    });

    // 3. Low Stock Alerts
    // We need top 5 lowest stock medicines compared to their threshold.
    // Let's just fetch all low stock and sort them by ratio or quantity
    const lowStockMedicinesData = await prisma.medicine.findMany({
      where: {
        stockQty: { lte: 50 }, // Arbitrary fallback since we can't easily compare columns
      }
    });
    
    // Better filter in JS for low stock
    const actualLowStock = lowStockMedicinesData.filter(m => m.stockQty <= m.lowStockThreshold && m.stockQty > 0);
    const lowStockMedicines = actualLowStock
      .sort((a, b) => (a.stockQty / a.lowStockThreshold) - (b.stockQty / b.lowStockThreshold))
      .slice(0, 5)
      .map(m => ({
        name: m.name,
        quantity: m.stockQty,
        threshold: m.lowStockThreshold
      }));

    // 4. Recent Patient Activity
    const recentPatientsData = await prisma.dispenseRecord.findMany({
      orderBy: { dispensedAt: "desc" },
      take: 20, // get some records to group
      include: {
        patient: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    const patientMap = new Map();
    recentPatientsData.forEach(record => {
      if (!patientMap.has(record.patientId)) {
        const patientName = record.patient.user.name;
        const initials = patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        patientMap.set(record.patientId, {
          id: record.patientId,
          name: patientName,
          initials,
          time: record.dispensedAt.toISOString(),
          prescriptions: 0 // Will count from all records later or just keep simple
        });
      }
    });
    
    const uniqueRecentPatients = Array.from(patientMap.values()).slice(0, 5);
    
    // Get total prescriptions for these patients
    for (const p of uniqueRecentPatients) {
      p.prescriptions = await prisma.dispenseRecord.count({
        where: { patientId: p.id }
      });
    }

    return NextResponse.json({
      stats: {
        prescriptionsProcessed: prescriptionsProcessedToday,
        lowStockMedicines: lowStockCountVal,
        totalMedicines,
        outOfStock: outOfStockCount,
        patientsServed: patientsServedToday.length,
      },
      recentPrescriptions,
      lowStockMedicines,
      recentPatients: uniqueRecentPatients,
    });
  } catch (err) {
    console.error("[GET /api/pharmacy/dashboard]", err);
    return NextResponse.json(
      { error: "Failed to fetch pharmacy dashboard data" },
      { status: 500 }
    );
  }
}
