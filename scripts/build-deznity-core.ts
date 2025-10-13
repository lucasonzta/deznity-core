import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { callModel } from '../utils/openrouterClient';
import { queryKnowledge, saveDecision } from '../utils/pineconeClient';
import { logAgentActivity } from '../utils/supabaseLogger';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_URL y SUPABASE_ANON_KEY son requeridos en .env');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface DeznityTask {
  agent: string;
  phase: string;
  description: string;
  focus: string;
  expectedOutput: string;
}

interface DeznityImprovement {
  area: string;
  currentState: string;
  proposedImprovement: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

class DeznityCoreBuilder {
  private projectId: string;
  private sessionId: string;
  private improvements: DeznityImprovement[] = [];

  constructor() {
    this.projectId = `deznity-core-${uuidv4().substring(0, 8)}`;
    this.sessionId = `session-${Date.now()}`;
    
    console.log('🏗️ CONSTRUCTOR DEL CORAZÓN DE DEZNITY');
    console.log('=====================================');
    console.log(`Proyecto ID: ${this.projectId}`);
    console.log(`Sesión ID: ${this.sessionId}`);
    console.log('');
  }

  async build(): Promise<void> {
    try {
      // 1. Análisis del estado actual
      await this.analyzeCurrentState();
      
      // 2. Consulta de memoria y mejoras
      await this.consultMemoryAndImprovements();
      
      // 3. Construcción de arquitectura core
      await this.buildCoreArchitecture();
      
      // 4. Implementación de mejoras críticas
      await this.implementCriticalImprovements();
      
      // 5. Validación y testing
      await this.validateAndTest();
      
      // 6. Documentación y roadmap
      await this.documentAndRoadmap();

      console.log('🎉 ¡CONSTRUCCIÓN DEL CORAZÓN DE DEZNITY COMPLETADA!');
      console.log('==================================================');
      console.log(`✅ Proyecto ID: ${this.projectId}`);
      console.log(`✅ Mejoras identificadas: ${this.improvements.length}`);
      console.log(`✅ Sesión ID: ${this.sessionId}`);

    } catch (error: any) {
      console.error('❌ Error en construcción de Deznity:', error.message);
      throw error;
    }
  }

  private async analyzeCurrentState(): Promise<void> {
    console.log('🔍 FASE: ANÁLISIS DEL ESTADO ACTUAL');
    console.log('===================================');
    
    const tasks: DeznityTask[] = [
      {
        agent: 'Strategy Agent',
        phase: 'analysis',
        description: 'Analizar el estado actual del sistema Deznity y identificar fortalezas y debilidades',
        focus: 'Arquitectura actual, performance, escalabilidad',
        expectedOutput: 'Reporte detallado del estado actual con métricas'
      },
      {
        agent: 'PM Agent',
        phase: 'analysis',
        description: 'Evaluar la estructura del proyecto y organización del código',
        focus: 'Estructura de archivos, modularidad, mantenibilidad',
        expectedOutput: 'Análisis de arquitectura y recomendaciones de mejora'
      },
      {
        agent: 'QA Agent',
        phase: 'analysis',
        description: 'Auditar la calidad del código y cobertura de testing',
        focus: 'Calidad de código, testing, documentación',
        expectedOutput: 'Reporte de calidad y plan de mejoras'
      }
    ];

    for (const task of tasks) {
      await this.executeDeznityTask(task);
    }
  }

