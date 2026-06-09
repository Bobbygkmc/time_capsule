import { CreateCapsuleForm } from "~/components/capsule/create-capsule-form";

export default function NewCapsulePage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create a capsule</h1>
        <p className="mt-1 text-sm text-slate-400">
          Seal your memories — they'll be waiting for you.
        </p>
      </div>
      <CreateCapsuleForm />
    </div>
  );
}
