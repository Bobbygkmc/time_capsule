import { createClient } from "~/lib/supabase/client";

export const CAPSULE_BUCKET = "capsule-items";

export type UploadResult =
  | { ok: true; path: string; publicUrl: string }
  | { ok: false; error: string };

export async function uploadCapsuleFile(
  capsuleId: string,
  file: File,
): Promise<UploadResult> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${capsuleId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(CAPSULE_BUCKET)
    .upload(path, file, { upsert: false });

  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from(CAPSULE_BUCKET).getPublicUrl(path);
  return { ok: true, path, publicUrl: data.publicUrl };
}

export async function deleteCapsuleFile(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(CAPSULE_BUCKET).remove([path]);
}
