import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getPharmacy } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getPharmacy(req);
    if (error) return error;

    let pharmacy = user!.pharmacy;
    if (!pharmacy) {
      pharmacy = await prisma.pharmacy.create({
        data: {
          userId: user!.id,
        },
      });
    }

    return NextResponse.json({
      user: {
        name: user!.name,
        email: user!.email,
        phone: user!.phone,
      },
      pharmacy: pharmacy,
    });
  } catch (err) {
    console.error("[GET /api/pharmacy/profile]", err);
    return NextResponse.json(
      { error: "Failed to fetch pharmacy profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await getPharmacy(req);
    if (error) return error;

    const body = await req.json();
    const { license, avatar } = body;

    let pharmacy = user!.pharmacy;

    if (pharmacy) {
      pharmacy = await prisma.pharmacy.update({
        where: { id: pharmacy.id },
        data: { license, avatar },
      });
    } else {
      pharmacy = await prisma.pharmacy.create({
        data: {
          userId: user!.id,
          license,
          avatar,
        },
      });
    }

    return NextResponse.json({ success: true, pharmacy });
  } catch (err) {
    console.error("[PUT /api/pharmacy/profile]", err);
    return NextResponse.json(
      { error: "Failed to update pharmacy profile" },
      { status: 500 }
    );
  }
}
