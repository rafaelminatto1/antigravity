import { createClient } from "@/lib/supabase/server";
import { NotebooksClient } from "@/components/notebooks/notebooks-client";

export default async function NotebooksPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const supabase = await createClient();
    const { id } = await searchParams;

    // Fetch all notebooks for the list
    const { data: notebooks } = await supabase
        .from('notebooks')
        .select('*')
        .order('updated_at', { ascending: false });

    let activeNotebook = null;
    if (id) {
        const { data } = await supabase
            .from('notebooks')
            .select('*')
            .eq('id', id)
            .single();
        activeNotebook = data;
    }

    return (
        <NotebooksClient notebooks={notebooks || []} activeNotebook={activeNotebook} />
    );
}
