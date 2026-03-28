// Eventify API Service - Express.js
// Equivalent to Golang Backend for Local Development
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.API_PORT || 8080;

// Configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log(`🚀 Starting Eventify API on port ${PORT}...`);
console.log(`📡 Connecting to Supabase: ${SUPABASE_URL ? '✅' : '❌'}`);
console.log(`🔑 Google OAuth: ${GOOGLE_CLIENT_ID ? '✅' : '❌'}`);

// Middleware
app.use(cors());
app.use(express.json());

// =====================================
// SUPABASE HELPERS
// =====================================
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

async function updateSupabase(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
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

// =====================================
// AUTH MIDDLEWARE
// =====================================
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
    message: 'Eventify API is running (Node.js Backend)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// =====================================
// AUTH ROUTES
// =====================================

// Get Google OAuth URL
app.get('/api/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ success: false, error: 'Google OAuth not configured' });
  }
  
  const redirectUri = `${FRONTEND_URL}/auth/callback`;
  const state = Math.random().toString(36).substring(7);
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&state=${state}`;
  
  res.json({ 
    success: true, 
    auth_url: authUrl,
    state: state
  });
});

// Google OAuth Callback - Exchange code for token
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ success: false, error: 'No authorization code' });
    }
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ success: false, error: 'Google OAuth not configured' });
    }
    
    // Exchange code for Google tokens
    const redirectUri = `${FRONTEND_URL}/auth/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    if (!tokenRes.ok) {
      const error = await tokenRes.text();
      console.error('Token exchange failed:', error);
      return res.status(401).json({ success: false, error: 'Failed to exchange token' });
    }
    
    const tokens = await tokenRes.json();
    
    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    if (!userRes.ok) {
      return res.status(401).json({ success: false, error: 'Failed to get user info' });
    }
    
    const googleUser = await userRes.json();
    console.log('Google user:', googleUser.email);
    
    // Check/create user in Supabase
    let users = await querySupabase('users', { filter: `email=eq.${googleUser.email}` });
    let user = users?.[0];
    
    if (!user) {
      // Create new user
      const created = await insertSupabase('users', {
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.picture,
        google_id: googleUser.sub,
        is_super_admin: false
      });
      user = created?.[0];
      console.log('Created new user:', user?.id);
    } else {
      // Update Google ID if not set
      if (!user.google_id) {
        await updateSupabase('users', user.id, { google_id: googleUser.sub });
      }
    }
    
    // Get tenant and role
    let tenant = null;
    let role = 'owner';
    
    if (user) {
      const memberships = await querySupabase('memberships', { filter: `user_id=eq.${user.id}` });
      if (memberships?.length > 0) {
        role = memberships[0].role;
        const tenants = await querySupabase('tenants', { filter: `id=eq.${memberships[0].tenant_id}` });
        tenant = tenants?.[0];
      }
      
      // If no tenant, create one for the user
      if (!tenant && !user.is_super_admin) {
        const slug = googleUser.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
        const newTenant = await insertSupabase('tenants', {
          name: googleUser.name + "'s Organization",
          slug: slug,
          owner_id: user.id,
          status: 'active'
        });
        tenant = newTenant?.[0];
        
        // Create membership
        await insertSupabase('memberships', {
          user_id: user.id,
          tenant_id: tenant?.id,
          role: 'owner'
        });
        
        // Create credit wallet
        await insertSupabase('credit_wallets', {
          tenant_id: tenant?.id,
          balance: 100,
          bonus_balance: 50
        });
        
        console.log('Created tenant for user:', tenant?.id);
      }
    }
    
    // Generate JWT token (simple base64 for demo)
    const token = Buffer.from(JSON.stringify({
      user_id: user?.id,
      email: user?.email,
      name: user?.name,
      avatar_url: user?.avatar_url,
      tenant_id: tenant?.id,
      role,
      is_super_admin: user?.is_super_admin || false,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    })).toString('base64');
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        avatar_url: user?.avatar_url,
        is_super_admin: user?.is_super_admin || false,
        role,
        tenant
      }
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google Login (with access token from frontend)
app.post('/api/auth/google/login', async (req, res) => {
  try {
    const { google_token } = req.body;
    
    if (!google_token) {
      return res.status(400).json({ success: false, error: 'No Google token' });
    }
    
    // Verify with Google
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${google_token}` }
    });
    
    if (!googleRes.ok) {
      return res.status(401).json({ success: false, error: 'Invalid Google token' });
    }
    
    const googleUser = await googleRes.json();
    
    // Same logic as callback...
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
    
    let tenant = null;
    let role = 'owner';
    
    if (user) {
      const memberships = await querySupabase('memberships', { filter: `user_id=eq.${user.id}` });
      if (memberships?.length > 0) {
        role = memberships[0].role;
        const tenants = await querySupabase('tenants', { filter: `id=eq.${memberships[0].tenant_id}` });
        tenant = tenants?.[0];
      }
    }
    
    const token = Buffer.from(JSON.stringify({
      user_id: user?.id,
      email: user?.email,
      name: user?.name,
      tenant_id: tenant?.id,
      role,
      is_super_admin: user?.is_super_admin || false,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    })).toString('base64');
    
    res.json({
      success: true,
      token,
      user: { id: user?.id, email: user?.email, name: user?.name, is_super_admin: user?.is_super_admin || false, role, tenant }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const users = await querySupabase('users', { filter: `id=eq.${req.user.user_id}` });
    const user = users?.[0];
    
    let tenant = null;
    let role = null;
    let wallet = null;
    
    if (user && req.user.tenant_id) {
      const tenants = await querySupabase('tenants', { filter: `id=eq.${req.user.tenant_id}` });
      tenant = tenants?.[0];
      role = req.user.role;
      
      const wallets = await querySupabase('credit_wallets', { filter: `tenant_id=eq.${req.user.tenant_id}` });
      wallet = wallets?.[0];
    }
    
    res.json({
      success: true,
      data: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        avatar_url: user?.avatar_url,
        is_super_admin: user?.is_super_admin || false,
        role,
        tenant,
        wallet
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================
// PUBLIC ROUTES
// =====================================

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

// =====================================
// EO ROUTES (Protected)
// =====================================

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

// Create event
app.post('/api/events', authMiddleware, async (req, res) => {
  try {
    if (!req.user.tenant_id) {
      return res.status(400).json({ success: false, error: 'No tenant' });
    }
    const event = await insertSupabase('events', {
      tenant_id: req.user.tenant_id,
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      capacity: req.body.capacity || 0,
      status: 'draft'
    });
    res.json({ success: true, data: event?.[0] });
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

// =====================================
// CREW ROUTES (Protected)
// =====================================

// Check-in
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
    await updateSupabase('participants', participant.id, {
      is_checked_in: true,
      checked_in_at: new Date().toISOString(),
      checkin_count: 1
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
    
    await updateSupabase('participants', participant.id, update);
    
    await insertSupabase('claims', { event_id, participant_id: participant.id, claim_type });
    
    res.json({ success: true, message: `${claim_type} claimed`, participant: { ...participant, ...update } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================
// CREDITS ROUTES
// =====================================

// Get wallet
app.get('/api/credits/wallet', authMiddleware, async (req, res) => {
  try {
    if (!req.user.tenant_id) {
      return res.status(400).json({ success: false, error: 'No tenant' });
    }
    let wallets = await querySupabase('credit_wallets', { filter: `tenant_id=eq.${req.user.tenant_id}` });
    if (!wallets?.length) {
      wallets = await insertSupabase('credit_wallets', { tenant_id: req.user.tenant_id, balance: 100, bonus_balance: 50 });
    }
    res.json({ success: true, data: wallets?.[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get credit transactions
app.get('/api/credits/transactions', authMiddleware, async (req, res) => {
  try {
    if (!req.user.tenant_id) {
      return res.json({ success: true, data: [] });
    }
    const transactions = await querySupabase('credit_transactions', {
      filter: `tenant_id=eq.${req.user.tenant_id}`,
      order: 'created_at.desc',
      limit: 50
    });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================
// TENANT ROUTES
// =====================================

// Get tenant settings
app.get('/api/tenants/me', authMiddleware, async (req, res) => {
  try {
    if (!req.user.tenant_id) {
      return res.status(400).json({ success: false, error: 'No tenant' });
    }
    const tenants = await querySupabase('tenants', { filter: `id=eq.${req.user.tenant_id}` });
    res.json({ success: true, data: tenants?.[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get team/crew
app.get('/api/tenants/crew', authMiddleware, async (req, res) => {
  try {
    if (!req.user.tenant_id) {
      return res.json({ success: true, data: [] });
    }
    const memberships = await querySupabase('memberships', { filter: `tenant_id=eq.${req.user.tenant_id}` });
    res.json({ success: true, data: memberships });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================
// ADMIN ROUTES
// =====================================

// Get admin dashboard stats
app.get('/api/admin/dashboard', authMiddleware, async (req, res) => {
  try {
    const tenants = await querySupabase('tenants');
    const users = await querySupabase('users');
    const events = await querySupabase('events');
    
    res.json({
      success: true,
      data: {
        total_tenants: tenants?.length || 0,
        active_tenants: tenants?.filter(t => t.status === 'active').length || 0,
        total_users: users?.length || 0,
        total_events: events?.length || 0,
        active_events: events?.filter(e => e.status === 'active').length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get admin analytics
app.get('/api/admin/analytics', authMiddleware, async (req, res) => {
  try {
    const tenants = await querySupabase('tenants');
    const users = await querySupabase('users');
    const events = await querySupabase('events');
    const participants = await querySupabase('participants');
    const checkins = await querySupabase('checkins');
    
    res.json({
      success: true,
      data: {
        tenants: tenants?.length || 0,
        users: users?.length || 0,
        events: events?.length || 0,
        active_events: events?.filter(e => e.status === 'active').length || 0,
        participants: participants?.length || 0,
        checked_in: participants?.filter(p => p.is_checked_in).length || 0,
        total_checkins: checkins?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get admin tenants
app.get('/api/admin/tenants', authMiddleware, async (req, res) => {
  try {
    const tenants = await querySupabase('tenants', { order: 'created_at.desc' });
    res.json({ success: true, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get credit settings
app.get('/api/admin/credit-settings', authMiddleware, async (req, res) => {
  try {
    const settings = await querySupabase('credit_settings');
    res.json({ success: true, data: settings?.[0] || { default_free_credits: 100, default_bonus_credits: 50 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================
// F&B ROUTES
// =====================================

// Get menu items
app.get('/api/events/:event_id/menu', authMiddleware, async (req, res) => {
  try {
    const items = await querySupabase('menu_items', { filter: `event_id=eq.${req.params.event_id}&is_active=eq.true` });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get booths
app.get('/api/events/:event_id/booths', authMiddleware, async (req, res) => {
  try {
    const booths = await querySupabase('booths', { filter: `event_id=eq.${req.params.event_id}&is_active=eq.true` });
    res.json({ success: true, data: booths });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================
// START SERVER
// =====================================
app.listen(PORT, () => {
  console.log(`✅ API running at http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Google OAuth: http://localhost:${PORT}/api/auth/google`);
});
