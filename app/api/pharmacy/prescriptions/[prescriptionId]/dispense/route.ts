import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getPharmacy } from "@/app/lib/auth";

type RouteContext = {
  params: Promise<{ prescriptionId: string }>;
};

type PrescribedMed = {
  name?: string;
  dosage?: string;
  durationDays?: number | string;
};

function getRequiredQty(med: PrescribedMed): number {
  const durationDays =
    typeof med.durationDays === "number"
      ? med.durationDays
      : parseInt(String(med.durationDays), 10) || 0;
  const dosageStr = med.dosage ?? "";
  const timesPerDay = dosageStr
    .split("+")
    .reduce((sum, part) => sum + (parseFloat(part) || 0), 0);
  return timesPerDay > 0 && durationDays > 0
    ? Math.ceil(timesPerDay * durationDays)
    : 0;
}

function computeDispenseStatus(
  rawMedicines: PrescribedMed[],
  validItems: Array<{ name: string; qtyToDeduct: number }>,
): "Completed" | "Partial" {
  if (rawMedicines.length === 0) return "Partial";

  for (const med of rawMedicines) {
    const medName = med.name?.trim().toLowerCase() ?? "";
    const dispensed = validItems.find(
      (item) => item.name.trim().toLowerCase() === medName,
    );
    if (!dispensed) return "Partial";

    const requiredQty = getRequiredQty(med);
    if (requiredQty > 0 && dispensed.qtyToDeduct < requiredQty) {
      return "Partial";
    }
  }

  return "Completed";
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/pharmacy/prescriptions/[prescriptionId]/dispense
//
// Returns the prescription details plus each prescribed medicine enriched
// with live inventory data (stockQty, status) from the Medicine table.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const { prescriptionId: prescriptionIdParam } = await context.params;
    const prescriptionId = parseInt(prescriptionIdParam, 10);

    if (isNaN(prescriptionId)) {
      return NextResponse.json(
        { error: "Invalid prescription ID" },
        { status: 400 },
      );
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    if (!prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 },
      );
    }

    // ── Parse medicines JSON ──────────────────────────────────────────────────
    const rawMedicines = Array.isArray(prescription.medicines)
      ? (prescription.medicines as Array<{
          name?: string;
          dosage?: string;
          durationDays?: number | string;
          instructions?: string;
        }>)
      : [];

    // ── Fetch all inventory medicines for name matching ───────────────────────
    const allInventory = await prisma.medicine.findMany({
      select: {
        id: true,
        name: true,
        stockQty: true,
        lowStockThreshold: true,
      },
    });

    // ── Enrich each prescribed medicine with inventory data ───────────────────
    const medicines = rawMedicines.map((med, idx) => {
      const medName = med.name?.trim().toLowerCase() ?? "";

      // Fuzzy match: inventory name contains the prescribed name OR vice-versa
      const inventoryMatch = allInventory.find((inv) => {
        const invName = inv.name.trim().toLowerCase();
        return invName.includes(medName) || medName.includes(invName);
      });

      const stockQty = inventoryMatch?.stockQty ?? 0;
      const lowStockThreshold = inventoryMatch?.lowStockThreshold ?? 50;
      const durationDays =
        typeof med.durationDays === "number"
          ? med.durationDays
          : parseInt(String(med.durationDays), 10) || 0;

      // Compute required quantity from dosage pattern (e.g. "1+0+1" → 2/day)
      const dosageStr = med.dosage ?? "";
      const timesPerDay = dosageStr
        .split("+")
        .reduce((sum, part) => sum + (parseFloat(part) || 0), 0);
      const requiredQty =
        timesPerDay > 0 && durationDays > 0
          ? Math.ceil(timesPerDay * durationDays)
          : 0;

      // Determine stock status
      let status: "In Stock" | "Low Stock" | "Out of Stock";
      if (stockQty === 0) {
        status = "Out of Stock";
      } else if (stockQty < lowStockThreshold) {
        status = "Low Stock";
      } else {
        status = "In Stock";
      }

      return {
        id: idx + 1,
        inventoryId: inventoryMatch?.id ?? null,
        name: med.name ?? "",
        dosage: dosageStr,
        durationDays,
        instructions: med.instructions ?? "",
        requiredQty,
        stockQty,
        status,
        available: stockQty > 0,
      };
    });

    return NextResponse.json({
      prescription: {
        id: prescription.id,
        displayId: `RX-${String(prescription.id).padStart(3, "0")}`,
        date: prescription.createdAt.toISOString().split("T")[0],
        diagnosis: prescription.diagnosis,
        symptoms: prescription.symptoms,
        notes: prescription.notes,
      },
      patient: {
        id: prescription.patient.id,
        displayId: `P${String(prescription.patient.id).padStart(3, "0")}`,
        name: prescription.patient.user.name,
        age: prescription.patient.age,
        gender: prescription.patient.gender,
      },
      doctor: {
        name: prescription.doctor.user.name,
        specialization: prescription.doctor.specialization,
        department: prescription.doctor.department,
      },
      medicines,
    });
  } catch (err) {
    console.error(
      "[GET /api/pharmacy/prescriptions/[prescriptionId]/dispense]",
      err,
    );
    return NextResponse.json(
      { error: "Failed to fetch prescription for dispensing" },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/pharmacy/prescriptions/[prescriptionId]/dispense
//
// Body: { medicines: Array<{ inventoryId: number; qtyToDeduct: number; name: string }> }
//
// Atomically deducts each medicine's dispensed quantity from the Medicine
// table using a Prisma transaction. Stock is clamped at 0 and status is
// recomputed after the update.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const { prescriptionId: prescriptionIdParam } = await context.params;
    const prescriptionId = parseInt(prescriptionIdParam, 10);

    if (isNaN(prescriptionId)) {
      return NextResponse.json(
        { error: "Invalid prescription ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const items: Array<{
      inventoryId: number;
      qtyToDeduct: number;
      name: string;
    }> = body.medicines ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No medicines provided to dispense" },
        { status: 400 },
      );
    }

    // Filter to only valid items that have an inventoryId and positive qty
    const validItems = items.filter(
      (item) =>
        typeof item.inventoryId === "number" &&
        typeof item.qtyToDeduct === "number" &&
        item.qtyToDeduct > 0,
    );

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "No valid medicines to deduct from inventory" },
        { status: 400 },
      );
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: { patientId: true, medicines: true },
    });

    if (!prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 },
      );
    }

    const rawMedicines = Array.isArray(prescription.medicines)
      ? (prescription.medicines as PrescribedMed[])
      : [];

    const status = computeDispenseStatus(rawMedicines, validItems);

    // ── Run all stock deductions in one atomic transaction ───────────────────
    const updatedMedicines = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of validItems) {
        // Fetch current stock inside the transaction
        const current = await tx.medicine.findUnique({
          where: { id: item.inventoryId },
          select: { id: true, name: true, stockQty: true, lowStockThreshold: true },
        });

        if (!current) continue;

        const newStock = Math.max(0, current.stockQty - item.qtyToDeduct);

        let stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
        if (newStock === 0) stockStatus = "Out of Stock";
        else if (newStock < current.lowStockThreshold) stockStatus = "Low Stock";
        else stockStatus = "In Stock";

        const updated = await tx.medicine.update({
          where: { id: item.inventoryId },
          data: { stockQty: newStock },
          select: { id: true, name: true, stockQty: true, lowStockThreshold: true },
        });

        results.push({
          id: updated.id,
          name: updated.name,
          previousStock: current.stockQty,
          deducted: item.qtyToDeduct,
          newStockQty: updated.stockQty,
          status: stockStatus,
        });
      }

      await tx.dispenseRecord.create({
        data: {
          prescriptionId,
          patientId: prescription.patientId,
          medicinesDispensed: results.length,
          status,
        },
      });

      return results;
    });

    return NextResponse.json({
      success: true,
      prescriptionId,
      dispensedAt: new Date().toISOString(),
      dispensedCount: updatedMedicines.length,
      updatedMedicines,
    });
  } catch (err) {
    console.error(
      "[POST /api/pharmacy/prescriptions/[prescriptionId]/dispense]",
      err,
    );
    return NextResponse.json(
      { error: "Failed to process dispense. Please try again." },
      { status: 500 },
    );
  }
}
