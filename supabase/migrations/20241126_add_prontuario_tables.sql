-- Migration: Adicionar tabelas para Prontuário Eletrônico Completo
-- Data: 2024-11-26

-- Tabela de Anamnese
CREATE TABLE IF NOT EXISTS anamnesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    past_medical_history TEXT,
    medications TEXT,
    allergies TEXT,
    family_history TEXT,
    social_history TEXT,
    functional_assessment TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Exame Físico
CREATE TABLE IF NOT EXISTS physical_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    general_appearance TEXT,
    vital_signs JSONB,
    inspection TEXT,
    palpation TEXT,
    range_of_motion JSONB,
    muscle_strength JSONB,
    special_tests JSONB,
    neurological_exam TEXT,
    functional_tests TEXT,
    observations TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Anexos do Prontuário
CREATE TABLE IF NOT EXISTS medical_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    description TEXT,
    category TEXT, -- 'exam', 'image', 'document', 'other'
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_anamnesis_patient_id ON anamnesis(patient_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_org_id ON anamnesis(org_id);
CREATE INDEX IF NOT EXISTS idx_physical_exams_patient_id ON physical_exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_physical_exams_session_id ON physical_exams(session_id);
CREATE INDEX IF NOT EXISTS idx_medical_attachments_patient_id ON medical_attachments(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_attachments_session_id ON medical_attachments(session_id);

-- RLS
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para anamnesis
CREATE POLICY anamnesis_policy ON anamnesis
FOR ALL
USING (
    org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid()
    )
);

-- Políticas RLS para physical_exams
CREATE POLICY physical_exams_policy ON physical_exams
FOR ALL
USING (
    org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid()
    )
);

-- Políticas RLS para medical_attachments
CREATE POLICY medical_attachments_policy ON medical_attachments
FOR ALL
USING (
    org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid()
    )
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_anamnesis_updated_at BEFORE UPDATE ON anamnesis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_physical_exams_updated_at BEFORE UPDATE ON physical_exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

