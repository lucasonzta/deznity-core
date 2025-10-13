const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

async function testPinecone() {
  try {
    console.log('🔍 Probando conexión a Pinecone...');
    console.log('API Key:', process.env.PINECONE_API_KEY ? '✅ Configurada' : '❌ No configurada');
    console.log('Environment:', process.env.PINECONE_ENV);
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENV,
    });
    
    console.log('📋 Listando índices...');
    const indexes = await pinecone.listIndexes();
    console.log('Índices encontrados:', indexes);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
  }
}

testPinecone();
