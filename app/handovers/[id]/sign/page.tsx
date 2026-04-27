import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Nav from "@/components/nav";
import SignOffSection from "@/components/sign-off-section";

type AISummary = {
  summary?: string;
  keyFacts?: { label: string; value: string }[];
  urgentFlags?: { title: string; detail: string; severity: "critical" | "high" | "medium" }[];
  actionsRequired?: { action: string; owner: string; deadline: string }[];
};

const SEVERITY_STYLES = {
  critical: "border-red-800/50 bg-red-950/20 text-red-300",
  high: "border-orange-800/50 bg-orange-950/20 text-orange-300",
  medium: "border-yellow-800/50 bg-yellow-950/20 text-yellow-300",
};

const SEVERITY_DOT = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
};

export default async function SignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const handover = await prisma.handover.findUnique({
    where: { id },
    include: {
      project: true,
      estimator: { select: { id: true, name: true, email: true } },
      cm: { select: { id: true, name: true, email: true } },
    },
  });

  if (!handover) notFound();
  if (handover.status === "DRAFT" || handover.status === "LOCKED") {
    redirect(`/handovers/${id}`);
  }

  const aiSummary = handover.ai_summary as AISummary | null;

  const canSign =
    (handover.status === "AWAITING_ESTIMATOR" && user.role === "ESTIMATOR") ||
    (handover.status === "AWAITING_CM" && user.role === "CONTRACT_MANAGER");

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Nav userName={user.name} userRole={user.role} />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-[#29B6D5] text-xs tracking-[0.3em] uppercase mb-2">
            DC Flooring — Sign-Off
          </div>
          <h1 className="text-2xl font-bold text-[#e8edf4] tracking-tight">
            {handover.project.name}
          </h1>
          <p className="text-[#7a8ca8] text-sm mt-1">{handover.project.client}</p>
        </div>

        {!canSign && (
          <div className="bg-yellow-950/20 border border-yellow-800/50 px-4 py-3 mb-6 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <span className="text-yellow-300 text-sm">
              This handover is not currently awaiting your signature.
            </span>
          </div>
        )}

        {/* Summary snapshot */}
        {aiSummary && (
          <div className="mb-6 space-y-4">
            {aiSummary.keyFacts && aiSummary.keyFacts.length > 0 && (
              <div>
                <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-3">Key Facts</div>
                <div className="grid grid-cols-2 gap-px bg-[#1e3048]">
                  {aiSummary.keyFacts.map((fact, i) => (
                    <div key={i} className="bg-[#0f1e35] px-4 py-3">
                      <div className="text-[#7a8ca8] text-xs mb-1">{fact.label}</div>
                      <div className="text-[#e8edf4] text-sm font-medium">{fact.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiSummary.urgentFlags && aiSummary.urgentFlags.length > 0 && (
              <div>
                <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-3">
                  Flags & Risks ({aiSummary.urgentFlags.length})
                </div>
                <div className="space-y-2">
                  {aiSummary.urgentFlags.map((flag, i) => (
                    <div
                      key={i}
                      className={`border px-4 py-3 ${SEVERITY_STYLES[flag.severity] || SEVERITY_STYLES.medium}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT[flag.severity] || SEVERITY_DOT.medium}`}></div>
                        <span className="text-sm font-medium">{flag.title}</span>
                        <span className="text-xs uppercase tracking-wider opacity-70 ml-auto">{flag.severity}</span>
                      </div>
                      <p className="text-sm opacity-80 ml-4">{flag.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiSummary.summary && (
              <div>
                <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-3">Executive Summary</div>
                <div className="bg-[#0f1e35] border border-[#1e3048] px-6 py-5">
                  <p className="text-[#e8edf4] text-sm leading-relaxed whitespace-pre-wrap">
                    {aiSummary.summary}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sign-off */}
        <SignOffSection
          handoverId={id}
          status={handover.status}
          estimator={handover.estimator}
          estimatorSignedAt={handover.estimator_signed_at?.toISOString() ?? null}
          cm={handover.cm}
          cmSignedAt={handover.cm_signed_at?.toISOString() ?? null}
          currentUserRole={user.role}
        />

        <div className="mt-6">
          <Link href={`/handovers/${id}`} className="text-[#7a8ca8] text-xs hover:text-[#e8edf4] tracking-wider uppercase transition-colors">
            ← View full handover
          </Link>
        </div>
      </main>
    </div>
  );
}
