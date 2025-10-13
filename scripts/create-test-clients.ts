import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_URL y SUPABASE_ANON_KEY son requeridos en .env');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestClient {
  business_name: string;
  industry: string;
  goal: string;
  color: string;
  copy_tone: string;
  target_geo: string;
  pages: string[];
  budget: string;
}

const testClients: TestClient[] = [
  {
    business_name: 'FitTrack',
    industry: 'saas',
    goal: 'increase user engagement',
    color: '#00D4AA',
    copy_tone: 'motivational, data-driven',
    target_geo: 'Global',
    pages: ['home', 'dashboard', 'pricing', 'blog'],
    budget: 'growth'
  },
  {
    business_name: 'GreenGlow',
    industry: 'ecommerce',
    goal: 'increase online sales',
    color: '#2ECC71',
    copy_tone: 'eco-friendly, premium',
    target_geo: 'North America',
    pages: ['home', 'products', 'cart', 'blog'],
    budget: 'enterprise'
  },
  {
    business_name: 'TechStart',
    industry: 'tech',
    goal: 'increase lead generation',
    color: '#3498DB',
    copy_tone: 'innovative, professional',
    target_geo: 'Europe',
    pages: ['home', 'services', 'about', 'contact'],
    budget: 'starter'
  },
  {
    business_name: 'BeautyLux',
    industry: 'beauty',
    goal: 'increase brand awareness',
    color: '#E91E63',
    copy_tone: 'elegant, luxurious',
    target_geo: 'Latin America',
    pages: ['home', 'products', 'gallery', 'blog'],
    budget: 'growth'
  }
];

async function createTestClients(): Promise<void> {
  console.log('🚀 CREANDO CLIENTES DE PRUEBA EN SUPABASE');
  console.log('==========================================');
  
  try {
    // Verificar conexión
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Error conectando a Supabase: ${error.message}`);
    }
    
    console.log('✅ Conexión a Supabase establecida');
    
    // Crear cada cliente de prueba
    for (const client of testClients) {
      console.log(`\n📝 Creando cliente: ${client.business_name}`);
      
      const { data: insertedClient, error: insertError } = await supabase
        .from('clients')
        .insert({
          business_name: client.business_name,
          industry: client.industry,
          goal: client.goal,
          color: client.color,
          copy_tone: client.copy_tone,
          target_geo: client.target_geo,
          pages: client.pages,
          budget: client.budget,
          status: 'pending'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error(`❌ Error creando ${client.business_name}:`, insertError.message);
        continue;
      }
      
      console.log(`✅ Cliente creado: ${insertedClient.business_name} (ID: ${insertedClient.id})`);
      console.log(`   Industria: ${insertedClient.industry}`);
      console.log(`   Objetivo: ${insertedClient.goal}`);
      console.log(`   Presupuesto: ${insertedClient.budget}`);
      console.log(`   Status: ${insertedClient.status}`);
    }
    
    // Verificar clientes creados
    console.log('\n📊 VERIFICANDO CLIENTES CREADOS');
    console.log('===============================');
    
    const { data: allClients, error: selectError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (selectError) {
      throw new Error(`Error consultando clientes: ${selectError.message}`);
    }
    
    console.log(`✅ Total de clientes en Supabase: ${allClients?.length || 0}`);
    
    if (allClients && allClients.length > 0) {
      console.log('\n📋 Lista de clientes:');
      allClients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.business_name} (${client.industry}) - ${client.status}`);
      });
    }
    
    console.log('\n🎉 ¡CLIENTES DE PRUEBA CREADOS EXITOSAMENTE!');
    console.log('===========================================');
    console.log('✅ Los clientes están listos para ser procesados por el agente autónomo');
    console.log('✅ Ejecuta: npm run agents:autonomous para iniciar el procesamiento');
    
  } catch (error: any) {
    console.error('❌ Error creando clientes de prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createTestClients();
}

export { createTestClients };
