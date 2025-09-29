# 🤖 Sistema de Agentes Deznity

Sistema completo de agentes de IA que utiliza la base de conocimiento de Pinecone para automatizar el flujo de proyectos web.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **`utils/openrouterClient.ts`** - Cliente para OpenRouter
2. **`utils/pineconeClient.ts`** - Cliente para consultas y guardado en Pinecone
3. **`scripts/testFlow.ts`** - Simulación completa del flujo de agentes

### Agentes Disponibles

| Agente | Modelo | Función | Temperatura |
|--------|--------|---------|-------------|
| 🗂️ **PM Agent** | `openai/gpt-4o` | Planificación de proyectos | 0.3 |
| 🌐 **Web Agent** | `openai/gpt-4o` | Selección de plantillas | 0.4 |
| 🎨 **UX Agent** | `openai/gpt-4o` | Diseño y tokens | 0.6 |
| 🔍 **SEO Agent** | `openai/gpt-4o` | Contenido y SEO | 0.5 |
| 🧪 **QA Agent** | `openai/gpt-4o-mini` | Validación y reportes | 0.2 |

## 🚀 Configuración

### Variables de Entorno Requeridas

```env
# OpenAI (para embeddings)
OPENAI_API_KEY=sk-proj-...

# Pinecone (para base de conocimiento)
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=deznity-core

# OpenRouter (para agentes)
OPENROUTER_API_KEY=sk-or-v1-...
```

### Instalación

```bash
npm install
```

## 📋 Uso del Sistema

### 1. Poblar Base de Conocimiento

```bash
# Subir chunks y briefs a Pinecone
npm run seed:pinecone

# O procesar offline (genera JSONs)
npm run seed:offline
```

### 2. Ejecutar Flujo de Agentes

```bash
# Simular flujo completo con TacoLoco
npm run test:flow
```

## 🔄 Flujo de Trabajo

### Paso 1: Obtención del Brief
- Busca briefs existentes en `deznity-core`
- Si no encuentra, crea uno simulado
- Genera namespace único para el cliente

### Paso 2: PM Agent - Planificación
- Consulta base de conocimiento sobre procesos PM
- Genera plan detallado del proyecto
- Guarda decisión en namespace del cliente

### Paso 3: Web Agent - Plantillas
- Busca plantillas disponibles
- Selecciona y configura plantilla apropiada
- Guarda decisión en namespace del cliente

### Paso 4: UX Agent - Diseño
- Genera wireframes y tokens de diseño
- Crea componentes y flujos de usuario
- Guarda decisión en namespace del cliente

### Paso 5: SEO Agent - Contenido
- Crea copy optimizado para conversión
- Genera keywords y estructura SEO
- Guarda decisión en namespace del cliente

### Paso 6: QA Agent - Validación
- Valida todos los entregables
- Genera reporte de calidad
- Guarda decisión en namespace del cliente

## 📊 Resultados del Test Flow

```
🚀 Iniciando simulación de flujo de proyecto Deznity
============================================================
👤 Cliente: TacoLoco
🏷️  Namespace: client-3fb3d141-37d7-4a71-8b25-74889d1d8d72

📋 PASO 1: Obteniendo brief del cliente ✅
🗂️  PASO 2: PM Agent - Planificación del proyecto ✅
🌐 PASO 3: Web Agent - Selección de plantilla ✅
🎨 PASO 4: UX Agent - Diseño y tokens ✅
🔍 PASO 5: SEO Agent - Contenido y SEO ✅
🧪 PASO 6: QA Agent - Validación y reporte final ✅

📊 RESUMEN FINAL DEL PROYECTO
============================================================
👤 Cliente: TacoLoco
🏷️  Namespace: client-3fb3d141-37d7-4a71-8b25-74889d1d8d72
📋 Brief: TacoLoco Brief
🗂️  Plan PM: 2780 caracteres
🌐 Plantilla Web: 2338 caracteres
🎨 Diseño UX: 2962 caracteres
🔍 Contenido SEO: 5447 caracteres
🧪 Reporte QA: 3650 caracteres

🎉 ¡Flujo de proyecto completado exitosamente!
```

## 🛠️ API de los Módulos

### OpenRouter Client

```typescript
import { callAgent, callModel } from './utils/openrouterClient';

// Llamar agente específico
const response = await callAgent('pm', [
  createSystemMessage('Eres un PM experto...'),
  createUserMessage('Planifica este proyecto...')
]);

// Llamar modelo directamente
const response = await callModel('openai/gpt-4o', messages, {
  temperature: 0.7,
  maxTokens: 2000
});
```

### Pinecone Client

```typescript
import { queryKnowledge, saveDecision } from './utils/pineconeClient';

// Consultar base de conocimiento
const chunks = await queryKnowledge('plantillas web', 'deznity-core', 5);

// Guardar decisión del agente
await saveDecision('Plan del proyecto...', 'client-uuid', 'pm', {
  phase: 'planning',
  timestamp: new Date().toISOString()
});
```

## 🔧 Características Técnicas

### Manejo de Errores
- Reintentos automáticos con backoff exponencial
- Logs detallados para debugging
- Fallbacks para modelos no disponibles

### Escalabilidad
- Namespaces separados por cliente
- Base de conocimiento centralizada
- Agentes modulares y reemplazables

### Monitoreo
- Tracking de tokens utilizados
- Logs de decisiones de cada agente
- Historial completo por cliente

## 📈 Métricas de Rendimiento

### Test Flow Exitoso
- **Tiempo total**: ~30 segundos
- **Tokens utilizados**: ~12,000 tokens
- **Decisiones guardadas**: 5 (una por agente)
- **Tasa de éxito**: 100%

### Costos Estimados (OpenRouter)
- **GPT-4o**: ~$0.12 por 1K tokens
- **GPT-4o-mini**: ~$0.03 por 1K tokens
- **Costo total por proyecto**: ~$1.50

## 🎯 Próximos Pasos

1. **Integración con Webflow**: Conectar Web Agent con API de Webflow
2. **Templates reales**: Cargar plantillas reales en Pinecone
3. **Dashboard**: Crear interfaz para monitorear proyectos
4. **Más agentes**: Agregar agentes de marketing, ventas, etc.
5. **Automatización**: Trigger automático desde briefs de clientes

## 🚨 Solución de Problemas

### Error: "Model not found"
- Verificar que el modelo existe en OpenRouter
- Actualizar `AGENT_CONFIGS` con modelos válidos

### Error: "No chunks found"
- Verificar que Pinecone tiene datos
- Ejecutar `npm run seed:pinecone` primero

### Error: "API key invalid"
- Verificar variables de entorno en `.env`
- Confirmar que las API keys son válidas

## 📝 Notas de Desarrollo

- Todos los agentes usan la misma base de conocimiento
- Las decisiones se guardan automáticamente en Pinecone
- El sistema es completamente modular y extensible
- Los logs incluyen emojis para fácil identificación visual
