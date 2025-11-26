-- ============================================================================
-- FISIOFLOW PRO - SCHEMA COMPLETO
-- ============================================================================
-- Este arquivo contém o schema completo do sistema FisioFlow Pro
-- Inclui: extensões, tabelas, índices, RLS, functions e triggers
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca fuzzy
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Para criptografia
-- Nota: pgvector será adicionado separadamente se necessário

-- ============================================================================
-- TIPOS E ENUMS
-- ============================================================================

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
-- TABELAS PRINCIPAIS
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

-- Users (estendendo profiles existente)
-- Criar tabela profiles se não existir (sem foreign key inicialmente)
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

-- Adicionar foreign key para org_id após organizations ser criada
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

-- Adicionar campos ao profiles se a tabela já existir (para casos de atualização)
DO $$ 
BEGIN
  -- Adicionar org_id se não existir
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'org_id') THEN
    ALTER TABLE profiles ADD COLUMN org_id UUID REFERENCES organizations(id);
  END IF;
  
  -- Adicionar role se não existir
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'patient';
  END IF;
  
  -- Adicionar phone se não existir
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
  
  -- Adicionar metadata se não existir
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'metadata') THEN
    ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- Patients (criar tabela se não existir)
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

-- Adicionar colunas se a tabela já existir (para casos de atualização)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'org_id') THEN
      ALTER TABLE patients ADD COLUMN org_id UUID REFERENCES organizations(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'user_id') THEN
      ALTER TABLE patients ADD COLUMN user_id UUID REFERENCES profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'cpf') THEN
      ALTER TABLE patients ADD COLUMN cpf TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'birth_date') THEN
      ALTER TABLE patients ADD COLUMN birth_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact') THEN
      ALTER TABLE patients ADD COLUMN emergency_contact JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'medical_history') THEN
      ALTER TABLE patients ADD COLUMN medical_history JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'search_vector') THEN
      ALTER TABLE patients ADD COLUMN search_vector tsvector;
    END IF;
  END IF;
END $$;

-- Índice para busca full-text em patients
CREATE INDEX IF NOT EXISTS idx_patients_search_vector ON patients USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_patients_org_id ON patients(org_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- Appointments (criar tabela se não existir)
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

-- Adicionar colunas se a tabela já existir (para casos de atualização)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'org_id') THEN
      ALTER TABLE appointments ADD COLUMN org_id UUID REFERENCES organizations(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'duration_minutes') THEN
      ALTER TABLE appointments ADD COLUMN duration_minutes INT DEFAULT 60;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'confirmed_at') THEN
      ALTER TABLE appointments ADD COLUMN confirmed_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'reminder_sent') THEN
      ALTER TABLE appointments ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'recurrence_pattern') THEN
      ALTER TABLE appointments ADD COLUMN recurrence_pattern JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'metadata') THEN
      ALTER TABLE appointments ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
  END IF;
END $$;

-- Atualizar status para usar enum (apenas se a tabela existir e a coluna ainda não for do tipo enum)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments')
    AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      AND column_name = 'status' 
      AND data_type != 'USER-DEFINED'
    ) THEN
    ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
    -- Converter valores existentes para o enum
    ALTER TABLE appointments ALTER COLUMN status TYPE appointment_status 
    USING CASE 
      WHEN status = 'scheduled' THEN 'scheduled'::appointment_status
      WHEN status = 'confirmed' THEN 'confirmed'::appointment_status
      WHEN status = 'completed' THEN 'completed'::appointment_status
      WHEN status = 'cancelled' THEN 'canceled'::appointment_status
      WHEN status = 'canceled' THEN 'canceled'::appointment_status
      WHEN status = 'no_show' THEN 'no_show'::appointment_status
      ELSE 'scheduled'::appointment_status
    END;
  END IF;
END $$;

