"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    Plus,
    Search,
    Calendar,
    Edit,
    Trash2,
    Loader2,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

interface Notebook {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

interface NotebooksClientProps {
    notebooks: Notebook[];
    activeNotebook: Notebook | null;
}

export function NotebooksClient({ notebooks: initialNotebooks, activeNotebook: initialActiveNotebook }: NotebooksClientProps) {
    const router = useRouter();
    const [notebooks, setNotebooks] = useState<Notebook[]>(initialNotebooks);
    const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(initialActiveNotebook);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [newNotebook, setNewNotebook] = useState({ title: '', content: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [notebookToDelete, setNotebookToDelete] = useState<string | null>(null);

    const filteredNotebooks = notebooks.filter(notebook =>
        notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notebook.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateNotebook = async () => {
        if (!newNotebook.title.trim()) return;

        setIsCreating(true);
        try {
            const response = await fetch('/api/notebooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNotebook),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (data.data) {
                    toast.success('Notebook criado com sucesso!');
                    setNotebooks([data.data, ...notebooks]);
                    setNewNotebook({ title: '', content: '' });
                    setIsDialogOpen(false);
                    router.push(`/notebooks?id=${data.data.id}`);
                } else {
                    console.error('Error: API returned success but no data:', data);
                    toast.error('Erro: Notebook criado mas dados não retornados');
                }
            } else {
                console.error('Error creating notebook:', data);
                toast.error(`Erro ao criar notebook: ${data?.error || 'Erro desconhecido'}`);
            }
        } catch (error: any) {
            console.error('Error creating notebook:', error);
            toast.error(`Erro ao criar notebook: ${error?.message || 'Erro de conexão'}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setNotebookToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!notebookToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/notebooks/${notebookToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Notebook excluído com sucesso!');
                setNotebooks(notebooks.filter(n => n.id !== notebookToDelete));
                if (activeNotebook?.id === notebookToDelete) {
                    setActiveNotebook(null);
                    router.push('/notebooks');
                }
                setDeleteDialogOpen(false);
                setNotebookToDelete(null);
            } else {
                toast.error('Erro ao excluir notebook');
            }
        } catch (error) {
            console.error('Error deleting notebook:', error);
            toast.error('Erro ao excluir notebook');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateNotebook = async (id: string, updates: Partial<Notebook>) => {
        try {
            const response = await fetch(`/api/notebooks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const data = await response.json();
                setNotebooks(notebooks.map(n => n.id === id ? data.data : n));
                if (activeNotebook?.id === id) {
                    setActiveNotebook(data.data);
                }
            }
        } catch (error) {
            console.error('Error updating notebook:', error);
        }
    };

    const selectNotebook = (notebook: Notebook) => {
        setActiveNotebook(notebook);
        router.push(`/notebooks?id=${notebook.id}`);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Sidebar - Lista de Notebooks */}
            <div className="w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-gradient">
                        Notebooks
                    </h2>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Novo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Criar Novo Notebook</DialogTitle>
                                <DialogDescription>
                                    Adicione um título e comece a escrever suas anotações
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ex: Anotações de Estudo"
                                        value={newNotebook.title}
                                        onChange={(e) => setNewNotebook({ ...newNotebook, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Conteúdo Inicial (opcional)</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Comece a escrever..."
                                        value={newNotebook.content}
                                        onChange={(e) => setNewNotebook({ ...newNotebook, content: e.target.value })}
                                        rows={5}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleCreateNotebook}
                                    disabled={isCreating || !newNotebook.title.trim()}
                                >
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Criar Notebook
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar notebooks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Lista de Notebooks */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredNotebooks.length === 0 ? (
                        <Card className="glass-card border-none">
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-sm text-muted-foreground text-center">
                                    {searchQuery ? 'Nenhum notebook encontrado' : 'Nenhum notebook ainda'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredNotebooks.map((notebook) => (
                            <Card
                                key={notebook.id}
                                className={cn(
                                    "glass-card border-none cursor-pointer transition-all duration-200 hover:shadow-md",
                                    activeNotebook?.id === notebook.id && "ring-2 ring-primary"
                                )}
                                onClick={() => selectNotebook(notebook)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate mb-1">
                                                {notebook.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                {notebook.content || 'Sem conteúdo'}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(notebook.updated_at).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 flex-shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(notebook.id);
                                            }}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Editor - Conteúdo do Notebook */}
            <div className="flex-1">
                {activeNotebook ? (
                    <Card className="glass-card border-none h-full flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <Input
                                        value={activeNotebook.title}
                                        onChange={(e) => {
                                            setActiveNotebook({ ...activeNotebook, title: e.target.value });
                                        }}
                                        onBlur={() => handleUpdateNotebook(activeNotebook.id, { title: activeNotebook.title })}
                                        className="text-2xl font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                                    />
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Atualizado em {new Date(activeNotebook.updated_at).toLocaleString('pt-BR')}
                                    </div>
                                </div>
                                <Badge variant="outline" className="flex-shrink-0">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Notebook
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <Textarea
                                value={activeNotebook.content}
                                onChange={(e) => {
                                    setActiveNotebook({ ...activeNotebook, content: e.target.value });
                                }}
                                onBlur={() => handleUpdateNotebook(activeNotebook.id, { content: activeNotebook.content })}
                                placeholder="Comece a escrever suas anotações..."
                                className="h-full resize-none border-none bg-transparent focus-visible:ring-0 text-base leading-relaxed"
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="glass-card border-none h-full">
                        <CardContent className="flex flex-col items-center justify-center h-full">
                            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Selecione um Notebook</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                Escolha um notebook da lista ou crie um novo para começar a escrever
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Notebook?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este notebook? Esta ação não pode ser desfeita e todo o conteúdo será perdido permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                'Excluir'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
