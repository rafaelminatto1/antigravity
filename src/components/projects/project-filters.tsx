"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function ProjectFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="flex items-center space-x-2">
            <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar tarefas..."
                    className="pl-8 bg-background/50"
                    defaultValue={searchParams.get('query')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
            </Button>
        </div>
    );
}
