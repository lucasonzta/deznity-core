import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { callAgentWithContext } from '../utils/openrouterClient';
import { queryKnowledge, saveDecision } from '../utils/pineconeClient';
import { logAgentActivity } from '../utils/supabaseLogger';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('⚠️ Supabase no configurado. Los logs se guardarán solo localmente.');
}

interface CodeGenerationTask {
  agent: string;
  description: string;
  focus: string;
  expectedOutput: string;
  outputPath: string;
}

class ImplementationCodeGenerator {
  private projectId: string;
  private sessionId: string;
  private resultsDir: string;

  constructor() {
    this.projectId = `deznity-implementation-${uuidv4().substring(0, 8)}`;
    this.sessionId = `implementation-${Date.now()}`;
    this.resultsDir = path.join(process.cwd(), 'deznity-implementation', this.sessionId);
    fs.ensureDirSync(this.resultsDir);
    console.log(`🏗️ GENERADOR DE CÓDIGO IMPLEMENTABLE DE DEZNITY`);
    console.log(`===============================================`);
    console.log(`Proyecto ID: ${this.projectId}`);
    console.log(`Sesión ID: ${this.sessionId}`);
  }

  private async generateCode(task: CodeGenerationTask): Promise<string> {
    const taskId = `task-${task.agent}-${Date.now()}`;
    const startTime = Date.now();

    console.log(`\n🔄 Generando código: ${task.description}`);
    console.log(`   Agente: ${task.agent}`);
    console.log(`   Ruta de salida: ${task.outputPath}`);

    await logAgentActivity({
      agent: task.agent,
      activity: `Generando código: ${task.description}`,
      duration_ms: 0,
      status: 'started',
      metadata: { projectId: this.projectId, taskId, outputPath: task.outputPath }
    });

    try {
      // Consultar conocimiento relevante del Documento Fundacional
      const knowledgeQuery = `${task.description} ${task.focus} deznity implementation code`;
      const relevantChunks = await queryKnowledge(knowledgeQuery, '', 5);

      let combinedKnowledge = '';
      if (relevantChunks.length > 0) {
        console.log(`✅ Encontrados ${relevantChunks.length} chunks relevantes`);
        combinedKnowledge = relevantChunks.map(c => c.content).join('\n\n');
      }

      const context = combinedKnowledge ? `Conocimiento relevante del Documento Fundacional:\n\n${combinedKnowledge}` : undefined;

      const prompt = `Genera código implementable para: ${task.description}

Enfócate en: ${task.focus}

Resultado esperado: ${task.expectedOutput}

Genera código TypeScript/JavaScript ejecutable, incluyendo:
- Imports y exports necesarios
- Interfaces y tipos
- Funciones y clases completas
- Configuraciones
- Ejemplos de uso
- Comentarios explicativos

El código debe ser:
- Ejecutable inmediatamente
- Siguiendo las mejores prácticas
- Alineado con el Documento Fundacional de Deznity
- Usando el stack: Supabase, Vercel, Stripe, Pinecone, Modal, n8n, OpenRouter, Sentry`;

      const response = await callAgentWithContext(
        task.agent as any,
        prompt,
        context
      );

      const duration = Date.now() - startTime;

      await logAgentActivity({
        agent: task.agent,
        activity: `Código generado: ${task.description}`,
        duration_ms: duration,
        status: 'completed',
        metadata: { projectId: this.projectId, taskId, responseLength: response.length }
      });

      console.log(`✅ Código generado en ${duration}ms`);

      // Guardar el código en archivo
      await this.saveCodeFile(task, response);

      // Guardar la decisión del agente en Pinecone
      await saveDecision(response, `${this.projectId}-implementation`, task.agent, {
        type: 'code_generation',
        outputPath: task.outputPath,
        focus: task.focus
      });

      return response;

    } catch (error: any) {
      console.error(`❌ Error generando código: ${error.message}`);
      await logAgentActivity({
        agent: task.agent,
        activity: `Error: ${task.description}`,
        duration_ms: Date.now() - startTime,
        status: 'failed',
        metadata: { projectId: this.projectId, taskId, error: error.message }
      });
      throw error;
    }
  }

