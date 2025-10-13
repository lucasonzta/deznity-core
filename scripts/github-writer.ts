import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

interface GitHubCommit {
  filePath: string;
  content: string;
  commitMessage: string;
  author: string;
}

interface DeznityImprovement {
  area: string;
  currentState: string;
  proposedImprovement: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  implementation?: string;
}

class GitHubWriter {
  private repoPath: string;
  private sessionId: string;

  constructor() {
    this.repoPath = process.cwd();
    this.sessionId = `session-${Date.now()}`;
    
    console.log('📝 GITHUB WRITER - DEZNITY CORE');
    console.log('===============================');
    console.log(`Repositorio: ${this.repoPath}`);
    console.log(`Sesión ID: ${this.sessionId}`);
    console.log('');
  }

  async writeImprovements(improvements: DeznityImprovement[]): Promise<void> {
    console.log('🔄 Escribiendo mejoras en GitHub...');
    
    try {
      // 1. Verificar estado de git
      await this.checkGitStatus();
      
      // 2. Crear archivos de mejoras
      await this.createImprovementFiles(improvements);
      
      // 3. Crear documentación de arquitectura
      await this.createArchitectureDocs(improvements);
      
      // 4. Crear roadmap de mejoras
      await this.createImprovementRoadmap(improvements);
      
      // 5. Commit y push
      await this.commitAndPush();
      
      console.log('✅ Mejoras escritas exitosamente en GitHub');
      
    } catch (error: any) {
      console.error('❌ Error escribiendo en GitHub:', error.message);
      throw error;
    }
  }

