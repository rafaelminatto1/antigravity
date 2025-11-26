# Resetar Banco e Aplicar Migrations

## ⚠️ ATENÇÃO: Isso vai apagar TODOS os dados do banco!

Como você confirmou que o banco está livre e pode apagar tudo, vamos resetar completamente.

## Opção 1: Resetar via Supabase Dashboard (Recomendado)

### Passo 1: Resetar o Banco
1. Acesse: https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad/settings/database
2. Role até a seção **"Danger Zone"**
3. Clique em **"Reset Database"** ou **"Delete Project"** e crie um novo
4. **OU** vá para SQL Editor e execute:

```sql
-- CUIDADO: Isso apaga TODAS as tabelas!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Passo 2: Aplicar Migrations
Depois do reset, execute as migrations na ordem:

1. `supabase/migrations/20241123000000_initial_fisioflow_schema.sql`
2. `supabase/migrations/20241124000001_add_notebooks.sql`
3. `supabase/migrations/20241124000002_add_knowledge_base.sql`

---

## Opção 2: Resetar via CLI

```bash
cd C:\Users\rafal\OneDrive\Documentos\antigravity
supabase db reset --linked
```

Isso vai:
- Apagar todas as tabelas
- Aplicar todas as migrations automaticamente
- Recriar tudo do zero

---

## ✅ Migrations Corrigidas

As migrations foram corrigidas para:
- ✅ Criar tabelas antes de adicionar colunas
- ✅ Tratar tipos/enums já existentes
- ✅ Usar `gen_random_uuid()` em vez de `uuid_generate_v4()`
- ✅ Verificar existência antes de criar foreign keys

---

## 🚀 Após Reset

Execute as migrations na ordem e tudo deve funcionar perfeitamente!

