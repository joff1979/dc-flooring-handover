"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1628] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-[#29B6D5] text-xs tracking-[0.3em] uppercase mb-2">DC Flooring</div>
          <h1 className="text-2xl font-bold text-[#e8edf4] tracking-tight">Handover Portal</h1>
        </div>

        <div className="bg-[#0f1e35] border border-[#1e3048] p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#7a8ca8] text-xs tracking-widest uppercase">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-[#1a1a1a] border-[#1e3048] text-[#e8edf4] focus:border-[#29B6D5] focus:ring-0 rounded-none h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#7a8ca8] text-xs tracking-widest uppercase">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-[#1a1a1a] border-[#1e3048] text-[#e8edf4] focus:border-[#29B6D5] focus:ring-0 rounded-none h-11"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm border border-red-900/50 bg-red-950/20 px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#29B6D5] hover:bg-[#1aa8c4] text-black font-bold tracking-widest uppercase text-xs h-11 rounded-none transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
