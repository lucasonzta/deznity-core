# 🚀 Deznity - Self-Building AI Growth Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

> **Democratizar presencia digital premium 10× más barata y 20× más rápida**

Deznity es un **Self-Building AI Growth Engine** que transforma la presencia digital de las PYMEs mediante agentes de IA autónomos, entregando sitios web premium en menos de 72 horas.

## 🎯 Misión

**Democratizar la presencia digital premium 10× más barata y 20× más rápida**

- **10× más barato**: Calidad premium a una fracción del costo tradicional
- **20× más rápido**: Entrega en menos de 72 horas vs. meses tradicionales
- **Self-Building**: Agentes de IA que construyen y mejoran el sistema autónomamente

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + JWT
- **Billing**: Stripe
- **IA**: OpenRouter (GPT-5)
- **Vector DB**: Pinecone
- **Automation**: n8n
- **Monitoring**: Sentry
- **Deploy**: Vercel, Modal

### Microservicios
- **Gateway Service**: Auth, rate limiting, tracing
- **Billing Service**: Stripe integration, webhooks
- **Content Service**: OpenRouter integration, IA
- **Sales Service**: CRM, leads, deals

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm 8+
- Docker (opcional)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/deznity/deznity.git
cd deznity

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Iniciar desarrollo
npm run dev
```

### Variables de Entorno

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment

# n8n
N8N_BASIC_AUTH_USER=your_n8n_user
N8N_BASIC_AUTH_PASSWORD=your_n8n_password

# Sentry
SENTRY_DSN=your_sentry_dsn
```

## 📁 Estructura del Proyecto

```
deznity/
├── apps/                    # Aplicaciones
│   ├── web/                # Next.js App (Landing + Portal)
│   └── api/                # API Gateway
├── services/               # Microservicios
│   ├── gateway/            # Auth, rate limiting, tracing
│   ├── billing/            # Stripe integration
│   ├── content/            # Content orchestration
│   └── sales/              # CRM + lead management
├── packages/               # Paquetes compartidos
│   ├── sections/           # Librería de secciones
│   ├── design-system/      # Design tokens + componentes
│   ├── shared/             # Utilidades compartidas
│   └── types/              # TypeScript types
├── modal/                  # Python workers
│   ├── content_service/    # Content generation
│   └── workers/            # Batch jobs
├── docs/                   # Documentación
├── scripts/                # Scripts de automatización
└── tests/                  # Tests
```

## 🤖 Agentes de IA

Deznity utiliza agentes especializados que construyen y mejoran el sistema autónomamente:

- **Web Agent**: Landing pages, librería de secciones
- **UX Agent**: Client portal, design system
- **QA Agent**: Testing, performance, security
- **PM Agent**: Project management, coordination
- **SEO Agent**: Content optimization, SEO
- **Marketing Agent**: Campaigns, growth
- **Sales Agent**: CRM, lead management
- **Support Agent**: Customer success
- **Finance Agent**: Billing, metrics
- **Strategy Agent**: Market analysis, planning

## 💰 Pricing

- **Starter**: $297/mes - 1 sitio, 72h entrega
- **Growth**: $647/mes - 3 sitios, 48h entrega
- **Enterprise**: $1,297/mes - Ilimitado, 24h entrega

## 📊 Métricas Objetivo

- **CAC**: < 500 USD
- **LTV**: > 5000 USD
- **NPS**: ≥ 60
- **Tiempo de entrega**: < 72 horas
- **MRR objetivo D90**: 10k USD

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests end-to-end
npm run test:e2e

# Tests de performance
npm run test:performance

# Tests de accesibilidad
npm run test:accessibility
```

## 🚀 Deploy

### Staging
```bash
npm run deploy:staging
```

### Producción
```bash
npm run deploy:production
```

## 📈 Monitoreo

- **Sentry**: Error tracking
- **Supabase**: Analytics y logs
- **n8n**: Workflow monitoring
- **Stripe**: Billing analytics

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🎯 Visión 2027

- **1M PYMEs** usando Deznity
- **100M ARR** en revenue
- **20 empleados** humanos
- **Global expansion**

## 📞 Contacto

- **Website**: [deznity.com](https://deznity.com)
- **Email**: hello@deznity.com
- **Twitter**: [@deznity](https://twitter.com/deznity)

---

**Construido con ❤️ por agentes de IA autónomos**
