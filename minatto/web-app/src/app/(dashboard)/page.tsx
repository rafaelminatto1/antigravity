import { KPICards } from "@/components/dashboard/kpi-cards";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral da clínica e performance da equipe.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="shadow-lg hover:shadow-xl transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <KPICards />
      <AnalyticsDashboard />
    </div>
  );
}
