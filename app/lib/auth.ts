import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

export async function getDoctor(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader
    ?.split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  let decoded: { id: number; role: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }

  if (decoded.role !== "DOCTOR") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: decoded.id },
    include: { user: true },
  });

  if (!doctor) {
    return { error: NextResponse.json({ error: "Doctor not found" }, { status: 404 }) };
  }

  return { doctor };
}

export async function getPharmacy(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader
    ?.split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  let decoded: { id: number; role: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }

  if (decoded.role !== "PHARMACY") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: { pharmacy: true },
  });

  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user };
}

export async function getDiagnostic(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader
    ?.split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  let decoded: { id: number; role: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }

  if (decoded.role !== "DIAGNOSTIC") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user };
}
