import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HandoverStatus } from "@prisma/client";

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

export default async function AdminHandoversPage() {
  const handovers = await prisma.handover.findMany({
    include: {
      project: true,
      creator: { select: { name: true } },
      estimator: { select: { name: true } },
      cm: { select: { name: true } },
    },
    orderBy: { updated_at: "desc" },
  });

  const counts = {
    total: handovers.length,
    draft: handovers.filter((h) => h.status === "DRAFT").length,
    pending: handovers.filter((h) => h.status === "AWAITING_ESTIMATOR" || h.status === "AWAITING_CM").length,
    locked: handovers.filter((h) => h.status === "LOCKED").length,
  };

  return (
    <div>
      <div className="mb-8">
        <div className="text-[#29B6D5] text-xs tracking-[0.3em] uppercase mb-1">Admin</div>
        <h1 className="text-xl font-bold text-[#e8edf4] tracking-tight">All Handovers</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1e3048] mb-8">
        {[
          { label: "Total", value: counts.total },
          { label: "Draft", value: counts.draft },
          { label: "Pending Sign-Off", value: counts.pending },
          { label: "Locked", value: counts.locked },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0f1e35] px-6 py-4">
            <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-[#e8edf4]">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block border border-[#1e3048] bg-[#0f1e35]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e3048]">
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Project</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Client</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Status</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal hidden lg:table-cell">Created By</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal hidden lg:table-cell">Estimator</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal hidden lg:table-cell">CM</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal hidden md:table-cell">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {handovers.map((h, i) => (
              <tr key={h.id} className={`border-b border-[#162540] hover:bg-[#112035] transition-colors ${i === handovers.length - 1 ? "border-b-0" : ""}`}>
                <td className="px-4 py-3 text-[#e8edf4] font-medium">{h.project.name}</td>
                <td className="px-4 py-3 text-[#7a8ca8]">{h.project.client}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs border ${STATUS_COLORS[h.status]}`}>
                    {STATUS_LABELS[h.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#7a8ca8] text-xs hidden lg:table-cell">{h.creator.name}</td>
                <td className="px-4 py-3 text-[#7a8ca8] text-xs hidden lg:table-cell">{h.estimator?.name ?? "-"}</td>
                <td className="px-4 py-3 text-[#7a8ca8] text-xs hidden lg:table-cell">{h.cm?.name ?? "-"}</td>
                <td className="px-4 py-3 text-[#7a8ca8] text-xs hidden md:table-cell">
                  {new Date(h.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={h.status === "DRAFT" ? `/handovers/${h.id}/edit` : `/handovers/${h.id}`} className="text-[#29B6D5] hover:underline text-xs tracking-wider uppercase">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <div className="pt-2 border-t border-[#162540]">
              <Link href={h.status === "DRAFT" ? `/handovers/${h.id}/edit` : `/handovers/${h.id}`} className="text-[#29B6D5] text-xs tracking-wider uppercase">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}