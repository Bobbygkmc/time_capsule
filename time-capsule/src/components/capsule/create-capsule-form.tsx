"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "~/trpc/react";

export function CreateCapsuleForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [unlockAt, setUnlockAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = api.capsule.create.useMutation({
    onSuccess: (capsule) => router.push(`/capsules/${capsule.id}`),
    onError: (e) => setError(e.message),
  });

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0]!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    create.mutate({ title, unlockAt: new Date(unlockAt) });
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6"
    >
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Title</label>
        <input
          required
          maxLength={120}
          placeholder="My 2030 capsule"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Unlock date</label>
        <input
          required
          type="date"
          min={minDateStr}
          value={unlockAt}
          onChange={(e) => setUnlockAt(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white transition focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
        />
        <p className="text-xs text-slate-500">
          You (and any recipients) will be emailed when this date arrives.
        </p>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}

      <motion.button
        type="submit"
        disabled={create.isPending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {create.isPending ? "Sealing…" : "Seal capsule"}
      </motion.button>
    </motion.form>
  );
}
