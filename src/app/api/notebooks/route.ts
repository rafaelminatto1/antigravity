import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: notebooks, error } = await supabase
            .from('notebooks')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: notebooks });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Auth error:', authError);
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('User ID from auth:', user.id);

        const body = await request.json();
        const { title, content } = body;

        if (!title || !title.trim()) {
            return NextResponse.json(
                { success: false, error: 'Title is required' },
                { status: 400 }
            );
        }

        console.log('Attempting to insert notebook with user_id:', user.id);

        // Usar função SQL diretamente para contornar cache do PostgREST
        // PostgREST ordena parâmetros alfabeticamente: p_content, p_title, p_user_id
        const { data: notebookResult, error: rpcError } = await supabase.rpc('create_notebook_final', {
            p_content: content || '',
            p_title: title.trim(),
            p_user_id: user.id
        });

        if (rpcError) {
            console.error('RPC error:', rpcError);
            console.error('RPC error details:', JSON.stringify(rpcError, null, 2));
            return NextResponse.json(
                { success: false, error: rpcError.message || 'Failed to create notebook via RPC' },
                { status: 500 }
            );
        }

        // A função retorna um array com um objeto
        let notebook;
        if (Array.isArray(notebookResult) && notebookResult.length > 0) {
            notebook = notebookResult[0];
        } else if (notebookResult && typeof notebookResult === 'object') {
            notebook = notebookResult;
        } else {
            console.error('Unexpected RPC result format:', notebookResult);
            return NextResponse.json(
                { success: false, error: 'Unexpected response format from database' },
                { status: 500 }
            );
        }

        if (!notebook) {
            console.error('Notebook was created but not returned');
            return NextResponse.json(
                { success: false, error: 'Notebook created but data not returned' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: notebook });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