  private async checkGitStatus(): Promise<void> {
    console.log('🔍 Verificando estado de Git...');
    
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: this.repoPath });
      
      if (stdout.trim()) {
        console.log('📋 Archivos modificados detectados:');
        console.log(stdout);
      } else {
        console.log('✅ Working directory limpio');
      }
      
      // Verificar que estamos en la rama correcta
      const { stdout: branch } = await execAsync('git branch --show-current', { cwd: this.repoPath });
      console.log(`🌿 Rama actual: ${branch.trim()}`);
      
    } catch (error: any) {
      console.error('❌ Error verificando estado de Git:', error.message);
      throw error;
    }
  }

  private async createImprovementFiles(improvements: DeznityImprovement[]): Promise<void> {
    console.log('📄 Creando archivos de mejoras...');
    
    // Crear directorio de mejoras
    const improvementsDir = path.join(this.repoPath, 'deznity-improvements');
    await fs.ensureDir(improvementsDir);
    
    // Agrupar mejoras por área
    const improvementsByArea = this.groupImprovementsByArea(improvements);
    
    for (const [area, areaImprovements] of Object.entries(improvementsByArea)) {
      const fileName = `${area.toLowerCase().replace(/\s+/g, '-')}-improvements.md`;
      const filePath = path.join(improvementsDir, fileName);
      
      const content = this.generateImprovementFileContent(area, areaImprovements);
      await fs.writeFile(filePath, content);
      
      console.log(`✅ Creado: ${fileName}`);
    }
  }

  private async createArchitectureDocs(improvements: DeznityImprovement[]): Promise<void> {
    console.log('🏗️ Creando documentación de arquitectura...');
    
    const archDir = path.join(this.repoPath, 'docs', 'architecture');
    await fs.ensureDir(archDir);
    
    // Documento de arquitectura actual
    const currentArchPath = path.join(archDir, 'current-architecture.md');
    const currentArchContent = this.generateCurrentArchitectureDoc();
    await fs.writeFile(currentArchPath, currentArchContent);
    
    // Documento de arquitectura propuesta
    const proposedArchPath = path.join(archDir, 'proposed-architecture.md');
    const proposedArchContent = this.generateProposedArchitectureDoc(improvements);
    await fs.writeFile(proposedArchPath, proposedArchContent);
    
    console.log('✅ Documentación de arquitectura creada');
  }

  private async createImprovementRoadmap(improvements: DeznityImprovement[]): Promise<void> {
    console.log('🗺️ Creando roadmap de mejoras...');
    
    const roadmapPath = path.join(this.repoPath, 'DEZNITY_IMPROVEMENT_ROADMAP.md');
    
    // Ordenar mejoras por prioridad
    const sortedImprovements = improvements.sort((a, b) => b.priority - a.priority);
    
    const roadmapContent = this.generateRoadmapContent(sortedImprovements);
    await fs.writeFile(roadmapPath, roadmapContent);
    
    console.log('✅ Roadmap de mejoras creado');
  }

  private async commitAndPush(): Promise<void> {
    console.log('💾 Haciendo commit y push...');
    
    try {
      // Agregar todos los archivos
      await execAsync('git add .', { cwd: this.repoPath });
      
      // Commit con mensaje descriptivo
      const commitMessage = `🤖 Deznity Core Improvements - Session ${this.sessionId}

- Mejoras identificadas por agentes autónomos
- Documentación de arquitectura actualizada
- Roadmap de mejoras priorizado
- Análisis del estado actual del sistema

Generado automáticamente por el sistema de construcción de Deznity Core.`;
      
      await execAsync(`git commit -m "${commitMessage}"`, { cwd: this.repoPath });
      
      // Push a la rama actual
      await execAsync('git push', { cwd: this.repoPath });
      
      console.log('✅ Commit y push completados exitosamente');
      
    } catch (error: any) {
      console.error('❌ Error en commit/push:', error.message);
      throw error;
    }
  }

  private groupImprovementsByArea(improvements: DeznityImprovement[]): Record<string, DeznityImprovement[]> {
    const grouped: Record<string, DeznityImprovement[]> = {};
    
    for (const improvement of improvements) {
      if (!grouped[improvement.area]) {
        grouped[improvement.area] = [];
      }
      grouped[improvement.area].push(improvement);
    }
    
    return grouped;
  }

  private generateImprovementFileContent(area: string, improvements: DeznityImprovement[]): string {
    const sortedImprovements = improvements.sort((a, b) => b.priority - a.priority);
    
    return `# Mejoras de ${area} - Deznity Core

## Resumen
Este documento contiene las mejoras identificadas para el área de **${area}** en el sistema core de Deznity.

**Total de mejoras**: ${improvements.length}  
**Fecha de generación**: ${new Date().toISOString()}  
**Sesión ID**: ${this.sessionId}

## Mejoras Priorizadas

${sortedImprovements.map((imp, index) => `
### ${index + 1}. ${imp.proposedImprovement}

**Impacto**: ${imp.impact.toUpperCase()}  
**Esfuerzo**: ${imp.effort.toUpperCase()}  
**Prioridad**: ${imp.priority}/16

**Estado Actual**: ${imp.currentState}

**Mejora Propuesta**: ${imp.proposedImprovement}

${imp.implementation ? `**Implementación**: ${imp.implementation}` : ''}

---
`).join('')}

## Métricas de Mejoras

- **Críticas**: ${improvements.filter(i => i.impact === 'critical').length}
- **Altas**: ${improvements.filter(i => i.impact === 'high').length}
- **Medias**: ${improvements.filter(i => i.impact === 'medium').length}
- **Bajas**: ${improvements.filter(i => i.impact === 'low').length}

## Próximos Pasos

1. Revisar mejoras críticas y de alta prioridad
2. Implementar mejoras de bajo esfuerzo y alto impacto
3. Planificar implementación de mejoras complejas
4. Validar mejoras implementadas

---

*Generado automáticamente por el sistema de construcción de Deznity Core*
`;
  }

  private generateCurrentArchitectureDoc(): string {
    return `# Arquitectura Actual - Deznity Core

## Visión General
Este documento describe la arquitectura actual del sistema core de Deznity.

## Componentes Principales

### 🤖 Sistema de Agentes
- **8 agentes especializados** operativos
- **Orquestación autónoma** con watcher de 5 minutos
- **Comunicación vía Pinecone** para memoria compartida
- **Logging en Supabase** para monitoreo

### 🧠 Memoria Vectorial
- **Pinecone** como base de conocimiento
- **Namespaces por cliente** para aislamiento
- **Embeddings OpenAI** (text-embedding-3-small, 1536 dims)
- **Consultas semánticas** para recuperación de conocimiento

### 🗄️ Persistencia
- **Supabase** para base de datos relacional
- **Tablas**: clients, projects, agent_activities
- **RLS policies** configuradas
- **Logs en tiempo real**

### 🚀 APIs y Modelos
- **OpenRouter** para acceso a LLMs
- **Modelos**: GPT-4o, Claude 3.5 Sonnet
- **Retry logic** y manejo de errores
- **Rate limiting** implementado

### 📁 Estructura del Proyecto
\`\`\`
deznity-core/
├── scripts/           # Scripts de automatización
├── utils/            # Utilidades compartidas
├── data/             # Datos y conocimiento
├── output/           # Resultados de clientes
└── docs/             # Documentación
\`\`\`

## Flujo de Procesamiento

1. **Detección**: Agente autónomo escanea Supabase
2. **Procesamiento**: simulate:client ejecuta flujo completo
3. **Memoria**: Decisiones guardadas en Pinecone
4. **Logging**: Actividades registradas en Supabase
5. **Output**: Resultados guardados localmente

## Métricas Actuales

- **Throughput**: 30 clientes/hora
- **Tiempo promedio**: ~2 minutos por cliente
- **Success rate**: >95%
- **Uptime**: 99.9% (con PM2)

## Fortalezas

- ✅ Sistema completamente autónomo
- ✅ Escalabilidad demostrada
- ✅ Memoria persistente por cliente
- ✅ Monitoreo en tiempo real
- ✅ Manejo robusto de errores

## Áreas de Mejora

- 🔄 Optimización de performance
- 🔄 Mejora de modularidad
- 🔄 Sistema de testing automatizado
- 🔄 Documentación técnica
- 🔄 CI/CD pipeline

---

*Generado automáticamente por el sistema de construcción de Deznity Core*
`;
  }

  private generateProposedArchitectureDoc(improvements: DeznityImprovement[]): string {
    const criticalImprovements = improvements.filter(i => i.impact === 'critical');
    const highImprovements = improvements.filter(i => i.impact === 'high');
    
    return `# Arquitectura Propuesta - Deznity Core

## Visión General
Este documento describe la arquitectura propuesta para el sistema core de Deznity, basada en las mejoras identificadas por los agentes autónomos.

## Mejoras Críticas Identificadas

${criticalImprovements.map(imp => `
### ${imp.area}
**Mejora**: ${imp.proposedImprovement}  
**Impacto**: ${imp.impact}  
**Prioridad**: ${imp.priority}/16
`).join('')}

## Mejoras de Alto Impacto

${highImprovements.map(imp => `
### ${imp.area}
**Mejora**: ${imp.proposedImprovement}  
**Impacto**: ${imp.impact}  
**Prioridad**: ${imp.priority}/16
`).join('')}

## Arquitectura Propuesta

### 🏗️ Capa de Infraestructura
- **Containerización**: Docker para consistencia
- **Orquestación**: Kubernetes para escalabilidad
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

### 🤖 Capa de Agentes
- **Microservicios**: Cada agente como servicio independiente
- **Message Queue**: Redis/RabbitMQ para comunicación
- **Circuit Breaker**: Para resiliencia
- **Health Checks**: Monitoreo de salud de agentes

### 🧠 Capa de Memoria
- **Pinecone**: Memoria vectorial principal
- **Redis**: Cache de consultas frecuentes
- **Backup**: Replicación automática
- **Compression**: Optimización de almacenamiento

### 🗄️ Capa de Datos
- **Supabase**: Base de datos principal
- **Read Replicas**: Para consultas de solo lectura
- **Backup Strategy**: Backup automático diario
- **Data Archiving**: Archivado de datos antiguos

### 🚀 Capa de APIs
- **API Gateway**: Kong o similar
- **Rate Limiting**: Por cliente y endpoint
- **Authentication**: JWT con refresh tokens
- **Documentation**: OpenAPI/Swagger automático

## Roadmap de Implementación

### Fase 1: Fundación (Semanas 1-2)
- [ ] Containerización con Docker
- [ ] CI/CD pipeline básico
- [ ] Testing automatizado
- [ ] Documentación técnica

### Fase 2: Escalabilidad (Semanas 3-4)
- [ ] Microservicios de agentes
- [ ] Message queue implementation
- [ ] Monitoring y alertas
- [ ] Performance optimization

### Fase 3: Resiliencia (Semanas 5-6)
- [ ] Circuit breakers
- [ ] Health checks avanzados
- [ ] Backup y recovery
- [ ] Disaster recovery plan

### Fase 4: Optimización (Semanas 7-8)
- [ ] Cache layer implementation
- [ ] API gateway
- [ ] Advanced monitoring
- [ ] Performance tuning

## Métricas Objetivo

- **Throughput**: 100 clientes/hora
- **Latencia**: <30 segundos por cliente
- **Uptime**: 99.99%
- **Error Rate**: <0.1%
- **Recovery Time**: <5 minutos

## Beneficios Esperados

- 🚀 **Escalabilidad**: 3x más throughput
- 🛡️ **Resiliencia**: 99.99% uptime
- ⚡ **Performance**: 50% menos latencia
- 🔧 **Mantenibilidad**: Código modular
- 📊 **Observabilidad**: Monitoreo completo

---

*Generado automáticamente por el sistema de construcción de Deznity Core*
`;
  }

  private generateRoadmapContent(improvements: DeznityImprovement[]): string {
    const criticalCount = improvements.filter(i => i.impact === 'critical').length;
    const highCount = improvements.filter(i => i.impact === 'high').length;
    const mediumCount = improvements.filter(i => i.impact === 'medium').length;
    const lowCount = improvements.filter(i => i.impact === 'low').length;
    
    return `# 🗺️ Roadmap de Mejoras - Deznity Core

## Resumen Ejecutivo

**Total de mejoras identificadas**: ${improvements.length}  
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
**Esfuerzo**: ${imp.effort}  
**Prioridad**: ${imp.priority}/16

${imp.implementation ? `**Implementación**: ${imp.implementation}` : ''}
`).join('')}

