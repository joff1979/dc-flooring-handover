import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { HandoverStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { role } = await request.json();

    const handover = await prisma.handover.findUnique({ where: { id } });
    if (!handover) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (handover.status === "LOCKED") {
      return NextResponse.json({ error: "Already locked" }, { status: 400 });
    }

    let updateData: {
      estimator_id?: string;
      estimator_signed_at?: Date;
      cm_id?: string;
      cm_signed_at?: Date;
      status?: HandoverStatus;
    } = {};

    if (role === "ESTIMATOR" && handover.status === "AWAITING_ESTIMATOR") {
      updateData = {
        estimator_id: user.id,
        estimator_signed_at: new Date(),
        status: "AWAITING_CM",
      };
    } else if (role === "CONTRACT_MANAGER" && handover.status === "AWAITING_CM") {
      if (!handover.estimator_signed_at) {
        return NextResponse.json({ error: "Estimator must sign first" }, { status: 400 });
      }
      updateData = {
        cm_id: user.id,
        cm_signed_at: new Date(),
        status: "LOCKED",
      };
    } else {
      return NextResponse.json({ error: "Cannot sign in current status" }, { status: 400 });
    }

    const updated = await prisma.handover.update({
      where: { id },
      data: updateData,
      include: {
        estimator: { select: { name: true } },
        cm: { select: { name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
