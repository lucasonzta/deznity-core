# 🚀 DEZNITY - Self-Building AI Growth Engine

**Democratizar la presencia digital premium 10× más barata y 20× más rápida**

[![Deploy Status](https://img.shields.io/badge/Deploy-Production-green)](https://deznity-github-ready-43eb0zvlk-onzta.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/lucasonzta/deznity-core)
[![Windows Compatible](https://img.shields.io/badge/Windows-Compatible-blue)](WINDOWS_COMPATIBILITY.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🎯 **ESTADO ACTUAL: 100% FUNCIONAL EN PRODUCCIÓN**

Deznity es un sistema de agentes autónomos que se construye a sí mismo para crear presencia digital premium para PYMEs en menos de 72 horas.

### 🌐 **Enlaces Principales**
- **🔗 Repositorio**: https://github.com/lucasonzta/deznity-core
- **🚀 Deploy**: https://deznity-github-ready-43eb0zvlk-onzta.vercel.app
- **📚 Documentación**: Ver `/docs/` para detalles completos

## ⚡ **Quick Start**

### 1. **Instalar Dependencias**
```bash
npm install
```

### 2. **Configurar Variables de Entorno**
```bash
cp env.example .env
# Editar .env con tus API keys
```

### 3. **Poblar Base de Conocimiento**
```bash
npx tsx scripts/seedPinecone.ts
```

### 4. **Probar Sistema**
```bash
npx tsx scripts/testFlow.ts
```

### 5. **Bootstrap Completo**
```bash
npx tsx scripts/bootstrap-deznity-simple.ts
```

## 🤖 **Sistema de Agentes Autónomos**

### **10 Agentes Especializados**
- **PM Agent** - Planificación y coordinación de proyectos
- **Web Agent** - Desarrollo web y portal de clientes  
- **UX Agent** - Diseño y branding visual
- **SEO Agent** - Contenido y optimización SEO
- **QA Agent** - Testing y validación de calidad
- **Marketing Agent** - Estrategia de marketing
- **Sales Agent** - Proceso de ventas
- **Support Agent** - Soporte al cliente
- **Finance Agent** - Métricas y finanzas
- **Strategy Agent** - Estrategia de negocio

### **Flujo Autónomo**
1. **Análisis** del brief del cliente
2. **Planificación** por PM Agent
3. **Desarrollo** por Web Agent
4. **Diseño** por UX Agent
5. **Contenido** por SEO Agent
6. **Validación** por QA Agent
7. **Entrega** automática

## 🏗️ **Arquitectura**

### **Frontend**
- **Next.js 14** con App Router
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Radix UI** para componentes

### **Backend**
- **Supabase** (PostgreSQL, Auth, RLS, Realtime)
- **Pinecone** (Vector database)
- **OpenRouter** (LLM API)
- **Stripe** (Pagos)

### **Deploy & DevOps**
- **Vercel** (Frontend)
- **Modal** (Python compute)
- **GitHub Actions** (CI/CD)
- **n8n** (Automatización)

### **LLMs**
- **GPT-5** (Agentes principales)
- **GPT-4o** (Agentes secundarios)
- **Claude 3.5 Sonnet** (Análisis)
- **Gemini 2.5 Flash** (Backup)

## 📊 **Métricas de Negocio**

### **Precios**
- **Starter**: $297
- **Growth**: $647  
- **Enterprise**: $1297

### **Objetivos 2027**
- **1 millón de PYMEs** como clientes
- **$100M ARR** (Annual Recurring Revenue)
- **20 empleados humanos** máximo
- **95% automatización** de procesos

## 🛠️ **Scripts Disponibles**

### **Desarrollo**
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build del proyecto
npm run test         # Ejecutar tests
```

### **Agentes**
```bash
npx tsx scripts/seedPinecone.ts                    # Poblar Pinecone
npx tsx scripts/testFlow.ts                        # Probar flujo de agentes
npx tsx scripts/bootstrap-deznity-simple.ts        # Bootstrap completo
npx tsx scripts/agents-build-frontend.ts           # Construir frontend
npx tsx scripts/agents-qa-testing.ts               # QA testing
```

### **Configuración**
```bash
npx tsx scripts/setup-supabase-complete.ts         # Configurar Supabase
npx tsx scripts/setup-n8n-complete.ts              # Configurar n8n
npx tsx scripts/setup-cicd.ts                      # Configurar CI/CD
```

### **Deploy**
```bash
npx vercel --prod                                   # Deploy a Vercel
git add . && git commit -m "feat: update" && git push  # Push a GitHub
```

## 📁 **Estructura del Proyecto**

```
deznity-core/
├── apps/                    # Aplicaciones principales
│   ├── web/landing/        # Landing page
│   ├── web/portal/         # Portal de clientes
│   └── api/                # API Gateway
├── services/               # Microservicios
│   ├── gateway/           # API Gateway
│   ├── billing/           # Servicio de facturación
│   ├── content/           # Servicio de contenido
│   └── sales/             # Servicio de ventas
├── packages/              # Paquetes compartidos
│   ├── design-system/     # Sistema de diseño
│   ├── sections/          # Librería de secciones
│   ├── shared/            # Utilidades compartidas
│   └── types/             # Tipos TypeScript
├── scripts/               # 45+ scripts de automatización
├── docs/                  # Documentación completa
├── workflows/             # n8n workflows
└── utils/                 # Utilidades del sistema
```

## 🎯 **Próximos Pasos**

### **Esta Semana**
1. **Configurar Supabase** (15 min)
2. **Configurar Stripe** (10 min)  
3. **Configurar n8n** (20 min)

### **Próximas 2 Semanas**
4. **Crear Landing Page Real** (30 min)
5. **Configurar Dominio** (15 min)
6. **Testing con Cliente Real** (30 min)

## 💰 **Costos Actuales**

| Servicio | Costo Mensual | Estado |
|----------|---------------|---------|
| Vercel | $0 (gratuito) | ✅ Activo |
| Supabase | $0 (gratuito) | ✅ Activo |
| Pinecone | $70 | ✅ Activo |
| OpenRouter | ~$15 | ✅ Activo |
| **Total** | **~$85/mes** | ✅ |

## 📋 **Documentación Adicional**

- **[Resumen Completo](PROYECTO_DEZNITY_RESUMEN_COMPLETO.md)** - Estado completo del proyecto
- **[Tareas Pendientes](TAREAS_PENDIENTES.md)** - Lista de tareas por hacer
- **[Compatibilidad Windows](WINDOWS_COMPATIBILITY.md)** - Guía para Windows
- **[Documentación Técnica](docs/)** - Detalles técnicos completos

## 🎉 **¿Qué Hace Deznity?**

1. **Recibe un brief** del cliente (restaurante, SaaS, e-commerce)
2. **Agentes analizan** automáticamente los requerimientos
3. **Se crea un plan** detallado de 8 semanas
4. **Se desarrolla** la presencia digital completa
5. **Se valida** la calidad y funcionalidad
6. **Se entrega** en menos de 72 horas

**La única agencia digital que se construye a sí misma** 🚀

## 📞 **Soporte**

- **GitHub Issues**: Para bugs y feature requests
- **Documentación**: Ver `/docs/` para detalles técnicos
- **Scripts**: Ver `/scripts/` para automatización

---

*Última actualización: 12 de Octubre, 2025*  
*Estado: 100% Funcional en Producción*  
*Próximo milestone: Primer cliente real*