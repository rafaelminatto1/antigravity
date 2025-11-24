# Especificação Técnica Detalhada - FisioFlow

**Versão:** 1.0
**Data:** 13 de Novembro de 2025

## 1. Arquitetura da Solução

### 1.1. Stack Tecnológico

- **Frontend (Web App):** Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Frontend (Mobile App):** React Native (Expo) ou Flutter (a ser detalhado no prompt específico)
- **Backend & Banco de Dados:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Hospedagem:** Vercel
- **Filas e Jobs Agendados:** Upstash QStash (para lembretes de WhatsApp/Email)
- **Envio de Email:** Resend
- **Monitoramento de Erros:** Sentry
- **Analytics:** Vercel Analytics

### 1.2. Arquitetura Geral

O sistema será composto por uma aplicação web principal (PWA) para a gestão da clínica (usada por administradores e fisioterapeutas) e um aplicativo móvel nativo para os pacientes. A comunicação com o backend será feita através de uma combinação de Server Actions do Next.js e chamadas diretas à API do Supabase, com a segurança garantida por RLS (Row Level Security) e autenticação JWT.

```mermaid
graph TD
    subgraph "Usuários"
        A[Fisioterapeuta/Admin] --> B{Aplicação Web (PWA)};
        C[Paciente] --> D{App Móvel Nativo (iOS/Android)};
    end

    subgraph "Frontend (Vercel)"
        B -- HTTPS/API --> E[Next.js App];
        D -- HTTPS/API --> E;
    end

    subgraph "Backend (Supabase)"
        E -- SQL/RPC --> F[PostgREST API];
        F -- RLS Policies --> G[Banco de Dados PostgreSQL];
        E -- Auth --> H[Supabase Auth];
        E -- Storage API --> I[Supabase Storage];
        J[Webhook Externo] --> K[Edge Functions];
    end

    subgraph "Serviços Externos"
        K --> L[API WhatsApp Business];
        E -- API --> M[Resend API];
        E -- API --> N[Upstash QStash];
    end
```

---

## 2. Modelagem do Banco de Dados (Schema PostgreSQL)

A seguir, o schema detalhado das principais tabelas do banco de dados. A segurança será implementada via RLS, garantindo que um usuário só possa acessar dados da sua própria organização (`org_id`) e de acordo com seu perfil (`role`).

### 2.1. Tabela `organizations`

Armazena as informações de cada clínica.

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2. Tabela `users`

Herda de `auth.users` do Supabase e contém informações adicionais.

```sql
CREATE TYPE user_role AS ENUM ('admin', 'physiotherapist', 'receptionist', 'patient');

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    phone TEXT
);
```

### 2.3. Tabela `patients`

Dados específicos dos pacientes.

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cpf TEXT,
    birth_date DATE,
    address TEXT,
    emergency_contact TEXT,
    occupation TEXT,
    status TEXT DEFAULT 'active' -- active, inactive, discharged
);
```

### 2.4. Tabela `appointments` (Agendamentos)

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
    UNIQUE(physiotherapist_id, start_time) -- Evita conflito de horário para o mesmo profissional
);
```

### 2.5. Tabela `sessions` (Evoluções)

Registra cada sessão de tratamento.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    physiotherapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    subjective TEXT, -- (S)OAP
    objective TEXT, -- S(O)AP
    assessment TEXT, -- SO(A)P
    plan JSONB, -- SO(A)P - Estruturado
    pain_level_before INT, -- EVA antes
    pain_level_after INT, -- EVA depois
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.6. Tabela `body_pain_maps` (Mapa de Dor)

```sql
CREATE TABLE body_pain_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points JSONB NOT NULL, -- [{ x, y, view: 'front'/'back', intensity: 8, notes: '...' }]
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.7. Tabela `packages` (Pacotes Financeiros)

```sql
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_sessions INT NOT NULL,
    used_sessions INT NOT NULL DEFAULT 0,
    total_value NUMERIC(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'pending', -- pending, paid, overdue
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

```
