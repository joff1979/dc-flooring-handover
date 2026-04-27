"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = ["ESTIMATOR", "CONTRACT_MANAGER", "ADMIN"] as const;
type Role = typeof ROLES[number];

const ROLE_LABELS: Record<Role, string> = {
  ESTIMATOR: "Estimator",
  CONTRACT_MANAGER: "Contract Manager",
  ADMIN: "Admin",
};

const ROLE_COLORS: Record<Role, string> = {
  ESTIMATOR: "text-blue-400 border-blue-900/50 bg-blue-950/20",
  CONTRACT_MANAGER: "text-purple-400 border-purple-900/50 bg-purple-950/20",
  ADMIN: "text-amber-400 border-amber-900/50 bg-amber-950/20",
};

function AddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          (window as unknown as { __openAddUser?: () => void }).__openAddUser?.();
        }}
        className="bg-[#29B6D5] hover:bg-[#1aa8c4] text-black text-xs font-bold tracking-widest uppercase px-5 py-2.5 transition-colors"
      >
        + Add User
      </button>
    </>
  );
}

function RoleBadge({ userId, currentRole }: { userId: string; currentRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [saving, setSaving] = useState(false);

  async function handleChange(newRole: Role) {
    setSaving(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setRole(newRole);
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value as Role)}
      disabled={saving}
      className={`text-xs border px-2 py-1 bg-transparent cursor-pointer focus:outline-none ${ROLE_COLORS[role]}`}
    >
      {ROLES.map((r) => (
        <option key={r} value={r} className="bg-[#0f1e35] text-[#e8edf4]">
          {ROLE_LABELS[r]}
        </option>
      ))}
    </select>
  );
}

function DeleteButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove ${userName} from the system? This cannot be undone.`)) return;
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[#7a8ca8] hover:text-red-400 text-xs tracking-wider uppercase transition-colors"
    >
      {loading ? "..." : "Remove"}
    </button>
  );
}

function AddUserModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("ESTIMATOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (typeof window !== "undefined") {
    (window as unknown as { __openAddUser?: () => void }).__openAddUser = () => setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create user");
      setLoading(false);
      return;
    }
    setOpen(false);
    setName("");
    setEmail("");
    setRole("ESTIMATOR");
    setLoading(false);
    router.refresh();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
      <div
        className="bg-[#0f1e35] border border-[#1e3048] w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[#29B6D5] text-xs tracking-[0.3em] uppercase mb-1">Admin</div>
        <h2 className="text-lg font-bold text-[#e8edf4] mb-6">Add User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[#7a8ca8] text-xs tracking-widest uppercase block mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#0a1628] border border-[#1e3048] text-[#e8edf4] text-sm px-3 py-2.5 focus:outline-none focus:border-[#29B6D5]"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="text-[#7a8ca8] text-xs tracking-widest uppercase block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0a1628] border border-[#1e3048] text-[#e8edf4] text-sm px-3 py-2.5 focus:outline-none focus:border-[#29B6D5]"
              placeholder="john@dcflooring.com"
            />
          </div>
          <div>
            <label className="text-[#7a8ca8] text-xs tracking-widest uppercase block mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-[#0a1628] border border-[#1e3048] text-[#e8edf4] text-sm px-3 py-2.5 focus:outline-none focus:border-[#29B6D5]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          <p className="text-[#7a8ca8] text-xs leading-relaxed">
            The user must also be created in Supabase Auth with the same email before they can log in.
          </p>

          {error && (
            <p className="text-red-400 text-sm border border-red-900/50 bg-red-950/20 px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#29B6D5] hover:bg-[#1aa8c4] text-black font-bold tracking-widest uppercase text-xs py-2.5 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 border border-[#1e3048] text-[#7a8ca8] hover:text-[#e8edf4] text-xs tracking-widest uppercase transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const AdminUsersClient = { AddButton, RoleBadge, DeleteButton, AddUserModal };
export default AdminUsersClient;
