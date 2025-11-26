# Database Seeds

Esta pasta contém scripts de seed para popular o banco de dados com dados iniciais.

## Estrutura Esperada

- Scripts de seed para desenvolvimento
- Scripts de seed para testes
- Dados de exemplo

## Nota

O projeto também usa `supabase/seed.sql` para seeds do Supabase CLI.

## Exemplo de Uso

```sql
-- seeds/development.sql
INSERT INTO organizations (name, slug) VALUES
  ('Clínica Exemplo', 'clinica-exemplo');
```

