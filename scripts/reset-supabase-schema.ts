import * as fs from 'fs-extra';
import dotenv from 'dotenv';

dotenv.config();

async function generateResetSchema() {
  console.log('🔄 GENERANDO SCRIPT PARA RESETEAR SCHEMA DE SUPABASE');
  console.log('====================================================');
  
  const SUPABASE_URL = process.env.SUPABASE_URL;
  
  if (!SUPABASE_URL) {
    console.error('❌ SUPABASE_URL no configurado en .env');
    return;
  }
  
  const resetSQL = `-- =====================================================
-- RESET SUPABASE SCHEMA - DEZNITY
-- Self-Building AI Growth Engine
-- =====================================================

-- ⚠️  ADVERTENCIA: Este script eliminará todas las tablas existentes
-- Ejecuta solo si quieres empezar desde cero

-- =====================================================
-- ELIMINAR TABLAS EXISTENTES (en orden correcto por dependencias)
-- =====================================================

-- Eliminar tablas que dependen de otras
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS billing_events CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS agent_activities CASCADE;
DROP TABLE IF EXISTS agent_tasks CASCADE;
DROP TABLE IF EXISTS agent_decisions CASCADE;
DROP TABLE IF EXISTS project_metrics CASCADE;

-- Eliminar tablas base
DROP TABLE IF EXISTS clients CASCADE;

-- Eliminar funciones y triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- CREAR SCHEMA COMPLETO
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLES FOR AGENT SYSTEM
-- =====================================================

-- Agent logs table
CREATE TABLE agent_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
    agent TEXT NOT NULL,
    action TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    phase TEXT NOT NULL,
    task_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent activities table
CREATE TABLE agent_activities (
    id SERIAL PRIMARY KEY,
    agent TEXT NOT NULL,
    activity TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent tasks table
CREATE TABLE agent_tasks (
    id TEXT PRIMARY KEY,
    agent TEXT NOT NULL,
    task TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    result TEXT,
    dependencies TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent decisions table
CREATE TABLE agent_decisions (
    id TEXT PRIMARY KEY,
    agent TEXT NOT NULL,
    decision_type TEXT NOT NULL,
    content TEXT NOT NULL,
    namespace TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLES FOR CLIENT MANAGEMENT
-- =====================================================

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    goal TEXT NOT NULL,
    color TEXT,
    logo_url TEXT,
    copy_tone TEXT,
    target_geo TEXT,
    pages TEXT[],
    budget TEXT NOT NULL CHECK (budget IN ('starter', 'growth', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'development', 'testing', 'deployed', 'completed')),
    phase TEXT NOT NULL DEFAULT 'initialization',
    current_tasks TEXT[],
    completed_tasks TEXT[],
    blockers TEXT[],
    next_actions TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLES FOR BILLING
-- =====================================================

-- Billing events table (from Stripe webhooks)
CREATE TABLE billing_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    client_id UUID REFERENCES clients(id),
    amount INTEGER, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL,
    plan_type TEXT CHECK (plan_type IN ('starter', 'growth', 'enterprise')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'growth', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLES FOR PROJECT METRICS
-- =====================================================

-- Project metrics table
CREATE TABLE project_metrics (
    id SERIAL PRIMARY KEY,
    phase TEXT NOT NULL,
    tasks_completed INTEGER NOT NULL,
    tasks_total INTEGER NOT NULL,
    agents_active INTEGER NOT NULL,
    errors_count INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Agent logs indexes
CREATE INDEX idx_agent_logs_agent ON agent_logs(agent);
CREATE INDEX idx_agent_logs_timestamp ON agent_logs(timestamp);
CREATE INDEX idx_agent_logs_level ON agent_logs(level);
CREATE INDEX idx_agent_logs_phase ON agent_logs(phase);

-- Agent activities indexes
CREATE INDEX idx_agent_activities_agent ON agent_activities(agent);
CREATE INDEX idx_agent_activities_timestamp ON agent_activities(timestamp);
CREATE INDEX idx_agent_activities_status ON agent_activities(status);

-- Agent tasks indexes
CREATE INDEX idx_agent_tasks_agent ON agent_tasks(agent);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_created_at ON agent_tasks(created_at);

-- Agent decisions indexes
CREATE INDEX idx_agent_decisions_agent ON agent_decisions(agent);
CREATE INDEX idx_agent_decisions_namespace ON agent_decisions(namespace);
CREATE INDEX idx_agent_decisions_decision_type ON agent_decisions(decision_type);

-- Clients indexes
CREATE INDEX idx_clients_business_name ON clients(business_name);
CREATE INDEX idx_clients_industry ON clients(industry);
CREATE INDEX idx_clients_budget ON clients(budget);
CREATE INDEX idx_clients_status ON clients(status);

-- Projects indexes
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_phase ON projects(phase);

-- Billing indexes
CREATE INDEX idx_billing_events_client_id ON billing_events(client_id);
CREATE INDEX idx_billing_events_event_type ON billing_events(event_type);
CREATE INDEX idx_billing_events_created_at ON billing_events(created_at);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Project metrics indexes
CREATE INDEX idx_project_metrics_phase ON project_metrics(phase);
CREATE INDEX idx_project_metrics_timestamp ON project_metrics(timestamp);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_metrics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Agent logs policies (system access only)
CREATE POLICY "System can access agent logs" ON agent_logs
    FOR ALL USING (true);

-- Agent activities policies (system access only)
CREATE POLICY "System can access agent activities" ON agent_activities
    FOR ALL USING (true);

-- Agent tasks policies (system access only)
CREATE POLICY "System can access agent tasks" ON agent_tasks
    FOR ALL USING (true);

-- Agent decisions policies (system access only)
CREATE POLICY "System can access agent decisions" ON agent_decisions
    FOR ALL USING (true);

-- Clients policies (client can only access their own data)
CREATE POLICY "Clients can access own data" ON clients
    FOR ALL USING (auth.uid()::text = id::text);

-- Projects policies (client can only access their own projects)
CREATE POLICY "Clients can access own projects" ON projects
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients WHERE auth.uid()::text = id::text
        )
    );

-- Billing events policies (client can only access their own billing)
CREATE POLICY "Clients can access own billing events" ON billing_events
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients WHERE auth.uid()::text = id::text
        )
    );

-- Subscriptions policies (client can only access their own subscriptions)
CREATE POLICY "Clients can access own subscriptions" ON subscriptions
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients WHERE auth.uid()::text = id::text
        )
    );

-- Project metrics policies (system access only)
CREATE POLICY "System can access project metrics" ON project_metrics
    FOR ALL USING (true);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at BEFORE UPDATE ON agent_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Insert sample client
INSERT INTO clients (business_name, industry, goal, color, copy_tone, target_geo, pages, budget)
VALUES (
    'TacoLoco',
    'restaurant',
    'increase reservations',
    '#FF6A00',
    'fun, young, street-food vibes',
    'CDMX',
    ARRAY['home', 'menu', 'book', 'blog'],
    'starter'
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE agent_logs IS 'Logs de actividad de todos los agentes del sistema';
COMMENT ON TABLE agent_activities IS 'Actividades específicas de los agentes con métricas de rendimiento';
COMMENT ON TABLE agent_tasks IS 'Tareas asignadas a los agentes con estado y dependencias';
COMMENT ON TABLE agent_decisions IS 'Decisiones tomadas por los agentes almacenadas en Pinecone';
COMMENT ON TABLE clients IS 'Información de clientes de Deznity';
COMMENT ON TABLE projects IS 'Proyectos de clientes con estado y progreso';
COMMENT ON TABLE billing_events IS 'Eventos de facturación desde Stripe webhooks';
COMMENT ON TABLE subscriptions IS 'Suscripciones activas de clientes';
COMMENT ON TABLE project_metrics IS 'Métricas de rendimiento del proyecto';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- SCHEMA RESET COMPLETED
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT 'agent_logs' as table_name, count(*) as row_count FROM agent_logs
UNION ALL
SELECT 'agent_activities', count(*) FROM agent_activities
UNION ALL
SELECT 'agent_tasks', count(*) FROM agent_tasks
UNION ALL
SELECT 'agent_decisions', count(*) FROM agent_decisions
UNION ALL
SELECT 'clients', count(*) FROM clients
UNION ALL
SELECT 'projects', count(*) FROM projects
UNION ALL
SELECT 'billing_events', count(*) FROM billing_events
UNION ALL
SELECT 'subscriptions', count(*) FROM subscriptions
UNION ALL
SELECT 'project_metrics', count(*) FROM project_metrics;
`;

  await fs.writeFile('reset-supabase-schema.sql', resetSQL);
  console.log('✅ Script de reset generado: reset-supabase-schema.sql');
  
  console.log('');
  console.log('🔄 INSTRUCCIONES PARA RESETEAR SUPABASE:');
  console.log('========================================');
  console.log('');
  console.log('1. Ve a tu dashboard de Supabase:');
  console.log(`   ${SUPABASE_URL.replace('/rest/v1', '')}`);
  console.log('');
  console.log('2. Ve a SQL Editor > New Query');
  console.log('');
  console.log('3. Copia y pega el contenido de reset-supabase-schema.sql');
  console.log('');
  console.log('4. Ejecuta el SQL (esto eliminará todas las tablas existentes)');
  console.log('');
  console.log('5. Verifica en Table Editor que las tablas se crearon correctamente');
  console.log('');
  console.log('6. Ejecuta: npm run test:supabase');
  console.log('');
  console.log('⚠️  ADVERTENCIA: Este script eliminará TODAS las tablas existentes');
  console.log('   Asegúrate de hacer backup si tienes datos importantes');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateResetSchema();
}

export { generateResetSchema };
