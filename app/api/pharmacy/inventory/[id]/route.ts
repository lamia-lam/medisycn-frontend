import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getPharmacy } from "@/app/lib/auth";
import { getStockStatus } from "@/app/lib/inventory";

type RouteContext = { params: Promise<{ id: string }> };

function formatMedicine(m: {
  id: number;
  name: string;
  genericName: string;
  category: string;
  stockQty: number;
  lowStockThreshold: number;
  expiryDate: Date;
}) {
  return {
    id: m.id,
    name: m.name,
    genericName: m.genericName,
    category: m.category,
    stockQty: m.stockQty,
    lowStockThreshold: m.lowStockThreshold,
    status: getStockStatus(m.stockQty, m.lowStockThreshold),
    expiryDate: m.expiryDate.toISOString().split("T")[0],
  };
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const { id } = await context.params;
    const medicineId = parseInt(id, 10);
    if (isNaN(medicineId)) {
      return NextResponse.json({ error: "Invalid medicine ID" }, { status: 400 });
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json(formatMedicine(medicine));
  } catch (err) {
    console.error("[GET /api/pharmacy/inventory/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch medicine" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const { id } = await context.params;
    const medicineId = parseInt(id, 10);
    if (isNaN(medicineId)) {
      return NextResponse.json({ error: "Invalid medicine ID" }, { status: 400 });
    }

    const existing = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      genericName,
      category,
      stockQty,
      lowStockThreshold,
      expiryDate,
      addStockQty,
    } = body;

    const data: {
      name?: string;
      genericName?: string;
      category?: string;
      stockQty?: number;
      lowStockThreshold?: number;
      expiryDate?: Date;
    } = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return NextResponse.json({ error: "Medicine name is required" }, { status: 400 });
      }
      data.name = String(name).trim();
    }

    if (genericName !== undefined) {
      if (!String(genericName).trim()) {
        return NextResponse.json({ error: "Generic name is required" }, { status: 400 });
      }
      data.genericName = String(genericName).trim();
    }

    if (category !== undefined) {
      if (!String(category).trim()) {
        return NextResponse.json({ error: "Category is required" }, { status: 400 });
      }
      data.category = String(category).trim();
    }

    if (lowStockThreshold !== undefined) {
      const threshold = parseInt(String(lowStockThreshold), 10);
      if (isNaN(threshold) || threshold < 0) {
        return NextResponse.json(
          { error: "Low stock threshold must be a non-negative number" },
          { status: 400 },
        );
      }
      data.lowStockThreshold = threshold;
    }

    if (expiryDate !== undefined) {
      const parsed = new Date(expiryDate);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
      }
      data.expiryDate = parsed;
    }

    if (addStockQty !== undefined && addStockQty !== null && addStockQty !== "") {
      const added = parseInt(String(addStockQty), 10);
      if (isNaN(added) || added < 0) {
        return NextResponse.json(
          { error: "Added stock quantity must be a non-negative number" },
          { status: 400 },
        );
      }
      data.stockQty = existing.stockQty + added;
    } else if (stockQty !== undefined) {
      const qty = parseInt(String(stockQty), 10);
      if (isNaN(qty) || qty < 0) {
        return NextResponse.json(
          { error: "Stock quantity must be a non-negative number" },
          { status: 400 },
        );
      }
      data.stockQty = qty;
    }

    const updated = await prisma.medicine.update({
      where: { id: medicineId },
      data,
    });

    return NextResponse.json(formatMedicine(updated));
  } catch (err) {
    console.error("[PATCH /api/pharmacy/inventory/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update medicine" },
      { status: 500 },
    );
  }
}
