# 🏗️ Visão Geral do Sistema DuduFisio

## 🎯 Arquitetura Completa

Este documento apresenta a visão geral de todos os módulos, integrações e fluxos de dados do sistema DuduFisio.

---

## 📊 Módulos Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DUDUFISIO                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   GESTÃO     │  │  TRATAMENTO  │  │   PACIENTE   │     │
│  │              │  │              │  │              │     │
│  │ • Pacientes  │  │ • Evolução   │  │ • App Mobile │     │
│  │ • Agenda     │  │ • Exercícios │  │ • WhatsApp   │     │
│  │ • Financeiro │  │ • Mapa Dor   │  │ • Portal     │     │
│  │ • Relatórios │  │ • Materiais  │  │ • Feedback   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  AUTOMAÇÃO   │  │      IA      │  │  INTEGRAÇÕES │     │
│  │              │  │              │  │              │     │
│  │ • WhatsApp   │  │ • Gemini     │  │ • Stripe     │     │
│  │ • E-mail     │  │ • Transcrição│  │ • Sentry     │     │
│  │ • Lista      │  │ • Sugestões  │  │ • Analytics  │     │
│  │   Espera     │  │ • Relatórios │  │ • Storage    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo Completo do Fisioterapeuta

```
1. LOGIN
   ↓
2. DASHBOARD
   • Sessões do dia
   • Pacientes aguardando
   • Métricas rápidas
   ↓
3. AGENDA
   • Visualizar sessões
   • Criar novo agendamento
   • Gerenciar horários
   ↓
4. INICIAR ATENDIMENTO
   ↓
5. EVOLUÇÃO DE SESSÃO (SOAP)
   • S - Subjetivo (queixas)
   • O - Objetivo (avaliação)
   • A - Avaliação (análise)
   • P - Plano (condutas)
   ↓
6. MAPA DE DOR
   • Registrar regiões
   • Intensidade 0-10
   • Comparar com sessões anteriores
   ↓
7. EXERCÍCIOS
   • Prescrever da biblioteca
   • Adicionar vídeos
   • Definir séries/repetições
   ↓
8. SALVAR EVOLUÇÃO
   ↓
9. FINALIZAR SESSÃO
   • Marcar como concluída
   • Enviar resumo ao paciente
   ↓
10. PRÓXIMO PACIENTE
```

---

## 🔄 Fluxo Completo do Paciente

```
1. RECEBE LEMBRETE (WhatsApp)
   • 24h antes da sessão
   • Confirmar/Cancelar/Reagendar
   ↓
2. CONFIRMA PRESENÇA
   ↓
3. COMPARECE NA CLÍNICA
   ↓
4. REALIZA SESSÃO
   ↓
5. RECEBE RESUMO (WhatsApp/E-mail)
   • Exercícios prescritos
   • Orientações
   • Mapa de dor
   ↓
6. ACESSA APP MOBILE
   • Ver exercícios
   • Assistir vídeos
   • Marcar como concluído
   ↓
7. REGISTRA DOR (se houver)
   • Mapa corporal
   • Intensidade
   • Observações
   ↓
8. CHAT COM FISIOTERAPEUTA
   • Tirar dúvidas
   • Enviar fotos
   ↓
9. FEEDBACK DA SESSÃO
   • Emojis de satisfação
   ↓
10. PRÓXIMA SESSÃO
```

---

## 🗄️ Arquitetura de Dados

```
┌─────────────────────────────────────────┐
│         SUPABASE (Backend)              │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  BANCO DE DADOS (PostgreSQL)    │   │
│  │                                 │   │
│  │  • users                        │   │
│  │  • patients                     │   │
│  │  • sessions                     │   │
│  │  • evolutions                   │   │
│  │  • exercises                    │   │
│  │  • pain_maps                    │   │
│  │  • waitlist                     │   │
│  │  • materials                    │   │
│  │  • feedbacks                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  AUTENTICAÇÃO                   │   │
│  │  • Login/Logout                 │   │
│  │  • JWT Tokens                   │   │
│  │  • Roles (admin, fisio, paciente)│  │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  STORAGE                        │   │
│  │  • Vídeos de exercícios         │   │
│  │  • Fotos de pacientes           │   │
│  │  • PDFs de materiais            │   │
│  │  • Documentos                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  REALTIME                       │   │
│  │  • Chat                         │   │
│  │  • Notificações                 │   │
│  │  • Atualizações de agenda       │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔌 Integrações Externas

```
┌─────────────────────────────────────────┐
│  EVOLUTION API (WhatsApp)               │
│  • Lembretes automáticos                │
│  • Confirmações                         │
│  • Notificações de vagas                │
│  • Chat com pacientes                   │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│  GOOGLE GEMINI (IA)                     │
│  • Transcrição de áudio                 │
│  • Sugestões de condutas                │
│  • Geração de relatórios                │
│  • Análise de evolução                  │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│  STRIPE (Pagamentos)                    │
│  • Assinaturas                          │
│  • Pagamentos de sessões                │
│  • Gestão de planos                     │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│  SENTRY (Monitoramento)                 │
│  • Rastreamento de erros                │
│  • Performance                          │
│  • Alertas                              │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│  VERCEL ANALYTICS                       │
│  • Métricas de uso                      │
│  • Performance                          │
│  • Web Vitals                           │
└─────────────────────────────────────────┘
```

---

## ⚙️ Automações (Cron Jobs)

```
┌─────────────────────────────────────────┐
│  INNGEST (Automações)                   │
├─────────────────────────────────────────┤
│                                         │
│  🕐 9h e 17h (Diariamente)              │
│  → Enviar lembretes WhatsApp            │
│     (sessões do dia seguinte)           │
│                                         │
│  🕐 A cada 15 minutos                   │
│  → Verificar timeouts                   │
│     (confirmações e lista de espera)    │
│                                         │
│  🕐 0h (Diariamente)                    │
│  → Gerar relatórios diários             │
│     (métricas, no-shows, receita)       │
│                                         │
│  🕐 Segunda 8h (Semanalmente)           │
│  → Enviar resumo semanal                │
│     (fisioterapeutas e admin)           │
│                                         │
│  🕐 1º dia do mês 8h (Mensalmente)      │
│  → Faturamento                          │
│  → Relatórios financeiros               │
│  → Cobranças recorrentes                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎨 Stack Tecnológico

