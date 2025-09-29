import { Pinecone } from '@pinecone-database/pinecone';
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
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENV = process.env.PINECONE_ENV;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'deznity-core';

// Validar variables de entorno
if (!OPENAI_API_KEY || !PINECONE_API_KEY || !PINECONE_ENV) {
  console.error('❌ Error: Faltan variables de entorno requeridas');
  console.error('Asegúrate de tener OPENAI_API_KEY, PINECONE_API_KEY y PINECONE_ENV en tu archivo .env');
  process.exit(1);
}

// Inicializar clientes
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
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
 * Sube un lote de vectores a Pinecone con reintentos
 */
async function upsertToPinecone(
  vectors: VectorRecord[], 
  namespace: string,
  retries: number = 3
): Promise<void> {
  const index = pinecone.index(PINECONE_INDEX_NAME);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await index.upsert(vectors, { namespace });
      console.log(`✅ Subidos ${vectors.length} vectores al namespace: ${namespace}`);
      return;
    } catch (error: any) {
      console.error(`❌ Error en intento ${attempt}/${retries}:`, error.message);
      
      if (error.status === 429 || error.status === 500) {
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial
          console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw new Error(`Falló después de ${retries} intentos: ${error.message}`);
        }
      } else {
        throw error;
      }
    }
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
 * Función principal para poblar Pinecone
 */
async function seedPinecone(): Promise<void> {
  try {
    console.log('🚀 Iniciando proceso de poblamiento de Pinecone...');
    
    // Verificar que el índice existe
    try {
      const indexList = await pinecone.listIndexes();
      const indexExists = indexList.indexes?.some(index => index.name === PINECONE_INDEX_NAME);
      
      if (!indexExists) {
        console.log(`⚠️  El índice '${PINECONE_INDEX_NAME}' no existe. Creándolo...`);
        
        // Crear el índice si no existe
        await pinecone.createIndex({
          name: PINECONE_INDEX_NAME,
          dimension: 1536,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        console.log(`✅ Índice '${PINECONE_INDEX_NAME}' creado exitosamente`);
      } else {
        console.log(`✅ Índice '${PINECONE_INDEX_NAME}' encontrado`);
      }
    } catch (error) {
      console.log(`⚠️  Error verificando/creando índice:`, error.message);
      console.log(`⚠️  Continuando con el procesamiento...`);
    }
    
    // Procesar chunks de la Biblia
    console.log('📚 Procesando chunks de la Biblia...');
    const chunks = await processFiles('./data/chunks', 'chunk');
    console.log(`📖 Encontrados ${chunks.length} chunks`);
    
    // Procesar briefs semilla
    console.log('🌱 Procesando briefs semilla...');
    const briefs = await processFiles('./data/briefs', 'brief');
    console.log(`📋 Encontrados ${briefs.length} briefs`);
    
    // Procesar chunks en lotes de 50
    console.log('🔄 Procesando chunks...');
    const chunkNamespace = '';
    
    for (let i = 0; i < chunks.length; i += 50) {
      const batch = chunks.slice(i, i + 50);
      const vectors: VectorRecord[] = [];
      
      for (const chunk of batch) {
        const embedding = await embedText(chunk.content);
        vectors.push({
          id: `chunk-${i + batch.indexOf(chunk)}-${Date.now()}`,
          values: embedding,
          metadata: {
            type: 'chunk',
            filename: chunk.filename,
            content: chunk.content
          }
        });
      }
      
      await upsertToPinecone(vectors, chunkNamespace);
      console.log(`✅ Procesado lote de chunks ${Math.floor(i/50) + 1}/${Math.ceil(chunks.length/50)}`);
    }
    
    // Procesar briefs en lotes de 50
    console.log('🔄 Procesando briefs...');
    
    for (let i = 0; i < briefs.length; i += 50) {
      const batch = briefs.slice(i, i + 50);
      const vectors: VectorRecord[] = [];
      
      for (const brief of batch) {
        const embedding = await embedText(brief.content);
        const clientUuid = uuidv4();
        const briefNamespace = `client-${clientUuid}`;
        
        vectors.push({
          id: `brief-${i + batch.indexOf(brief)}-${Date.now()}`,
          values: embedding,
          metadata: {
            type: 'brief',
            filename: brief.filename,
            content: brief.content
          }
        });
        
        // Subir cada brief a su propio namespace
        await upsertToPinecone(vectors, briefNamespace);
        console.log(`✅ Subido brief ${brief.filename} al namespace: ${briefNamespace}`);
        
        // Limpiar el array para el siguiente brief
        vectors.length = 0;
      }
    }
    
    console.log('🎉 ¡Proceso completado exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Chunks procesados: ${chunks.length}`);
    console.log(`   - Briefs procesados: ${briefs.length}`);
    console.log(`   - Namespace de chunks: ${chunkNamespace}`);
    console.log(`   - Namespaces de briefs: client-{uuid} (${briefs.length} namespaces únicos)`);
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  seedPinecone();
}

export { seedPinecone, embedText, upsertToPinecone, processFiles };
