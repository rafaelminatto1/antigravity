# ✅ Variáveis de Ambiente Configuradas no Vercel

## 📋 Variáveis Adicionadas

As seguintes variáveis de ambiente foram adicionadas ao projeto Vercel:

### WhatsApp Business API

1. **WHATSAPP_API_TOKEN**
   - Valor: `EAAjPUGyZBQPoBPuHi3nmXTF8VtvqqTH1raoWFqM8ZAuZCzJZA2827TibaOuXZCVtPUpEmPT4QHNDOFRI1ZCiqZAmyTNJOX3yVuAlZBReJcXgI5OP7dtll9EUZBPt9PGRWdYsPwRQRvO4G2nCWeShzTLgPC0fwABtvfWHRyNMtXultxxPLMhuxJen6rFnPzUZALVWYWLk0ZAnGyNZBuAFC5IPcSn17xkytXwcVU8rARBOuEhQJlJHdc9TPD0tthswG8z4nxQZD`
   - Ambiente: `production`

2. **WHATSAPP_PHONE_NUMBER_ID**
   - Valor: `779431901927431`
   - Ambiente: `production`

3. **WHATSAPP_BUSINESS_ACCOUNT_ID**
   - Valor: `806225345331804`
   - Ambiente: `production`

4. **WHATSAPP_APP_ID**
   - Valor: `2479744142426362`
   - Ambiente: `production`

### Resend (Email)

5. **RESEND_API_KEY**
   - Valor: `re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg`
   - Ambiente: `production`

---

## 🔄 Próximos Passos

### 1. Adicionar para Outros Ambientes (Opcional)

Se você quiser adicionar as mesmas variáveis para `preview` e `development`:

```bash
# Para preview
echo "valor" | vercel env add WHATSAPP_API_TOKEN preview

# Para development
echo "valor" | vercel env add WHATSAPP_API_TOKEN development
```

### 2. Verificar Variáveis

```bash
vercel env ls
```

### 3. Fazer Redeploy (se necessário)

As variáveis estarão disponíveis no próximo deploy. Se quiser forçar um redeploy:

```bash
vercel --prod
```

---

## 📝 Notas

- ✅ Variáveis configuradas para ambiente `production`
- ✅ Disponíveis automaticamente no próximo deploy
- ✅ Acessíveis via `process.env.VARIAVEL` no código Next.js
- ⚠️ Para Edge Functions do Supabase, configure também no Supabase Dashboard

---

## 🔗 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Environment Variables:** https://vercel.com/dashboard/[seu-projeto]/settings/environment-variables

---

**Status:** ✅ **Variáveis configuradas no Vercel!**

