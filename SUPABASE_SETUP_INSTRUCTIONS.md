# 🔧 INSTRUCCIONES PARA CONFIGURAR SUPABASE

## 📍 Paso 1: Acceder al SQL Editor de Supabase

1. Ve a: https://jjpsissdsmoluolmpwks.supabase.co
2. Inicia sesión en tu cuenta de Supabase
3. Ve a **SQL Editor** en el menú lateral
4. Haz clic en **New Query**

## 📝 Paso 2: Ejecutar el Schema SQL

Copia y pega el siguiente SQL en el editor y ejecuta:

```sql
-- =====================================================
-- DEZNITY PRODUCTION DATABASE SCHEMA
-- Self-Building AI Growth Engine
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLES FOR AGENT SYSTEM
-- =====================================================

-- Agent logs table
CREATE TABLE IF NOT EXISTS agent_logs (
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
CREATE TABLE IF NOT EXISTS agent_activities (
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
CREATE TABLE IF NOT EXISTS agent_tasks (
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

-- =====================================================
-- TABLES FOR CLIENT MANAGEMENT
-- =====================================================

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
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
CREATE TABLE IF NOT EXISTS projects (
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
CREATE TABLE IF NOT EXISTS billing_events (
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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Agent logs indexes
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_logs(agent);
CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_logs_level ON agent_logs(level);
CREATE INDEX IF NOT EXISTS idx_agent_logs_phase ON agent_logs(phase);

-- Agent activities indexes
CREATE INDEX IF NOT EXISTS idx_agent_activities_agent ON agent_activities(agent);
CREATE INDEX IF NOT EXISTS idx_agent_activities_timestamp ON agent_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_activities_status ON agent_activities(status);

-- Agent tasks indexes
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON agent_tasks(agent);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created_at ON agent_tasks(created_at);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_business_name ON clients(business_name);
CREATE INDEX IF NOT EXISTS idx_clients_industry ON clients(industry);
CREATE INDEX IF NOT EXISTS idx_clients_budget ON clients(budget);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_billing_events_client_id ON billing_events(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_event_type ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at ON billing_events(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

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
) ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

## ✅ Paso 3: Verificar la Configuración

Después de ejecutar el SQL, verifica que las tablas se crearon:

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver las siguientes tablas:
   - `agent_logs`
   - `agent_activities`
   - `agent_tasks`
   - `clients`
   - `projects`
   - `billing_events`

## 🧪 Paso 4: Probar la Configuración

Ejecuta este comando para probar la configuración:

```bash
npm run test:supabase
```

## 📊 Paso 5: Verificar Datos

Ve a **Table Editor** > **clients** y verifica que se insertó el cliente TacoLoco de prueba.

---

## 🎯 Resultado Esperado

Después de completar estos pasos:
- ✅ Todas las tablas creadas
- ✅ RLS configurado
- ✅ Índices creados
- ✅ Datos de prueba insertados
- ✅ Permisos configurados

## 📞 Soporte

Si tienes problemas:
1. Verifica que tienes permisos de administrador en Supabase
2. Asegúrate de que las extensiones `uuid-ossp` y `pgcrypto` estén habilitadas
3. Revisa los logs de Supabase para errores específicos

---
*Generado automáticamente por Deznity Setup System*
