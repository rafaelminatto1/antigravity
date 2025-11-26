# 🔧 Guia de Configuração de Integrações - FisioFlow

## 📋 Status Atual

✅ **Sistema Base:** Funcionando
- Migrations aplicadas
- Tabelas criadas
- Edge Functions deployadas
- Storage bucket configurado

⚠️ **Integrações Externas:** Pendentes
- WhatsApp Business API
- Resend (Email)
- QStash (Cron Jobs)

---

## 1. WhatsApp Business API

### Passo 1: Criar App no Meta Business

1. Acesse: https://business.facebook.com
2. Vá em **Meta Business Suite** > **Apps**
3. Clique em **Criar App**
4. Selecione **Business** como tipo
5. Preencha os dados da sua clínica

### Passo 2: Configurar WhatsApp Business API

1. No app criado, vá em **WhatsApp** > **API Setup**
2. Siga o processo de verificação do número de telefone
3. Anote:
   - **Phone Number ID** (ex: `123456789012345`)
   - **Access Token** (ex: `EAAxxxxxxxxxxxxx`)

### Passo 3: Configurar no Supabase

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
2. Vá em **Settings** > **Edge Functions** > **Secrets**
3. Adicione:
   ```
   WHATSAPP_API_TOKEN=seu_token_aqui
   WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_aqui
   ```

### Passo 4: Atualizar Edge Functions

As Edge Functions já estão preparadas para usar essas variáveis. Quando configuradas, elas automaticamente enviarão mensagens via WhatsApp.

---

## 2. Resend (Email)

### Passo 1: Criar Conta

1. Acesse: https://resend.com
2. Crie uma conta gratuita
3. Verifique seu domínio (ou use domínio de teste)

### Passo 2: Obter API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Copie a chave gerada (ex: `re_xxxxxxxxxxxxx`)

### Passo 3: Configurar no Supabase

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
2. Vá em **Settings** > **Edge Functions** > **Secrets**
3. Adicione:
   ```
   RESEND_API_KEY=sua_api_key_aqui
   ```

### Passo 4: Atualizar Edge Functions (Opcional)

Para enviar emails, você precisará atualizar as Edge Functions para usar a API do Resend. Exemplo:

```typescript
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

await resend.emails.send({
  from: "noreply@suaclinica.com",
  to: patient.email,
  subject: "Lembrete de Agendamento",
  html: message,
});
```

---

## 3. QStash (Cron Jobs)

### Passo 1: Criar Conta

1. Acesse: https://upstash.com
2. Crie uma conta gratuita
3. Vá em **QStash** no menu

### Passo 2: Obter Token

1. No dashboard do QStash, vá em **API Keys**
2. Copie o **QStash Token** (ex: `qst_xxxxxxxxxxxxx`)

### Passo 3: Configurar Cron Jobs

#### Lembretes de Agendamento (Diário às 8h)

Execute no PowerShell ou Terminal:

```powershell
$QSTASH_TOKEN = "seu_token_aqui"
$SUPABASE_URL = "https://urfxniitfbbvsaskicfo.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA"

$body = @{
    destination = "$SUPABASE_URL/functions/v1/send-appointment-reminder"
    cron = "0 8 * * *"
    headers = @{
        Authorization = "Bearer $SUPABASE_ANON_KEY"
        "Content-Type" = "application/json"
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://qstash.upstash.io/v2/schedules" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $QSTASH_TOKEN"; "Content-Type"="application/json"} `
    -Body $body
```

#### Mensagens de Aniversário (Diário às 9h)

```powershell
$body = @{
    destination = "$SUPABASE_URL/functions/v1/send-birthdays"
    cron = "0 9 * * *"
    headers = @{
        Authorization = "Bearer $SUPABASE_ANON_KEY"
        "Content-Type" = "application/json"
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://qstash.upstash.io/v2/schedules" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $QSTASH_TOKEN"; "Content-Type"="application/json"} `
    -Body $body
```

---

## 4. Testar Integrações

### Teste Manual de Edge Functions

#### Teste de Lembretes:
```powershell
$SUPABASE_URL = "https://urfxniitfbbvsaskicfo.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA"

Invoke-WebRequest -Uri "$SUPABASE_URL/functions/v1/send-appointment-reminder" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $SUPABASE_ANON_KEY"; "Content-Type"="application/json"}
```

#### Teste de Aniversários:
```powershell
Invoke-WebRequest -Uri "$SUPABASE_URL/functions/v1/send-birthdays" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $SUPABASE_ANON_KEY"; "Content-Type"="application/json"}
```

### Verificar Logs

```sql
-- Ver logs de comunicação
SELECT id, type, channel, status, sent_at, LEFT(message, 100) as message_preview
FROM communication_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 5. Checklist Final

- [ ] WhatsApp Business API configurado
- [ ] Resend API Key configurado
- [ ] QStash Token obtido
- [ ] Cron jobs configurados
- [ ] Edge Functions testadas manualmente
- [ ] Logs de comunicação verificados
- [ ] Upload de anexos testado
- [ ] Fluxo completo testado (criar paciente → prontuário → agendamento → lembrete)

---

## 📝 Notas Importantes

1. **WhatsApp Business API** requer verificação do número de telefone e aprovação do Meta
2. **Resend** oferece plano gratuito com 3.000 emails/mês
3. **QStash** oferece plano gratuito com 10.000 requisições/mês
4. As Edge Functions estão prontas, apenas precisam das credenciais configuradas
5. Para produção, considere usar variáveis de ambiente seguras

---

**Próximo Passo:** Configure as integrações seguindo os passos acima e teste o sistema completo! 🚀

