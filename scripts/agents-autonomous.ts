import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

// Configuración de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_URL y SUPABASE_ANON_KEY son requeridos en .env');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Client {
  id: string;
  business_name: string;
  industry: string;
  goal: string;
  color?: string;
  logo_url?: string;
  copy_tone?: string;
  target_geo?: string;
  pages?: string[];
  budget: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectResult {
  clientId: string;
  clientSlug: string;
  status: 'success' | 'error';
  summaryPath?: string;
  outputPath?: string;
  error?: string;
  duration: number;
  timestamp: string;
}

class DeznityAutonomousAgent {
  private isRunning: boolean = false;
  private checkInterval: number = 5 * 60 * 1000; // 5 minutos
  private intervalId?: NodeJS.Timeout;

  constructor() {
    console.log('🤖 DEZNITY AUTONOMOUS AGENT INICIADO');
    console.log('=====================================');
    console.log(`⏰ Intervalo de verificación: ${this.checkInterval / 1000}s`);
    console.log(`🗄️ Supabase URL: ${SUPABASE_URL}`);
    console.log('');
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ El agente autónomo ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Iniciando modo autónomo...');
    
    // Verificación inicial
    await this.healthCheck();
    
    // Ejecutar verificación inmediata
    await this.checkForPendingClients();
    
    // Configurar intervalo
    this.intervalId = setInterval(async () => {
      await this.checkForPendingClients();
    }, this.checkInterval);

    console.log('✅ Modo autónomo activado - monitoreando clientes pending...');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️ El agente autónomo no está ejecutándose');
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('🛑 Modo autónomo detenido');
  }

  private async healthCheck(): Promise<void> {
    console.log('🔍 Verificando salud del sistema...');
    
    try {
      // Verificar conexión a Supabase
      const { data, error } = await supabase
        .from('clients')
        .select('count')
        .limit(1);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      console.log('✅ Supabase: Conectado');
      
      // Verificar que el directorio output existe
      const outputDir = path.join(process.cwd(), 'output');
      await fs.ensureDir(outputDir);
      console.log('✅ Output directory: Listo');
      
      console.log('✅ Sistema saludable - listo para procesar clientes');
      
    } catch (error: any) {
      console.error('❌ Error en health check:', error.message);
      throw error;
    }
  }

