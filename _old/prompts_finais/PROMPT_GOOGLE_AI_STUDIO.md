# 🤖 PROMPT PARA GOOGLE AI STUDIO (BUILD) - Sistema FisioFlow

**Plataforma:** Google AI Studio com recurso "Build"  
**Objetivo:** Gerar um sistema completo de gestão para clínicas de fisioterapia

---

## 📋 INSTRUÇÃO PRINCIPAL

Crie um sistema web completo de gestão para clínicas de fisioterapia chamado **FisioFlow**. Este será o sistema mais avançado do mercado brasileiro para gestão clínica, administrativa e financeira de clínicas de fisioterapia.

---

## 🎯 ESPECIFICAÇÕES TÉCNICAS OBRIGATÓRIAS

### Stack Tecnológico
- Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Deploy: Vercel
- Email: Resend API
- Jobs: Upstash QStash
- Monitoramento: Sentry

### Arquitetura
- PWA (Progressive Web App) responsiva
- Row Level Security (RLS) no Supabase
- Autenticação JWT via Supabase Auth
- API RESTful via PostgREST (Supabase)

---

## 🎨 DESIGN SYSTEM (TEMA DARK MODE)

### Cores
```css
--primary: #5034FF;        /* Azul vibrante */
--success: #00CA72;        /* Verde */
--warning: #F59E0B;        /* Amarelo/Laranja */
--danger: #EF4444;         /* Vermelho */
--background: #0F172A;     /* Azul escuro */
--surface: #1E293B;        /* Azul médio */
--text-primary: #F1F5F9;   /* Branco suave */
--text-secondary: #94A3B8; /* Cinza azulado */
```

### Tipografia
- Fonte: Inter ou Geist
- Hierarquia clara com títulos grandes
- Espaçamento generoso (8px base grid)

### Componentes
- Cards com sombras suaves e bordas arredondadas
- Botões vibrantes com estados hover/active/disabled
- Inputs com labels flutuantes
- Modais centralizados com backdrop
- Toast notifications para feedback

### Layout
- Sidebar fixa à esquerda com navegação principal
- Header com busca global, notificações e perfil
- Conteúdo principal responsivo (mobile-first)
- Inspiração: Monday.com + Vedius

---

## 👥 PERFIS DE USUÁRIO E PERMISSÕES

### Perfis
1. **Admin**: Acesso total
2. **Fisioterapeuta**: Pacientes, agenda, prontuários, evolução
3. **Recepcionista**: Agendamentos e cadastro de pacientes
4. **Paciente**: Acesso via app móvel (separado)

### Autenticação
- Login com email e senha (Supabase Auth)
- Recuperação de senha por email
- 2FA opcional
- RLS baseado em `org_id` e `role`

---

## 📚 MÓDULOS E FUNCIONALIDADES

### MÓDULO 1: GESTÃO DE PACIENTES

#### Cadastro
**Campos Obrigatórios:**
- Nome completo
- CPF (com validação de formato)
- Data de nascimento
- Telefone/WhatsApp
- Email

**Campos Opcionais:**
- Endereço completo
- Profissão
- Contato de emergência
- Foto do paciente
- Observações gerais

**Funcionalidades:**
- Link de pré-cadastro para paciente preencher antes da consulta
- Auto-complete ao buscar paciente
- Validação de CPF único por organização

#### Prontuário Eletrônico (PEP)

**Dashboard 360° do Paciente:**
- Informações pessoais
- Lista de cirurgias com tempo decorrido
- Objetivos com countdown e barra de progresso
- Patologias ativas e tratadas
- Alertas (testes obrigatórios, reavaliações)
- Próximos agendamentos

**Anamnese:**
- Queixa principal (QP)
- História da doença atual (HDA)
- História médica pregressa
- Medicamentos em uso
- Alergias
- Cirurgias anteriores
- Atividade física

**Exame Físico:**
- Inspeção
- Palpação
- Testes especiais
- Amplitude de movimento (ADM)
- Força muscular
- Postura

**Anexos:**
- Upload de arquivos (PDF, JPG, PNG, DOCX)
- Visualização inline de imagens e PDFs
- Organização por data