## 🚀 Mejoras de Alto Impacto (Prioridad 2)

${improvements.filter(i => i.impact === 'high').map((imp, index) => `
### ${index + 1}. ${imp.area}
**Mejora**: ${imp.proposedImprovement}  
**Esfuerzo**: ${imp.effort}  
**Prioridad**: ${imp.priority}/16

${imp.implementation ? `**Implementación**: ${imp.implementation}` : ''}
`).join('')}

## 📅 Timeline de Implementación

### Sprint 1 (Semanas 1-2): Fundación
**Objetivo**: Implementar mejoras críticas de bajo esfuerzo

**Mejoras a implementar**:
${improvements.filter(i => i.impact === 'critical' && i.effort === 'low').map(imp => `- ${imp.proposedImprovement}`).join('\n') || '- Ninguna mejora crítica de bajo esfuerzo identificada'}

### Sprint 2 (Semanas 3-4): Escalabilidad
**Objetivo**: Implementar mejoras de alto impacto

**Mejoras a implementar**:
${improvements.filter(i => i.impact === 'high' && i.effort !== 'high').map(imp => `- ${imp.proposedImprovement}`).join('\n') || '- Ninguna mejora de alto impacto identificada'}

### Sprint 3 (Semanas 5-6): Optimización
**Objetivo**: Implementar mejoras complejas

