# 🚀 Bootstrap de Deznity - Self-Building AI Growth Engine

Sistema automatizado que permite a los agentes de IA fundar la startup Deznity desde cero, siguiendo el Documento Fundacional y utilizando la base de conocimiento en Pinecone.

## 🎯 Visión General

Este sistema implementa el concepto de **"Self-Building AI Growth Engine"** donde los agentes de IA trabajan de manera coordinada para:

1. **Leer el Documento Fundacional** desde Pinecone
2. **Planificar el desarrollo** siguiendo el roadmap de 8 semanas
3. **Desarrollar la infraestructura** y componentes principales
4. **Crear contenido y marketing** para el go-to-market
5. **Validar y desplegar** el sistema completo

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
deznity-core/
├── scripts/
│   └── bootstrap-deznity.ts      # Orquestador principal
├── utils/
│   ├── sharedMemory.ts           # Memoria compartida en Pinecone
│   ├── supabaseLogger.ts         # Sistema de logging
│   ├── openrouterClient.ts       # Cliente de modelos de IA
│   └── pineconeClient.ts         # Cliente de base de conocimiento
└── data/
    └── chunks/                   # Documento Fundacional y Biblia
```

### Agentes Especializados

| Agente | Función | Modelo | Herramientas |
|--------|---------|--------|--------------|
| 🗂️ **PM Agent** | Coordinación y planificación | GPT-4o | Pinecone Memory, Task Coordination |
| 🌐 **Web Agent** | Desarrollo web y portal | GPT-4o | Web Development, Template Creation |
| 🎨 **UX Agent** | Diseño y branding | GPT-4o | UI Design, Branding, Figma |
| 🔍 **SEO Agent** | Contenido y marketing | GPT-4o | Content Creation, SEO Optimization |
| 🧪 **QA Agent** | Testing y calidad | GPT-4o-mini | Testing, Quality Assurance |
| 📈 **Marketing Agent** | Estrategia de marketing | GPT-4o | Marketing Strategy, Campaign Creation |
| 💰 **Sales Agent** | Proceso de ventas | GPT-4o | Sales Process, Pricing Strategy |
| 📊 **Finance Agent** | Finanzas y métricas | GPT-4o | Financial Modeling, Metrics Tracking |
| 🎯 **Strategy Agent** | Estrategia de negocio | GPT-4o | Market Analysis, Strategy Development |

## 🚀 Configuración Inicial

### 1. Variables de Entorno

```env
# OpenAI (para embeddings)
OPENAI_API_KEY=sk-proj-...

# Pinecone (para base de conocimiento)
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=deznity-core

# OpenRouter (para agentes)
OPENROUTER_API_KEY=sk-or-v1-...

# Supabase (para logging - opcional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### 2. Instalación

```bash
npm install
```

### 3. Poblar Base de Conocimiento

```bash
# Subir Documento Fundacional y Biblia a Pinecone
npm run seed:pinecone
```

## 🎬 Ejecución del Bootstrap

### Comando Principal

```bash
npm run bootstrap-deznity
```

### Fases del Bootstrap

#### 1. **Initialization** (Inicialización)
- ✅ Leer Documento Fundacional desde Pinecone
- ✅ Configurar memoria compartida entre agentes
- ✅ Inicializar sistema de logging
- ✅ Crear estructura de proyecto inicial

#### 2. **Planning** (Planificación)
- ✅ Crear plan detallado de 8 semanas
- ✅ Definir tareas específicas para cada agente
- ✅ Establecer dependencias entre tareas
- ✅ Configurar métricas de seguimiento

#### 3. **Development** (Desarrollo)
- ✅ Desarrollar portal de clientes
- ✅ Crear sistema de autenticación
- ✅ Implementar dashboard de agentes
- ✅ Desarrollar API de integración

#### 4. **Content Creation** (Creación de Contenido)
- ✅ Crear landing page principal
- ✅ Desarrollar contenido SEO
- ✅ Crear materiales de marketing
- ✅ Desarrollar documentación

#### 5. **Testing** (Testing)
- ✅ Testing end-to-end del sistema
- ✅ Validación de funcionalidades
- ✅ Testing de integración
- ✅ Optimización de rendimiento

#### 6. **Deployment** (Despliegue)
- ✅ Configurar infraestructura de producción
- ✅ Desplegar aplicación en Vercel
- ✅ Configurar monitoreo y alertas
- ✅ Preparar documentación de despliegue