  private async consultMemoryAndImprovements(): Promise<void> {
    console.log('\n🧠 FASE: CONSULTA DE MEMORIA Y MEJORAS');
    console.log('=====================================');
    
    const tasks: DeznityTask[] = [
      {
        agent: 'Strategy Agent',
        phase: 'memory_consultation',
        description: 'Consultar memoria Pinecone para identificar patrones de mejora en proyectos anteriores',
        focus: 'Patrones de éxito, errores comunes, optimizaciones',
        expectedOutput: 'Lista de mejoras basadas en experiencia previa'
      },
      {
        agent: 'PM Agent',
        phase: 'memory_consultation',
        description: 'Analizar el Documento Fundacional para alinear mejoras con la visión',
        focus: 'Misión, visión, valores, roadmap, métricas objetivo',
        expectedOutput: 'Mejoras alineadas con la visión de Deznity'
      },
      {
        agent: 'UX Agent',
        phase: 'memory_consultation',
        description: 'Identificar mejoras en la experiencia de usuario del sistema',
        focus: 'UX de agentes, flujos de trabajo, interfaces',
        expectedOutput: 'Mejoras de UX para el sistema core'
      }
    ];

    for (const task of tasks) {
      await this.executeDeznityTask(task);
    }
  }

  private async buildCoreArchitecture(): Promise<void> {
    console.log('\n🏗️ FASE: CONSTRUCCIÓN DE ARQUITECTURA CORE');
    console.log('=========================================');
    
    const tasks: DeznityTask[] = [
      {
        agent: 'Web Agent',
        phase: 'architecture',
        description: 'Diseñar la arquitectura modular del sistema core de Deznity',
        focus: 'Modularidad, escalabilidad, mantenibilidad',
        expectedOutput: 'Arquitectura modular con interfaces claras'
      },
      {
        agent: 'UX Agent',
        phase: 'architecture',
        description: 'Crear el sistema de design tokens y componentes base',
        focus: 'Design system, tokens, componentes reutilizables',
        expectedOutput: 'Sistema de diseño completo para Deznity'
      },
      {
        agent: 'SEO Agent',
        phase: 'architecture',
        description: 'Diseñar el sistema de documentación y knowledge base',
        focus: 'Documentación técnica, API docs, guías',
        expectedOutput: 'Sistema de documentación estructurado'
      }
    ];

    for (const task of tasks) {
      await this.executeDeznityTask(task);
    }
  }

  private async implementCriticalImprovements(): Promise<void> {
    console.log('\n⚡ FASE: IMPLEMENTACIÓN DE MEJORAS CRÍTICAS');
    console.log('==========================================');
    
    const tasks: DeznityTask[] = [
      {
        agent: 'Web Agent',
        phase: 'implementation',
        description: 'Implementar mejoras críticas en la arquitectura del sistema',
        focus: 'Performance, escalabilidad, robustez',
        expectedOutput: 'Código mejorado con optimizaciones críticas'
      },
      {
        agent: 'QA Agent',
        phase: 'implementation',
        description: 'Implementar sistema de testing automatizado y CI/CD',
        focus: 'Testing, validación, deployment automatizado',
        expectedOutput: 'Pipeline de testing y deployment'
      },
      {
        agent: 'Support Agent',
        phase: 'implementation',
        description: 'Implementar sistema de monitoreo y logging avanzado',
        focus: 'Observabilidad, métricas, alertas',
        expectedOutput: 'Sistema de monitoreo completo'
      }
    ];

    for (const task of tasks) {
      await this.executeDeznityTask(task);
    }
  }

  private async validateAndTest(): Promise<void> {
    console.log('\n🧪 FASE: VALIDACIÓN Y TESTING');
    console.log('=============================');
    
    const tasks: DeznityTask[] = [
      {
        agent: 'QA Agent',
        phase: 'validation',
        description: 'Ejecutar tests completos del sistema mejorado',
        focus: 'Funcionalidad, performance, integración',
        expectedOutput: 'Reporte de testing con métricas de calidad'
      },
      {
        agent: 'PM Agent',
        phase: 'validation',
        description: 'Validar que las mejoras cumplen con los objetivos del Documento Fundacional',
        focus: 'Alineación con misión, visión, métricas objetivo',
        expectedOutput: 'Validación de cumplimiento de objetivos'
      }
    ];

    for (const task of tasks) {
      await this.executeDeznityTask(task);
    }
  }

