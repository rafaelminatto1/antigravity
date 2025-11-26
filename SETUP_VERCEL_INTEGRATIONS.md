# Guia de Configuração - Integrações Vercel

## 1. Supabase via Vercel Marketplace

### Status: ✅ CONECTADO COM SUCESSO

### ✅ Projeto Conectado:
- **Projeto Supabase**: `supabase-yellow-ki`
- **Referência**: `jrxqcpbhwmmmeopiqpad`
- **URL**: `https://jrxqcpbhwmmmeopiqpad.supabase.co`

### ✅ Variáveis de Ambiente Configuradas:
Todas as variáveis foram criadas automaticamente no Vercel:

**Variáveis Principais (já configuradas):**
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅
- `POSTGRES_URL` ✅
- `POSTGRES_URL_NON_POOLING` ✅
- E outras variáveis de conexão PostgreSQL

### Próximos Passos:

1. **Aplicar Migrations no Supabase Dashboard:**
   - Acesse o Supabase Dashboard:
     - Via Vercel: Clique em "Open Supabase" na página de integrações
     - Ou diretamente: https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad
   - Vá para: **SQL Editor** (menu lateral)
   - Execute as migrations na seguinte ordem:

   **Ordem de Execução:**
   ```
   1. supabase/migrations/20251124210541_initial_fisioflow_schema.sql
   2. supabase/migrations/20241124_add_notebooks.sql
   3. supabase/migrations/20241124_add_knowledge_base.sql
   ```

   **Como executar:**
   - Copie o conteúdo completo de cada arquivo SQL
   - Cole no SQL Editor
   - Clique em "Run" ou pressione Ctrl+Enter
   - Aguarde a confirmação de sucesso
   - Repita para cada migration na ordem

2. **Verificar Conexão Local (Opcional):**
   - As variáveis já estão no Vercel
   - Para desenvolvimento local, você pode criar um `.env.local` com:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://jrxqcpbhwmmmeopiqpad.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - **Nota**: Use apenas para desenvolvimento. Em produção, o Vercel já tem as variáveis.

4. **Testar Conexão:**
   - Execute o projeto localmente: `npm run dev`
   - Teste login/registro
   - Verifique se as tabelas foram criadas

### ⚠️ Resolução de Conflitos (se necessário):

Se aparecer erro sobre variáveis existentes:
1. Vá para: Project Settings → Environment Variables
2. Remova variáveis antigas `POSTGRES_*` que possam estar conflitando
3. Tente conectar novamente

### ✅ Status Atual:
- **Projeto Supabase**: `supabase-yellow-ki` (jrxqcpbhwmmmeopiqpad)
- **Conectado ao projeto**: `antigravity`
- **Variáveis configuradas**: ✅ Todas automáticas
- **Próximo passo**: Aplicar migrations (ver `NEXT_STEPS_SUPABASE.md`)

---

## 2. Sentry (Monitoring)

### Status: ⚠️ Instalação existe, precisa configuração

### Passos:

1. **Acessar Sentry no Vercel:**
   - Vá para: https://vercel.com/rafael-minattos-projects/~/integrations/sentry
   - Ou procure "Sentry" no Marketplace

2. **Configurar DSN:**
   - O DSN deve ser configurado automaticamente via integração
   - Verifique em: Project Settings → Environment Variables
   - Variável esperada: `NEXT_PUBLIC_SENTRY_DSN`

3. **Verificar Configuração:**
   - Os arquivos já existem:
     - `sentry.client.config.ts`
     - `sentry.server.config.ts`
   - Verifique se o DSN está sendo usado corretamente

4. **Testar:**
   - Faça um deploy de teste
   - Gere um erro proposital
   - Verifique se aparece no Sentry Dashboard

---

## 3. Vercel Web Analytics

### Status: ⚠️ Precisa ativar

### Passos:

1. **Ativar Analytics:**
   - Vá para: Project Settings → Analytics
   - Clique em "Enable Web Analytics"
   - Isso é grátis no plano Pro

2. **Adicionar ao Código (se necessário):**
   - Verifique se `@vercel/analytics` está instalado: `npm list @vercel/analytics`
   - Se não estiver: `npm install @vercel/analytics`
   - Adicione ao `app/layout.tsx`:
   ```tsx
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

---

## 4. Integrações de IA (Fase 2)

### 4.1. Mixedbread (Search API)

**Status:** ⏳ Pendente

**Ação:**
1. Criar conta em: https://mixedbread.ai
2. Obter API key
3. Adicionar variável: `MIXEDBREAD_API_KEY`
4. Implementar serviço (ver plano)

### 4.2. Braintrust (AI Observability)

**Status:** ⏳ Pendente

**Ação:**
1. Criar conta em: https://braintrust.dev
2. Obter API key
3. Adicionar variável: `BRAINTRUST_API_KEY`
4. Implementar monitor (ver plano)

---

## Checklist de Implementação

### Fase 1 (Esta Semana):
- [ ] Verificar/Configurar Supabase via Vercel
- [ ] Aplicar migrations no banco
- [ ] Configurar Sentry via Marketplace
- [ ] Ativar Vercel Analytics
- [ ] Testar todas as integrações

### Fase 2 (1-2 Semanas):
- [ ] Avaliar e integrar Mixedbread
- [ ] Configurar Braintrust
- [ ] Testar busca multimodal
- [ ] Monitorar qualidade de IA

### Fase 3 (Futuro):
- [ ] Stripe para monetização
- [ ] Inngest para cron jobs
- [ ] Checkly para testes E2E

---

## Notas Importantes

1. **Supabase**: Se criar um banco novo, todas as migrations devem ser aplicadas na ordem correta
2. **Sentry**: A configuração via Marketplace deve criar as variáveis automaticamente
3. **Analytics**: Ativação é instantânea, sem necessidade de código adicional (mas pode adicionar componente)
4. **IA**: As integrações de IA requerem contas externas e implementação de código

