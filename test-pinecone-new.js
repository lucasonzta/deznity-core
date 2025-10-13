const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

async function testPineconeNew() {
  try {
    console.log('🔍 Probando nueva configuración de Pinecone...');
    console.log('API Key:', process.env.PINECONE_API_KEY ? '✅ Configurada' : '❌ No configurada');
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    console.log('✅ Cliente Pinecone creado exitosamente');
    
    console.log('📋 Listando índices...');
    const indexes = await pinecone.listIndexes();
    console.log('Índices encontrados:', indexes);
    
    // Probar crear un índice de prueba
    const testIndexName = 'test-deznity-' + Date.now();
    console.log(`🔄 Creando índice de prueba: ${testIndexName}`);
    
    await pinecone.createIndex({
      name: testIndexName,
      dimension: 1536,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
    
    console.log(`✅ Índice de prueba creado: ${testIndexName}`);
    
    // Probar upsert
    const testIndex = pinecone.index(testIndexName);
    const testVector = {
      id: 'test-1',
      values: new Array(1536).fill(0.1),
      metadata: { test: 'data' }
    };
    
    await testIndex.upsert([testVector]);
    console.log('✅ Vector de prueba subido exitosamente');
    
    // Limpiar - eliminar índice de prueba
    await pinecone.deleteIndex(testIndexName);
    console.log(`✅ Índice de prueba eliminado: ${testIndexName}`);
    
    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
  }
}

testPineconeNew();
