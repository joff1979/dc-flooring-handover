import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandoverStatus, Role } from "@prisma/client";

const STATUS_LABELS: Record<HandoverStatus, string> = {
  DRAFT: "Draft",
  AWAITING_ESTIMATOR: "Awaiting Estimator",
  AWAITING_CM: "Awaiting CM",
  SIGNED_OFF: "Signed Off",
  LOCKED: "Locked",
};

const STATUS_COLORS: Record<HandoverStatus, string> = {
  DRAFT: "bg-[#162540] text-[#7a8ca8] border-[#2a3f58]",
  AWAITING_ESTIMATOR: "bg-amber-950/30 text-amber-400 border-amber-900/50",
  AWAITING_CM: "bg-blue-950/30 text-blue-400 border-blue-900/50",
  SIGNED_OFF: "bg-green-950/30 text-green-400 border-green-900/50",
  LOCKED: "bg-green-950/30 text-green-300 border-green-800/50",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const where = user.role === Role.ADMIN
    ? {}
    : {
        OR: [
          { created_by: user.id },
          { estimator_id: user.id },
          { cm_id: user.id },
        ],
      };

  const handovers = await prisma.handover.findMany({
    where,
    include: { project: true },
    orderBy: { updated_at: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e8edf4] tracking-tight">Handovers</h1>
          <p className="text-[#7a8ca8] text-sm mt-1">
            {user.role === Role.ADMIN ? "All handovers" : "Your handovers"}
          </p>
        </div>
        <Link
          href="/handovers/new"
          className="shrink-0 bg-[#29B6D5] hover:bg-[#1aa8c4] text-black text-xs font-bold tracking-widest uppercase px-4 sm:px-5 py-2.5 transition-colors"
        >
          + New
        </Link>
      </div>

      {handovers.length === 0 ? (
        <EmptyState role={user.role} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block border border-[#1e3048] bg-[#0f1e35]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e3048]">
                  <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Project</th>
                  <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal hidden md:table-cell">Client</th>
                  <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Status</th>
                  <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal hidden lg:table-cell">Updated</th>
                  <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {handovers.map((h, i) => (
                  <tr
                    key={h.id}
                    className={`border-b border-[#162540] hover:bg-[#112035] transition-colors ${i === handovers.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-4 py-3 text-[#e8edf4] font-medium">{h.project.name}</td>
                    <td className="px-4 py-3 text-[#7a8ca8] hidden md:table-cell">{h.project.client}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs border ${STATUS_COLORS[h.status]}`}>
                        {STATUS_LABELS[h.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#7a8ca8] text-xs hidden lg:table-cell">
                      {new Date(h.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {h.status === "DRAFT" ? (
                          <Link href={`/handovers/${h.id}/edit`} className="text-[#29B6D5] hover:underline text-xs tracking-wider uppercase">
                            Continue
                          </Link>
                        ) : (
                          <Link href={`/handovers/${h.id}`} className="text-[#29B6D5] hover:underline text-xs tracking-wider uppercase">
                            View
                          </Link>
                        )}
                        {(h.status === "AWAITING_ESTIMATOR" || h.status === "AWAITING_CM") && (
                          <Link href={`/handovers/${h.id}/sign`} className="text-blue-400 hover:underline text-xs tracking-wider uppercase">
                            Sign
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-2">
            {handovers.map((h) => (
              <div key={h.id} className="border border-[#1e3048] bg-[#0f1e35] px-4 py-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-[#e8edf4] text-sm font-medium">{h.project.name}</div>
                    <div className="text-[#7a8ca8] text-xs mt-0.5">{h.project.client}</div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 text-xs border ${STATUS_COLORS[h.status]}`}>
                    {STATUS_LABELS[h.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-[#162540]">
                  {h.status === "DRAFT" ? (
                    <Link href={`/handovers/${h.id}/edit`} className="text-[#29B6D5] text-xs tracking-wider uppercase">
                      Continue &rarr;
                    </Link>
                  ) : (
                    <Link href={`/handovers/${h.id}`} className="text-[#29B6D5] text-xs tracking-wider uppercase">
                      View &rarr;
                    </Link>
                  )}
                  {(h.status === "AWAITING_ESTIMATOR" || h.status === "AWAITING_CM") && (
                    <Link href={`/handovers/${h.id}/sign`} className="text-blue-400 text-xs tracking-wider uppercase">
                      Sign &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ role }: { role: string }) {
  const steps =
    role === "ESTIMATOR"
      ? [
          { n: "1", title: "Create a handover", desc: "Click New above to start a new project handover." },
          { n: "2", title: "Fill in all four sections", desc: "Complete project details, scope, risks, and delivery information." },
          { n: "3", title: "Generate the AI summary", desc: "The AI will analyse your data and create a structured handover document." },
          { n: "4", title: "Sign off and hand over", desc: "Sign as estimator, then the Contract Manager signs to lock the handover." },
        ]
      : role === "CONTRACT_MANAGER"
      ? [
          { n: "1", title: "Wait for an estimator handover", desc: "Handovers created by estimators will appear here once generated." },
          { n: "2", title: "Review the AI summary", desc: "Check key facts, flags, and actions raised by the estimator." },
          { n: "3", title: "Sign off to lock", desc: "Once the estimator has signed, you can sign to lock the handover." },
        ]
      : [
          { n: "1", title: "Add users", desc: "Go to Admin > Users to create estimator and contract manager accounts." },
          { n: "2", title: "Create a handover", desc: "Use New Handover to see the full flow in action." },
          { n: "3", title: "Monitor all activity", desc: "Admin > All Handovers gives you a live view of every handover in the system." },
        ];

  return (
    <div className="border border-[#1e3048] bg-[#0f1e35]">
      <div className="px-6 py-8 border-b border-[#1e3048]">
        <div className="text-[#29B6D5] text-xs tracking-[0.3em] uppercase mb-2">Getting started</div>
        <h2 className="text-[#e8edf4] text-lg font-bold">No handovers yet</h2>
        <p className="text-[#7a8ca8] text-sm mt-1">Here&apos;s how the handover process works.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1e3048]">
        {steps.map((step) => (
          <div key={step.n} className="px-6 py-5">
            <div className="text-[#29B6D5] text-2xl font-bold mb-3">{step.n}</div>
            <div className="text-[#e8edf4] text-sm font-medium mb-1">{step.title}</div>
            <div className="text-[#7a8ca8] text-xs leading-relaxed">{step.desc}</div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-[#1e3048]">
        <Link
          href="/handovers/new"
          className="inline-block bg-[#29B6D5] hover:bg-[#1aa8c4] text-black text-xs font-bold tracking-widest uppercase px-5 py-2.5 transition-colors"
        >
          + Create First Handover
        </Link>
      </div>
    </div>
  );
}