### Frontend (Web)
```
┌─────────────────────────────────────────┐
│  • React 18                             │
│  • TypeScript                           │
│  • Tailwind CSS                         │
│  • Shadcn/ui                            │
│  • React Query                          │
│  • Zustand (Estado)                     │
│  • React Hook Form                      │
│  • Zod (Validação)                      │
└─────────────────────────────────────────┘
```

### Frontend (Mobile)
```
┌─────────────────────────────────────────┐
│  • React Native                         │
│  • Expo                                 │
│  • TypeScript                           │
│  • NativeWind (Tailwind)                │
│  • React Navigation                     │
│  • React Query                          │
│  • Zustand                              │
└─────────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────────┐
│  • Supabase (BaaS)                      │
│  • PostgreSQL                           │
│  • Inngest (Cron Jobs)                  │
│  • Evolution API (WhatsApp)             │
└─────────────────────────────────────────┘
```

### Hospedagem
```
┌─────────────────────────────────────────┐
│  • Vercel (Frontend Web)                │
│  • Expo EAS (App Mobile)                │
│  • Supabase Cloud (Backend)             │
└─────────────────────────────────────────┘
```

---

## 📱 Plataformas Suportadas

```
┌─────────────────────────────────────────┐
│  WEB (Desktop)                          │
│  • Chrome, Firefox, Safari, Edge        │
│  • Responsivo (1920px até 1280px)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  WEB (Tablet)                           │
│  • iPad, Android Tablets                │
│  • Responsivo (1024px até 768px)        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  MOBILE (App Nativo)                    │
│  • iOS 13+ (App Store)                  │
│  • Android 8+ (Google Play)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  WHATSAPP                               │
│  • Notificações                         │
│  • Confirmações                         │
│  • Chat                                 │
└─────────────────────────────────────────┘
```

---

## 🔐 Segurança

```
┌─────────────────────────────────────────┐
│  AUTENTICAÇÃO                           │
│  • JWT Tokens                           │
│  • Refresh Tokens                       │
│  • 2FA (Opcional)                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  AUTORIZAÇÃO (RLS)                      │
│  • Row Level Security                   │
│  • Roles: admin, fisio, paciente        │
│  • Políticas por tabela                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  DADOS                                  │
│  • HTTPS (TLS 1.3)                      │
│  • Criptografia em repouso              │
│  • Backup diário                        │
│  • LGPD compliant                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  MONITORAMENTO                          │
│  • Sentry (Erros)                       │
│  • Vercel Analytics                     │
│  • Logs centralizados                   │
└─────────────────────────────────────────┘
```

---

## 📊 Métricas e KPIs

```
┌─────────────────────────────────────────┐
│  OPERACIONAIS                           │
│  • Sessões realizadas/dia               │
│  • Taxa de no-show (< 10%)              │
│  • Tempo médio de atendimento           │
│  • Pacientes ativos                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  FINANCEIROS                            │
│  • Receita mensal                       │
│  • Ticket médio                         │
│  • Taxa de conversão                    │
│  • Churn rate                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  QUALIDADE                              │
│  • NPS (Net Promoter Score)             │
│  • Satisfação do paciente               │
│  • Taxa de adesão a exercícios          │
│  • Tempo de resposta (chat)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TÉCNICOS                               │
│  • Uptime (> 99.9%)                     │
│  • Tempo de resposta (< 200ms)          │
│  • Taxa de erro (< 0.1%)                │
│  • Core Web Vitals                      │
└─────────────────────────────────────────┘
```

---

## 🚀 Roadmap de Funcionalidades

