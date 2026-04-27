import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const client = new Anthropic({ apiKey: process.env.DCF_ANTHROPIC_KEY });

const SYSTEM_PROMPT = `You are an expert construction contracts analyst for DC Flooring, a specialist flooring contractor.
You are reviewing a project handover from an estimator to a contract manager.

Your job is to:
1. Write a concise executive summary of the project in professional construction language
2. Extract key project facts
3. Identify and flag urgent items, risks, and unclear scope — be direct, do not soften concerns
4. List required actions with suggested owners and deadlines

Return ONLY valid JSON with this exact structure — no preamble, no markdown fences:
{
  "summary": "2-3 paragraph executive summary",
  "keyFacts": [
    { "label": "string", "value": "string" }
  ],
  "urgentFlags": [
    {
      "title": "string",
      "detail": "string",
      "severity": "critical | high | medium"
    }
  ],
  "actionsRequired": [
    {
      "action": "string",
      "owner": "string",
      "deadline": "string"
    }
  ],
  "scopeNotes": "brief paragraph on scope clarity and any unclear areas"
}`;

function compileFormData(formData: Record<string, string>): string {
  const sections = [
    {
      title: "Section 1 — Project Overview",
      fields: [
        { key: "projectName", label: "Project Name" },
        { key: "client", label: "Client" },
        { key: "siteAddress", label: "Site Address" },
        { key: "contractValue", label: "Contract Value" },
        { key: "startDate", label: "Anticipated Start" },
        { key: "duration", label: "Programme Duration" },
      ],
    },
    {
      title: "Section 2 — Scope of Works",
      fields: [
        { key: "scopeMain", label: "Main Scope of Works" },
        { key: "inclusions", label: "Key Inclusions" },
        { key: "exclusions", label: "Key Exclusions" },
      ],
    },
    {
      title: "Section 3 — Risks & Assumptions",
      fields: [
        { key: "pricingAssumptions", label: "Pricing Assumptions" },
        { key: "commercialRisks", label: "Commercial Risks" },
        { key: "programmeRisks", label: "Programme Concerns" },
      ],
    },
    {
      title: "Section 4 — Delivery & Site",
      fields: [
        { key: "siteAccess", label: "Site Access & Restrictions" },
        { key: "labourRequirements", label: "Labour Requirements" },
        { key: "specialistMaterials", label: "Specialist Materials & Lead Times" },
        { key: "clientCommitments", label: "Client Commitments / Promises Made" },
        { key: "immediateActions", label: "Items Contract Manager Must Act On Immediately" },
      ],
    },
  ];

  return sections
    .map((section) => {
      const fieldLines = section.fields
        .filter((f) => formData[f.key])
        .map((f) => `${f.label}:\n${formData[f.key]}`)
        .join("\n\n");
      return fieldLines ? `## ${section.title}\n\n${fieldLines}` : null;
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.handover.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.status === "LOCKED") {
      return NextResponse.json({ error: "Handover is locked" }, { status: 403 });
    }

    const formData = (existing.form_data as Record<string, string>) || {};
    const compiledText = compileFormData(formData);

    if (!compiledText.trim()) {
      return NextResponse.json({ error: "No form data to generate from" }, { status: 400 });
    }

    // Snapshot current version before overwriting
    if (existing.ai_summary) {
      await prisma.handoverVersion.create({
        data: {
          handover_id: id,
          version: existing.version,
          form_data: existing.form_data as object,
          ai_summary: existing.ai_summary as object,
          changed_by: user.id,
          change_note: "Regenerated",
        },
      });
    }

    // Call Anthropic API with prompt caching on system prompt
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: compiledText,
        },
      ],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract the JSON object from the response, stripping any markdown fences
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    let aiSummary: object;
    try {
      if (!jsonMatch) throw new Error("No JSON object found");
      aiSummary = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw: rawText }, { status: 500 });
    }

    // Update handover with new ai_summary and increment version
    const updatedHandover = await prisma.handover.update({
      where: { id },
      data: {
        ai_summary: aiSummary,
        version: existing.version + (existing.ai_summary ? 1 : 0),
        status: "AWAITING_ESTIMATOR",
      },
      include: { project: true },
    });

    return NextResponse.json(updatedHandover);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
