import { Crew, Agent, Task, CrewAI } from 'crewai';
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
  updateProjectMetrics,
  createTables 
} from '../utils/supabaseLogger';
import * as fs from 'fs-extra';
import * as path from 'path';

// Interfaces
interface DeznityAgent {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools: string[];
  model: string;
}

interface BootstrapPhase {
  name: string;
  description: string;
  tasks: string[];
  agents: string[];
  dependencies: string[];
}

// Configuración de agentes basada en el Documento Fundacional
const DEZNITY_AGENTS: DeznityAgent[] = [
  {
    name: 'PM Agent',
    role: 'Project Manager',
    goal: 'Planificar y coordinar el desarrollo de Deznity siguiendo el roadmap de 8 semanas',
    backstory: 'Eres el PM Agent de Deznity, experto en gestión de proyectos de startups tecnológicas. Tu misión es coordinar a todos los agentes para construir el Self-Building AI Growth Engine.',
    tools: ['pinecone_memory', 'task_coordination'],
    model: 'openai/gpt-4o'
  },
  {
    name: 'Web Agent',
    goal: 'Desarrollar la infraestructura web y el portal de clientes de Deznity',
    backstory: 'Eres el Web Agent de Deznity, especialista en desarrollo web con Next.js, Webflow y Vercel. Construyes la base técnica del producto.',
    tools: ['web_development', 'template_creation'],
    model: 'openai/gpt-4o'
  },
  {
    name: 'UX Agent',
    goal: 'Diseñar la experiencia de usuario y el branding visual de Deznity',
    backstory: 'Eres el UX Agent de Deznity, diseñador experto en UX/UI. Creas el branding visual con la paleta Void-Neon-Mint-Ultra-Fuchsia.',
    tools: ['ui_design', 'branding', 'figma'],
    model: 'openai/gpt-4o'
  },
  {
    name: 'SEO Agent',
    goal: 'Crear contenido SEO y copy optimizado para el go-to-market de Deznity',
    backstory: 'Eres el SEO Agent de Deznity, especialista en marketing de contenidos y SEO. Desarrollas la estrategia de contenido para el crecimiento.',
    tools: ['content_creation', 'seo_optimization'],
    model: 'openai/gpt-4o'
  },
  {
    name: 'QA Agent',
    goal: 'Validar y asegurar la calidad de todos los entregables de Deznity',
    backstory: 'Eres el QA Agent de Deznity, especialista en testing y calidad. Aseguras que todos los componentes cumplan con los estándares.',
    tools: ['testing', 'quality_assurance'],
    model: 'openai/gpt-4o-mini'
  },
  {
    name: 'Marketing Agent',
    goal: 'Desarrollar la estrategia de marketing y go-to-market de Deznity',
    backstory: 'Eres el Marketing Agent de Deznity, experto en growth marketing. Desarrollas campañas, landing pages y estrategias de adquisición.',
    tools: ['marketing_strategy', 'campaign_creation'],
    model: 'openai/gpt-4o'
  },
  {
    name: 'Sales Agent',
    goal: 'Crear el proceso de ventas y pricing de Deznity',
    backstory: 'Eres el Sales Agent de Deznity, especialista en ventas B2B SaaS. Desarrollas el proceso de ventas y demos para los clientes.',
    tools: ['sales_process', 'pricing_strategy'],
    model: 'openai/gpt-4o'
  },
  {
    name: 'Finance Agent',
    goal: 'Gestionar las finanzas y métricas de Deznity',
    backstory: 'Eres el Finance Agent de Deznity, experto en finanzas de startups. Monitreas el cashflow, MRR y métricas clave.',
    tools: ['financial_modeling', 'metrics_tracking'],
    model: 'openai/gpt-4o'
  },
  {
    name: 'Strategy Agent',
    goal: 'Desarrollar la estrategia de negocio y análisis de mercado de Deznity',
    backstory: 'Eres el Strategy Agent de Deznity, consultor estratégico. Analizas el mercado, competencia y desarrollas la estrategia de crecimiento.',
    tools: ['market_analysis', 'strategy_development'],
    model: 'openai/gpt-4o'
  }
];

