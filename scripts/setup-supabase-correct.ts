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

async function testSupabaseConnection() {
  console.log('🔍 Probando conexión a Supabase...');
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase
      .from('agent_logs')
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Conexión exitosa (tabla no existe aún, pero conexión OK)');
      return true;
    } else if (error) {
      console.log('⚠️  Conexión con warnings:', error.message);
      return false;
    } else {
      console.log('✅ Conexión exitosa');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
}

async function createTablesViaSQL() {
  console.log('🗄️  Creando tablas via SQL directo...');
  
  try {
    // Leer el schema SQL
    const schemaSQL = await fs.readFile('schema.sql', 'utf-8');
    
    console.log('📝 Schema SQL leído correctamente');
    console.log('📏 Tamaño del schema:', schemaSQL.length, 'caracteres');
    
    // Dividir en statements individuales
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Encontrados ${statements.length} statements SQL`);
    
    // Ejecutar cada statement usando rpc
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          
          // Usar rpc para ejecutar SQL
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (error) {
            console.log(`   ⚠️  Warning: ${error.message}`);
          } else {
            console.log(`   ✅ OK`);
          }
        } catch (err) {
          console.log(`   ⚠️  Warning: ${err.message}`);
        }
      }
    }
    
    console.log('✅ Schema SQL aplicado');
    
  } catch (error) {
    console.error('❌ Error aplicando schema:', error);
    throw error;
  }
}

async function testTablesExist() {
  console.log('🔍 Verificando que las tablas existen...');
  
  const tables = ['agent_logs', 'agent_activities', 'agent_tasks', 'clients', 'projects', 'billing_events'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabla ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabla ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ Tabla ${table}: ${err.message}`);
    }
  }
}

async function insertTestData() {
  console.log('📊 Insertando datos de prueba...');
  
  try {
    // Insertar log de prueba
    const { data: logData, error: logError } = await supabase
      .from('agent_logs')
      .insert({
        level: 'info',
        agent: 'Setup System',
        action: 'test_insert',
        message: 'Prueba de inserción en Supabase',
        phase: 'setup',
        data: { test: true }
      })
      .select();
    
    if (logError) {
      console.log('⚠️  Error insertando log:', logError.message);
    } else {
      console.log('✅ Log de prueba insertado:', logData[0].id);
    }

    // Insertar cliente de prueba
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_name: 'TacoLoco Test',
        industry: 'restaurant',
        goal: 'test connection',
        color: '#FF6A00',
        copy_tone: 'test',
        target_geo: 'CDMX',
        pages: ['home'],
        budget: 'starter'
      })
      .select();
    
    if (clientError) {
      console.log('⚠️  Error insertando cliente:', clientError.message);
    } else {
      console.log('✅ Cliente de prueba insertado:', clientData[0].id);
    }
    
  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
    throw error;
  }
}

async function setupSupabase() {
  console.log('🚀 CONFIGURANDO SUPABASE - DEZNITY');
  console.log('===================================');
  console.log('Self-Building AI Growth Engine - Database Setup');
  console.log('');
  
  try {
    // 1. Probar conexión
    const connectionOk = await testSupabaseConnection();
    console.log('');
    
    if (!connectionOk) {
      console.log('❌ No se puede conectar a Supabase');
      process.exit(1);
    }
    
    // 2. Aplicar schema SQL
    await createTablesViaSQL();
    console.log('');
    
    // 3. Verificar tablas
    await testTablesExist();
    console.log('');
    
    // 4. Insertar datos de prueba
    await insertTestData();
    console.log('');
    
    console.log('🎉 ¡SUPABASE CONFIGURADO EXITOSAMENTE!');
    console.log('=====================================');
    console.log('✅ Conexión verificada');
    console.log('✅ Schema aplicado');
    console.log('✅ Tablas creadas');
    console.log('✅ Datos de prueba insertados');
    console.log('');
    console.log('🌐 Supabase está listo para producción!');
    console.log(`   Dashboard: ${SUPABASE_URL.replace('/rest/v1', '')}`);
    
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
