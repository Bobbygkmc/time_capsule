import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { CapsuleDetail } from "~/components/capsule/capsule-detail";

export default async function CapsulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const capsule = await api.capsule.get({ id });
    return <CapsuleDetail capsule={capsule} />;
  } catch {
    notFound();
  }
}
