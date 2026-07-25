import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getDiagnostic } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getDiagnostic(req);
    if (error) return error;

    // Auto-create a Diagnostic record if one doesn't exist yet
    let diagnostic = (user as any).diagnostic;
    if (!diagnostic) {
      diagnostic = await prisma.diagnostic.create({
        data: { userId: user!.id },
      });
    }

    return NextResponse.json({
      user: {
        name: user!.name,
        email: user!.email,
        phone: user!.phone,
      },
      diagnostic: {
        license: diagnostic.license ?? "",
        avatar: diagnostic.avatar ?? "",
      },
    });
  } catch (err) {
    console.error("[GET /api/diagnostic/profile]", err);
    return NextResponse.json(
      { error: "Failed to fetch diagnostic profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await getDiagnostic(req);
    if (error) return error;

    const body = await req.json();
    const { license, avatar } = body;

    const diagnostic = await prisma.diagnostic.upsert({
      where: { userId: user!.id },
      update: { license, avatar },
      create: { userId: user!.id, license, avatar },
    });

    return NextResponse.json({ success: true, diagnostic });
  } catch (err) {
    console.error("[PUT /api/diagnostic/profile]", err);
    return NextResponse.json(
      { error: "Failed to update diagnostic profile" },
      { status: 500 }
    );
  }
}
