# 🤖 PROMPTS PARA CURSOR IDE - Sistema FisioFlow

**Plataforma:** Cursor IDE (Modo Planejamento)  
**Objetivo:** Implementar sistema completo de gestão para clínicas de fisioterapia

---

## 📋 INSTRUÇÕES GERAIS

Estes prompts foram criados para serem executados no **Cursor IDE usando o Modo Planejamento** (Cmd/Ctrl + Shift + P → "Plan"). Cada prompt é independente e deve ser executado em sequência.

**Ordem de Execução:**
1. Setup Inicial e Autenticação
2. Design System e Layout
3. Gestão de Pacientes
4. Prontuário e Evolução SOAP
5. Mapa de Dor Corporal
6. Agendamento e Calendário
7. Lista de Espera
8. Financeiro
9. Marketing e Comunicação
10. Biblioteca de Conteúdo
11. Relatórios e Analytics

---

## PROMPT 01: SETUP INICIAL E AUTENTICAÇÃO

```
Crie um projeto Next.js 14+ com TypeScript e configure a estrutura inicial para um sistema de gestão de clínicas de fisioterapia chamado FisioFlow.

STACK OBRIGATÓRIO:
- Next.js 14+ com App Router
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL + Auth + Storage)

ESTRUTURA DE PASTAS:
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── recuperar-senha/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── api/
├── components/
│   ├── ui/ (shadcn)
│   ├── layout/
│   └── shared/
├── lib/
│   ├── supabase/
│   └── utils/
├── hooks/
└── types/

AUTENTICAÇÃO:
1. Configure Supabase Auth com email/senha
2. Crie tipos TypeScript para perfis de usuário:
   - admin
   - physiotherapist
   - receptionist
   - patient

3. Implemente:
   - Tela de login (/login)
   - Tela de recuperação de senha
   - Middleware de autenticação
   - Layout do dashboard com sidebar

BANCO DE DADOS (Supabase):
Execute este SQL no Supabase:

```sql
-- Enum para roles
CREATE TYPE user_role AS ENUM ('admin', 'physiotherapist', 'receptionist', 'patient');

-- Tabela de organizações
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de usuários (estende auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_policy ON users
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
```

VARIÁVEIS DE AMBIENTE (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

CRITÉRIOS DE SUCESSO:
- Projeto Next.js rodando
- Login funcional com Supabase
- Middleware protegendo rotas do dashboard
- Layout do dashboard com sidebar
- Tipos TypeScript para User e Role
```

---

## PROMPT 02: DESIGN SYSTEM E LAYOUT

```
Implemente o Design System completo do FisioFlow com tema dark mode profissional.

PALETA DE CORES (Tailwind Config):
```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#5034FF',
        success: '#00CA72',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#0F172A',
        surface: '#1E293B',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
      },
    },
  },
}
```

TIPOGRAFIA:
- Fonte: Inter ou Geist
- Hierarquia: h1 (36px), h2 (30px), h3 (24px), h4 (20px), body (16px), small (14px)
- Espaçamento: 8px base grid

COMPONENTES shadcn/ui A INSTALAR:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add tabs
```

LAYOUT DO DASHBOARD:
Crie o layout principal em `app/(dashboard)/layout.tsx`:

COMPONENTES:
1. **Sidebar** (components/layout/Sidebar.tsx):
   - Logo no topo
   - Navegação principal:
     - Dashboard
     - Pacientes
     - Agenda
     - Financeiro
     - Biblioteca
     - Relatórios
   - Perfil do usuário no rodapé
   - Responsivo (collapse em mobile)

2. **Header** (components/layout/Header.tsx):
   - Busca global
   - Ícone de notificações
   - Avatar do usuário com dropdown

3. **PageContainer** (components/layout/PageContainer.tsx):
   - Container padrão para páginas
   - Breadcrumbs
   - Título da página
   - Ações (botões no canto superior direito)

CRITÉRIOS DE SUCESSO:
- Tema dark mode aplicado
- Sidebar funcional e responsiva
- Header com busca e notificações
- Todos os componentes shadcn instalados
- Navegação entre páginas funcionando
```

---

## PROMPT 03: GESTÃO DE PACIENTES

```
Implemente o módulo completo de Gestão de Pacientes com CRUD e busca.

