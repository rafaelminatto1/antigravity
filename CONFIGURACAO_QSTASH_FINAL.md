# ✅ Configuração QStash - Sistema FisioFlow

## 📋 Status da Configuração

Data: 2024-11-26

---

## 🔐 Credenciais QStash

### Token
```
eyJVc2VySUQiOiI5YzI2ZjViNi1mMDlmLTRkODctYjczMi1hNzAzNzY2Nzc3MDIiLCJQYXNzd29yZCI6ImUxZTQ4M2M1MGEyZDQ0Zjk5NGI0NDBlNWUzNDZmNTI4In0=
```

### URL
```
https://qstash.upstash.io
```

### Signing Keys
- Current: `sig_6PS7CMCVnSJ9ESwAmNcnD3w5N4Ls`
- Next: `sig_81k7J6aNpNAD2NMFVUzCnJYMZZm3`

---

## ⚠️ Configuração Manual Necessária

Os cron jobs precisam ser configurados manualmente no dashboard do QStash devido a um problema com o formato da API.

### Passo a Passo

1. **Acesse:** https://console.upstash.com/qstash

2. **Criar Schedule 1 - Lembretes de Agendamento:**
   - Clique em **Schedules** > **Create Schedule**
   - **Destination:** `https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-appointment-reminder`
   - **Cron:** `0 8 * * *` (Diário às 8h UTC)
   - **Headers:**
     - `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA`
     - `Content-Type`: `application/json`
   - Clique em **Create**

3. **Criar Schedule 2 - Mensagens de Aniversário:**
   - Clique em **Schedules** > **Create Schedule**
   - **Destination:** `https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-birthdays`
   - **Cron:** `0 9 * * *` (Diário às 9h UTC)
   - **Headers:**
     - `Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA`
     - `Content-Type`: `application/json`
   - Clique em **Create**

---

## 🔄 Alternativa: Usar Supabase Cron (PostgreSQL)

Se preferir, pode usar o cron nativo do PostgreSQL via extensão `pg_cron`:

```sql
-- Instalar extensão (se não estiver instalada)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar função para chamar Edge Function
CREATE OR REPLACE FUNCTION send_appointment_reminders()
RETURNS void AS $$
BEGIN
  -- Chamar Edge Function via HTTP
  PERFORM net.http_post(
    url := 'https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-appointment-reminder',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA',
      'Content-Type', 'application/json'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agendar (se pg_cron estiver disponível)
SELECT cron.schedule(
  'send-appointment-reminders',
  '0 8 * * *',
  $$SELECT send_appointment_reminders()$$
);
```

---

## ✅ Verificação

Após configurar, verifique:

1. **QStash Dashboard:**
   - https://console.upstash.com/qstash
   - Verificar schedules criados
   - Verificar próximas execuções

2. **Supabase Logs:**
   - Edge Functions > Logs
   - Verificar execuções automáticas

3. **Communication Logs:**
   ```sql
   SELECT * FROM communication_logs 
   WHERE DATE(created_at) = CURRENT_DATE
   ORDER BY created_at DESC;
   ```

---

## 📝 Notas

- ⚠️ Script PowerShell teve problema com formato da API
- ✅ Configuração manual no dashboard é mais confiável
- ✅ Alternativa: Usar pg_cron se disponível no Supabase

---

**Status:** ⚠️ **CONFIGURAÇÃO MANUAL NECESSÁRIA**

Siga os passos acima para configurar os cron jobs no dashboard do QStash.

