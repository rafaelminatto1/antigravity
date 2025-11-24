"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, Download, Trash2 } from "lucide-react";

export function LGPDCompliance() {
    return (
        <div className="space-y-6">
            <Card className="glass-card border-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Status de Conformidade LGPD
                    </CardTitle>
                    <CardDescription>
                        Monitoramento em tempo real da proteção de dados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Score de Segurança</span>
                            <span className="font-bold text-green-500">98%</span>
                        </div>
                        <Progress value={98} className="h-2" />
                        <p className="text-xs text-muted-foreground pt-2">
                            Sua clínica está em conformidade com os principais requisitos da LGPD.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card border-none">
                <CardHeader>
                    <CardTitle>Gestão de Consentimento</CardTitle>
                    <CardDescription>
                        Controle como os dados dos pacientes são processados.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <h4 className="font-medium">Coleta de Dados Sensíveis</h4>
                            <p className="text-sm text-muted-foreground">
                                Permitir coleta de dados de saúde para prontuário.
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <h4 className="font-medium">Compartilhamento com Terceiros</h4>
                            <p className="text-sm text-muted-foreground">
                                Permitir envio de dados para laboratórios parceiros.
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                            <h4 className="font-medium">Marketing e Comunicação</h4>
                            <p className="text-sm text-muted-foreground">
                                Enviar lembretes e novidades via WhatsApp/Email.
                            </p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass-card border-none">
                    <CardHeader>
                        <CardTitle className="text-base">Exportação de Dados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Baixar Relatório DPO
                        </Button>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none">
                    <CardHeader>
                        <CardTitle className="text-base">Direito ao Esquecimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Solicitar Exclusão
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
