-- ============================================================================
-- CRIAR BUCKET E POLÍTICAS DE STORAGE - VERSÃO SIMPLIFICADA
-- ============================================================================
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- Criar o bucket (se ainda não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'knowledge-base',
    'knowledge-base',
    false, -- Privado - requer autenticação
    52428800, -- 50 MB
    ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- POLÍTICAS RLS - VERSÃO SIMPLIFICADA
-- ============================================================================
-- Permite que qualquer usuário autenticado acesse todos os arquivos
-- (Adequado para knowledge base compartilhada)

-- SELECT: Usuários autenticados podem visualizar arquivos
DROP POLICY IF EXISTS "Authenticated users can view knowledge base files" ON storage.objects;
CREATE POLICY "Authenticated users can view knowledge base files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'knowledge-base' 
    AND auth.role() = 'authenticated'
  );

-- INSERT: Usuários autenticados podem fazer upload
DROP POLICY IF EXISTS "Authenticated users can upload knowledge base files" ON storage.objects;
CREATE POLICY "Authenticated users can upload knowledge base files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'knowledge-base' 
    AND auth.role() = 'authenticated'
  );

-- UPDATE: Usuários autenticados podem atualizar qualquer arquivo
DROP POLICY IF EXISTS "Authenticated users can update knowledge base files" ON storage.objects;
CREATE POLICY "Authenticated users can update knowledge base files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'knowledge-base' 
    AND auth.role() = 'authenticated'
  );

-- DELETE: Usuários autenticados podem deletar qualquer arquivo
DROP POLICY IF EXISTS "Authenticated users can delete knowledge base files" ON storage.objects;
CREATE POLICY "Authenticated users can delete knowledge base files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'knowledge-base' 
    AND auth.role() = 'authenticated'
  );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- Execute para verificar se o bucket foi criado:
SELECT id, name, public, file_size_limit, created_at 
FROM storage.buckets 
WHERE id = 'knowledge-base';

-- Execute para verificar as políticas criadas:
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%knowledge base%';

