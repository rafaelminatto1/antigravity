# ⏳ Fluxograma: Lista de Espera

## 🎯 Visão Geral

Sistema de lista de espera que:
- Organiza pacientes por prioridade
- Notifica automaticamente quando há vagas
- Aproveita 70-80% dos cancelamentos
- Aumenta receita em 15-20%

---

## ➕ Fluxo 1: Adicionar à Lista de Espera

```
┌─────────────────────────────────────────┐
│  Paciente liga para agendar             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Recepcionista verifica agenda          │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
    [Há Vaga]          [Sem Vaga]
        │                   │
        ↓                   ↓
┌───────────────┐   ┌───────────────────┐
│  Agendar      │   │  Oferecer Lista   │
│  Normalmente  │   │  de Espera        │
└───────────────┘   └───────────────────┘
                            ↓
                    ┌───────────────────┐
                    │  Paciente aceita? │
                    └───────────────────┘
                            ↓
                    ┌─────────┴─────────┐
                    │                   │
                [SIM]               [NÃO]
                    │                   │
                    ↓                   ↓
            ┌───────────────┐       [FIM]
            │  Abrir Modal  │
            │  "Nova Lista  │
            │  de Espera"   │
            └───────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  ADICIONAR À LISTA DE ESPERA            │
├─────────────────────────────────────────┤
│                                         │
│  Paciente:                              │
│  ┌─────────────────────────────────┐   │
│  │  [v] João Silva                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Telefone:                              │
│  ┌─────────────────────────────────┐   │
│  │  (11) 98765-4321                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Preferências de Horário:               │
│  ☑ Manhã (8h-12h)                       │
│  ☑ Tarde (13h-18h)                      │
│  ☐ Noite (18h-20h)                      │
│                                         │
│  Preferências de Dia:                   │
│  ☑ Segunda  ☑ Terça  ☐ Quarta          │
│  ☑ Quinta   ☑ Sexta  ☐ Sábado          │
│                                         │
│  Prioridade:                            │
│  ○ Normal                               │
│  ● Alta                                 │
│  ○ Urgente                              │
│                                         │
│  Observações:                           │
│  ┌─────────────────────────────────┐   │
│  │ Pós-cirúrgico, precisa iniciar  │   │
│  │ tratamento em até 2 semanas     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancelar]  [Adicionar à Lista]        │
└─────────────────────────────────────────┘
                  ↓
        Clicar em "Adicionar à Lista"
                  ↓
┌─────────────────────────────────────────┐
│  Salvar no Banco de Dados               │
│  - patient_id                           │
│  - phone                                │
│  - preferences (JSON)                   │
│  - priority                             │
│  - notes                                │
│  - status = "waiting"                   │
│  - created_at                           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Enviar Confirmação por WhatsApp        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  ✅ VOCÊ ESTÁ NA LISTA DE ESPERA!       │
│                                         │
│  Olá, João!                             │
│                                         │
│  Você foi adicionado à nossa lista      │
│  de espera com prioridade ALTA.         │
│                                         │
│  Assim que surgir uma vaga compatível   │
│  com suas preferências, você será       │
│  notificado imediatamente.              │
│                                         │
│  Preferências registradas:              │
│  📅 Seg, Ter, Qui, Sex                  │
│  🕐 Manhã ou Tarde                      │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  ✅ Paciente Adicionado!                │
│                                         │
│  João Silva está na posição #3          │
│  da lista de espera.                    │
│                                         │
│  [Ver Lista Completa]  [OK]             │
└─────────────────────────────────────────┘
```

**Níveis de Prioridade:**
1. 🔴 **Urgente** - Pós-cirúrgico, dor aguda
2. 🟡 **Alta** - Tratamento recomendado em breve
3. 🟢 **Normal** - Sem urgência

---

## 📋 Fluxo 2: Visualizar Lista de Espera

```
MENU → Clicar em "Lista de Espera"
                  ↓
┌─────────────────────────────────────────┐
│      LISTA DE ESPERA                    │
├─────────────────────────────────────────┤
│                                         │
│  Filtros:                               │
│  [Todos] [Urgente] [Alta] [Normal]      │
│                                         │
│  Total: 8 pacientes aguardando          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔴 #1 - Maria Santos           │   │
│  │  (11) 91234-5678                │   │
│  │  Aguardando há 5 dias           │   │
│  │  Preferências: Seg/Qua Manhã    │   │
│  │  [Notificar] [Detalhes]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔴 #2 - Carlos Oliveira        │   │
│  │  (11) 98888-7777                │   │
│  │  Aguardando há 3 dias           │   │
│  │  Preferências: Ter/Qui Tarde    │   │
│  │  [Notificar] [Detalhes]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🟡 #3 - João Silva             │   │
│  │  (11) 98765-4321                │   │
│  │  Aguardando há 2 dias           │   │
│  │  Preferências: Seg-Sex Manhã    │   │
│  │  [Notificar] [Detalhes]         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [...]                                  │
│                                         │
│  [Adicionar Paciente]                   │
└─────────────────────────────────────────┘
```

