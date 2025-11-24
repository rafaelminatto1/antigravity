# 💬 Fluxograma: Confirmações WhatsApp

## 🎯 Visão Geral

Sistema automatizado de confirmações de sessões via WhatsApp que:
- Envia lembretes 24h antes
- Permite confirmação/cancelamento/reagendamento
- Reduz no-shows em 30%
- Integra com lista de espera

---

## ⏰ Fluxo 1: Envio Automático de Lembretes

```
┌─────────────────────────────────────────┐
│  CRON JOB - 9h e 17h (Todos os Dias)    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Buscar Sessões do Dia Seguinte         │
│  (que ainda não receberam lembrete)     │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
    [Nenhuma]          [Encontrou]
        │                   │
        ↓                   ↓
    [FIM]           ┌───────────────┐
                    │  Para cada    │
                    │  sessão...    │
                    └───────────────┘
                            ↓
┌─────────────────────────────────────────┐
│  Obter Dados:                           │
│  - Nome do paciente                     │
│  - Telefone                             │
│  - Data e hora da sessão                │
│  - Nome do fisioterapeuta               │
│  - Endereço da clínica                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Montar Mensagem WhatsApp               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  📅 LEMBRETE DE SESSÃO                  │
│                                         │
│  Olá, João!                             │
│                                         │
│  Sua sessão está agendada para:         │
│  📅 Amanhã, 06/11/2025                  │
│  🕐 14h00                                │
│  👨‍⚕️ Dr. Silva                           │
│  📍 Rua das Flores, 123                 │
│                                         │
│  Por favor, confirme sua presença:      │
│                                         │
│  ✅ SIM - Confirmar                     │
│  ❌ NÃO - Cancelar                      │
│  🔄 REAGENDAR                           │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Enviar via Evolution API               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Marcar no Banco de Dados:              │
│  - reminder_sent = true                 │
│  - reminder_sent_at = agora             │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
    [Mais Sessões?]    [Não]
        │                   │
        ↓                   ↓
    [Próxima]           [FIM]
```

**Detalhes Técnicos:**
- Cron job via Inngest
- Executa 2x/dia (9h e 17h)
- Evolution API para WhatsApp
- Timeout: 30 segundos por mensagem

---

## ✅ Fluxo 2: Confirmação de Presença

```
┌─────────────────────────────────────────┐
│  Paciente recebe mensagem WhatsApp      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Paciente responde: "SIM"               │
│  (ou "S", "OK", "CONFIRMO", "1")        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Webhook recebe resposta                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Identificar Paciente pelo Telefone     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Buscar Sessão Pendente de Confirmação  │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
    [Encontrou]         [Não Encontrou]
        │                   │
        ↓                   ↓
┌───────────────┐       [Ignorar]
│  Atualizar BD │
│  confirmed =  │
│  true         │
└───────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Enviar Confirmação ao Paciente         │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  ✅ SESSÃO CONFIRMADA!                  │
│                                         │
│  Sua presença foi confirmada para:      │
│  📅 Amanhã, 06/11 às 14h00              │
│  👨‍⚕️ Dr. Silva                           │
│                                         │
│  Nos vemos em breve! 💪                 │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Notificar Fisioterapeuta               │
│  (Dashboard + E-mail)                   │
└─────────────────────────────────────────┘
        ↓
    [FIM]
```

**Respostas Aceitas:**
- SIM, S, OK, CONFIRMO, CONFIRMAR, 1, ✅

---

## ❌ Fluxo 3: Cancelamento de Sessão

```
┌─────────────────────────────────────────┐
│  Paciente responde: "NÃO"               │
│  (ou "N", "CANCELAR", "0")              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Webhook recebe resposta                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Identificar Paciente e Sessão          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Atualizar BD:                          │
│  - status = "cancelled"                 │
│  - cancelled_at = agora                 │
│  - cancelled_by = "patient"             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Enviar Confirmação de Cancelamento     │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  ❌ SESSÃO CANCELADA                    │
│                                         │
│  Sua sessão foi cancelada:              │
│  📅 06/11 às 14h00                      │
│                                         │
│  O horário foi liberado.                │
│                                         │
│  Deseja reagendar?                      │
│  Responda: REAGENDAR                    │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Notificar Fisioterapeuta               │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Verificar Lista de Espera              │
└─────────────────────────────────────────┘
        ↓
        ┌─────────┴─────────┐
        │                   │
    [Há Pacientes]      [Vazia]
        │                   │
        ↓                   ↓
┌───────────────┐       [FIM]
│  Notificar    │
│  Próximo da   │
│  Fila         │
└───────────────┘
        ↓
    [FIM]
```

**Respostas Aceitas:**
- NÃO, N, CANCELAR, CANCEL, 0, ❌

---

## 🔄 Fluxo 4: Reagendamento

