import { callAgent, createSystemMessage, createUserMessage } from '../utils/openrouterClient';
import { 
  queryKnowledge, 
  saveDecision, 
  getClientBrief, 
  findTemplates, 
  findAgentInfo,
  getClientHistory 
} from '../utils/pineconeClient';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
interface ProjectFlow {
  clientNamespace: string;
  brief: any;
  pmPlan: string;
  webTemplate: string;
  uxDesign: string;
  seoContent: string;
  qaReport: string;
}

/**
 * Simula el flujo completo de un proyecto Deznity
 */
async function simulateProjectFlow(clientBriefName: string = 'TacoLoco'): Promise<ProjectFlow> {
  console.log('🚀 Iniciando simulación de flujo de proyecto Deznity');
  console.log('=' .repeat(60));
  
  // Generar namespace único para el cliente
  const clientNamespace = `client-${uuidv4()}`;
  console.log(`👤 Cliente: ${clientBriefName}`);
  console.log(`🏷️  Namespace: ${clientNamespace}`);
  console.log('');
  
  try {
    // 1. Obtener brief del cliente (usar uno existente)
    console.log('📋 PASO 1: Obteniendo brief del cliente');
    console.log('-'.repeat(40));
    
    // Buscar un brief existente en la base de conocimiento
    const existingBriefs = await queryKnowledge('brief restaurante TacoLoco', 'deznity-core', 1);
    let brief;
    
    if (existingBriefs.length > 0) {
      brief = existingBriefs[0];
      console.log(`✅ Brief encontrado en base de conocimiento: ${brief.filename}`);
    } else {
      // Si no hay briefs, crear uno simulado
      brief = {
        id: 'simulated-brief',
        content: `{
 "business_name": "TacoLoco",
 "industry": "restaurant",
 "goal": "increase reservations",
 "color": "#FF6A00",
 "logo_url": "https://.../tacoloco.png",
 "copy_tone": "fun, young, street-food vibes",
 "target_geo": "CDMX",
 "pages": ["home","menu","book","blog"],
 "budget": "starter"
}`,
        filename: 'TacoLoco Brief',
        type: 'brief' as const,
        score: 1.0
      };
      console.log(`✅ Brief simulado creado para: ${clientBriefName}`);
    }
    
    console.log(`📄 Contenido: ${brief.content.substring(0, 100)}...`);
    console.log('');
    
    // 2. PM Agent - Planificación
    console.log('🗂️  PASO 2: PM Agent - Planificación del proyecto');
    console.log('-'.repeat(40));
    
    const pmKnowledge = await findAgentInfo('pm');
    const pmSystemPrompt = `Eres el PM Agent de Deznity. Tu rol es planificar proyectos web basándote en la base de conocimiento de Deznity.
    
Información relevante:
${pmKnowledge.map(k => `- ${k.filename}: ${k.content}`).join('\n')}

Brief del cliente:
${brief.content}

Crea un plan detallado para este proyecto incluyendo:
1. Fases del proyecto
2. Tareas específicas
3. Timeline estimado
4. Recursos necesarios
5. Entregables por fase`;

    const pmPlan = await callAgent('pm', [
      createSystemMessage(pmSystemPrompt),
      createUserMessage(`Planifica el proyecto para ${clientBriefName} basándote en el brief proporcionado.`)
    ]);
    
    console.log(`✅ Plan PM generado (${pmPlan.length} caracteres)`);
    console.log(`📝 Resumen: ${pmPlan.substring(0, 200)}...`);
    console.log('');
    
    // Guardar decisión del PM
    await saveDecision(pmPlan, clientNamespace, 'pm', {
      phase: 'planning',
      brief_filename: brief.filename
    });
    
    // 3. Web Agent - Selección de plantilla
    console.log('🌐 PASO 3: Web Agent - Selección de plantilla');
    console.log('-'.repeat(40));
    
    const webKnowledge = await findAgentInfo('web');
    const templates = await findTemplates();
    
    const webSystemPrompt = `Eres el Web Agent de Deznity. Tu rol es seleccionar y configurar plantillas web.
    
Información del agente:
${webKnowledge.map(k => `- ${k.filename}: ${k.content}`).join('\n')}

Plantillas disponibles:
${templates.map(t => `- ${t.filename}: ${t.content}`).join('\n')}

Plan del PM:
${pmPlan}

Selecciona la mejor plantilla y configuración para este proyecto.`;

    const webTemplate = await callAgent('web', [
      createSystemMessage(webSystemPrompt),
      createUserMessage(`Selecciona y configura la plantilla para ${clientBriefName}.`)
    ]);
    
    console.log(`✅ Plantilla web seleccionada (${webTemplate.length} caracteres)`);
    console.log(`📝 Resumen: ${webTemplate.substring(0, 200)}...`);
    console.log('');
    
    // Guardar decisión del Web Agent
    await saveDecision(webTemplate, clientNamespace, 'web', {
      phase: 'template_selection',
      pm_plan_length: pmPlan.length
    });
    
    // 4. UX Agent - Diseño y tokens
    console.log('🎨 PASO 4: UX Agent - Diseño y tokens');
    console.log('-'.repeat(40));
    
    const uxKnowledge = await findAgentInfo('ux');
    
    const uxSystemPrompt = `Eres el UX Agent de Deznity. Tu rol es crear diseños, wireframes y tokens de diseño.
    
Información del agente:
${uxKnowledge.map(k => `- ${k.filename}: ${k.content}`).join('\n')}

Brief del cliente:
${brief.content}

Plan del PM:
${pmPlan}

Plantilla seleccionada:
${webTemplate}

Crea el diseño UX incluyendo:
1. Wireframes principales
2. Tokens de diseño (colores, tipografías, espaciado)
3. Componentes clave
4. Flujo de usuario`;

    const uxDesign = await callAgent('ux', [
      createSystemMessage(uxSystemPrompt),
      createUserMessage(`Crea el diseño UX para ${clientBriefName}.`)
    ]);
    
    console.log(`✅ Diseño UX generado (${uxDesign.length} caracteres)`);
    console.log(`📝 Resumen: ${uxDesign.substring(0, 200)}...`);
    console.log('');
    
    // Guardar decisión del UX Agent
    await saveDecision(uxDesign, clientNamespace, 'ux', {
      phase: 'design',
      web_template_length: webTemplate.length
    });
    
    // 5. SEO Agent - Contenido y SEO
    console.log('🔍 PASO 5: SEO Agent - Contenido y SEO');
    console.log('-'.repeat(40));
    
    const seoKnowledge = await findAgentInfo('seo');
    
    const seoSystemPrompt = `Eres el SEO Agent de Deznity. Tu rol es crear contenido optimizado y estructura SEO.
    
Información del agente:
${seoKnowledge.map(k => `- ${k.filename}: ${k.content}`).join('\n')}

Brief del cliente:
${brief.content}

Plan del PM:
${pmPlan}

Diseño UX:
${uxDesign}

Crea el contenido SEO incluyendo:
1. Copy optimizado para conversión
2. Keywords principales y secundarias
3. Estructura de headings (H1, H2, H3)
4. Meta descriptions
5. Schema markup sugerido`;

    const seoContent = await callAgent('seo', [
      createSystemMessage(seoSystemPrompt),
      createUserMessage(`Crea el contenido SEO para ${clientBriefName}.`)
    ]);
    
    console.log(`✅ Contenido SEO generado (${seoContent.length} caracteres)`);
    console.log(`📝 Resumen: ${seoContent.substring(0, 200)}...`);
    console.log('');
    
    // Guardar decisión del SEO Agent
    await saveDecision(seoContent, clientNamespace, 'seo', {
      phase: 'content_creation',
      ux_design_length: uxDesign.length
    });
    
    // 6. QA Agent - Validación y reporte
    console.log('🧪 PASO 6: QA Agent - Validación y reporte final');
    console.log('-'.repeat(40));
    
    const qaKnowledge = await findAgentInfo('qa');
    
    const qaSystemPrompt = `Eres el QA Agent de Deznity. Tu rol es validar y generar reportes de calidad.
    
Información del agente:
${qaKnowledge.map(k => `- ${k.filename}: ${k.content}`).join('\n')}

Brief del cliente:
${brief.content}

Plan del PM:
${pmPlan}

Plantilla web:
${webTemplate}

Diseño UX:
${uxDesign}

Contenido SEO:
${seoContent}

Genera un reporte de QA incluyendo:
1. Validación de todos los entregables
2. Checklist de calidad
3. Recomendaciones de mejora
4. Próximos pasos
5. Métricas de éxito sugeridas`;

    const qaReport = await callAgent('qa', [
      createSystemMessage(qaSystemPrompt),
      createUserMessage(`Valida y genera reporte final para ${clientBriefName}.`)
    ]);
    
    console.log(`✅ Reporte QA generado (${qaReport.length} caracteres)`);
    console.log(`📝 Resumen: ${qaReport.substring(0, 200)}...`);
    console.log('');
    
    // Guardar decisión del QA Agent
    await saveDecision(qaReport, clientNamespace, 'qa', {
      phase: 'validation',
      seo_content_length: seoContent.length
    });
    
    // 7. Resumen final
    console.log('📊 RESUMEN FINAL DEL PROYECTO');
    console.log('=' .repeat(60));
    console.log(`👤 Cliente: ${clientBriefName}`);
    console.log(`🏷️  Namespace: ${clientNamespace}`);
    console.log(`📋 Brief: ${brief.filename}`);
    console.log(`🗂️  Plan PM: ${pmPlan.length} caracteres`);
    console.log(`🌐 Plantilla Web: ${webTemplate.length} caracteres`);
    console.log(`🎨 Diseño UX: ${uxDesign.length} caracteres`);
    console.log(`🔍 Contenido SEO: ${seoContent.length} caracteres`);
    console.log(`🧪 Reporte QA: ${qaReport.length} caracteres`);
    console.log('');
    
    // Obtener historial del cliente
    const clientHistory = await getClientHistory(clientNamespace);
    console.log(`📚 Decisiones guardadas: ${clientHistory.length}`);
    console.log('');
    
    console.log('🎉 ¡Flujo de proyecto completado exitosamente!');
    
    return {
      clientNamespace,
      brief: brief.content,
      pmPlan,
      webTemplate,
      uxDesign,
      seoContent,
      qaReport
    };
    
  } catch (error) {
    console.error('❌ Error en el flujo del proyecto:', error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    console.log('🚀 Iniciando Test Flow de Deznity');
    console.log('=====================================');
    console.log('');
    
    // Simular flujo con TacoLoco
    const result = await simulateProjectFlow('TacoLoco');
    
    console.log('');
    console.log('✅ Test Flow completado exitosamente');
    console.log(`📁 Namespace del cliente: ${result.clientNamespace}`);
    
  } catch (error) {
    console.error('❌ Error en Test Flow:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { simulateProjectFlow, ProjectFlow };