**Linha do Tempo:**
- Visualização cronológica de todas as avaliações e evoluções
- Filtros por tipo (avaliação, evolução, exame)

#### Evolução da Sessão (SOAP)

**Estrutura SOAP:**
- **(S) Subjetivo:** Relato do paciente, queixas desde última sessão
- **(O) Objetivo:** Observações e medições do fisioterapeuta
- **(A) Avaliação:** Interpretação clínica do estado atual
- **(P) Plano:** Condutas e intervenções realizadas (estruturado)

**Funcionalidades:**
- Auto-save a cada 30-60 segundos
- Replicar conduta de sessões anteriores
- Biblioteca de procedimentos/condutas pré-definidos
- Registro de EVA (Escala Visual Analógica) antes e depois
- Histórico de evoluções com busca e filtros

#### Mapa de Dor Corporal Interativo

**Características:**
- SVG do corpo humano anatomicamente realista (frente e costas)
- Clique para adicionar pontos de dor
- Modal para registrar intensidade (0-10) e anotações
- Sistema de cores por intensidade:
  - 0-2: Verde (#22c55e)
  - 3-5: Amarelo (#f59e0b)
  - 6-8: Laranja (#f97316)
  - 9-10: Vermelho (#ef4444)
- Histórico de mapas com comparação visual
- Timeline de evolução da dor
- Exportação para PDF

#### Objetivos e Metas

**Cadastro de Objetivos:**
- Título e descrição
- Data alvo
- Categoria (ex: Retorno ao esporte, Redução de dor)
- Métricas de progresso (valor atual vs valor alvo)
- Prioridade (Baixa, Média, Alta, Crítica)

**Visualização:**
- Cards com barra de progresso
- Countdown visual ("Faltam X dias")
- Badge de prioridade
- Histórico de atualizações

---

### MÓDULO 2: AGENDAMENTO E CALENDÁRIO

#### Visualização da Agenda

**Interface:**
- Calendário estilo Google Calendar/Outlook
- Visualizações: Dia, Semana, Mês
- Filtros: Por profissional, por sala, por status
- Cores por status:
  - Agendado: Azul
  - Confirmado: Verde
  - Realizado: Cinza
  - Cancelado: Vermelho
  - Faltou: Laranja

**Funcionalidades:**
- Clique em horário livre para criar agendamento
- Drag-and-drop para remarcações
- Visualização de múltiplos profissionais simultaneamente
- Bloqueio de horários (férias, indisponibilidade)

#### Gestão de Agendamentos

**Criar Agendamento:**
- Auto-complete ao digitar nome do paciente
- Atalho para cadastro rápido se paciente não existir
- Seleção de fisioterapeuta
- Duração configurável (padrão 60 min)
- Campo de observações
- Tipo de atendimento (Avaliação, Retorno, Reavaliação)

**Editar/Cancelar:**
- Modal de edição com todos os campos
- Histórico de alterações
- Motivo do cancelamento (opcional)
- Notificação automática ao paciente

**Configurações:**
- Horários de funcionamento por dia da semana
- Horários específicos por fisioterapeuta
- Duração padrão das sessões
- Intervalo entre sessões

#### Lista de Espera

**Funcionalidades:**
- Adicionar paciente à lista com prioridade (Urgente, Alta, Normal)
- Horário/período desejado
- Notificação automática quando vaga disponível
- Timeout de confirmação (ex: 2 horas)
- Dashboard com métricas (taxa de aproveitamento)

---

### MÓDULO 3: FINANCEIRO

#### Gestão de Pagamentos

**Contas a Receber:**
- Registro de pagamentos de pacientes
- Formas de pagamento: PIX, Cartão, Dinheiro, Transferência
- Parcelamento (até 6x sem juros)
- Status: Pendente, Pago, Vencido
- Lembretes de vencimento

**Contas a Pagar:**
- Registro de despesas da clínica
- Categorização (Aluguel, Salários, Materiais, etc.)
- Recorrência (mensal, anual)
- Anexo de comprovantes

#### Controle de Pacotes

**Pacotes de Sessões:**
- Criar pacote (ex: 10 sessões por R$ 1700)
- Desconto para pagamento à vista (ex: R$ 1600)
- Controle de consumo (debita 1 sessão por atendimento)
- Saldo de sessões restantes visível no perfil do paciente
- Validade do pacote (opcional)

**Sessões Avulsas:**
- Valor diferenciado (ex: R$ 180)
- Registro direto no agendamento

#### Faturamento e Relatórios

**Notas Fiscais/Recibos:**
- Geração em PDF com layout personalizável
- Logo e dados da clínica
- Dados do paciente e serviço prestado
- Integração com NFS-e (opcional)

**Relatórios:**
- Fluxo de Caixa (entradas vs saídas)
- DRE (Demonstrativo de Resultados)
- Inadimplência (lista de pendências)
- Comissão de Fisioterapeutas (se aplicável)
- Gráficos interativos (Recharts)

---

### MÓDULO 4: MARKETING E COMUNICAÇÃO

#### Automação de Comunicação

**Lembretes de Agendamento:**
- Envio automático via WhatsApp/SMS/Email
- Antecedência configurável (ex: 24 horas)
- Template personalizável
- Confirmação/Cancelamento direto na mensagem (webhook)
- Log de envios e respostas

**Mensagens de Aniversário:**
- Envio automático no dia do aniversário
- Template personalizável
- Cupom de desconto opcional

#### Gestão de Relacionamento

**Pacientes Inativos:**
- Lista de pacientes sem agendamento há X dias (configurável)
- Campanhas de reengajamento
- Disparo em massa via WhatsApp/Email
- Tracking de conversão

**Pesquisas de Satisfação:**
- NPS (Net Promoter Score) automatizado
- Envio após X sessões ou ao final do tratamento
- Dashboard com resultados
- Comentários e sugestões

**Origem do Paciente:**
- Campo no cadastro (Indicação, Instagram, Google, etc.)
- Relatório de eficácia dos canais de marketing
- ROI por canal

---

### MÓDULO 5: BIBLIOTECA DE CONTEÚDO

#### Biblioteca de Exercícios

**Cadastro de Exercícios:**
- Nome
- Descrição detalhada
- Vídeo demonstrativo (upload ou URL do YouTube)
- Imagens ilustrativas
- Categoria (Fortalecimento, Alongamento, Mobilidade, Propriocepção)
- Nível de dificuldade (1-5)
- Equipamentos necessários
- Indicações e contraindicações
- Variações

**Funcionalidades:**
- Busca e filtros
- Favoritos
- Fisioterapeutas podem adicionar novos exercícios

#### Prescrição de Treinos

**Criar Programa:**
- Selecionar exercícios da biblioteca
- Definir séries, repetições, carga
- Frequência semanal
- Observações específicas
- Progressão automática (opcional)

**Visualização:**
- Lista de exercícios com vídeos
- Checklist de execução
- Disponível no app do paciente

#### Biblioteca de Materiais Clínicos

**Materiais Disponíveis:**
- Fichas de avaliação (Ortopédica, Neurológica, Coluna)
- Escalas validadas (Oswestry, Lysholm, EVA, Borg, Barthel, MIF, Ashworth)
- Formulários de anamnese
- Mapas de dor
- Follow-up estruturado

**Organização:**
- Por especialidade (Ortopedia, Gerontologia, Esportiva)
- Busca e filtros
- Favoritos
- Download em PDF
- Contador de downloads

---

### MÓDULO 6: RELATÓRIOS E ANALYTICS

#### Dashboard Executivo

**KPIs Principais:**
- Número de pacientes ativos
- Taxa de ocupação da agenda
- Receita mensal
- Taxa de no-show
- NPS médio
- Sessões realizadas (hoje, semana, mês)

**Gráficos:**
- Evolução de receita (linha)
- Pacientes ativos vs inativos (pizza)
- Sessões por fisioterapeuta (barras)
- Origem dos pacientes (pizza)

#### Relatórios Clínicos

**Tipos:**
- Relatório de evolução do paciente
- Relatório de alta
- Laudo para convênio
- Atestado médico
- Comparativo temporal (antes vs depois)

**Funcionalidades:**
- Geração em PDF
- Template personalizável
- Logo e timbre da clínica
- Assinatura digital

#### Relatórios Operacionais

**Métricas:**
- Taxa de aderência ao tratamento
- Tempo médio de tratamento por patologia
- Exercícios mais prescritos
- Regiões corporais mais tratadas
- Performance por fisioterapeuta

---

## 🗄️ MODELAGEM DO BANCO DE DADOS

### Tabelas Principais

```sql
-- Organizações (Clínicas)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usuários
CREATE TYPE user_role AS ENUM ('admin', 'physiotherapist', 'receptionist', 'patient');

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    phone TEXT
);

-- Pacientes
CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cpf TEXT,
    birth_date DATE,
    address TEXT,
    emergency_contact TEXT,
    occupation TEXT,
    status TEXT DEFAULT 'active'
);

-- Agendamentos
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

-- Evoluções (SOAP)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    physiotherapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan JSONB,
    pain_level_before INT,
    pain_level_after INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mapas de Dor
CREATE TABLE body_pain_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pacotes Financeiros
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_sessions INT NOT NULL,
    used_sessions INT NOT NULL DEFAULT 0,
    total_value NUMERIC(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercícios
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    category TEXT,
    difficulty INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materiais Clínicos
CREATE TABLE clinical_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    specialty TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Segurança (RLS)

**Políticas Obrigatórias:**
- Usuários só veem dados da própria organização (`org_id`)
- Pacientes só veem seus próprios dados
- Fisioterapeutas veem pacientes da organização
- Admins veem tudo da organização

---

## 🔐 SEGURANÇA E CONFORMIDADE LGPD

### Requisitos Obrigatórios

1. **Consentimento Explícito:**
   - Checkbox no cadastro do paciente
   - Versão do termo de consentimento
   - Data de aceite

2. **Portabilidade:**
   - Endpoint para export de dados do paciente em JSON/ZIP
   - Incluir prontuário, evoluções, anexos

3. **Direito ao Esquecimento:**
   - Endpoint para anonimização de dados
   - Manter registros financeiros (obrigação legal)

4. **Minimização:**
   - Mascarar CPF na UI (mostrar só últimos 3 dígitos)
   - Admin vê CPF completo

5. **Criptografia:**
   - TLS em trânsito (HTTPS)
   - pgcrypto para campos sensíveis em repouso

6. **Auditoria:**
   - Tabela `audit_logs` para operações sensíveis
   - Registrar: visualização de prontuário, export, download

7. **Backups:**
   - Supabase Pro (backups automáticos)
   - Teste de restore trimestral

---

## 📱 REQUISITOS NÃO FUNCIONAIS

### Performance
- Carregamento inicial < 2 segundos
- Atualizações em tempo real < 500ms
- PWA Score > 90 (Lighthouse)

### Segurança
- HTTPS everywhere
- RLS no Supabase
- Input validation
- CORS configurado
- Rate limiting

### Compatibilidade
- iOS: Safari 14+ (iPhone 11+)
- iPadOS: Safari 14+ (iPad 10+)
- Windows: Chrome 90+, Edge 90+
- PWA: Installable em todos

### Disponibilidade
- Uptime > 99.9%

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Fase 1:** Autenticação + Design System + CRUD básico
2. **Fase 2:** Cadastro de Pacientes + Prontuário básico
3. **Fase 3:** Agendamento e Calendário
4. **Fase 4:** Evolução da Sessão (SOAP)
5. **Fase 5:** Mapa de Dor
6. **Fase 6:** Financeiro (Pacotes e Pagamentos)
7. **Fase 7:** Marketing e Comunicação
8. **Fase 8:** Biblioteca de Conteúdo
9. **Fase 9:** Relatórios e Analytics

---

## ✅ CRITÉRIOS DE SUCESSO

- Sistema funcional com todos os módulos principais
- Interface moderna, responsiva e intuitiva
- Segurança LGPD implementada
- Performance dentro dos requisitos
- Código limpo, organizado e documentado
- Testes básicos implementados

---

**IMPORTANTE:** Gere o código completo e funcional, priorizando qualidade e boas práticas. O sistema deve estar pronto para deploy imediato no Vercel após configuração das variáveis de ambiente.
