import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Interfaces
interface QueryResult {
  id: string;
  score: number;
  metadata: {
    type: 'chunk' | 'brief';
    filename: string;
    content: string;
  };
}

interface KnowledgeChunk {
  id: string;
  content: string;
  filename: string;
  type: 'chunk' | 'brief';
  score: number;
}

interface DecisionRecord {
  id: string;
  content: string;
  agent: string;
  timestamp: string;
  metadata: Record<string, any>;
}

// Configuración
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'deznity-core';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Validar variables de entorno
if (!PINECONE_API_KEY || !OPENAI_API_KEY) {
  throw new Error('Faltan variables de entorno requeridas: PINECONE_API_KEY, OPENAI_API_KEY');
}

// Inicializar clientes
const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Genera embedding para un texto usando OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
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
 * Consulta la base de conocimiento y devuelve los chunks más relevantes
 */
export async function queryKnowledge(
  query: string,
  namespace: string = '',
  topK: number = 5
): Promise<KnowledgeChunk[]> {
  try {
    console.log(`🔍 Consultando conocimiento en namespace: ${namespace}`);
    console.log(`📝 Query: "${query}"`);
    
    // Generar embedding para la consulta
    const queryEmbedding = await generateEmbedding(query);
    
    // Consultar Pinecone
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true
    });
    
    // Procesar resultados
    const results: KnowledgeChunk[] = (queryResponse.matches || []).map(match => ({
      id: match.id,
      content: match.metadata?.content || '',
      filename: match.metadata?.filename || '',
      type: match.metadata?.type || 'chunk',
      score: match.score || 0
    }));
    
    console.log(`✅ Encontrados ${results.length} chunks relevantes`);
    results.forEach((chunk, index) => {
      console.log(`   ${index + 1}. ${chunk.filename} (score: ${chunk.score.toFixed(3)})`);
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Error consultando conocimiento:', error);
    throw error;
  }
}

/**
 * Guarda una decisión o output en el namespace del cliente
 */
export async function saveDecision(
  text: string,
  namespace: string,
  agent: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    console.log(`💾 Guardando decisión de ${agent} en namespace: ${namespace}`);
    
    // Generar embedding para el texto
    const embedding = await generateEmbedding(text);
    
    // Crear registro de decisión
    const decisionRecord: DecisionRecord = {
      id: `decision-${agent}-${Date.now()}`,
      content: text,
      agent,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    // Crear vector para Pinecone
    const vector = {
      id: decisionRecord.id,
      values: embedding,
      metadata: {
        type: 'decision',
        agent,
        content: text,
        timestamp: decisionRecord.timestamp,
        ...metadata
      }
    };
    
    // Subir a Pinecone
    const index = pinecone.index(PINECONE_INDEX_NAME);
    await index.upsert([vector], { namespace });
    
    console.log(`✅ Decisión guardada: ${decisionRecord.id}`);
    
  } catch (error) {
    console.error('❌ Error guardando decisión:', error);
    throw error;
  }
}

/**
 * Obtiene el brief de un cliente desde Pinecone
 */
export async function getClientBrief(clientNamespace: string): Promise<KnowledgeChunk | null> {
  try {
    console.log(`📋 Obteniendo brief del cliente: ${clientNamespace}`);
    
    // Buscar briefs en el namespace del cliente
    const results = await queryKnowledge('brief cliente proyecto', clientNamespace, 1);
    
    if (results.length === 0) {
      console.log(`⚠️  No se encontró brief en el namespace: ${clientNamespace}`);
      return null;
    }
    
    const brief = results[0];
    console.log(`✅ Brief encontrado: ${brief.filename}`);
    
    return brief;
    
  } catch (error) {
    console.error('❌ Error obteniendo brief del cliente:', error);
    throw error;
  }
}

/**
 * Busca plantillas o templates en la base de conocimiento
 */
export async function findTemplates(query: string = 'plantillas templates'): Promise<KnowledgeChunk[]> {
  try {
    console.log(`🔍 Buscando plantillas: "${query}"`);
    
    const results = await queryKnowledge(query, 'deznity-core', 3);
    
    console.log(`✅ Encontradas ${results.length} plantillas`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error buscando plantillas:', error);
    throw error;
  }
}

/**
 * Busca información específica sobre agentes o procesos
 */
export async function findAgentInfo(agentType: string): Promise<KnowledgeChunk[]> {
  try {
    console.log(`🤖 Buscando información del agente: ${agentType}`);
    
    const query = `agente ${agentType} proceso workflow`;
    const results = await queryKnowledge(query, 'deznity-core', 3);
    
    console.log(`✅ Encontrada información para ${agentType}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error buscando información del agente:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de decisiones de un cliente
 */
export async function getClientHistory(clientNamespace: string, limit: number = 10): Promise<DecisionRecord[]> {
  try {
    console.log(`📚 Obteniendo historial del cliente: ${clientNamespace}`);
    
    // Buscar decisiones en el namespace del cliente
    const results = await queryKnowledge('decisión output resultado', clientNamespace, limit);
    
    const history: DecisionRecord[] = results
      .filter(chunk => chunk.type === 'decision')
      .map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        agent: chunk.metadata?.agent || 'unknown',
        timestamp: chunk.metadata?.timestamp || new Date().toISOString(),
        metadata: chunk.metadata || {}
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    console.log(`✅ Historial obtenido: ${history.length} decisiones`);
    
    return history;
    
  } catch (error) {
    console.error('❌ Error obteniendo historial del cliente:', error);
    throw error;
  }
}

export { KnowledgeChunk, DecisionRecord, QueryResult };
