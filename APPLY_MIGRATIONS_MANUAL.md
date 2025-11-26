# Aplicar Migrations Manualmente no Supabase Dashboard

Como o CLI está tendo problemas, vamos aplicar as migrations diretamente no SQL Editor do Supabase.

## Passo a Passo

### 1. Acessar o SQL Editor

1. Acesse: https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad/sql
2. Ou via Vercel: Clique em "Open Supabase" → SQL Editor

### 2. Executar Migrations na Ordem

Execute cada migration **uma por vez**, na ordem abaixo:

#### Migration 1: Schema Principal
1. Abra o arquivo: `supabase/migrations/20241123000000_initial_fisioflow_schema.sql`
2. Copie **TODO o conteúdo**
3. Cole no SQL Editor
4. Clique em **"Run"** ou pressione `Ctrl+Enter`
5. Aguarde a mensagem de sucesso

#### Migration 2: Notebooks
1. Abra o arquivo: `supabase/migrations/20241124000001_add_notebooks.sql`
2. Copie **TODO o conteúdo**
3. Cole no SQL Editor
4. Clique em **"Run"**
5. Aguarde a mensagem de sucesso

#### Migration 3: Knowledge Base
1. Abra o arquivo: `supabase/migrations/20241124000002_add_knowledge_base.sql`
2. Copie **TODO o conteúdo**
3. Cole no SQL Editor
4. Clique em **"Run"**
5. Aguarde a mensagem de sucesso

### 3. Verificar Tabelas Criadas

1. Vá para: **Table Editor** (menu lateral)
2. Verifique se as seguintes tabelas existem:
   - ✅ `organizations`
   - ✅ `profiles`
   - ✅ `patients`
   - ✅ `appointments`
   - ✅ `sessions`
   - ✅ `notebooks`
   - ✅ `knowledge_documents`
   - ✅ `knowledge_search_history`
   - E outras...

### 4. Verificar RLS (Row Level Security)

1. Vá para: **Authentication** → **Policies**
2. Verifique se as políticas RLS foram criadas

---

## Troubleshooting

### Erro: "relation already exists"
- Significa que a tabela já foi criada
- Pode continuar com a próxima migration

### Erro: "extension already exists"
- Normal, as extensões já existem
- Pode continuar

### Erro: "type already exists"
- O enum já foi criado
- Pode continuar

---

## Status

Após aplicar todas as migrations, o banco estará pronto para uso! 🚀

