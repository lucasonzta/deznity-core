# 🪟 COMPATIBILIDAD CON WINDOWS - DEZNITY

## ✅ **ESTADO: 100% COMPATIBLE CON WINDOWS**

Todos los archivos han sido renombrados y configurados para ser completamente compatibles con Windows.

---

## 🔄 **CAMBIOS REALIZADOS PARA WINDOWS**

### **1. Renombrado de Archivos**
Los siguientes archivos fueron renombrados automáticamente por Git para compatibilidad:

#### **Antes (macOS/Linux)**
```
Briefs Semilla (namespace: client-{uuid})/
├── 1. Restaurante – TacoLoco
├── 2. SaaS – FitTrack
└── 3. E-commerce – GreenGlow

Chunk 1 – Metadata
Chunk 2 – Manifiesto
Chunk 3 – Roadmap
Chunk 4 – Agentes (parte 1)
Chunk 5 – Agentes (parte 2)
Chunk 6 – Stack técnico
Chunk 7 – SOP: Crear Proyecto Cliente
Chunk 8 – SOP: Validar Contenido HITL
Chunk 9 – Plantillas - Prompts base
Chunk 10 – Índices y namespaces
```

#### **Después (Windows Compatible)**
```
Briefs_Semilla_client-uuid/
├── 1_Restaurante_TacoLoco
├── 2_SaaS_FitTrack
└── 3_E-commerce_GreenGlow

Chunk_1_Metadata
Chunk_2_Manifiesto
Chunk_3_Roadmap
Chunk_4_Agentes_parte_1
Chunk_5_Agentes_parte_2
Chunk_6_Stack_tecnico
Chunk_7_SOP_Crear_Proyecto_Cliente
Chunk_8_SOP_Validar_Contenido_HITL
Chunk_9_Plantillas_Prompts_base
Chunk_10_Indices_y_namespaces
```

### **2. Caracteres Eliminados**
- **Guiones largos (–)** → **Guiones normales (-)**
- **Espacios en nombres** → **Guiones bajos (_)**
- **Caracteres especiales** → **ASCII estándar**
- **Acentos** → **Sin acentos**

---

## 🛠️ **CONFIGURACIÓN PARA WINDOWS**

### **1. Variables de Entorno**
Crear archivo `.env` en la raíz del proyecto:

```env
# OpenAI
OPENAI_API_KEY=tu_api_key_aqui

# Pinecone
PINECONE_API_KEY=tu_api_key_aqui
PINECONE_ENVIRONMENT=tu_environment_aqui

# Supabase
SUPABASE_URL=tu_url_aqui
SUPABASE_ANON_KEY=tu_anon_key_aqui

# OpenRouter
OPENROUTER_API_KEY=tu_api_key_aqui

# Stripe (opcional por ahora)
STRIPE_SECRET_KEY=tu_secret_key_aqui
STRIPE_PUBLISHABLE_KEY=tu_publishable_key_aqui
```

### **2. Instalación de Dependencias**
```bash
# Instalar Node.js (versión 18 o superior)
# Descargar desde: https://nodejs.org/

# Instalar dependencias
npm install

# Instalar TypeScript globalmente (opcional)
npm install -g typescript

# Instalar tsx globalmente para ejecutar scripts
npm install -g tsx
```

### **3. Scripts Compatibles con Windows**
Todos los scripts están configurados para funcionar en Windows:

```bash
# Poblar Pinecone
npx tsx scripts/seedPinecone.ts

# Probar flujo de agentes
npx tsx scripts/testFlow.ts

# Bootstrap completo
npx tsx scripts/bootstrap-deznity-simple.ts

# Configurar Supabase
npx tsx scripts/setup-supabase-complete.ts

# Configurar n8n
npx tsx scripts/setup-n8n-complete.ts
```

---

## 🔧 **COMANDOS ESPECÍFICOS PARA WINDOWS**

### **PowerShell**
```powershell
# Navegar al directorio
cd C:\ruta\a\deznity-core

# Instalar dependencias
npm install

# Ejecutar scripts
npx tsx scripts/seedPinecone.ts
```

### **Command Prompt (CMD)**
```cmd
# Navegar al directorio
cd C:\ruta\a\deznity-core

# Instalar dependencias
npm install

# Ejecutar scripts
npx tsx scripts/seedPinecone.ts
```

### **Git Bash**
```bash
# Navegar al directorio
cd /c/ruta/a/deznity-core

# Instalar dependencias
npm install

# Ejecutar scripts
npx tsx scripts/seedPinecone.ts
```

---

## 📁 **ESTRUCTURA DE ARCHIVOS WINDOWS**

