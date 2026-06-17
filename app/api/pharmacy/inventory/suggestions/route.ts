import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getPharmacy } from "@/app/lib/auth";

const VALID_FIELDS = ["name", "genericName", "category"] as const;
type SuggestionField = (typeof VALID_FIELDS)[number];

export async function GET(req: NextRequest) {
  try {
    const { error } = await getPharmacy(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const field = searchParams.get("field") as SuggestionField | null;
    const q = searchParams.get("q")?.trim() ?? "";

    if (!field || !VALID_FIELDS.includes(field)) {
      return NextResponse.json(
        { error: "Invalid field. Use name, genericName, or category." },
        { status: 400 },
      );
    }

    const where = q
      ? { [field]: { contains: q, mode: "insensitive" as const } }
      : {};

    if (field === "name") {
      const results = await prisma.medicine.findMany({
        where,
        select: { name: true, genericName: true, category: true },
        distinct: ["name"],
        orderBy: { name: "asc" },
        take: 10,
      });
      return NextResponse.json({ suggestions: results });
    }

    const results = await prisma.medicine.findMany({
      where,
      select: { [field]: true },
      distinct: [field],
      orderBy: { [field]: "asc" },
      take: 15,
    });

    return NextResponse.json({
      suggestions: results.map((row) => row[field] as string),
    });
  } catch (err) {
    console.error("[GET /api/pharmacy/inventory/suggestions]", err);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 },
    );
  }
}
