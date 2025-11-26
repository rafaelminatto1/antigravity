-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO DO SCHEMA
-- ============================================================================
-- Execute este script para verificar se todas as tabelas foram criadas
-- ============================================================================

-- Verificar tabelas criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'organizations',
    'profiles',
    'patients',
    'appointments',
    'sessions',
    'body_pain_maps',
    'waitlist',
    'session_templates',
    'treatment_procedures',
    'notifications',
    'analytics_events',
    'notebooks',
    'knowledge_documents',
    'knowledge_search_history'
  )
ORDER BY table_name;

-- Verificar tipos/enums criados
SELECT 
  typname as type_name,
  typtype as type_type
FROM pg_type
WHERE typname IN ('user_role', 'appointment_status', 'waitlist_priority', 'waitlist_status')
ORDER BY typname;

-- Verificar extensões habilitadas
SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pg_trgm', 'pgcrypto', 'btree_gist')
ORDER BY extname;

-- Verificar funções criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at',
    'generate_patient_search_vector',
    'generate_procedure_search_vector',
    'check_appointment_conflict',
    'notify_waitlist',
    'update_notebooks_updated_at'
  )
ORDER BY routine_name;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Contar índices criados
SELECT 
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'organizations',
    'profiles',
    'patients',
    'appointments',
    'sessions',
    'body_pain_maps',
    'waitlist',
    'session_templates',
    'treatment_procedures',
    'notifications',
    'analytics_events',
    'notebooks',
    'knowledge_documents',
    'knowledge_search_history'
  )
GROUP BY tablename
ORDER BY tablename;

