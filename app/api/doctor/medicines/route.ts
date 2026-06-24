import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDoctor } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { doctor, error } = await getDoctor(req);
    if (error) return error;

    const medicines = await prisma.medicine.findMany({
      select: {
        id: true,
        name: true,
        genericName: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(medicines);
  } catch (err) {
    console.error("[GET /api/doctor/medicines]", err);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}
