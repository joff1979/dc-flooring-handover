"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SignOffSectionProps {
  handoverId: string;
  status: string;
  estimator: { id: string; name: string; email: string } | null;
  estimatorSignedAt: string | null;
  cm: { id: string; name: string; email: string } | null;
  cmSignedAt: string | null;
  currentUserRole: string;
}

export default function SignOffSection({
  handoverId,
  status,
  estimator,
  estimatorSignedAt,
  cm,
  cmSignedAt,
  currentUserRole,
}: SignOffSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSignAsEstimator =
    status === "AWAITING_ESTIMATOR" && currentUserRole === "ESTIMATOR";
  const canSignAsCM =
    status === "AWAITING_CM" && currentUserRole === "CONTRACT_MANAGER";

  async function handleSign(role: "ESTIMATOR" | "CONTRACT_MANAGER") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/handovers/${handoverId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Sign-off failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  if (status === "DRAFT") return null;

  return (
    <div className="border border-[#1e3048] bg-[#0f1e35]">
      <div className="px-6 py-4 border-b border-[#1e3048]">
        <div className="text-[#7a8ca8] text-xs tracking-widest uppercase">Sign-Off</div>
      </div>

      <div className="p-6 space-y-6">
        {/* Estimator sign-off */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-1">Estimator</div>
            {estimatorSignedAt ? (
              <div>
                <div className="text-[#e8edf4] text-sm">{estimator?.name}</div>
                <div className="text-[#7a8ca8] text-xs mt-0.5">
                  Signed {new Date(estimatorSignedAt).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </div>
            ) : (
              <div className="text-[#7a8ca8] text-sm">Awaiting signature</div>
            )}
          </div>

          {canSignAsEstimator && (
            <Button
              onClick={() => handleSign("ESTIMATOR")}
              disabled={loading}
              className="bg-[#29B6D5] hover:bg-[#1aa8c4] text-black font-bold tracking-widest uppercase text-xs h-9 px-5 rounded-none"
            >
              {loading ? "Signing..." : "Sign as Estimator"}
            </Button>
          )}

          {estimatorSignedAt && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-green-400 text-xs tracking-wider uppercase">Signed</span>
            </div>
          )}
        </div>

        <div className="border-t border-[#162540]"></div>

        {/* CM sign-off */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[#7a8ca8] text-xs tracking-widest uppercase mb-1">Contract Manager</div>
            {cmSignedAt ? (
              <div>
                <div className="text-[#e8edf4] text-sm">{cm?.name}</div>
                <div className="text-[#7a8ca8] text-xs mt-0.5">
                  Signed {new Date(cmSignedAt).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </div>
            ) : (
              <div className="text-[#7a8ca8] text-sm">
                {status === "AWAITING_CM"
                  ? "Awaiting signature"
                  : "Awaiting estimator sign-off first"}
              </div>
            )}
          </div>

          {canSignAsCM && (
            <Button
              onClick={() => handleSign("CONTRACT_MANAGER")}
              disabled={loading}
              className="bg-[#29B6D5] hover:bg-[#1aa8c4] text-black font-bold tracking-widest uppercase text-xs h-9 px-5 rounded-none"
            >
              {loading ? "Signing..." : "Sign as CM"}
            </Button>
          )}

          {cmSignedAt && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-green-400 text-xs tracking-wider uppercase">Signed</span>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm border border-red-900/50 bg-red-950/20 px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
