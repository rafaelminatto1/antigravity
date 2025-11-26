# 🔧 Configurar Cron Jobs no QStash - Guia Manual

## 📋 Passo a Passo Completo

### 1. Acessar o Dashboard QStash

1. Acesse: https://console.upstash.com/qstash
2. Faça login na sua conta
3. Selecione seu projeto

---

## 2. Criar Schedule 1: Lembretes de Agendamento

### Passos:

1. No menu lateral, clique em **Schedules**
2. Clique em **Create Schedule** ou **+ New Schedule**

3. Preencha os campos:

   **Destination URL:**
   ```
   https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-appointment-reminder
   ```

   **Cron Expression:**
   ```
   0 8 * * *
   ```
   (Diário às 8h UTC = 5h BRT)

   **Method:**
   ```
   POST
   ```

   **Headers:**
   - Clique em **Add Header**
   - **Name:** `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA`
   
   - Clique em **Add Header** novamente
   - **Name:** `Content-Type`
   - **Value:** `application/json`

4. Clique em **Create** ou **Save**

---

## 3. Criar Schedule 2: Mensagens de Aniversário

### Passos:

1. Clique em **Create Schedule** novamente

2. Preencha os campos:

   **Destination URL:**
   ```
   https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-birthdays
   ```

   **Cron Expression:**
   ```
   0 9 * * *
   ```
   (Diário às 9h UTC = 6h BRT)

   **Method:**
   ```
   POST
   ```

   **Headers:**
   - Clique em **Add Header**
   - **Name:** `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA`
   
   - Clique em **Add Header** novamente
   - **Name:** `Content-Type`
   - **Value:** `application/json`

3. Clique em **Create** ou **Save**

---

## ✅ Verificação

### Após Configurar:

1. **Verificar Schedules:**
   - Na página **Schedules**, você deve ver 2 schedules ativos
   - Verifique se estão com status **Active**

2. **Verificar Próxima Execução:**
   - Cada schedule mostra a próxima execução agendada
   - Lembretes: Amanhã às 8h UTC
   - Aniversários: Amanhã às 9h UTC

3. **Verificar Histórico:**
   - Após a primeira execução, verifique o histórico
   - Verifique se houve sucesso ou erro

---

## 🔍 Monitoramento

### Verificar Execuções:

1. **QStash Dashboard:**
   - Vá em **Schedules** > Selecione o schedule
   - Veja o histórico de execuções
   - Verifique logs de erro (se houver)

2. **Supabase Dashboard:**
   - Vá em **Edge Functions** > **Logs**
   - Verifique execuções automáticas
   - Verifique se há erros

3. **Communication Logs:**
   ```sql
   SELECT * FROM communication_logs 
   WHERE DATE(created_at) = CURRENT_DATE
   ORDER BY created_at DESC;
   ```

---

## 📝 Informações Importantes

### Horários (UTC vs BRT)

- **8h UTC** = **5h BRT** (Horário de Brasília)
- **9h UTC** = **6h BRT** (Horário de Brasília)

Se quiser ajustar para horário brasileiro:
- **8h BRT** = `0 11 * * *` (11h UTC)
- **9h BRT** = `0 12 * * *` (12h UTC)

### Credenciais

- **QStash Token:** `eyJVc2VySUQiOiI5YzI2ZjViNi1mMDlmLTRkODctYjczMi1hNzAzNzY2Nzc3MDIiLCJQYXNzd29yZCI6ImUxZTQ4M2M1MGEyZDQ0Zjk5NGI0NDBlNWUzNDZmNTI4In0=`
- **QStash URL:** `https://qstash.upstash.io`

---

## ✅ Conclusão

Após seguir este guia, os cron jobs estarão configurados e executando automaticamente!

**Status:** ⚠️ **AGUARDANDO CONFIGURAÇÃO MANUAL NO DASHBOARD**

---

**Link Direto:** https://console.upstash.com/qstash

