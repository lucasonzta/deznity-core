import { queryKnowledge } from '../utils/pineconeClient';
import { callAgent } from '../utils/openrouterClient';
import { 
  saveAgentTask, 
  getAgentTasks, 
  updateTaskStatus, 
  sendAgentCommunication,
  saveProjectState,
  getProjectState,
  AgentTask,
  ProjectState
} from '../utils/sharedMemory';
import { 
  logActivity, 
  logAgentActivity, 
  updateProjectMetrics
} from '../utils/supabaseLogger';
import * as fs from 'fs-extra';
import * as path from 'path';

// Interfaces
interface BootstrapPhase {
  name: string;
  description: string;
  tasks: Array<{
    id: string;
    description: string;
    agent: string;
    expectedOutput: string;
  }>;
}

// Fases del bootstrap simplificadas
const BOOTSTRAP_PHASES: BootstrapPhase[] = [
  {
    name: 'initialization',
    description: 'Inicialización del proyecto y lectura del Documento Fundacional',
    tasks: [
      {
        id: 'init-1',
        description: 'Leer Documento Fundacional desde Pinecone',
        agent: 'PM Agent',
        expectedOutput: 'Documento Fundacional leído y procesado'
      },
      {
        id: 'init-2',
        description: 'Configurar memoria compartida entre agentes',
        agent: 'PM Agent',
        expectedOutput: 'Sistema de memoria compartida configurado'
      },
      {
        id: 'init-3',
        description: 'Inicializar sistema de logging',
        agent: 'PM Agent',
        expectedOutput: 'Sistema de logging inicializado'
      }
    ]
  },
  {
    name: 'planning',
    description: 'Planificación detallada del desarrollo',
    tasks: [
      {
        id: 'plan-1',
        description: 'Crear plan detallado de 8 semanas basado en el Documento Fundacional',
        agent: 'PM Agent',
        expectedOutput: 'Plan de 8 semanas creado con tareas específicas'
      },
      {
        id: 'plan-2',
        description: 'Desarrollar estrategia de branding visual (paleta Void-Neon-Mint-Ultra-Fuchsia)',
        agent: 'UX Agent',
        expectedOutput: 'Guía de branding visual creada'
      },
      {
        id: 'plan-3',
        description: 'Crear estrategia de pricing (Starter: $297, Growth: $647, Enterprise: $1297)',
        agent: 'Sales Agent',
        expectedOutput: 'Estrategia de pricing definida'
      }
    ]
  },
  {
    name: 'development',
    description: 'Desarrollo de componentes principales',
    tasks: [
      {
        id: 'dev-1',
        description: 'Crear estructura HTML básica del portal de clientes',
        agent: 'Web Agent',
        expectedOutput: 'Portal de clientes HTML creado'
      },
      {
        id: 'dev-2',
        description: 'Desarrollar landing page principal con branding Deznity',
        agent: 'UX Agent',
        expectedOutput: 'Landing page diseñada y desarrollada'
      },
      {
        id: 'dev-3',
        description: 'Crear contenido SEO para la landing page',
        agent: 'SEO Agent',
        expectedOutput: 'Contenido SEO optimizado creado'
      }
    ]
  },
  {
    name: 'content_creation',
    description: 'Creación de contenido y materiales',
    tasks: [
      {
        id: 'content-1',
        description: 'Crear copy de marketing para el go-to-market',
        agent: 'Marketing Agent',
        expectedOutput: 'Copy de marketing creado'
      },
      {
        id: 'content-2',
        description: 'Desarrollar documentación técnica del sistema',
        agent: 'QA Agent',
        expectedOutput: 'Documentación técnica creada'
      },
      {
        id: 'content-3',
        description: 'Crear materiales de ventas y demos',
        agent: 'Sales Agent',
        expectedOutput: 'Materiales de ventas creados'
      }
    ]
  },
  {
    name: 'testing',
    description: 'Testing y validación',
    tasks: [
      {
        id: 'test-1',
        description: 'Validar funcionalidades del portal de clientes',
        agent: 'QA Agent',
        expectedOutput: 'Reporte de testing completado'
      },
      {
        id: 'test-2',
        description: 'Verificar optimización SEO de la landing page',
        agent: 'SEO Agent',
        expectedOutput: 'Auditoría SEO completada'
      }
    ]
  },
  {
    name: 'deployment',
    description: 'Preparación para despliegue',
    tasks: [
      {
        id: 'deploy-1',
        description: 'Preparar configuración de despliegue en Vercel',
        agent: 'Web Agent',
        expectedOutput: 'Configuración de despliegue lista'
      },
      {
        id: 'deploy-2',
        description: 'Crear métricas de seguimiento del proyecto',
        agent: 'Finance Agent',
        expectedOutput: 'Dashboard de métricas creado'
      }
    ]
  }
];

