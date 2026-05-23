"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "~/trpc/react";
import { FileUpload } from "./file-upload";
import type { CapsuleStatus, CapsuleItemType } from "../../../generated/prisma";

interface Item {
  id: string;
  type: CapsuleItemType;
  content: string | null;
  storagePath: string | null;
  createdAt: Date;
}

interface CapsuleDetailProps {
  capsule: {
    id: string;
    title: string;
    unlockAt: Date;
    status: CapsuleStatus;
    items: Item[];
  };
}

export function CapsuleDetail({ capsule }: CapsuleDetailProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const isLocked = capsule.status === "LOCKED";
  const isPast = capsule.unlockAt <= new Date();

  const [text, setText] = useState("");
  const [textError, setTextError] = useState<string | null>(null);

  const addText = api.capsule.addTextItem.useMutation({
    onSuccess: async () => {
      await utils.capsule.get.invalidate({ id: capsule.id });
      setText("");
    },
    onError: (e) => setTextError(e.message),
  });

  const deleteCapsule = api.capsule.delete.useMutation({
    onSuccess: () => router.push("/dashboard"),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{capsule.title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isLocked
              ? `Unlocks ${capsule.unlockAt.toLocaleDateString("en-US", { dateStyle: "long" })}`
              : `Unlocked on ${capsule.unlockAt.toLocaleDateString("en-US", { dateStyle: "long" })}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isLocked
                ? "bg-amber-500/15 text-amber-400"
                : "bg-emerald-500/15 text-emerald-400"
            }`}
          >
            {isLocked ? "Locked" : "Unlocked"}
          </span>
          <button
            onClick={() => deleteCapsule.mutate({ id: capsule.id })}
            disabled={deleteCapsule.isPending}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
          >
            Delete
          </button>
        </div>
      </motion.div>

      {/* Items */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Contents · {capsule.items.length} item{capsule.items.length !== 1 ? "s" : ""}
        </h2>

        {isLocked && !isPast ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-slate-700 py-12 text-center"
          >
            <p className="text-slate-500">
              Contents are sealed until {capsule.unlockAt.toLocaleDateString()}.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {capsule.items.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-slate-500"
              >
                No items yet.
              </motion.p>
            ) : (
              capsule.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300 whitespace-pre-wrap"
                >
                  {item.content}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Add text item — only if locked and not yet past unlock date */}
      {/* File upload — only while capsule is locked */}
      {isLocked && !isPast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-5"
        >
          <h2 className="text-sm font-semibold text-slate-300">Add files</h2>
          <FileUpload
            capsuleId={capsule.id}
            onUploaded={() => utils.capsule.get.invalidate({ id: capsule.id })}
          />
        </motion.div>
      )}

      {isLocked && !isPast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-5"
        >
          <h2 className="text-sm font-semibold text-slate-300">Add a note</h2>
          <textarea
            rows={4}
            placeholder="Write something to your future self…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none"
          />
          {textError && (
            <p className="text-xs text-red-400">{textError}</p>
          )}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={addText.isPending || !text.trim()}
            onClick={() => {
              setTextError(null);
              addText.mutate({ capsuleId: capsule.id, content: text });
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {addText.isPending ? "Adding…" : "Add note"}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
