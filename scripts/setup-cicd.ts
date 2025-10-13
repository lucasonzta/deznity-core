import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

class CICDSetup {
  private projectId: string;
  private sessionId: string;
  private resultsDir: string;

  constructor() {
    this.projectId = `deznity-cicd-${uuidv4().substring(0, 8)}`;
    this.sessionId = `cicd-${Date.now()}`;
    this.resultsDir = path.join(process.cwd(), 'deznity-cicd-setup', this.sessionId);
    fs.ensureDirSync(this.resultsDir);
    console.log(`🔄 CONFIGURANDO CI/CD COMPLETO DE DEZNITY`);
    console.log(`=========================================`);
    console.log(`Proyecto ID: ${this.projectId}`);
    console.log(`Sesión ID: ${this.sessionId}`);
  }

  private async createGitHubWorkflows(): Promise<void> {
    console.log(`\n🔄 Creando workflows de GitHub Actions...`);

    // Crear directorios necesarios
    await fs.ensureDir(path.join(this.resultsDir, '.github/workflows'));
    await fs.ensureDir(path.join(this.resultsDir, '.github/ISSUE_TEMPLATE'));
    await fs.ensureDir(path.join(this.resultsDir, 'tests/performance'));
    await fs.ensureDir(path.join(this.resultsDir, 'docs'));

    // Workflow principal de CI/CD
    const mainWorkflow = `name: 🚀 Deznity CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  TURBO_TOKEN: \${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: \${{ secrets.TURBO_TEAM }}
  NODE_VERSION: '18'

jobs:
  # 🔍 Análisis de código y dependencias
  analyze:
    name: 🔍 Analyze Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run type-check

      - name: Security audit
        run: npm audit --audit-level=moderate

  # 🧪 Testing
  test:
    name: 🧪 Run Tests
    runs-on: ubuntu-latest
    needs: analyze
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: \${{ secrets.CODECOV_TOKEN }}

  # 🏗️ Build
  build:
    name: 🏗️ Build Packages
    runs-on: ubuntu-latest
    needs: [analyze, test]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build all packages
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            apps/*/dist
            services/*/dist
            packages/*/dist

  # 🚀 Deploy to Staging
  deploy-staging:
    name: 🚀 Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts

      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/web
          vercel-args: '--prod=false'

      - name: Deploy to Modal (Staging)
        run: |
          cd modal
          modal deploy --env=staging

      - name: Run smoke tests
        run: npm run test:smoke

  # 🎯 Deploy to Production
  deploy-production:
    name: 🎯 Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/web
          vercel-args: '--prod=true'

      - name: Deploy to Modal (Production)
        run: |
          cd modal
          modal deploy --env=production

      - name: Run production tests
        run: npm run test:production

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          channel: '#deznity-deployments'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
`;

    await fs.writeFile(
      path.join(this.resultsDir, '.github/workflows/ci-cd.yml'),
      mainWorkflow
    );

    // Workflow de deploy a Vercel
    const vercelWorkflow = `name: 🌐 Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  deploy:
    name: 🌐 Deploy to Vercel
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/web
          vercel-args: \${{ github.ref == 'refs/heads/main' && '--prod=true' || '--prod=false' }}

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Deploy preview disponible en: \${{ steps.deploy.outputs.preview-url }}'
            })
`;

    await fs.writeFile(
      path.join(this.resultsDir, '.github/workflows/vercel.yml'),
      vercelWorkflow
    );

    // Workflow de deploy a Modal
    const modalWorkflow = `name: 🐍 Deploy to Modal

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  deploy:
    name: 🐍 Deploy to Modal
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Modal
        run: pip install modal

      - name: Deploy to Modal
        run: |
          cd modal
          modal deploy --env=\${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

      - name: Run Modal tests
        run: |
          cd modal
          modal run content_service.test
`;

    await fs.writeFile(
      path.join(this.resultsDir, '.github/workflows/modal.yml'),
      modalWorkflow
    );

    // Workflow de seguridad
    const securityWorkflow = `name: 🔒 Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM

jobs:
  security:
    name: 🔒 Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript, typescript

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
`;

    await fs.writeFile(
      path.join(this.resultsDir, '.github/workflows/security.yml'),
      securityWorkflow
    );

    // Workflow de performance
    const performanceWorkflow = `name: ⚡ Performance Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  performance:
    name: ⚡ Performance Testing
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './.lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Run K6 performance tests
        run: |
          npm install -g k6
          k6 run tests/performance/load-test.js

      - name: Run Artillery performance tests
        run: |
          npm install -g artillery
          artillery run tests/performance/artillery.yml
`;

    await fs.writeFile(
      path.join(this.resultsDir, '.github/workflows/performance.yml'),
      performanceWorkflow
    );

    console.log(`   ✅ .github/workflows/ci-cd.yml creado`);
    console.log(`   ✅ .github/workflows/vercel.yml creado`);
    console.log(`   ✅ .github/workflows/modal.yml creado`);
    console.log(`   ✅ .github/workflows/security.yml creado`);
    console.log(`   ✅ .github/workflows/performance.yml creado`);
  }

