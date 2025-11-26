-- Criar bucket para anexos médicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-attachments',
  'medical-attachments',
  false,
  52428800, -- 50 MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Política de acesso: usuários autenticados podem fazer upload
CREATE POLICY "Users can upload medical attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM patients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Política de acesso: usuários autenticados podem ler anexos da sua organização
CREATE POLICY "Users can read medical attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM patients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Política de acesso: usuários autenticados podem deletar anexos da sua organização
CREATE POLICY "Users can delete medical attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM patients WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  )
);

