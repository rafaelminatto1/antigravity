import { KanbanBoard } from "@/components/kanban/board";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import { ProjectFilters } from "@/components/projects/project-filters";

export default async function ProjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const params = await searchParams;
    const query = params.query || '';
    const supabase = await createClient();

    let dbQuery = supabase
        .from('tasks')
        .select(`
            *,
            project:projects(title),
            assignee:profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

    if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    const { data: tasks } = await dbQuery;

    // Transform data to match KanbanBoard expectations
    const formattedTasks = tasks?.map(task => ({
        ...task,
        project: task.project, // Keep the object structure
        assignee: task.assignee
    })) || [];

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
                    <ProjectFilters />
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Projeto
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard initialTasks={formattedTasks} />
            </div>
        </div>
    );
}
