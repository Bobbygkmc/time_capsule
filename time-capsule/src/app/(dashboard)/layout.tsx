import { redirect } from "next/navigation";
import { createClient } from "~/lib/supabase/server";
import { NavBar } from "~/components/nav-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar email={user.email!} />
      <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
    </div>
  );
}