/**
 * Ejecuta una tarea específica
 */
async function executeTask(task: BootstrapPhase['tasks'][0], phase: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 Ejecutando: ${task.description}`);
    console.log(`   Agente: ${task.agent}`);
    
    // Guardar tarea en memoria compartida
    const taskId = await saveAgentTask({
      agent: task.agent,
      task: task.description,
      status: 'in_progress',
      dependencies: [],
      metadata: { phase, expectedOutput: task.expectedOutput }
    });

    // Obtener información relevante de Pinecone
    const knowledge = await queryKnowledge(task.description, '', 3);
    
    // Crear prompt para el agente
    const systemPrompt = `Eres el ${task.agent} de Deznity. Tu misión es ${task.description}.
    
Información relevante de la base de conocimiento:
${knowledge.map(k => `- ${k.filename}: ${k.content.substring(0, 200)}...`).join('\n')}

Documento Fundacional de Deznity:
- Misión: Democratizar presencia digital premium 10× más barata y 20× más rápida
- Visión 2027: 1 millón de PYMEs, 100M ARR, 20 empleados humanos
- Valores: Data-driven, Ethical-AI, Zero-friction, Nimbleness, Iterative, Transparency, Yield
- Stack: Supabase, Vercel, Stripe, Pinecone, Modal, n8n, OpenRouter
- Pricing: Starter $297, Growth $647, Enterprise $1297

Genera una respuesta detallada y específica para esta tarea.`;

    // Llamar al agente usando callModel directamente
    const { callModel } = await import('../utils/openrouterClient');
    const modelResponse = await callModel(
      'openai/gpt-4o',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Ejecuta la tarea: ${task.description}` }
      ]
    );

    console.log('🔍 Debug - Model response structure:', JSON.stringify(modelResponse, null, 2));
    
    const response = modelResponse.choices?.[0]?.message?.content || 'Respuesta no disponible';
    const duration = Date.now() - startTime;

    // Actualizar estado de la tarea
    await updateTaskStatus(taskId, 'completed', response);

    // Log de actividad
    await logAgentActivity({
      agent: task.agent,
      activity: task.description,
      duration_ms: duration,
      status: 'completed',
      metadata: { phase, taskId, responseLength: response.length }
    });

    console.log(`✅ Completado en ${duration}ms`);
    console.log(`   Resultado: ${response.substring(0, 100)}...`);
    console.log('');

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ Error en tarea: ${error}`);
    
    await logAgentActivity({
      agent: task.agent,
      activity: task.description,
      duration_ms: duration,
      status: 'failed',
      metadata: { phase, error: error.toString() }
    });

    throw error;
  }
}

/**
 * Ejecuta una fase del bootstrap
 */
async function executePhase(phase: BootstrapPhase): Promise<void> {
  console.log(`🎯 FASE: ${phase.name.toUpperCase()}`);
  console.log(`📝 ${phase.description}`);
  console.log('=' .repeat(60));

  try {
    // Actualizar estado del proyecto
    const currentState = await getProjectState();
    if (currentState) {
      currentState.phase = phase.name as any;
      currentState.currentTasks = phase.tasks.map(t => t.id);
      currentState.lastUpdated = new Date().toISOString();
      await saveProjectState(currentState);
    }

    // Ejecutar cada tarea de la fase
    for (const task of phase.tasks) {
      await executeTask(task, phase.name);
      
      // Pequeña pausa entre tareas
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Actualizar métricas
    await updateProjectMetrics({
      phase: phase.name,
      tasks_completed: phase.tasks.length,
      tasks_total: phase.tasks.length,
      agents_active: new Set(phase.tasks.map(t => t.agent)).size,
      errors_count: 0
    });

    console.log(`✅ Fase ${phase.name} completada exitosamente`);
    console.log('');

  } catch (error) {
    console.error(`❌ Error en fase ${phase.name}:`, error);
    throw error;
  }
}

/**
 * Función principal de bootstrap
 */
async function bootstrapDeznity(): Promise<void> {
  console.log('🚀 INICIANDO BOOTSTRAP DE DEZNITY');
  console.log('=====================================');
  console.log('Self-Building AI Growth Engine');
  console.log('');

  try {
    // Estado inicial del proyecto
    const initialState: ProjectState = {
      phase: 'initialization',
      currentTasks: [],
      completedTasks: [],
      blockers: [],
      nextActions: ['Inicializar sistema', 'Leer Documento Fundacional'],
      lastUpdated: new Date().toISOString()
    };

    await saveProjectState(initialState);
    await logActivity({
      level: 'info',
      agent: 'Bootstrap System',
      action: 'start',
      message: 'Sistema de bootstrap iniciado',
      phase: 'initialization'
    });

    // Verificar que el Documento Fundacional está disponible
    console.log('📖 Verificando Documento Fundacional...');
    const fundacionalDoc = await queryKnowledge('Documento Fundacional DEZNITY', '', 1);
    
    if (fundacionalDoc.length === 0) {
      throw new Error('❌ Documento Fundacional no encontrado en Pinecone. Ejecuta: npm run seed:pinecone');
    }

    console.log(`✅ Documento Fundacional encontrado: ${fundacionalDoc[0].filename}`);
    console.log('');

    // Ejecutar cada fase
    for (const phase of BOOTSTRAP_PHASES) {
      await executePhase(phase);
    }

    // Estado final
    const finalState: ProjectState = {
      phase: 'completed',
      currentTasks: [],
      completedTasks: BOOTSTRAP_PHASES.flatMap(p => p.tasks.map(t => t.id)),
      blockers: [],
      nextActions: ['Monitorear sistema', 'Optimizar rendimiento'],
      lastUpdated: new Date().toISOString()
    };

    await saveProjectState(finalState);

    console.log('🎉 ¡BOOTSTRAP DE DEZNITY COMPLETADO!');
    console.log('=====================================');
    console.log(`✅ Fases completadas: ${BOOTSTRAP_PHASES.length}`);
    console.log(`✅ Tareas totales: ${BOOTSTRAP_PHASES.flatMap(p => p.tasks).length}`);
    console.log(`✅ Agentes utilizados: ${new Set(BOOTSTRAP_PHASES.flatMap(p => p.tasks.map(t => t.agent))).size}`);
    console.log('');
    console.log('🚀 Deznity está listo para operar!');
    console.log('   "La única agencia digital que se construye a sí misma"');

  } catch (error) {
    console.error('❌ Error en bootstrap:', error);
    
    await logActivity({
      level: 'error',
      agent: 'Bootstrap System',
      action: 'error',
      message: `Error en bootstrap: ${error}`,
      phase: 'error'
    });

    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  bootstrapDeznity();
}

export { bootstrapDeznity, BOOTSTRAP_PHASES };