// Fases del bootstrap basadas en el Documento Fundacional
const BOOTSTRAP_PHASES: BootstrapPhase[] = [
  {
    name: 'initialization',
    description: 'Inicialización del proyecto y lectura del Documento Fundacional',
    tasks: [
      'Leer Documento Fundacional desde Pinecone',
      'Configurar memoria compartida entre agentes',
      'Inicializar sistema de logging',
      'Crear estructura de proyecto inicial'
    ],
    agents: ['PM Agent'],
    dependencies: []
  },
  {
    name: 'planning',
    description: 'Planificación detallada del desarrollo siguiendo el roadmap de 8 semanas',
    tasks: [
      'Crear plan detallado de 8 semanas',
      'Definir tareas específicas para cada agente',
      'Establecer dependencias entre tareas',
      'Configurar métricas de seguimiento'
    ],
    agents: ['PM Agent', 'Strategy Agent'],
    dependencies: ['initialization']
  },
  {
    name: 'development',
    description: 'Desarrollo de la infraestructura y componentes principales',
    tasks: [
      'Desarrollar portal de clientes',
      'Crear sistema de autenticación',
      'Implementar dashboard de agentes',
      'Desarrollar API de integración'
    ],
    agents: ['Web Agent', 'UX Agent', 'QA Agent'],
    dependencies: ['planning']
  },
  {
    name: 'content_creation',
    description: 'Creación de contenido y materiales de marketing',
    tasks: [
      'Crear landing page principal',
      'Desarrollar contenido SEO',
      'Crear materiales de marketing',
      'Desarrollar documentación'
    ],
    agents: ['SEO Agent', 'Marketing Agent', 'UX Agent'],
    dependencies: ['development']
  },
  {
    name: 'testing',
    description: 'Testing y validación de todos los componentes',
    tasks: [
      'Testing end-to-end del sistema',
      'Validación de funcionalidades',
      'Testing de integración',
      'Optimización de rendimiento'
    ],
    agents: ['QA Agent', 'Web Agent'],
    dependencies: ['content_creation']
  },
  {
    name: 'deployment',
    description: 'Despliegue y configuración del sistema en producción',
    tasks: [
      'Configurar infraestructura de producción',
      'Desplegar aplicación en Vercel',
      'Configurar monitoreo y alertas',
      'Preparar documentación de despliegue'
    ],
    agents: ['Web Agent', 'PM Agent'],
    dependencies: ['testing']
  }
];

/**
 * Inicializa el sistema de bootstrap
 */
async function initializeBootstrap(): Promise<void> {
  console.log('🚀 Iniciando Bootstrap de Deznity');
  console.log('=====================================');
  console.log('');

  try {
    // Crear tablas en Supabase
    await createTables();

    // Leer Documento Fundacional
    console.log('📖 Leyendo Documento Fundacional...');
    const fundacionalDoc = await queryKnowledge('Documento Fundacional DEZNITY self-building AI growth engine', '', 1);
    
    if (fundacionalDoc.length === 0) {
      throw new Error('No se encontró el Documento Fundacional en Pinecone');
    }

    console.log(`✅ Documento Fundacional encontrado: ${fundacionalDoc[0].filename}`);
    
    // Guardar estado inicial del proyecto
    const initialState: ProjectState = {
      phase: 'initialization',
      currentTasks: ['Leer Documento Fundacional'],
      completedTasks: [],
      blockers: [],
      nextActions: ['Configurar agentes', 'Iniciar planificación'],
      lastUpdated: new Date().toISOString()
    };

    await saveProjectState(initialState);
    await logActivity({
      level: 'info',
      agent: 'Bootstrap System',
      action: 'initialization',
      message: 'Sistema de bootstrap inicializado',
      phase: 'initialization'
    });

    console.log('✅ Sistema inicializado correctamente');
    console.log('');

  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    throw error;
  }
}

/**
 * Crea un agente de CrewAI
 */
