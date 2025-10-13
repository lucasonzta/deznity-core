const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function testOffline() {
  try {
    console.log('🚀 Probando proceso offline...');
    
    // Inicializar OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('✅ Cliente OpenAI inicializado');
    
    // Probar embedding
    console.log('🔄 Probando embedding...');
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Test de embedding para Deznity',
    });
    
    console.log('✅ Embedding generado:', response.data[0].embedding.length, 'dimensiones');
    
    // Probar lectura de archivos
    console.log('📚 Probando lectura de archivos...');
    const chunks = await fs.readdir('./data/chunks');
    const briefs = await fs.readdir('./data/briefs');
    
    console.log(`✅ Encontrados ${chunks.length} chunks y ${briefs.length} briefs`);
    
    // Probar procesamiento de un archivo
    const chunkPath = path.join('./data/chunks', chunks[0]);
    const content = await fs.readFile(chunkPath, 'utf-8');
    console.log('✅ Archivo leído:', chunkPath, '(', content.length, 'caracteres)');
    
    // Probar embedding del contenido
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    });
    
    console.log('✅ Embedding del archivo generado:', embedding.data[0].embedding.length, 'dimensiones');
    
    console.log('🎉 ¡Proceso offline completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOffline();
