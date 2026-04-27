import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    await requireRole([Role.ADMIN]);
    const users = await prisma.user.findMany({ orderBy: { created_at: "asc" } });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireRole([Role.ADMIN]);
    const { name, email, role } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: "name, email, and role are required" }, { status: 400 });
    }

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { name, email, role },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Forbidden" || message === "Unauthorized") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
