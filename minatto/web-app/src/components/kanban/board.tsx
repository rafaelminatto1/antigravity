"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Calendar as CalendarIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Task = {
    id: string;
    title: string;
    tag: string;
    tagColor: string;
    assignees: string[];
    date: string;
};

type Column = {
    id: string;
    title: string;
    tasks: Task[];
};

const initialData: Column[] = [
    {
        id: "todo",
        title: "A Fazer",
        tasks: [
            {
                id: "1",
                title: "Avaliação Inicial - Sra. Maria",
                tag: "Avaliação",
                tagColor: "bg-blue-500/10 text-blue-500",
                assignees: ["https://github.com/shadcn.png"],
                date: "24 Nov",
            },
            {
                id: "2",
                title: "Revisar Protocolo Lombar",
                tag: "Interno",
                tagColor: "bg-purple-500/10 text-purple-500",
                assignees: ["https://github.com/shadcn.png"],
                date: "25 Nov",
            },
        ],
    },
    {
        id: "in-progress",
        title: "Em Andamento",
        tasks: [
            {
                id: "3",
                title: "Sessão de Fisioterapia - João Silva",
                tag: "Tratamento",
                tagColor: "bg-green-500/10 text-green-500",
                assignees: ["https://github.com/shadcn.png", "https://github.com/shadcn.png"],
                date: "Hoje",
            },
        ],
    },
    {
        id: "done",
        title: "Concluído",
        tasks: [
            {
                id: "4",
                title: "Relatório Mensal - Convênio X",
                tag: "Administrativo",
                tagColor: "bg-orange-500/10 text-orange-500",
                assignees: ["https://github.com/shadcn.png"],
                date: "Ontem",
            },
        ],
    },
];

export function KanbanBoard() {
    const [columns] = useState(initialData);

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
                                            <Badge variant="secondary" className={`${task.tagColor} border-none`}>
                                                {task.tag}
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
                                                {task.assignees.map((avatar, i) => (
                                                    <Avatar key={i} className="h-6 w-6 border-2 border-card">
                                                        <AvatarImage src={avatar} />
                                                        <AvatarFallback>U</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <CalendarIcon className="mr-1 h-3 w-3" />
                                                {task.date}
                                            </div>
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
