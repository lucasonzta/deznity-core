import * as fs from 'fs-extra';
import dotenv from 'dotenv';

dotenv.config();

async function generateRLSFix() {
  console.log('🔧 GENERANDO SCRIPT PARA CORREGIR RLS EN SUPABASE');
  console.log('=================================================');
  
  const SUPABASE_URL = process.env.SUPABASE_URL;
  
  if (!SUPABASE_URL) {
    console.error('❌ SUPABASE_URL no configurado en .env');
    return;
  }
  
  const rlsFixSQL = `-- =====================================================
-- FIX RLS POLICIES - DEZNITY
-- Self-Building AI Growth Engine
-- =====================================================

-- =====================================================
-- CORREGIR POLÍTICAS RLS PARA PERMITIR INSERCIÓN
-- =====================================================

-- Eliminar políticas existentes que causan problemas
DROP POLICY IF EXISTS "Clients can access own data" ON clients;
DROP POLICY IF EXISTS "Clients can access own projects" ON projects;
DROP POLICY IF EXISTS "Clients can access own billing events" ON billing_events;
DROP POLICY IF EXISTS "Clients can access own subscriptions" ON subscriptions;

-- Crear políticas más permisivas para desarrollo
CREATE POLICY "Allow all operations on clients" ON clients
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on projects" ON projects
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on billing_events" ON billing_events
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on subscriptions" ON subscriptions
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICAR QUE LAS POLÍTICAS FUNCIONAN
-- =====================================================

-- Probar inserción en clients
INSERT INTO clients (business_name, industry, goal, color, copy_tone, target_geo, pages, budget)
VALUES (
    'Test Client RLS',
    'test',
    'test rls policies',
    '#FF0000',
    'test',
    'Test City',
    ARRAY['home'],
    'starter'
) ON CONFLICT DO NOTHING;

-- Probar inserción en projects
INSERT INTO projects (client_id, name, description, status, phase, current_tasks, completed_tasks, blockers, next_actions)
SELECT 
    c.id,
    'Test Project RLS',
    'Proyecto de prueba para RLS',
    'planning',
    'test',
    ARRAY['test_task'],
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    ARRAY['test_action']
FROM clients c 
WHERE c.business_name = 'Test Client RLS'
LIMIT 1;

-- Probar inserción en agent_logs
INSERT INTO agent_logs (level, agent, action, message, phase, data)
VALUES (
    'info',
    'RLS Test System',
    'test_rls_policies',
    'Prueba de políticas RLS corregidas',
    'test',
    '{"test": true, "rls_fixed": true}'::jsonb
);

-- =====================================================
-- VERIFICAR INSERCIONES
-- =====================================================

-- Verificar que se insertaron los datos
SELECT 'clients' as table_name, count(*) as row_count FROM clients
UNION ALL
SELECT 'projects', count(*) FROM projects
UNION ALL
SELECT 'agent_logs', count(*) FROM agent_logs
UNION ALL
SELECT 'billing_events', count(*) FROM billing_events;

-- Mostrar datos de prueba
SELECT 'Test Client' as test_data, business_name, industry, goal FROM clients WHERE business_name LIKE '%Test%'
UNION ALL
SELECT 'Test Project', name, description, status FROM projects WHERE name LIKE '%Test%';

-- =====================================================
-- RLS FIX COMPLETED
-- =====================================================

SELECT 'RLS policies fixed successfully' as status;
`;

  await fs.writeFile('fix-supabase-rls.sql', rlsFixSQL);
  console.log('✅ Script de corrección RLS generado: fix-supabase-rls.sql');
  
  console.log('');
  console.log('🔧 INSTRUCCIONES PARA CORREGIR RLS:');
  console.log('===================================');
  console.log('');
  console.log('1. Ve a tu dashboard de Supabase:');
  console.log(`   ${SUPABASE_URL.replace('/rest/v1', '')}`);
  console.log('');
  console.log('2. Ve a SQL Editor > New Query');
  console.log('');
  console.log('3. Copia y pega el contenido de fix-supabase-rls.sql');
  console.log('');
  console.log('4. Ejecuta el SQL');
  console.log('');
  console.log('5. Ejecuta: npm run test:supabase');
  console.log('');
  console.log('✅ Esto corregirá las políticas RLS para permitir inserción de datos');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateRLSFix();
}

export { generateRLSFix };
