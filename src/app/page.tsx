"use client";

import Link from "next/link";
import { Hourglass } from "@/components/design/Hourglass";
import { Sprig } from "@/components/design/Sprig";
import { PaperTex } from "@/components/design/PaperTex";
import { GardenButton } from "@/components/design/GardenButton";
import { MarginNote } from "@/components/design/MarginNote";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-bone text-walnut font-body overflow-x-hidden">
      <PaperTex seed={4} />

      {/* Top bar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-16">
        <div className="flex items-center gap-3">
          <Hourglass size={22} progress={0.4} accent />
          <span className="font-display text-xl font-medium tracking-tight">Time Capsule</span>
        </div>
        <div className="hidden md:flex items-center gap-9 text-[13px] color-walnut-soft">
          <Link href="#idea" className="hover:text-walnut transition-colors">The idea</Link>
          <Link href="#how-it-works" className="hover:text-walnut transition-colors">How it works</Link>
          <Link href="#stories" className="hover:text-walnut transition-colors">Stories</Link>
          <Link href="/sign-in" className="hover:text-walnut transition-colors font-medium">Sign in</Link>
          <Link href="/capsule/new">
            <GardenButton size="sm">Begin a capsule</GardenButton>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 pt-12 pb-24 md:px-16 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <MarginNote rotate={-2} size={22} className="mb-4">
            — for things that need time —
          </MarginNote>
          <h1 className="font-display font-normal text-6xl md:text-[100px] leading-[0.98] tracking-tighter mt-4 mb-7 text-pretty">
            Plant something<br />
            for <span className="italic text-moss font-medium">later</span>.
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-walnut-soft max-w-lg mb-9">
            Letters, photographs, voices — sealed today, opened on a date that
            means something. A small, quiet practice of speaking across years.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/capsule/new">
              <GardenButton size="lg">Begin a capsule</GardenButton>
            </Link>
            <div className="text-[13.5px] text-walnut-mute max-w-[200px] md:max-w-none">
              Free to start · Takes about ten unhurried minutes.
            </div>
          </div>
        </div>

        {/* Hero Visual: Sample Capsule */}
        <div className="relative h-[400px] md:h-[600px] flex items-center justify-center">
          {/* Background Hourglass */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
            <Hourglass size={420} progress={0.38} accent stroke={2.4} />
          </div>
          
          {/* Drifting Sprigs */}
          <Sprig size={120} className="absolute top-10 left-0 md:left-10 -rotate-12 opacity-80" />
          <Sprig size={86} color="var(--color-terra)" className="absolute bottom-10 right-0 md:right-10 rotate-12 scale-x-[-1] opacity-80" />

          {/* Featured Card */}
          <div className="relative z-10 w-full max-w-[360px] p-8 bg-bone-hi border border-rule rounded-lg shadow-2xl shadow-walnut/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] text-walnut-mute tracking-[0.16em] uppercase">
                  sealed · 4 March 2026
                </div>
                <div className="font-display text-2xl md:text-3xl text-walnut mt-2.5 leading-tight italic font-normal">
                  For Maya,<br />on your sixteenth
                </div>
                <div className="text-[13px] text-walnut-soft mt-2.5">From Mom & Dad</div>
              </div>
              <Hourglass size={56} progress={0.04} accent />
            </div>
            <div className="h-px bg-rule my-6" />
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] text-walnut-mute tracking-[0.16em] uppercase">opens</div>
                <div className="font-display text-xl md:text-2xl text-walnut mt-1 font-medium">4 March 2042</div>
              </div>
              <div className="text-right">
                <div className="font-hand text-2xl md:text-3xl text-terra leading-none">15y 9m</div>
                <div className="text-[10.5px] text-walnut-mute tracking-[0.12em] uppercase mt-1">to wait</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE IDEA */}
      <section id="idea" className="px-6 py-24 md:px-16 border-t border-rule">
        <div className="flex items-center justify-between border-b border-rule pb-3 mb-14">
          <div className="text-[10.5px] text-walnut-mute tracking-[0.22em] uppercase font-medium">I · WHAT IT&apos;S FOR</div>
          <div className="text-[10.5px] text-walnut-mute tracking-[0.16em] font-medium uppercase">The idea</div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 md:gap-20 items-start">
          <h2 className="font-display text-4xl md:text-6xl font-normal leading-tight tracking-tight text-pretty">
            Not an inbox.<br />
            Not a vault.<br />
            <span className="italic text-moss">A letter to the future</span> —
            <br />
            and the patience to wait for it.
          </h2>
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-walnut-soft">
              Time Capsule is for things that don&apos;t deserve a notification.
              A note to a newborn for their twenty-first birthday. A message between
              two people sealed on a wedding day and opened on an anniversary. A
              letter to yourself, written at a turning point, opened years later
              when you&apos;ve forgotten what you knew.
            </p>
            <p className="text-lg leading-relaxed text-walnut-soft">
              We hold what you put in here, encrypted, untouched, and out of
              reach — including ours — until the day you chose. Then we let it open.
            </p>
            <div className="pt-8 flex flex-wrap gap-8 text-[13px] text-walnut-mute">
              <span>· End-to-end encrypted</span>
              <span>· Zero-knowledge</span>
              <span>· No early peeks. Ever.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 md:px-16 border-t border-rule flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Hourglass size={18} progress={1} accent />
          <span className="font-display text-lg font-medium">Time Capsule</span>
        </div>
        <p className="text-[13px] text-walnut-mute">
          &copy; {new Date().getFullYear()} Time Capsule. A small, quiet practice.
        </p>
      </footer>
    </div>
  );
}
