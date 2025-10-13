import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

dotenv.config();

async function testAPIs() {
  console.log('🔍 Verificando API keys...\n');

  // Test OpenAI
  console.log('1. Testing OpenAI API...');
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const response = await openai.models.list();
    console.log('✅ OpenAI API key válida');
    console.log(`   Modelos disponibles: ${response.data.length}`);
  } catch (error) {
    console.log('❌ OpenAI API key inválida:', error.message);
  }

  // Test Pinecone
  console.log('\n2. Testing Pinecone API...');
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    
    const indexes = await pinecone.listIndexes();
    console.log('✅ Pinecone API key válida');
    console.log(`   Índices disponibles: ${indexes.indexes?.length || 0}`);
  } catch (error) {
    console.log('❌ Pinecone API key inválida:', error.message);
  }

  // Test OpenRouter
  console.log('\n3. Testing OpenRouter API...');
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenRouter API key válida');
      console.log(`   Modelos disponibles: ${data.data?.length || 0}`);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ OpenRouter API key inválida:', error.message);
  }

  // Test Supabase (opcional)
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    console.log('\n4. Testing Supabase API...');
    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        console.log('✅ Supabase API keys válidas');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log('❌ Supabase API keys inválidas:', error.message);
    }
  } else {
    console.log('\n4. Supabase no configurado (opcional)');
  }

  console.log('\n🎯 Verificación completada');
}

testAPIs().catch(console.error);
