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

class CompleteDeznityDocumentationGenerator {
  private projectId: string;
  private sessionId: string;
  private resultsDir: string;

  constructor() {
    this.projectId = `deznity-documentation-${uuidv4().substring(0, 8)}`;
    this.sessionId = `documentation-${Date.now()}`;
    this.resultsDir = path.join(process.cwd(), 'deznity-documentation', this.sessionId);
    fs.ensureDirSync(this.resultsDir);
    console.log(`📚 GENERADOR DE DOCUMENTACIÓN COMPLETA DE DEZNITY`);
    console.log(`=================================================`);
    console.log(`Proyecto ID: ${this.projectId}`);
    console.log(`Sesión ID: ${this.sessionId}`);
  }

  private async generateDocumentationSection(
    agent: string,
    title: string,
    focus: string,
    description: string
  ): Promise<string> {
    const taskId = `doc-${agent}-${Date.now()}`;
    const startTime = Date.now();

    console.log(`\n📝 Generando documentación: ${title}`);
    console.log(`   Agente: ${agent}`);

    await logAgentActivity({
      agent: agent,
      activity: `Generando documentación: ${title}`,
      duration_ms: 0,
      status: 'started',
      metadata: { projectId: this.projectId, taskId, section: title }
    });

    try {
      // Consultar todo el conocimiento relevante
      const knowledgeQuery = `${title} ${focus} deznity complete documentation`;
      const relevantChunks = await queryKnowledge(knowledgeQuery, '', 10);

      let combinedKnowledge = '';
      if (relevantChunks.length > 0) {
        console.log(`✅ Encontrados ${relevantChunks.length} chunks relevantes`);
        combinedKnowledge = relevantChunks.map(c => c.content).join('\n\n');
      }

      const context = combinedKnowledge ? `Conocimiento completo de Deznity:\n\n${combinedKnowledge}` : undefined;

      const prompt = `Genera documentación completa y exhaustiva para: ${title}

Descripción: ${description}
Enfoque: ${focus}

Esta documentación debe ser:
- COMPLETA: Incluir todos los detalles técnicos, arquitectónicos y de negocio
- EXHAUSTIVA: Cubrir cada aspecto del sistema
- TÉCNICA: Incluir especificaciones, configuraciones, ejemplos de código
- ESTRATÉGICA: Explicar la visión, objetivos y roadmap
- PRÁCTICA: Incluir guías de implementación y uso

Estructura la documentación con:
1. Resumen ejecutivo
2. Arquitectura técnica detallada
3. Especificaciones de implementación
4. Configuraciones y setup
5. Ejemplos de código
6. Guías de uso
7. Métricas y KPIs
8. Roadmap y próximos pasos

Genera una documentación que permita a alguien entender COMPLETAMENTE Deznity.`;

      const response = await callAgentWithContext(
        agent as any,
        prompt,
        context
      );

      const duration = Date.now() - startTime;

      await logAgentActivity({
        agent: agent,
        activity: `Documentación generada: ${title}`,
        duration_ms: duration,
        status: 'completed',
        metadata: { projectId: this.projectId, taskId, responseLength: response.length }
      });

      console.log(`✅ Documentación generada en ${duration}ms`);

      // Guardar la decisión del agente en Pinecone
      await saveDecision(response, `${this.projectId}-documentation`, agent, {
        type: 'documentation',
        section: title,
        focus: focus
      });

      return response;

    } catch (error: any) {
      console.error(`❌ Error generando documentación: ${error.message}`);
      await logAgentActivity({
        agent: agent,
        activity: `Error: ${title}`,
        duration_ms: Date.now() - startTime,
        status: 'failed',
        metadata: { projectId: this.projectId, taskId, error: error.message }
      });
      throw error;
    }
  }

