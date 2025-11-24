"use client";

import { useState, useEffect } from "react";
import { aiService, AISummary } from "@/lib/ai/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface PatientAISummaryProps {
    patientId: string;
    patientName: string;
}

export function PatientAISummary({ patientId, patientName }: PatientAISummaryProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AISummary | null>(null);

    useEffect(() => {
        const loadSummary = async () => {
            setLoading(true);
            try {
                const result = await aiService.summarizePatientHistory(patientId);
                setData(result);
            } catch (error) {
                console.error("Failed to load AI summary", error);
            } finally {
                setLoading(false);
            }
        };

        loadSummary();
    }, [patientId]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary animate-pulse">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">Gerando resumo inteligente...</span>
                </div>
                <Skeleton className="h-24 w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Resumo IA: {patientName}
                </CardTitle>
                <CardDescription>
                    Análise automática baseada no histórico clínico recente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {data.summary}
                </p>

                <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Pontos Chave
                    </h4>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {data.keyPoints.map((point, index) => (
                            <li key={index} className="text-xs bg-background/50 p-2 rounded-md border">
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