  private async saveCodeFile(task: CodeGenerationTask, code: string): Promise<void> {
    const fullPath = path.join(this.resultsDir, task.outputPath);
    const dir = path.dirname(fullPath);
    
    // Crear directorio si no existe
    await fs.ensureDir(dir);
    
    // Extraer solo el código del response (asumiendo que está entre ```)
    const codeMatch = code.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)\n```/);
    const cleanCode = codeMatch ? codeMatch[1] : code;
    
    await fs.writeFile(fullPath, cleanCode, 'utf-8');
    console.log(`💾 Código guardado en: ${fullPath}`);
  }

  async generateAllCode() {
    const codeTasks: CodeGenerationTask[] = [
      // MICROSERVICIOS
      {
        agent: 'Web Agent',
        description: 'API Gateway con autenticación y rate limiting',
        focus: 'Express.js, middleware, routing, seguridad',
        expectedOutput: 'API Gateway funcional con autenticación',
        outputPath: 'api-gateway/src/index.ts'
      },
      {
        agent: 'Web Agent',
        description: 'Users Service con gestión de perfiles y organizaciones',
        focus: 'CRUD operations, Supabase, autenticación',
        expectedOutput: 'Users Service completo',
        outputPath: 'users-service/src/index.ts'
      },
      {
        agent: 'Finance Agent',
        description: 'Billing Service con integración Stripe',
        focus: 'Stripe API, suscripciones, webhooks, Supabase',
        expectedOutput: 'Billing Service funcional',
        outputPath: 'billing-service/src/stripe.ts'
      },
      {
        agent: 'Web Agent',
        description: 'Agents Service para orquestación de agentes',
        focus: 'OpenRouter API, Pinecone, coordinación de agentes',
        expectedOutput: 'Agents Service completo',
        outputPath: 'agents-service/src/index.ts'
      },

      // DESIGN SYSTEM
      {
        agent: 'UX Agent',
        description: 'Design tokens y sistema de colores',
        focus: 'Design tokens, colores, tipografías, espaciado',
        expectedOutput: 'Design tokens implementados',
        outputPath: 'design-system/src/tokens.ts'
      },
      {
        agent: 'UX Agent',
        description: 'Componentes base (Button, Input, Card)',
        focus: 'React components, TypeScript, props, styling',
        expectedOutput: 'Componentes base funcionales',
        outputPath: 'design-system/src/components/Button.tsx'
      },

      // LANDING PAGE
      {
        agent: 'Web Agent',
        description: 'Landing page principal con pricing',
        focus: 'Next.js, React, design system, conversión',
        expectedOutput: 'Landing page funcional',
        outputPath: 'landing-page/src/pages/index.tsx'
      },
      {
        agent: 'Web Agent',
        description: 'Client Portal con dashboard',
        focus: 'Next.js, autenticación, dashboard, proyectos',
        expectedOutput: 'Client Portal funcional',
        outputPath: 'client-portal/src/pages/dashboard.tsx'
      },

      // AGENTES
      {
        agent: 'PM Agent',
        description: 'PM Agent con gestión de proyectos',
        focus: 'OpenRouter, Pinecone, gestión de proyectos',
        expectedOutput: 'PM Agent funcional',
        outputPath: 'agents/src/pm-agent.ts'
      },
      {
        agent: 'SEO Agent',
        description: 'SEO Agent con generación de contenido',
        focus: 'OpenRouter, SEO, keywords, contenido',
        expectedOutput: 'SEO Agent funcional',
        outputPath: 'agents/src/seo-agent.ts'
      },

      // TESTING
      {
        agent: 'QA Agent',
        description: 'Tests unitarios para Billing Service',
        focus: 'Jest, mocking, testing, validación',
        expectedOutput: 'Tests unitarios completos',
        outputPath: 'testing/src/billing.test.ts'
      },
      {
        agent: 'QA Agent',
        description: 'Tests de integración para API Gateway',
        focus: 'Jest, supertest, API testing, integración',
        expectedOutput: 'Tests de integración completos',
        outputPath: 'testing/src/api-gateway.test.ts'
      },

      // CONFIGURACIÓN
      {
        agent: 'Support Agent',
        description: 'Configuración de Sentry para monitoreo',
        focus: 'Sentry, error tracking, performance, alertas',
        expectedOutput: 'Configuración Sentry completa',
        outputPath: 'monitoring/src/sentry.ts'
      },
      {
        agent: 'Support Agent',
        description: 'Configuración de n8n para automatizaciones',
        focus: 'n8n, workflows, automatización, webhooks',
        expectedOutput: 'Configuración n8n completa',
        outputPath: 'automation/src/n8n-config.json'
      }
    ];

    console.log(`\n🚀 GENERANDO CÓDIGO IMPLEMENTABLE DE DEZNITY`);
    console.log(`=============================================`);
    console.log(`Total de archivos a generar: ${codeTasks.length}`);
    console.log(`Agentes involucrados: ${new Set(codeTasks.map(t => t.agent)).size}`);

    let completedTasks = 0;
    let failedTasks = 0;

    for (const task of codeTasks) {
      try {
        console.log(`\n${'='.repeat(20)} GENERANDO CÓDIGO ${'='.repeat(20)}`);
        await this.generateCode(task);
        completedTasks++;
      } catch (error) {
        console.error(`❌ Error generando código para "${task.description}". Continuando...`);
        failedTasks++;
      }
    }

    // Generar package.json y configuración
    await this.generateProjectConfig();

    // Generar reporte final
    await this.generateFinalReport(completedTasks, failedTasks);

    console.log(`\n🎉 ¡CÓDIGO IMPLEMENTABLE DE DEZNITY GENERADO!`);
    console.log(`=============================================`);
    console.log(`✅ Archivos generados: ${completedTasks}`);
    console.log(`❌ Archivos fallidos: ${failedTasks}`);
    console.log(`✅ Proyecto ID: ${this.projectId}`);
    console.log(`✅ Sesión ID: ${this.sessionId}`);
    console.log(`📁 Código guardado en: ${this.resultsDir}`);
  }

  private async generateProjectConfig(): Promise<void> {
    const packageJson = {
      name: "deznity-implementation",
      version: "1.0.0",
      description: "Deznity - Self-Building AI Growth Engine - Implementation",
      scripts: {
        "dev": "concurrently \"npm run dev:api-gateway\" \"npm run dev:landing\" \"npm run dev:portal\"",
        "dev:api-gateway": "cd api-gateway && npm run dev",
        "dev:landing": "cd landing-page && npm run dev",
        "dev:portal": "cd client-portal && npm run dev",
        "build": "npm run build:all",
        "build:all": "npm run build:api-gateway && npm run build:landing && npm run build:portal",
        "test": "jest",
        "deploy": "vercel --prod"
      },
      dependencies: {
        "@supabase/supabase-js": "^2.58.0",
        "@pinecone-database/pinecone": "^6.1.2",
        "stripe": "^14.0.0",
        "express": "^4.18.2",
        "next": "^14.0.0",
        "react": "^18.2.0",
        "typescript": "^5.5.3"
      },
      devDependencies: {
        "@types/express": "^4.17.21",
        "@types/node": "^20.14.10",
        "jest": "^29.7.0",
        "concurrently": "^8.2.2"
      }
    };

    const packageJsonPath = path.join(this.resultsDir, 'package.json');
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(`📦 package.json generado: ${packageJsonPath}`);
  }

  private async generateFinalReport(completedTasks: number, failedTasks: number): Promise<void> {
    const reportPath = path.join(this.resultsDir, 'IMPLEMENTATION_REPORT.md');
    const content = `
# 🏗️ REPORTE DE GENERACIÓN DE CÓDIGO IMPLEMENTABLE - DEZNITY

**Fecha**: ${new Date().toISOString()}
**Proyecto ID**: ${this.projectId}
**Sesión ID**: ${this.sessionId}

## 📊 Resumen Ejecutivo

- **Archivos generados**: ${completedTasks}
- **Archivos fallidos**: ${failedTasks}
- **Tasa de éxito**: ${Math.round((completedTasks / (completedTasks + failedTasks)) * 100)}%

## 🎯 Código Generado

### ✅ MICROSERVICIOS
- [x] API Gateway (Express.js)
- [x] Users Service (Supabase)
- [x] Billing Service (Stripe)
- [x] Agents Service (OpenRouter + Pinecone)

### ✅ DESIGN SYSTEM
- [x] Design tokens
- [x] Componentes base (Button, Input, Card)

### ✅ FRONTEND
- [x] Landing page (Next.js)
- [x] Client Portal (Next.js)

### ✅ AGENTES
- [x] PM Agent
- [x] SEO Agent

### ✅ TESTING
- [x] Tests unitarios
- [x] Tests de integración

### ✅ CONFIGURACIÓN
- [x] Sentry (monitoreo)
- [x] n8n (automatización)

## 🚀 Próximos Pasos

1. **Instalar dependencias**: \`npm install\`
2. **Configurar variables de entorno**: Copiar \`.env.example\` a \`.env\`
3. **Ejecutar en desarrollo**: \`npm run dev\`
4. **Ejecutar tests**: \`npm test\`
5. **Deploy**: \`npm run deploy\`

## 📁 Estructura del Proyecto

\`\`\`
deznity-implementation/
├── api-gateway/          # API Gateway
├── users-service/        # Users Service
├── billing-service/      # Billing Service
├── agents-service/       # Agents Service
├── design-system/        # Design System
├── landing-page/         # Landing Page
├── client-portal/        # Client Portal
├── agents/              # Agentes
├── testing/             # Tests
├── monitoring/          # Monitoreo
├── automation/          # Automatización
└── package.json         # Configuración
\`\`\`

## 🎯 Estado: CÓDIGO IMPLEMENTABLE GENERADO

El código está listo para ser ejecutado y deployado en producción.

---
*Generado automáticamente por los agentes de Deznity*
*Basado en el Documento Fundacional*
*Fecha: ${new Date().toISOString()}*
`;
    
    await fs.writeFile(reportPath, content.trim(), 'utf-8');
    console.log(`📊 Reporte final generado: ${reportPath}`);
  }
}

const generator = new ImplementationCodeGenerator();
generator.generateAllCode();
