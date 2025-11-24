"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function UploadDocument() {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const response = await fetch('/api/knowledge/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Documento enviado com sucesso!');
                setOpen(false);
                router.refresh();
                (e.target as HTMLFormElement).reset();
            } else {
                throw new Error(data.error || 'Erro no upload');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Erro ao enviar documento');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-lg">
                    <Upload className="mr-2 h-4 w-4" />
                    Adicionar Documento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload de Documento</DialogTitle>
                    <DialogDescription>
                        Adicione documentos à base de conhecimento para pesquisa com IA
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Ex: Protocolo de Reabilitação LCA"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Breve descrição do documento..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Input
                            id="category"
                            name="category"
                            placeholder="Ex: Protocolos, Estudos, Manuais"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Arquivo *</Label>
                        <Input
                            id="file"
                            name="file"
                            type="file"
                            accept=".pdf,.docx,.xlsx,.txt,.csv"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Formatos suportados: PDF, DOCX, XLSX, TXT, CSV
                        </p>
                    </div>

                    <Button type="submit" disabled={uploading} className="w-full">
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Enviar Documento
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
