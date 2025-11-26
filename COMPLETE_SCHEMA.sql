-- ============================================================================
-- SCRIPT SQL COMPLETO - FISIOFLOW PRO
-- ============================================================================
-- Execute este script completo no SQL Editor do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/jrxqcpbhwmmmeopiqpad/sql
-- ============================================================================
-- IMPORTANTE: Este script cria TODO o schema do zero
-- Se encontrar erros de "already exists", pode ignorar e continuar
-- ============================================================================

-- ============================================================================
-- PARTE 1: EXTENSÕES E TIPOS
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Criar tipos/enums (com tratamento de duplicatas)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'physiotherapist', 'receptionist', 'patient');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE waitlist_priority AS ENUM ('urgent', 'high', 'normal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE waitlist_status AS ENUM ('waiting', 'notified', 'accepted', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PARTE 2: TABELAS PRINCIPAIS
-- ============================================================================

-- Organizations (Multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cnpj TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'professional', 'clinic')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  org_id UUID,
  role user_role DEFAULT 'patient',
  phone TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar foreign key para org_id
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'profiles' 
      AND constraint_name LIKE '%org_id%'
    ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_org_id_fkey 
    FOREIGN KEY (org_id) REFERENCES organizations(id);
  END IF;
END $$;

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  org_id UUID REFERENCES organizations(id),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  address TEXT,
  emergency_contact JSONB,
  medical_history JSONB DEFAULT '{}',
  search_vector tsvector,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para patients
CREATE INDEX IF NOT EXISTS idx_patients_search_vector ON patients USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_patients_org_id ON patients(org_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  patient_id UUID REFERENCES patients(id),
  therapist_id UUID REFERENCES profiles(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  duration_minutes INT DEFAULT 60,
  confirmed_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_org_id ON appointments(org_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Sessions (Evoluções SOAP)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  physiotherapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan JSONB,
  pain_level_before INT CHECK (pain_level_before >= 0 AND pain_level_before <= 10),
  pain_level_after INT CHECK (pain_level_after >= 0 AND pain_level_after <= 10),
  auto_save_data JSONB,
  ai_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para sessions
CREATE INDEX IF NOT EXISTS idx_sessions_appointment_id ON sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_org_id ON sessions(org_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_physiotherapist_id ON sessions(physiotherapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions(session_date);

-- Body Pain Maps
CREATE TABLE IF NOT EXISTS body_pain_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  points JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para body_pain_maps
CREATE INDEX IF NOT EXISTS idx_body_pain_maps_session_id ON body_pain_maps(session_id);
CREATE INDEX IF NOT EXISTS idx_body_pain_maps_patient_id ON body_pain_maps(patient_id);

-- Waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  desired_date DATE,
  desired_time TIME,
  priority waitlist_priority DEFAULT 'normal',
  status waitlist_status DEFAULT 'waiting',
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_org_id ON waitlist(org_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_patient_id ON waitlist(patient_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON waitlist(priority);
CREATE INDEX IF NOT EXISTS idx_waitlist_expires_at ON waitlist(expires_at);

-- Session Templates
CREATE TABLE IF NOT EXISTS session_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  plan_structure JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para session_templates
CREATE INDEX IF NOT EXISTS idx_session_templates_org_id ON session_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_session_templates_specialty ON session_templates(specialty);
CREATE INDEX IF NOT EXISTS idx_session_templates_is_public ON session_templates(is_public);

-- Treatment Procedures
CREATE TABLE IF NOT EXISTS treatment_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  image_url TEXT,
  difficulty_level INT CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  equipment_needed TEXT[],
  tags TEXT[],
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para treatment_procedures
CREATE INDEX IF NOT EXISTS idx_treatment_procedures_org_id ON treatment_procedures(org_id);
CREATE INDEX IF NOT EXISTS idx_treatment_procedures_category ON treatment_procedures(category);
CREATE INDEX IF NOT EXISTS idx_treatment_procedures_search_vector ON treatment_procedures USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_treatment_procedures_tags ON treatment_procedures USING gin(tags);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_id ON analytics_events(org_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- ============================================================================
-- PARTE 3: NOTEBOOKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notebooks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text default '',
  user_id uuid references profiles(id) on delete cascade,
  tags text[],
  is_favorite boolean default false,
  is_archived boolean default false
);

ALTER TABLE notebooks enable row level security;

DROP POLICY IF EXISTS "Users can view their own notebooks." ON notebooks;
CREATE POLICY "Users can view their own notebooks." ON notebooks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notebooks." ON notebooks;
CREATE POLICY "Users can insert their own notebooks." ON notebooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notebooks." ON notebooks;
CREATE POLICY "Users can update their own notebooks." ON notebooks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notebooks." ON notebooks;
CREATE POLICY "Users can delete their own notebooks." ON notebooks
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_updated_at ON notebooks(updated_at desc);
CREATE INDEX IF NOT EXISTS idx_notebooks_tags ON notebooks USING gin(tags);

CREATE OR REPLACE FUNCTION update_notebooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  return new;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS notebooks_updated_at_trigger ON notebooks;
CREATE TRIGGER notebooks_updated_at_trigger
  BEFORE UPDATE ON notebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_notebooks_updated_at();

-- ============================================================================
-- PARTE 4: KNOWLEDGE BASE
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  storage_path text not null,
  storage_bucket text default 'knowledge-base' not null,
  gemini_file_id text,
  gemini_store_id text not null,
  gemini_import_status text default 'pending' check (gemini_import_status in ('pending', 'processing', 'completed', 'failed')),
  gemini_error text,
  category text,
  tags text[],
  allowed_roles text[] default '{authenticated}',
  uploaded_by uuid references profiles(id) not null,
  constraint valid_file_type check (file_type in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ))
);

ALTER TABLE knowledge_documents enable row level security;

DROP POLICY IF EXISTS "Knowledge documents viewable by authenticated users." ON knowledge_documents;
CREATE POLICY "Knowledge documents viewable by authenticated users." ON knowledge_documents
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert knowledge documents." ON knowledge_documents;
CREATE POLICY "Authenticated users can insert knowledge documents." ON knowledge_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update knowledge documents." ON knowledge_documents;
CREATE POLICY "Authenticated users can update knowledge documents." ON knowledge_documents
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete knowledge documents." ON knowledge_documents;
CREATE POLICY "Authenticated users can delete knowledge documents." ON knowledge_documents
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_category ON knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tags ON knowledge_documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_gemini_store ON knowledge_documents(gemini_store_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON knowledge_documents(gemini_import_status);

CREATE TABLE IF NOT EXISTS knowledge_search_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles(id) not null,
  query text not null,
  results_count integer,
  clicked_document_id uuid references knowledge_documents(id)
);

ALTER TABLE knowledge_search_history enable row level security;

DROP POLICY IF EXISTS "Users can view their own search history." ON knowledge_search_history;
CREATE POLICY "Users can view their own search history." ON knowledge_search_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own search history." ON knowledge_search_history;
CREATE POLICY "Users can insert their own search history." ON knowledge_search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PARTE 5: FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_patient_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.phone, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.cpf, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_procedure_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('portuguese', array_to_string(NEW.tags, ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_therapist_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INT;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE therapist_id = p_therapist_id
    AND status NOT IN ('canceled', 'no_show')
    AND (id != COALESCE(p_exclude_id, '00000000-0000-0000-0000-000000000000'::UUID))
    AND tstzrange(start_time, end_time) && tstzrange(p_start_time, p_end_time);
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_waitlist()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTE 6: TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_session_templates_updated_at ON session_templates;
CREATE TRIGGER update_session_templates_updated_at
  BEFORE UPDATE ON session_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_treatment_procedures_updated_at ON treatment_procedures;
CREATE TRIGGER update_treatment_procedures_updated_at
  BEFORE UPDATE ON treatment_procedures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS generate_patient_search_vector_trigger ON patients;
CREATE TRIGGER generate_patient_search_vector_trigger
  BEFORE INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION generate_patient_search_vector();

DROP TRIGGER IF EXISTS generate_procedure_search_vector_trigger ON treatment_procedures;
CREATE TRIGGER generate_procedure_search_vector_trigger
  BEFORE INSERT OR UPDATE ON treatment_procedures
  FOR EACH ROW
  EXECUTE FUNCTION generate_procedure_search_vector();

DROP TRIGGER IF EXISTS notify_waitlist_on_cancel ON appointments;
CREATE TRIGGER notify_waitlist_on_cancel
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'canceled' AND OLD.status != 'canceled')
  EXECUTE FUNCTION notify_waitlist();

-- ============================================================================
-- PARTE 7: ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_pain_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para organizations
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = organizations.id
    )
  );

DROP POLICY IF EXISTS "Admins can manage organizations" ON organizations;
CREATE POLICY "Admins can manage organizations" ON organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      AND profiles.org_id = organizations.id
    )
  );

-- Políticas RLS para sessions
DROP POLICY IF EXISTS "Users can view sessions in their org" ON sessions;
CREATE POLICY "Users can view sessions in their org" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = sessions.org_id
    )
  );

DROP POLICY IF EXISTS "Physiotherapists can manage sessions" ON sessions;
CREATE POLICY "Physiotherapists can manage sessions" ON sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = sessions.org_id
      AND (profiles.role = 'physiotherapist' OR profiles.role = 'admin')
    )
  );

