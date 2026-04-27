import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./client";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: "asc" },
    include: {
      _count: {
        select: {
          handovers_created: true,
          handovers_estimator: true,
          handovers_cm: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-[#29B6D5] text-xs tracking-[0.3em] uppercase mb-1">Admin</div>
          <h1 className="text-xl font-bold text-[#e8edf4] tracking-tight">Users</h1>
        </div>
        <AdminUsersClient.AddButton />
      </div>

      <div className="border border-[#1e3048] bg-[#0f1e35]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e3048]">
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Name</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Email</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Role</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Handovers</th>
              <th className="text-left px-4 py-3 text-[#7a8ca8] text-xs tracking-widest uppercase font-normal">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr
                key={u.id}
                className={`border-b border-[#162540] ${i === users.length - 1 ? "border-b-0" : ""}`}
              >
                <td className="px-4 py-3 text-[#e8edf4] font-medium">{u.name}</td>
                <td className="px-4 py-3 text-[#7a8ca8]">{u.email}</td>
                <td className="px-4 py-3">
                  <AdminUsersClient.RoleBadge userId={u.id} currentRole={u.role} />
                </td>
                <td className="px-4 py-3 text-[#7a8ca8] text-xs">
                  {u._count.handovers_created + u._count.handovers_estimator + u._count.handovers_cm}
                </td>
                <td className="px-4 py-3 text-[#7a8ca8] text-xs">
                  {new Date(u.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminUsersClient.DeleteButton userId={u.id} userName={u.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminUsersClient.AddUserModal />
    </div>
  );
}
