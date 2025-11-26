# 🔧 Adicionar Variáveis no Supabase (Edge Functions)

## ⚠️ IMPORTANTE

As variáveis foram adicionadas no **Vercel** (para o frontend Next.js), mas você também precisa adicioná-las no **Supabase** para que as **Edge Functions** funcionem!

---

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

#### Variável 1: WHATSAPP_API_TOKEN

**Nome:** `WHATSAPP_API_TOKEN`  
**Valor:** 
```
EAAjPUGyZBQPoBPuHi3nmXTF8VtvqqTH1raoWFqM8ZAuZCzJZA2827TibaOuXZCVtPUpEmPT4QHNDOFRI1ZCiqZAmyTNJOX3yVuAlZBReJcXgI5OP7dtll9EUZBPt9PGRWdYsPwRQRvO4G2nCWeShzTLgPC0fwABtvfWHRyNMtXultxxPLMhuxJen6rFnPzUZALVWYWLk0ZAnGyNZBuAFC5IPcSn17xkytXwcVU8rARBOuEhQJlJHdc9TPD0tthswG8z4nxQZD
```

#### Variável 2: WHATSAPP_PHONE_NUMBER_ID

**Nome:** `WHATSAPP_PHONE_NUMBER_ID`  
**Valor:**
```
779431901927431
```

#### Variável 3: WHATSAPP_BUSINESS_ACCOUNT_ID

**Nome:** `WHATSAPP_BUSINESS_ACCOUNT_ID`  
**Valor:**
```
806225345331804
```

#### Variável 4: WHATSAPP_APP_ID

**Nome:** `WHATSAPP_APP_ID`  
**Valor:**
```
2479744142426362
```

#### Variável 5: RESEND_API_KEY

**Nome:** `RESEND_API_KEY`  
**Valor:**
```
re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg
```

### 4. Salvar

Após adicionar todas as 5 variáveis, elas estarão disponíveis imediatamente para as Edge Functions.

---

## ✅ Verificação

Após configurar, você pode testar as Edge Functions:

```powershell
.\test-edge-functions.ps1
```

---

## 📝 Resumo

- ✅ **Vercel:** Variáveis adicionadas (para frontend Next.js)
- ⚠️ **Supabase:** Precisa adicionar manualmente (para Edge Functions)

---

**🔗 Link Direto:** https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions

