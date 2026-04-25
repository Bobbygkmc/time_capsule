"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "~/lib/supabase/client";

export function NavBar({ email }: { email: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-sm font-semibold text-white">
          Time Capsule
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-slate-500 sm:block">{email}</span>
          <button
            onClick={signOut}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
