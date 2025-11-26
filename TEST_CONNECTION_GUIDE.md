# Guia de Teste de Conexão e Configuração do Storage

## ✅ 1. Testar Conexão com Supabase

### Opção A: Via API Route (Recomendado)

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Acesse a rota de teste:**
   ```
   http://localhost:3000/api/test-connection
   ```

3. **Verifique a resposta JSON:**
   - `success: true` = Conexão funcionando ✅
   - Verifique se todas as tabelas existem
   - Verifique se o bucket `knowledge-base` existe

### Opção B: Via Navegador (Visual)

Abra o DevTools (F12) e execute no Console:
```javascript
fetch('/api/test-connection')
  .then(r => r.json())
  .then(console.log)
```

### Resposta Esperada:

```json
{
  "success": true,
  "message": "Conexão com Supabase funcionando!",
  "details": {
    "environment": {
      "url": "https://jrxqcpbhwmmmeopiqpad.supabase.co",
      "hasKey": true
    },
    "database": {
      "connected": true,
      "tables": [
        { "table": "organizations", "exists": true },
        { "table": "profiles", "exists": true },
        ...
      ]
    },
    "storage": {
      "connected": true,
      "knowledgeBaseBucket": {
        "exists": true,
        "public": false
      }
    }
  }
}
```

---

## 📦 2. Criar Bucket de Storage: knowledge-base

### Opção A: Via Dashboard (Mais Fácil) ⭐

1. **Acesse o Dashboard do Supabase:**
   ```
   https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad/storage/buckets
   ```

2. **Clique em "New bucket"**

3. **Configure o bucket:**
   - **Name:** `knowledge-base`
   - **Public:** `false` (privado - requer autenticação)
   - **File size limit:** `50 MB` (ou conforme necessário)
   - **Allowed MIME types:**
     - `application/pdf`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     - `text/plain`
     - `text/csv`

4. **Clique em "Create bucket"**

5. **Configure as políticas RLS:**
   - Acesse: Storage → Policies
   - Ou execute o arquivo `CREATE_STORAGE_BUCKET.sql` no SQL Editor

### Opção B: Via Script TypeScript

1. **Instale tsx (se ainda não tiver):**
   ```bash
   npm install -D tsx
   ```

2. **Configure as variáveis de ambiente:**
   Certifique-se de que `.env.local` contém:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://jrxqcpbhwmmmeopiqpad.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Execute o script:**
   ```bash
   npx tsx scripts/create-storage-bucket.ts
   ```

### Opção C: Via SQL (Apenas Políticas)

Se o bucket já existir, execute apenas as políticas:
- Abra o SQL Editor
- Execute o arquivo `CREATE_STORAGE_BUCKET.sql`

---

## 🔍 3. Verificar Configuração Completa

### Checklist:

- [ ] ✅ Variáveis de ambiente configuradas no `.env.local`
- [ ] ✅ Variáveis de ambiente configuradas no Vercel
- [ ] ✅ Schema do banco criado (14 tabelas)
- [ ] ✅ RLS habilitado e políticas criadas
- [ ] ✅ Bucket `knowledge-base` criado
- [ ] ✅ Políticas RLS do Storage configuradas
- [ ] ✅ Teste de conexão retorna `success: true`

---

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"

**Solução:**
1. Verifique se `.env.local` existe na raiz do projeto
2. Adicione as variáveis:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://jrxqcpbhwmmmeopiqpad.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Reinicie o servidor (`npm run dev`)

### Erro: "Tabela não existe"

**Solução:**
1. Execute o script `COMPLETE_SCHEMA.sql` no SQL Editor
2. Verifique se todas as tabelas foram criadas com `VERIFY_SCHEMA.sql`

### Erro: "Bucket não existe"

**Solução:**
1. Crie o bucket via Dashboard (Opção A acima)
2. Ou execute o script `scripts/create-storage-bucket.ts`

### Erro: "Permission denied" no Storage

**Solução:**
1. Verifique se as políticas RLS do Storage estão configuradas
2. Execute `CREATE_STORAGE_BUCKET.sql` no SQL Editor
3. Verifique se o usuário está autenticado

---

## 📚 Próximos Passos

Após confirmar que tudo está funcionando:

1. **Testar upload de arquivo:**
   - Acesse a página de Knowledge Base
   - Tente fazer upload de um PDF

2. **Testar busca:**
   - Use a funcionalidade de busca na knowledge base

3. **Verificar logs:**
   - Monitore os logs no Supabase Dashboard
   - Verifique erros no console do navegador

---

## 🔗 Links Úteis

- **Supabase Dashboard:** https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad
- **SQL Editor:** https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad/sql
- **Storage Buckets:** https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad/storage/buckets
- **Storage Policies:** https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad/storage/policies

