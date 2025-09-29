import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Interfaces
interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface CallModelOptions {
  maxRetries?: number;
  temperature?: number;
  maxTokens?: number;
}

// Configuración
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Validar API key
if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY no está configurada en el archivo .env');
}

/**
 * Llama a un modelo de OpenRouter con reintentos automáticos
 */
export async function callModel(
  model: string,
  messages: OpenRouterMessage[],
  options: CallModelOptions = {}
): Promise<string> {
  const {
    maxRetries = 3,
    temperature = 0.7,
    maxTokens = 4000
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Llamando a ${model} (intento ${attempt}/${maxRetries})`);
      
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://deznity-core.com',
          'X-Title': 'Deznity Core'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No se recibió respuesta del modelo');
      }

      const content = data.choices[0].message.content;
      
      // Log de uso de tokens si está disponible
      if (data.usage) {
        console.log(`📊 Tokens usados: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`);
      }
      
      console.log(`✅ Respuesta recibida de ${model}`);
      return content;

    } catch (error: any) {
      console.error(`❌ Error en intento ${attempt}/${maxRetries} con ${model}:`, error.message);
      
      // Si es un error de rate limit o servidor, reintentar
      if (error.message.includes('429') || error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial
          console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // Si no es un error de reintento o ya agotamos los intentos, lanzar error
      if (attempt === maxRetries) {
        throw new Error(`Falló después de ${maxRetries} intentos: ${error.message}`);
      }
    }
  }
  
  throw new Error('No se pudo completar la llamada al modelo');
}

/**
 * Función helper para crear mensajes del sistema
 */
export function createSystemMessage(content: string): OpenRouterMessage {
  return { role: 'system', content };
}

/**
 * Función helper para crear mensajes del usuario
 */
export function createUserMessage(content: string): OpenRouterMessage {
  return { role: 'user', content };
}

/**
 * Función helper para crear mensajes del asistente
 */
export function createAssistantMessage(content: string): OpenRouterMessage {
  return { role: 'assistant', content };
}

/**
 * Configuraciones predefinidas para cada agente
 */
export const AGENT_CONFIGS = {
  'pm': {
    model: 'openai/gpt-4o',
    temperature: 0.3,
    maxTokens: 2000
  },
  'web': {
    model: 'openai/gpt-4o',
    temperature: 0.4,
    maxTokens: 3000
  },
  'ux': {
    model: 'openai/gpt-4o',
    temperature: 0.6,
    maxTokens: 2500
  },
  'seo': {
    model: 'openai/gpt-4o',
    temperature: 0.5,
    maxTokens: 2000
  },
  'qa': {
    model: 'openai/gpt-4o-mini',
    temperature: 0.2,
    maxTokens: 1500
  }
} as const;

/**
 * Llama a un agente específico con su configuración predefinida
 */
export async function callAgent(
  agentType: keyof typeof AGENT_CONFIGS,
  messages: OpenRouterMessage[]
): Promise<string> {
  const config = AGENT_CONFIGS[agentType];
  return callModel(config.model, messages, {
    temperature: config.temperature,
    maxTokens: config.maxTokens
  });
}

export { OpenRouterMessage, OpenRouterResponse, CallModelOptions };
