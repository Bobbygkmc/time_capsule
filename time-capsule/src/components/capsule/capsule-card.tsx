"use client";

import { motion } from "framer-motion";

type CapsuleStatus = "LOCKED" | "UNLOCKED";

interface CapsuleCardProps {
  title: string;
  unlockAt: Date;
  status: CapsuleStatus;
  itemCount: number;
  index?: number;
  onClick?: () => void;
}

export function CapsuleCard({
  title,
  unlockAt,
  status,
  itemCount,
  index = 0,
  onClick,
}: CapsuleCardProps) {
  const isLocked = status === "LOCKED";
  const daysUntil = Math.ceil(
    (unlockAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  const unlockLabel =
    daysUntil > 0
      ? `Opens in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`
      : unlockAt.toLocaleDateString();

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group w-full rounded-xl border border-slate-700 bg-slate-900 p-5 text-left transition-colors hover:border-indigo-500/60 hover:bg-slate-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{title}</p>
          <p className="mt-0.5 text-sm text-slate-400">{unlockLabel}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isLocked
              ? "bg-amber-500/15 text-amber-400"
              : "bg-emerald-500/15 text-emerald-400"
          }`}
        >
          {isLocked ? "Locked" : "Unlocked"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 group-hover:text-slate-400">
        <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
      </div>

      {isLocked && (
        <motion.div
          className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-800"
          initial={false}
        >
          <motion.div
            className="h-full rounded-full bg-indigo-600"
            initial={{ width: "0%" }}
            animate={{
              width: `${Math.max(0, Math.min(100, 100 - (daysUntil / 365) * 100))}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.07 + 0.2 }}
          />
        </motion.div>
      )}
    </motion.button>
  );
}
