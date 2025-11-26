import { ExecutiveDashboardComponent } from "@/components/dashboard/ExecutiveDashboard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient">Dashboard FisioFlow</h2>
          <p className="text-muted-foreground">
            Bem-vindo, {session.user.email}!
          </p>
        </div>
      </div>

      <ExecutiveDashboardComponent />
    </div>
  );
}