BANCO DE DADOS:
Execute no Supabase:

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cpf TEXT,
    birth_date DATE,
    address TEXT,
    emergency_contact TEXT,
    occupation TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY patients_policy ON patients
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
```

FUNCIONALIDADES:

1. **Lista de Pacientes** (app/(dashboard)/pacientes/page.tsx):
   - Tabela com colunas: Foto, Nome, CPF, Telefone, Idade, Status, Ações
   - Busca por nome/CPF/telefone
   - Filtro por status (Ativo, Inativo, Alta)
   - Paginação
   - Botão "Novo Paciente"

2. **Formulário de Cadastro** (components/patients/PatientForm.tsx):
   - Modal ou página separada
   - Campos obrigatórios:
     - Nome completo
     - CPF (com validação e máscara)
     - Data de nascimento
     - Telefone/WhatsApp (com máscara)
     - Email
   - Campos opcionais:
     - Endereço
     - Profissão
     - Contato de emergência
     - Foto (upload para Supabase Storage)
     - Observações
   - Validação com Zod
   - Feedback de sucesso/erro

3. **Visualização de Paciente** (app/(dashboard)/pacientes/[id]/page.tsx):
   - Dashboard 360° do paciente:
     - Informações pessoais
     - Próximos agendamentos
     - Última evolução
     - Objetivos
     - Botões de ação: Editar, Agendar, Nova Evolução

4. **Services** (lib/services/patientService.ts):
   - getPatients(orgId, filters, pagination)
   - getPatientById(id)
   - createPatient(data)
   - updatePatient(id, data)
   - deletePatient(id)
   - searchPatients(query)

CRITÉRIOS DE SUCESSO:
- CRUD completo funcionando
- Busca e filtros operacionais
- Upload de foto funcionando
- Validação de CPF
- Máscaras nos inputs (CPF, telefone)
- Feedback visual (toasts)
```

---

## PROMPT 04: PRONTUÁRIO E EVOLUÇÃO SOAP

```
Implemente o Prontuário Eletrônico do Paciente (PEP) com registro de evoluções no modelo SOAP.

BANCO DE DADOS:
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    physiotherapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan JSONB,
    pain_level_before INT CHECK (pain_level_before BETWEEN 0 AND 10),
    pain_level_after INT CHECK (pain_level_after BETWEEN 0 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY sessions_policy ON sessions
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
```

FUNCIONALIDADES:

1. **Prontuário do Paciente** (app/(dashboard)/pacientes/[id]/prontuario/page.tsx):
   - Abas:
     - Anamnese
     - Exame Físico
     - Evoluções
     - Anexos
   - Timeline cronológica de todas as evoluções
   - Botão "Nova Evolução"

2. **Formulário de Evolução SOAP** (components/sessions/SessionEvolutionForm.tsx):
   - Layout em 4 colunas:
     - Col 1 (30%): Formulário SOAP
     - Col 2 (25%): Histórico de sessões
     - Col 3 (25%): Testes e evolução
     - Col 4 (20%): Resumo do paciente
   
   - **Coluna 1 - Formulário SOAP:**
     - (S) Subjetivo: Textarea
     - (O) Objetivo: Textarea
     - (A) Avaliação: Textarea
     - (P) Plano: Editor estruturado com categorias:
       - Terapia Manual
       - Eletroterapia
       - Exercícios
       - Orientações
     - EVA antes e depois (slider 0-10)
     - Auto-save a cada 30s
     - Botão "Replicar Conduta Anterior"

   - **Coluna 2 - Histórico:**
     - Últimas 10 sessões (cards colapsáveis)
     - Botão "Replicar" em cada sessão
     - Cirurgias com tempo decorrido
     - Tempo total de tratamento

   - **Coluna 3 - Testes:**
     - Alertas de testes obrigatórios
     - Patologias ativas/tratadas
     - Gráficos de evolução (Recharts)

   - **Coluna 4 - Resumo:**
     - Info básica do paciente
     - Objetivos com countdown
     - Métricas rápidas

3. **Replicação de Conduta:**
   - Modal listando sessões anteriores
   - Preview da conduta
   - Seleção de campos para replicar
   - Confirmação

4. **Services** (lib/services/sessionService.ts):
   - getSessionsByPatientId(patientId)
   - getSessionById(id)
   - createSession(data)
   - updateSession(id, data)
   - replicateSession(sessionId)
   - autoSaveSession(data)

