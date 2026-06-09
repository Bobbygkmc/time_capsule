"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hourglass } from "@/components/design/Hourglass";
import { PaperTex } from "@/components/design/PaperTex";
import { GardenButton } from "@/components/design/GardenButton";
import { MarginNote } from "@/components/design/MarginNote";
import { PaperInput } from "@/components/design/PaperInput";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="relative min-h-screen bg-bone text-walnut font-body overflow-hidden flex flex-col items-center justify-center p-6">
      <PaperTex seed={42} />

      <Link href="/" className="mb-12 flex items-center gap-3">
        <Hourglass size={32} progress={0.45} accent />
        <span className="font-display text-2xl font-medium tracking-tight">Time Capsule</span>
      </Link>

      <main className="w-full max-w-md bg-bone-hi border border-rule rounded-xl p-8 md:p-12 shadow-xl shadow-walnut/5 relative z-10">
        <MarginNote rotate={-2} size={20} className="mb-2">welcome back</MarginNote>
        <h1 className="font-display text-4xl font-normal mb-8 leading-none tracking-tight">
          Enter the <span className="italic text-moss">garden</span>.
        </h1>

        <form onSubmit={handleSignIn} className="space-y-8">
          <PaperInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />

          <PaperInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {error && (
            <p className="text-terra text-sm italic">{error}</p>
          )}

          <div className="pt-4">
            <GardenButton type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in →"}
            </GardenButton>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-rule-soft text-center space-y-4">
          <p className="text-sm text-walnut-mute">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-terra hover:underline">
              Start one here
            </Link>
          </p>
        </div>
      </main>

      <div className="mt-12">
        <p className="text-xs text-walnut-mute italic">
          Takes about ten unhurried minutes to plant your first capsule.
        </p>
      </div>
    </div>
  );
}