**Ordenação:**
1. Prioridade (Urgente > Alta > Normal)
2. Data de entrada (mais antigo primeiro)

---

## ❌ Fluxo 3: Cancelamento Dispara Busca

```
┌─────────────────────────────────────────┐
│  Paciente cancela sessão                │
│  (via WhatsApp ou telefone)             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Sistema marca sessão como cancelada    │
│  - status = "cancelled"                 │
│  - slot_available = true                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Trigger: Buscar na Lista de Espera     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Obter Dados da Vaga:                   │
│  - Data: 08/11/2025                     │
│  - Hora: 14h00                          │
│  - Dia da Semana: Sexta                 │
│  - Período: Tarde                       │
│  - Fisioterapeuta: Dr. Silva            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Buscar Pacientes Compatíveis:          │
│  WHERE:                                 │
│  - status = "waiting"                   │
│  - preferências incluem Sexta           │
│  - preferências incluem Tarde           │
│  ORDER BY:                              │
│  - priority DESC                        │
│  - created_at ASC                       │
│  LIMIT 1                                │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
    [Encontrou]         [Não Encontrou]
        │                   │
        ↓                   ↓
┌───────────────┐   ┌───────────────────┐
│  Notificar    │   │  Vaga fica livre  │
│  Paciente     │   │  na agenda        │
└───────────────┘   └───────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Enviar Notificação WhatsApp            │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  🎉 VAGA DISPONÍVEL!                    │
│                                         │
│  Olá, João!                             │
│                                         │
│  Temos uma vaga disponível:             │
│  📅 Sexta, 08/11/2025                   │
│  🕐 14h00                                │
│  👨‍⚕️ Dr. Silva                           │
│  📍 Clínica Activity                    │
│                                         │
│  Você tem 2 HORAS para confirmar.       │
│                                         │
│  Responda:                              │
│  ✅ SIM - Aceitar vaga                  │
│  ❌ NÃO - Recusar (continua na lista)   │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Marcar no BD:                          │
│  - notified_at = agora                  │
│  - notification_expires_at = +2h        │
│  - status = "notified"                  │
└─────────────────────────────────────────┘
```

**Critérios de Compatibilidade:**
- Dia da semana
- Período (manhã/tarde/noite)
- Fisioterapeuta (opcional)

---

## ✅ Fluxo 4: Paciente Aceita Vaga

```
┌─────────────────────────────────────────┐
│  Paciente responde: "SIM"               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Webhook recebe resposta                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Validar Prazo (< 2 horas)              │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
    [Dentro do Prazo]   [Expirou]
        │                   │
        ↓                   ↓
┌───────────────┐   ┌───────────────────┐
│  Confirmar    │   │  Informar que     │
│  Agendamento  │   │  vaga já foi      │
└───────────────┘   │  preenchida       │
        ↓           └───────────────────┘
┌─────────────────────────────────────────┐
│  Criar Sessão no BD:                    │
│  - patient_id = João                    │
│  - date = 08/11/2025                    │
│  - time = 14h00                         │
│  - status = "scheduled"                 │
│  - source = "waitlist"                  │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Atualizar Lista de Espera:             │
│  - status = "scheduled"                 │
│  - scheduled_at = agora                 │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Enviar Confirmação                     │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  ✅ VAGA CONFIRMADA!                    │
│                                         │
│  Sua sessão foi agendada:               │
│  📅 Sexta, 08/11/2025                   │
│  🕐 14h00                                │
│  👨‍⚕️ Dr. Silva                           │
│  📍 Rua das Flores, 123                 │
│                                         │
│  Você receberá um lembrete 24h antes.   │
│                                         │
│  Nos vemos em breve! 💪                 │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Notificar Recepção (Dashboard)         │
│  "João Silva aceitou vaga de Sex 14h"   │
└─────────────────────────────────────────┘
```

---

## ❌ Fluxo 5: Paciente Recusa Vaga

```
┌─────────────────────────────────────────┐
│  Paciente responde: "NÃO"               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Webhook recebe resposta                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Atualizar Lista de Espera:             │
│  - status = "waiting" (volta para fila) │
│  - declined_slots += 1                  │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Enviar Confirmação                     │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  ✅ OK, ENTENDIDO                       │
│                                         │
│  Você continua na lista de espera.      │
│                                         │
│  Será notificado quando surgir          │
│  outra vaga compatível.                 │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Buscar Próximo Paciente Compatível     │
└─────────────────────────────────────────┘
        ↓
        ┌─────────┴─────────┐
        │                   │
    [Encontrou]         [Não Encontrou]
        │                   │
        ↓                   ↓
┌───────────────┐   ┌───────────────────┐
│  Notificar    │   │  Vaga fica livre  │
│  Próximo      │   │  na agenda        │
└───────────────┘   └───────────────────┘
```

