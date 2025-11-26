# 🔧 Configurar Variáveis de Ambiente no Supabase

## 📋 Passo a Passo

### 1. Acessar o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
2. Faça login na sua conta

### 2. Navegar até Edge Functions Secrets

1. No menu lateral, clique em **Settings** (Configurações)
2. Clique em **Edge Functions**
3. Clique na aba **Secrets**

### 3. Adicionar as Variáveis

Clique em **Add new secret** e adicione cada uma das variáveis abaixo:

#### WhatsApp Business API

**Nome:** `WHATSAPP_API_TOKEN`  
**Valor:** 
```
EAAjPUGyZBQPoBPuHi3nmXTF8VtvqqTH1raoWFqM8ZAuZCzJZA2827TibaOuXZCVtPUpEmPT4QHNDOFRI1ZCiqZAmyTNJOX3yVuAlZBReJcXgI5OP7dtll9EUZBPt9PGRWdYsPwRQRvO4G2nCWeShzTLgPC0fwABtvfWHRyNMtXultxxPLMhuxJen6rFnPzUZALVWYWLk0ZAnGyNZBuAFC5IPcSn17xkytXwcVU8rARBOuEhQJlJHdc9TPD0tthswG8z4nxQZD
```

**Nome:** `WHATSAPP_PHONE_NUMBER_ID`  
**Valor:**
```
779431901927431
```

**Nome:** `WHATSAPP_BUSINESS_ACCOUNT_ID`  
**Valor:**
```
806225345331804
```

**Nome:** `WHATSAPP_APP_ID`  
**Valor:**
```
2479744142426362
```

#### Resend (Email)

**Nome:** `RESEND_API_KEY`  
**Valor:**
```
re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg
```

### 4. Salvar e Verificar

1. Após adicionar todas as variáveis, clique em **Save**
2. As variáveis estarão disponíveis para as Edge Functions imediatamente
3. Não é necessário fazer redeploy das funções - elas já estão configuradas para usar essas variáveis

---

## ✅ Verificação

Após configurar, você pode testar as Edge Functions:

```powershell
.\test-edge-functions.ps1
```

Ou manualmente:

```powershell
$SUPABASE_URL = "https://urfxniitfbbvsaskicfo.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA"

# Testar lembretes
Invoke-WebRequest -Uri "$SUPABASE_URL/functions/v1/send-appointment-reminder" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $SUPABASE_ANON_KEY"}
```

---

## 📝 Notas Importantes

1. **Segurança:** As variáveis são armazenadas de forma segura e não são expostas no código
2. **Atualização:** Se precisar atualizar uma variável, basta editá-la no dashboard
3. **Logs:** Os logs das Edge Functions mostrarão se as variáveis estão sendo lidas corretamente
4. **Teste:** Sempre teste após configurar para garantir que tudo está funcionando

---

## 🔗 Links Úteis

- **Dashboard Supabase:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo
- **Edge Functions:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/functions
- **Secrets:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions

---

**Pronto!** Após configurar essas variáveis, as Edge Functions começarão a enviar mensagens via WhatsApp e Email automaticamente! 🚀

