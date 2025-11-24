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

        // 2. Process file upload
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;

        if (!file || !title) {
            return NextResponse.json(
                { error: 'File and title are required' },
                { status: 400 }
            );
        }

        // 3. Upload to Supabase Storage
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const fileBuffer = await file.arrayBuffer();

        const { error: uploadError } = await supabase.storage
            .from('knowledge-base')
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload file to storage' },
                { status: 500 }
            );
        }

        // 4. Get or create FileSearchStore
        let storeId = 'fileSearchStores/default-knowledge-base';

        try {
            // Try to create store (will fail if already exists, which is fine)
            const stores = await GeminiFileSearchService.listStores();
            const existingStore = stores.find(s => s.displayName === 'Knowledge Base');

            if (!existingStore) {
                storeId = await GeminiFileSearchService.createStore('Knowledge Base');
            } else {
                storeId = existingStore.name;
            }
        } catch (error) {
            console.error('Error managing FileSearchStore:', error);
            // Continue with default store ID
        }

        // 5. Upload to Gemini File Search
        let geminiFileId = '';
        let geminiStatus = 'pending';

        try {
            const geminiResult = await GeminiFileSearchService.uploadToStore(
                fileBuffer,
                file.name,
                file.type,
                storeId
            );

            geminiFileId = geminiResult.fileId;
            geminiStatus = geminiResult.importStatus === 'ACTIVE' ? 'completed' : 'processing';
        } catch (error) {
            console.error('Gemini upload error:', error);
            geminiStatus = 'failed';
        }

        // 6. Save metadata to database
        const { data, error } = await supabase
            .from('knowledge_documents')
            .insert({
                title,
                description,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                storage_path: filePath,
                storage_bucket: 'knowledge-base',
                category,
                uploaded_by: user.id,
                gemini_file_id: geminiFileId,
                gemini_store_id: storeId,
                gemini_import_status: geminiStatus
            })
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            return NextResponse.json(
                { error: 'Failed to save document metadata' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
            message: 'Document uploaded successfully'
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