  private async createGitHubTemplates(): Promise<void> {
    console.log(`\n📝 Creando templates de GitHub...`);

    // Issue template
    const issueTemplate = `---
name: 🐛 Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Descripción del Bug
Una descripción clara y concisa de qué es el bug.

## 🔄 Pasos para Reproducir
1. Ve a '...'
2. Haz clic en '....'
3. Desplázate hacia abajo hasta '....'
4. Ve el error

## ✅ Comportamiento Esperado
Una descripción clara y concisa de lo que esperabas que sucediera.

## 📸 Capturas de Pantalla
Si es aplicable, agrega capturas de pantalla para ayudar a explicar tu problema.

## 🖥️ Información del Sistema
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

## 📋 Contexto Adicional
Agrega cualquier otro contexto sobre el problema aquí.
`;

    await fs.writeFile(
      path.join(this.resultsDir, '.github/ISSUE_TEMPLATE/bug_report.md'),
      issueTemplate
    );

    // Feature request template
    const featureTemplate = `---
name: ✨ Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## ✨ Descripción de la Feature
Una descripción clara y concisa de qué feature te gustaría ver implementada.

## 🎯 Problema que Resuelve
¿Qué problema resuelve esta feature? Ex. Siempre me frustra cuando [...]

## 💡 Solución Propuesta
Una descripción clara y concisa de lo que quieres que suceda.

## 🔄 Alternativas Consideradas
Una descripción clara y concisa de cualquier solución o feature alternativa que hayas considerado.

## 📋 Contexto Adicional
Agrega cualquier otro contexto o capturas de pantalla sobre la feature request aquí.
`;

    await fs.writeFile(
      path.join(this.resultsDir, '.github/ISSUE_TEMPLATE/feature_request.md'),
      featureTemplate
    );

    // Pull request template
    const prTemplate = `## 📋 Descripción
Breve descripción de los cambios realizados.

## 🔄 Tipo de Cambio
- [ ] Bug fix (cambio que corrige un problema)
- [ ] Nueva feature (cambio que agrega funcionalidad)
- [ ] Breaking change (fix o feature que causaría que la funcionalidad existente no funcione como se espera)
- [ ] Documentación (cambios solo en documentación)

## ✅ Checklist
- [ ] Mi código sigue las guías de estilo de este proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código, especialmente en áreas difíciles de entender
- [ ] He hecho los cambios correspondientes en la documentación
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban que mi fix es efectivo o que mi feature funciona
- [ ] Los tests nuevos y existentes pasan localmente con mis cambios
- [ ] Cualquier cambio dependiente ha sido mergeado y publicado

## 🧪 Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests de performance
- [ ] Tests de seguridad

## 📸 Capturas de Pantalla (si aplica)
Agrega capturas de pantalla para ayudar a explicar tus cambios.

## 📋 Contexto Adicional
Agrega cualquier otro contexto sobre los cambios aquí.
`;

    await fs.writeFile(
      path.join(this.resultsDir, '.github/PULL_REQUEST_TEMPLATE.md'),
      prTemplate
    );

    console.log(`   ✅ .github/ISSUE_TEMPLATE/bug_report.md creado`);
    console.log(`   ✅ .github/ISSUE_TEMPLATE/feature_request.md creado`);
    console.log(`   ✅ .github/PULL_REQUEST_TEMPLATE.md creado`);
  }

