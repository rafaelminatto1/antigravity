/**
 * Script para criar o bucket de Storage 'knowledge-base' no Supabase
 * 
 * Execute com: npx tsx scripts/create-storage-bucket.ts
 * 
 * Requer: SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    process.exit(1);
}

// Criar cliente com service role key (tem permissões administrativas)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function createKnowledgeBaseBucket() {
    console.log('🚀 Criando bucket knowledge-base...\n');

    try {
        // Verificar se o bucket já existe
        const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Erro ao listar buckets:', listError);
            return;
        }

        const knowledgeBaseBucket = existingBuckets?.find(b => b.name === 'knowledge-base');

        if (knowledgeBaseBucket) {
            console.log('✅ Bucket knowledge-base já existe!');
            console.log('   ID:', knowledgeBaseBucket.id);
            console.log('   Público:', knowledgeBaseBucket.public);
            console.log('   Criado em:', knowledgeBaseBucket.created_at);
            return;
        }

        // Criar o bucket
        const { data: newBucket, error: createError } = await supabase.storage.createBucket(
            'knowledge-base',
            {
                public: false, // Privado - requer autenticação
                fileSizeLimit: 52428800, // 50 MB
                allowedMimeTypes: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain',
                    'text/csv',
                ],
            }
        );

        if (createError) {
            console.error('❌ Erro ao criar bucket:', createError);
            return;
        }

        console.log('✅ Bucket knowledge-base criado com sucesso!');
        // console.log('   ID:', newBucket?.id);
        console.log('   Nome:', newBucket?.name);

        // Configurar políticas RLS (opcional - pode ser feito via SQL Editor)
        console.log('\n📝 Configure as políticas RLS no SQL Editor:');
        console.log('   Execute o arquivo CREATE_STORAGE_BUCKET.sql');

    } catch (error) {
        console.error('❌ Erro inesperado:', error);
    }
}

// Executar
createKnowledgeBaseBucket()
    .then(() => {
        console.log('\n✨ Processo concluído!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });

