"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface FinancialData {
    name: string;
    receita: number;
    despesa: number;
}

interface FinancialOverviewProps {
    data: FinancialData[];
}

export function FinancialOverview({ data }: FinancialOverviewProps) {
    return (
        <Card className="glass-card border-none col-span-4">
            <CardHeader>
                <CardTitle>Fluxo de Caixa</CardTitle>
                <CardDescription>
                    Comparativo de receitas e despesas nos últimos meses.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="receita"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorReceita)"
                                name="Receita"
                            />
                            <Area
                                type="monotone"
                                dataKey="despesa"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorDespesa)"
                                name="Despesa"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
