import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const handover = await prisma.handover.findUnique({
      where: { id },
      include: {
        project: true,
        creator: { select: { id: true, name: true, email: true, role: true } },
        estimator: { select: { id: true, name: true, email: true } },
        cm: { select: { id: true, name: true, email: true } },
        versions: {
          orderBy: { version: "desc" },
          include: { changer: { select: { name: true } } },
        },
      },
    });

    if (!handover) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(handover);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.handover.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.status === "LOCKED") {
      return NextResponse.json({ error: "Handover is locked" }, { status: 403 });
    }

    // Update project fields if present
    const projectUpdates: Record<string, string> = {};
    if (body.projectName !== undefined) projectUpdates.name = body.projectName;
    if (body.client !== undefined) projectUpdates.client = body.client;
    if (body.siteAddress !== undefined) projectUpdates.site_address = body.siteAddress;
    if (body.contractValue !== undefined) projectUpdates.contract_value = body.contractValue;
    if (body.startDate !== undefined) projectUpdates.start_date = body.startDate;
    if (body.duration !== undefined) projectUpdates.duration = body.duration;

    if (Object.keys(projectUpdates).length > 0) {
      await prisma.project.update({
        where: { id: existing.project_id },
        data: projectUpdates,
      });
    }

    const handover = await prisma.handover.update({
      where: { id },
      data: { form_data: body },
      include: { project: true },
    });

    return NextResponse.json(handover);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
