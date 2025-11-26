# 🚀 Teste Rápido de Conexão Supabase

## Passo 1: Testar Conexão (30 segundos)

1. **Acesse no navegador:**
   ```
   http://localhost:3000/api/test-connection
   ```

2. **Ou via curl:**
   ```bash
   curl http://localhost:3000/api/test-connection
   ```

3. **Resultado esperado:**
   ```json
   {
     "success": true,
     "message": "Conexão com Supabase funcionando!"
   }
   ```

---

## Passo 2: Criar Bucket Storage (2 minutos)

### Via Dashboard (Recomendado):

1. **Acesse:**
   https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad/storage/buckets

2. **Clique em "New bucket"**

3. **Configure:**
   - Nome: `knowledge-base`
   - Public: ❌ (desmarcado - privado)
   - File size limit: `50 MB`

4. **Clique em "Create bucket"**

5. **Pronto!** ✅

---

## ✅ Verificação Final

Execute novamente o teste de conexão:
```
http://localhost:3000/api/test-connection
```

Verifique se `storage.knowledgeBaseBucket.exists` é `true`:

```json
{
  "details": {
    "storage": {
      "knowledgeBaseBucket": {
        "exists": true  ← Deve ser true
      }
    }
  }
}
```

---

## 🎉 Pronto!

Se tudo estiver funcionando:
- ✅ Conexão com banco de dados OK
- ✅ Todas as tabelas criadas
- ✅ Bucket de storage criado
- ✅ Pronto para desenvolvimento!

