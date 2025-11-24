"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const templates = [
    {
        id: "eval-initial",
        title: "Avaliação Inicial",
        description: "Anamnese completa e exame físico.",
        content: `
      <h2>Avaliação Inicial</h2>
      <h3>Anamnese</h3>
      <p><strong>Queixa Principal:</strong> ...</p>
      <p><strong>HDA:</strong> ...</p>
      <h3>Exame Físico</h3>
      <p><strong>Inspeção:</strong> ...</p>
      <p><strong>Palpação:</strong> ...</p>
      <p><strong>Amplitude de Movimento:</strong> ...</p>
      <h3>Diagnóstico Fisioterapêutico</h3>
      <p>...</p>
    `
    },
    {
        id: "daily-evolution",
        title: "Evolução Diária",
        description: "Registro de sessão padrão (SOAP).",
        content: `
      <h3>Evolução (SOAP)</h3>
      <p><strong>S (Subjetivo):</strong> Paciente relata...</p>
      <p><strong>O (Objetivo):</strong> Realizado...</p>
      <p><strong>A (Avaliação):</strong> Boa tolerância...</p>
      <p><strong>P (Plano):</strong> Manter conduta...</p>
    `
    },
    {
        id: "discharge",
        title: "Relatório de Alta",
        description: "Resumo do tratamento e orientações finais.",
        content: `
      <h2>Relatório de Alta</h2>
      <p><strong>Data de Início:</strong> ...</p>
      <p><strong>Data de Término:</strong> ...</p>
      <h3>Resumo do Tratamento</h3>
      <p>...</p>
      <h3>Objetivos Alcançados</h3>
      <ul>
        <li>[ ] Melhora da dor</li>
        <li>[ ] Ganho de ADM</li>
      </ul>
      <h3>Orientações</h3>
      <p>...</p>
    `
    }
];

interface TemplateSelectorProps {
    onSelect: (content: string) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Templates
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Templates Clínicos</DialogTitle>
                    <DialogDescription>
                        Selecione um modelo para inserir no documento.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {templates.map((template) => (
                            <Card
                                key={template.id}
                                className="cursor-pointer transition-all hover:bg-accent hover:border-primary/50"
                                onClick={() => onSelect(template.content)}
                            >
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        {template.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                                    {template.description}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
