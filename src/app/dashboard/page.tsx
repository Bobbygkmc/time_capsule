"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Hourglass } from "@/components/design/Hourglass";
import { Sprig } from "@/components/design/Sprig";
import { PaperTex } from "@/components/design/PaperTex";
import { GardenButton } from "@/components/design/GardenButton";
import { MarginNote } from "@/components/design/MarginNote";
import { CapsuleCard } from "@/components/design/CapsuleCard";

const SAMPLE_CAPSULES = {
  growing: [
    {
      id: 1,
      title: "Letter to myself, year one sober",
      from: "for yourself · written 22 Sep 2025",
      sealed: "22 Sep 2025",
      unlocks: "22 Sep 2026",
      remaining: "4 mo, 5 d",
      progress: 0.66,
      accent: true,
    },
    {
      id: 2,
      title: "End of the worst year",
      from: "for yourself",
      sealed: "2 Jan 2026",
      unlocks: "31 Dec 2026",
      remaining: "7 mo, 14 d",
      progress: 0.38,
      accent: true,
    },
    {
      id: 3,
      title: "The cabin reunion",
      from: "for 6 friends",
      sealed: "14 Jun 2024",
      unlocks: "14 Jun 2029",
      remaining: "3 years",
      progress: 0.39,
    },
    {
      id: 4,
      title: "Ten years from this kitchen table",
      from: "for Sam",
      sealed: "11 Aug 2026",
      unlocks: "11 Aug 2036",
      remaining: "10 years",
      progress: 0.06,
    },
    {
      id: 5,
      title: "For Maya, on your sixteenth",
      from: "for Maya · from Mom & Dad",
      sealed: "4 Mar 2026",
      unlocks: "4 Mar 2042",
      remaining: "15y 9m",
      progress: 0.01,
    },
    {
      id: 6,
      title: "If I am not there",
      from: "for Anna · on her 30th",
      sealed: "17 May 2026",
      unlocks: "17 May 2058",
      remaining: "32 years",
      progress: 0.0,
      posthumous: true,
    },
  ],
};

export default function DashboardPage() {
  const { data: capsules, isLoading } = trpc.capsule.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <Hourglass size={48} progress={0.5} accent />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bone text-walnut font-body overflow-x-hidden">
      <PaperTex seed={9} />

      {/* Top bar (Simplified for now) */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 border-b border-rule bg-bone/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Hourglass size={20} progress={0.45} accent />
          <span className="font-display text-lg font-medium tracking-tight">Time Capsule</span>
        </div>
        <div className="flex items-center gap-8 text-[13px] text-walnut-soft">
          <span className="text-walnut font-medium border-b-2 border-terra pb-1">Garden</span>
          <span className="hidden md:inline">Drafts <span className="text-walnut-mute ml-1">1</span></span>
          <span className="hidden md:inline">Opened <span className="text-walnut-mute ml-1">1</span></span>
          <div className="w-8 h-8 rounded-full bg-moss text-bone flex items-center justify-center font-display text-sm font-medium">j</div>
        </div>
      </nav>

      <main className="relative px-6 py-12 md:px-12 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <MarginNote rotate={-2} size={22}>Sunday, 17 May 2026</MarginNote>
            <h2 className="font-display text-4xl md:text-5xl font-normal mt-2 leading-none tracking-tight">
              Six things <span className="italic text-moss">growing</span> in the garden.
            </h2>
          </div>
          <Link href="/capsule/new">
            <GardenButton size="lg">+ Plant a new capsule</GardenButton>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-7 text-[13.5px] border-b border-rule mb-12">
          <button className="text-walnut font-medium border-b-2 border-terra pb-3.5 -mb-px">
            Growing <span className="text-walnut-mute ml-1.5">6</span>
          </button>
          <button className="text-walnut-soft pb-3.5">
            Drafts <span className="text-walnut-mute ml-1.5">1</span>
          </button>
          <button className="text-walnut-soft pb-3.5">
            Bloomed <span className="text-walnut-mute ml-1.5">1</span>
          </button>
          <div className="flex-1" />
          <span className="hidden md:inline text-walnut-mute text-xs">sorted by opening date · nearest first</span>
        </div>

        {/* Hero row — nearest unlock (Featured) */}
        {capsules && capsules.length > 0 ? (
          <>
            <div className="mb-12">
              <div className="relative group">
                <CapsuleCard {...capsules[0]} large />
                <Sprig size={140} color="var(--color-terra)" className="absolute -top-3 right-5 rotate-[20deg] opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity" />
              </div>
            </div>

            {/* Grid of the rest */}
            <div>
              <div className="flex items-center justify-between border-b border-rule pb-2.5 mb-6">
                <div className="text-[10.5px] text-walnut-mute tracking-[0.22em] uppercase font-medium">
                  {capsules.length > 1 ? "THE REST OF THE GARDEN" : "YOUR GARDEN"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {capsules.slice(1).map((cap) => (
                  <CapsuleCard key={cap.id} {...cap} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-24 text-center border border-dashed border-rule rounded-xl bg-bone-hi/50">
            <Hourglass size={48} progress={0.1} className="mx-auto mb-6 opacity-30" />
            <p className="text-walnut-soft italic">No capsules have been planted yet.</p>
            <Link href="/capsule/new" className="mt-4 inline-block text-terra hover:underline">
              Plant your first one &rarr;
            </Link>
          </div>
        )}
      </main>

      {/* Marginalia */}
      <footer className="px-6 py-8 md:px-12 max-w-7xl mx-auto mt-12 border-t border-rule flex flex-col md:flex-row items-center justify-between gap-6">
        <MarginNote rotate={-1} size={18}>
          Next: 22 September — four months and a few days.
        </MarginNote>
        <div className="flex items-center gap-3.5 text-xs text-walnut-mute">
          <Hourglass size={16} progress={0.66} accent />
          <span>The closer the sand, the closer the date.</span>
        </div>
      </footer>
    </div>
  );
}
