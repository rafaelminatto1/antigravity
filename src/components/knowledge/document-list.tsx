"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface Document {
    id: string;
    title: string;
    description: string;
    file_name: string;
    file_type: string;
    file_size: number;
    category: string;
    storage_path: string;
    storage_bucket: string;
    gemini_import_status: string;
    created_at: string;
}

export function DocumentList() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/knowledge/list');
            const data = await response.json();

            if (data.success) {
                setDocuments(data.data);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (doc: Document) => {
        try {
            const { data } = supabase.storage
                .from(doc.storage_bucket)
                .getPublicUrl(doc.storage_path);

            if (data.publicUrl) {
                window.open(data.publicUrl, '_blank');
            }
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType: string) => {
        return <FileText className="h-5 w-5 text-primary" />;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500/10 text-green-500">Pronto</Badge>;
            case 'processing':
                return <Badge className="bg-blue-500/10 text-blue-500">Processando</Badge>;
            case 'failed':
                return <Badge variant="destructive">Erro</Badge>;
            default:
                return <Badge variant="outline">Pendente</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <Card className="glass-card border-none">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                        Comece adicionando documentos à base de conhecimento para pesquisar com IA
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentos Disponíveis</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                    <Card
                        key={doc.id}
                        className="glass-card border-none hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">{getFileIcon(doc.file_type)}</div>
                                <div className="flex-1 min-w-0 space-y-2">
                                    <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                                        {doc.title}
                                    </h4>
                                    {doc.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {doc.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {doc.category && (
                                            <Badge variant="outline" className="text-xs">
                                                {doc.category}
                                            </Badge>
                                        )}
                                        {getStatusBadge(doc.gemini_import_status)}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span>{formatFileSize(doc.file_size)}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex-shrink-0"
                                    onClick={() => handleDownload(doc)}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
