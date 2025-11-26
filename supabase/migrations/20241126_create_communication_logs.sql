-- Migration: Criar tabela de logs de comunicação
-- Data: 2024-11-26

CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('reminder', 'birthday', 'campaign', 'nps')),
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    response TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_communication_logs_org_id ON communication_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_patient_id ON communication_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_type ON communication_logs(type);
CREATE INDEX IF NOT EXISTS idx_communication_logs_sent_at ON communication_logs(sent_at);

-- RLS
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- Política RLS
CREATE POLICY communication_logs_policy ON communication_logs
FOR ALL
USING (
    org_id IN (
        SELECT org_id FROM profiles WHERE id = auth.uid()
    )
);

