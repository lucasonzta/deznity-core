import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Interfaces
interface LogEntry {
  id?: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  agent: string;
  action: string;
  message: string;
  data?: any;
  phase: string;
  task_id?: string;
}

interface AgentActivity {
  id?: string;
  agent: string;
  activity: string;
  duration_ms: number;
  status: 'started' | 'completed' | 'failed';
  timestamp: string;
  metadata?: any;
}

interface ProjectMetrics {
  id?: string;
  phase: string;
  tasks_completed: number;
  tasks_total: number;
  agents_active: number;
  errors_count: number;
  timestamp: string;
}

// Configuración
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Validar variables de entorno
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  Supabase no configurado. Los logs se guardarán solo localmente.');
}

// Inicializar cliente Supabase
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Guarda un log en Supabase
 */
export async function logActivity(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase
        .from('agent_logs')
        .insert([logEntry]);

      if (error) {
        console.error('❌ Error guardando log en Supabase:', error);
      } else {
        console.log(`📝 Log guardado: ${entry.agent} - ${entry.action}`);
      }
    } else {
      // Fallback: guardar localmente
      console.log(`📝 [${entry.level.toUpperCase()}] ${entry.agent}: ${entry.message}`);
    }

  } catch (error) {
    console.error('❌ Error en logging:', error);
  }
}

/**
 * Registra actividad de un agente
 */
export async function logAgentActivity(activity: Omit<AgentActivity, 'id' | 'timestamp'>): Promise<void> {
  try {
    const agentActivity: AgentActivity = {
      ...activity,
      timestamp: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase
        .from('agent_activities')
        .insert([agentActivity]);

      if (error) {
        console.error('❌ Error guardando actividad:', error);
      }
    }

    console.log(`🤖 ${activity.agent}: ${activity.activity} (${activity.duration_ms}ms)`);

  } catch (error) {
    console.error('❌ Error registrando actividad:', error);
  }
}

/**
 * Actualiza métricas del proyecto
 */
export async function updateProjectMetrics(metrics: Omit<ProjectMetrics, 'id' | 'timestamp'>): Promise<void> {
  try {
    const projectMetrics: ProjectMetrics = {
      ...metrics,
      timestamp: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase
        .from('project_metrics')
        .insert([projectMetrics]);

      if (error) {
        console.error('❌ Error guardando métricas:', error);
      }
    }

    console.log(`📊 Métricas actualizadas: ${metrics.tasks_completed}/${metrics.tasks_total} tareas completadas`);

  } catch (error) {
    console.error('❌ Error actualizando métricas:', error);
  }
}

/**
 * Obtiene logs de un agente específico
 */
export async function getAgentLogs(agent: string, limit: number = 50): Promise<LogEntry[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('agent_logs')
        .select('*')
        .eq('agent', agent)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo logs:', error);
        return [];
      }

      return data || [];
    }

    return [];

  } catch (error) {
    console.error('❌ Error obteniendo logs:', error);
    return [];
  }
}

/**
 * Obtiene métricas del proyecto
 */
export async function getProjectMetrics(limit: number = 20): Promise<ProjectMetrics[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('project_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo métricas:', error);
        return [];
      }

      return data || [];
    }

    return [];

  } catch (error) {
    console.error('❌ Error obteniendo métricas:', error);
    return [];
  }
}

/**
 * Crea las tablas necesarias en Supabase (ejecutar una vez)
 */
export async function createTables(): Promise<void> {
  if (!supabase) {
    console.log('⚠️  Supabase no configurado. Saltando creación de tablas.');
    return;
  }

  try {
    console.log('🔧 Creando tablas en Supabase...');

    // SQL para crear las tablas
    const createTablesSQL = `
      -- Tabla de logs de agentes
      CREATE TABLE IF NOT EXISTS agent_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        level TEXT NOT NULL,
        agent TEXT NOT NULL,
        action TEXT NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        phase TEXT NOT NULL,
        task_id TEXT
      );

      -- Tabla de actividades de agentes
      CREATE TABLE IF NOT EXISTS agent_activities (
        id SERIAL PRIMARY KEY,
        agent TEXT NOT NULL,
        activity TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        status TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB
      );

      -- Tabla de métricas del proyecto
      CREATE TABLE IF NOT EXISTS project_metrics (
        id SERIAL PRIMARY KEY,
        phase TEXT NOT NULL,
        tasks_completed INTEGER NOT NULL,
        tasks_total INTEGER NOT NULL,
        agents_active INTEGER NOT NULL,
        errors_count INTEGER NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Índices para mejor rendimiento
      CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_logs(agent);
      CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_agent_activities_agent ON agent_activities(agent);
      CREATE INDEX IF NOT EXISTS idx_project_metrics_phase ON project_metrics(phase);
    `;

    // Ejecutar SQL (esto requiere permisos de administrador en Supabase)
    console.log('📋 SQL para crear tablas:');
    console.log(createTablesSQL);
    console.log('');
    console.log('⚠️  Ejecuta este SQL en el editor SQL de Supabase para crear las tablas.');

  } catch (error) {
    console.error('❌ Error creando tablas:', error);
  }
}

export { LogEntry, AgentActivity, ProjectMetrics };
