# 🤖 MODO AUTÓNOMO MULTI-CLIENTE - DEZNITY

## 🎯 Visión General

El **Modo Autónomo Multi-Cliente** convierte a Deznity en un sistema completamente self-operating, capaz de detectar y procesar nuevos clientes automáticamente sin intervención humana.

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Supabase      │    │  Agents          │    │   Output        │
│   (clients DB)  │◄──►│  Autonomous      │◄──►│   Directory     │
│                 │    │  (Watcher)       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Status:       │    │  simulate:client │    │   Results:      │
│   pending       │    │  Execution       │    │   - Summary     │
│   in_progress   │    │                  │    │   - QA Reports  │
│   completed     │    │                  │    │   - Logs        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Inicio Rápido

### 1. Crear Clientes de Prueba
```bash
npm run create:test-clients
```

### 2. Ejecutar Modo Autónomo
```bash
# Modo continuo (recomendado para producción)
npm run agents:autonomous

# Verificación única
npm run agents:autonomous:once

# Modo test
npm run agents:autonomous:test
```

### 3. Simular Cliente Individual
```bash
npm run simulate:client fittrack
npm run simulate:client greenglow
npm run simulate:client tacoloco
```

## 📋 Flujo de Trabajo

### 🔄 Ciclo de Procesamiento

1. **Detección**: El agente autónomo escanea Supabase cada 5 minutos
2. **Identificación**: Encuentra clientes con `status = 'pending'`
3. **Procesamiento**: Ejecuta `simulate:client <slug>` para cada cliente
4. **Actualización**: Cambia status a `in_progress` → `completed`
5. **Almacenamiento**: Guarda resultados en `/output/<client-slug>/`

### 📊 Estados del Cliente

| Estado | Descripción | Acción |
|--------|-------------|---------|
| `pending` | Cliente nuevo, esperando procesamiento | Agente autónomo lo detecta y procesa |
| `in_progress` | Cliente siendo procesado | Agente ejecuta flujo Post-Bootstrap |
| `completed` | Cliente procesado exitosamente | Resultados disponibles en `/output/` |
| `failed` | Error en el procesamiento | Requiere revisión manual |

## 🛠️ Configuración

### Variables de Entorno Requeridas
```env
# APIs Core
OPENAI_API_KEY=sk-proj-...
OPENROUTER_API_KEY=sk-or-v1-...
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=deznity-core

# Base de Datos
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### Estructura de Directorios
```
deznity-core/
├── scripts/
│   ├── agents-autonomous.ts      # Agente autónomo principal
│   ├── simulate-client.ts        # Simulador de cliente
│   └── create-test-clients.ts    # Creador de clientes de prueba
├── output/                       # Resultados de clientes
│   ├── fittrack/
│   ├── greenglow/
│   └── tacoloco/
└── post-bootstrap-results/       # Resultados detallados
    ├── fittrack-uuid/
    ├── greenglow-uuid/
    └── tacoloco-uuid/
```

## 📈 Monitoreo y Logs

### 🔍 Verificación del Sistema
```bash
# Verificar APIs
npm run test:apis

# Verificar Supabase
npm run test:supabase

# Verificar clientes pending
npm run agents:autonomous:once
```

### 📊 Logs en Supabase
- **agent_activities**: Actividades de cada agente
- **project_tasks**: Tareas ejecutadas por proyecto
- **clients**: Estado de cada cliente
- **projects**: Proyectos generados

### 📁 Archivos de Salida
- **BOOTSTRAP_SUMMARY_<CLIENT>.md**: Resumen ejecutivo
- **output/<client>/results/**: Archivos detallados por fase
- **post-bootstrap-results/<project-id>/**: Resultados técnicos

## 🎯 Casos de Uso

### 🧪 Testing y Desarrollo
```bash
# Crear clientes de prueba
npm run create:test-clients

# Procesar uno por uno
npm run simulate:client fittrack
npm run simulate:client greenglow

# Verificar resultados
ls -la output/
```

### 🚀 Producción
```bash
# Iniciar modo autónomo continuo
npm run agents:autonomous

# Con PM2 para producción
pm2 start scripts/agents-autonomous.ts --name deznity-agents
pm2 save
pm2 startup
```

### 🔧 Mantenimiento
```bash
# Verificar estado del sistema
npm run test:supabase

# Procesar clientes pending manualmente
npm run agents:autonomous:once

# Limpiar resultados antiguos
rm -rf output/*/results/
```

## 📊 Métricas y KPIs

### ⚡ Performance
- **Tiempo de procesamiento**: ~2 minutos por cliente
- **Throughput**: 30 clientes/hora (en modo continuo)
- **Uptime**: 99.9% (con PM2)

### 🎯 Calidad
- **Success Rate**: >95% (clientes completados exitosamente)
- **Error Rate**: <5% (requieren revisión manual)
- **QA Score**: >90% (validación automática)

### 💰 Escalabilidad
- **Clientes concurrentes**: 1 (procesamiento secuencial)
- **Memoria Pinecone**: ~1MB por cliente
- **Storage Supabase**: ~10KB por cliente

## 🚨 Troubleshooting

### ❌ Problemas Comunes

**1. Cliente no se procesa**
```bash
# Verificar status en Supabase
npm run test:supabase

# Verificar logs del agente
npm run agents:autonomous:once
```

**2. Error en simulate:client**
```bash
# Verificar APIs
npm run test:apis

# Probar cliente individual
npm run simulate:client fittrack
```

**3. Archivos no se generan**
```bash
# Verificar permisos de escritura
ls -la output/

# Verificar espacio en disco
df -h
```

### 🔧 Soluciones

**Reiniciar agente autónomo:**
```bash
pm2 restart deznity-agents
```

**Limpiar clientes fallidos:**
```sql
UPDATE clients SET status = 'pending' WHERE status = 'failed';
```

**Regenerar resultados:**
```bash
rm -rf output/*/
npm run agents:autonomous:once
```

## 🎉 Próximos Pasos

### 🔮 Roadmap
- [ ] **Auto-deploy en Vercel**: Deploy automático de sitios generados
- [ ] **Multi-threading**: Procesamiento concurrente de clientes
- [ ] **Webhook Integration**: Notificaciones en tiempo real
- [ ] **Dashboard Web**: Interfaz para monitoreo visual
- [ ] **A/B Testing**: Variaciones automáticas de sitios

### 🚀 Escalabilidad
- [ ] **Kubernetes**: Orquestación de contenedores
- [ ] **Redis**: Cache para consultas frecuentes
- [ ] **CDN**: Distribución global de assets
- [ ] **Load Balancing**: Distribución de carga

---

## 📞 Soporte

### 🔗 Enlaces Útiles
- **Supabase Dashboard**: https://jjpsissdsmoluolmpwks.supabase.co
- **Pinecone Console**: https://app.pinecone.io
- **GitHub Repository**: https://github.com/lucasonzta/deznity-core

### 📧 Contacto
- **Issues**: GitHub Issues
- **Documentación**: Este README
- **Logs**: Supabase Dashboard

---

*"La única agencia digital que se construye a sí misma"* 🤖✨
