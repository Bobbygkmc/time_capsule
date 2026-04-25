"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CapsuleCard } from "./capsule-card";
import type { CapsuleStatus } from "../../../generated/prisma";

interface CapsuleRow {
  id: string;
  title: string;
  unlockAt: Date;
  status: CapsuleStatus;
  _count: { items: number };
}

export function CapsuleList({ capsules }: { capsules: CapsuleRow[] }) {
  const router = useRouter();

  if (capsules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-dashed border-slate-700 py-20 text-center"
      >
        <p className="text-slate-500">No capsules yet — create your first one.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {capsules.map((c, i) => (
        <CapsuleCard
          key={c.id}
          title={c.title}
          unlockAt={c.unlockAt}
          status={c.status}
          itemCount={c._count.items}
          index={i}
          onClick={() => router.push(`/capsules/${c.id}`)}
        />
      ))}
    </div>
  );
}