  private async createConfigFiles(): Promise<void> {
    console.log(`\n⚙️ Creando archivos de configuración...`);

    // Lighthouse config
    const lighthouseConfig = {
      "ci": {
        "collect": {
          "numberOfRuns": 3,
          "url": [
            "http://localhost:3000",
            "http://localhost:3000/pricing",
            "http://localhost:3000/portal"
          ]
        },
        "assert": {
          "assertions": {
            "categories:performance": ["error", {"minScore": 0.9}],
            "categories:accessibility": ["error", {"minScore": 0.95}],
            "categories:best-practices": ["error", {"minScore": 0.9}],
            "categories:seo": ["error", {"minScore": 0.9}]
          }
        },
        "upload": {
          "target": "temporary-public-storage"
        }
      }
    };

    await fs.writeJson(
      path.join(this.resultsDir, '.lighthouserc.json'),
      lighthouseConfig,
      { spaces: 2 }
    );

    // K6 load test
    const k6Test = `import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
  },
};

export default function () {
  let response = http.get('http://localhost:3000');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
`;

    await fs.writeFile(
      path.join(this.resultsDir, 'tests/performance/load-test.js'),
      k6Test
    );

    // Artillery config
    const artilleryConfig = `config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      User-Agent: 'Artillery Load Test'

scenarios:
  - name: 'Homepage Load Test'
    weight: 70
    flow:
      - get:
          url: '/'
      - think: 1
      - get:
          url: '/pricing'
      - think: 2

  - name: 'Portal Load Test'
    weight: 30
    flow:
      - get:
          url: '/portal'
      - think: 3
      - get:
          url: '/portal/dashboard'
      - think: 1
`;

    await fs.writeFile(
      path.join(this.resultsDir, 'tests/performance/artillery.yml'),
      artilleryConfig
    );

    // ESLint config
    const eslintConfig = {
      "extends": [
        "eslint:recommended",
        "@typescript-eslint/recommended",
        "prettier"
      ],
      "parser": "@typescript-eslint/parser",
      "plugins": ["@typescript-eslint"],
      "rules": {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "prefer-const": "error",
        "no-var": "error"
      },
      "env": {
        "node": true,
        "es2021": true
      }
    };

    await fs.writeJson(
      path.join(this.resultsDir, '.eslintrc.json'),
      eslintConfig,
      { spaces: 2 }
    );

    // Prettier config
    const prettierConfig = {
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": true,
      "printWidth": 80,
      "tabWidth": 2,
      "useTabs": false
    };

    await fs.writeJson(
      path.join(this.resultsDir, '.prettierrc.json'),
      prettierConfig,
      { spaces: 2 }
    );

    console.log(`   ✅ .lighthouserc.json creado`);
    console.log(`   ✅ tests/performance/load-test.js creado`);
    console.log(`   ✅ tests/performance/artillery.yml creado`);
    console.log(`   ✅ .eslintrc.json creado`);
    console.log(`   ✅ .prettierrc.json creado`);
  }

  private async createSecretsGuide(): Promise<void> {
    console.log(`\n🔐 Creando guía de secrets...`);

    const secretsGuide = `# 🔐 GitHub Secrets Configuration Guide

## 📋 Secrets Requeridos

### 🚀 Vercel
- \`VERCEL_TOKEN\`: Token de API de Vercel
- \`VERCEL_ORG_ID\`: ID de la organización en Vercel
- \`VERCEL_PROJECT_ID\`: ID del proyecto en Vercel

### 🐍 Modal
- \`MODAL_TOKEN_ID\`: Token ID de Modal
- \`MODAL_TOKEN_SECRET\`: Token Secret de Modal

### 🔒 Seguridad
- \`SNYK_TOKEN\`: Token de Snyk para security scanning
- \`CODECOV_TOKEN\`: Token de Codecov para coverage

### 📊 Monitoreo
- \`SLACK_WEBHOOK\`: Webhook de Slack para notificaciones
- \`SENTRY_DSN\`: DSN de Sentry para error tracking

### 🏗️ Build
- \`TURBO_TOKEN\`: Token de Turbo para build caching
- \`TURBO_TEAM\`: Team de Turbo

## 🛠️ Cómo Configurar

1. Ve a tu repositorio en GitHub
2. Navega a Settings > Secrets and variables > Actions
3. Haz clic en "New repository secret"
4. Agrega cada secret con su valor correspondiente

## ✅ Verificación

Para verificar que todos los secrets están configurados:

\`\`\`bash
# Verificar secrets en GitHub Actions
gh secret list

# Verificar secrets en local (opcional)
echo \$VERCEL_TOKEN
echo \$MODAL_TOKEN_ID
\`\`\`

## 🚨 Importante

- Nunca commitees secrets en el código
- Usa variables de entorno para desarrollo local
- Rota los tokens regularmente
- Usa diferentes tokens para staging y production
`;

    await fs.writeFile(
      path.join(this.resultsDir, 'docs/SECRETS_GUIDE.md'),
      secretsGuide
    );

    console.log(`   ✅ docs/SECRETS_GUIDE.md creado`);
  }