CRITÉRIOS DE SUCESSO:
- Formulário SOAP completo
- Auto-save funcionando
- Replicação de conduta operacional
- Timeline de evoluções
- Gráficos de evolução (EVA)
```

---

## PROMPT 05: MAPA DE DOR CORPORAL

```
Implemente o Mapa de Dor Corporal Interativo com SVG anatomicamente realista.

BANCO DE DADOS:
```sql
CREATE TABLE body_pain_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE body_pain_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY body_pain_maps_policy ON body_pain_maps
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
```

FUNCIONALIDADES:

1. **Componente Principal** (components/body-map/BodyPainMap.tsx):
   - SVG do corpo humano (frente e costas)
   - Toggle para alternar entre vistas
   - Zoom e pan (react-zoom-pan-pinch)
   - Clique para adicionar ponto de dor
   - Pontos coloridos por intensidade:
     - Verde (#22c55e): 0-2
     - Amarelo (#f59e0b): 3-5
     - Laranja (#f97316): 6-8
     - Vermelho (#ef4444): 9-10

2. **Modal de Ponto de Dor** (components/body-map/PainPointModal.tsx):
   - Slider de intensidade (0-10)
   - Campo de anotações
   - Botão salvar/excluir

3. **Timeline de Evolução** (components/body-map/PainTimeline.tsx):
   - Lista de mapas anteriores
   - Comparação lado a lado
   - Gráfico de evolução da dor média

4. **Exportação PDF:**
   - Gerar PDF com mapa de dor atual
   - Incluir anotações e intensidades
   - Logo e dados da clínica

5. **Services** (lib/services/bodyMapService.ts):
   - getBodyMapsByPatientId(patientId)
   - getBodyMapBySessionId(sessionId)
   - saveBodyMap(sessionId, points)
   - compareBodyMaps(mapId1, mapId2)
   - exportToPDF(mapId)

CRITÉRIOS DE SUCESSO:
- SVG interativo funcionando
- Pontos de dor salvos no banco
- Cores por intensidade corretas
- Timeline de evolução
- Comparação entre mapas
- Export para PDF
```

---

## PROMPT 06: AGENDAMENTO E CALENDÁRIO

```
Implemente o módulo de Agendamento com calendário visual estilo Google Calendar.

BANCO DE DADOS:
```sql
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show');

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    physiotherapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(physiotherapist_id, start_time)
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointments_policy ON appointments
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
```

FUNCIONALIDADES:

1. **Calendário Visual** (app/(dashboard)/agenda/page.tsx):
   - Use @fullcalendar/react ou react-big-calendar
   - Visualizações: Dia, Semana, Mês
   - Cores por status:
     - Agendado: Azul (#5034FF)
     - Confirmado: Verde (#00CA72)
     - Realizado: Cinza (#64748B)
     - Cancelado: Vermelho (#EF4444)
     - Faltou: Laranja (#F59E0B)
   - Clique em horário livre para criar agendamento
   - Drag-and-drop para remarcações
   - Filtro por fisioterapeuta

2. **Modal de Agendamento** (components/appointments/AppointmentModal.tsx):
   - Auto-complete de paciente
   - Seleção de fisioterapeuta
   - Data e horário (DatePicker + TimePicker)
   - Duração (padrão 60 min)
   - Observações
   - Botões: Salvar, Cancelar, Excluir

3. **Detalhes do Agendamento** (components/appointments/AppointmentDetailModal.tsx):
   - Informações do paciente
   - Fisioterapeuta responsável
   - Data/horário
   - Status
   - Botões de ação:
     - Confirmar
     - Iniciar Atendimento (abre evolução SOAP)
     - Remarcar
     - Cancelar
     - Registrar Falta

4. **Configurações de Horário** (app/(dashboard)/configuracoes/horarios/page.tsx):
   - Horários de funcionamento por dia da semana
   - Horários específicos por fisioterapeuta
   - Duração padrão das sessões
   - Bloqueio de horários (férias, feriados)

5. **Services** (lib/services/appointmentService.ts):
   - getAppointments(orgId, filters)
   - getAppointmentById(id)
   - createAppointment(data)
   - updateAppointment(id, data)
   - cancelAppointment(id, reason)
   - checkAvailability(physiotherapistId, startTime)

CRITÉRIOS DE SUCESSO:
- Calendário visual funcionando
- CRUD de agendamentos completo
- Drag-and-drop operacional
- Validação de conflitos de horário
- Filtros por fisioterapeuta
- Cores por status corretas
```

---

## PROMPT 07: LISTA DE ESPERA

```
Implemente o módulo de Lista de Espera com notificações automáticas.

BANCO DE DADOS:
```sql
CREATE TYPE waitlist_priority AS ENUM ('normal', 'high', 'urgent');
CREATE TYPE waitlist_status AS ENUM ('waiting', 'notified', 'confirmed', 'expired');

CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    physiotherapist_id UUID REFERENCES users(id),
    desired_date DATE,
    desired_time TIME,
    priority waitlist_priority NOT NULL DEFAULT 'normal',
    status waitlist_status NOT NULL DEFAULT 'waiting',
    notes TEXT,
    notified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY waitlist_policy ON waitlist
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
```

FUNCIONALIDADES:

1. **Lista de Espera** (app/(dashboard)/lista-espera/page.tsx):
   - Tabela com colunas:
     - Paciente
     - Fisioterapeuta desejado
     - Data/Horário desejado
     - Prioridade (badge colorido)
     - Status
     - Tempo na fila
     - Ações
   - Filtros: Por status, prioridade, fisioterapeuta
   - Ordenação por prioridade e data de criação

2. **Adicionar à Lista** (components/waitlist/AddToWaitlistModal.tsx):
   - Seleção de paciente
   - Fisioterapeuta desejado (opcional)
   - Data/horário desejado (opcional)
   - Prioridade (Normal, Alta, Urgente)
   - Observações

3. **Notificação Automática:**
   - Quando um agendamento é cancelado:
     - Buscar próximo da fila com critérios compatíveis
     - Enviar notificação via WhatsApp/SMS
     - Atualizar status para "notified"
     - Definir timeout de 2 horas para confirmação
   - Se não confirmar em 2h:
     - Status vira "expired"
     - Notificar próximo da fila

4. **Dashboard de Métricas** (components/waitlist/WaitlistMetrics.tsx):
   - Total na fila
   - Taxa de aproveitamento (confirmados / notificados)
   - Tempo médio de espera
   - Gráfico de evolução

5. **Services** (lib/services/waitlistService.ts):
   - addToWaitlist(data)
   - getWaitlist(orgId, filters)
   - notifyNext(canceledAppointmentId)
   - confirmWaitlist(waitlistId, appointmentData)
   - expireWaitlist(waitlistId)
   - getMetrics(orgId)

6. **Edge Function** (supabase/functions/waitlist-notifier/index.ts):
   - Trigger quando appointment é cancelado
   - Busca próximo compatível na fila
   - Envia notificação via WhatsApp Business API
   - Agenda timeout para expiração

CRITÉRIOS DE SUCESSO:
- Lista de espera funcional
- Priorização correta
- Notificações automáticas
- Timeout de confirmação
- Dashboard de métricas
```

---

## PROMPT 08: FINANCEIRO

```
Implemente o módulo Financeiro completo com controle de pacotes e pagamentos.

BANCO DE DADOS:
```sql
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_sessions INT NOT NULL,
    used_sessions INT NOT NULL DEFAULT 0,
    total_value NUMERIC(10, 2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    installments INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'income' or 'expense'
    category TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT,
    description TEXT,
    patient_id UUID REFERENCES users(id),
    package_id UUID REFERENCES packages(id),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY packages_policy ON packages
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY transactions_policy ON transactions
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
```

FUNCIONALIDADES:

1. **Dashboard Financeiro** (app/(dashboard)/financeiro/page.tsx):
   - Cards de resumo:
     - Receita do mês
     - Despesas do mês
     - Lucro líquido
     - Inadimplência
   - Gráficos (Recharts):
     - Evolução de receita (linha)
     - Receita vs Despesa (barras)
     - Receita por forma de pagamento (pizza)

2. **Pacotes** (app/(dashboard)/financeiro/pacotes/page.tsx):
   - Tabela de pacotes:
     - Paciente
     - Total de sessões
     - Sessões usadas
     - Saldo
     - Valor total
     - Status de pagamento
     - Ações
   - Botão "Novo Pacote"
   - Filtros: Por paciente, status

3. **Formulário de Pacote** (components/financial/PackageForm.tsx):
   - Seleção de paciente
   - Número de sessões (ex: 10)
   - Valor total (ex: R$ 1700)
   - Desconto à vista (ex: R$ 1600 para PIX/Dinheiro)
   - Parcelamento (até 6x sem juros)
   - Forma de pagamento
   - Observações

4. **Consumo de Sessão:**
   - Ao marcar appointment como "completed":
     - Verificar se paciente tem pacote ativo
     - Debitar 1 sessão do saldo
     - Atualizar `used_sessions`
   - Exibir saldo no perfil do paciente

5. **Transações** (app/(dashboard)/financeiro/transacoes/page.tsx):
   - Tabela de transações:
     - Data
     - Tipo (Receita/Despesa)
     - Categoria
     - Descrição
     - Valor
     - Forma de pagamento
     - Ações
   - Filtros: Por tipo, categoria, período
   - Botão "Nova Transação"

6. **Formulário de Transação** (components/financial/TransactionForm.tsx):
   - Tipo (Receita/Despesa)
   - Categoria (dropdown)
   - Valor
   - Forma de pagamento
   - Data
   - Descrição
   - Paciente (se aplicável)

7. **Relatórios Financeiros:**
   - Fluxo de Caixa (app/(dashboard)/financeiro/fluxo-caixa/page.tsx)
   - DRE (app/(dashboard)/financeiro/dre/page.tsx)
   - Inadimplência (app/(dashboard)/financeiro/inadimplencia/page.tsx)
   - Exportação para Excel/PDF

8. **Services** (lib/services/financialService.ts):
   - createPackage(data)
   - getPackages(orgId, filters)
   - consumeSession(packageId)
   - createTransaction(data)
   - getTransactions(orgId, filters)
   - getFinancialSummary(orgId, period)
   - generateCashFlowReport(orgId, period)

CRITÉRIOS DE SUCESSO:
- CRUD de pacotes funcionando
- Consumo automático de sessões
- CRUD de transações
- Dashboard com gráficos
- Relatórios exportáveis
- Cálculos corretos
```

---

## PROMPT 09: MARKETING E COMUNICAÇÃO

```
Implemente o módulo de Marketing e Comunicação com automação de lembretes e campanhas.

BANCO DE DADOS:
```sql
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'reminder', 'birthday', 'campaign', 'nps'
    channel TEXT NOT NULL, -- 'whatsapp', 'sms', 'email'
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
    response TEXT
);

ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY communication_logs_policy ON communication_logs
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
```

FUNCIONALIDADES:

1. **Lembretes de Agendamento:**
   - Cron job (Upstash QStash) roda a cada hora
   - Busca appointments nas próximas 24h que ainda não foram lembrados
   - Envia mensagem via WhatsApp/SMS/Email:
     ```
     Olá [Nome], lembrete da sua sessão de fisioterapia amanhã às [Horário] com [Fisioterapeuta].
     
     Para confirmar, responda SIM.
     Para cancelar, responda NÃO.
     ```
   - Registra em communication_logs
   - Webhook para processar respostas

2. **Mensagens de Aniversário:**
   - Cron job diário às 9h
   - Busca pacientes aniversariantes do dia
   - Envia mensagem personalizada:
     ```
     🎉 Feliz Aniversário, [Nome]!
     
     A equipe [Clínica] deseja um dia especial!
     ```
   - Registra em communication_logs

3. **Campanhas para Inativos** (app/(dashboard)/marketing/campanhas/page.tsx):
   - Lista de pacientes inativos (sem agendamento há X dias)
   - Filtros: Dias de inatividade, última patologia
   - Seleção múltipla
   - Template de mensagem editável
   - Botão "Enviar Campanha"
   - Tracking de conversão (quantos agendaram após campanha)

4. **Pesquisas de Satisfação (NPS):**
   - Trigger após X sessões ou ao marcar como "discharged"
   - Envia link de pesquisa NPS
   - Formulário com:
     - Nota 0-10
     - Comentários
     - Sugestões
   - Dashboard com resultados

5. **Origem do Paciente:**
   - Campo no cadastro de paciente
   - Opções: Indicação, Instagram, Google, Facebook, Outros
   - Relatório de eficácia por canal

6. **Services** (lib/services/communicationService.ts):
   - sendReminder(appointmentId)
   - sendBirthdayMessage(patientId)
   - sendCampaign(patientIds, message)
   - sendNPS(patientId)
   - getCommunicationLogs(orgId, filters)
   - getChannelEffectiveness(orgId)

7. **Edge Functions:**
   - supabase/functions/send-reminders/index.ts
   - supabase/functions/send-birthdays/index.ts
   - supabase/functions/whatsapp-webhook/index.ts

8. **Integrações:**
   - Resend para emails
   - WhatsApp Business API para WhatsApp
   - Provedor de SMS (Twilio, etc.)

CRITÉRIOS DE SUCESSO:
- Lembretes automáticos funcionando
- Mensagens de aniversário enviadas
- Campanhas para inativos operacionais
- NPS implementado
- Logs de comunicação salvos
- Webhook processando respostas
```

---

## PROMPT 10: BIBLIOTECA DE CONTEÚDO

```
Implemente a Biblioteca de Conteúdo com exercícios, prescrições e materiais clínicos.

BANCO DE DADOS:
```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    category TEXT,
    difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
    equipment TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    exercises JSONB NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clinical_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    specialty TEXT,
    file_url TEXT,
    download_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY exercises_policy ON exercises
FOR ALL
USING (org_id IS NULL OR org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY prescriptions_policy ON prescriptions
FOR ALL
USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY clinical_materials_policy ON clinical_materials
FOR ALL
USING (true); -- Público para todos
```

FUNCIONALIDADES:

1. **Biblioteca de Exercícios** (app/(dashboard)/biblioteca/exercicios/page.tsx):
   - Grid de cards com:
     - Thumbnail do vídeo
     - Nome do exercício
     - Categoria
     - Nível de dificuldade (estrelas)
     - Botão "Ver Detalhes"
   - Busca por nome
   - Filtros: Categoria, Dificuldade
   - Botão "Novo Exercício"

2. **Detalhes do Exercício** (components/library/ExerciseDetailModal.tsx):
   - Vídeo demonstrativo (YouTube embed ou upload)
   - Descrição completa
   - Categoria
   - Nível de dificuldade
   - Equipamentos necessários
   - Indicações e contraindicações
   - Variações
   - Botões: Editar, Excluir, Adicionar à Prescrição

3. **Formulário de Exercício** (components/library/ExerciseForm.tsx):
   - Nome
   - Descrição (textarea)
   - URL do vídeo (YouTube) ou upload
   - Categoria (select)
   - Dificuldade (1-5)
   - Equipamentos
   - Indicações
   - Contraindicações

4. **Prescrição de Treino** (app/(dashboard)/pacientes/[id]/prescricao/page.tsx):
   - Busca de exercícios
   - Adicionar exercício à prescrição
   - Para cada exercício:
     - Séries
     - Repetições
     - Carga
     - Observações
   - Frequência semanal
   - Data de início/fim
   - Botão "Salvar Prescrição"

5. **Visualização de Prescrição** (components/library/PrescriptionView.tsx):
   - Lista de exercícios com vídeos
   - Checklist de execução
   - Disponível no app do paciente
   - Exportação para PDF

6. **Biblioteca de Materiais Clínicos** (app/(dashboard)/biblioteca/materiais/page.tsx):
   - Organização por especialidade:
     - Ortopedia
     - Gerontologia
     - Esportiva
   - Materiais:
     - Fichas de avaliação
     - Escalas validadas (Oswestry, Lysholm, EVA, Borg, Barthel, MIF, Ashworth)
     - Formulários de anamnese
     - Mapas de dor
   - Busca e filtros
   - Favoritos
   - Download em PDF
   - Contador de downloads

7. **Services** (lib/services/libraryService.ts):
   - getExercises(orgId, filters)
   - createExercise(data)
   - updateExercise(id, data)
   - deleteExercise(id)
   - createPrescription(patientId, exercises)
   - getPrescriptionsByPatientId(patientId)
   - getClinicalMaterials(filters)
   - downloadMaterial(materialId)

CRITÉRIOS DE SUCESSO:
- CRUD de exercícios funcionando
- Upload de vídeos operacional
- Prescrição de treinos funcional
- Biblioteca de materiais acessível
- Download de PDFs funcionando
- Contador de downloads
```

---

## PROMPT 11: RELATÓRIOS E ANALYTICS

```
Implemente o módulo de Relatórios e Analytics com dashboards interativos.

FUNCIONALIDADES:

1. **Dashboard Executivo** (app/(dashboard)/page.tsx):
   - Cards de KPIs:
     - Pacientes ativos
     - Taxa de ocupação da agenda
     - Receita do mês
     - Taxa de no-show
     - NPS médio
   - Gráficos (Recharts):
     - Evolução de receita (linha)
     - Pacientes ativos vs inativos (pizza)
     - Sessões por fisioterapeuta (barras)
     - Origem dos pacientes (pizza)
   - Filtros: Período (hoje, semana, mês, ano)

2. **Relatórios Clínicos:**
   
   a) **Relatório de Evolução do Paciente** (components/reports/PatientEvolutionReport.tsx):
   - Dados do paciente
   - Resumo do tratamento
   - Evoluções (SOAP)
   - Mapas de dor com comparação
   - Gráficos de evolução (EVA)
   - Objetivos alcançados
   - Exportação para PDF

   b) **Relatório de Alta** (components/reports/DischargeReport.tsx):
   - Dados do paciente
   - Resumo do tratamento
   - Resultados alcançados
   - Recomendações
   - Assinatura digital
   - Exportação para PDF

   c) **Laudo para Convênio** (components/reports/InsuranceReport.tsx):
   - Template específico para convênios
   - CID-10
   - Procedimentos realizados
   - Número de sessões
   - Exportação para PDF

3. **Relatórios Operacionais:**
   
   a) **Taxa de Aderência** (app/(dashboard)/relatorios/aderencia/page.tsx):
   - % de pacientes que completam o tratamento
   - Tempo médio de tratamento por patologia
   - Gráfico de evolução

   b) **Exercícios Mais Prescritos** (app/(dashboard)/relatorios/exercicios/page.tsx):
   - Ranking de exercícios
   - Por categoria
   - Por fisioterapeuta
   - Gráfico de barras

   c) **Regiões Corporais Mais Tratadas** (app/(dashboard)/relatorios/regioes/page.tsx):
   - Mapa de calor do corpo
   - Ranking de regiões
   - Por período

4. **Exportação de Relatórios:**
   - PDF: Usar Playwright ou react-pdf
   - Excel: Usar xlsx
   - Botão "Exportar" em cada relatório

5. **Services** (lib/services/reportsService.ts):
   - getExecutiveDashboard(orgId, period)
   - generatePatientEvolutionReport(patientId)
   - generateDischargeReport(patientId)
   - generateInsuranceReport(patientId)
   - getAdherenceMetrics(orgId, period)
   - getTopExercises(orgId, period)
   - getBodyRegionsStats(orgId, period)
   - exportToPDF(reportData)
   - exportToExcel(reportData)

6. **API Routes para PDF:**
   - app/api/reports/patient-evolution/[id]/route.ts
   - app/api/reports/discharge/[id]/route.ts
   - app/api/reports/insurance/[id]/route.ts

CRITÉRIOS DE SUCESSO:
- Dashboard executivo com KPIs
- Gráficos interativos (Recharts)
- Relatórios clínicos gerados
- Exportação para PDF funcionando
- Exportação para Excel funcionando
- Filtros por período operacionais
```

---

## 📝 OBSERVAÇÕES FINAIS

### Ordem de Execução Recomendada:
1. PROMPT 01: Setup e Autenticação
2. PROMPT 02: Design System
3. PROMPT 03: Gestão de Pacientes
4. PROMPT 04: Prontuário e SOAP
5. PROMPT 05: Mapa de Dor
6. PROMPT 06: Agendamento
7. PROMPT 07: Lista de Espera
8. PROMPT 08: Financeiro
9. PROMPT 09: Marketing
10. PROMPT 10: Biblioteca
11. PROMPT 11: Relatórios

### Dicas para Uso no Cursor:
- Execute um prompt por vez
- Revise o plano gerado antes de aprovar
- Teste cada módulo antes de avançar
- Faça commits incrementais
- Use o modo "Chat" para ajustes finos

### Variáveis de Ambiente Necessárias:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
QSTASH_URL=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
SENTRY_DSN=
WHATSAPP_API_TOKEN=
```

### Próximos Passos Após Implementação:
1. Testes E2E com Playwright
2. Otimização de performance
3. Documentação de uso
4. Deploy no Vercel
5. Desenvolvimento do App Móvel (React Native/Flutter)

---

**BOA SORTE COM A IMPLEMENTAÇÃO! 🚀**
```