**Limite de Recusas:**
- Após 3 recusas → Prioridade reduzida
- Após 5 recusas → Removido da lista

---

## ⏰ Fluxo 6: Timeout (Sem Resposta)

```
┌─────────────────────────────────────────┐
│  CRON JOB - A cada 15 minutos           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Buscar Notificações Expiradas          │
│  (notified_at + 2h < agora)             │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
    [Nenhuma]          [Encontrou]
        │                   │
        ↓                   ↓
    [FIM]           ┌───────────────┐
                    │  Para cada    │
                    │  notificação  │
                    └───────────────┘
                            ↓
┌─────────────────────────────────────────┐
│  Atualizar Status:                      │
│  - status = "waiting" (volta para fila) │
│  - timeout_count += 1                   │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Enviar Mensagem de Timeout             │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  ⏰ PRAZO EXPIRADO                       │
│                                         │
│  A vaga oferecida foi preenchida        │
│  por outro paciente.                    │
│                                         │
│  Você continua na lista de espera       │
│  e será notificado novamente.           │
│                                         │
│  Clínica Activity Fisioterapia          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  Buscar Próximo Paciente Compatível     │
└─────────────────────────────────────────┘
```

**Limite de Timeouts:**
- Após 2 timeouts → Prioridade reduzida
- Após 3 timeouts → Removido da lista

---

## 📊 Dashboard de Métricas

```
┌─────────────────────────────────────────┐
│  DASHBOARD - LISTA DE ESPERA            │
├─────────────────────────────────────────┤
│                                         │
│  Esta Semana:                           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Pacientes na Lista: 8          │   │
│  │  Vagas Oferecidas: 12           │   │
│  │  Vagas Aceitas: 9 (75%)         │   │
│  │  Vagas Recusadas: 2 (17%)       │   │
│  │  Timeouts: 1 (8%)               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Tempo Médio de Espera: 4 dias          │
│  Taxa de Aproveitamento: 75%            │
│                                         │
│  Receita Adicional: R$ 1.350            │
│  (9 sessões × R$ 150)                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  GRÁFICO: Vagas por Dia         │   │
│  │                                 │   │
│  │  5│     ■                       │   │
│  │  4│     ■ ■                     │   │
│  │  3│   ■ ■ ■                     │   │
│  │  2│ ■ ■ ■ ■ ■                   │   │
│  │  1│ ■ ■ ■ ■ ■ ■ ■               │   │
│  │  0└─────────────────            │   │
│  │    S T Q Q S S D                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Ver Relatório Completo]               │
└─────────────────────────────────────────┘
```

**KPIs:**
- Taxa de aproveitamento (meta: > 70%)
- Tempo médio de espera (meta: < 7 dias)
- Taxa de aceitação (meta: > 60%)
- Receita adicional

---

## 🔧 Tecnologias Utilizadas

**Backend:**
- Inngest (Cron jobs, timeouts)
- Evolution API (WhatsApp)
- Supabase (Banco de dados)
- Webhooks

**Integrações:**
- Agenda
- Confirmações WhatsApp

---

## 📊 Estrutura do Banco de Dados

```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  phone VARCHAR(20),
  preferences JSONB,
  priority VARCHAR(20), -- urgent, high, normal
  notes TEXT,
  status VARCHAR(20), -- waiting, notified, scheduled
  notified_at TIMESTAMP,
  notification_expires_at TIMESTAMP,
  declined_slots INT DEFAULT 0,
  timeout_count INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Exemplo de preferences JSONB:
{
  "days": ["monday", "tuesday", "thursday", "friday"],
  "periods": ["morning", "afternoon"]
}
```

---

## 🎯 Benefícios

**Para a Clínica:**
- +15-20% de receita
- Aproveitamento de 70-80% dos cancelamentos
- Redução de horários ociosos

**Para o Paciente:**
- Acesso mais rápido ao tratamento
- Notificação automática
- Processo simples e rápido

---

## 📊 Impacto Financeiro

**Exemplo (100 sessões/semana):**

- Cancelamentos: 10/semana (10%)
- Taxa de aproveitamento: 75%
- Sessões recuperadas: 7,5/semana
- Valor médio: R$ 150
- **Receita adicional: R$ 1.125/semana**
- **R$ 4.500/mês**
- **R$ 54.000/ano**

---

## ✅ Checklist de Implementação

- [ ] Criar tabela waitlist
- [ ] Formulário de adição
- [ ] Sistema de priorização
- [ ] Busca de compatibilidade
- [ ] Notificações WhatsApp
- [ ] Timeout automático
- [ ] Dashboard de métricas
- [ ] Relatórios
- [ ] Testes completos

---

**Tempo de Implementação:** 2-3 semanas  
**Prioridade:** 🟡 ALTA  
**ROI:** ⭐⭐⭐⭐⭐ (R$ 54k/ano)
