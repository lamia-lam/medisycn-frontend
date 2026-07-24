import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdmin } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAdmin(req);
    if (auth.error) return auth.error;

    // Fetch users with their role-specific details to show licenses
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        doctor: true,
        pharmacy: true,
      }
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAdmin(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Ensure status is valid
    const validStatuses = ["PENDING", "APPROVED", "SUSPENDED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
