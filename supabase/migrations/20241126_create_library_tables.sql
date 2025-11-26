-- Migration: Criar tabelas para Biblioteca de Conteúdo
-- Data: 2024-11-26

-- Tabela de Exercícios
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    category TEXT,
    difficulty INT CHECK (difficulty >= 1 AND difficulty <= 5),
    equipment TEXT,
    indications TEXT,
    contraindications TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Prescrições
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    exercises JSONB NOT NULL,
    start_date DATE,
    end_date DATE,
    frequency_per_week INT DEFAULT 3,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Materiais Clínicos
CREATE TABLE IF NOT EXISTS clinical_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    specialty TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    description TEXT,
    download_count INT DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_exercises_org_id ON exercises(org_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_org_id ON prescriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_clinical_materials_category ON clinical_materials(category);
CREATE INDEX IF NOT EXISTS idx_clinical_materials_specialty ON clinical_materials(specialty);

-- RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_materials ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY exercises_policy ON exercises
FOR ALL
USING (
    org_id IS NULL OR org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY prescriptions_policy ON prescriptions
FOR ALL
USING (
    org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY clinical_materials_policy ON clinical_materials
FOR ALL
USING (true); -- Público para todos

-- Triggers
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinical_materials_updated_at BEFORE UPDATE ON clinical_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

