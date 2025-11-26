-- ============================================================================
-- CRIAR BUCKET DE STORAGE: knowledge-base
-- ============================================================================
-- Execute este script no SQL Editor do Supabase para criar o bucket
-- ============================================================================

-- Nota: Buckets são criados via API ou Dashboard, não via SQL direto
-- Este script cria as políticas RLS para o bucket após sua criação manual

-- INSTRUÇÕES PARA CRIAR O BUCKET:
-- 1. Acesse: https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad/storage/buckets
-- 2. Clique em "New bucket"
-- 3. Nome: knowledge-base
-- 4. Public: false (privado)
-- 5. File size limit: 50 MB (ou conforme necessário)
-- 6. Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.*, text/*
-- 7. Clique em "Create bucket"

-- ============================================================================
-- CRIAR BUCKET VIA SQL (OPCIONAL)
-- ============================================================================
-- Você também pode criar o bucket diretamente via SQL:
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
-- POLÍTICAS RLS PARA STORAGE
-- ============================================================================
-- Após criar o bucket, execute as políticas abaixo:

-- Política para permitir leitura de arquivos autenticados
DROP POLICY IF EXISTS "Authenticated users can view knowledge base files" ON storage.objects;
CREATE POLICY "Authenticated users can view knowledge base files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'knowledge-base' 
    AND auth.role() = 'authenticated'
  );

-- Política para permitir upload de arquivos autenticados
DROP POLICY IF EXISTS "Authenticated users can upload knowledge base files" ON storage.objects;
CREATE POLICY "Authenticated users can upload knowledge base files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'knowledge-base' 
    AND auth.role() = 'authenticated'
  );

-- Política para permitir atualização de arquivos próprios
DROP POLICY IF EXISTS "Users can update their own knowledge base files" ON storage.objects;
CREATE POLICY "Users can update their own knowledge base files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'knowledge-base' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir exclusão de arquivos próprios
DROP POLICY IF EXISTS "Users can delete their own knowledge base files" ON storage.objects;
CREATE POLICY "Users can delete their own knowledge base files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'knowledge-base' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- ALTERNATIVA: Criar bucket via API (Edge Function ou script Node.js)
-- ============================================================================
-- Você também pode criar o bucket programaticamente usando a API do Supabase
-- com a service_role_key
-- ============================================================================

