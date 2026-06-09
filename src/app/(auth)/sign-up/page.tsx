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

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen bg-bone text-walnut font-body overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <PaperTex seed={43} />
        <main className="w-full max-w-md bg-bone-hi border border-rule rounded-xl p-12 shadow-xl shadow-walnut/5 relative z-10">
          <Hourglass size={64} progress={0.5} accent className="mx-auto mb-8" />
          <h1 className="font-display text-3xl font-normal mb-6 leading-tight tracking-tight">
            Check your <span className="italic text-moss">inbox</span>.
          </h1>
          <p className="text-walnut-soft leading-relaxed">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. 
            Once verified, you can begin your first capsule.
          </p>
          <div className="mt-12">
            <Link href="/sign-in">
              <GardenButton ghost size="md">Back to sign in</GardenButton>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bone text-walnut font-body overflow-hidden flex flex-col items-center justify-center p-6">
      <PaperTex seed={42} />

      <Link href="/" className="mb-12 flex items-center gap-3">
        <Hourglass size={32} progress={0.45} accent />
        <span className="font-display text-2xl font-medium tracking-tight">Time Capsule</span>
      </Link>

      <main className="w-full max-w-md bg-bone-hi border border-rule rounded-xl p-8 md:p-12 shadow-xl shadow-walnut/5 relative z-10">
        <MarginNote rotate={-2} size={20} className="mb-2">a small, quiet practice</MarginNote>
        <h1 className="font-display text-4xl font-normal mb-8 leading-none tracking-tight">
          Begin a <span className="italic text-moss">capsule</span>.
        </h1>

        <form onSubmit={handleSignUp} className="space-y-8">
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
            hint="At least 8 characters."
          />

          {error && (
            <p className="text-terra text-sm italic">{error}</p>
          )}

          <div className="pt-4">
            <GardenButton type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Start your garden →"}
            </GardenButton>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-rule-soft text-center space-y-4">
          <p className="text-sm text-walnut-mute">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-terra hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