## 📊 Monitoreo y Logging

### Memoria Compartida (Pinecone)

- **Namespace `agent_tasks`**: Tareas de agentes
- **Namespace `agent_communications`**: Comunicación entre agentes
- **Namespace `project_state`**: Estado del proyecto

### Logging (Supabase)

- **Tabla `agent_logs`**: Logs de actividad de agentes
- **Tabla `agent_activities`**: Actividades específicas
- **Tabla `project_metrics`**: Métricas del proyecto

### Comandos de Monitoreo

```bash
# Ver logs de un agente específico
npx tsx -e "
import { getAgentLogs } from './utils/supabaseLogger';
getAgentLogs('PM Agent', 10).then(console.log);
"

# Ver métricas del proyecto
npx tsx -e "
import { getProjectMetrics } from './utils/supabaseLogger';
getProjectMetrics(5).then(console.log);
"
```

## 🔧 Características Técnicas

### Orquestación de Agentes
- **CrewAI**: Framework principal para orquestación
- **Memoria Compartida**: Pinecone como base de datos vectorial
- **Comunicación**: Sistema de mensajería entre agentes
- **Logging**: Supabase para persistencia de logs

### Manejo de Errores
- **Reintentos automáticos** con backoff exponencial
- **Logging detallado** de errores y excepciones
- **Recuperación automática** de fallos de agentes
- **Notificaciones** de estado del sistema

### Escalabilidad
- **Agentes modulares** fácilmente reemplazables
- **Tareas paralelas** para mayor eficiencia
- **Memoria distribuida** en Pinecone
- **Logging asíncrono** para mejor rendimiento

## 📈 Métricas de Éxito

### Objetivos del Bootstrap
- ✅ **Tiempo total**: < 2 horas
- ✅ **Tareas completadas**: 24 tareas principales
- ✅ **Agentes activos**: 9 agentes especializados
- ✅ **Tasa de éxito**: > 95%

### Métricas de Calidad
- ✅ **Cobertura de testing**: > 90%
- ✅ **Documentación**: 100% de componentes documentados
- ✅ **Performance**: < 2s tiempo de respuesta
- ✅ **Disponibilidad**: > 99.9%

## 🚨 Solución de Problemas

### Error: "Documento Fundacional no encontrado"
```bash
# Verificar que Pinecone tiene datos
npm run seed:pinecone

# Verificar consulta
npx tsx -e "
import { queryKnowledge } from './utils/pineconeClient';
queryKnowledge('Documento Fundacional', '', 1).then(console.log);
"
```

### Error: "OpenRouter API key invalid"
- Verificar `OPENROUTER_API_KEY` en `.env`
- Confirmar que la API key es válida
- Verificar límites de uso

### Error: "Supabase connection failed"
- Verificar `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- Crear tablas manualmente si es necesario
- El sistema funciona sin Supabase (logs locales)

### Error: "Agent task failed"
- Revisar logs en Supabase o consola
- Verificar dependencias de la tarea
- Reintentar con `npm run bootstrap-deznity`

## 🎯 Próximos Pasos

### Después del Bootstrap
1. **Monitorear sistema** en producción
2. **Optimizar rendimiento** basado en métricas
3. **Agregar nuevos agentes** según necesidades
4. **Expandir funcionalidades** del sistema

### Mejoras Futuras
- **Dashboard web** para monitoreo visual
- **Alertas automáticas** por Slack/Email
- **Métricas en tiempo real** con Grafana
- **CI/CD pipeline** para despliegues automáticos

## 📝 Notas de Desarrollo

- **Idempotencia**: El bootstrap se puede ejecutar múltiples veces
- **Modularidad**: Cada agente es independiente y reemplazable
- **Extensibilidad**: Fácil agregar nuevos agentes y fases
- **Observabilidad**: Logging completo de todas las operaciones

## 🤝 Contribuir

Para contribuir al sistema de bootstrap:

1. **Fork** el repositorio
2. **Crear branch** para nueva funcionalidad
3. **Implementar** cambios siguiendo la arquitectura
4. **Probar** con `npm run bootstrap-deznity`
5. **Crear PR** con descripción detallada

---

**¡Deznity se construye a sí mismo! 🚀**

*"La única agencia digital que se construye a sí misma mientras construye la tuya."*
