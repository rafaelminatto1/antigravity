import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GeminiFileSearchService } from '@/lib/gemini/file-search';

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        // 1. Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get search query
        const body = await request.json();
        const { query, storeId } = body;

        if (!query) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        // 3. Use default store if not provided
        const searchStoreId = storeId || 'fileSearchStores/default-knowledge-base';

        // 4. Perform semantic search with Gemini
        const searchResult = await GeminiFileSearchService.search(query, searchStoreId);

        // 5. Log search to history
        await supabase.from('knowledge_search_history').insert({
            user_id: user.id,
            query,
            results_count: searchResult.citations?.length || 0
        });

        return NextResponse.json({
            success: true,
            answer: searchResult.answer,
            citations: searchResult.citations
        });

    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        );
    }
}
