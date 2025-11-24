import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Calendar, TrendingUp } from "lucide-react";

const kpiData = [
    {
        title: "Pacientes Ativos",
        value: "124",
        change: "+12%",
        icon: Users,
        description: "Total de pacientes em tratamento",
    },
    {
        title: "Sessões Realizadas",
        value: "432",
        change: "+5%",
        icon: Activity,
        description: "Neste mês",
    },
    {
        title: "Agendamentos",
        value: "28",
        change: "+2",
        icon: Calendar,
        description: "Para hoje",
    },
    {
        title: "Faturamento",
        value: "R$ 42.5k",
        change: "+18%",
        icon: TrendingUp,
        description: "Receita mensal estimada",
    },
];

export function KPICards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((item) => (
                <Card key={item.title} className="glass-card border-none shadow-lg transition-all hover:scale-105 hover:bg-white/5 dark:hover:bg-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {item.title}
                        </CardTitle>
                        <item.icon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{item.value}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500 font-semibold">{item.change}</span> {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
