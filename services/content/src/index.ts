import express from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'content',
    timestamp: new Date().toISOString(),
    requestId: req.id 
  });
});

// Generate content using OpenRouter
app.post('/generate', async (req, res) => {
  try {
    const { prompt, context, model = 'openai/gpt-4', maxTokens = 2000 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Call OpenRouter API
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are Deznity, a Self-Building AI Growth Engine that democratizes premium digital presence 10× cheaper and 20× faster.'
          },
          {
            role: 'user',
            content: context ? `${context}\n\n${prompt}` : prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;

    // Save content to database
    const { data: savedContent, error } = await supabase
      .from('contents')
      .insert({
        id: crypto.randomUUID(),
        prompt,
        context,
        model,
        content,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving content:', error);
    }

    res.json({ 
      content,
      contentId: savedContent?.id,
      model,
      requestId: req.id 
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Content generation failed' });
  }
});

// Get content by ID
app.get('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: content, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ 
      content,
      requestId: req.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List contents
app.get('/contents', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const { data: contents, error } = await supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch contents' });
    }

    res.json({ 
      contents,
      requestId: req.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    requestId: req.id 
  });
});

app.listen(PORT, () => {
  console.log(`📝 Content Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
