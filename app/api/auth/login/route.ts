import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    let body: { email?: string; password?: string };

    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return Response.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    if (!user.password) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "SUSPENDED") {
      return Response.json(
        { error: "Your account has been suspended by an administrator." },
        { status: 403 },
      );
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return Response.json({
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}
