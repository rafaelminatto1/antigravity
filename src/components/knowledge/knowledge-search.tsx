"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
    answer: string;
    citations?: any;
}

export function KnowledgeSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/knowledge/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            const data = await response.json();

            if (data.success) {
                setResults(data);
            } else {
                console.error('Search failed:', data.error);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="glass-card border-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Pesquisa Semântica com IA
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ex: Quais são os protocolos para reabilitação de LCA?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1"
                        />
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="mr-2 h-4 w-4" />
                            )}
                            Pesquisar
                        </Button>
                    </div>

                    {results && (
                        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <h3 className="font-semibold text-lg">Resposta da IA</h3>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {results.answer}
                                    </p>

                                    {results.citations && results.citations.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-primary/20">
                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                Fontes consultadas:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {results.citations.map((citation: any, idx: number) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {citation.title || `Documento ${idx + 1}`}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
