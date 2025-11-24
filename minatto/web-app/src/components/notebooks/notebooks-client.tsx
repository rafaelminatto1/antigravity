"use client";

import { useState, useEffect } from "react";
import { RichEditor } from "@/components/editor/rich-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, FileText, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notebook {
    id: string;
    title: string;
    content: string | null;
    updated_at: string;
}

interface NotebooksClientProps {
    notebooks: Notebook[];
    activeNotebook: Notebook | null;
}

export function NotebooksClient({ notebooks, activeNotebook }: NotebooksClientProps) {
    const [content, setContent] = useState(activeNotebook?.content || "");
    const [title, setTitle] = useState(activeNotebook?.title || "");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (activeNotebook) {
            setContent(activeNotebook.content || "");
            setTitle(activeNotebook.title);
        } else {
            setContent("");
            setTitle("");
        }
    }, [activeNotebook]);

    const handleSave = async () => {
        if (!title) {
            toast.error("O título é obrigatório");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const notebookData = {
                title,
                content,
                owner_id: user.id,
                updated_at: new Date().toISOString(),
            };

            let result;
            if (activeNotebook) {
                result = await supabase
                    .from('notebooks')
                    .update(notebookData)
                    .eq('id', activeNotebook.id)
                    .select()
                    .single();
            } else {
                result = await supabase
                    .from('notebooks')
                    .insert(notebookData)
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            toast.success("Notebook salvo com sucesso!");
            router.refresh();
            if (!activeNotebook && result.data) {
                router.push(`/notebooks?id=${result.data.id}`);
            }
        } catch (error: any) {
            console.error("Error saving notebook:", error);
            toast.error("Erro ao salvar notebook");
        } finally {
            setLoading(false);
        }
    };

    const filteredNotebooks = notebooks.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            <div className="w-64 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button size="icon" variant="outline" onClick={() => router.push('/notebooks')}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {filteredNotebooks.map(notebook => (
                        <button
                            key={notebook.id}
                            onClick={() => router.push(`/notebooks?id=${notebook.id}`)}
                            className={cn(
                                "flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent",
                                activeNotebook?.id === notebook.id ? "bg-accent border-primary" : "bg-card"
                            )}
                        >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 truncate font-medium">
                                {notebook.title}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título do documento..."
                            className="text-lg font-bold border-none bg-transparent focus-visible:ring-0 px-0"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border bg-background shadow-lg">
                    <RichEditor content={content} onChange={setContent} />
                </div>
            </div>
        </div>
    );
}