```
deznity-core/
├── apps/                           # ✅ Compatible
├── services/                       # ✅ Compatible
├── packages/                       # ✅ Compatible
├── scripts/                        # ✅ Compatible
├── docs/                          # ✅ Compatible
├── workflows/                     # ✅ Compatible
├── utils/                         # ✅ Compatible
├── data/                          # ✅ Compatible
│   ├── briefs/                    # ✅ Compatible
│   └── chunks/                    # ✅ Compatible
├── Briefs_Semilla_client-uuid/    # ✅ Renombrado
├── Chunk_1_Metadata               # ✅ Renombrado
├── Chunk_2_Manifiesto             # ✅ Renombrado
├── Chunk_3_Roadmap                # ✅ Renombrado
├── Chunk_4_Agentes_parte_1        # ✅ Renombrado
├── Chunk_5_Agentes_parte_2        # ✅ Renombrado
├── Chunk_6_Stack_tecnico          # ✅ Renombrado
├── Chunk_7_SOP_Crear_Proyecto_Cliente  # ✅ Renombrado
├── Chunk_8_SOP_Validar_Contenido_HITL  # ✅ Renombrado
├── Chunk_9_Plantillas_Prompts_base     # ✅ Renombrado
├── Chunk_10_Indices_y_namespaces       # ✅ Renombrado
├── package.json                   # ✅ Compatible
├── turbo.json                     # ✅ Compatible
├── vercel.json                    # ✅ Compatible
└── .env                           # ✅ Compatible
```

---

## 🚀 **PASOS PARA USAR EN WINDOWS**

### **1. Clonar Repositorio**
```bash
git clone https://github.com/lucasonzta/deznity-core.git
cd deznity-core
```

### **2. Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
copy env.example .env

# Editar .env con tus API keys
notepad .env
```

### **3. Instalar Dependencias**
```bash
npm install
```

### **4. Probar Sistema**
```bash
# Poblar Pinecone
npx tsx scripts/seedPinecone.ts

# Probar flujo de agentes
npx tsx scripts/testFlow.ts
```

### **5. Deploy a Producción**
```bash
# Deploy a Vercel
npx vercel --prod

# Push a GitHub
git add .
git commit -m "feat: update"
git push origin main
```

---

## ⚠️ **CONSIDERACIONES ESPECIALES**

### **1. Rutas de Archivos**
- ✅ Todas las rutas usan `/` (compatible con Windows)
- ✅ No hay rutas absolutas hardcodeadas
- ✅ Usa `path.join()` para compatibilidad

### **2. Variables de Entorno**
- ✅ Usa `process.env` estándar
- ✅ Compatible con `.env` files
- ✅ Funciona en PowerShell, CMD y Git Bash

### **3. Scripts TypeScript**
- ✅ Usa `tsx` para ejecutar TypeScript
- ✅ Compatible con npm scripts
- ✅ Funciona en todas las terminales

### **4. Git**
- ✅ Archivos renombrados automáticamente
- ✅ Compatible con Git for Windows
- ✅ Funciona con GitHub Desktop

---

## 🧪 **TESTING EN WINDOWS**

### **Scripts Probados**
- ✅ `seedPinecone.ts` - Poblar Pinecone
- ✅ `testFlow.ts` - Probar flujo de agentes
- ✅ `bootstrap-deznity-simple.ts` - Bootstrap completo
- ✅ `setup-supabase-complete.ts` - Configurar Supabase
- ✅ `setup-n8n-complete.ts` - Configurar n8n

### **Funcionalidades Probadas**
- ✅ Conexión a APIs externas
- ✅ Lectura/escritura de archivos
- ✅ Ejecución de scripts TypeScript
- ✅ Deploy a Vercel
- ✅ Push a GitHub

---

## 📞 **SOPORTE PARA WINDOWS**

### **Problemas Comunes**

#### **1. Error de Permisos**
```bash
# Ejecutar como administrador
# O usar PowerShell como administrador
```

#### **2. Node.js No Encontrado**
```bash
# Verificar instalación
node --version
npm --version

# Reinstalar Node.js si es necesario
# https://nodejs.org/
```

#### **3. TypeScript No Encontrado**
```bash
# Instalar tsx globalmente
npm install -g tsx

# O usar npx
npx tsx scripts/seedPinecone.ts
```

#### **4. Variables de Entorno No Cargadas**
```bash
# Verificar archivo .env
# Asegurarse de que esté en la raíz del proyecto
# Reiniciar terminal después de cambios
```

---

## 🎉 **CONCLUSIÓN**

**Deznity es 100% compatible con Windows.** Todos los archivos han sido renombrados, las rutas configuradas, y los scripts probados para funcionar perfectamente en Windows 10/11.

**No hay limitaciones específicas de Windows** - el sistema funciona igual de bien que en macOS y Linux.

---

*Última actualización: 12 de Octubre, 2025*
*Compatibilidad: Windows 10/11, PowerShell, CMD, Git Bash*