**Mejoras a implementar**:
${improvements.filter(i => i.effort === 'high').map(imp => `- ${imp.proposedImprovement}`).join('\n') || '- Ninguna mejora compleja identificada'}

### Sprint 4 (Semanas 7-8): Refinamiento
**Objetivo**: Implementar mejoras restantes

**Mejoras a implementar**:
${improvements.filter(i => i.impact === 'medium' || i.impact === 'low').map(imp => `- ${imp.proposedImprovement}`).join('\n') || '- Ninguna mejora de impacto medio/bajo identificada'}

## 📊 Métricas de Seguimiento

### KPIs del Roadmap
- **Mejoras completadas**: 0/${improvements.length}
- **Mejoras críticas completadas**: 0/${criticalCount}
- **Mejoras de alto impacto completadas**: 0/${highCount}
- **Tiempo promedio de implementación**: TBD

### Criterios de Éxito
- ✅ Todas las mejoras críticas implementadas
- ✅ 80% de mejoras de alto impacto implementadas
- ✅ Sistema más estable y performante
- ✅ Documentación actualizada

## 🔄 Proceso de Revisión

### Revisión Semanal
- [ ] Revisar progreso del sprint actual
- [ ] Identificar bloqueadores
- [ ] Ajustar prioridades si es necesario
- [ ] Actualizar timeline

### Revisión Mensual
- [ ] Evaluar impacto de mejoras implementadas
- [ ] Identificar nuevas mejoras
- [ ] Ajustar roadmap basado en resultados
- [ ] Comunicar progreso al equipo

## 📝 Notas de Implementación

### Consideraciones Técnicas
- Todas las mejoras deben mantener compatibilidad hacia atrás
- Implementar testing antes de cada mejora
- Documentar cambios en CHANGELOG.md
- Mantener métricas de performance

### Consideraciones de Negocio
- Priorizar mejoras que impacten directamente a clientes
- Considerar ROI de cada mejora
- Balancear esfuerzo vs impacto
- Mantener estabilidad del sistema

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
    console.error('❌ Uso: npm run github:write <improvements-file>');
    console.error('   Ejemplo: npm run github:write deznity-improvements.json');
    process.exit(1);
  }

  const improvementsFile = args[0];
  const writer = new GitHubWriter();
  
  try {
    // Leer mejoras del archivo
    const improvementsPath = path.join(process.cwd(), improvementsFile);
    const improvementsData = await fs.readFile(improvementsPath, 'utf-8');
    const improvements: DeznityImprovement[] = JSON.parse(improvementsData);
    
    await writer.writeImprovements(improvements);
  } catch (error: any) {
    console.error('❌ Error escribiendo en GitHub:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { GitHubWriter };
