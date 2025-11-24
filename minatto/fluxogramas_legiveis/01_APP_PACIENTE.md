# 📱 Fluxograma: App para Pacientes

## 🎯 Visão Geral

O App para Pacientes é um aplicativo mobile nativo (React Native) que permite aos pacientes:
- Visualizar exercícios prescritos
- Assistir vídeos demonstrativos
- Registrar dor
- Conversar com fisioterapeuta
- Acompanhar progresso

---

## 🔐 Fluxo 1: Login e Autenticação

```
┌─────────────────────────────────────────┐
│  1. Paciente abre o app                 │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  2. Sistema verifica se está logado     │
└─────────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │                   │
    [SIM]               [NÃO]
        │                   │
        ↓                   ↓
┌───────────────┐   ┌───────────────────┐
│  Dashboard    │   │  Tela de Login    │
└───────────────┘   └───────────────────┘
                            ↓
                    ┌───────────────────┐
                    │  Inserir Telefone │
                    └───────────────────┘
                            ↓
                    ┌───────────────────┐
                    │  Enviar Código    │
                    │  SMS (6 dígitos)  │
                    └───────────────────┘
                            ↓
                    ┌───────────────────┐
                    │  Inserir Código   │
                    └───────────────────┘
                            ↓
                    ┌───────────────────┐
                    │  Validar Código   │
                    └───────────────────┘
                            ↓
                    ┌───────────────────┐
                    │  Dashboard        │
                    └───────────────────┘
```

**Detalhes Técnicos:**
- Autenticação via Supabase Auth
- Código SMS de 6 dígitos
- Expiração: 10 minutos
- Máximo 3 tentativas

---

## 🏠 Fluxo 2: Dashboard Principal

```
┌─────────────────────────────────────────┐
│         DASHBOARD PRINCIPAL             │
├─────────────────────────────────────────┤
│                                         │
│  👋 Olá, João!                          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📋 Exercícios Pendentes: 5     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📅 Próxima Sessão: Amanhã 14h  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📊 Progresso Semanal: 80%      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  MENU:                                  │
│  [Exercícios] [Sessões] [Dor]          │
│  [Chat] [Progresso] [Perfil]           │
└─────────────────────────────────────────┘
```

**Widgets:**
- Exercícios pendentes do dia
- Próxima sessão agendada
- Progresso semanal
- Alertas e notificações

---

## 💪 Fluxo 3: Exercícios

```
DASHBOARD → Clicar em "Exercícios"
                  ↓
┌─────────────────────────────────────────┐
│      LISTA DE EXERCÍCIOS                │
├─────────────────────────────────────────┤
│                                         │
│  Hoje (5 exercícios)                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✅ Alongamento Lombar          │   │
│  │  3x15 repetições                │   │
│  │  [▶ Ver Vídeo]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ⬜ Fortalecimento Joelho       │   │
│  │  3x10 repetições                │   │
│  │  [▶ Ver Vídeo]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [...]                                  │
└─────────────────────────────────────────┘
                  ↓
        Clicar em "Ver Vídeo"
                  ↓
┌─────────────────────────────────────────┐
│      PLAYER DE VÍDEO                    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [Vídeo do Exercício]       │   │
│  │                                 │   │
│  │      ▶  ⏸  ⏹  🔊               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Alongamento Lombar                     │
│  Duração: 2:30                          │
│                                         │
│  Instruções:                            │
│  1. Deite de costas                     │
│  2. Flexione os joelhos                 │
│  3. Abrace as pernas                    │
│                                         │
│  [✅ Marcar como Concluído]             │
└─────────────────────────────────────────┘
                  ↓
        Marcar como Concluído
                  ↓
┌─────────────────────────────────────────┐
│  ✅ Exercício Concluído!                │
│                                         │
│  Progresso: 1/5 (20%)                   │
│                                         │
│  [Próximo Exercício]  [Voltar]         │
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Lista de exercícios do dia
- Vídeos demonstrativos
- Instruções detalhadas
- Marcar como concluído
- Progresso em tempo real

---

## 📅 Fluxo 4: Próximas Sessões

```
DASHBOARD → Clicar em "Sessões"
                  ↓
┌─────────────────────────────────────────┐
│      PRÓXIMAS SESSÕES                   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📅 Amanhã - 14h00              │   │
│  │  👨‍⚕️ Dr. Silva                   │   │
│  │  📍 Clínica Activity             │   │
│  │  ✅ Confirmado                   │   │
│  │  [Ver Detalhes] [Cancelar]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📅 Sexta - 10h00               │   │
│  │  👨‍⚕️ Dr. Silva                   │   │
│  │  📍 Clínica Activity             │   │
│  │  ⏳ Aguardando Confirmação       │   │
│  │  [Confirmar] [Cancelar]         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  ↓
        Clicar em "Cancelar"
                  ↓
┌─────────────────────────────────────────┐
│  ⚠️ Confirmar Cancelamento?             │
│                                         │
│  Sessão: Sexta, 08/11 às 10h00         │
│                                         │
│  [Não, Voltar]  [Sim, Cancelar]        │
└─────────────────────────────────────────┘
                  ↓
        Confirmar Cancelamento
                  ↓
┌─────────────────────────────────────────┐
│  ✅ Sessão Cancelada                    │
│                                         │
│  Fisioterapeuta foi notificado.         │
│                                         │
│  [OK]                                   │
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Ver próximas sessões
- Confirmar presença
- Cancelar sessão
- Notificação automática ao fisioterapeuta

---

## 🩺 Fluxo 5: Registrar Dor

