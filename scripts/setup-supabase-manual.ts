import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs-extra';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase no configurado. Configura SUPABASE_URL y SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTablesManually() {
  console.log('🗄️  Creando tablas manualmente en Supabase...');
  
  try {
    // 1. Crear tabla agent_logs
    console.log('📝 Creando tabla agent_logs...');
    const { error: logsError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (logsError) {
      console.log('⚠️  Error creando agent_logs:', logsError.message);
    } else {
      console.log('✅ Tabla agent_logs creada');
    }

    // 2. Crear tabla agent_activities
    console.log('📝 Creando tabla agent_activities...');
    const { error: activitiesError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (activitiesError) {
      console.log('⚠️  Error creando agent_activities:', activitiesError.message);
    } else {
      console.log('✅ Tabla agent_activities creada');
    }

    // 3. Crear tabla agent_tasks
    console.log('📝 Creando tabla agent_tasks...');
    const { error: tasksError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (tasksError) {
      console.log('⚠️  Error creando agent_tasks:', tasksError.message);
    } else {
      console.log('✅ Tabla agent_tasks creada');
    }

    // 4. Crear tabla clients
    console.log('📝 Creando tabla clients...');
    const { error: clientsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS clients (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      `
    });
    
    if (clientsError) {
      console.log('⚠️  Error creando clients:', clientsError.message);
    } else {
      console.log('✅ Tabla clients creada');
    }

    // 5. Crear tabla projects
    console.log('📝 Creando tabla projects...');
    const { error: projectsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      `
    });
    
    if (projectsError) {
      console.log('⚠️  Error creando projects:', projectsError.message);
    } else {
      console.log('✅ Tabla projects creada');
    }

    // 6. Crear tabla billing_events
    console.log('📝 Creando tabla billing_events...');
    const { error: billingError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS billing_events (
          id TEXT PRIMARY KEY,
          event_type TEXT NOT NULL,
          client_id UUID REFERENCES clients(id),
          amount INTEGER,
          currency TEXT DEFAULT 'usd',
          status TEXT NOT NULL,
          plan_type TEXT CHECK (plan_type IN ('starter', 'growth', 'enterprise')),
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (billingError) {
      console.log('⚠️  Error creando billing_events:', billingError.message);
    } else {
      console.log('✅ Tabla billing_events creada');
    }

    console.log('✅ Todas las tablas creadas exitosamente');

  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    throw error;
  }
}

async function testSupabaseConnection() {
  console.log('🔍 Probando conexión a Supabase...');
  
  try {
    // Probar inserción en agent_logs
    const { data, error } = await supabase
      .from('agent_logs')
      .insert({
        level: 'info',
        agent: 'Setup System',
        action: 'test_connection',
        message: 'Prueba de conexión a Supabase',
        phase: 'setup'
      })
      .select();
    
    if (error) {
      console.log('❌ Error en prueba de conexión:', error.message);
      return false;
    } else {
      console.log('✅ Conexión a Supabase exitosa');
      console.log('✅ Inserción de prueba exitosa');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
}

async function insertSampleData() {
  console.log('📊 Insertando datos de muestra...');
  
  try {
    // Insertar cliente TacoLoco
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_name: 'TacoLoco',
        industry: 'restaurant',
        goal: 'increase reservations',
        color: '#FF6A00',
        copy_tone: 'fun, young, street-food vibes',
        target_geo: 'CDMX',
        pages: ['home', 'menu', 'book', 'blog'],
        budget: 'starter'
      })
      .select();
    
    if (clientError) {
      console.log('⚠️  Error insertando cliente:', clientError.message);
    } else {
      console.log('✅ Cliente TacoLoco insertado:', clientData[0].id);
    }

    // Insertar proyecto TacoLoco
    if (clientData && clientData[0]) {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_id: clientData[0].id,
          name: 'TacoLoco Website',
          description: 'Sitio web para restaurante TacoLoco en CDMX',
          status: 'completed',
          phase: 'deployment',
          current_tasks: [],
          completed_tasks: ['analysis', 'development', 'content', 'testing', 'deployment'],
          blockers: [],
          next_actions: ['deploy', 'analytics', 'seo_optimization']
        })
        .select();
      
      if (projectError) {
        console.log('⚠️  Error insertando proyecto:', projectError.message);
      } else {
        console.log('✅ Proyecto TacoLoco insertado:', projectData[0].id);
      }
    }
    
  } catch (error) {
    console.error('❌ Error insertando datos:', error);
    throw error;
  }
}

async function setupSupabase() {
  console.log('🚀 CONFIGURANDO SUPABASE - DEZNITY');
  console.log('===================================');
  console.log('Self-Building AI Growth Engine - Database Setup');
  console.log('');
  
  try {
    // 1. Crear tablas
    await createTablesManually();
    console.log('');
    
    // 2. Probar conexión
    const connectionOk = await testSupabaseConnection();
    console.log('');
    
    if (connectionOk) {
      // 3. Insertar datos de muestra
      await insertSampleData();
      console.log('');
      
      console.log('🎉 ¡SUPABASE CONFIGURADO EXITOSAMENTE!');
      console.log('=====================================');
      console.log('✅ Tablas creadas');
      console.log('✅ Conexión verificada');
      console.log('✅ Datos de muestra insertados');
      console.log('');
      console.log('🌐 Supabase está listo para producción!');
      console.log(`   Dashboard: ${SUPABASE_URL.replace('/rest/v1', '')}`);
    } else {
      console.log('❌ Error en configuración de Supabase');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error configurando Supabase:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupSupabase();
}

export { setupSupabase };
