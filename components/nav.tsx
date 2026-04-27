"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  userName: string;
  userRole: string;
}

export default function Nav({ userName, userRole }: NavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (path: string) =>
    pathname === path
      ? "text-[#29B6D5]"
      : "text-[#7a8ca8] hover:text-[#e8edf4] transition-colors";

  return (
    <nav
      className="border-b border-[#1e3048] bg-[#060f1e]"
      style={{ boxShadow: "0 1px 0 0 rgba(41,182,213,0.15)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/dashboard" className="text-[#29B6D5] text-xs tracking-[0.3em] uppercase font-bold shrink-0">
            DC Flooring
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 text-xs tracking-widest uppercase">
            <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
            <Link href="/handovers/new" className={linkClass("/handovers/new")}>New Handover</Link>
            {userRole === "ADMIN" && (
              <>
                <Link href="/admin/users" className={pathname === "/admin/users" ? "text-[#29B6D5]" : "text-[#7a8ca8] hover:text-[#e8edf4] transition-colors"}>Users</Link>
                <Link href="/admin/handovers" className={pathname === "/admin/handovers" ? "text-[#29B6D5]" : "text-[#7a8ca8] hover:text-[#e8edf4] transition-colors"}>All Handovers</Link>
              </>
            )}
          </div>
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-[#7a8ca8] text-xs">{userName}</span>
          <span className="text-[#1e3048]">|</span>
          <span className="text-[#29B6D5] text-xs tracking-widest uppercase">{userRole.replace("_", " ")}</span>
          <form action="/auth/logout" method="POST">
            <button type="submit" className="text-[#7a8ca8] hover:text-[#e8edf4] text-xs tracking-widest uppercase transition-colors ml-2">
              Sign Out
            </button>
          </form>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#7a8ca8] hover:text-[#e8edf4] p-1"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1e3048] bg-[#060f1e] px-4 py-4 space-y-3">
          <div className="text-[#7a8ca8] text-xs mb-3">
            {userName} &mdash; <span className="text-[#29B6D5]">{userRole.replace("_", " ")}</span>
          </div>
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/handovers/new", label: "New Handover" },
            ...(userRole === "ADMIN" ? [
              { href: "/admin/users", label: "Users" },
              { href: "/admin/handovers", label: "All Handovers" },
            ] : []),
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block text-xs tracking-widest uppercase py-2 border-b border-[#162540] ${
                pathname === item.href ? "text-[#29B6D5]" : "text-[#7a8ca8]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <form action="/auth/logout" method="POST" className="pt-1">
            <button type="submit" className="text-[#7a8ca8] text-xs tracking-widest uppercase">
              Sign Out
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
