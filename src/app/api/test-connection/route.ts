import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Rota de teste para verificar conexão com Supabase
 * Acesse: /api/test-connection
 */
export async function GET() {
    try {
        const supabase = await createClient();

        // Teste 1: Verificar variáveis de ambiente
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                success: false,
                error: 'Variáveis de ambiente não configuradas',
                details: {
                    hasUrl: !!supabaseUrl,
                    hasKey: !!supabaseKey,
                },
            }, { status: 500 });
        }

        // Teste 2: Verificar conexão com banco de dados
        const { data: tables, error: tablesError } = await supabase
            .from('organizations')
            .select('id')
            .limit(1);

        if (tablesError) {
            return NextResponse.json({
                success: false,
                error: 'Erro ao conectar com banco de dados',
                details: {
                    message: tablesError.message,
                    code: tablesError.code,
                    hint: tablesError.hint,
                },
            }, { status: 500 });
        }

        // Teste 3: Verificar tabelas principais
        const tablesToCheck = [
            'organizations',
            'profiles',
            'patients',
            'appointments',
            'sessions',
            'notebooks',
            'knowledge_documents',
        ];

        const tableChecks = await Promise.all(
            tablesToCheck.map(async (tableName) => {
                const { error } = await supabase
                    .from(tableName)
                    .select('id')
                    .limit(0);
                return {
                    table: tableName,
                    exists: !error,
                    error: error?.message,
                };
            })
        );

        // Teste 4: Verificar Storage bucket
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        const knowledgeBaseBucket = buckets?.find(b => b.name === 'knowledge-base');

        // Teste 5: Verificar autenticação (sem usuário logado)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        return NextResponse.json({
            success: true,
            message: 'Conexão com Supabase funcionando!',
            details: {
                environment: {
                    url: supabaseUrl.substring(0, 30) + '...',
                    hasKey: !!supabaseKey,
                },
                database: {
                    connected: true,
                    tables: tableChecks,
                },
                storage: {
                    connected: !bucketsError,
                    bucketsCount: buckets?.length || 0,
                    knowledgeBaseBucket: {
                        exists: !!knowledgeBaseBucket,
                        public: knowledgeBaseBucket?.public || false,
                        createdAt: knowledgeBaseBucket?.created_at,
                    },
                },
                authentication: {
                    connected: !authError,
                    currentUser: user ? {
                        id: user.id,
                        email: user.email,
                    } : null,
                },
            },
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Erro inesperado',
            details: {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            },
        }, { status: 500 });
    }
}

