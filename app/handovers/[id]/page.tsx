import { notFound } from "next/navigation";
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
  scopeNotes?: string;
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

export default async function HandoverViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

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

  if (!handover) notFound();

  const aiSummary = handover.ai_summary as AISummary | null;

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {user && <Nav userName={user.name} userRole={user.role} />}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-[#29B6D5] text-xs tracking-[0.3em] uppercase mb-2">
              DC Flooring — Handover
            </div>
            <h1 className="text-2xl font-bold text-[#e8edf4] tracking-tight">
              {handover.project.name}
            </h1>
            <p className="text-[#7a8ca8] text-sm mt-1">{handover.project.client}</p>
          </div>
          <div className="text-right">
            <div className="text-[#7a8ca8] text-xs mb-1">Version {handover.version}</div>
            <div className="text-[#7a8ca8] text-xs">
              {new Date(handover.created_at).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric"
              })}
            </div>
          </div>
        </div>

        {/* Locked banner */}
        {handover.status === "LOCKED" && (
          <div className="bg-green-950/30 border border-green-800/50 px-4 py-3 mb-6 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-green-300 text-sm">
              This handover has been fully signed off and is locked.
            </span>
          </div>
        )}

        {!aiSummary ? (
          <div className="border border-[#1e3048] bg-[#0f1e35] p-8 text-center">
            <p className="text-[#7a8ca8] text-sm mb-4">No AI summary generated yet.</p>
            {user && handover.status === "DRAFT" && (
              <Link
                href={`/handovers/${id}/edit`}
                className="text-[#29B6D5] text-sm hover:underline"
              >
                Continue editing →
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Key Facts Grid */}
            {aiSummary.keyFacts && aiSummary.keyFacts.length > 0 && (
              <div className="mb-6">
                <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-3">Key Facts</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#1e3048]">
                  {aiSummary.keyFacts.map((fact, i) => (
                    <div key={i} className="bg-[#0f1e35] px-4 py-3">
                      <div className="text-[#7a8ca8] text-xs mb-1">{fact.label}</div>
                      <div className="text-[#e8edf4] text-sm font-medium">{fact.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Urgent Flags */}
            {aiSummary.urgentFlags && aiSummary.urgentFlags.length > 0 && (
              <div className="mb-6">
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
                        <span className="text-xs uppercase tracking-wider opacity-70 ml-auto">
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-sm opacity-80 ml-4">{flag.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Summary */}
            {aiSummary.summary && (
              <div className="mb-6">
                <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-3">Executive Summary</div>
                <div className="bg-[#0f1e35] border border-[#1e3048] px-6 py-5">
                  <p className="text-[#e8edf4] text-sm leading-relaxed whitespace-pre-wrap">
                    {aiSummary.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Actions Required */}
            {aiSummary.actionsRequired && aiSummary.actionsRequired.length > 0 && (
              <div className="mb-6">
                <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-3">
                  Actions Required
                </div>
                {/* Desktop table */}
                <div className="hidden sm:block border border-[#1e3048] bg-[#0f1e35]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1e3048]">
                        <th className="text-left px-4 py-2.5 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Action</th>
                        <th className="text-left px-4 py-2.5 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal w-32">Owner</th>
                        <th className="text-left px-4 py-2.5 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal w-40">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiSummary.actionsRequired.map((action, i) => (
                        <tr key={i} className={`border-b border-[#162540] ${i === (aiSummary.actionsRequired?.length ?? 0) - 1 ? "border-b-0" : ""}`}>
                          <td className="px-4 py-3 text-[#e8edf4]">{action.action}</td>
                          <td className="px-4 py-3 text-[#29B6D5] text-xs">{action.owner}</td>
                          <td className="px-4 py-3 text-[#7a8ca8] text-xs">{action.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                  {aiSummary.actionsRequired.map((action, i) => (
                    <div key={i} className="border border-[#1e3048] bg-[#0f1e35] px-4 py-3">
                      <p className="text-[#e8edf4] text-sm mb-2">{action.action}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-[#29B6D5] text-xs">{action.owner}</span>
                        <span className="text-[#7a8ca8] text-xs">{action.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scope Notes */}
            {aiSummary.scopeNotes && (
              <div className="mb-6">
                <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-3">Scope Notes</div>
                <div className="bg-[#0f1e35] border border-[#1e3048] px-6 py-4">
                  <p className="text-[#7a8ca8] text-sm leading-relaxed">{aiSummary.scopeNotes}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Version History */}
        {handover.versions.length > 0 && (
          <div className="mb-6">
            <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-3">Version History</div>
            <div className="border border-[#1e3048] bg-[#0f1e35]">
              {handover.versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[#162540] last:border-b-0">
                  <span className="text-[#7a8ca8] text-xs">v{v.version}</span>
                  <span className="text-[#7a8ca8] text-xs">{v.changer.name}</span>
                  <span className="text-[#7a8ca8] text-xs">
                    {new Date(v.changed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  {v.change_note && <span className="text-[#7a8ca8] text-xs">{v.change_note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign-off section */}
        {user && aiSummary && (
          <SignOffSection
            handoverId={id}
            status={handover.status}
            estimator={handover.estimator}
            estimatorSignedAt={handover.estimator_signed_at?.toISOString() ?? null}
            cm={handover.cm}
            cmSignedAt={handover.cm_signed_at?.toISOString() ?? null}
            currentUserRole={user.role}
          />
        )}
      </main>
    </div>
  );
}