  private async documentAndRoadmap(): Promise<void> {
    console.log('\n📚 FASE: DOCUMENTACIÓN Y ROADMAP');
    console.log('===============================');
    
    const tasks: DeznityTask[] = [
      {
        agent: 'SEO Agent',
        phase: 'documentation',
        description: 'Crear documentación completa del sistema mejorado',
        focus: 'API docs, guías de uso, arquitectura',
        expectedOutput: 'Documentación técnica completa'
      },
      {
        agent: 'Strategy Agent',
        phase: 'documentation',
        description: 'Crear roadmap de mejoras futuras basado en el análisis',
        focus: 'Roadmap técnico, prioridades, timeline',
        expectedOutput: 'Roadmap de desarrollo futuro'
      }
    ];

    for (const task of tasks) {
      await this.executeDeznityTask(task);
    }
  }

  private async executeDeznityTask(task: DeznityTask): Promise<string> {
    const taskId = `deznity-task-${task.agent}-${Date.now()}`;
    const startTime = Date.now();
    
    console.log(`🔄 Ejecutando: ${task.description}`);
    console.log(`   Agente: ${task.agent}`);
    console.log(`   Enfoque: ${task.focus}`);
    
    // Log de inicio
    await logAgentActivity({
      agent: task.agent,
      activity: `Iniciando: ${task.description}`,
      projectId: this.projectId,
      taskId,
      details: { 
        phase: task.phase, 
        focus: task.focus,
        sessionId: this.sessionId
      }
    });

    try {
      // Consultar memoria específica de Deznity
      const memoryQuery = `${task.description} ${task.focus} deznity core system architecture`;
      const relevantChunks = await queryKnowledge(memoryQuery, '', 5);
      
      if (relevantChunks.length > 0) {
        console.log(`✅ Encontrados ${relevantChunks.length} chunks relevantes de memoria`);
      }

      // Crear prompt especializado para construcción de Deznity
      const systemPrompt = `Eres el ${task.agent} de Deznity. Tu misión es construir y mejorar el CORAZÓN del sistema Deznity.

CONTEXTO DE DEZNITY:
- Misión: Democratizar la presencia digital premium 10× más barata y 20× más rápida
- Visión 2027: 1 millón de PYMEs, 100M ARR, 20 empleados humanos
- Valores: Data-driven, Ethical-AI, Zero-friction, Nimbleness, Iterative, Transparency, Yield
- Stack: Supabase, Vercel, Stripe, Pinecone, Modal, n8n, OpenRouter
- Objetivo: Sistema autónomo que se construye a sí mismo

ESTADO ACTUAL DEL SISTEMA:
- Sistema autónomo multi-cliente funcionando
- 8 agentes especializados operativos
- Pinecone como memoria vectorial
- Supabase para persistencia
- OpenRouter para LLMs
- Procesamiento de 30 clientes/hora

ENFOQUE DE ESTA TAREA:
${task.focus}

RESULTADO ESPERADO:
${task.expectedOutput}

Genera una respuesta detallada y específica que mejore el sistema core de Deznity.`;

      // Llamar al modelo
      const modelResponse = await callModel(
        'openai/gpt-4o',
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Ejecuta la tarea: ${task.description}` }
        ]
      );

      const response = modelResponse.choices?.[0]?.message?.content || 'Respuesta no disponible';
      const duration = Date.now() - startTime;

      // Log de finalización
      await logAgentActivity({
        agent: task.agent,
        activity: `Completado: ${task.description}`,
        projectId: this.projectId,
        taskId,
        details: { 
          phase: task.phase, 
          status: 'completed', 
          duration, 
          responseLength: response.length,
          sessionId: this.sessionId
        }
      });

      // Guardar decisión en Pinecone (namespace especial para Deznity)
      const namespace = `deznity-core-${this.sessionId}`;
      await saveDecision(response, namespace, `${task.agent}-${task.phase}-${Date.now()}`);

      console.log(`✅ Completado en ${duration}ms`);
      console.log(`   Resultado: ${response.substring(0, 100)}...`);

      // Guardar archivo de resultado
      await this.saveDeznityTaskResult(task, response, duration);

      // Extraer mejoras si las hay
      await this.extractImprovements(task, response);

      return response;

    } catch (error: any) {
      console.error(`❌ Error en tarea: ${error.message}`);
      
      // Log de error
      await logAgentActivity({
        agent: task.agent,
        activity: `Error: ${task.description}`,
        projectId: this.projectId,
        taskId,
        details: { 
          phase: task.phase, 
          status: 'failed', 
          error: error.message,
          sessionId: this.sessionId
        }
      });
      
      throw error;
    }
  }

  private async saveDeznityTaskResult(task: DeznityTask, response: string, duration: number): Promise<void> {
    const resultDir = path.join(process.cwd(), 'deznity-core-results', this.sessionId);
    await fs.ensureDir(resultDir);

    const filename = `${task.phase}-${task.agent.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    const filepath = path.join(resultDir, filename);

    const content = `# ${task.description}

**Agente**: ${task.agent}
**Fase**: ${task.phase}
**Proyecto**: ${this.projectId}
**Sesión**: ${this.sessionId}
**Duración**: ${duration}ms
**Modelo**: openai/gpt-4o

## Enfoque
${task.focus}

## Resultado Esperado
${task.expectedOutput}

## Resultado

${response}

## Mejoras Identificadas
${this.improvements.length > 0 ? this.improvements.map(imp => `- **${imp.area}**: ${imp.proposedImprovement} (Impacto: ${imp.impact})`).join('\n') : 'Ninguna mejora específica identificada en esta tarea'}
`;

    await fs.writeFile(filepath, content);
  }

  private async extractImprovements(task: DeznityTask, response: string): Promise<void> {
    // Buscar patrones de mejora en la respuesta
    const improvementPatterns = [
      /mejora[s]?\s*:?\s*([^.!?]+)/gi,
      /optimizaci[oó]n[s]?\s*:?\s*([^.!?]+)/gi,
      /recomendaci[oó]n[s]?\s*:?\s*([^.!?]+)/gi,
      /sugerencia[s]?\s*:?\s*([^.!?]+)/gi
    ];

    for (const pattern of improvementPatterns) {
      const matches = response.match(pattern);
      if (matches) {
        for (const match of matches) {
          const improvement: DeznityImprovement = {
            area: task.focus,
            currentState: 'Por analizar',
            proposedImprovement: match.trim(),
            impact: this.assessImpact(match),
            effort: this.assessEffort(match),
            priority: this.calculatePriority(task.phase, match)
          };
          
          this.improvements.push(improvement);
        }
      }
    }
  }

  private assessImpact(improvement: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['crítico', 'esencial', 'fundamental', 'core', 'arquitectura'];
    const highKeywords = ['importante', 'significativo', 'performance', 'escalabilidad'];
    const mediumKeywords = ['mejora', 'optimización', 'eficiencia'];
    
    const text = improvement.toLowerCase();
    
    if (criticalKeywords.some(keyword => text.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => text.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => text.includes(keyword))) return 'medium';
    return 'low';
  }

  private assessEffort(improvement: string): 'low' | 'medium' | 'high' {
    const highKeywords = ['complejo', 'arquitectura', 'refactor', 'rediseño'];
    const mediumKeywords = ['implementar', 'agregar', 'modificar'];
    
    const text = improvement.toLowerCase();
    
    if (highKeywords.some(keyword => text.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => text.includes(keyword))) return 'medium';
    return 'low';
  }

  private calculatePriority(phase: string, improvement: string): number {
    const phaseWeights = {
      'analysis': 1,
      'memory_consultation': 2,
      'architecture': 3,
      'implementation': 4,
      'validation': 2,
      'documentation': 1
    };
    
    const impactWeights = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    
    const phaseWeight = phaseWeights[phase] || 1;
    const impact = this.assessImpact(improvement);
    const impactWeight = impactWeights[impact];
    
    return phaseWeight * impactWeight;
  }
}

// Función principal
async function main() {
  const builder = new DeznityCoreBuilder();
  
  try {
    await builder.build();
  } catch (error: any) {
    console.error('❌ Error en construcción de Deznity:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { DeznityCoreBuilder };
