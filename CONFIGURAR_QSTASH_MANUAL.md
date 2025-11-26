# 🔧 Configurar Cron Jobs no QStash - Guia Manual

## 📋 Passo a Passo Completo

### 1. Acessar o Dashboard QStash

1. Acesse: https://console.upstash.com/qstash
2. Faça login na sua conta
3. Selecione seu projeto

---

## 2. Criar Schedule 1: Lembretes de Agendamento

> **💡 Dica:** Quando clicar em "+ New" nos Headers, aparecerá um dropdown com opções do QStash. Para "Authorization", digite manualmente. Para "Upstash-Cron", selecione da lista.

### Passos:

1. No menu lateral, clique em **Schedules**
2. Clique em **Create Schedule** ou **+ New Schedule**

3. Preencha os campos:

   **Destination:**
   - Selecione o dropdown e escolha **URL**
   - No campo de URL, digite:
   ```
   https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-appointment-reminder
   ```

   **Body:**
   - Deixe vazio (campo opcional)

   **Headers:**
   - **Content-Type:** `application/json` (já deve estar preenchido)
   
   - Clique em **+ New** para adicionar novo header
   - **IMPORTANTE:** Quando clicar em "+ New", aparecerá um dropdown com opções do QStash (Upstash-Delay, Upstash-Timeout, etc.)
   - Para adicionar o header "Authorization", você precisa **digitar manualmente** no campo "Name" (não está na lista)
   - **Name:** Digite `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA`
   
   - Clique em **+ New** novamente para adicionar o cron
   - **IMPORTANTE:** Desta vez, no dropdown que aparece, **selecione** `Upstash-Cron` (está na lista!)
   - **Value:** `0 8 * * *`
   - No dropdown ao lado do valor, selecione o timezone: `America/Sao_Paulo` (ou UTC se preferir)

   **Default options:**
   - **Method:** Já deve estar como `POST` (verificar)
   - **Retry:** Já deve estar como `3` (padrão)

4. Clique em **Create** ou **Save**

---

## 3. Criar Schedule 2: Mensagens de Aniversário

> **💡 Dica:** Quando clicar em "+ New" nos Headers, aparecerá um dropdown com opções do QStash. Para "Authorization", digite manualmente. Para "Upstash-Cron", selecione da lista.

### Passos:

1. Clique em **Create Schedule** novamente

2. Preencha os campos:

   **Destination:**
   - Selecione o dropdown e escolha **URL**
   - No campo de URL, digite:
   ```
   https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-birthdays
   ```

   **Body:**
   - Deixe vazio (campo opcional)

   **Headers:**
   - **Content-Type:** `application/json` (já deve estar preenchido)
   
   - Clique em **+ New** para adicionar novo header
   - **IMPORTANTE:** Quando clicar em "+ New", aparecerá um dropdown com opções do QStash (Upstash-Delay, Upstash-Timeout, etc.)
   - Para adicionar o header "Authorization", você precisa **digitar manualmente** no campo "Name" (não está na lista)
   - **Name:** Digite `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA`
   
   - Clique em **+ New** novamente para adicionar o cron
   - **IMPORTANTE:** Desta vez, no dropdown que aparece, **selecione** `Upstash-Cron` (está na lista!)
   - **Value:** `0 9 * * *`
   - No dropdown ao lado do valor, selecione o timezone: `America/Sao_Paulo` (ou UTC se preferir)

   **Default options:**
   - **Method:** Já deve estar como `POST` (verificar)
   - **Retry:** Já deve estar como `3` (padrão)

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

### Horários e Timezone

**Importante:** O QStash permite selecionar o timezone no header `Upstash-Cron`.

**Opções:**

1. **Usar Timezone Brasil (Recomendado):**
   - Selecione `America/Sao_Paulo` no dropdown
   - **Cron:** `0 8 * * *` = 8h BRT (Horário de Brasília)
   - **Cron:** `0 9 * * *` = 9h BRT (Horário de Brasília)

2. **Usar UTC:**
   - Selecione `UTC` no dropdown
   - **Cron:** `0 8 * * *` = 8h UTC (5h BRT)
   - **Cron:** `0 9 * * *` = 9h UTC (6h BRT)

**Recomendação:** Use `America/Sao_Paulo` para facilitar o entendimento dos horários.

### Credenciais

- **QStash Token:** `eyJVc2VySUQiOiI5YzI2ZjViNi1mMDlmLTRkODctYjczMi1hNzAzNzY2Nzc3MDIiLCJQYXNzd29yZCI6ImUxZTQ4M2M1MGEyZDQ0Zjk5NGI0NDBlNWUzNDZmNTI4In0=`
- **QStash URL:** `https://qstash.upstash.io`

---

## ✅ Conclusão

Após seguir este guia, os cron jobs estarão configurados e executando automaticamente!

**Status:** ⚠️ **AGUARDANDO CONFIGURAÇÃO MANUAL NO DASHBOARD**

---

**Link Direto:** https://console.upstash.com/qstash

