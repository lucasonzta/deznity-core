🌌 Deznity Core – AI Growth Engine
Deznity Core es el núcleo de agentes inteligentes y base de conocimiento vectorial que permite crear, mantener y escalar proyectos digitales de forma 100% automatizada.
El sistema combina OpenRouter (LLMs multi-proveedor) + Pinecone (memoria vectorial) para ejecutar proyectos end-to-end con mínima intervención humana.
✅ Estado Actual
🎉 Sistema de agentes funcionando en producción:
OpenRouter Client → conexión unificada a modelos GPT, Claude, Gemini.
Pinecone Client → consultas vectoriales y guardado de decisiones.
Test Flow → flujo de prueba completo (ejemplo: restaurante TacoLoco).
📊 Resultados del primer test:
Tiempo total: ~30 segundos
Tokens consumidos: ~12,000
Decisiones guardadas en Pinecone: 5
Tasa de éxito: 100%
🧠 Arquitectura de Agentes
Cada agente está asociado a un modelo específico vía OpenRouter:
Agente	Modelo	Función	KPI
🗂️ PM Agent	gpt-4.1	Planificación de proyectos, DAG de tareas	Desvío ≤ 5%
🌐 Web Agent	gpt-4o	Selección y despliegue de plantillas	Lighthouse ≥ 95
🎨 UX Agent	claude-3.5-sonnet	Tokens de diseño, wireframes en Figma	SUS ≥ 85
✍️ SEO Agent	gemini-2.5-flash	Copy optimizado, schema SEO	Top-10 SERP
🐞 QA Agent	gpt-5-mini	Validación técnica y accesibilidad	Bugs > P3 = 0
📂 Memoria persistente:
deznity-core → Biblia (chunks del manifiesto, SOPs, stack).
client-{uuid} → Briefs y outputs por cliente.
templates → Plantillas Webflow/Next.js.
logs → Auditoría y decisiones.
📁 Estructura del Proyecto
deznity-core/
├── data/
│   ├── chunks/          # Chunks de la Biblia Deznity
│   └── briefs/          # Briefs semilla (ej. TacoLoco, FitTrack, GreenGlow)
├── utils/
│   ├── openrouterClient.ts  # Cliente OpenRouter
│   └── pineconeClient.ts    # Cliente Pinecone
├── scripts/
│   ├── seedPinecone.ts      # Poblar Pinecone
│   └── testFlow.ts          # Flujo de prueba completo
├── package.json
├── .env
└── README.md (este archivo)
🚀 Cómo Usar el Sistema
1. Poblar Pinecone con la Knowledge Base
npm run seed:pinecone
2. Probar un flujo completo de proyecto
npm run test:flow
👉 Simula la creación de un proyecto (ejemplo: “Restaurante TacoLoco”).
Cada agente ejecuta su tarea y guarda resultados en Pinecone.
🔑 Variables de Entorno
# OpenRouter
OPENROUTER_API_KEY=tu_api_key_aqui

# Pinecone
PINECONE_API_KEY=tu_api_key_aqui
PINECONE_ENV=us-east-1
PINECONE_INDEX_NAME=deznity-core
🌟 Características Clave
Multi-LLM: acceso a GPT, Claude, Gemini vía OpenRouter.
Persistencia: memoria vectorial por cliente en Pinecone.
Modularidad: agentes reemplazables fácilmente.
Escalabilidad: namespaces separados (core / cliente / logs).
Robustez: manejo de errores y reintentos automáticos.
Observabilidad: logs detallados en consola + auditoría en Pinecone.
📌 Próximos Pasos
Mission Control Dashboard (Next.js + Supabase)
Crear proyectos desde UI
Ver estado de cada agente en tiempo real
Portal de Clientes
Login seguro
Previews, comentarios, aprobación de proyectos
Integración con Stripe
Facturación y planes SaaS
Analytics en tiempo real
Tokens consumidos, costos, performance por proyecto
🤝 Contribuir
Para agregar nuevo conocimiento:
Guardar archivos en data/chunks/ o data/briefs/.
Ejecutar npm run seed:pinecone.
Los nuevos datos se indexan automáticamente.
💡 Deznity Core ya está listo para producción.
Próximo hito: construir la capa de experiencia de usuario encima de este motor de agentes. 🚀