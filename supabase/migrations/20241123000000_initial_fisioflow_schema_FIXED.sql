-- ============================================================================
-- FISIOFLOW PRO - SCHEMA COMPLETO (VERSÃO CORRIGIDA)
-- ============================================================================
-- Esta versão trata erros de tipos/enums já existentes
-- Execute este arquivo se encontrar erros de "already exists"
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================================
-- TIPOS E ENUMS (com tratamento de duplicatas)
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

-- Continuar com o resto da migration original...
-- (Copie o restante do arquivo 20241123000000_initial_fisioflow_schema.sql a partir da linha 97)

