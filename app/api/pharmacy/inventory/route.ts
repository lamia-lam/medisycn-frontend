import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getPharmacy } from "@/app/lib/auth";
import { getStockStatus, statusToSlug } from "@/app/lib/inventory";

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

export async function GET(req: NextRequest) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
    const status = searchParams.get("status") ?? "all";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));

    const medicines = await prisma.medicine.findMany({
      orderBy: { name: "asc" },
      ...(search
        ? {
            where: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { genericName: { contains: search, mode: "insensitive" } },
                { category: { contains: search, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    });

    const formatted = medicines.map(formatMedicine);

    const filtered =
      status === "all"
        ? formatted
        : formatted.filter((m) => statusToSlug(m.status) === status);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    const [statsRow] = await prisma.$queryRaw<
      { in_stock: number; low_stock: number; out_of_stock: number; total: number }[]
    >`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE "stockQty" > "lowStockThreshold")::int AS in_stock,
        COUNT(*) FILTER (WHERE "stockQty" > 0 AND "stockQty" <= "lowStockThreshold")::int AS low_stock,
        COUNT(*) FILTER (WHERE "stockQty" = 0)::int AS out_of_stock
      FROM "Medicine"
    `;

    return NextResponse.json({
      medicines: paginated,
      stats: {
        total: statsRow?.total ?? 0,
        inStock: statsRow?.in_stock ?? 0,
        lowStock: statsRow?.low_stock ?? 0,
        outOfStock: statsRow?.out_of_stock ?? 0,
      },
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("[GET /api/pharmacy/inventory]", err);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const body = await req.json();
    const { name, genericName, category, stockQty, lowStockThreshold, expiryDate } =
      body;

    if (!name?.trim() || !genericName?.trim() || !category?.trim() || !expiryDate) {
      return NextResponse.json(
        { error: "Name, generic name, category, and expiry date are required" },
        { status: 400 },
      );
    }

    const qty = stockQty !== undefined && stockQty !== "" ? parseInt(String(stockQty), 10) : 0;
    if (isNaN(qty) || qty < 0) {
      return NextResponse.json(
        { error: "Stock quantity must be a non-negative number" },
        { status: 400 },
      );
    }

    const threshold =
      lowStockThreshold !== undefined && lowStockThreshold !== ""
        ? parseInt(String(lowStockThreshold), 10)
        : 50;
    if (isNaN(threshold) || threshold < 0) {
      return NextResponse.json(
        { error: "Low stock threshold must be a non-negative number" },
        { status: 400 },
      );
    }

    const parsedExpiry = new Date(expiryDate);
    if (isNaN(parsedExpiry.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name: name.trim(),
        genericName: genericName.trim(),
        category: category.trim(),
        stockQty: qty,
        lowStockThreshold: threshold,
        expiryDate: parsedExpiry,
      },
    });

    return NextResponse.json(formatMedicine(medicine), { status: 201 });
  } catch (err) {
    console.error("[POST /api/pharmacy/inventory]", err);
    return NextResponse.json(
      { error: "Failed to create medicine" },
      { status: 500 },
    );
  }
}