-- Políticas RLS para body_pain_maps
DROP POLICY IF EXISTS "Users can view pain maps in their org" ON body_pain_maps;
CREATE POLICY "Users can view pain maps in their org" ON body_pain_maps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN profiles p ON p.org_id = s.org_id
      WHERE s.id = body_pain_maps.session_id
      AND p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Physiotherapists can manage pain maps" ON body_pain_maps;
CREATE POLICY "Physiotherapists can manage pain maps" ON body_pain_maps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN profiles p ON p.org_id = s.org_id
      WHERE s.id = body_pain_maps.session_id
      AND p.id = auth.uid()
      AND (p.role = 'physiotherapist' OR p.role = 'admin')
    )
  );

-- Políticas RLS para waitlist
DROP POLICY IF EXISTS "Users can view waitlist in their org" ON waitlist;
CREATE POLICY "Users can view waitlist in their org" ON waitlist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = waitlist.org_id
    )
  );

DROP POLICY IF EXISTS "Users can manage waitlist in their org" ON waitlist;
CREATE POLICY "Users can manage waitlist in their org" ON waitlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = waitlist.org_id
      AND profiles.role IN ('admin', 'physiotherapist', 'receptionist')
    )
  );

-- Políticas RLS para session_templates
DROP POLICY IF EXISTS "Users can view templates in their org or public" ON session_templates;
CREATE POLICY "Users can view templates in their org or public" ON session_templates
  FOR SELECT USING (
    is_public = TRUE OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = session_templates.org_id
    )
  );