-- Constraint para evitar sobreposição de horários
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- Nota: O índice de sobreposição será criado via constraint exclusiva se necessário
-- Por enquanto, vamos usar uma abordagem mais simples com índice composto

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
  subjective TEXT, -- Campo S do SOAP
  objective TEXT, -- Campo O do SOAP
  assessment TEXT, -- Campo A do SOAP
  plan JSONB, -- Campo P estruturado: {categories: [{name, items: []}]}
  pain_level_before INT CHECK (pain_level_before >= 0 AND pain_level_before <= 10),
  pain_level_after INT CHECK (pain_level_after >= 0 AND pain_level_after <= 10),
  auto_save_data JSONB, -- Para rascunhos
  ai_suggestions JSONB, -- Sugestões de IA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para sessions
CREATE INDEX IF NOT EXISTS idx_sessions_appointment_id ON sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_org_id ON sessions(org_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_physiotherapist_id ON sessions(physiotherapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions(session_date);

-- Body Pain Maps (Mapa de Dor)
CREATE TABLE IF NOT EXISTS body_pain_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  points JSONB NOT NULL, -- [{x, y, view: 'front'|'back', intensity: 0-10, notes}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para body_pain_maps
CREATE INDEX IF NOT EXISTS idx_body_pain_maps_session_id ON body_pain_maps(session_id);
CREATE INDEX IF NOT EXISTS idx_body_pain_maps_patient_id ON body_pain_maps(patient_id);

-- Waitlist (Lista de Espera)
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

-- Session Templates (Templates de Condutas)
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

-- Treatment Procedures (Biblioteca de Procedimentos)
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

-- Notifications (Sistema de Notificações)
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

-- Analytics Events (Métricas e Analytics)
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
-- FUNCTIONS
-- ============================================================================

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function para gerar search_vector em patients
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

-- Function para gerar search_vector em treatment_procedures
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

-- Function para verificar conflito de agendamento
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

-- Function para notificar waitlist
CREATE OR REPLACE FUNCTION notify_waitlist()
RETURNS TRIGGER AS $$
BEGIN
  -- Esta function será chamada quando um agendamento for cancelado
  -- A lógica de notificação será implementada via Edge Function
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para updated_at em organizations
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger para updated_at em sessions
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger para updated_at em session_templates
DROP TRIGGER IF EXISTS update_session_templates_updated_at ON session_templates;
CREATE TRIGGER update_session_templates_updated_at
  BEFORE UPDATE ON session_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger para updated_at em treatment_procedures
DROP TRIGGER IF EXISTS update_treatment_procedures_updated_at ON treatment_procedures;
CREATE TRIGGER update_treatment_procedures_updated_at
  BEFORE UPDATE ON treatment_procedures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger para search_vector em patients
DROP TRIGGER IF EXISTS generate_patient_search_vector_trigger ON patients;
CREATE TRIGGER generate_patient_search_vector_trigger
  BEFORE INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION generate_patient_search_vector();

-- Trigger para search_vector em treatment_procedures
DROP TRIGGER IF EXISTS generate_procedure_search_vector_trigger ON treatment_procedures;
CREATE TRIGGER generate_procedure_search_vector_trigger
  BEFORE INSERT OR UPDATE ON treatment_procedures
  FOR EACH ROW
  EXECUTE FUNCTION generate_procedure_search_vector();

-- Trigger para notificar waitlist quando agendamento é cancelado
DROP TRIGGER IF EXISTS notify_waitlist_on_cancel ON appointments;
CREATE TRIGGER notify_waitlist_on_cancel
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'canceled' AND OLD.status != 'canceled')
  EXECUTE FUNCTION notify_waitlist();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
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
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE organizations IS 'Organizações (clínicas) - suporte multi-tenant';
COMMENT ON TABLE sessions IS 'Evoluções de sessões com estrutura SOAP completa';
COMMENT ON TABLE body_pain_maps IS 'Mapas de dor corporal interativos';
COMMENT ON TABLE waitlist IS 'Lista de espera para agendamentos';
COMMENT ON TABLE session_templates IS 'Templates reutilizáveis de condutas';
COMMENT ON TABLE treatment_procedures IS 'Biblioteca de procedimentos e exercícios';
COMMENT ON TABLE notifications IS 'Sistema de notificações in-app';
COMMENT ON TABLE analytics_events IS 'Eventos para métricas e analytics';

