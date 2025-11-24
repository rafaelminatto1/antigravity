"use client";

import { useState } from "react";
import { aiService, AITreatmentSuggestion } from "@/lib/ai/service";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AISuggestionsProps {
    onInsert: (content: string) => void;
}

export function AISuggestions({ onInsert }: AISuggestionsProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<AITreatmentSuggestion[]>([]);

    const handleGetSuggestions = async () => {
        setLoading(true);
        try {
            // In a real app, we would pass the current editor content context
            const result = await aiService.getTreatmentSuggestions("lca");
            setSuggestions(result);
        } catch (error) {
            console.error("Failed to get suggestions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInsert = (suggestion: AITreatmentSuggestion) => {
        const content = `
      <h3>${suggestion.title}</h3>
      <p><strong>Descrição:</strong> ${suggestion.description}</p>
      <ul>
        <li><strong>Duração:</strong> ${suggestion.duration}</li>
        <li><strong>Frequência:</strong> ${suggestion.frequency}</li>
      </ul>
    `;
        onInsert(content);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                    onClick={handleGetSuggestions}
                >
                    <Sparkles className="h-4 w-4" />
                    Sugestões IA
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Sugestões de Tratamento
                    </DialogTitle>
                    <DialogDescription>
                        Protocolos recomendados baseados em evidências para o caso atual.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Analisando contexto clínico...</p>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        {suggestions.map((suggestion, index) => (
                            <Card key={index} className="cursor-pointer hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex justify-between items-start">
                                        {suggestion.title}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleInsert(suggestion)}
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {suggestion.description}
                                    </p>
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {suggestion.duration}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {suggestion.frequency}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