### ✅ Fase 1: MVP (Concluído)
- [x] Gestão de pacientes
- [x] Agenda básica
- [x] Evolução SOAP
- [x] Biblioteca de exercícios

### ✅ Fase 2: Design (Concluído)
- [x] Redesign completo
- [x] Paleta de cores profissional
- [x] Tipografia consistente
- [x] Layout responsivo

### ✅ Fase 3: Evolução Avançada (Concluído)
- [x] Campo Subjetivo (S)
- [x] Auto-preenchimento profissional
- [x] Campo Plano estruturado
- [x] Auto-save

### 🔄 Fase 4: Automação (Em Progresso)
- [ ] Confirmações WhatsApp
- [ ] Lista de espera
- [ ] Mapa de dor realista

### 📅 Fase 5: App Paciente (Planejado)
- [ ] App iOS nativo
- [ ] App Android nativo
- [ ] Push notifications
- [ ] Chat em tempo real

### 📅 Fase 6: IA (Planejado)
- [ ] Transcrição de áudio
- [ ] Sugestões de condutas
- [ ] Geração de relatórios
- [ ] Análise preditiva

### 📅 Fase 7: Materiais (Planejado)
- [ ] Biblioteca de materiais clínicos
- [ ] Escalas validadas
- [ ] Templates de anamnese
- [ ] Exportação PDF

---

## 🎯 Diferenciais Competitivos

```
┌─────────────────────────────────────────┐
│  VS CONCORRENTES                        │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Mapa de dor anatômico realista      │
│  ✅ App nativo para pacientes           │
│  ✅ Biblioteca de materiais clínicos    │
│  ✅ Integração com IA (Gemini)          │
│  ✅ Confirmações WhatsApp automáticas   │
│  ✅ Lista de espera inteligente         │
│  ✅ Feedback com emojis                 │
│  ✅ Design moderno (Monday-inspired)    │
│  ✅ Escalas validadas integradas        │
│  ✅ Exportação PDF profissional         │
│                                         │
│  = LÍDER DO MERCADO BRASILEIRO 🏆       │
└─────────────────────────────────────────┘
```

---

## 📞 Suporte e Manutenção

```
┌─────────────────────────────────────────┐
│  MONITORAMENTO 24/7                     │
│  • Sentry (Erros em tempo real)         │
│  • Vercel (Performance)                 │
│  • Supabase (Database health)           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  BACKUPS                                │
│  • Diário (Supabase automático)         │
│  • Retenção: 30 dias                    │
│  • Restore em < 1 hora                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ATUALIZAÇÕES                           │
│  • Deploy contínuo (Vercel)             │
│  • Rollback automático em caso de erro  │
│  • Testes automatizados                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SUPORTE                                │
│  • Chat in-app                          │
│  • E-mail: suporte@dudufisio.com        │
│  • WhatsApp: (11) 99999-9999            │
│  • SLA: 4 horas úteis                   │
└─────────────────────────────────────────┘
```

---

## 📈 Escalabilidade

```
ATUAL (MVP)
├─ 10 clínicas
├─ 50 fisioterapeutas
├─ 500 pacientes ativos
└─ 2.000 sessões/mês

CURTO PRAZO (6 meses)
├─ 100 clínicas
├─ 500 fisioterapeutas
├─ 5.000 pacientes ativos
└─ 20.000 sessões/mês

MÉDIO PRAZO (1 ano)
├─ 500 clínicas
├─ 2.500 fisioterapeutas
├─ 25.000 pacientes ativos
└─ 100.000 sessões/mês

LONGO PRAZO (2 anos)
├─ 2.000 clínicas
├─ 10.000 fisioterapeutas
├─ 100.000 pacientes ativos
└─ 400.000 sessões/mês
```

**Infraestrutura Preparada:**
- ✅ Supabase (escala automática)
- ✅ Vercel (edge network global)
- ✅ CDN para vídeos
- ✅ Load balancing
- ✅ Database replication

---

## 💰 Modelo de Negócio

```
┌─────────────────────────────────────────┐
│  PLANOS                                 │
├─────────────────────────────────────────┤
│                                         │
│  🟢 BÁSICO - R$ 97/mês                  │
│  • 1 fisioterapeuta                     │
│  • 50 pacientes ativos                  │
│  • Funcionalidades essenciais           │
│                                         │
│  🟡 PROFISSIONAL - R$ 197/mês           │
│  • 3 fisioterapeutas                    │
│  • 150 pacientes ativos                 │
│  • Todas as funcionalidades             │
│  • App para pacientes                   │
│                                         │
│  🔴 CLÍNICA - R$ 497/mês                │
│  • Fisioterapeutas ilimitados           │
│  • Pacientes ilimitados                 │
│  • Tudo + IA + Suporte prioritário      │
│                                         │
└─────────────────────────────────────────┘
```

---

**Documento Vivo:** Atualizado continuamente conforme evolução do sistema.

**Última Atualização:** 06/11/2025
