import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Calendar, TrendingUp } from "lucide-react";

export async function KPICards() {
    const supabase = await createClient();

    // Fetch Active Patients
    const { count: activePatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    // Fetch Today's Appointments
    const today = new Date().toISOString().split('T')[0];
    const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`);

    // Fetch Monthly Sessions (Completed Appointments this month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { count: monthlySessions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('start_time', startOfMonth);

    // Fetch Monthly Revenue (Safe fetch, assuming transactions table might not exist yet or is empty)
    let monthlyRevenue = 0;
    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('amount')
            .eq('type', 'income')
            .gte('date', startOfMonth);

        if (!error && transactions) {
            monthlyRevenue = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
        }
    } catch (e) {
        console.log("Transactions table not ready yet");
    }

    const kpiData = [
        {
            title: "Pacientes Ativos",
            value: activePatients || 0,
            change: "+12%", // Placeholder for trend
            icon: Users,
            description: "Total de pacientes em tratamento",
        },
        {
            title: "Sessões Realizadas",
            value: monthlySessions || 0,
            change: "+5%", // Placeholder for trend
            icon: Activity,
            description: "Neste mês",
        },
        {
            title: "Agendamentos",
            value: todayAppointments || 0,
            change: "+2", // Placeholder for trend
            icon: Calendar,
            description: "Para hoje",
        },
        {
            title: "Faturamento",
            value: `R$ ${monthlyRevenue.toLocaleString('pt-BR')}`,
            change: "+18%", // Placeholder for trend
            icon: TrendingUp,
            description: "Receita mensal estimada",
        },
    ];

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
