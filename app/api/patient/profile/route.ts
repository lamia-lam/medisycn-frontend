import { prisma } from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    // Get cookie
    const cookieHeader = req.headers.get("cookie");

    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };

    // Find patient profile + user info
    const patient = await prisma.patient.findUnique({
      where: {
        userId: decoded.id,
      },
      include: {
        user: true,
      },
    });

    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    return Response.json(patient);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };

    const body = await req.json();
    const { age, gender, bloodGroup, condition, address } = body;

    const patient = await prisma.patient.update({
      where: {
        userId: decoded.id,
      },
      data: {
        age: age ? parseInt(age) : undefined,
        gender,
        bloodGroup,
        condition,
        address,
      },
      include: {
        user: true,
      },
    });

    return Response.json(patient);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
