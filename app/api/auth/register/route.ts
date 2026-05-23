import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role } = await req.json();

    const normalizedRole = String(role || "").toUpperCase() as Role;

    const allowedRoles = Object.values(Role);

    // Validate role
    if (!allowedRoles.includes(normalizedRole)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: normalizedRole,
      },
    });

    // Auto-create doctor profile
    if (normalizedRole === "DOCTOR") {
      await prisma.doctor.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Auto-create patient profile
    if (normalizedRole === "PATIENT") {
      await prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    }

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
