import { KanbanBoard } from "@/components/kanban/board";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

export default function ProjectsPage() {
    return (
        <div className="flex h-[calc(100vh-100px)] flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Projetos</h2>
                    <p className="text-muted-foreground">
                        Gerencie tarefas e acompanhe o progresso da equipe.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrar
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Projeto
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard />
            </div>
        </div>
    );
}