  private async checkForPendingClients(): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 [${timestamp}] Verificando clientes pending...`);
    
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Error consultando clientes: ${error.message}`);
      }

      if (!clients || clients.length === 0) {
        console.log('📭 No hay clientes pending');
        return;
      }

      console.log(`📋 Encontrados ${clients.length} cliente(s) pending:`);
      clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.business_name} (${client.industry}) - ${client.budget}`);
      });

      // Procesar cada cliente pending
      for (const client of clients) {
        await this.processClient(client);
      }

    } catch (error: any) {
      console.error('❌ Error verificando clientes:', error.message);
    }
  }

  private async processClient(client: Client): Promise<void> {
    const startTime = Date.now();
    const clientSlug = this.generateClientSlug(client.business_name);
    
    console.log(`\n🎯 Procesando cliente: ${client.business_name}`);
    console.log(`   Slug: ${clientSlug}`);
    console.log(`   Industria: ${client.industry}`);
    console.log(`   Objetivo: ${client.goal}`);
    console.log(`   Presupuesto: ${client.budget}`);

    try {
      // 1. Actualizar status a in_progress
      await this.updateClientStatus(client.id, 'in_progress');
      console.log('✅ Status actualizado: in_progress');

      // 2. Crear directorio de output
      const outputPath = path.join(process.cwd(), 'output', clientSlug);
      await fs.ensureDir(outputPath);
      console.log(`✅ Directorio creado: ${outputPath}`);

      // 3. Ejecutar simulate:client
      console.log('🚀 Ejecutando simulate:client...');
      const { stdout, stderr } = await execAsync(`npm run simulate:client ${clientSlug}`, {
        cwd: process.cwd(),
        timeout: 300000 // 5 minutos timeout
      });

      if (stderr && !stderr.includes('warning')) {
        throw new Error(`Error en simulate:client: ${stderr}`);
      }

      console.log('✅ simulate:client ejecutado exitosamente');

      // 4. Buscar archivos generados
      const summaryPath = await this.findSummaryFile(clientSlug);
      const resultFiles = await this.findResultFiles(clientSlug);

      // 5. Mover archivos a output directory
      if (summaryPath) {
        const targetSummaryPath = path.join(outputPath, 'BOOTSTRAP_SUMMARY.md');
        await fs.copy(summaryPath, targetSummaryPath);
        console.log(`✅ Resumen copiado: ${targetSummaryPath}`);
      }

      if (resultFiles.length > 0) {
        const resultsDir = path.join(outputPath, 'results');
        await fs.ensureDir(resultsDir);
        
        for (const file of resultFiles) {
          const targetPath = path.join(resultsDir, path.basename(file));
          await fs.copy(file, targetPath);
        }
        console.log(`✅ ${resultFiles.length} archivos de resultados copiados`);
      }

      // 6. Actualizar status a completed
      await this.updateClientStatus(client.id, 'completed');
      
      // 7. Crear registro de proyecto exitoso
      const duration = Date.now() - startTime;
      const projectResult: ProjectResult = {
        clientId: client.id,
        clientSlug,
        status: 'success',
        summaryPath: summaryPath ? path.join(outputPath, 'BOOTSTRAP_SUMMARY.md') : undefined,
        outputPath,
        duration,
        timestamp: new Date().toISOString()
      };

      await this.saveProjectResult(projectResult);
      
      console.log(`🎉 Cliente ${client.business_name} procesado exitosamente`);
      console.log(`   Duración: ${duration}ms`);
      console.log(`   Output: ${outputPath}`);

    } catch (error: any) {
      console.error(`❌ Error procesando cliente ${client.business_name}:`, error.message);
      
      // Actualizar status a failed
      await this.updateClientStatus(client.id, 'failed');
      
      // Crear registro de proyecto fallido
      const duration = Date.now() - startTime;
      const projectResult: ProjectResult = {
        clientId: client.id,
        clientSlug,
        status: 'error',
        error: error.message,
        duration,
        timestamp: new Date().toISOString()
      };

      await this.saveProjectResult(projectResult);
    }
  }

  private generateClientSlug(businessName: string): string {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  }

  private async updateClientStatus(clientId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (error) {
      throw new Error(`Error actualizando status: ${error.message}`);
    }
  }

  private async findSummaryFile(clientSlug: string): Promise<string | null> {
    const possiblePaths = [
      path.join(process.cwd(), `BOOTSTRAP_SUMMARY_${clientSlug.toUpperCase()}.md`),
      path.join(process.cwd(), 'BOOTSTRAP_SUMMARY_TACOLOCO.md'), // Fallback para testing
    ];

    for (const filePath of possiblePaths) {
      if (await fs.pathExists(filePath)) {
        return filePath;
      }
    }

    return null;
  }

  private async findResultFiles(clientSlug: string): Promise<string[]> {
    const resultDirs = [
      path.join(process.cwd(), 'post-bootstrap-results'),
      path.join(process.cwd(), 'deployment-results'),
    ];

    const resultFiles: string[] = [];

    for (const dir of resultDirs) {
      if (await fs.pathExists(dir)) {
        const files = await fs.readdir(dir);
        for (const file of files) {
          if (file.includes(clientSlug) || file.includes('tacoloco')) { // Fallback para testing
            resultFiles.push(path.join(dir, file));
          }
        }
      }
    }

    return resultFiles;
  }

  private async saveProjectResult(result: ProjectResult): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          client_id: result.clientId,
          name: `Proyecto ${result.clientSlug}`,
          description: `Proyecto autónomo para ${result.clientSlug}`,
          status: result.status === 'success' ? 'completed' : 'failed',
          phase: 'autonomous_processing',
          current_tasks: [],
          completed_tasks: result.status === 'success' ? ['autonomous_processing'] : [],
          blockers: result.status === 'error' ? [result.error || 'Error desconocido'] : [],
          next_actions: result.status === 'success' ? ['deploy_to_production'] : ['review_error'],
        });

      if (error) {
        console.error('❌ Error guardando resultado del proyecto:', error.message);
      } else {
        console.log('✅ Resultado del proyecto guardado en Supabase');
      }
    } catch (error: any) {
      console.error('❌ Error inesperado guardando resultado:', error.message);
    }
  }

  // Método para testing manual
  async processTestClient(): Promise<void> {
    console.log('🧪 MODO TEST - Procesando cliente de prueba...');
    
    const testClient: Client = {
      id: 'test-client-id',
      business_name: 'TestClient',
      industry: 'test',
      goal: 'test goal',
      budget: 'starter',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.processClient(testClient);
  }
}

// Función principal
async function main() {
  const agent = new DeznityAutonomousAgent();
  
  // Manejar señales de terminación
  process.on('SIGINT', async () => {
    console.log('\n🛑 Recibida señal SIGINT, deteniendo agente...');
    await agent.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Recibida señal SIGTERM, deteniendo agente...');
    await agent.stop();
    process.exit(0);
  });

  // Verificar argumentos de línea de comandos
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    await agent.processTestClient();
  } else if (args.includes('--once')) {
    await agent.healthCheck();
    await agent.checkForPendingClients();
  } else {
    await agent.start();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

export { DeznityAutonomousAgent };