  private async generateReport(): Promise<void> {
    const reportContent = `
# 🔄 REPORTE DE CONFIGURACIÓN CI/CD - DEZNITY

**Fecha**: ${new Date().toISOString()}
**Proyecto ID**: ${this.projectId}
**Sesión ID**: ${this.sessionId}

## 📊 Resumen Ejecutivo

- **Workflows creados**: 5 workflows completos
- **Templates creados**: 3 templates de GitHub
- **Configuraciones**: ESLint, Prettier, Lighthouse, K6, Artillery
- **Estado**: CI/CD completamente configurado

## 🎯 Workflows Configurados

### ✅ CI/CD PRINCIPAL
- [x] Análisis de código (ESLint, TypeScript, Security)
- [x] Testing (Unit, Integration, Coverage)
- [x] Build (Turbo, Artifacts)
- [x] Deploy Staging (Vercel + Modal)
- [x] Deploy Production (Vercel + Modal)

### ✅ DEPLOYMENT
- [x] Vercel Deploy (Web App)
- [x] Modal Deploy (Python Workers)
- [x] PR Comments automáticos

### ✅ SEGURIDAD
- [x] Trivy vulnerability scanner
- [x] CodeQL analysis
- [x] Snyk security scan
- [x] Weekly security checks

### ✅ PERFORMANCE
- [x] Lighthouse CI (Performance, A11y, SEO)
- [x] K6 load testing
- [x] Artillery performance tests

## 🎯 Templates Creados

### ✅ GITHUB TEMPLATES
- [x] Bug Report template
- [x] Feature Request template
- [x] Pull Request template

## 🎯 Configuraciones

### ✅ HERRAMIENTAS DE CALIDAD
- [x] ESLint configuration
- [x] Prettier configuration
- [x] Lighthouse configuration
- [x] K6 load test script
- [x] Artillery performance config

## 🔐 Secrets Requeridos

### 🚀 Vercel
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

### 🐍 Modal
- MODAL_TOKEN_ID
- MODAL_TOKEN_SECRET

### 🔒 Seguridad
- SNYK_TOKEN
- CODECOV_TOKEN

### 📊 Monitoreo
- SLACK_WEBHOOK
- SENTRY_DSN

### 🏗️ Build
- TURBO_TOKEN
- TURBO_TEAM

## 🚀 Próximos Pasos

1. **Configurar secrets**: Agregar todos los secrets en GitHub
2. **Setup de servicios**: Configurar Supabase, Stripe, n8n
3. **Deploy a staging**: Probar el pipeline completo
4. **Monitoreo**: Configurar alertas y dashboards

## 🎯 Estado: CI/CD COMPLETAMENTE CONFIGURADO

El sistema de CI/CD de Deznity está completamente configurado y listo para:
- ✅ Análisis automático de código
- ✅ Testing automatizado
- ✅ Deploy automático a staging y production
- ✅ Monitoreo de seguridad y performance
- ✅ Notificaciones automáticas

---
*Generado automáticamente por el configurador de CI/CD*
*Fecha: ${new Date().toISOString()}*
`;
    
    const reportPath = path.join(this.resultsDir, 'CICD_SETUP_REPORT.md');
    await fs.writeFile(reportPath, reportContent.trim(), 'utf-8');
    console.log(`📊 Reporte generado: ${reportPath}`);
  }

  async setupCICD() {
    try {
      await this.createGitHubWorkflows();
      await this.createGitHubTemplates();
      await this.createConfigFiles();
      await this.createSecretsGuide();
      await this.generateReport();

      console.log(`\n🎉 ¡CI/CD DE DEZNITY CONFIGURADO!`);
      console.log(`=================================`);
      console.log(`✅ Configuración creada en: ${this.resultsDir}`);
      console.log(`✅ Proyecto ID: ${this.projectId}`);
      console.log(`✅ Sesión ID: ${this.sessionId}`);
      console.log(`\n🚀 Próximos pasos:`);
      console.log(`   1. Configurar secrets en GitHub`);
      console.log(`   2. Setup de servicios (Supabase, Stripe, n8n)`);
      console.log(`   3. Deploy a staging`);
      console.log(`   4. Probar pipeline completo`);

    } catch (error: any) {
      console.error(`❌ Error configurando CI/CD: ${error.message}`);
      throw error;
    }
  }
}

const cicdSetup = new CICDSetup();
cicdSetup.setupCICD();
