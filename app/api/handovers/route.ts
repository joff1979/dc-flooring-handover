import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { projectName, client, siteAddress, contractValue, startDate, duration } = body;

    if (!projectName) return NextResponse.json({ error: "Project name required" }, { status: 400 });

    const project = await prisma.project.create({
      data: {
        name: projectName,
        client: client || "",
        site_address: siteAddress,
        contract_value: contractValue,
        start_date: startDate,
        duration: duration,
        created_by: user.id,
      },
    });

    const handover = await prisma.handover.create({
      data: {
        project_id: project.id,
        created_by: user.id,
        status: "DRAFT",
        form_data: body,
      },
    });

    return NextResponse.json({ handover, project });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
