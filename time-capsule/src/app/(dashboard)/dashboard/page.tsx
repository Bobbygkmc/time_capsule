import Link from "next/link";
import { api } from "~/trpc/server";
import { CapsuleList } from "~/components/capsule/capsule-list";

export default async function DashboardPage() {
  const capsules = await api.capsule.list();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Capsules</h1>
          <p className="mt-1 text-sm text-slate-400">
            {capsules.length === 0
              ? "You haven't created any capsules yet."
              : `${capsules.length} capsule${capsules.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/capsules/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          New capsule
        </Link>
      </div>

      <CapsuleList capsules={capsules} />
    </div>
  );
}