function createCrewAIAgent(agentConfig: DeznityAgent): Agent {
  return new Agent({
    role: agentConfig.role,
    goal: agentConfig.goal,
    backstory: agentConfig.backstory,
    verbose: true,
    allow_delegation: false,
    // Usar nuestro sistema de OpenRouter
    llm: {
      model: agentConfig.model,
      temperature: 0.7
    }
  });
}

/**
 * Ejecuta una fase del bootstrap
 */
async function executePhase(phase: BootstrapPhase): Promise<void> {
  console.log(`🎯 Ejecutando fase: ${phase.name.toUpperCase()}`);
  console.log(`📝 ${phase.description}`);
  console.log('-'.repeat(50));

  try {
    // Crear agentes para esta fase
    const phaseAgents = DEZNITY_AGENTS.filter(agent => 
      phase.agents.includes(agent.name)
    );

    const crewAgents = phaseAgents.map(createCrewAIAgent);

    // Crear tareas para esta fase
    const tasks = phase.tasks.map((task, index) => {
      const assignedAgent = phaseAgents[index % phaseAgents.length];
      
      return new Task({
        description: task,
        agent: crewAgents[index % crewAgents.length],
        expected_output: `Tarea completada: ${task}`,
        async: true
      });
    });

    // Crear crew
    const crew = new Crew({
      agents: crewAgents,
      tasks: tasks,
      verbose: true
    });

    // Ejecutar crew
    console.log(`🔄 Ejecutando ${tasks.length} tareas con ${crewAgents.length} agentes...`);
    
    const startTime = Date.now();
    const result = await crew.kickoff();
    const duration = Date.now() - startTime;

    // Log de resultados
    await logActivity({
      level: 'info',
      agent: 'Bootstrap System',
      action: 'phase_completion',
      message: `Fase ${phase.name} completada`,
      phase: phase.name,
      data: { duration_ms: duration, tasks_completed: tasks.length }
    });

    console.log(`✅ Fase ${phase.name} completada en ${duration}ms`);
    console.log('');

  } catch (error) {
    console.error(`❌ Error en fase ${phase.name}:`, error);
    
    await logActivity({
      level: 'error',
      agent: 'Bootstrap System',
      action: 'phase_error',
      message: `Error en fase ${phase.name}: ${error}`,
      phase: phase.name
    });

    throw error;
  }
}

/**
 * Función principal de bootstrap
 */
async function bootstrapDeznity(): Promise<void> {
  try {
    // Inicializar sistema
    await initializeBootstrap();

    // Ejecutar cada fase
    for (const phase of BOOTSTRAP_PHASES) {
      await executePhase(phase);
      
      // Actualizar estado del proyecto
      const currentState = await getProjectState();
      if (currentState) {
        currentState.phase = phase.name as any;
        currentState.completedTasks.push(...phase.tasks);
        currentState.lastUpdated = new Date().toISOString();
        
        await saveProjectState(currentState);
      }

      // Pequeña pausa entre fases
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Estado final
    const finalState: ProjectState = {
      phase: 'completed',
      currentTasks: [],
      completedTasks: BOOTSTRAP_PHASES.flatMap(p => p.tasks),
      blockers: [],
      nextActions: ['Monitorear sistema', 'Optimizar rendimiento'],
      lastUpdated: new Date().toISOString()
    };

    await saveProjectState(finalState);

    console.log('🎉 ¡BOOTSTRAP DE DEZNITY COMPLETADO!');
    console.log('=====================================');
    console.log(`✅ Fases completadas: ${BOOTSTRAP_PHASES.length}`);
    console.log(`✅ Tareas totales: ${BOOTSTRAP_PHASES.flatMap(p => p.tasks).length}`);
    console.log(`✅ Agentes utilizados: ${DEZNITY_AGENTS.length}`);
    console.log('');
    console.log('🚀 Deznity está listo para operar!');

  } catch (error) {
    console.error('❌ Error en bootstrap:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  bootstrapDeznity();
}

export { bootstrapDeznity, DEZNITY_AGENTS, BOOTSTRAP_PHASES };
