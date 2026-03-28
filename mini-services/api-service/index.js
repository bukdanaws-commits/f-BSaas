// Eventify API Service - Express.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;

const SUPABASE_URL = 'https://ibrdwbsfwrrxeqglpppk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicmR3YnNmd3JyeGVxZ2xwcHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ3MjE1MCwiZXhwIjoyMDg5MDQ4MTUwfQ.kMW86SgNJ4TaJ2yqw-7DaizYlWbi3oezkCrm7ZAkwlk';

console.log(`🚀 Starting Eventify API on port ${PORT}...`);

// Middleware
app.use(cors());
app.use(express.json());

// Supabase helper
async function querySupabase(table, options = {}) {
  const { select = '*', filter, order, limit } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
  if (filter) url += `&${filter}`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });
  return res.json();
}

async function insertSupabase(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  try {
    const token = authHeader.substring(7);
    req.user = JSON.parse(Buffer.from(token, 'base64').toString());
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// =====================================
// ROUTES
// =====================================

// Health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Eventify API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Pricing packages (public)
app.get('/api/pricing/packages', async (req, res) => {
  try {
    const packages = await querySupabase('pricing_packages', {
      filter: 'is_active=eq.true',
      order: 'sort_order.asc'
    });
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google OAuth URL
app.get('/api/auth/google', (req, res) => {
  const clientId = '870697180975-atbk3jiiq05c56uc0qt1c5itdqevkoar.apps.googleusercontent.com';
  const redirectUri = 'http://localhost:3000/auth/callback';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile`;
  res.json({ success: true, auth_url: authUrl });
});

// Google Login
app.post('/api/auth/google/login', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ success: false, error: 'No access token' });
    }
    
    // Verify with Google
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    if (!googleRes.ok) {
      return res.status(401).json({ success: false, error: 'Invalid Google token' });
    }
    
    const googleUser = await googleRes.json();
    
    // Check/create user
    let users = await querySupabase('users', { filter: `email=eq.${googleUser.email}` });
    let user = users?.[0];
    
    if (!user) {
      const created = await insertSupabase('users', {
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.picture,
        google_id: googleUser.sub,
        is_super_admin: false
      });
      user = created?.[0];
    }
    
    // Get tenant
    let tenant = null;
    let role = null;
    if (user) {
      const memberships = await querySupabase('memberships', { filter: `user_id=eq.${user.id}` });
      if (memberships?.length > 0) {
        role = memberships[0].role;
        const tenants = await querySupabase('tenants', { filter: `id=eq.${memberships[0].tenant_id}` });
        tenant = tenants?.[0];
      }
    }
    
    // Generate token
    const token = Buffer.from(JSON.stringify({
      user_id: user?.id,
      email: user?.email,
      name: user?.name,
      tenant_id: tenant?.id,
      role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    })).toString('base64');
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user?.id, email: user?.email, name: user?.name },
      tenant,
      role
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Get events
app.get('/api/events', authMiddleware, async (req, res) => {
  try {
    if (!req.user.tenant_id) {
      return res.json({ success: true, data: [], message: 'No tenant' });
    }
    const events = await querySupabase('events', { filter: `tenant_id=eq.${req.user.tenant_id}` });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet
app.get('/api/credits/wallet', authMiddleware, async (req, res) => {
  try {
    if (!req.user.tenant_id) {
      return res.status(400).json({ success: false, error: 'No tenant' });
    }
    let wallets = await querySupabase('credit_wallets', { filter: `tenant_id=eq.${req.user.tenant_id}` });
    if (!wallets?.length) {
      wallets = await insertSupabase('credit_wallets', { tenant_id: req.user.tenant_id, balance: 0 });
    }
    res.json({ success: true, data: wallets?.[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get credit settings (admin)
app.get('/api/admin/credit-settings', authMiddleware, async (req, res) => {
  try {
    const settings = await querySupabase('credit_settings');
    res.json({ success: true, data: settings?.[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get event stats
app.get('/api/events/:id/stats', authMiddleware, async (req, res) => {
  try {
    const participants = await querySupabase('participants', {
      filter: `event_id=eq.${req.params.id}`,
      select: 'id,is_checked_in,food_claims,drink_claims'
    });
    
    res.json({
      success: true,
      data: {
        total_participants: participants.length,
        checked_in: participants.filter(p => p.is_checked_in).length,
        total_food_claims: participants.reduce((sum, p) => sum + (p.food_claims || 0), 0),
        total_drink_claims: participants.reduce((sum, p) => sum + (p.drink_claims || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get participants
app.get('/api/events/:event_id/participants', authMiddleware, async (req, res) => {
  try {
    const participants = await querySupabase('participants', {
      filter: `event_id=eq.${req.params.event_id}`,
      order: 'created_at.desc'
    });
    res.json({ success: true, data: participants, total: participants.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get participant by QR
app.get('/api/participants/qr/:qr_code', authMiddleware, async (req, res) => {
  try {
    const participants = await querySupabase('participants', {
      filter: `qr_code=eq.${req.params.qr_code}`
    });
    
    if (!participants?.length) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }
    
    res.json({ success: true, data: participants[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Checkin
app.post('/api/checkin', authMiddleware, async (req, res) => {
  try {
    const { qr_code, event_id, desk_number = 1 } = req.body;
    
    const participants = await querySupabase('participants', {
      filter: `qr_code=eq.${qr_code}&event_id=eq.${event_id}`
    });
    
    const participant = participants?.[0];
    
    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }
    
    if (participant.is_checked_in) {
      return res.status(400).json({ success: false, error: 'Already checked in', participant });
    }
    
    // Update participant
    await fetch(`${SUPABASE_URL}/rest/v1/participants?id=eq.${participant.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        is_checked_in: true,
        checked_in_at: new Date().toISOString(),
        checkin_count: 1
      })
    });
    
    // Create checkin record
    await insertSupabase('checkins', {
      event_id,
      participant_id: participant.id,
      operator_id: req.user.user_id,
      desk_number
    });
    
    // Add to display queue
    await insertSupabase('display_queue', {
      event_id,
      participant_id: participant.id,
      name: participant.name,
      is_displayed: false
    });
    
    res.json({
      success: true,
      message: 'Check-in successful',
      participant: { ...participant, is_checked_in: true }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Claim F&B
app.post('/api/claims', authMiddleware, async (req, res) => {
  try {
    const { qr_code, event_id, claim_type } = req.body;
    
    const participants = await querySupabase('participants', {
      filter: `qr_code=eq.${qr_code}&event_id=eq.${event_id}`
    });
    
    const participant = participants?.[0];
    
    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }
    
    if (!participant.is_checked_in) {
      return res.status(400).json({ success: false, error: 'Not checked in yet' });
    }
    
    const isFood = claim_type === 'food';
    const current = isFood ? participant.food_claims : participant.drink_claims;
    const max = isFood ? participant.max_food_claims : participant.max_drink_claims;
    
    if (current >= max) {
      return res.status(400).json({ success: false, error: `Max ${claim_type} claims reached` });
    }
    
    const update = isFood ? { food_claims: current + 1 } : { drink_claims: current + 1 };
    
    await fetch(`${SUPABASE_URL}/rest/v1/participants?id=eq.${participant.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(update)
    });
    
    await insertSupabase('claims', { event_id, participant_id: participant.id });
    
    res.json({ success: true, message: `${claim_type} claimed`, participant: { ...participant, ...update } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API running at http://localhost:${PORT}`);
});
