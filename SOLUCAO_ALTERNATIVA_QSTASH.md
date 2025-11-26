# 🔧 Solução Alternativa: Configurar QStash via Edge Function

## ⚠️ Problema

A API do QStash está rejeitando as URLs mesmo com o formato correto, e a interface web não permite digitar manualmente o header "Authorization".

## ✅ Solução: Edge Function no Supabase

Criei uma Edge Function que usa a API do QStash para criar os schedules programaticamente.

### Passo 1: Adicionar QStash Token no Supabase

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/secrets
2. Adicione o secret:
   - **Name:** `QSTASH_TOKEN`
   - **Value:** `eyJVc2VySUQiOiI5YzI2ZjViNi1mMDlmLTRkODctYjczMi1hNzAzNzY2Nzc3MDIiLCJQYXNzd29yZCI6ImUxZTQ4M2M1MGEyZDQ0Zjk5NGI0NDBlNWUzNDZmNTI4In0=`

### Passo 2: Fazer Deploy da Edge Function

Execute no terminal:

```powershell
cd supabase/functions/setup-qstash-schedules
supabase functions deploy setup-qstash-schedules
```

### Passo 3: Executar a Edge Function

```powershell
$SupabaseUrl = "https://urfxniitfbbvsaskicfo.supabase.co"
$SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA"

Invoke-RestMethod -Uri "$SupabaseUrl/functions/v1/setup-qstash-schedules" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $SupabaseAnonKey"
    "Content-Type" = "application/json"
  }
```

---

## 🔄 Alternativa: Usar SDK do QStash (Node.js)

Se preferir, pode criar um script Node.js local:

```bash
npm install @upstash/qstash
```

```javascript
import { Client } from "@upstash/qstash";

const client = new Client({
  token: "eyJVc2VySUQiOiI5YzI2ZjViNi1mMDlmLTRkODctYjczMi1hNzAzNzY2Nzc3MDIiLCJQYXNzd29yZCI6ImUxZTQ4M2M1MGEyZDQ0Zjk5NGI0NDBlNWUzNDZmNTI4In0="
});

// Criar schedule 1
await client.schedules.create({
  destination: "https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-appointment-reminder",
  cron: "0 8 * * *",
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  }
});

// Criar schedule 2
await client.schedules.create({
  destination: "https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-birthdays",
  cron: "0 9 * * *",
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  }
});
```

---

## 📝 Nota

A Edge Function criada tenta usar a API do QStash diretamente. Se ainda houver problemas, a melhor solução é usar o SDK do QStash via Node.js localmente.

