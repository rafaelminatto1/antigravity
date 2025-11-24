"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Calendar as CalendarIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Task = {
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date: string | null;
    assignee?: {
        full_name: string;
        avatar_url: string;
    };
    project?: {
        title: string;
    };
};

type Column = {
    id: string;
    title: string;
    tasks: Task[];
};

interface KanbanBoardProps {
    initialTasks: Task[];
}

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// ... existing imports

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
    const [columns, setColumns] = useState<Column[]>([
        { id: "todo", title: "A Fazer", tasks: [] },
        { id: "in-progress", title: "Em Andamento", tasks: [] },
        { id: "done", title: "Concluído", tasks: [] },
    ]);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const groupedTasks = {
            todo: initialTasks.filter(t => t.status === 'todo'),
            'in-progress': initialTasks.filter(t => t.status === 'in-progress'),
            done: initialTasks.filter(t => t.status === 'done'),
        };

        setColumns([
            { id: "todo", title: "A Fazer", tasks: groupedTasks.todo },
            { id: "in-progress", title: "Em Andamento", tasks: groupedTasks['in-progress'] },
            { id: "done", title: "Concluído", tasks: groupedTasks.done },
        ]);
    }, [initialTasks]);

    useEffect(() => {
        const channel = supabase
            .channel('kanban-board-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                },
                (payload) => {
                    console.log('Change received!', payload);
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, router]);

    // ... rest of the component


    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-500';
            case 'medium': return 'bg-yellow-500/10 text-yellow-500';
            case 'low': return 'bg-blue-500/10 text-blue-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="flex h-full gap-6 overflow-x-auto pb-4">
            {columns.map((column) => (
                <div key={column.id} className="flex h-full w-80 min-w-[320px] flex-col rounded-xl bg-muted/30 border backdrop-blur-sm">
                    <div className="flex items-center justify-between p-4">
                        <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                            {column.title}
                            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
                                {column.tasks.length}
                            </span>
                        </h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 px-4 pb-4">
                        <div className="space-y-3">
                            {column.tasks.map((task) => (
                                <Card key={task.id} className="cursor-pointer border-none bg-card shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                                    <CardHeader className="p-4 pb-2 space-y-0">
                                        <div className="flex items-start justify-between">
                                            <Badge variant="secondary" className={`${getPriorityColor(task.priority)} border-none`}>
                                                {task.project?.title || 'Geral'}
                                            </Badge>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <CardTitle className="text-sm font-medium leading-tight pt-2">
                                            {task.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex -space-x-2">
                                                <Avatar className="h-6 w-6 border-2 border-card">
                                                    <AvatarImage src={task.assignee?.avatar_url} />
                                                    <AvatarFallback>{task.assignee?.full_name?.[0] || 'U'}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            {task.due_date && (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                                    {format(new Date(task.due_date), 'dd MMM', { locale: ptBR })}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            ))}
            <div className="flex h-12 w-80 min-w-[320px] items-center justify-center rounded-xl border border-dashed bg-muted/10 hover:bg-muted/20 cursor-pointer transition-colors">
                <span className="flex items-center text-sm font-medium text-muted-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Coluna
                </span>
            </div>
        </div>
    );
}
