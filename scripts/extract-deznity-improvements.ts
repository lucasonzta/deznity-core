import { queryKnowledge } from '../utils/pineconeClient';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface DeznityImprovement {
  area: string;
  currentState: string;
  proposedImprovement: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  implementation?: string;
  source: string;
}

class DeznityImprovementExtractor {
  private sessionId: string;
  private improvements: DeznityImprovement[] = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    console.log('🔍 EXTRACTOR DE MEJORAS DE DEZNITY');
    console.log('==================================');
    console.log(`Sesión ID: ${sessionId}`);
    console.log('');
  }

  async extractImprovements(): Promise<DeznityImprovement[]> {
    try {
      // 1. Consultar memoria de la sesión
      await this.consultSessionMemory();
      
      // 2. Consultar memoria general de Deznity
      await this.consultGeneralMemory();
      
      // 3. Generar mejoras basadas en el Documento Fundacional
      await this.generateFoundationalImprovements();
      
      // 4. Generar mejoras basadas en mejores prácticas
      await this.generateBestPracticeImprovements();
      
      // 5. Guardar mejoras en archivo
      await this.saveImprovements();
      
      console.log(`✅ ${this.improvements.length} mejoras extraídas exitosamente`);
      return this.improvements;
      
    } catch (error: any) {
      console.error('❌ Error extrayendo mejoras:', error.message);
      throw error;
    }
  }

  private async consultSessionMemory(): Promise<void> {
    console.log('🧠 Consultando memoria de la sesión...');
    
    const namespace = `deznity-core-${this.sessionId}`;
    const queries = [
      'mejoras críticas arquitectura sistema',
      'optimizaciones performance escalabilidad',
      'mejoras modularidad mantenibilidad',
      'testing automatizado CI/CD',
      'monitoreo logging observabilidad'
    ];

    for (const query of queries) {
      try {
        const chunks = await queryKnowledge(query, namespace, 3);
        
        if (chunks.length > 0) {
          console.log(`✅ Encontrados ${chunks.length} chunks para: ${query}`);
          
          for (const chunk of chunks) {
            const improvement = this.parseChunkForImprovements(chunk, 'Session Memory');
            if (improvement) {
              this.improvements.push(improvement);
            }
          }
        }
      } catch (error: any) {
        console.log(`⚠️ Error consultando: ${query} - ${error.message}`);
      }
    }
  }

  private async consultGeneralMemory(): Promise<void> {
    console.log('🧠 Consultando memoria general de Deznity...');
    
    const queries = [
      'deznity core system architecture improvements',
      'performance optimization scalability',
      'modular architecture design patterns',
      'testing automation best practices',
      'monitoring observability metrics'
    ];

    for (const query of queries) {
      try {
        const chunks = await queryKnowledge(query, '', 3);
        
        if (chunks.length > 0) {
          console.log(`✅ Encontrados ${chunks.length} chunks para: ${query}`);
          
          for (const chunk of chunks) {
            const improvement = this.parseChunkForImprovements(chunk, 'General Memory');
            if (improvement) {
              this.improvements.push(improvement);
            }
          }
        }
      } catch (error: any) {
        console.log(`⚠️ Error consultando: ${query} - ${error.message}`);
      }
    }
  }

  private async generateFoundationalImprovements(): Promise<void> {
    console.log('📄 Generando mejoras basadas en Documento Fundacional...');
    
    const foundationalImprovements: DeznityImprovement[] = [
      {
        area: 'Arquitectura Core',
        currentState: 'Sistema monolítico con agentes acoplados',
        proposedImprovement: 'Implementar arquitectura de microservicios para cada agente especializado',
        impact: 'critical',
        effort: 'high',
        priority: 16,
        implementation: 'Containerizar cada agente como servicio independiente con API REST',
        source: 'Documento Fundacional - Visión 2027'
      },
      {
        area: 'Escalabilidad',
        currentState: 'Procesamiento secuencial limitado a 30 clientes/hora',
        proposedImprovement: 'Implementar procesamiento paralelo y auto-scaling',
        impact: 'critical',
        effort: 'high',
        priority: 15,
        implementation: 'Kubernetes con HPA (Horizontal Pod Autoscaler) y message queues',
        source: 'Documento Fundacional - 1 millón de PYMEs'
      },
      {
        area: 'Performance',
        currentState: 'Latencia de ~2 minutos por cliente',
        proposedImprovement: 'Optimizar para <30 segundos por cliente',
        impact: 'high',
        effort: 'medium',
        priority: 12,
        implementation: 'Cache layer con Redis, optimización de consultas Pinecone',
        source: 'Documento Fundacional - 20× más rápida'
      },
      {
        area: 'Testing',
        currentState: 'Testing manual y limitado',
        proposedImprovement: 'Implementar testing automatizado completo con CI/CD',
        impact: 'high',
        effort: 'medium',
        priority: 11,
        implementation: 'Jest, Cypress, GitHub Actions, coverage >90%',
        source: 'Documento Fundacional - Valores: Data-driven'
      },
      {
        area: 'Monitoreo',
        currentState: 'Logging básico en Supabase',
        proposedImprovement: 'Sistema de observabilidad completo con métricas y alertas',
        impact: 'high',
        effort: 'medium',
        priority: 10,
        implementation: 'Prometheus + Grafana + ELK Stack + Sentry',
        source: 'Documento Fundacional - Stack: Sentry'
      },
      {
        area: 'Documentación',
        currentState: 'Documentación dispersa y limitada',
        proposedImprovement: 'Sistema de documentación técnica completo y automatizado',
        impact: 'medium',
        effort: 'low',
        priority: 8,
        implementation: 'OpenAPI/Swagger, JSDoc, README automatizado',
        source: 'Documento Fundacional - Valores: Transparency'
      }
    ];

    this.improvements.push(...foundationalImprovements);
    console.log(`✅ ${foundationalImprovements.length} mejoras fundacionales generadas`);
  }

  private async generateBestPracticeImprovements(): Promise<void> {
    console.log('🏆 Generando mejoras basadas en mejores prácticas...');
    
    const bestPracticeImprovements: DeznityImprovement[] = [
      {
        area: 'Seguridad',
        currentState: 'Autenticación básica y API keys en .env',
        proposedImprovement: 'Implementar sistema de seguridad robusto con JWT y RBAC',
        impact: 'critical',
        effort: 'medium',
        priority: 14,
        implementation: 'JWT con refresh tokens, RBAC, API rate limiting, secrets management',
        source: 'Best Practices - Security'
      },
      {
        area: 'Error Handling',
        currentState: 'Manejo de errores básico con try/catch',
        proposedImprovement: 'Sistema de manejo de errores robusto con circuit breakers',
        impact: 'high',
        effort: 'medium',
        priority: 9,
        implementation: 'Circuit breakers, retry policies, error boundaries, graceful degradation',
        source: 'Best Practices - Resilience'
      },
      {
        area: 'Code Quality',
        currentState: 'Código sin linting ni formateo consistente',
        proposedImprovement: 'Implementar estándares de código y herramientas de calidad',
        impact: 'medium',
        effort: 'low',
        priority: 7,
        implementation: 'ESLint, Prettier, Husky, lint-staged, SonarQube',
        source: 'Best Practices - Code Quality'
      },
      {
        area: 'API Design',
        currentState: 'APIs internas sin documentación ni versionado',
        proposedImprovement: 'Diseñar APIs RESTful con versionado y documentación automática',
        impact: 'medium',
        effort: 'low',
        priority: 6,
        implementation: 'RESTful APIs, versionado semántico, OpenAPI/Swagger',
        source: 'Best Practices - API Design'
      },
      {
        area: 'Database Optimization',
        currentState: 'Consultas directas sin optimización',
        proposedImprovement: 'Optimizar consultas y implementar índices apropiados',
        impact: 'medium',
        effort: 'low',
        priority: 5,
        implementation: 'Query optimization, database indexing, connection pooling',
        source: 'Best Practices - Database'
      }
    ];

    this.improvements.push(...bestPracticeImprovements);
    console.log(`✅ ${bestPracticeImprovements.length} mejoras de mejores prácticas generadas`);
  }

  private parseChunkForImprovements(chunk: any, source: string): DeznityImprovement | null {
    try {
      const content = chunk.metadata?.content || chunk.content || '';
      
      // Buscar patrones de mejora en el contenido
      const improvementPatterns = [
        /mejora[s]?\s*:?\s*([^.!?]+)/gi,
        /optimizaci[oó]n[s]?\s*:?\s*([^.!?]+)/gi,
        /recomendaci[oó]n[s]?\s*:?\s*([^.!?]+)/gi,
        /sugerencia[s]?\s*:?\s*([^.!?]+)/gi,
        /implementar\s+([^.!?]+)/gi,
        /agregar\s+([^.!?]+)/gi
      ];

      for (const pattern of improvementPatterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          const improvement = matches[0].trim();
          
          return {
            area: this.extractArea(content),
            currentState: 'Por analizar',
            proposedImprovement: improvement,
            impact: this.assessImpact(improvement),
            effort: this.assessEffort(improvement),
            priority: this.calculatePriority(improvement),
            source: source
          };
        }
      }
      
      return null;
    } catch (error: any) {
      console.log(`⚠️ Error parseando chunk: ${error.message}`);
      return null;
    }
  }

  private extractArea(content: string): string {
    const areas = [
      'Arquitectura Core',
      'Performance',
      'Escalabilidad',
      'Testing',
      'Monitoreo',
      'Seguridad',
      'Documentación',
      'API Design',
      'Database',
      'Error Handling'
    ];

    const contentLower = content.toLowerCase();
    
    for (const area of areas) {
      if (contentLower.includes(area.toLowerCase())) {
        return area;
      }
    }
    
    return 'General';
  }

  private assessImpact(improvement: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['crítico', 'esencial', 'fundamental', 'core', 'arquitectura', 'seguridad'];
    const highKeywords = ['importante', 'significativo', 'performance', 'escalabilidad', 'testing'];
    const mediumKeywords = ['mejora', 'optimización', 'eficiencia', 'documentación'];
    
    const text = improvement.toLowerCase();
    
    if (criticalKeywords.some(keyword => text.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => text.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => text.includes(keyword))) return 'medium';
    return 'low';
  }

  private assessEffort(improvement: string): 'low' | 'medium' | 'high' {
    const highKeywords = ['complejo', 'arquitectura', 'refactor', 'rediseño', 'microservicios'];
    const mediumKeywords = ['implementar', 'agregar', 'modificar', 'optimizar'];
    
    const text = improvement.toLowerCase();
    
    if (highKeywords.some(keyword => text.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => text.includes(keyword))) return 'medium';
    return 'low';
  }

  private calculatePriority(improvement: string): number {
    const impact = this.assessImpact(improvement);
    const effort = this.assessEffort(improvement);
    
    const impactWeights = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    
    const effortWeights = {
      'low': 4,
      'medium': 3,
      'high': 2
    };
    
    return impactWeights[impact] * effortWeights[effort];
  }

  private async saveImprovements(): Promise<void> {
    console.log('💾 Guardando mejoras...');
    
    // Ordenar por prioridad
    const sortedImprovements = this.improvements.sort((a, b) => b.priority - a.priority);
    
    // Guardar como JSON
    const jsonPath = path.join(process.cwd(), 'deznity-improvements.json');
    await fs.writeFile(jsonPath, JSON.stringify(sortedImprovements, null, 2));
    
    // Guardar como Markdown
    const mdPath = path.join(process.cwd(), 'DEZNITY_IMPROVEMENTS.md');
    const mdContent = this.generateMarkdownContent(sortedImprovements);
    await fs.writeFile(mdPath, mdContent);
    
    console.log(`✅ Mejoras guardadas en: ${jsonPath} y ${mdPath}`);
  }

  private generateMarkdownContent(improvements: DeznityImprovement[]): string {
    const criticalCount = improvements.filter(i => i.impact === 'critical').length;
    const highCount = improvements.filter(i => i.impact === 'high').length;
    const mediumCount = improvements.filter(i => i.impact === 'medium').length;
    const lowCount = improvements.filter(i => i.impact === 'low').length;
    
    return `# 🚀 Mejoras Identificadas - Deznity Core

## Resumen Ejecutivo

**Total de mejoras**: ${improvements.length}  
**Fecha de generación**: ${new Date().toISOString()}  
**Sesión ID**: ${this.sessionId}

### Distribución por Impacto
- 🔴 **Críticas**: ${criticalCount} (${Math.round(criticalCount/improvements.length*100)}%)
- 🟠 **Altas**: ${highCount} (${Math.round(highCount/improvements.length*100)}%)
- 🟡 **Medias**: ${mediumCount} (${Math.round(mediumCount/improvements.length*100)}%)
- 🟢 **Bajas**: ${lowCount} (${Math.round(lowCount/improvements.length*100)}%)

## 🎯 Mejoras Críticas (Prioridad 1)

${improvements.filter(i => i.impact === 'critical').map((imp, index) => `
### ${index + 1}. ${imp.area}
**Mejora**: ${imp.proposedImprovement}  
**Estado Actual**: ${imp.currentState}  
**Esfuerzo**: ${imp.effort}  
**Prioridad**: ${imp.priority}/16  
**Fuente**: ${imp.source}

${imp.implementation ? `**Implementación**: ${imp.implementation}` : ''}
`).join('')}

## 🚀 Mejoras de Alto Impacto (Prioridad 2)

${improvements.filter(i => i.impact === 'high').map((imp, index) => `
### ${index + 1}. ${imp.area}
**Mejora**: ${imp.proposedImprovement}  
**Estado Actual**: ${imp.currentState}  
**Esfuerzo**: ${imp.effort}  
**Prioridad**: ${imp.priority}/16  
**Fuente**: ${imp.source}

${imp.implementation ? `**Implementación**: ${imp.implementation}` : ''}
`).join('')}

## 📅 Timeline de Implementación

### Sprint 1 (Semanas 1-2): Fundación
**Objetivo**: Implementar mejoras críticas de bajo esfuerzo

**Mejoras a implementar**:
${improvements.filter(i => i.impact === 'critical' && i.effort === 'low').map(imp => `- **${imp.area}**: ${imp.proposedImprovement}`).join('\n') || '- Ninguna mejora crítica de bajo esfuerzo identificada'}

### Sprint 2 (Semanas 3-4): Escalabilidad
**Objetivo**: Implementar mejoras de alto impacto

**Mejoras a implementar**:
${improvements.filter(i => i.impact === 'high' && i.effort !== 'high').map(imp => `- **${imp.area}**: ${imp.proposedImprovement}`).join('\n') || '- Ninguna mejora de alto impacto identificada'}

### Sprint 3 (Semanas 5-6): Optimización
**Objetivo**: Implementar mejoras complejas

**Mejoras a implementar**:
${improvements.filter(i => i.effort === 'high').map(imp => `- **${imp.area}**: ${imp.proposedImprovement}`).join('\n') || '- Ninguna mejora compleja identificada'}

## 📊 Métricas de Seguimiento

### KPIs del Roadmap
- **Mejoras completadas**: 0/${improvements.length}
- **Mejoras críticas completadas**: 0/${criticalCount}
- **Mejoras de alto impacto completadas**: 0/${highCount}

### Criterios de Éxito
- ✅ Todas las mejoras críticas implementadas
- ✅ 80% de mejoras de alto impacto implementadas
- ✅ Sistema más estable y performante
- ✅ Documentación actualizada

---

*Generado automáticamente por el sistema de construcción de Deznity Core*  
*Sesión ID: ${this.sessionId}*  
*Fecha: ${new Date().toISOString()}*
`;
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Uso: npm run extract:improvements <session-id>');
    console.error('   Ejemplo: npm run extract:improvements session-1759698753826');
    process.exit(1);
  }

  const sessionId = args[0];
  const extractor = new DeznityImprovementExtractor(sessionId);
  
  try {
    const improvements = await extractor.extractImprovements();
    console.log(`\n🎉 ${improvements.length} mejoras extraídas exitosamente`);
  } catch (error: any) {
    console.error('❌ Error extrayendo mejoras:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { DeznityImprovementExtractor };