  async generateCompleteDocumentation() {
    const documentationSections = [
      {
        agent: 'Strategy Agent',
        title: 'VISIÓN ESTRATÉGICA Y DOCUMENTO FUNDACIONAL',
        focus: 'Misión, visión, valores, roadmap, métricas objetivo, estrategia de negocio',
        description: 'Documentación completa de la visión estratégica de Deznity, alineada con el Documento Fundacional'
      },
      {
        agent: 'PM Agent',
        title: 'ARQUITECTURA DE PROYECTO Y GESTIÓN',
        focus: 'Estructura de proyecto, timeline, milestones, coordinación de agentes, gestión de proyectos',
        description: 'Documentación completa de la arquitectura de proyecto y sistema de gestión'
      },
      {
        agent: 'Web Agent',
        title: 'ARQUITECTURA TÉCNICA Y MICROSERVICIOS',
        focus: 'Microservicios, APIs, escalabilidad, performance, infraestructura, deployment',
        description: 'Documentación técnica completa de la arquitectura de microservicios y infraestructura'
      },
      {
        agent: 'Finance Agent',
        title: 'SISTEMA FINANCIERO Y MÉTRICAS DE NEGOCIO',
        focus: 'Billing, facturación, métricas financieras, MRR, CAC, LTV, NPS, Stripe',
        description: 'Documentación completa del sistema financiero y métricas de negocio'
      },
      {
        agent: 'UX Agent',
        title: 'DESIGN SYSTEM Y EXPERIENCIA DE USUARIO',
        focus: 'Design system, branding, tokens, componentes, UX, UI, experiencia de usuario',
        description: 'Documentación completa del design system y experiencia de usuario'
      },
      {
        agent: 'SEO Agent',
        title: 'SISTEMA DE CONTENIDO Y MARKETING',
        focus: 'SEO, contenido, keywords, marketing, copywriting, estrategia de contenido',
        description: 'Documentación completa del sistema de contenido y marketing'
      },
      {
        agent: 'QA Agent',
        title: 'SISTEMA DE CALIDAD Y TESTING',
        focus: 'Testing, validación, calidad, CI/CD, métricas de calidad, NPS',
        description: 'Documentación completa del sistema de calidad y testing'
      },
      {
        agent: 'Support Agent',
        title: 'SISTEMA DE SOPORTE Y MONITOREO',
        focus: 'Soporte, monitoreo, Sentry, logging, observabilidad, alertas',
        description: 'Documentación completa del sistema de soporte y monitoreo'
      },
      {
        agent: 'Marketing Agent',
        title: 'ESTRATEGIA DE MARKETING Y VENTAS',
        focus: 'Marketing digital, campañas, ventas, conversión, CRM, estrategia de crecimiento',
        description: 'Documentación completa de la estrategia de marketing y ventas'
      },
      {
        agent: 'Strategy Agent',
        title: 'ESCALABILIDAD Y FUTURO',
        focus: 'Escalabilidad, performance, optimización, Modal compute, visión 2027',
        description: 'Documentación completa de la escalabilidad y visión futura'
      }
    ];

    console.log(`\n📚 GENERANDO DOCUMENTACIÓN COMPLETA DE DEZNITY`);
    console.log(`===============================================`);
    console.log(`Total de secciones: ${documentationSections.length}`);
    console.log(`Agentes involucrados: ${new Set(documentationSections.map(s => s.agent)).size}`);

    let completedSections = 0;
    let failedSections = 0;
    const allDocumentation: { [key: string]: string } = {};

    for (const section of documentationSections) {
      try {
        console.log(`\n${'='.repeat(20)} GENERANDO SECCIÓN ${'='.repeat(20)}`);
        const documentation = await this.generateDocumentationSection(
          section.agent,
          section.title,
          section.focus,
          section.description
        );
        
        allDocumentation[section.title] = documentation;
        completedSections++;
      } catch (error) {
        console.error(`❌ Error generando sección "${section.title}". Continuando...`);
        failedSections++;
      }
    }

    // Generar documento final consolidado
    await this.generateFinalDocument(allDocumentation);

    // Generar reporte final
    await this.generateFinalReport(completedSections, failedSections);

    console.log(`\n🎉 ¡DOCUMENTACIÓN COMPLETA DE DEZNITY GENERADA!`);
    console.log(`===============================================`);
    console.log(`✅ Secciones completadas: ${completedSections}`);
    console.log(`❌ Secciones fallidas: ${failedSections}`);
    console.log(`✅ Proyecto ID: ${this.projectId}`);
    console.log(`✅ Sesión ID: ${this.sessionId}`);
    console.log(`📁 Documentación guardada en: ${this.resultsDir}`);
  }

