const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

async function testSimple() {
  try {
    console.log('🔍 Probando configuración simple de Pinecone...');
    console.log('API Key:', process.env.PINECONE_API_KEY ? '✅ Configurada' : '❌ No configurada');
    
    // Intentar configuración sin environment
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    console.log('✅ Cliente Pinecone creado exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Intentar con environment
    try {
      console.log('🔄 Intentando con environment...');
      const pinecone2 = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENV,
      });
      console.log('✅ Cliente Pinecone creado con environment');
    } catch (error2) {
      console.error('❌ Error con environment:', error2.message);
    }
  }
}

testSimple();
