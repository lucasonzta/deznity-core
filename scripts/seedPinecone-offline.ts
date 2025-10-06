import OpenAI from 'openai';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Interfaces
interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    type: 'chunk' | 'brief';
    filename: string;
    content: string;
  };
}

interface ProcessedFile {
  content: string;
  filename: string;
  type: 'chunk' | 'brief';
}

// Configuración
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Validar variables de entorno
if (!OPENAI_API_KEY) {
  console.error('❌ Error: Faltan variables de entorno requeridas');
  console.error('Asegúrate de tener OPENAI_API_KEY en tu archivo .env');
  process.exit(1);
}

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Genera embedding para un texto usando OpenAI
 */
async function embedText(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('❌ Error generando embedding:', error);
    throw error;
  }
}

/**
 * Procesa archivos de una carpeta específica
 */
async function processFiles(folderPath: string, type: 'chunk' | 'brief'): Promise<ProcessedFile[]> {
  const files = await fs.readdir(folderPath);
  const processedFiles: ProcessedFile[] = [];
  
  for (const file of files) {
    // Incluir archivos .md, .MD y archivos sin extensión (como los briefs)
    if (file.endsWith('.md') || file.endsWith('.MD') || !file.includes('.') || file.startsWith('1.') || file.startsWith('2.') || file.startsWith('3.')) {
      const filePath = path.join(folderPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      processedFiles.push({
        content,
        filename: file,
        type
      });
    }
  }
  
  return processedFiles;
}

/**
 * Simula el proceso de subida a Pinecone (guarda en archivos JSON)
 */
async function simulatePineconeUpload(vectors: VectorRecord[], namespace: string): Promise<void> {
  const outputDir = './output';
  await fs.ensureDir(outputDir);
  
  const filename = `${namespace.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);
  
  await fs.writeJson(filepath, vectors, { spaces: 2 });
  console.log(`✅ Simulados ${vectors.length} vectores guardados en: ${filepath}`);
}

/**
 * Función principal para procesar datos (versión offline)
 */
async function processDataOffline(): Promise<void> {
  try {
    console.log('🚀 Iniciando procesamiento offline de datos...');
    
    // Procesar chunks de la Biblia
    console.log('📚 Procesando chunks de la Biblia...');
    const chunks = await processFiles('./data/chunks', 'chunk');
    console.log(`📖 Encontrados ${chunks.length} chunks`);
    
    // Procesar briefs semilla
    console.log('🌱 Procesando briefs semilla...');
    const briefs = await processFiles('./data/briefs', 'brief');
    console.log(`📋 Encontrados ${briefs.length} briefs`);
    
    // Procesar chunks
    console.log('🔄 Procesando chunks...');
    const chunkNamespace = 'deznity-core';
    const chunkVectors: VectorRecord[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`🔄 Procesando chunk ${i + 1}/${chunks.length}: ${chunk.filename}`);
      
      const embedding = await embedText(chunk.content);
      chunkVectors.push({
        id: `chunk-${i}-${Date.now()}`,
        values: embedding,
        metadata: {
          type: 'chunk',
          filename: chunk.filename,
          content: chunk.content
        }
      });
    }
    
    await simulatePineconeUpload(chunkVectors, chunkNamespace);
    console.log(`✅ Procesados ${chunkVectors.length} chunks`);
    
    // Procesar briefs
    console.log('🔄 Procesando briefs...');
    
    for (let i = 0; i < briefs.length; i++) {
      const brief = briefs[i];
      console.log(`🔄 Procesando brief ${i + 1}/${briefs.length}: ${brief.filename}`);
      
      const embedding = await embedText(brief.content);
      const clientUuid = uuidv4();
      const briefNamespace = `client-${clientUuid}`;
      
      const briefVectors: VectorRecord[] = [{
        id: `brief-${i}-${Date.now()}`,
        values: embedding,
        metadata: {
          type: 'brief',
          filename: brief.filename,
          content: brief.content
        }
      }];
      
      await simulatePineconeUpload(briefVectors, briefNamespace);
      console.log(`✅ Procesado brief ${brief.filename} para namespace: ${briefNamespace}`);
    }
    
    console.log('🎉 ¡Proceso offline completado exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Chunks procesados: ${chunks.length}`);
    console.log(`   - Briefs procesados: ${briefs.length}`);
    console.log(`   - Archivos generados en: ./output/`);
    console.log(`   - Namespace de chunks: ${chunkNamespace}`);
    console.log(`   - Namespaces de briefs: client-{uuid} (${briefs.length} namespaces únicos)`);
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  processDataOffline();
}

export { processDataOffline, embedText, processFiles };