```
DASHBOARD → Clicar em "Dor"
                  ↓
┌─────────────────────────────────────────┐
│      MAPA DE DOR CORPORAL               │
├─────────────────────────────────────────┤
│                                         │
│  Toque na região do corpo com dor:      │
│                                         │
│       ┌───────┐     ┌───────┐          │
│       │ Frente│     │Costas │          │
│       │       │     │       │          │
│       │   🧍  │     │  🧍   │          │
│       │       │     │       │          │
│       └───────┘     └───────┘          │
│                                         │
│  Legenda:                               │
│  🟢 Leve  🟡 Moderada  🔴 Intensa      │
└─────────────────────────────────────────┘
                  ↓
        Clicar em uma região (ex: Lombar)
                  ↓
┌─────────────────────────────────────────┐
│      REGISTRAR DOR - LOMBAR             │
├─────────────────────────────────────────┤
│                                         │
│  Intensidade da Dor (0-10):             │
│                                         │
│  0 ●━━━━━━━━━━━━━━━━━━━━○ 10          │
│                                         │
│  Tipo de Dor:                           │
│  ○ Aguda/Pontada                        │
│  ● Latejante                            │
│  ○ Queimação                            │
│  ○ Formigamento                         │
│                                         │
│  Observações:                           │
│  ┌─────────────────────────────────┐   │
│  │ Dor piorou após exercício       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancelar]  [Salvar]                   │
└─────────────────────────────────────────┘
                  ↓
        Salvar
                  ↓
┌─────────────────────────────────────────┐
│  ✅ Dor Registrada                      │
│                                         │
│  Fisioterapeuta será notificado.        │
│                                         │
│  [Ver Histórico]  [OK]                  │
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Mapa corporal interativo
- Escala de intensidade 0-10
- Tipos de dor predefinidos
- Observações livres
- Histórico de registros
- Notificação ao fisioterapeuta

---

## 💬 Fluxo 6: Chat com Fisioterapeuta

```
DASHBOARD → Clicar em "Chat"
                  ↓
┌─────────────────────────────────────────┐
│      CONVERSAS                          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  👨‍⚕️ Dr. Silva                   │   │
│  │  "Tudo bem com o joelho?"       │   │
│  │  Hoje às 10:30                  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  ↓
        Clicar em "Dr. Silva"
                  ↓
┌─────────────────────────────────────────┐
│      CHAT - Dr. Silva                   │
├─────────────────────────────────────────┤
│                                         │
│  Dr. Silva - Hoje 10:30                 │
│  Tudo bem com o joelho?                 │
│                                         │
│              Você - Hoje 10:35          │
│              Melhorou bastante!         │
│                                         │
│  Dr. Silva - Hoje 10:36                 │
│  Ótimo! Continue os exercícios.         │
│                                         │
├─────────────────────────────────────────┤
│  [Digitar mensagem...]     [📷] [Enviar]│
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Chat em tempo real
- Enviar texto
- Enviar fotos
- Histórico de conversas
- Notificações push

---

## 📊 Fluxo 7: Progresso

```
DASHBOARD → Clicar em "Progresso"
                  ↓
┌─────────────────────────────────────────┐
│      MEU PROGRESSO                      │
├─────────────────────────────────────────┤
│                                         │
│  Esta Semana:                           │
│  ┌─────────────────────────────────┐   │
│  │  Exercícios: 15/20 (75%)        │   │
│  │  ████████████░░░░░              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Sessões: 2/3 (67%)             │   │
│  │  ████████████░░░░░░░            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Evolução de Dor (Lombar):              │
│  ┌─────────────────────────────────┐   │
│  │  10│                            │   │
│  │   8│  ●                          │   │
│  │   6│     ●                       │   │
│  │   4│        ●                    │   │
│  │   2│           ●                 │   │
│  │   0└─────────────────────        │   │
│  │     S1  S2  S3  S4              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Ver Detalhes]                         │
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Progresso de exercícios
- Frequência de sessões
- Gráfico de evolução de dor
- Estatísticas semanais/mensais

---

## 🔔 Fluxo 8: Notificações Push

```
┌─────────────────────────────────────────┐
│  🔔 Notificação Recebida                │
├─────────────────────────────────────────┤
│                                         │
│  Lembrete de Exercício                  │
│  Você tem 5 exercícios pendentes hoje!  │
│                                         │
│  [Ignorar]  [Ver Exercícios]            │
└─────────────────────────────────────────┘
                  ↓
        Clicar em "Ver Exercícios"
                  ↓
        App abre na Lista de Exercícios
```

**Tipos de Notificações:**
- Lembrete de exercícios (9h, 15h, 19h)
- Lembrete de sessão (24h antes)
- Mensagem do fisioterapeuta
- Solicitação de feedback

---

## 🔧 Tecnologias Utilizadas

**Frontend:**
- React Native
- Expo
- React Navigation
- React Native Video

**Backend:**
- Supabase (Auth, Database, Storage)
- Realtime (Chat)
- Push Notifications (Expo)

**Integrações:**
- WhatsApp (Evolution API)
- IA (Gemini)

---

## 📱 Plataformas

- ✅ iOS (App Store)
- ✅ Android (Google Play)

---

## 🎯 Benefícios

**Para o Paciente:**
- Acesso fácil aos exercícios
- Vídeos demonstrativos
- Acompanhamento de progresso
- Comunicação direta com fisioterapeuta

**Para a Clínica:**
- Maior engajamento do paciente
- Redução de no-shows
- Melhor adesão ao tratamento
- Diferencial competitivo

---

## 📊 Métricas de Sucesso

- Taxa de conclusão de exercícios > 70%
- Engajamento diário > 60%
- Redução de no-shows em 30%
- NPS > 80

---

**Tempo de Implementação:** 12-16 semanas  
**Prioridade:** 🟡 ALTA  
**ROI:** +20% retenção de pacientes
