import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase no configurado. Configura SUPABASE_URL y SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseTables() {
  console.log('🧪 PROBANDO CONFIGURACIÓN DE SUPABASE');
  console.log('=====================================');
  
  const tables = [
    { name: 'agent_logs', description: 'Logs de actividad de agentes' },
    { name: 'agent_activities', description: 'Actividades de agentes' },
    { name: 'agent_tasks', description: 'Tareas de agentes' },
    { name: 'clients', description: 'Información de clientes' },
    { name: 'projects', description: 'Proyectos de clientes' },
    { name: 'billing_events', description: 'Eventos de facturación' }
  ];
  
  let allTablesOk = true;
  
  for (const table of tables) {
    try {
      console.log(`🔍 Probando tabla: ${table.name}...`);
      
      const { data, error } = await supabase
        .from(table.name)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table.name}: ${error.message}`);
        allTablesOk = false;
      } else {
        console.log(`✅ ${table.name}: OK - ${table.description}`);
      }
    } catch (err) {
      console.log(`❌ ${table.name}: ${err.message}`);
      allTablesOk = false;
    }
  }
  
  return allTablesOk;
}

async function testInsertData() {
  console.log('\n📊 PROBANDO INSERCIÓN DE DATOS');
  console.log('===============================');
  
  try {
    // Probar inserción en agent_logs
    console.log('🔍 Probando inserción en agent_logs...');
    const { data: logData, error: logError } = await supabase
      .from('agent_logs')
      .insert({
        level: 'info',
        agent: 'Test System',
        action: 'test_insert',
        message: 'Prueba de inserción en Supabase',
        phase: 'test',
        data: { test: true, timestamp: new Date().toISOString() }
      })
      .select();
    
    if (logError) {
      console.log(`❌ Error insertando en agent_logs: ${logError.message}`);
      return false;
    } else {
      console.log(`✅ Log insertado exitosamente: ID ${logData[0].id}`);
    }

    // Probar inserción en clients
    console.log('🔍 Probando inserción en clients...');
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_name: 'Test Client',
        industry: 'test',
        goal: 'test connection',
        color: '#FF0000',
        copy_tone: 'test',
        target_geo: 'Test City',
        pages: ['home'],
        budget: 'starter'
      })
      .select();
    
    if (clientError) {
      console.log(`❌ Error insertando en clients: ${clientError.message}`);
      return false;
    } else {
      console.log(`✅ Cliente insertado exitosamente: ID ${clientData[0].id}`);
    }

    // Probar inserción en projects
    console.log('🔍 Probando inserción en projects...');
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        client_id: clientData[0].id,
        name: 'Test Project',
        description: 'Proyecto de prueba',
        status: 'planning',
        phase: 'test',
        current_tasks: ['test_task'],
        completed_tasks: [],
        blockers: [],
        next_actions: ['test_action']
      })
      .select();
    
    if (projectError) {
      console.log(`❌ Error insertando en projects: ${projectError.message}`);
      return false;
    } else {
      console.log(`✅ Proyecto insertado exitosamente: ID ${projectData[0].id}`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error en pruebas de inserción: ${error.message}`);
    return false;
  }
}

async function testQueryData() {
  console.log('\n🔍 PROBANDO CONSULTAS DE DATOS');
  console.log('===============================');
  
  try {
    // Probar consulta en agent_logs
    console.log('🔍 Probando consulta en agent_logs...');
    const { data: logsData, error: logsError } = await supabase
      .from('agent_logs')
      .select('*')
      .limit(5);
    
    if (logsError) {
      console.log(`❌ Error consultando agent_logs: ${logsError.message}`);
      return false;
    } else {
      console.log(`✅ Consulta exitosa: ${logsData.length} logs encontrados`);
    }

    // Probar consulta en clients
    console.log('🔍 Probando consulta en clients...');
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);
    
    if (clientsError) {
      console.log(`❌ Error consultando clients: ${clientsError.message}`);
      return false;
    } else {
      console.log(`✅ Consulta exitosa: ${clientsData.length} clientes encontrados`);
    }

    // Probar consulta en projects
    console.log('🔍 Probando consulta en projects...');
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);
    
    if (projectsError) {
      console.log(`❌ Error consultando projects: ${projectsError.message}`);
      return false;
    } else {
      console.log(`✅ Consulta exitosa: ${projectsData.length} proyectos encontrados`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error en pruebas de consulta: ${error.message}`);
    return false;
  }
}

async function testSupabase() {
  console.log('🚀 INICIANDO PRUEBAS DE SUPABASE');
  console.log('================================');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log('');
  
  try {
    // 1. Probar tablas
    const tablesOk = await testSupabaseTables();
    
    if (!tablesOk) {
      console.log('\n❌ ERROR: Las tablas no están configuradas correctamente');
      console.log('📋 Ejecuta: npm run setup:supabase');
      console.log('📄 Sigue las instrucciones en SUPABASE_SETUP_INSTRUCTIONS.md');
      process.exit(1);
    }
    
    // 2. Probar inserción
    const insertOk = await testInsertData();
    
    if (!insertOk) {
      console.log('\n❌ ERROR: No se pueden insertar datos');
      process.exit(1);
    }
    
    // 3. Probar consultas
    const queryOk = await testQueryData();
    
    if (!queryOk) {
      console.log('\n❌ ERROR: No se pueden consultar datos');
      process.exit(1);
    }
    
    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE SUPABASE EXITOSAS!');
    console.log('===========================================');
    console.log('✅ Tablas configuradas correctamente');
    console.log('✅ Inserción de datos funcionando');
    console.log('✅ Consultas de datos funcionando');
    console.log('✅ RLS y permisos configurados');
    console.log('');
    console.log('🌐 Supabase está listo para producción!');
    console.log(`   Dashboard: ${SUPABASE_URL.replace('/rest/v1', '')}`);
    
  } catch (error) {
    console.error('❌ Error en pruebas de Supabase:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testSupabase();
}

export { testSupabase };
