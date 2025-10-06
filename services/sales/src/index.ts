import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    service: 'sales',
    timestamp: new Date().toISOString(),
    requestId: req.id 
  });
});

// Create lead
app.post('/leads', async (req, res) => {
  try {
    const { email, name, company, source, utm_source, utm_medium, utm_campaign } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .single();

    if (existingLead) {
      return res.json({ 
        lead: existingLead,
        message: 'Lead already exists',
        requestId: req.id 
      });
    }

    // Create new lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        id: crypto.randomUUID(),
        email,
        name,
        company,
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        status: 'new',
        score: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create lead' });
    }

    res.json({ 
      lead,
      requestId: req.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leads
app.get('/leads', async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: leads, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }

    res.json({ 
      leads,
      requestId: req.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update lead
app.put('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: lead, error } = await supabase
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update lead' });
    }

    res.json({ 
      lead,
      requestId: req.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create deal
app.post('/deals', async (req, res) => {
  try {
    const { lead_id, amount, stage, probability } = req.body;

    if (!lead_id) {
      return res.status(400).json({ error: 'Lead ID is required' });
    }

    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        id: crypto.randomUUID(),
        lead_id,
        amount,
        stage: stage || 'prospecting',
        probability: probability || 0,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create deal' });
    }

    res.json({ 
      deal,
      requestId: req.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deals
app.get('/deals', async (req, res) => {
  try {
    const { stage, status, limit = 10, offset = 0 } = req.query;

    let query = supabase
      .from('deals')
      .select(`
        *,
        leads (
          id,
          email,
          name,
          company
        )
      `)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (stage) {
      query = query.eq('stage', stage);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: deals, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch deals' });
    }

    res.json({ 
      deals,
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
  console.log(`💼 Sales Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