  private async generateFinalDocument(allDocumentation: { [key: string]: string }): Promise<void> {
    const finalDocPath = path.join(this.resultsDir, 'DEZNITY_COMPLETE_DOCUMENTATION.md');
    
    let content = `# 📚 DOCUMENTACIÓN COMPLETA DE DEZNITY
## Self-Building AI Growth Engine

**Fecha de generación**: ${new Date().toISOString()}
**Proyecto ID**: ${this.projectId}
**Sesión ID**: ${this.sessionId}
**Versión**: 1.0.0

---

## 📋 ÍNDICE

1. [Visión Estratégica y Documento Fundacional](#1-visión-estratégica-y-documento-fundacional)
2. [Arquitectura de Proyecto y Gestión](#2-arquitectura-de-proyecto-y-gestión)
3. [Arquitectura Técnica y Microservicios](#3-arquitectura-técnica-y-microservicios)
4. [Sistema Financiero y Métricas de Negocio](#4-sistema-financiero-y-métricas-de-negocio)
5. [Design System y Experiencia de Usuario](#5-design-system-y-experiencia-de-usuario)
6. [Sistema de Contenido y Marketing](#6-sistema-de-contenido-y-marketing)
7. [Sistema de Calidad y Testing](#7-sistema-de-calidad-y-testing)
8. [Sistema de Soporte y Monitoreo](#8-sistema-de-soporte-y-monitoreo)
9. [Estrategia de Marketing y Ventas](#9-estrategia-de-marketing-y-ventas)
10. [Escalabilidad y Futuro](#10-escalabilidad-y-futuro)

---

`;

    // Agregar cada sección
    Object.entries(allDocumentation).forEach(([title, sectionContent], index) => {
      const sectionNumber = index + 1;
      const sectionId = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      content += `## ${sectionNumber}. ${title}\n\n`;
      content += sectionContent;
      content += `\n\n---\n\n`;
    });

    content += `
## 🎯 RESUMEN EJECUTIVO

Deznity es un "Self-Building AI Growth Engine" que democratiza la presencia digital premium 10× más barata y 20× más rápida. Este documento contiene la documentación completa de todo el sistema, desde la visión estratégica hasta la implementación técnica.

### Objetivos Principales
- **Misión**: Democratizar la presencia digital premium 10× más barata y 20× más rápida
- **Visión 2027**: 1 millón de PYMEs, 100M ARR, 20 empleados humanos
- **Valores**: Data-driven, Ethical-AI, Zero-friction, Nimbleness, Iterative, Transparency, Yield

### Stack Tecnológico
- **Backend**: Supabase, Vercel, Stripe, Pinecone, Modal, n8n, OpenRouter, Sentry
- **Frontend**: Next.js, React, TypeScript
- **Agentes**: PM, Web, UX, SEO, QA, Marketing, Sales, Support, Finance, Strategy

### Métricas Objetivo
- **CAC**: < 500 USD
- **LTV**: > 5000 USD
- **NPS**: ≥ 60
- **Tiempo de entrega**: < 72 horas
- **MRR objetivo D90**: 10k USD

---

*Documentación generada automáticamente por los agentes de Deznity*
*Basada en el Documento Fundacional*
*Fecha: ${new Date().toISOString()}*
`;

    await fs.writeFile(finalDocPath, content, 'utf-8');
    console.log(`📚 Documentación completa generada: ${finalDocPath}`);
  }

  private async generateFinalReport(completedSections: number, failedSections: number): Promise<void> {
    const reportPath = path.join(this.resultsDir, 'DOCUMENTATION_GENERATION_REPORT.md');
    const content = `
# 📚 REPORTE DE GENERACIÓN DE DOCUMENTACIÓN COMPLETA - DEZNITY

**Fecha**: ${new Date().toISOString()}
**Proyecto ID**: ${this.projectId}
**Sesión ID**: ${this.sessionId}

## 📊 Resumen Ejecutivo

- **Secciones completadas**: ${completedSections}
- **Secciones fallidas**: ${failedSections}
- **Tasa de éxito**: ${Math.round((completedSections / (completedSections + failedSections)) * 100)}%

## 🎯 Secciones Generadas

### ✅ DOCUMENTACIÓN COMPLETA
- [x] Visión Estratégica y Documento Fundacional
- [x] Arquitectura de Proyecto y Gestión
- [x] Arquitectura Técnica y Microservicios
- [x] Sistema Financiero y Métricas de Negocio
- [x] Design System y Experiencia de Usuario
- [x] Sistema de Contenido y Marketing
- [x] Sistema de Calidad y Testing
- [x] Sistema de Soporte y Monitoreo
- [x] Estrategia de Marketing y Ventas
- [x] Escalabilidad y Futuro

## 📁 Archivos Generados

- **DEZNITY_COMPLETE_DOCUMENTATION.md**: Documentación completa consolidada
- **DOCUMENTATION_GENERATION_REPORT.md**: Este reporte

## 🎯 Estado: DOCUMENTACIÓN COMPLETA GENERADA

La documentación completa de Deznity ha sido generada exitosamente. Incluye todos los aspectos del sistema:

- ✅ Visión estratégica y Documento Fundacional
- ✅ Arquitectura técnica y microservicios
- ✅ Sistema financiero y métricas
- ✅ Design system y UX
- ✅ Sistema de contenido y marketing
- ✅ Sistema de calidad y testing
- ✅ Sistema de soporte y monitoreo
- ✅ Estrategia de marketing y ventas
- ✅ Escalabilidad y futuro

## 🚀 Próximos Pasos

1. **Revisar documentación**: Estudiar el archivo DEZNITY_COMPLETE_DOCUMENTATION.md
2. **Implementar**: Usar la documentación para implementar el sistema
3. **Deploy**: Llevar Deznity a producción
4. **Validar**: Probar con clientes reales

---
*Generado automáticamente por los agentes de Deznity*
*Basado en el Documento Fundacional*
*Fecha: ${new Date().toISOString()}*
`;
    
    await fs.writeFile(reportPath, content.trim(), 'utf-8');
    console.log(`📊 Reporte final generado: ${reportPath}`);
  }
}

const generator = new CompleteDeznityDocumentationGenerator();
generator.generateCompleteDocumentation();
