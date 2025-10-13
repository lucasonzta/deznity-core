-- =====================================================
-- FIX STATUS CONSTRAINT - DEZNITY CLIENTS TABLE
-- Self-Building AI Growth Engine
-- =====================================================

-- =====================================================
-- CORREGIR CONSTRAINT DE STATUS PARA SOPORTAR MODO AUTÓNOMO
-- =====================================================

-- Eliminar constraint existente
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- Crear nuevo constraint que incluya estados del modo autónomo
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'active', 'inactive', 'suspended'));

-- =====================================================
-- VERIFICAR QUE EL CONSTRAINT FUNCIONA
-- =====================================================

-- Probar inserción con status 'pending'
INSERT INTO clients (business_name, industry, goal, color, copy_tone, target_geo, pages, budget, status)
VALUES (
    'Test Client Pending',
    'test',
    'test pending status',
    '#FF0000',
    'test',
    'Test City',
    ARRAY['home'],
    'starter',
    'pending'
) ON CONFLICT DO NOTHING;

-- Probar inserción con status 'in_progress'
INSERT INTO clients (business_name, industry, goal, color, copy_tone, target_geo, pages, budget, status)
VALUES (
    'Test Client In Progress',
    'test',
    'test in_progress status',
    '#00FF00',
    'test',
    'Test City',
    ARRAY['home'],
    'starter',
    'in_progress'
) ON CONFLICT DO NOTHING;

-- Probar inserción con status 'completed'
INSERT INTO clients (business_name, industry, goal, color, copy_tone, target_geo, pages, budget, status)
VALUES (
    'Test Client Completed',
    'test',
    'test completed status',
    '#0000FF',
    'test',
    'Test City',
    ARRAY['home'],
    'starter',
    'completed'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICAR INSERCIONES
-- =====================================================

-- Mostrar todos los clientes con sus status
SELECT business_name, status, created_at 
FROM clients 
WHERE business_name LIKE '%Test Client%'
ORDER BY created_at DESC;

-- Contar clientes por status
SELECT status, count(*) as count
FROM clients
GROUP BY status
ORDER BY count DESC;

-- =====================================================
-- STATUS CONSTRAINT FIX COMPLETED
-- =====================================================

SELECT 'Status constraint fixed successfully - autonomous mode ready' as status;
