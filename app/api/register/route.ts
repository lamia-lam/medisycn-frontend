import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json();
  const normalizedRole = String(role || "").toUpperCase() as Role;
  const allowedRoles = Object.values(Role);

  if (!allowedRoles.includes(normalizedRole)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return Response.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
    },
  });

  return Response.json(user);
}