DROP POLICY IF EXISTS "Users can manage templates in their org" ON session_templates;
CREATE POLICY "Users can manage templates in their org" ON session_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = session_templates.org_id
      AND profiles.role IN ('admin', 'physiotherapist')
    )
  );

-- Políticas RLS para treatment_procedures
DROP POLICY IF EXISTS "Users can view procedures in their org" ON treatment_procedures;
CREATE POLICY "Users can view procedures in their org" ON treatment_procedures
  FOR SELECT USING (
    org_id IS NULL OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = treatment_procedures.org_id
    )
  );

DROP POLICY IF EXISTS "Users can manage procedures in their org" ON treatment_procedures;
CREATE POLICY "Users can manage procedures in their org" ON treatment_procedures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = treatment_procedures.org_id
      AND profiles.role IN ('admin', 'physiotherapist')
    )
  );

-- Políticas RLS para notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para analytics_events
DROP POLICY IF EXISTS "Users can view analytics in their org" ON analytics_events;
CREATE POLICY "Users can view analytics in their org" ON analytics_events
  FOR SELECT USING (
    org_id IS NULL OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.org_id = analytics_events.org_id
    )
  );

DROP POLICY IF EXISTS "System can insert analytics" ON analytics_events;
CREATE POLICY "System can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE organizations IS 'Organizações (clínicas) - suporte multi-tenant';
COMMENT ON TABLE sessions IS 'Evoluções de sessões com estrutura SOAP completa';
COMMENT ON TABLE body_pain_maps IS 'Mapas de dor corporal interativos';
COMMENT ON TABLE waitlist IS 'Lista de espera para agendamentos';
COMMENT ON TABLE session_templates IS 'Templates reutilizáveis de condutas';
COMMENT ON TABLE treatment_procedures IS 'Biblioteca de procedimentos e exercícios';
COMMENT ON TABLE notifications IS 'Sistema de notificações in-app';
COMMENT ON TABLE analytics_events IS 'Eventos para métricas e analytics';

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
-- Execute este script completo no SQL Editor do Supabase
-- Se aparecer algum erro de "already exists", pode ignorar
-- ============================================================================

