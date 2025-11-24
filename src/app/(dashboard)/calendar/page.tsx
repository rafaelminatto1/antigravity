"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { ptBR } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!date) return;

            setLoading(true);
            try {
                // Set time range for the selected date
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        patients (full_name),
                        profiles (full_name)
                    `)
                    .gte('start_time', startOfDay.toISOString())
                    .lte('start_time', endOfDay.toISOString())
                    .order('start_time', { ascending: true });

                if (error) throw error;
                setAppointments(data || []);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [date, supabase]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Concluído</Badge>;
            case 'cancelled':
                return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Cancelado</Badge>;
            case 'no_show':
                return <Badge variant="secondary">Não Compareceu</Badge>;
            default:
                return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Agendado</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient">Agenda</h2>
                <p className="text-muted-foreground">
                    Visualize e gerencie agendamentos e sessões.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-[350px_1fr]">
                <Card className="glass-card border-none">
                    <CardContent className="p-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            locale={ptBR}
                            className="rounded-md border shadow-sm"
                        />
                    </CardContent>
                </Card>

                <Card className="glass-card border-none">
                    <CardHeader>
                        <CardTitle>Agendamentos para {date?.toLocaleDateString('pt-BR')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum agendamento para este dia.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((apt) => {
                                    const time = new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <div key={apt.id} className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                                {time}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">Sessão de Fisioterapia</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Paciente: {apt.patients?.full_name || 'Desconhecido'} •
                                                    Terapeuta: {apt.profiles?.full_name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                {getStatusBadge(apt.status)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
