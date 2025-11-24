import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    try {
        // 1. Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get query parameters
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status') || 'completed';

        // 3. Build query
        let query = supabase
            .from('knowledge_documents')
            .select('*')
            .eq('gemini_import_status', status)
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Database query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch documents' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error: any) {
        console.error('List error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
