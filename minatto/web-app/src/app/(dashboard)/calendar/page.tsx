"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ptBR } from "date-fns/locale";

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

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
                        <div className="space-y-4">
                            {[9, 10, 11, 14, 15, 16].map((hour) => (
                                <div key={hour} className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                        {hour}h
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold">Sessão de Fisioterapia</h4>
                                        <p className="text-sm text-muted-foreground">Paciente: João Silva • Dr. Rafael</p>
                                    </div>
                                    <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                                        Confirmado
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