```
┌─────────────────────────────────────────┐
│  Paciente responde: "REAGENDAR"         │
│  (ou "R", "MUDAR", "2")                 │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Buscar Horários Disponíveis            │
│  (próximos 7 dias)                      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Enviar Opções ao Paciente              │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  🔄 HORÁRIOS DISPONÍVEIS                │
│                                         │
│  Escolha um horário:                    │
│                                         │
│  1️⃣ Quinta, 07/11 às 09h00              │
│  2️⃣ Quinta, 07/11 às 14h00              │
│  3️⃣ Sexta, 08/11 às 10h00               │
│  4️⃣ Sexta, 08/11 às 15h00               │
│  5️⃣ Segunda, 11/11 às 09h00             │
│                                         │
│  Responda com o número (1-5)            │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Paciente responde: "3"                 │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Validar Escolha                        │
└─────────────────────────────────────────┘
        ↓
        ┌─────────┴─────────┐
        │                   │
    [Válida]            [Inválida]
        │                   │
        ↓                   ↓
┌───────────────┐   ┌───────────────┐
│  Reagendar    │   │  Pedir para   │
│  Sessão       │   │  escolher     │
└───────────────┘   │  novamente    │
        ↓           └───────────────┘
┌───────────────┐
│  Atualizar BD │
│  Nova data    │
└───────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Enviar Confirmação                     │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  ✅ SESSÃO REAGENDADA!                  │
│                                         │
│  Nova data:                             │
│  📅 Sexta, 08/11 às 10h00               │
│  👨‍⚕️ Dr. Silva                           │
│                                         │
│  Você receberá um novo lembrete.        │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Notificar Fisioterapeuta               │
└─────────────────────────────────────────┘
        ↓
    [FIM]
```

**Respostas Aceitas:**
- REAGENDAR, R, MUDAR, TROCAR, 2, 🔄

---

## ⏰ Fluxo 5: Timeout (Sem Resposta)

```
┌─────────────────────────────────────────┐
│  CRON JOB - A cada 15 minutos           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Buscar Lembretes sem Resposta          │
│  (enviados há mais de 24 horas)         │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
    [Nenhum]           [Encontrou]
        │                   │
        ↓                   ↓
    [FIM]           ┌───────────────┐
                    │  Para cada    │
                    │  lembrete...  │
                    └───────────────┘
                            ↓
┌─────────────────────────────────────────┐
│  Marcar como Não Confirmado             │
│  confirmed = false                      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Enviar Lembrete Final                  │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  ⏰ ÚLTIMA CHANCE!                       │
│                                         │
│  Sua sessão é AMANHÃ às 14h00           │
│                                         │
│  Por favor, confirme sua presença:      │
│  ✅ SIM ou ❌ NÃO                       │
│                                         │
│  Sem confirmação, o horário pode        │
│  ser oferecido para outro paciente.     │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Notificar Fisioterapeuta               │
│  "Paciente não confirmou presença"      │
└─────────────────────────────────────────┘
        ↓
    [FIM]
```

**Detalhes:**
- Timeout: 24 horas após envio
- Lembrete final: 6-12h antes da sessão
- Fisioterapeuta pode ligar para confirmar

---

## 📊 Dashboard de Confirmações

```
┌─────────────────────────────────────────┐
│  DASHBOARD - CONFIRMAÇÕES               │
├─────────────────────────────────────────┤
│                                         │
│  Amanhã (06/11):                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✅ 14h00 - João Silva          │   │
│  │  Confirmado às 10:30            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ⏳ 15h00 - Maria Santos        │   │
│  │  Aguardando confirmação         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ❌ 16h00 - Pedro Costa         │   │
│  │  Cancelado às 11:45             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Estatísticas:                          │
│  Taxa de confirmação: 85%               │
│  Taxa de cancelamento: 10%              │
│  Sem resposta: 5%                       │
└─────────────────────────────────────────┘
```

**Métricas:**
- Total de lembretes enviados
- Taxa de confirmação
- Taxa de cancelamento
- Taxa de reagendamento
- Taxa de no-show

---

## 🔧 Tecnologias Utilizadas

**Backend:**
- Inngest (Cron jobs)
- Evolution API (WhatsApp)
- Supabase (Banco de dados)
- Webhooks

**Integrações:**
- WhatsApp Business API
- Lista de Espera

---

## 📊 Impacto Esperado

**Antes:**
- No-show: 20-30%
- Confirmações manuais: 2h/dia
- Cancelamentos de última hora: 15%

**Depois:**
- No-show: < 10%
- Confirmações automáticas: 0h/dia
- Aproveitamento de cancelamentos: 70%

**ROI:**
- -30% de no-shows
- +R$ 180k/ano (100 clínicas)
- Payback: 2 meses

---

## ✅ Checklist de Implementação

- [ ] Configurar Evolution API
- [ ] Criar tabelas no banco
- [ ] Implementar cron jobs (Inngest)
- [ ] Criar webhook de respostas
- [ ] Testar fluxo completo
- [ ] Integrar com lista de espera
- [ ] Dashboard de métricas
- [ ] Documentação

---

**Tempo de Implementação:** 4-6 semanas  
**Prioridade:** 🔴 CRÍTICA  
**ROI:** ⭐⭐⭐⭐⭐ (Muito Alto)
