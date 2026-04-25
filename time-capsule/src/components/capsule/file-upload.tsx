"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadCapsuleFile } from "~/lib/storage";
import { api } from "~/trpc/react";
import type { CapsuleItemType } from "../../../generated/prisma";

const ACCEPTED = {
  "image/*": "IMAGE",
  "video/*": "VIDEO",
  "application/pdf": "FILE",
  "application/zip": "FILE",
} as const;

function mimeToType(mime: string): "IMAGE" | "VIDEO" | "FILE" {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  return "FILE";
}

interface FileUploadProps {
  capsuleId: string;
  onUploaded: () => void;
}

interface FileEntry {
  name: string;
  state: "uploading" | "done" | "error";
  error?: string;
}

export function FileUpload({ capsuleId, onUploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const addFileItem = api.capsule.addFileItem.useMutation({ onSuccess: onUploaded });

  async function handleFiles(selected: FileList | null) {
    if (!selected?.length) return;

    const incoming = Array.from(selected).map<FileEntry>((f) => ({
      name: f.name,
      state: "uploading",
    }));
    setFiles((prev) => [...prev, ...incoming]);

    await Promise.all(
      Array.from(selected).map(async (file, i) => {
        const result = await uploadCapsuleFile(capsuleId, file);
        if (!result.ok) {
          setFiles((prev) =>
            prev.map((e, j) =>
              j === prev.length - selected.length + i
                ? { ...e, state: "error", error: result.error }
                : e,
            ),
          );
          return;
        }

        await addFileItem.mutateAsync({
          capsuleId,
          storagePath: result.path,
          type: mimeToType(file.type) as Exclude<CapsuleItemType, "TEXT">,
        });

        setFiles((prev) =>
          prev.map((e, j) =>
            j === prev.length - selected.length + i
              ? { ...e, state: "done" }
              : e,
          ),
        );
      }),
    );
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-700 px-6 py-10 text-center transition hover:border-indigo-500/60 hover:bg-slate-900/50"
      >
        <p className="text-sm text-slate-400">
          Drag & drop files here, or{" "}
          <span className="text-indigo-400">click to browse</span>
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Images · Videos · PDFs · ZIPs
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={Object.keys(ACCEPTED).join(",")}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <AnimatePresence initial={false}>
        {files.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm"
          >
            <span className="truncate text-slate-300">{f.name}</span>
            <span
              className={
                f.state === "done"
                  ? "text-emerald-400"
                  : f.state === "error"
                  ? "text-red-400"
                  : "text-slate-500"
              }
            >
              {f.state === "done"
                ? "Uploaded"
                : f.state === "error"
                ? f.error ?? "Error"
                : "Uploading…"}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
