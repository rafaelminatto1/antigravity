# 🤖 PROMPT PARA MANUS - Sistema FisioFlow

**Objetivo:** Criar um sistema completo de gestão para clínicas de fisioterapia do zero, usando o Manus como plataforma de desenvolvimento.

---

## 📋 CONTEXTO E OBJETIVO

Preciso que você desenvolva um sistema web completo de gestão para clínicas de fisioterapia chamado **FisioFlow**. Este sistema será o mais avançado do mercado brasileiro, combinando gestão clínica, administrativa, financeira e de relacionamento com pacientes.

O sistema deve ser desenvolvido como uma **aplicação web (PWA)** moderna, responsiva e com foco em experiência do usuário de alto nível.

---

## 🎯 STACK TECNOLÓGICO OBRIGATÓRIO

- **Frontend:** Next.js 14+ com App Router, TypeScript, Tailwind CSS e shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Deploy:** Vercel
- **Comunicação:** Resend (emails) e integração com WhatsApp Business API
- **Jobs Agendados:** Upstash QStash
- **Monitoramento:** Sentry

---

## 🎨 DESIGN E UX/UI

### Paleta de Cores (Tema Dark Mode Profissional)

- **Primary:** `#5034FF` (Azul vibrante)
- **Success:** `#00CA72` (Verde)
- **Warning:** `#F59E0B` (Amarelo/Laranja)
- **Danger:** `#EF4444` (Vermelho)
- **Background:** `#0F172A` (Azul escuro quase preto)
- **Surface:** `#1E293B` (Azul escuro médio)
- **Text Primary:** `#F1F5F9` (Branco suave)
- **Text Secondary:** `#94A3B8` (Cinza azulado)

### Tipografia

- **Fonte:** Inter ou Geist
- **Hierarquia:** Títulos grandes e claros, textos legíveis, espaçamento generoso

### Layout

- **Inspiração:** Monday.com (cores vibrantes, cards modernos) + Vedius (design clean e organizado)
- **Sidebar:** Navegação principal fixa à esquerda
- **Header:** Busca global, notificações e perfil do usuário
- **Cards:** Sombras suaves, bordas arredondadas, hover effects
- **Botões:** Vibrantes, com estados claros (hover, active, disabled)

---

## 📚 MÓDULOS E FUNCIONALIDADES ESSENCIAIS

### 1. AUTENTICAÇÃO E GESTÃO DE USUÁRIOS

**Perfis de Usuário:**
- **Admin:** Acesso total ao sistema
- **Fisioterapeuta:** Acesso a pacientes, agenda, prontuários e evolução
- **Recepcionista:** Acesso a agendamentos e cadastro de pacientes
- **Paciente:** Acesso limitado via app (a ser desenvolvido separadamente)

**Funcionalidades:**
- Login com email e senha (Supabase Auth)
- Recuperação de senha
- Autenticação de 2 fatores (2FA) opcional
- Gestão de permissões baseada em roles (RBAC)
- Row Level Security (RLS) no Supabase para garantir que cada organização veja apenas seus dados

---

### 2. GESTÃO DE PACIENTES E PRONTUÁRIO ELETRÔNICO

**Cadastro de Pacientes:**
- Campos obrigatórios: Nome, CPF (com validação), Data de Nascimento, Telefone/WhatsApp, Email
- Campos opcionais: Endereço, Profissão, Contato de Emergência, Foto, Observações
- Link de pré-cadastro que o paciente pode preencher antes da primeira consulta

**Prontuário Eletrônico (PEP):**
- Dashboard 360° do paciente com resumo de: informações pessoais, cirurgias, objetivos, patologias ativas, alertas e próximos agendamentos
- Registro de Anamnese completa (Queixa Principal, História da Doença Atual, Medicamentos, Alergias, Cirurgias)
- Exame Físico (Inspeção, Palpação, Testes Especiais, Amplitude de Movimento, Força Muscular)
- Upload de anexos (laudos, exames em PDF/JPG/PNG)
- Linha do tempo cronológica de todas as avaliações e evoluções

**Evolução da Sessão (SOAP):**
- Modelo SOAP: Subjetivo (S), Objetivo (O), Avaliação (A), Plano (P)
- Campo "Plano" estruturado com biblioteca de procedimentos/condutas
- Auto-save a cada 30-60 segundos
- Funcionalidade de "Replicar Conduta Anterior" para agilizar preenchimento

**Mapa de Dor Corporal Interativo:**
- SVG do corpo humano (frente e costas) anatomicamente realista
- Clique para adicionar pontos de dor
- Escala de dor 0-10 (EVA) com cores: Verde (0-2), Amarelo (3-5), Laranja (6-8), Vermelho (9-10)
- Histórico e comparação visual da evolução da dor entre sessões
- Exportação para PDF

**Objetivos e Metas:**
- Cadastro de objetivos do paciente (ex: "Correr 5km sem dor")
- Data alvo, barra de progresso e countdown visual
- Dashboard com visualização dos objetivos

---

### 3. AGENDAMENTO E CALENDÁRIO

**Visualização da Agenda:**
- Calendário visual interativo (dia, semana, mês) similar ao Google Calendar
- Visualização por profissional ou por sala
- Cores por status: Agendado, Confirmado, Realizado, Cancelado, Faltou

**Gestão de Agendamentos:**
- Criar agendamento clicando em horários livres
- Suporte a múltiplos pacientes no mesmo horário
- Duração configurável (padrão 60 min)
- Drag-and-drop para remarcações
- Auto-complete ao digitar nome do paciente
- Atalho para cadastro rápido se paciente não existir

