import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Interfaces
interface AgentTask {
  id: string;
  agent: string;
  task: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

interface AgentCommunication {
  id: string;
  fromAgent: string;
  toAgent: string;
  message: string;
  type: 'request' | 'response' | 'notification' | 'data';
  data?: any;
  timestamp: string;
}

interface ProjectState {
  phase: 'initialization' | 'planning' | 'development' | 'testing' | 'deployment' | 'completed';
  currentTasks: string[];
  completedTasks: string[];
  blockers: string[];
  nextActions: string[];
  lastUpdated: string;
}

// Configuración
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'deznity-core';

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
 * Genera embedding para un texto
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
 * Guarda una tarea de agente en la memoria compartida
 */
export async function saveAgentTask(task: Omit<AgentTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const taskId = `task-${task.agent}-${Date.now()}`;
    const fullTask: AgentTask = {
      ...task,
      id: taskId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const embedding = await generateEmbedding(`${task.agent}: ${task.task}`);
    
    const vector = {
      id: taskId,
      values: embedding,
      metadata: {
        type: 'agent_task',
        agent: task.agent,
        task: task.task,
        status: task.status,
        result: task.result || '',
        dependencies: JSON.stringify(task.dependencies),
        createdAt: fullTask.createdAt,
        updatedAt: fullTask.updatedAt,
        metadata: JSON.stringify(task.metadata)
      }
    };

    const index = pinecone.index(PINECONE_INDEX_NAME);
    await index.upsert([vector], { namespace: 'agent_tasks' });

    console.log(`💾 Tarea guardada: ${taskId} (${task.agent})`);
    return taskId;

  } catch (error) {
    console.error('❌ Error guardando tarea:', error);
    throw error;
  }
}

/**
 * Obtiene tareas pendientes para un agente
 */
export async function getAgentTasks(agent: string, status?: string): Promise<AgentTask[]> {
  try {
    const query = `tarea ${agent} ${status || 'pendiente'}`;
    const embedding = await generateEmbedding(query);
    
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const queryResponse = await index.namespace('agent_tasks').query({
      vector: embedding,
      topK: 10,
      includeMetadata: true,
      filter: {
        agent: { $eq: agent },
        ...(status && { status: { $eq: status } })
      }
    });

    const tasks: AgentTask[] = (queryResponse.matches || []).map(match => ({
      id: match.id,
      agent: match.metadata?.agent || '',
      task: match.metadata?.task || '',
      status: match.metadata?.status || 'pending',
      result: match.metadata?.result || '',
      dependencies: JSON.parse(match.metadata?.dependencies || '[]'),
      createdAt: match.metadata?.createdAt || '',
      updatedAt: match.metadata?.updatedAt || '',
      metadata: JSON.parse(match.metadata?.metadata || '{}')
    }));

    return tasks;

  } catch (error) {
    console.error('❌ Error obteniendo tareas:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de una tarea
 */
export async function updateTaskStatus(taskId: string, status: string, result?: string): Promise<void> {
  try {
    // Obtener la tarea actual
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const queryResponse = await index.namespace('agent_tasks').query({
      id: taskId,
      topK: 1,
      includeMetadata: true
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const match = queryResponse.matches[0];
      const updatedMetadata = {
        ...match.metadata,
        status,
        result: result || match.metadata?.result || '',
        updatedAt: new Date().toISOString()
      };

      const updatedVector = {
        id: taskId,
        values: match.values || [],
        metadata: updatedMetadata
      };

      await index.upsert([updatedVector], { namespace: 'agent_tasks' });
      console.log(`✅ Tarea actualizada: ${taskId} -> ${status}`);
    }

  } catch (error) {
    console.error('❌ Error actualizando tarea:', error);
    throw error;
  }
}

/**
 * Envía comunicación entre agentes
 */
export async function sendAgentCommunication(communication: Omit<AgentCommunication, 'id' | 'timestamp'>): Promise<string> {
  try {
    const commId = `comm-${communication.fromAgent}-${communication.toAgent}-${Date.now()}`;
    const fullComm: AgentCommunication = {
      ...communication,
      id: commId,
      timestamp: new Date().toISOString()
    };

    const embedding = await generateEmbedding(`${communication.fromAgent} -> ${communication.toAgent}: ${communication.message}`);
    
    const vector = {
      id: commId,
      values: embedding,
      metadata: {
        type: 'agent_communication',
        fromAgent: communication.fromAgent,
        toAgent: communication.toAgent,
        message: communication.message,
        commType: communication.type,
        data: communication.data ? JSON.stringify(communication.data) : '',
        timestamp: fullComm.timestamp
      }
    };

    const index = pinecone.index(PINECONE_INDEX_NAME);
    await index.upsert([vector], { namespace: 'agent_communications' });

    console.log(`📨 Comunicación enviada: ${communication.fromAgent} -> ${communication.toAgent}`);
    return commId;

  } catch (error) {
    console.error('❌ Error enviando comunicación:', error);
    throw error;
  }
}

/**
 * Obtiene comunicaciones para un agente
 */
export async function getAgentCommunications(agent: string): Promise<AgentCommunication[]> {
  try {
    const query = `comunicación ${agent}`;
    const embedding = await generateEmbedding(query);
    
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const queryResponse = await index.namespace('agent_communications').query({
      vector: embedding,
      topK: 20,
      includeMetadata: true,
      filter: {
        $or: [
          { fromAgent: { $eq: agent } },
          { toAgent: { $eq: agent } }
        ]
      }
    });

    const communications: AgentCommunication[] = (queryResponse.matches || []).map(match => ({
      id: match.id,
      fromAgent: match.metadata?.fromAgent || '',
      toAgent: match.metadata?.toAgent || '',
      message: match.metadata?.message || '',
      type: match.metadata?.commType || 'notification',
      data: match.metadata?.data ? JSON.parse(match.metadata.data) : undefined,
      timestamp: match.metadata?.timestamp || ''
    }));

    return communications;

  } catch (error) {
    console.error('❌ Error obteniendo comunicaciones:', error);
    throw error;
  }
}

/**
 * Guarda el estado del proyecto
 */
export async function saveProjectState(state: ProjectState): Promise<void> {
  try {
    const stateId = `project-state-${Date.now()}`;
    const embedding = await generateEmbedding(`estado proyecto ${state.phase}`);
    
    const vector = {
      id: stateId,
      values: embedding,
      metadata: {
        type: 'project_state',
        phase: state.phase,
        currentTasks: JSON.stringify(state.currentTasks),
        completedTasks: JSON.stringify(state.completedTasks),
        blockers: JSON.stringify(state.blockers),
        nextActions: JSON.stringify(state.nextActions),
        lastUpdated: state.lastUpdated
      }
    };

    const index = pinecone.index(PINECONE_INDEX_NAME);
    await index.upsert([vector], { namespace: 'project_state' });

    console.log(`📊 Estado del proyecto guardado: ${state.phase}`);

  } catch (error) {
    console.error('❌ Error guardando estado del proyecto:', error);
    throw error;
  }
}

/**
 * Obtiene el estado actual del proyecto
 */
export async function getProjectState(): Promise<ProjectState | null> {
  try {
    const query = 'estado proyecto actual';
    const embedding = await generateEmbedding(query);
    
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const queryResponse = await index.namespace('project_state').query({
      vector: embedding,
      topK: 1,
      includeMetadata: true
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const match = queryResponse.matches[0];
      return {
        phase: match.metadata?.phase || 'initialization',
        currentTasks: JSON.parse(match.metadata?.currentTasks || '[]'),
        completedTasks: JSON.parse(match.metadata?.completedTasks || '[]'),
        blockers: JSON.parse(match.metadata?.blockers || '[]'),
        nextActions: JSON.parse(match.metadata?.nextActions || '[]'),
        lastUpdated: match.metadata?.lastUpdated || new Date().toISOString()
      };
    }

    return null;

  } catch (error) {
    console.error('❌ Error obteniendo estado del proyecto:', error);
    throw error;
  }
}

export { AgentTask, AgentCommunication, ProjectState };
