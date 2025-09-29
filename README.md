# 🚀 Deznity Core - Self-Building AI Growth Engine

> **"La única agencia digital que se construye a sí misma mientras construye la tuya."**

Deznity es un sistema de agentes de IA que automatiza completamente la creación de presencia digital premium para PYMEs, democratizando el acceso a soluciones digitales de alta calidad.

## 🎯 Visión

**Misión**: Democratizar la presencia digital premium 10× más barata y 20× más rápida.

**Visión 2027**: 1 millón de PYMEs, 100M ARR, 20 empleados humanos.

## 🏗️ Arquitectura

### Stack Tecnológico
- **LLMs**: GPT-4o, Claude 3.5 Sonnet, Gemini 2.5 Flash
- **Infraestructura**: Supabase, Vercel, Stripe, Pinecone, Modal, n8n, OpenRouter
- **Desarrollo**: TypeScript, Node.js, CrewAI

### Agentes Especializados
- 🗂️ **PM Agent** - Planificación y coordinación
- 🌐 **Web Agent** - Desarrollo web y portal de clientes
- 🎨 **UX Agent** - Diseño y branding visual
- 🔍 **SEO Agent** - Contenido y optimización SEO
- 🧪 **QA Agent** - Testing y calidad
- 📈 **Marketing Agent** - Estrategia de marketing
- 💰 **Sales Agent** - Proceso de ventas
- 📊 **Finance Agent** - Métricas y finanzas
- 🎯 **Strategy Agent** - Estrategia de negocio

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- Cuentas en OpenAI, Pinecone, OpenRouter
- (Opcional) Supabase para logging

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/deznity-core.git
cd deznity-core

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus API keys
```

### Variables de Entorno

```env
# OpenAI (para embeddings)
OPENAI_API_KEY=sk-proj-...

# Pinecone (para base de conocimiento)
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=deznity-core

# OpenRouter (para agentes)
OPENROUTER_API_KEY=sk-or-v1-...

# Supabase (opcional, para logging)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### Comandos Principales

```bash
# Poblar base de conocimiento en Pinecone
npm run seed:pinecone

# Ejecutar bootstrap completo (agentes construyen Deznity)
npm run bootstrap-deznity

# Probar flujo de agentes
npm run test:flow

# Procesamiento offline (genera JSONs locales)
npm run seed:offline
```

## 📚 Documentación

- **[BOOTSTRAP_README.md](./BOOTSTRAP_README.md)** - Guía completa del sistema de bootstrap
- **[AGENTS_README.md](./AGENTS_README.md)** - Documentación de agentes y flujos
- **[data/chunks/](./data/chunks/)** - Documento Fundacional y Biblia Pinecone

## 🎬 Demo del Bootstrap

El sistema puede construir Deznity completamente de forma autónoma:

```bash
npm run bootstrap-deznity
```

**Resultado**: Los agentes leen el Documento Fundacional, planifican, desarrollan, crean contenido, validan y preparan para despliegue.

## 📊 Características

### ✅ Implementado
- [x] Base de conocimiento en Pinecone
- [x] Sistema de agentes con OpenRouter
- [x] Memoria compartida entre agentes
- [x] Bootstrap automatizado
- [x] Sistema de logging
- [x] Documento Fundacional completo

### 🚧 En Desarrollo
- [ ] Dashboard web de monitoreo
- [ ] Integración con Supabase
- [ ] CI/CD pipeline
- [ ] Métricas en tiempo real

## 🏢 Pricing

- **Starter**: $297/mes + $499 setup
- **Growth**: $647/mes + $699 setup  
- **Enterprise**: $1297/mes + $999 setup

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🎯 Roadmap

- **Semana 1-2**: Infraestructura + agentes core
- **Semana 3-5**: Client portal, templates, copy, billing
- **Semana 6-8**: Landing, marketing, beta, onboarding 20 clientes
- **Objetivo D90**: 10k USD MRR

## 📞 Contacto

- **Website**: [deznity.ai](https://deznity.ai) (próximamente)
- **Email**: hello@deznity.ai
- **Twitter**: [@deznity_ai](https://twitter.com/deznity_ai)

---

**Deznity** - Democratizando la presencia digital premium 🚀