**Lista de Espera:**
- Gerenciar pacientes que desejam horários ocupados
- Notificação automática (WhatsApp/SMS) quando um horário é cancelado
- Priorização (Urgente, Alta, Normal)

---

### 4. FINANCEIRO

**Gestão de Pagamentos:**
- Registro de contas a receber e a pagar
- Categorização de transações
- Múltiplas formas de pagamento (PIX, Cartão, Dinheiro, Transferência)

**Controle de Pacotes:**
- Criar pacotes de sessões (ex: 10 sessões por R$ 1700)
- Controle de consumo (debita uma sessão a cada atendimento)
- Exibir saldo de sessões restantes no perfil do paciente
- Sessões avulsas com valor diferenciado (ex: R$ 180)
- Planos de parcelamento

**Faturamento:**
- Geração de notas fiscais/recibos em PDF (layout personalizável com logo)
- Relatórios: Fluxo de Caixa, DRE, Inadimplência, Comissão de Fisioterapeutas

---

### 5. MARKETING E COMUNICAÇÃO

**Automação:**
- Lembretes de agendamento via WhatsApp/SMS/Email (antecedência configurável, ex: 24h)
- Mensagem permite confirmação ou cancelamento direto (webhook)
- Mensagens de aniversário automáticas

**Relacionamento:**
- Lista de pacientes inativos (sem agendamento há X dias)
- Campanhas de reengajamento
- Pesquisas de satisfação (NPS) automatizadas
- Campo "Origem do Paciente" para análise de canais de marketing

---

### 6. BIBLIOTECA DE CONTEÚDO

**Biblioteca de Exercícios:**
- Categorias: Fortalecimento, Alongamento, Mobilidade, Propriocepção
- Cada exercício: Nome, Descrição, Vídeo, Imagens, Nível de dificuldade, Equipamentos, Variações
- Fisioterapeutas podem adicionar novos exercícios

**Prescrição de Treinos:**
- Criar programas personalizados selecionando exercícios da biblioteca
- Séries, repetições, frequência e observações

**Biblioteca de Materiais Clínicos:**
- Fichas de avaliação, escalas validadas (Oswestry, Lysholm), formulários de anamnese
- Organização por especialidade (Ortopedia, Gerontologia, Esportiva)
- Download em PDF

---

### 7. RELATÓRIOS E ANALYTICS

**Dashboard Executivo:**
- KPIs: Pacientes ativos, Taxa de ocupação, Receita mensal, Taxa de no-show, NPS médio

**Relatórios Clínicos:**
- Relatório de evolução do paciente
- Relatório de alta
- Laudos para convênios
- Exportação em PDF

**Relatórios Operacionais:**
- Taxa de aderência ao tratamento
- Tempo médio de tratamento por patologia
- Exercícios mais prescritos

---

## 🗄️ MODELAGEM DO BANCO DE DADOS

**Tabelas Principais:**

1. **organizations** - Dados da clínica
2. **users** - Usuários do sistema (herda de auth.users)
3. **patients** - Dados específicos de pacientes
4. **appointments** - Agendamentos
5. **sessions** - Evoluções (SOAP)
6. **body_pain_maps** - Mapas de dor
7. **packages** - Pacotes financeiros
8. **exercises** - Biblioteca de exercícios
9. **prescriptions** - Prescrições de treino
10. **clinical_materials** - Materiais clínicos

**Segurança:**
- Row Level Security (RLS) em todas as tabelas
- Políticas RLS baseadas em `org_id` e `role`
- Criptografia de dados sensíveis

---

## 🔐 SEGURANÇA E CONFORMIDADE LGPD

- Consentimento explícito do paciente (checkbox + versão do termo)
- Endpoints para export de dados (portabilidade) e anonimização (direito ao esquecimento)
- Mascaramento de CPF na UI (exibir completo só para admin)
- Criptografia TLS em trânsito e pgcrypto em repouso
- Auditoria completa (tabela audit_logs)
- Backups automáticos e testes de restore trimestrais

---

## 📱 REQUISITOS NÃO FUNCIONAIS

- **Performance:** Carregamento inicial < 2s, atualizações em tempo real < 500ms
- **PWA Score:** > 90 (Lighthouse)
- **Uptime:** > 99.9%
- **Compatibilidade:** Chrome, Firefox, Safari, Edge (versões recentes)
- **Responsividade:** Mobile-first, funcional em tablets e desktops

---

## 🚀 ENTREGÁVEIS ESPERADOS

1. **Aplicação Web Completa** com todos os módulos funcionando
2. **Banco de Dados** configurado no Supabase com RLS
3. **Autenticação** funcionando com perfis e permissões
4. **Design System** implementado (cores, tipografia, componentes)
5. **Documentação** básica de uso do sistema

---

## ✅ CRITÉRIOS DE SUCESSO

- Sistema funcional com todos os módulos principais implementados
- Interface moderna, responsiva e intuitiva
- Segurança LGPD implementada
- Performance dentro dos requisitos
- Código limpo, organizado e documentado

---

**IMPORTANTE:** Este é um projeto complexo. Priorize a implementação dos módulos na seguinte ordem:

1. Autenticação e Gestão de Usuários
2. Cadastro de Pacientes e Prontuário Básico
3. Agendamento e Calendário
4. Evolução da Sessão (SOAP)
5. Mapa de Dor
6. Financeiro (Pacotes e Pagamentos)
7. Marketing e Comunicação
8. Biblioteca de Conteúdo
9. Relatórios e Analytics

Comece pelo MVP (Minimum Viable Product) e vá expandindo as funcionalidades progressivamente.
