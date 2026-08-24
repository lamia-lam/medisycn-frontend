import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role, license } = await req.json();

    console.log("===== REGISTER API HIT =====");
    console.log({
      name,
      email,
      phone,
      password,
      role,
    });

    const normalizedRole = String(role || "").toUpperCase() as Role;

    const allowedRoles = Object.values(Role);

    // Validate role
    if (!allowedRoles.includes(normalizedRole)) {
      console.log("Invalid Role:", normalizedRole);

      return Response.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      console.log("User already exists.");

      return Response.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine status
    const accountStatus = normalizedRole === "PATIENT" ? "APPROVED" : "PENDING";

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: normalizedRole,
        status: accountStatus,
      },
    });

    console.log("===== USER CREATED =====");
    console.log(user);

    // Auto-create doctor profile
    if (normalizedRole === "DOCTOR") {
      console.log("Creating Doctor Profile...");

      await prisma.doctor.create({
        data: {
          userId: user.id,
          license: license || null,
        },
      });
    }

    // Auto-create patient profile
    if (normalizedRole === "PATIENT") {
      console.log("Creating Patient Profile...");

      await prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Auto-create pharmacy profile
    if (normalizedRole === "PHARMACY") {
      console.log("Creating Pharmacy Profile...");

      await prisma.pharmacy.create({
        data: {
          userId: user.id,
          license: license || null,
        },
      });
    }

    // Auto-create diagnostic profile
    if (normalizedRole === "DIAGNOSTIC") {
      await prisma.diagnostic.create({
        data: {
          userId: user.id,
          license: license || null,
        },
      });
    }

    console.log("===== REGISTRATION SUCCESSFUL =====");

    return Response.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("===== REGISTRATION ERROR =====");
    console.error(error);

    return Response.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}